import type ProjectData from '@goldstack/project-repository/src/types/ProjectData';
import Head from 'next/head';
import Link from 'next/link';
import { ConfigForm } from 'src/components/ConfigForm';
import type { ConfigureStep } from 'src/lib/getConfigureSteps';
import ProjectConfigSummary from './ProjectConfigSummary';

const DynamicConfigForm = (props: {
  currentItem: number;
  configureSteps: ConfigureStep[];
  packageId: string;
  projectData: ProjectData;
  onChange: (data: ProjectData) => void;
  onStepSubmit: (data: ProjectData) => void;
}): JSX.Element => {
  const step = props.configureSteps[props.currentItem - 1];
  if (!step) {
    throw new Error(`Cannot find step configuration for ${props.currentItem}`);
  }

  const docHtml: string | undefined = step.docs;

  const onSubmit = (): void => {
    props.onStepSubmit(props.projectData);
  };
  // biome-ignore lint/suspicious/noExplicitAny: data shape is determined by JSON schema
  const onChange = (data: any): void => {
    props.onChange(data);
  };

  return (
    <>
      <Head>
        <title>{step.title}</title>
      </Head>
      <div className="mb-4">
        <h2 className="h3">{step.title}</h2>
      </div>
      {docHtml && (
        <div
          className="bg-light p-4 mb-4"
          style={{ fontSize: '0.9rem' }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted HTML from docs
          dangerouslySetInnerHTML={{ __html: docHtml }}
        ></div>
      )}
      {step.type === 'form' &&
        step.sections.map((section, idx) => {
          // biome-ignore lint/suspicious/noExplicitAny: data shape is determined by JSON schema
          const onSectionChange = (data: any): void => {
            const newData = section.writeData(props.projectData, data);
            onChange(newData);
          };
          return (
            <ConfigForm
              key={section.title || idx}
              idx={step.idx * 100 + idx}
              schema={section.schema}
              uiSchema={section.uiSchema}
              data={section.getData(props.projectData)}
              onChange={onSectionChange}
            ></ConfigForm>
          );
        })}
      {step.type === 'summary' && (
        <ProjectConfigSummary
          packageId={props.packageId}
          projectData={props.projectData}
        ></ProjectConfigSummary>
      )}
      <div className="mb-7">
        <div className="d-flex justify-content-between align-items-center">
          {step.idx > 0 && (
            <Link
              href="/projects/[id]/packages/[packageId]/configure/[step]"
              as={`/projects/${props.projectData.projectId}/packages/${
                props.packageId
              }/configure/${props.currentItem - 1}`}
              prefetch={false}
              className={'font-weight-bold'}
              shallow={true}
            >
              <i className="fas fa-angle-left fa-xs mr-1"></i>
              Previous
            </Link>
          )}
          {step.idx <= 0 && (
            <Link
              href="/projects/[id]/packages/[packageId]/download"
              prefetch={false}
              shallow={true}
              className={'font-weight-bold'}
              as={`/projects/${props.projectData.projectId}/packages/${props.packageId}/download`}
            >
              <i className="fas fa-angle-left fa-xs mr-1"></i>
              Back to download
            </Link>
          )}

          {step.type !== 'summary' && (
            <Link
              href="/projects/[id]/packages/[packageId]/configure/[step]"
              as={`/projects/${props.projectData.projectId}/packages/${
                props.packageId
              }/configure/${props.currentItem + 1}`}
              prefetch={false}
              className="btn btn-primary btn-pill transition-3d-hover pull-right"
              shallow={true}
              onClick={onSubmit}
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default DynamicConfigForm;
