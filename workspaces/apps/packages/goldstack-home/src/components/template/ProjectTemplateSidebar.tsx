import React from 'react';

import GitHubIcon from './../../icons/github-tile.svg';
import DocumentIcon from './../../icons/document.svg';

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
  boilerplateLink?: string;
}

const ProjectTemplateSidebar = (
  props: ProjectTemplateSidebarProps
): JSX.Element => {
  return (
    <>
      <div className="col-md-4 col-lg-3 mb-9 mb-md-0">
        <div className="mr-lg-2">
          <div className="pb-5 mb-7 border-bottom ">
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
            {props.boilerplateLink && (
              <a
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-block btn-white transition-3d-hover"
                href={props.boilerplateLink}
              >
                <img src={GitHubIcon as any} style={{ width: '1rem' }}></img>{' '}
                View Boilerplate
              </a>
            )}
          </div>

          <div>
            <dl className="row font-size-1">
              <dt className="col-sm-4 text-dark">License</dt>
              <dd className="col-sm-8 text-body">MIT</dd>
            </dl>
            <dl className="row font-size-1">
              <dt className="col-sm-4 text-dark">Developer</dt>
              <dd className="col-sm-8 text-body">
                <a href="https://goldstack.party" className="text-body">
                  <img
                    className={`fas fa-home nav-icon ${styles['menulinks-link-nav-icon']}`}
                    src="https://cdn.goldstack.party/img/202203/goldstack_icon.png"
                  ></img>
                  Goldstack
                </a>
              </dd>
            </dl>
            <dl className="row font-size-1">
              <dt className="col-sm-4 text-dark">Tags</dt>
              <dd className="col-sm-8 text-body">
                {props.tags.map((tag, idx) => (
                  <span className="d-inline-block mr-1 mb-2" key={idx}>
                    <a
                      className="btn btn-xs btn-soft-secondary disabled"
                      href="#"
                    >
                      {tag}
                    </a>
                  </span>
                ))}
              </dd>
            </dl>
          </div>

          <div className="mb-md-7 mt-10">
            <h1 className="h6">Documentation</h1>
            <ul className="nav flex-column">
              {props.packages.map((packageData, idx) => (
                <li className="nav-item font-size-1 " key={idx}>
                  <a
                    className={`nav-link active  ${styles['menulinks-link']}`}
                    href={packageData.documentationLink}
                  >
                    <img
                      className={`fas fa-home nav-icon ${styles['menulinks-link-nav-icon']}`}
                      src={DocumentIcon as any}
                    ></img>
                    {packageData.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-md-7 mt-10">
            <h1 className="h6">Source Code</h1>
            <ul className="nav flex-column">
              {props.packages.map((packageData, idx) => (
                <li className="nav-item font-size-1 " key={idx}>
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
        </div>
      </div>
    </>
  );
};

export default ProjectTemplateSidebar;
