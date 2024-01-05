import {
  S3Client,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { v4 as uuid4 } from 'uuid';

import ProjectRepository, { ProjectId } from './ProjectRepositoryInterface';
import { ProjectConfiguration } from '@goldstack/utils-project';

import { zip, rmSafe, unzip, mkdir, tempDir } from '@goldstack/utils-sh';
import { download } from '@goldstack/utils-s3';
import fs from 'fs';

import assert from 'assert';

import ProjectData from './types/ProjectData';

class ProjectRepositoryS3 implements ProjectRepository {
  private s3: S3Client;
  private bucketName: string;

  constructor(params: { s3: S3Client; bucketName: string }) {
    this.s3 = params.s3;
    this.bucketName = params.bucketName;
  }

  async readProjectConfiguration(
    id: string
  ): Promise<ProjectConfiguration | undefined> {
    try {
      const cmd = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: `${id}/project.json`,
      });
      const obj = await this.s3.send(cmd);
      assert(
        obj.Body,
        `Cannot read key from project S3 bucket: ${id}/project.json`
      );
      return JSON.parse(obj.Body.toString());
    } catch (e) {
      if (e instanceof NoSuchKey) {
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
    const cmd = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${id}/projectData.json`,
      Body: JSON.stringify(projectData, null, 2),
    });
    await this.s3.send(cmd);
  }

  async getProjectData(id: ProjectId): Promise<ProjectData> {
    const cmd = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `${id}/projectData.json`,
    });
    const obj = await this.s3.send(cmd);
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
    const cmd = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${id}/project.json`,
      Body: JSON.stringify(configuration, null, 2),
    });
    await this.s3.send(cmd);
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
