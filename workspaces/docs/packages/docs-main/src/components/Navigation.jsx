import Link from 'next/link';
import React from 'react';
const navPath = '/docs/';
import styles from './Navigation.module.css';
const Level1Item = (props) => (<span className="hs-sidebar-heading">{props.title}</span>);
const Level2Wrapper = (props) => (<ul className="hs-sidebar-nav">{props.children}</ul>);
const Level2Item = (props) => (<li className="hs-sidebar-item">
    <a href={navPath + props.link} className={`hs-sidebar-link ${props.link === props.currentPath ? 'active' : ''}`}>
      {props.title}
    </a>
  </li>);
const Level3Wrapper = (props) => (<li className="hs-sidebar-item">
    <span className="hs-sidebar-link">{props.title}</span>
    <ul className="hs-sidebar-nav ml-2">{props.children}</ul>
  </li>);
const Level3Item = (props) => (<li className="hs-sidebar-item">
    <Link href={navPath + props.link} className="hs-sidebar-link">
      {props.title}
    </Link>
  </li>);
const buildNavLevel3 = (params) => {
    return (<Level3Wrapper key={params.key} title={params.title}>
      {params.items.map((item, idx) => (<Level3Item title={item.title} key={idx} link={item.path}></Level3Item>))}
    </Level3Wrapper>);
};
const buildNavLevel2 = (params) => {
    return (<Level2Wrapper key={params.sortKey}>
      {params.items.map((item, idx) => (<div key={idx}>
          {(!item.children || item.children.length === 0) && (<Level2Item title={item.title} link={item.path} currentPath={params.currentPath} key={idx}></Level2Item>)}
          {item.children &&
                item.children.length > 0 &&
                buildNavLevel3({
                    items: item.children,
                    title: item.title,
                    key: idx + 1000,
                })}
        </div>))}
    </Level2Wrapper>);
};
const buildNavLevel1 = (params) => {
    return (<>
      {params.items.map((item, idx) => (<div key={idx}>
          <Level1Item title={item.title}></Level1Item>
          {item.children &&
                buildNavLevel2({
                    items: item.children,
                    sortKey: idx,
                    currentPath: params.currentPath,
                })}
        </div>))}
    </>);
};
const Navigation = (props) => {
    return (<div id="sidebarNav" className={`hs-sidebar-sticky pl-2 pl-md-0 pr-2 ${styles.sidebarmain}`}>
      {buildNavLevel1({ items: props.items, currentPath: props.currentPath })}
    </div>);
};
export default Navigation;
//# sourceMappingURL=Navigation.jsx.map