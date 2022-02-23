import React from 'react';

import GoldstackIcon from './../../icons/goldstack_icon.svg';
import GitHubIcon from './../../icons/github-tile.svg';

import styles from './ProjectTemplateSidebar.module.css';

import {
  TemplateFeatureImage,
  PackageProps,
} from '@goldstack/template-metadata';

import { resolveImage } from './imageUtil';

interface ProjectTemplateSidebarProps {
  tags: string[];
  image: TemplateFeatureImage;
  packages: PackageProps[];
  isComposite: boolean;
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
              ✔ Add to Project
            </a>
          </div>

          {props.isComposite && (
            <div className="mb-md-7 mt-10">
              <h1 className="h4">Packages</h1>
              <ul className="nav flex-column">
                {props.packages.map((packageData, idx) => (
                  <li className="nav-item" key={idx}>
                    <a
                      className={`nav-link active  ${styles['menulinks-link']}`}
                      href={packageData.link}
                    >
                      <img
                        className={`fas fa-home nav-icon ${styles['menulinks-link-nav-icon']}`}
                        src={GitHubIcon as any}
                      ></img>
                      {packageData.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

            <ul className="nav flex-column">
              <li className="nav-item" key={1}>
                <a
                  className={`nav-link active  ${styles['menulinks-link']}`}
                  href="https://goldstack.party"
                >
                  <img
                    className={`fas fa-home nav-icon ${styles['menulinks-link-nav-icon']}`}
                    src={GoldstackIcon as any}
                  ></img>
                  Goldstack
                </a>
              </li>
            </ul>
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
