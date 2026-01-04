import type { AWSAPIKeyUser } from '@goldstack/infra-aws';
import type { ProjectData } from '@goldstack/project-repository';
import awsUserDocs from 'src/docs/aws-user.json';
import projectDocs from 'src/docs/project.json';
import awsUserFormSchema from 'src/lib/schemas/awsUserForm.json';
import projectFormSchema from 'src/lib/schemas/projectForm.json';
import projectFormUiSchema from 'src/lib/schemas/projectFormUi';

export interface ConfigureStepSection {
  title?: string;
  // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is complex and varies
  schema?: any;
  // biome-ignore lint/suspicious/noExplicitAny: UI schema type is complex and varies
  uiSchema: any;
  // biome-ignore lint/suspicious/noExplicitAny: Return type varies based on schema
  getData(projectData: ProjectData): any;
  // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
  writeData(projectData: ProjectData, newData: any): ProjectData;
}

export interface ConfigureStep {
  title: string;
  type: string;
  docs: string | undefined;
  idx: number;
  id: string;
  sections: ConfigureStepSection[];
}

interface TemplateDocsData {
  /* Name of the doc */
  doc: string;
  /* HTML of the doc */
  html: string;
}

export interface DocsData {
  /* Name of the package */
  package: string;
  docs: TemplateDocsData[];
}

interface ConfigureStepParams extends ProjectData {
  docs: DocsData[] | undefined;
}

export const getConfigureSteps = (params: ConfigureStepParams): ConfigureStep[] => {
  const head: ConfigureStep[] = [
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
          getData: (projectData: ProjectData): any => {
            const awsUser = projectData.awsUsers[0].config as AWSAPIKeyUser;
            return {
              ...projectData.project,
              deployment:
                projectData.deploymentNames.length > 0 ? projectData.deploymentNames[0] : undefined,
              awsRegion: awsUser.awsDefaultRegion,
            };
          },
          // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
          writeData: (projectData: ProjectData, newData: any): ProjectData => {
            const newProjectData: ProjectData = JSON.parse(JSON.stringify(projectData));
            newProjectData.project.projectName = newData.projectName;

            newProjectData.deploymentNames = [newData.deployment];
            (newProjectData.awsUsers[0].config as AWSAPIKeyUser).awsDefaultRegion =
              newData.awsRegion;
            return { ...newProjectData };
          },
        },
      ],
    },
  ];

  const packages: ConfigureStep[] = params.packageConfigs.map((config, idx) => {
    let configureDocHtml: string | undefined;
    if (params.docs?.find) {
      const packageName = config.package.name;

      const packageDoc = params.docs.find((el) => el.package === packageName);
      if (packageDoc) {
        const configureDoc = packageDoc.docs.find((el) => el.doc === 'template-configure');
        configureDocHtml = configureDoc?.html;
      }
    }

    const deploymentConfigSection = {
      schema: config.deploymentConfigSchema,
      uiSchema: {},
      // biome-ignore lint/suspicious/noExplicitAny: Return type varies based on schema
      getData: (projectData: ProjectData): any => {
        const data = projectData.packageConfigs[idx].package.deployments[0].configuration;
        return data;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
      writeData: (projectData: ProjectData, newData: any): ProjectData => {
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
        getData: (projectData): any => {
          const data = projectData.packageConfigs[idx].package.configuration;
          return data;
        },
        // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
        writeData: (projectData: ProjectData, newData: any): ProjectData => {
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

  const tail: ConfigureStep[] = [
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
          getData: (projectData: ProjectData): any => {
            const awsUserConfig = projectData.awsUsers[0].config as AWSAPIKeyUser;
            return {
              awsAccessKeyId: awsUserConfig.awsAccessKeyId || '',
              awsSecretAccessKey: awsUserConfig.awsSecretAccessKey || '',
            };
          },
          // biome-ignore lint/suspicious/noExplicitAny: Input type varies based on schema
          writeData: (projectData: ProjectData, newData: any): ProjectData => {
            const newProjectData: ProjectData = JSON.parse(JSON.stringify(projectData));
            const awsUserConfig = newProjectData.awsUsers[0].config as AWSAPIKeyUser;
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
