import type { ShortTemplateFeature } from '@goldstack/template-metadata';
import TemplateFeature from './TemplateFeature';

const ProjectTemplateFeatureDetail = (props: {
  feature: ShortTemplateFeature;
}): React.ReactNode => {
  if (!props.feature.details) {
    return <></>;
  }
  return <TemplateFeature {...props.feature}></TemplateFeature>;
};

const ProjectTemplateFeaturesDetails = (props: {
  features: ShortTemplateFeature[];
}): React.ReactNode => {
  return (
    <>
      {props.features.map((feature, idx) => {
        return (
          <ProjectTemplateFeatureDetail key={idx} feature={feature}></ProjectTemplateFeatureDetail>
        );
      })}
    </>
  );
};

export default ProjectTemplateFeaturesDetails;
