import { ShortTemplateFeature } from 'src/projectTemplateTypes';

export const featureYarn3 = (): ShortTemplateFeature => {
  return {
    title: 'Yarn 3',
    id: 'yarn',
    description:
      'Fast build times and advanced modularity using Yarn 3 workspaces.',
    image: 'yarn',
    details: {
      title: 'Build Modular Applications with Yarn Workspaces',
      description:
        'Yarn 3 workspace configured for blazing fast project bootstrap and hassle-free development of a modular application.',
      icons: ['yarn'],
      content: {
        type: 'none',
        data: {},
      },
    },
  };
};

export const featureVSCode = (): ShortTemplateFeature => {
  return {
    title: 'VSCode',
    id: 'vscode',
    description:
      'Template configured to work seamlessly with the powerful VSCode editor.',
    image: 'vscode',
    details: {
      title: 'Develop in VSCode',
      description:
        'All configuration for developing TypeScript code for VSCode provided.',
      icons: ['vscode'],
      content: {
        type: 'none',
        data: {},
      },
    },
  };
};

export const featureAppComposition = (
  templates: string[]
): ShortTemplateFeature => {
  return {
    title: 'App Composition',
    id: 'composition',
    description:
      'Easily combine with any Goldstack module to compose end-to-end applications.',
    image: 'composition',
    details: {
      title: 'Integrate with Goldstack Templates',
      description:
        'Combine this template with other modules from Goldstack. Generate a starter project supporting your full stack including the frontend.',
      content: {
        type: 'combine-templates',
        data: {
          templates,
        },
      },
      moreDetails: {
        description:
          'Simply choose any of these templates while building your project in the Goldstack Builder UI and they will be included in your starter project.',
      },
    },
  };
};
