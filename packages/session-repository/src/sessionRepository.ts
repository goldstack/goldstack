import { connect, getBucketName } from '@goldstack/session-repository-bucket';

import S3 from 'aws-sdk/clients/s3';

import assert from 'assert';
import { AWSError } from 'aws-sdk/lib/core';

export interface SessionData {
  sessionId: string;
  validUntil: string;
  createdAt?: string;
  email?: string;
  stripeId?: string;
  coupon?: string;
}

export class SessionRepository {
  private s3: S3;
  private bucketName: string;

  constructor(params: { s3: S3; bucketName: string }) {
    this.s3 = params.s3;
    this.bucketName = params.bucketName;
  }

  async createSession(sessionId: string, validUntil: string): Promise<void> {
    const sessionData: SessionData = {
      sessionId,
      validUntil,
      createdAt: new Date().toISOString(),
    };

    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `sessions/${sessionId}/session.json`,
        Body: JSON.stringify(sessionData),
      })
      .promise();
  }

  async readSession(sessionId: string): Promise<SessionData | undefined> {
    if (sessionId.startsWith('session:')) {
      sessionId = sessionId.substring('session:'.length);
    }
    try {
      const obj = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: `sessions/${sessionId}/session.json`,
        })
        .promise();
      assert(
        obj.Body,
        `Cannot read key from sessions S3 bucket: ${sessionId}/session.json`
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

  async storeStripeId(params: {
    sessionId: string;
    stripeId: string;
  }): Promise<void> {
    const sessionData = await this.readSession(params.sessionId);
    if (!sessionData) {
      throw new Error(
        `Cannot store stripeId for session that does not exist: ${params.sessionId}`
      );
    }
    sessionData.stripeId = params.stripeId;
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `sessions/${sessionData.sessionId}/session.json`,
        Body: JSON.stringify(sessionData),
      })
      .promise();
  }

  async storePayment(params: {
    sessionId: string;
    email: string;
    coupon?: string;
  }): Promise<void> {
    const sessionData = await this.readSession(params.sessionId);
    if (!sessionData) {
      throw new Error(
        `Cannot store payment information for session that does not exist: ${params.sessionId} `
      );
    }

    sessionData.email = params.email;
    sessionData.coupon = params.coupon;
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `sessions/${sessionData.sessionId}/session.json`,
        Body: JSON.stringify(sessionData),
      })
      .promise();
  }

  async storePurchase(params: {
    sessionId: string;
    projectId: string;
    packageId: string;
  }): Promise<void> {
    const sessionData = await this.readSession(params.sessionId);
    if (!sessionData) {
      throw new Error(
        `Cannot store purchase  information for session that does not exist: ${params.sessionId}`
      );
    }
    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `sessions/${sessionData.sessionId}/${params.projectId}/purchase.json`,
        Body: JSON.stringify({
          sessionId: params.sessionId,
          projectId: params.projectId,
          packageId: params.packageId,
          purchaseDate: new Date().toISOString(),
        }),
      })
      .promise();
  }
}

export const connectSessionRepository = async (
  deploymentName?: string
): Promise<SessionRepository> => {
  const s3 = await connect(deploymentName);
  const bucketName = await getBucketName(deploymentName);
  return new SessionRepository({ s3, bucketName });
};
