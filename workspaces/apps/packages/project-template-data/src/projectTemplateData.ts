import { ProjectTemplateProps } from './projectTemplateTypes';

export {
  ProjectTemplateProps,
  TemplateFeatureProps,
  MoreDetails,
  TextSectionProps,
  LandingAction,
  TemplateIcons,
  TemplateFeatureImage,
  ShortTemplateFeature,
} from './projectTemplateTypes';

import { getNextJsTemplateData } from './templates/nextjsTemplateData';
import { getNextjsBootstrapTemplateData } from './templates/nextjsBootstrapTemplateData';
import { getExpressTemplateData } from './templates/expressTemplateData';
import { getGoGinTemplateData } from './templates/goGinTemplateData';

export { getNextJsTemplateData };
export { getExpressTemplateData };
export { getNextjsBootstrapTemplateData };
export { getGoGinTemplateData };

export const allTemplates = (): ProjectTemplateProps[] => {
  const templates = [
    getNextJsTemplateData(),
    getNextjsBootstrapTemplateData(),
    getExpressTemplateData(),
    getGoGinTemplateData(),
  ];
  return templates;
};
