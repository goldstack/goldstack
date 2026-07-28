import Ajv from 'ajv';
export const validateProject = (projectData) => {
  const ajv = new Ajv();
  const projectRegex = /^[A-Za-z0-9-_]*$/g;
  const result = [];
  result.push({
    stepName: 'Project',
    valid:
      !!projectData.project.projectName &&
      projectData.project.projectName.length > 0 &&
      projectRegex.exec(projectData.project.projectName) !== null,
  });
  return [
    ...result,
    ...projectData.packageConfigs.map((packageConfig) => {
      const schema = packageConfig.deploymentConfigSchema;
      const validate = ajv.compile(schema);
      const valid = validate(packageConfig.package.deployments[0].configuration);
      // if (!valid) console.log(validate.errors);
      return {
        stepName: `${packageConfig.package.name} Module`,
        valid,
      };
    }),
  ];
};
//# sourceMappingURL=validateProject.js.map
