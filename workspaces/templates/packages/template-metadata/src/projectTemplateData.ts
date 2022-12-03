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
import { getExpressAndEmailSentTemplateData } from './templates/expressAndEmailSentTemplateData';
import { getServerlessApiTemplate } from './templates/lambdaApiTemplateData';
import { getEmailSendTemplateData } from './templates/emailSendTemplateData';
import { getS3TemplateData } from './templates/s3TemplateData';
import { getStaticWebsiteTemplateData } from './templates/staticWebsiteTemplateData';
import { getDynamoDBTemplateData } from './templates/dynamoDBTemplate';
import { getServerSideRenderingTemplate } from './templates/serverSideRenderingTemplateData';
import { getUserManagementTemplate } from './templates/userManagementTemplateData';

export { getNextJsTemplateData };
export { getExpressTemplateData };
export { getNextjsBootstrapTemplateData };
export { getGoGinTemplateData };
export {
  getAllBuildSets,
  getBuildSet,
  createServerSideRenderingBuildSetConfig,
} from './deploySets/deploySets';

export const allTemplates = (): ProjectTemplateProps[] => {
  const templates = [
    getNextjsBootstrapTemplateData(),
    getServerlessApiTemplate(),
    getServerSideRenderingTemplate(),
    getExpressTemplateData(),
    getNextJsTemplateData(),
    getStaticWebsiteTemplateData(),
    getGoGinTemplateData(),
    getS3TemplateData(),
    getDynamoDBTemplateData(),
    getEmailSendTemplateData(),
    getExpressAndEmailSentTemplateData(),
    getUserManagementTemplate(),
  ];
  return templates;
};
