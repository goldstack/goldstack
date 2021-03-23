import React from 'react';
import TemplateFeature from './TemplateFeature';

import Head from 'next/head';
import TextSection from './TextSection';
import TemplateCallToAction from './TemplateCallToAction';

import { ProjectTemplateProps } from '@goldstack/project-template-data';

const Template = (props: ProjectTemplateProps): JSX.Element => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta property="og:title" content={props.title} key="title" />
        <meta name="description" content={props.description} />
        <meta property="og:description" content={props.description} />
      </Head>
      <TextSection {...props.hero}></TextSection>
      {props.features.map((feature, idx) => {
        return <TemplateFeature {...feature} key={idx}></TemplateFeature>;
      })}
      {props.hero.action && (
        <TemplateCallToAction action={props.hero.action}></TemplateCallToAction>
      )}
    </>
  );
};

export default Template;
