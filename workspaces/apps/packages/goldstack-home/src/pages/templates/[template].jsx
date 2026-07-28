import React from 'react';
import { allTemplates } from '@goldstack/template-metadata';
import Footer from 'src/components/Footer';
import Header from 'src/components/Header';
import Breadcrumb from '../../components/Breadcrumb';
import ProjectTemplate from '../../components/template/ProjectTemplate';
const Template = (props) => {
    const template = props;
    return (<>
      <Header></Header>
      <Breadcrumb elements={[
            { description: 'Templates' },
            { description: props.title, link: '#', active: true },
        ]}></Breadcrumb>
      <ProjectTemplate {...template}></ProjectTemplate>
      <Footer></Footer>
    </>);
};
export const getStaticPaths = async () => {
    return {
        // This is just a temporary solution, see https://github.com/goldstack/goldstack/issues/87
        paths: [...allTemplates(), { id: 'lambda-api' }].map((t) => {
            return {
                params: { template: t.id },
            };
        }),
        fallback: false, // Show 404 for pages that are not prerendered
    };
};
export const getStaticProps = async (context) => {
    if (!context.params) {
        throw new Error('Cannot render template without path.');
    }
    let templateId = context.params.template;
    // This is just a temporary solution, see https://github.com/goldstack/goldstack/issues/87
    if (templateId === 'lambda-api') {
        templateId = 'serverless-api';
    }
    const templates = allTemplates();
    const template = templates.find((t) => t.id === templateId);
    return {
        props: {
            ...template,
        },
    };
};
export default Template;
//# sourceMappingURL=%5Btemplate%5D.jsx.map