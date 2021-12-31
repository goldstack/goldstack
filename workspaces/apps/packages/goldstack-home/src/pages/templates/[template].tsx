import React from 'react';

import { GetStaticProps, GetStaticPaths } from 'next';

import Header from 'src/components/Header';

import {
  ProjectTemplateProps,
  allTemplates,
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
          { description: props.title, link: '#', active: true },
        ]}
      ></Breadcrump>
      <ProjectTemplate {...template}></ProjectTemplate>
      <Footer></Footer>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: allTemplates().map((t) => {
      return {
        params: { template: t.id },
      };
    }),
    fallback: false, // Show 404 for pages that are not prerendered
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  if (!context.params) {
    throw new Error('Cannot render template without path.');
  }

  const templateId = context.params.template;

  const templates = allTemplates();
  const template: ProjectTemplateProps | undefined = templates.find(
    (t) => t.id == templateId
  );

  return {
    props: {
      ...template,
    },
  };
};

export default Template;
