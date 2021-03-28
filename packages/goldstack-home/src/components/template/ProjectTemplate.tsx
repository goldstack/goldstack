import { ProjectTemplateProps } from '@goldstack/project-template-data';
import React from 'react';
import ProjectTemplateBody from './ProjectTemplateBody';
import ProjectTemplateSidebar from './ProjectTemplateSidebar';

const ProjectTemplate = (props: ProjectTemplateProps): JSX.Element => {
  return (
    <>
      <div className="container space-top-2 space-bottom-lg-2">
        <div className="row">
          <ProjectTemplateSidebar
            tags={props.tags || []}
            image={props.image}
            actionLink={props.hero.action?.link || '#'}
          ></ProjectTemplateSidebar>
          <ProjectTemplateBody {...props}></ProjectTemplateBody>
        </div>
      </div>
    </>
  );
};

export default ProjectTemplate;
