import React from 'react';

import Header from 'src/components/Header';

import TemplateComponent, {
  TemplateProps,
} from 'src/components/template/Template';
import FeatureAWSDeployment from 'src/components/template/FeatureAWSDeployment';

import NextJsConfigGif from 'src/img/nextjs-config.gif';
import ReactTypeScriptGif from 'src/img/react-typescript.gif';

import AWSIcon from 'src/icons/aws.svg';
import CloudFrontIcon from 'src/icons/cloudfront.svg';
import S3Icon from 'src/icons/s3.svg';
import TerraformIcon from 'src/icons/terraform.svg';

import ESLintIcon from 'src/icons/eslint.svg';

import FeatureProjectInstall from 'src/components/template/FeatureProjectInstall';

const Template = (): JSX.Element => {
  const nextJsTemplate: TemplateProps = {
    title: 'Next.js Template',
    hero: {
      title: 'Next.js with all the fun and none of the hassle.',
      children: (
        <>
          <p>
            Start working on what matters to you rather than being stuck with
            project setup. Our Next.js golden template comes packaged with
            features tailor-made to bring coding joy.
          </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        </>
      ),
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/?stack=nextjs',
      },
    },
    features: [
      {
        title: 'Project Ready in Minutes',
        description:
          'Start your work with a carefully crafted packages with all dependencies you need provided in compatible versions.',
        children: <FeatureProjectInstall />,
      },
      {
        title: 'Full TypeScript Support',
        description:
          'Develop all components and pages for your Next.js application with TypeScript. Everything set up to work in VSCode.',
        children: <img src={ReactTypeScriptGif}></img>,
      },
      {
        title: 'Linting and Formatting',
        description:
          'ESLint and Prettier configured for usage in the CLI and as VSCode plugins. Optimized to work with Next.js, TypeScript and JSX.',
        icons: [ESLintIcon],
      },
      {
        title: 'Configure Project in Goldstack UI',
        description:
          'Use our web-based tool to configure your project and Next.js package. This will establish basics such as which domain your application should be deployed to.',
        children: <img src={NextJsConfigGif}></img>,
        moreDetails: {
          description:
            'The configuration tool will assemble a project you can download as a ZIP file. All settings will be stored in easily extendable and modifiable JSON files.',
        },
      },
      {
        title: 'Ready for Deployment to AWS',
        description:
          'Deploy your Next.js application for cents on AWS with professional level security, reliabilty and scaleabilty.',
        children: <FeatureAWSDeployment />,
        moreDetails: {
          description:
            'Supports multiple, separate deployments for development, staging and production environments. Implemented using CloudFront and S3.',
        },
        // icons: [AWSIcon, CloudFrontIcon, S3Icon],
      },
      {
        title: 'Extendable and Configurable Infrastructure',
        description:
          'Easily add any service from the AWS cloud to your Next.js application by modifying the Terraform files included in the template.',
        icons: [TerraformIcon],
      },
      {
        title: 'Integrate with Goldstack Templates',
        description:
          'Combine this template with other golden templates from Goldstack. Generate a starter project supporting your full stack including the backend.',
      },
    ],
  };

  return (
    <>
      <Header></Header>
      <TemplateComponent {...nextJsTemplate}></TemplateComponent>
    </>
  );
};

export default Template;
