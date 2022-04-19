import { ProjectTemplateProps } from './projectTemplateTypes';

export type {
  ProjectTemplateProps,
  TemplateFeatureProps,
  MoreDetails,
  TextSectionProps,
  LandingAction,
  TemplateIcons,
  TemplateFeatureImage,
  ShortTemplateFeature,
  PackageProps,
} from './projectTemplateTypes';

import { getNextJsTemplateData } from './templates/nextjsTemplateData';
import { getNextjsBootstrapTemplateData } from './templates/nextjsBootstrapTemplateData';
import { getExpressTemplateData } from './templates/expressTemplateData';
import { getGoGinTemplateData } from './templates/goGinTemplateData';
import { getExpressAndEmailSentTemplateData } from './templates/expressAndemailSentTemplateData';
import { getServerlessApiTemplate } from './templates/lambdaApiTemplateData';

export { getNextJsTemplateData };
export { getExpressTemplateData };
export { getNextjsBootstrapTemplateData };
export { getGoGinTemplateData };
export { getAllBuildSets, getBuildSet } from './deploySets/deploySets';

export const allTemplates = (): ProjectTemplateProps[] => {
  const templates = [
    getNextjsBootstrapTemplateData(),
    getServerlessApiTemplate(),
    getExpressTemplateData(),
    getNextJsTemplateData(),
    getGoGinTemplateData(),
    getExpressAndEmailSentTemplateData(),
  ];
  return templates;
};
