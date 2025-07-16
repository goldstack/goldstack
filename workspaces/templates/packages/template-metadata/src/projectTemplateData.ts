import type { ProjectTemplateProps } from './projectTemplateTypes';

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
import { getLambdaPythonJobTemplateData } from './templates/lambdaPythonJobTemplateData';
import { getDynamoDBTemplateData } from './templates/dynamoDBTemplate';
import { getServerSideRenderingTemplate } from './templates/serverSideRenderingTemplateData';
import { getUserManagementTemplate } from './templates/userManagementTemplateData';
import { getHetznerVPSTemplateData } from './templates/hetznerVPSTemplateData';
import { getLambdaNodeJobTemplateData } from './templates/lambdaNodeTriggerTemplateData';

export { getNextJsTemplateData };
export { getExpressTemplateData };
export { getNextjsBootstrapTemplateData };
export { getGoGinTemplateData };
export {
  getAllBuildSets,
  getBuildSet,
  createServerSideRenderingBuildSetConfig,
} from './deploySets';

export const allTemplates = (): ProjectTemplateProps[] => {
  const templates = [
    getNextjsBootstrapTemplateData(),
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
