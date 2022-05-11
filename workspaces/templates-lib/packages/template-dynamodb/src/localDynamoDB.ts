import { DynamoDB } from 'aws-sdk';
import {
  GenericContainer,
  StartedTestContainer,
  StoppedTestContainer,
} from 'testcontainers';

const MAPPED_PORT = 8000;
const IMAGE_NAME = 'amazon/dynamodb-local:1.18.0';

export const endpointUrl = (startedContainer: StartedTestContainer): string => {
  return `http://${startedContainer.getIpAddress(
    startedContainer.getNetworkNames()[0]
  )}:${startedContainer.getMappedPort(MAPPED_PORT)}`;
};

export const createClient = (
  startedContainer: StartedTestContainer
): DynamoDB => {
  return new DynamoDB({
    endpoint: endpointUrl(startedContainer),
    region: 'eu-central-1',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
    },
  });
};

export const startContainer = (): Promise<StartedTestContainer> => {
  const startedContainer = new GenericContainer(IMAGE_NAME)
    .withExposedPorts(8000)
    .start();
  return startedContainer;
};
