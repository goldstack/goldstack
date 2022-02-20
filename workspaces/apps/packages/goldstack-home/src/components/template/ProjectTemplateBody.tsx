import { ProjectTemplateProps } from '@goldstack/template-metadata';
import React from 'react';

import TopTemplateIcon from './../../icons/front/top-template.svg';

import ProjectTemplateFeatures from './ProjectTemplateFeatures';
import ProjectTemplateFeaturesDetails from './ProjectTemplateFeaturesDetails';
import TemplateCallToAction from './TemplateCallToAction';

const ProjectTemplateBody = (props: ProjectTemplateProps): JSX.Element => {
  return (
    <>
      <div className="col-md-8 col-lg-9 column-divider-md">
        <div className="ml-lg-2">
          <div className="mb-5">
            <h2>
              {props.title} {'Template'}
              <img
                className="ml-1"
                src={TopTemplateIcon}
                alt="Top Template marker star"
                title="Top Template"
                width="20"
              />
            </h2>
          </div>
          {/* <h4 className="mb-4">Description</h4> */}
          {(props.longDescription || props.description)
            .split('\n')
            .map((para, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: para }}></p>
            ))}
          <a
            className="link-collapse font-weight-bold collapsed"
            href={props.hero.action?.link || '#'}
            role="button"
            aria-expanded="false"
            aria-controls="collapseLinkExample"
          >
            Add template to new project
          </a>
          {/* <hr className="my-6"></hr>
          <div className="p-6">
            <div className="embed-responsive embed-responsive-16by9">
              <iframe
                className="embed-responsive-item"
                src="https://www.youtube.com/embed/hvZ8Ry9XYVE"
                allowFullScreen
              ></iframe>
            </div>
          </div> */}
          <hr className="my-6"></hr>
          <h4 className="mb-4">Features Included</h4>
          <ProjectTemplateFeatures
            features={props.featuresOverview || []}
          ></ProjectTemplateFeatures>
          <hr className="my-6"></hr>
          <ProjectTemplateFeaturesDetails
            features={props.featuresOverview || []}
          ></ProjectTemplateFeaturesDetails>
          <TemplateCallToAction
            action={{
              link: props.hero.action?.link || '',
              title: '✔ Add Template to Project',
            }}
          ></TemplateCallToAction>
        </div>
      </div>
    </>
  );
};

export default ProjectTemplateBody;
