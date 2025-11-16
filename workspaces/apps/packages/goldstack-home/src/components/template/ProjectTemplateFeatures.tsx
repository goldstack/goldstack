import type { ShortTemplateFeature } from '@goldstack/template-metadata';
import React from 'react';
import { resolveImage } from './imageUtil';
import styles from './ProjectTemplateFeatures.module.css';

const ProjectTemplateFeature = (props: { feature: ShortTemplateFeature }): JSX.Element => {
  return (
    <>
      <a
        href={props.feature.details ? `#${props.feature.id || ''}` : '#'}
        className={`media border border-light mb-4 p-2 ${styles['clickable-media']}`}
      >
        <div className="avatar mr-3 p-1">
          <img className="avatar-img" src={resolveImage(props.feature.image)} alt="Feature Icon" />
        </div>
        <div className="media-body">
          <span className="h4">{props.feature.title}</span>

          <p className="mb-0">{props.feature.description}</p>
        </div>
      </a>
    </>
  );
};

interface ProjectTemplateFeaturesProps {
  features: ShortTemplateFeature[];
}

const ProjectTemplateFeatures = (props: ProjectTemplateFeaturesProps): JSX.Element => {
  return (
    <>
      {props.features.map((feature, idx) => {
        return <ProjectTemplateFeature key={idx} feature={feature}></ProjectTemplateFeature>;
      })}
    </>
  );
};
export default ProjectTemplateFeatures;
