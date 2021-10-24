import { readPackageConfig } from '@goldstack/utils-package';
import {
  GoldstackTemplateConfiguration,
  readTemplateConfigFromString,
  readTemplateConfigFromFile,
} from '@goldstack/utils-template';
import S3 from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/core';
import { rm, write, mkdir, zip, rmSafe } from '@goldstack/utils-sh';
import semverInc from 'semver/functions/inc';
import semverGt from 'semver/functions/gt';
import { copy } from 'fs-extra';
import { download } from '@goldstack/utils-s3';
import fs from 'fs';

import { promisify } from 'util';
import assert from 'assert';

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
  private s3: S3;
  private bucket: string;
  private bucketUrl: string;

  constructor(params: { s3: S3; bucket: string; bucketUrl: string }) {
    this.s3 = params.s3;
    this.bucket = params.bucket;
    this.bucketUrl = params.bucketUrl;
  }

  async getLatestTemplateVersion(
    templateName: string
  ): Promise<GoldstackTemplateConfiguration | undefined> {
    try {
      const obj = await this.s3
        .getObject({
          Bucket: this.bucket,
          Key: `templates/${templateName}/latest.json`,
        })
        .promise();
      if (!obj.Body) {
        throw new Error('Invalid object body for: ' + templateName);
      }
      return readTemplateConfigFromString(obj.Body.toString());
    } catch (e) {
      const awsError = e as AWSError;
      if (awsError.code === 'NoSuchKey') {
        // console.warn(
        //   'Attempting to access non-existing template:',
        //   templateName
        // );
        return undefined;
      }
      throw e;
    }
  }

  async downloadTemplateArchive(
    templateName: string,
    version: string,
    destinationFolder: string
  ): Promise<string | undefined> {
    assert(
      destinationFolder.endsWith('/'),
      'Destination folder must end with a slash (/)'
    );
    const filePath = destinationFolder + `${templateName}-${version}.zip`;
    const templatePath = `versions/${templateName}/${version}/${templateName}-${version}.zip`;
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
    path: string
  ): Promise<GoldstackTemplateConfiguration> {
    const config = readTemplateConfigFromFile(path + 'template.json');
    const latest = await this.getLatestTemplateVersion(config.templateName);

    if (latest === undefined) {
      config.previousTemplateVersion = '0.0.0';
    } else {
      if (latest.templateName !== config.templateName) {
        throw new Error(
          'Invalid template or latest version. Not matching template names' +
            ` for ${config.templateName} found latest ${latest.templateName}`
        );
      }

      config.previousTemplateVersion = latest.templateVersion;
      if (
        config.templateVersion === latest.templateVersion ||
        semverGt(latest.templateVersion, config.templateVersion)
      ) {
        const newVersion = semverInc(latest.templateVersion, 'patch');
        if (!newVersion) {
          throw new Error(
            `Cannot generate new version from ${latest.templateVersion}`
          );
        }
        config.templateVersion = newVersion;
      } else {
        throw new Error(
          'Invalid version tor elease. ' +
            `Trying to release ${config.templateVersion}. Latest version ${latest.templateVersion}`
        );
      }
    }

    const templatePath = `${config.templateName}/${config.templateVersion}/`;
    const templateArchivePath = `versions/${templatePath}${config.templateName}-${config.templateVersion}.zip`;
    const templateConfigPath = `versions/${templatePath}template.json`;
    config.templateArchive = `arn:aws:s3:::${this.bucket}/${templateArchivePath}`;

    const workDir = `./goldstackLocal/work/repo/${config.templateName}/${config.templateVersion}`;
    rm('-rf', workDir);
    sleep(200);

    mkdir('-p', workDir);
    await copy(path, workDir);
    const targetConfigPath = workDir + '/template.json';
    const configJson = JSON.stringify(config, null, 2);
    write(configJson, targetConfigPath);

    // Upload config
    try {
      await this.s3
        .putObject({
          Bucket: this.bucket,
          Key: templateConfigPath,
          Body: configJson,
        })
        .promise();
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
      await this.s3
        .putObject({
          Bucket: this.bucket,
          Key: templateArchivePath,
          Body: fs.createReadStream(targetArchive),
        })
        .promise();
    } catch (e) {
      throw e;
    }

    // set latest version, only after archive upload successful
    try {
      await this.s3
        .putObject({
          Bucket: this.bucket,
          Key: `templates/${config.templateName}/latest.json`,
          Body: configJson,
        })
        .promise();
    } catch (e) {
      throw e;
    }

    return config;
  }
}
