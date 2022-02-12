import { ProjectTemplateProps } from '@goldstack/project-template-data';
import React from 'react';
import ProjectTemplateBody from './ProjectTemplateBody';
import ProjectTemplateSidebar from './ProjectTemplateSidebar';

import Head from 'next/head';

const ProjectTemplate = (props: ProjectTemplateProps): JSX.Element => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta property="og:title" content={props.title} key="title" />
        <meta name="description" content={props.description} />
        <meta property="og:description" content={props.description} />
      </Head>
      <div className="container space-top-2 space-bottom-lg-2">
        <div className="row">
          <ProjectTemplateSidebar
            tags={props.tags || []}
            image={props.images[0]}
            modules={props.packages}
            actionLink={props.hero.action?.link || '#'}
          ></ProjectTemplateSidebar>
          <ProjectTemplateBody {...props}></ProjectTemplateBody>
        </div>
      </div>
    </>
  );
};

export default ProjectTemplate;
