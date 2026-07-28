import React from 'react';
import styles from './Toc.module.css';
const ExpandableItem = (props) => {
    return (<>
      <a className={`dropdown-nav-link ${props.className}`} 
    // dropdown-toggle dropdown-toggle-collapse"
    href={props.link} role="button" id={`${props.id}-parent`}>
        {props.title}
      </a>

      <div id="sidebarNav1Collapse" className={props.className}>
        <div id={props.id} className="navbar-nav align-items-start flex-column">
          <div className="">{props.children}</div>
        </div>
      </div>
    </>);
};
const getItemPadding = (level) => {
    let padding;
    if (level === 1) {
        padding = 'px-0';
    }
    if (level === 2) {
        padding = '';
    }
    else {
        padding = `px-${level - 1}`;
    }
    return padding;
};
const LeafItem = (props) => {
    const padding = getItemPadding(props.level);
    return (<a className={`dropdown-item ${padding} ${styles.nowhitespace}`} href={props.link}>
      {props.title}
    </a>);
};
const Item = (props) => {
    if (props.heading.subheadings.length === 0) {
        return (<LeafItem title={props.heading.title} link={`#${props.heading.id}`} level={props.level}></LeafItem>);
    }
    return (<ExpandableItem title={props.heading.title} link={`#${props.heading.id}`} id={`${props.heading.id}-nav`} className={getItemPadding(props.level + 1)}>
      {props.heading.subheadings.map((subheading, idx) => {
            return <Item heading={subheading} level={props.level + 1} key={idx}></Item>;
        })}
    </ExpandableItem>);
};
const Toc = (props) => {
    return (<>
      {/* <div className="col-lg-3 mb-5 mb-lg-0"> */}
      <div className="navbar-expand-lg navbar-expand-lg-collapse-block navbar-light">
        <div id="sidebarNav" className={`collapse navbar-collapse position-fixed ${styles.rightsidebar}`}>
          <div className="pl-2 pl-lg-0 mt-3 mt-lg-0">
            <div className="position-relative">
              {props.headings.map((heading, idx) => (<Item heading={heading} level={1} key={idx}></Item>))}
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>);
};
export default Toc;
//# sourceMappingURL=Toc.jsx.map