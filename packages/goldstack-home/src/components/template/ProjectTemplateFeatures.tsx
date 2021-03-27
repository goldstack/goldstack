import React from 'react';

import {
  TemplateFeatureImage,
  ShortTemplateFeature,
} from '@goldstack/project-template-data';

import TypeScriptIcon from './../../icons/typescript.svg';
import NextjsIcon from './../../icons/nextjs.svg';
import ESLintIcon from './../../icons/eslint.svg';
import VSCodeIcon from './../../icons/vscode.svg';
import YarnIcon from './../../icons/yarn.svg';
import AWSIcon from './../../icons/aws.svg';
import TerraformIcon from './../../icons/terraform.svg';
import JestIcon from './../../icons/jestjs.svg';
import CompositionIcon from './../../icons/front/icon-29-composition.svg';

import styles from './ProjectTemplateFeatures.module.css';

const resolveImage = (image: TemplateFeatureImage): any => {
  if (image === 'typescript') {
    return TypeScriptIcon;
  }
  if (image === 'nextjs') {
    return NextjsIcon;
  }
  if (image === 'eslint') {
    return ESLintIcon;
  }
  if (image === 'vscode') {
    return VSCodeIcon;
  }
  if (image === 'yarn') {
    return YarnIcon;
  }
  if (image === 'aws') {
    return AWSIcon;
  }
  if (image === 'terraform') {
    return TerraformIcon;
  }
  if (image === 'jest') {
    return JestIcon;
  }
  if (image === 'composition') {
    return CompositionIcon;
  }

  throw new Error('Unknown image: ' + image);
};

const ProjectTemplateFeature = (props: {
  feature: ShortTemplateFeature;
}): JSX.Element => {
  console.log(props.feature);
  return (
    <>
      <a
        href={props.feature.details ? `#${props.feature.id || ''}` : '#'}
        className={`media border border-light mb-4 p-2 ${styles['clickable-media']}`}
      >
        <div className="avatar mr-3 p-1">
          <img
            className="avatar-img"
            src={resolveImage(props.feature.image)}
            alt="Feature Icon"
          />
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

const ProjectTemplateFeatures = (
  props: ProjectTemplateFeaturesProps
): JSX.Element => {
  return (
    <>
      {props.features.map((feature, idx) => {
        return (
          <ProjectTemplateFeature
            key={idx}
            feature={feature}
          ></ProjectTemplateFeature>
        );
      })}
    </>
  );
};
export default ProjectTemplateFeatures;
