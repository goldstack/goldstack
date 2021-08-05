import React from 'react';

import GoldstackIcon from './../../icons/goldstack_icon.svg';

import { TemplateFeatureImage } from '@goldstack/project-template-data';

import { resolveImage } from './imageUtil';

interface ProjectTemplateSidebarProps {
  tags: string[];
  image: TemplateFeatureImage;
  actionLink: string;
}

const ProjectTemplateSidebar = (
  props: ProjectTemplateSidebarProps
): JSX.Element => {
  return (
    <>
      <div className="col-md-4 col-lg-3 mb-9 mb-md-0">
        <div className="mr-lg-2">
          <div className="mb-7">
            <div className="text-center mx-auto mb-3">
              <img
                className="img-fluid"
                src={resolveImage(props.image)}
                alt="Template Icon"
                width="130"
              />
            </div>

            <a
              className="btn btn-sm btn-block btn-primary transition-3d-hover"
              href={props.actionLink}
            >
              ✔ Create Project
            </a>
          </div>

          <div className="mb-md-7">
            <h1 className="h4">Tags</h1>
            {props.tags.map((tag, idx) => (
              <span className="d-inline-block mr-1 mb-2" key={idx}>
                <a className="btn btn-xs btn-soft-secondary disabled" href="#">
                  {tag}
                </a>
              </span>
            ))}
          </div>

          <div className="d-none d-md-block mb-7">
            <h2 className="h4">Developer</h2>

            <a className="d-inline-block text-body" href="/">
              <div className="media align-items-center">
                <div className="avatar avatar-xs mr-3">
                  {/* Somehow this errors out on local preview <Image
                    className="avatar-img"
                    src={GoldstackIcon}
                    unoptimized={true}
                    alt="Goldstack Icon"
                  /> */}
                  <img
                    className="avatar-fluid"
                    src={GoldstackIcon as any}
                    width="40"
                    alt="Goldstack Icon"
                  />
                </div>
                <div className="media-body">Goldstack</div>
              </div>
            </a>
          </div>

          {/* <div className="d-none d-md-block mb-7">
            <h3 className="h4">Links</h3>

            <ul className="list-unstyled font-size-1">
              <li>
                <a className="text-body" href="#">
                  <i className="fas fa-angle-right mr-1"></i> Support
                </a>
              </li>
              <li>
                <a className="text-body" href="#">
                  <i className="fas fa-angle-right mr-1"></i> Documentation
                </a>
              </li>
              <li>
                <a className="text-body" href="#">
                  <i className="fas fa-angle-right mr-1"></i> Privacy Policy
                </a>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default ProjectTemplateSidebar;
