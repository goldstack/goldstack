import React from 'react';
import { ProjectTemplateProps } from '@goldstack/project-template-data';

import { resolveImage } from './imageUtil';

export interface TemplateCardProps {
  template: ProjectTemplateProps;
}

const TemplateCard = (props: TemplateCardProps): JSX.Element => {
  return (
    <>
      <div className="card border shadow-none d-block">
        <div className="card-body d-flex align-items-center p-0">
          <div className="w-65 border-right">
            <img
              className="img-fluid"
              src={resolveImage(props.template.images[0])}
              alt="Template Image 1"
            />
          </div>
          <div className="w-35">
            <div className="border-bottom">
              <img
                className="img-fluid"
                src={resolveImage(props.template.images[1])}
                alt="Template Image 2"
              />
            </div>
            <img
              className="img-fluid"
              src={resolveImage(props.template.images[2])}
              alt="Template Image 3"
            />
          </div>
        </div>
        <div className="card-footer text-center py-4">
          <h3 className="mb-1">{props.template.title}</h3>
          <span className="d-block text-muted font-size-1 mb-3">
            {props.template.tags.join(' ')}
          </span>
          <a
            className="btn btn-sm btn-outline-primary btn-pill transition-3d-hover px-5"
            href={`/templates/${props.template.id}`}
          >
            View Template
          </a>
        </div>
      </div>
    </>
  );
};

export default TemplateCard;
