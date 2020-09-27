import React from 'react';

import { Heading } from '@goldstack/toc-generator';

interface TocProps {
  headings: Heading[];
}

const ExpandableItem = (props: {
  title: string;
  link: string;
  id: string;
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <>
      <a
        className="dropdown-nav-link"
        // dropdown-toggle dropdown-toggle-collapse"
        href={props.link}
        role="button"
        id={`${props.id}-parent`}
        // data-toggle="collapse"
        // aria-expanded="false"
        // aria-controls={props.id}
        // data-target={`#${props.id}`}
      >
        {props.title}
      </a>

      <div
        id="sidebarNav1Collapse"
        // className="collapse"
        // data-parent={`#${props.id}-parent`}
      >
        <div id={props.id} className="navbar-nav align-items-start flex-column">
          <div className="position-relative">{props.children}</div>
        </div>
      </div>
    </>
  );
};

const LeafItem = (props: {
  title: string;
  link: string;
  level: number;
}): JSX.Element => {
  let padding: string;
  if (props.level === 1) {
    padding = 'px-0';
  }
  if (props.level === 2) {
    padding = '';
  } else {
    padding = `px-${props.level - 1}`;
  }
  return (
    <>
      <a className={`dropdown-item ${padding}`} href={props.link}>
        {props.title}
      </a>
    </>
  );
};

const Item = (props: { heading: Heading; level: number }): JSX.Element => {
  if (props.heading.subheadings.length === 0) {
    return (
      <LeafItem
        title={props.heading.title}
        link={`#${props.heading.id}`}
        level={props.level}
      ></LeafItem>
    );
  }

  return (
    <ExpandableItem
      title={props.heading.title}
      link={`#${props.heading.id}`}
      id={`${props.heading.id}-nav`}
    >
      {props.heading.subheadings.map((subheading, idx) => {
        return (
          <Item heading={subheading} level={props.level + 1} key={idx}></Item>
        );
      })}
    </ExpandableItem>
  );
};

const Toc = (props: TocProps): JSX.Element => {
  return (
    <>
      {/* <div className="col-lg-3 mb-5 mb-lg-0"> */}
      <div className="navbar-expand-lg navbar-expand-lg-collapse-block navbar-light">
        <div id="sidebarNav" className="collapse navbar-collapse">
          <div className="pl-2 pl-lg-0 mt-3 mt-lg-0">
            <div className="position-relative">
              {props.headings.map((heading, idx) => (
                <Item heading={heading} level={1} key={idx}></Item>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default Toc;
