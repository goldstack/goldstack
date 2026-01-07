import type { ProjectTemplateProps } from '@goldstack/template-metadata';
import Head from 'next/head';
import ProjectTemplateBody from './ProjectTemplateBody';
import ProjectTemplateSidebar from './ProjectTemplateSidebar';

const ProjectTemplate = (props: ProjectTemplateProps): React.ReactNode => {
  if (
    props.metaDescription &&
    (props.metaDescription.length < 120 || props.metaDescription.length > 156)
  ) {
    throw new Error('Meta description must be between 120 and 156 characters.');
  }

  if (props.metaTitle && (props.metaTitle.length < 40 || props.metaTitle.length > 60)) {
    throw new Error('Meta title must be between 40 and 60 characters.');
  }
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta
          property="og:title"
          content={props.metaTitle || `${props.title} Template`}
          key="title"
        />
        <meta name="description" content={props.metaDescription || props.description} />
        <meta property="og:description" content={props.metaDescription || props.description} />
      </Head>
      <div className="container space-top-2 space-bottom-lg-2">
        <div className="row">
          <ProjectTemplateSidebar
            tags={props.tags || []}
            image={props.images[0]}
            isComposite={props.isComposite}
            packages={props.packages}
            actionLink={props.actionLink}
            boilerplateLink={props.boilerplateLink}
          ></ProjectTemplateSidebar>
          <ProjectTemplateBody {...props}></ProjectTemplateBody>
        </div>
      </div>
    </>
  );
};

export default ProjectTemplate;
