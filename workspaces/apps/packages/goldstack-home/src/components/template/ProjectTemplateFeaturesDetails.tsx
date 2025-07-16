import type { ShortTemplateFeature } from '@goldstack/template-metadata';
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
      <TemplateFeature {...props.feature}></TemplateFeature>
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
