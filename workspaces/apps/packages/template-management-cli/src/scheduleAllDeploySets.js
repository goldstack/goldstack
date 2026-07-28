'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.scheduleAllDeploySets = void 0;
const template_metadata_1 = require('@goldstack/template-metadata');
const image_1 = require('./image');
const scheduleAllDeploySets = async (argv) => {
  const sets = await (0, template_metadata_1.getAllBuildSets)();
  for (const set of sets) {
    const setName = set.buildSetName;
    const result = await (0, image_1.start)({
      deploymentName: argv.deployment,
      env: [
        {
          name: 'DEBUG',
          value: 'true',
        },
      ],
      command: [
        'deploy-set',
        '--set',
        setName,
        '--deployment',
        argv.deployment,
        '--repo',
        argv.repo,
        '--workDir',
        '/tmp/',
        '--emailResultsTo',
        argv.emailResultsTo || 'false',
        '--skipTests',
        argv.skipTests || 'false',
      ],
    });
    console.log('Deploy Set:', setName);
    console.log('Task ARN:', result.taskArn);
    console.log('Task ID:', result.taskId);
    console.log('ECS Console:', result.ecsConsoleLink);
    console.log('CloudWatch Logs:', result.awsLogsConsoleLink);
    console.log('--------------------------');
  }
};
exports.scheduleAllDeploySets = scheduleAllDeploySets;
//# sourceMappingURL=scheduleAllDeploySets.js.map
