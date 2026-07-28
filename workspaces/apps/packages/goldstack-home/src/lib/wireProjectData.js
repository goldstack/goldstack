export const wireProjectData = (data) => {
  // ensure at least one deployment configured per project
  data.packageConfigs.forEach((packageConfig) => {
    const deployments = packageConfig.package.deployments;
    if (deployments.length === 0) {
      deployments.push({
        name: data.deploymentNames[0],
        configuration: {},
        awsUser: data.awsUsers[0].name,
        awsRegion: data.awsUsers[0].config.awsDefaultRegion,
      });
    } else {
      deployments.forEach((deployment) => {
        deployment.name = data.deploymentNames[0];
        deployment.awsUser = data.awsUsers[0].name;
        deployment.awsRegion = data.awsUsers[0].config.awsDefaultRegion;
      });
    }
  });
  return data;
};
//# sourceMappingURL=wireProjectData.js.map
