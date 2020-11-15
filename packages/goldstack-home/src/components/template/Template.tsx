import React from 'react';
import TemplateFeature, { TemplateFeatureProps } from './TemplateFeature';

import Head from 'next/head';
import TextSection, { TextSectionProps } from './TextSection';

export interface TemplateProps {
  title: string;
  hero: TextSectionProps;
  features: TemplateFeatureProps[];
}

const Template = (props: TemplateProps): JSX.Element => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <TextSection {...props.hero}></TextSection>
      {props.features.map((feature, idx) => {
        return <TemplateFeature {...feature} key={idx}></TemplateFeature>;
      })}
    </>
  );
};

export default Template;
