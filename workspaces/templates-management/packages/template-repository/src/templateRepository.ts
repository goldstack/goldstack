import { readPackageConfig } from '@goldstack/utils-package';
import {
  GoldstackTemplateConfiguration,
  readTemplateConfigFromString,
  readTemplateConfigFromFile,
} from '@goldstack/utils-template';
import {
  S3Client,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { rm, write, mkdir, zip, rmSafe } from '@goldstack/utils-sh';
import semverInc from 'semver/functions/inc';
import semverGt from 'semver/functions/gt';
import { copy } from 'fs-extra';
import { download } from '@goldstack/utils-s3';
import fs from 'fs';

import { debug, info } from '@goldstack/utils-log';

import { promisify } from 'util';
import path from 'path';

const sleep = promisify(setTimeout);

export interface TemplateRepository {
  getLatestTemplateVersion(
    templateName: string
  ): Promise<GoldstackTemplateConfiguration | undefined>;
  downloadTemplateArchive(
    templateName: string,
    version: string,
    destinationFolder: string
  ): Promise<string | undefined>;
  addTemplateVersion(path: string): Promise<GoldstackTemplateConfiguration>;
}

export class S3TemplateRepository implements TemplateRepository {
  private s3: S3Client;
  private bucket: string;
  private bucketUrl: string;

  constructor(params: { s3: S3Client; bucket: string; bucketUrl: string }) {
    this.s3 = params.s3;
    this.bucket = params.bucket;
    this.bucketUrl = params.bucketUrl;
  }

  async getLatestTemplateVersion(
    templateName: string
  ): Promise<GoldstackTemplateConfiguration | undefined> {
    try {
      const cmd = new GetObjectCommand({
        Bucket: this.bucket,
        Key: `templates/${templateName}/latest.json`,
      });

      const obj = await this.s3.send(cmd);
      if (!obj.Body) {
        throw new Error('Invalid object body for: ' + templateName);
      }
      return readTemplateConfigFromString(await obj.Body.transformToString());
    } catch (e) {
      if (e instanceof NoSuchKey) {
        return undefined;
        return;
      }
      throw e;
    }
  }

  async downloadTemplateArchive(
    templateName: string,
    version: string,
    destinationFolder: string
  ): Promise<string | undefined> {
    const filePath = path.join(
      destinationFolder,
      `${templateName}-${version}.zip`
    );
    const templatePath = `versions/${templateName}/${version}/${templateName}-${version}.zip`;
    debug(`Downloading template from '${this.bucket}' to '${filePath}'`);
    if (
      await download({
        s3: this.s3,
        bucketName: this.bucket,
        filePath,
        key: templatePath,
      })
    ) {
      return filePath;
    } else {
      return undefined;
    }
  }

  async addTemplateVersion(
    pathToTemplate: string
  ): Promise<GoldstackTemplateConfiguration> {
    info('Adding template version from ' + pathToTemplate, {
      bucket: this.bucket,
    });
    const config = readTemplateConfigFromFile(
      path.join(pathToTemplate, 'template.json')
    );
    const latestDeployedToRepo = await this.getLatestTemplateVersion(
      config.templateName
    );

    if (latestDeployedToRepo === undefined) {
      info(
        'First deployment of template. Assuming previous version to be 0.0.0',
        {
          bucket: this.bucket,
        }
      );
      config.previousTemplateVersion = '0.0.0';
    } else {
      info(
        'Last version that was deployed: ' +
          latestDeployedToRepo.templateVersion,
        { bucket: this.bucket }
      );
      if (latestDeployedToRepo.templateName !== config.templateName) {
        throw new Error(
          'Invalid template or latest version. Not matching template names' +
            ` for ${config.templateName} found latest ${latestDeployedToRepo.templateName}`
        );
      }

      config.previousTemplateVersion = latestDeployedToRepo.templateVersion;
      if (
        config.templateVersion === latestDeployedToRepo.templateVersion ||
        semverGt(latestDeployedToRepo.templateVersion, config.templateVersion)
      ) {
        info('Deploying new version: ' + config.templateName, {
          bucket: this.bucket,
        });
        const newVersion = semverInc(
          latestDeployedToRepo.templateVersion,
          'patch'
        );
        if (!newVersion) {
          throw new Error(
            `Cannot generate new version from ${latestDeployedToRepo.templateVersion}`
          );
        }
        config.templateVersion = newVersion;
      } else {
        throw new Error(
          'Invalid version tor release. ' +
            `Trying to release ${config.templateVersion}. Latest version ${latestDeployedToRepo.templateVersion}`
        );
      }
    }

    const templatePath = `${config.templateName}/${config.templateVersion}/`;
    const templateArchivePath = `versions/${templatePath}${config.templateName}-${config.templateVersion}.zip`;
    const templateConfigPath = `versions/${templatePath}template.json`;
    config.templateArchive = `arn:aws:s3:::${this.bucket}/${templateArchivePath}`;

    const workDir = `./goldstackLocal/work/repo/${config.templateName}/${config.templateVersion}`;
    rm('-rf', workDir);
    await sleep(200);

    mkdir('-p', workDir);
    await copy(pathToTemplate, workDir);
    const targetConfigPath = path.join(workDir, 'template.json');
    const configJson = JSON.stringify(config, null, 2);
    write(configJson, targetConfigPath);

    // Upload config
    info(
      'Uploading template config to: ' + this.bucket + '/' + templateConfigPath,
      { bucket: this.bucket }
    );
    try {
      const cmd = new PutObjectCommand({
        Bucket: this.bucket,
        Key: templateConfigPath,
        Body: configJson,
      });
      await this.s3.send(cmd);
    } catch (e) {
      throw e;
    }

    // template.json does not need to be included in archive
    rm('-rf', targetConfigPath);

    const targetPackageConfigPath = workDir + '/goldstack.json';
    const packageConfig = readPackageConfig(workDir + '/');
    packageConfig.template = config.templateName;
    packageConfig.templateVersion = config.templateVersion;
    write(JSON.stringify(packageConfig, null, 2), targetPackageConfigPath);

    const targetArchive = `./goldstackLocal/work/repo/${config.templateName}-${config.templateVersion}.zip`;
    await rmSafe(targetArchive);

    await zip({ directory: workDir, target: targetArchive });

    // Upload archive
    try {
      info(
        'Uploading template archive to: ' +
          this.bucket +
          '/' +
          templateArchivePath,
        { bucket: this.bucket }
      );
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: templateArchivePath,
          Body: fs.createReadStream(targetArchive),
        })
      );
    } catch (e) {
      throw e;
    }

    // set latest version, only after archive upload successful
    try {
      info('Setting latest version to ' + config.templateVersion, {
        bucket: this.bucket,
        templatePath: templateConfigPath,
      });
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `templates/${config.templateName}/latest.json`,
          Body: configJson,
        })
      );
    } catch (e) {
      throw e;
    }

    return config;
  }
}
