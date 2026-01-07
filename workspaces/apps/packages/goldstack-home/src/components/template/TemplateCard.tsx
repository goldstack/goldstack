import type { ProjectTemplateProps } from '@goldstack/template-metadata';

import { resolveImage } from './imageUtil';

import styles from './TemplateCard.module.css';
export interface TemplateCardProps {
  template: ProjectTemplateProps;
}

const TemplateCard = (props: TemplateCardProps): JSX.Element => {
  return (
    <div className={`card border shadow-none d-block ${styles['package-card']} `}>
      <div className="card-body d-flex align-items-center p-0">
        <div className="w-35 ">
          <img
            className={`img-fluid ${styles['card-image']}`}
            src={resolveImage(props.template.images[0])}
            alt="Template Image 1"
          />
        </div>
        <div className="w-65 pr-5">
          <h3 className="mb-1">{props.template.title}</h3>
        </div>
        {/* <div className="w-35">
            <div className="border-bottom border-left text-center">
              <img
                className={`img-fluid ${styles['card-image']}`}
                src={resolveImage(props.template.images[1])}
                alt="Template Image 2"
              />
            </div>
          </div>
          <div className="w-45">
            <img
              className={`img-fluid border-left ${styles['card-image']}`}
              src={resolveImage(props.template.images[2])}
              alt="Template Image 3"
            />
          </div> */}
      </div>
      <div className="card-footer text-center py-4">
        <span className="d-block text-muted font-size-1 mb-3">{props.template.description}</span>
        <a
          className="btn btn-sm btn-outline-primary btn-pill transition-3d-hover px-5 "
          href={`/templates/${props.template.id}`}
        >
          View Template
        </a>
      </div>
    </div>
  );
};

export default TemplateCard;
