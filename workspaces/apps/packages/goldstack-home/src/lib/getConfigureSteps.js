import awsUserDocs from 'src/docs/aws-user.json';
import projectDocs from 'src/docs/project.json';
import awsUserFormSchema from 'src/lib/schemas/awsUserForm.json';
import projectFormSchema from 'src/lib/schemas/projectForm.json';
import projectFormUiSchema from 'src/lib/schemas/projectFormUi';
export const getConfigureSteps = (params) => {
  const head = [
    {
      idx: 0,
      id: 'project',
      docs: `${projectDocs}`,
      type: 'form',
      title: 'Project',
      sections: [
        {
          schema: projectFormSchema,
          uiSchema: projectFormUiSchema,
          // biome-ignore lint/suspicious/noExplicitAny: Return type varies based on schema
          getData: (projectData) => {
            const awsUser = projectData.awsUsers[0].config;
            return {
              ...projectData.project,
              deployment:
                projectData.deploymentNames.length > 0 ? projectData.deploymentNames[0] : undefined,
              awsRegion: awsUser.awsDefaultRegion,
            };
          },
          // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
          writeData: (projectData, newData) => {
            const newProjectData = JSON.parse(JSON.stringify(projectData));
            newProjectData.project.projectName = newData.projectName;
            newProjectData.deploymentNames = [newData.deployment];
            newProjectData.awsUsers[0].config.awsDefaultRegion = newData.awsRegion;
            return { ...newProjectData };
          },
        },
      ],
    },
  ];
  const packages = params.packageConfigs.map((config, idx) => {
    var _a;
    let configureDocHtml;
    if ((_a = params.docs) === null || _a === void 0 ? void 0 : _a.find) {
      const packageName = config.package.name;
      const packageDoc = params.docs.find((el) => el.package === packageName);
      if (packageDoc) {
        const configureDoc = packageDoc.docs.find((el) => el.doc === 'template-configure');
        configureDocHtml =
          configureDoc === null || configureDoc === void 0 ? void 0 : configureDoc.html;
      }
    }
    const deploymentConfigSection = {
      schema: config.deploymentConfigSchema,
      uiSchema: {},
      // biome-ignore lint/suspicious/noExplicitAny: Return type varies based on schema
      getData: (projectData) => {
        const data = projectData.packageConfigs[idx].package.deployments[0].configuration;
        return data;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
      writeData: (projectData, newData) => {
        const newProjectData = JSON.parse(JSON.stringify(projectData));
        newProjectData.packageConfigs[idx].package.deployments[0].configuration = {
          ...newData,
        };
        return newProjectData;
      },
    };
    const sections = [deploymentConfigSection];
    // only render config properties when this package has those
    const configProperties = Object.keys(config.package.configuration);
    if (configProperties.length > 0) {
      sections.push({
        schema: config.packageConfigSchema,
        uiSchema: {},
        // biome-ignore lint/suspicious/noExplicitAny: Return type varies based on schema
        getData: (projectData) => {
          const data = projectData.packageConfigs[idx].package.configuration;
          return data;
        },
        // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
        writeData: (projectData, newData) => {
          const newProjectData = JSON.parse(JSON.stringify(projectData));
          newProjectData.packageConfigs[idx].package.configuration = {
            ...newData,
          };
          return newProjectData;
        },
      });
    }
    return {
      idx: idx + 1,
      type: 'form',
      docs: configureDocHtml,
      id: config.package.name,
      title: `${config.package.name} Module`,
      sections,
    };
  });
  const tail = [
    {
      idx: 1 + params.packageConfigs.length,
      id: 'awsUser',
      docs: awsUserDocs,
      type: 'form',
      title: 'AWS',
      sections: [
        {
          schema: awsUserFormSchema,
          uiSchema: {
            awsSecretAccessKey: {
              'ui:widget': 'password',
            },
          },
          // biome-ignore lint/suspicious/noExplicitAny: Return type varies based on schema
          getData: (projectData) => {
            const awsUserConfig = projectData.awsUsers[0].config;
            return {
              awsAccessKeyId: awsUserConfig.awsAccessKeyId || '',
              awsSecretAccessKey: awsUserConfig.awsSecretAccessKey || '',
            };
          },
          // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
          writeData: (projectData, newData) => {
            const newProjectData = JSON.parse(JSON.stringify(projectData));
            const awsUserConfig = newProjectData.awsUsers[0].config;
            awsUserConfig.awsAccessKeyId = newData.awsAccessKeyId || '';
            awsUserConfig.awsSecretAccessKey = newData.awsSecretAccessKey || '';
            return { ...newProjectData };
          },
        },
      ],
    },
    {
      type: 'summary',
      id: 'summary',
      docs: undefined,
      idx: 2 + params.packageConfigs.length,
      title: 'Summary',
      sections: [],
    },
  ];
  return [...head, ...packages, ...tail];
};
//# sourceMappingURL=getConfigureSteps.js.map
