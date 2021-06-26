import React from 'react';

import { GetStaticProps, GetStaticPaths } from 'next';

import Header from 'src/components/Header';

import {
  ProjectTemplateProps,
  getNextJsTemplateData,
  getNextjsBootstrapTemplateData,
  getExpressTemplateData,
  getGoGinTemplateData,
} from '@goldstack/project-template-data';

import Footer from 'src/components/Footer';
import Breadcrump from '../../components/Breadcrump';
import ProjectTemplate from '../../components/template/ProjectTemplate';

const Template = (props: ProjectTemplateProps): JSX.Element => {
  const template = props;
  return (
    <>
      <Header></Header>
      <Breadcrump
        elements={[
          { description: 'Templates' },
          { description: 'Next.js', link: '#', active: true },
        ]}
      ></Breadcrump>
      <ProjectTemplate {...template}></ProjectTemplate>
      <Footer></Footer>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: { template: 'nextjs' },
      },
      {
        params: { template: 'nextjs-bootstrap' },
      },
      {
        params: { template: 'express-lambda' },
      },
      {
        params: { template: 'go-gin' },
      },
    ],
    fallback: false, // Show 404 for pages that are not prerendered
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  if (!context.params) {
    throw new Error('Cannot render template without path.');
  }

  const templateId = context.params.template;

  let template: ProjectTemplateProps | undefined;
  if (templateId === 'nextjs') {
    template = getNextJsTemplateData();
  }
  if (templateId === 'nextjs-bootstrap') {
    template = getNextjsBootstrapTemplateData();
  }
  if (templateId === 'express-lambda') {
    template = getExpressTemplateData();
  }
  if (templateId === 'go-gin') {
    template = getGoGinTemplateData();
  }

  return {
    props: {
      ...template,
    },
  };
};

export default Template;
