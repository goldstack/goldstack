import React from 'react';
import Link from 'next/link';
import { SitemapItem } from '@goldstack/markdown-docs';

const navPath = '/docs/';

const MyLink: any = Link;

const Level1Item = (props: { title: string }): JSX.Element => (
  <span className="hs-sidebar-heading">{props.title}</span>
);

const Level2Wrapper = (props: { children: React.ReactNode }): JSX.Element => (
  <ul className="hs-sidebar-nav">{props.children}</ul>
);

const Level2Item = (props: {
  title: string;
  link: string;
  currentPath: string;
}): JSX.Element => (
  <li className="hs-sidebar-item">
    <MyLink href={navPath + props.link}>
      <a
        className={`hs-sidebar-link ${
          props.link === props.currentPath ? 'active' : ''
        }`}
      >
        {props.title}
      </a>
    </MyLink>
  </li>
);

const Level3Wrapper = (props: {
  title: string;
  children: React.ReactNode;
}): JSX.Element => (
  <li className="hs-sidebar-item">
    <span className="hs-sidebar-link">{props.title}</span>
    <ul className="hs-sidebar-nav ml-2">{props.children}</ul>
  </li>
);

const Level3Item = (props: { title: string; link: string }): JSX.Element => (
  <li className="hs-sidebar-item">
    <MyLink href={navPath + props.link}>
      <a className="hs-sidebar-link ">{props.title}</a>
    </MyLink>
  </li>
);

const buildNavLevel3 = (params: {
  items: SitemapItem[];
  title: string;
  key: number;
}): JSX.Element => {
  return (
    <Level3Wrapper key={params.key} title={params.title}>
      {params.items.map((item, idx) => (
        <Level3Item title={item.title} key={idx} link={item.path}></Level3Item>
      ))}
    </Level3Wrapper>
  );
};

const buildNavLevel2 = (params: {
  items: SitemapItem[];
  currentPath: string;
}): JSX.Element => {
  return (
    <Level2Wrapper>
      {params.items.map((item, idx) => (
        <>
          {(!item.children || item.children.length === 0) && (
            <Level2Item
              title={item.title}
              link={item.path}
              currentPath={params.currentPath}
              key={idx}
            ></Level2Item>
          )}
          {item.children &&
            item.children.length > 0 &&
            buildNavLevel3({
              items: item.children,
              title: item.title,
              key: idx + 1000,
            })}
        </>
      ))}
    </Level2Wrapper>
  );
};

const buildNavLevel1 = (params: {
  items: SitemapItem[];
  currentPath: string;
}): JSX.Element => {
  return (
    <>
      {params.items.map((item, idx) => (
        <div key={idx}>
          <Level1Item title={item.title}></Level1Item>
          {item.children &&
            buildNavLevel2({
              items: item.children,
              currentPath: params.currentPath,
            })}
        </div>
      ))}
    </>
  );
};

interface NavigationProps {
  items: SitemapItem[];
  currentPath: string;
}

const Navigation = (props: NavigationProps): JSX.Element => {
  return (
    <>
      <div
        id="sidebarNav"
        className="hs-sidebar-scrollbar hs-sidebar-sticky pl-2 pl-md-0 pr-2"
      >
        {buildNavLevel1({ items: props.items, currentPath: props.currentPath })}
      </div>
    </>
  );
};

export default Navigation;
