import { ProjectConfiguration } from '@goldstack/utils-project';

export const buildProjectConfig = (
  selectedIds: string[]
): ProjectConfiguration => {
  const project: ProjectConfiguration = {
    projectName: '',
    packages: [],
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
  };

  project.packages = selectedIds.map((id) => {
    if (!id.startsWith('template:')) {
      throw new Error(`Invalid id ${id}`);
    }

    const template = id.substr('template:'.length);

    return {
      packageName: template,
      templateReference: {
        templateName: template,
      },
    };
  });

  return project;
};
