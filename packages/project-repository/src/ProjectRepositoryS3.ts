import S3 from 'aws-sdk/clients/s3';

import { v4 as uuid4 } from 'uuid';

import { AWSError } from 'aws-sdk/lib/core';
import ProjectRepository, { ProjectId } from './ProjectRepositoryInterface';
import { ProjectConfiguration } from '@goldstack/utils-project';

import { PackageConfig } from '@goldstack/project-config';
import { zip, rmSafe, unzip, mkdir, tempDir } from '@goldstack/utils-sh';
import { download } from '@goldstack/utils-s3';
import fs from 'fs';

import assert from 'assert';

import ProjectData from './types/ProjectData';

class ProjectRepositoryS3 implements ProjectRepository {
  private s3: S3;
  private bucketName: string;

  constructor(params: { s3: S3; bucketName: string }) {
    this.s3 = params.s3;
    this.bucketName = params.bucketName;
  }

  async readProjectConfiguration(
    id: string
  ): Promise<ProjectConfiguration | undefined> {
    try {
      const obj = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: `${id}/project.json`,
        })
        .promise();
      assert(
        obj.Body,
        `Cannot read key from project S3 bucket: ${id}/project.json`
      );
      return JSON.parse(obj.Body.toString());
    } catch (e) {
      const awsError = e as AWSError;
      if (awsError.code === 'NoSuchKey') {
        return undefined;
      }
      throw e;
    }
  }

  async addProject(configuration: ProjectConfiguration): Promise<string> {
    const id = uuid4();
    if (!configuration.owner) {
      throw new Error('Owner for project must be specified for it to be saved');
    }
    await this.updateProjectConfiguration(id, configuration);
    return id;
  }

  async updateProjectData(
    id: ProjectId,
    projectData: ProjectData
  ): Promise<void> {
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `${id}/projectData.json`,
        Body: JSON.stringify(projectData, null, 2),
      })
      .promise();
  }

  async getProjectData(id: ProjectId): Promise<ProjectData> {
    const obj = await this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: `${id}/projectData.json`,
      })
      .promise();
    assert(
      obj.Body,
      `Cannot read key from project S3 bucket: ${id}/projectData.json`
    );
    return JSON.parse(obj.Body.toString());
  }

  async updateProjectConfiguration(
    id: ProjectId,
    configuration: ProjectConfiguration
  ): Promise<void> {
    configuration.createdAt = new Date().toISOString();
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `${id}/project.json`,
        Body: JSON.stringify(configuration, null, 2),
      })
      .promise();
  }

  async downloadProject(id: ProjectId, path: string): Promise<void> {
    const targetDir = tempDir() + 'work/project-download/' + uuid4() + '/';
    mkdir('-p', targetDir);
    const targetArchive = `${targetDir}${id}.zip`;
    if (
      !(await download({
        s3: this.s3,
        bucketName: this.bucketName,
        key: `${id}/project.zip`,
        filePath: targetArchive,
      }))
    ) {
      throw new Error(`Project archive does not exist for project ${id}`);
    }

    await unzip({
      file: targetArchive,
      targetDirectory: path,
    });
    await rmSafe(targetDir);
  }

  async uploadProject(id: ProjectId, path: string): Promise<void> {
    const targetDir = tempDir() + 'work/project-upload/' + uuid4() + '/';
    mkdir('-p', targetDir);
    const targetArchive = `${targetDir}${id}.zip`;
    await rmSafe(targetArchive);

    await zip({ directory: path, target: targetArchive });

    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `${id}/project.zip`,
        Body: fs.createReadStream(targetArchive),
      })
      .promise();
    await rmSafe(targetDir);
  }
}

export default ProjectRepositoryS3;
