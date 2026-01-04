import {
  type DeploymentState,
  readDeploymentState,
  readTerraformStateVariable,
} from '@goldstack/infra';
import { getAWSCredentials, getAWSUser } from '@goldstack/infra-aws';
import assert from 'assert';
import CloudWatchLogs from 'aws-sdk/clients/cloudwatchlogs';
import ECS from 'aws-sdk/clients/ecs';
import type {
  AWSDockerImageDeployment,
  AWSDockerImagePackage,
} from './types/AWSDockerImagePackage';

const createECS = async (deployment: AWSDockerImageDeployment): Promise<ECS> => {
  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);
  return new ECS({
    apiVersion: '2014-11-13',
    credentials,
  });
};

const createCloudWatchLogs = async (
  deployment: AWSDockerImageDeployment,
): Promise<CloudWatchLogs> => {
  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);
  return new CloudWatchLogs({
    credentials,
  });
};

interface GetLogsParams {
  taskId: string;
  deployment: AWSDockerImageDeployment;
  deploymentState: DeploymentState;
  config: AWSDockerImagePackage;
  limit?: number;
  nextToken?: string;
  startTime?: number;
  endTime?: number;
}

export const getLogs = async (params: GetLogsParams): Promise<CloudWatchLogs.OutputLogEvents> => {
  const ecs = await createECS(params.deployment);
  const deploymentState = params.deploymentState;
  const taskId = params.taskId;

  const tasks = await ecs
    .describeTasks({
      tasks: [taskId],
      cluster: readTerraformStateVariable(deploymentState, 'cluster_name'),
    })
    .promise();
  assert(tasks.tasks);
  const task = tasks.tasks[0];

  assert(task.taskDefinitionArn);

  const taskDefinitionResponse = await ecs
    .describeTaskDefinition({
      taskDefinition: task.taskDefinitionArn.split('/')[1],
    })
    .promise();
  const taskDefinition = taskDefinitionResponse.taskDefinition;
  assert(taskDefinition);
  const containerDefinitions = taskDefinition.containerDefinitions;
  assert(containerDefinitions);

  const logConfiguration = containerDefinitions[0].logConfiguration;
  assert(logConfiguration);

  assert(logConfiguration.options);
  const awsLogsGroup = logConfiguration.options['awslogs-group'];
  const awsLogsPrefix = logConfiguration.options['awslogs-stream-prefix'];
  const cwlogs = await createCloudWatchLogs(params.deployment);
  const logEvents = await cwlogs
    .getLogEvents({
      logGroupName: awsLogsGroup,
      logStreamName: `${awsLogsPrefix}/main/${taskId}`,
      limit: params.limit,
      nextToken: params.nextToken,
      startTime: params.startTime,
      endTime: params.endTime,
    })
    .promise();

  return logEvents.events || [];
};

interface EnvVarDefinition {
  name: string;
  value: string;
}

interface RunParams {
  cmd: string[];
  env?: EnvVarDefinition[];
  imageHash?: string;
  deployment: AWSDockerImageDeployment;
  config: AWSDockerImagePackage;
  deploymentState: DeploymentState;
}

export const getTaskStatus = async (
  deployment: AWSDockerImageDeployment,
  taskExecutionArn: string,
): Promise<ECS.Task> => {
  const ecs = await createECS(deployment);
  const tasksState = await ecs.describeTasks({ tasks: [taskExecutionArn] }).promise();
  if (tasksState.failures && tasksState.failures.length > 0) {
    throw new Error(`Cannot determine state of launched tast. ${tasksState.failures[0].reason}`);
  }

  assert(tasksState.tasks);
  return tasksState.tasks[0];
};

export interface StartTaskResult {
  taskArn: string;
  taskId: string;
  awsLogsGroup: string;
  awsLogsConsoleLink: string;
  ecsConsoleLink: string;
}

export const startTask = async (params: RunParams): Promise<StartTaskResult> => {
  const deployment = params.deployment;
  const ecs = await createECS(params.deployment);
  const config = params.config;
  const deploymentState = params.deploymentState;
  if (!deploymentState) {
    throw new Error(
      `Deployment state for '${params.deployment.name}' is not defined. Make sure to have deployed the image to this environment.`,
    );
  }
  const repo = readTerraformStateVariable(deploymentState, 'repo_url');

  let imageName: string;
  let imageHash = params.imageHash;
  if (!params.imageHash) {
    if (!deploymentState['latest']) {
      throw new Error(
        `Cannot run image since image has not been deployed for deployment '${params.deployment.name}'.`,
      );
    }

    imageName = deploymentState['latest'];
    imageHash = deploymentState['latest'].split(':')[1];
  } else {
    imageName = `${repo}:${imageHash}`;
  }

  const awsLogsGroup = '/ecs/' + repo + '/' + imageHash;

  const taskDefinition = (
    await ecs
      .registerTaskDefinition({
        containerDefinitions: [
          {
            name: 'main',
            command: params.cmd,
            environment: params.env,
            image: imageName,
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-create-group': 'true',
                'awslogs-region': deployment.awsRegion,
                'awslogs-group': awsLogsGroup,
                'awslogs-stream-prefix': 'ecs',
              },
            },
          },
        ],
        taskRoleArn: readTerraformStateVariable(deploymentState, 'ecs_task_role_arn'),
        networkMode: 'awsvpc',
        cpu: '1 vcpu',
        memory: '4 GB',
        executionRoleArn: readTerraformStateVariable(
          deploymentState,
          'ecs_task_execution_role_arn',
        ),
        requiresCompatibilities: ['FARGATE'],
        family: `temp-${config.configuration.imageTag}-${Date.now()}-${imageHash}`,
      })
      .promise()
  ).taskDefinition;
  assert(taskDefinition);

  const clusterName = readTerraformStateVariable(deploymentState, 'cluster_name');
  const runTaskResponse = await ecs
    .runTask({
      cluster: clusterName,
      count: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [readTerraformStateVariable(deploymentState, 'subnet')],
          assignPublicIp: 'ENABLED',
          securityGroups: [readTerraformStateVariable(deploymentState, 'container_security_group')],
        },
      },
      taskDefinition: `${taskDefinition.family}:${taskDefinition.revision}`,
      // command does not need to overriden here since it is defined in the task definition
      overrides: {},
    })
    .promise();

  const tasks = runTaskResponse.tasks;
  if (!tasks) {
    throw new Error(`Task definitions not supplied after running define tasks for ${imageName}`);
  }

  const taskExecution = tasks[0];
  assert(taskExecution.taskArn);

  const taskId = taskExecution.taskArn.split('/')[1];

  const cloudWatchLink = `https://${
    deployment.awsRegion
  }.console.aws.amazon.com/cloudwatch/home?region=${
    deployment.awsRegion
  }#logsV2:log-groups/log-group/${awsLogsGroup.replace(
    /\//g,
    '$252F',
  )}/log-events/${`ecs/main/${taskExecution.taskArn.split('/')[2]}`
    .replace('$', '$2524')
    .replace('[', '$255B')
    .replace(']', '$255D')
    .replace(/\//g, '$252F')}`;
  const ecsConsoleLink = `https://${deployment.awsRegion}.console.aws.amazon.com/ecs/home?region=${
    deployment.awsRegion
  }#/clusters/${clusterName}/tasks/${taskExecution.taskArn.split('/')[2]}/details`;
  return {
    taskArn: taskExecution.taskArn,
    taskId,
    awsLogsGroup,
    ecsConsoleLink,
    awsLogsConsoleLink: cloudWatchLink,
  };
};

