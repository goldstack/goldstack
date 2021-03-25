import React from 'react';
import ProjectTemplateSidebar from './ProjectTemplateSidebar';

const ProjectTemplate = (): JSX.Element => {
  return (
    <>
      <div className="container space-top-2 space-bottom-lg-2">
        <div className="row">
          <ProjectTemplateSidebar
            tags={['Nextjs', 'TypeScript', 'Yarn']}
          ></ProjectTemplateSidebar>
        </div>
      </div>
    </>
  );
};

export default ProjectTemplate;
