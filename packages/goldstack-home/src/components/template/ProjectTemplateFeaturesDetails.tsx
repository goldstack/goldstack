import { ShortTemplateFeature } from '@goldstack/project-template-data';
import React from 'react';
import TemplateFeature from './TemplateFeature';

const ProjectTemplateFeatureDetail = (props: {
  feature: ShortTemplateFeature;
}): JSX.Element => {
  if (!props.feature.details) {
    return <></>;
  }
  return (
    <>
      <TemplateFeature
        {...props.feature.details}
        id={props.feature.id}
      ></TemplateFeature>
    </>
  );
};

const ProjectTemplateFeaturesDetails = (props: {
  features: ShortTemplateFeature[];
}): JSX.Element => {
  return (
    <>
      {props.features.map((feature, idx) => {
        return (
          <ProjectTemplateFeatureDetail
            key={idx}
            feature={feature}
          ></ProjectTemplateFeatureDetail>
        );
      })}
    </>
  );
};

export default ProjectTemplateFeaturesDetails;