export const runTask = async (params: RunParams): Promise<StartTaskResult> => {
  const deployment = params.deployment;
  const ecs = await createECS(deployment);

  const result = await startTask(params);
  const taskId = result.taskArn.split('/')[1];
  console.log(`Started task ${result.taskArn}`);

  const deploymentState = params.deploymentState;
  let tasks = await ecs
    .describeTasks({
      tasks: [taskId],
      cluster: readTerraformStateVariable(deploymentState, 'cluster_name'),
    })
    .promise();
  assert(tasks.tasks);
  let task = tasks.tasks[0];

  console.log(`Task status: ${task.lastStatus}`);

  // biome-ignore lint/suspicious/noExplicitAny: AWS SDK waitFor expects specific string literal types
  const waitForStateRunning: any = 'tasksRunning';

  // biome-ignore lint/suspicious/noExplicitAny: AWS SDK waitFor expects specific parameter shape
  const waitForParams: any = {
    tasks: [taskId],
    cluster: readTerraformStateVariable(deploymentState, 'cluster_name'),
  };

  await ecs.waitFor(waitForStateRunning, waitForParams).promise();

  console.log('Task started up successfully ...');

  // biome-ignore lint/suspicious/noExplicitAny: AWS SDK waitFor expects specific string literal types
  const waitForStateStopped: any = 'tasksStopped';

  await ecs.waitFor(waitForStateStopped, waitForParams).promise();

  console.log('Task stopped on ECS.');

  tasks = await ecs
    .describeTasks({
      tasks: [taskId],
      cluster: readTerraformStateVariable(deploymentState, 'cluster_name'),
    })
    .promise();
  assert(tasks.tasks);
  task = tasks.tasks[0];

  const taskDefinition = {
    family: task.taskDefinitionArn?.split('/')[1].split(':')[0],
    revision: task.taskDefinitionArn?.split('/')[1].split(':')[1],
  };

  const logEvents = await getLogs({
    deployment,
    taskId,
    deploymentState,
    config: params.config,
  });

  console.log('Logs from container:');
  for (const event of logEvents) {
    console.log(`> ${event.timestamp} ${event.message}`);
  }

  await ecs
    .deregisterTaskDefinition({
      taskDefinition: `${taskDefinition.family}:${taskDefinition.revision}`,
    })
    .promise();

  assert(task.containers);
  const taskContainer = task.containers[0];
  const exitCode = taskContainer.exitCode;
  console.log(`Container exited with code ${exitCode}`);
  if (exitCode !== 0) {
    throw new Error(`Error running container: ${taskContainer.reason}`);
  }
  return result;
};

export const apiDockerImageAwsCli = async (
  config: AWSDockerImagePackage,
  deployment: AWSDockerImageDeployment,
  args: string[],
): Promise<void> => {
  if (args.length < 1) {
    throw new Error(
      'Please specify an operation along with the image command. Supported operations ["run"]',
    );
  }
  const [, deploymentName] = args;
  const deploymentState = readDeploymentState('./', deploymentName);

  const operation = args[0];
  if (operation === 'run') {
    const [, , ...remainingArgs] = args;
    const taskArn = await runTask({
      cmd: remainingArgs,
      deployment,
      deploymentState,
      config,
    });
    console.log(taskArn);
    return;
  }

  if (operation === 'start') {
    const [, , ...remainingArgs] = args;
    const taskArn = await startTask({
      cmd: remainingArgs,
      deployment,
      deploymentState,
      config,
    });
    console.log(taskArn);
    return;
  }

  if (operation === 'logs') {
    const [, , taskArn] = args;
    const logEvents = await getLogs({
      deployment,
      taskId: taskArn.split('/')[1],
      deploymentState,
      config,
    });
    for (const event of logEvents) {
      console.log(`${event.timestamp} ${event.message}`);
    }
    return;
  }

  throw new Error(`Unknown operation for image command: ${operation}`);
};
