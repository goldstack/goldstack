import type { ProjectTemplateProps } from './projectTemplateTypes';

export type {
  LandingAction,
  MoreDetails,
  PackageProps,
  ProjectTemplateProps,
  ShortTemplateFeature,
  TemplateFeatureImage,
  TemplateFeatureProps,
  TemplateIcons,
  TextSectionProps,
} from './projectTemplateTypes';

import { getDynamoDBTemplateData } from './templates/dynamoDBTemplate';
import { getEmailSendTemplateData } from './templates/emailSendTemplateData';
import { getExpressAndEmailSentTemplateData } from './templates/expressAndEmailSentTemplateData';
import { getExpressTemplateData } from './templates/expressTemplateData';
import { getGoGinTemplateData } from './templates/goGinTemplateData';
import { getHetznerVPSTemplateData } from './templates/hetznerVPSTemplateData';
import { getServerlessApiTemplate } from './templates/lambdaApiTemplateData';
import { getLambdaNodeJobTemplateData } from './templates/lambdaNodeTriggerTemplateData';
import { getLambdaPythonJobTemplateData } from './templates/lambdaPythonJobTemplateData';
import { getNextjsBootstrapTemplateData } from './templates/nextjsBootstrapTemplateData';
import { getNextjsTailwindTemplateData } from './templates/nextjsTailwindTemplateData';
import { getNextJsTemplateData } from './templates/nextjsTemplateData';
import { getS3TemplateData } from './templates/s3TemplateData';
import { getServerSideRenderingTemplate } from './templates/serverSideRenderingTemplateData';
import { getStaticWebsiteTemplateData } from './templates/staticWebsiteTemplateData';
import { getUserManagementTemplate } from './templates/userManagementTemplateData';

export { getNextJsTemplateData };
export { getExpressTemplateData };
export { getNextjsBootstrapTemplateData };
export { getNextjsTailwindTemplateData };
export { getGoGinTemplateData };
export {
  createServerSideRenderingBuildSetConfig,
  getAllBuildSets,
  getBuildSet,
} from './deploySets';

export const allTemplates = (): ProjectTemplateProps[] => {
  const templates = [
    getNextjsBootstrapTemplateData(),
    getNextjsTailwindTemplateData(),
    getServerSideRenderingTemplate(),
    getUserManagementTemplate(),
    getServerlessApiTemplate(),
    getDynamoDBTemplateData(),
    getExpressTemplateData(),
    getNextJsTemplateData(),
    getS3TemplateData(),
    getEmailSendTemplateData(),
    getStaticWebsiteTemplateData(),
    getGoGinTemplateData(),
    getLambdaPythonJobTemplateData(),
    getExpressAndEmailSentTemplateData(),
    getHetznerVPSTemplateData(),
    getLambdaNodeJobTemplateData(),
  ];
  return templates;
};
