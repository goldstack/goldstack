import React from 'react';

import ProjectData from '@goldstack/project-repository/src/types/ProjectData';
import Head from 'next/head';
import { ConfigForm } from 'src/components/ConfigForm';
import { ConfigureStep } from 'src/lib/getConfigureSteps';

import Link from 'next/link';
import ProjectConfigSummary from './ProjectConfigSummary';
const MyLink: any = Link;

const DynamicConfigForm = (props: {
  currentItem: number;
  configureSteps: ConfigureStep[];
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
          dangerouslySetInnerHTML={{ __html: docHtml }}
        ></div>
      )}
      {step.type === 'form' &&
        step.sections.map((section, idx) => {
          const onSectionChange = (data: any): void => {
            const newData = section.writeData(props.projectData, data);
            onChange(newData);
          };
          return (
            <ConfigForm
              key={idx}
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
          projectData={props.projectData}
        ></ProjectConfigSummary>
      )}
      <div className="mb-7">
        <div className="d-flex justify-content-between align-items-center">
          {step.idx > 0 && (
            <MyLink
              href="/projects/[id]/configure/[step]"
              as={`/projects/${props.projectData.projectId}/configure/${
                props.currentItem - 1
              }`}
              prefetch={false}
              shallow={true}
            >
              <a className={'font-weight-bold'}>
                <i className="fas fa-angle-left fa-xs mr-1"></i>
                Previous
              </a>
            </MyLink>
          )}
          {step.idx <= 0 && <div></div>}

          {step.type !== 'summary' && (
            <MyLink
              href="/projects/[id]/configure/[step]"
              as={`/projects/${props.projectData.projectId}/configure/${
                props.currentItem + 1
              }`}
              prefetch={false}
              shallow={true}
            >
              <a
                onClick={onSubmit}
                className="btn btn-primary btn-pill transition-3d-hover pull-right"
              >
                Next
              </a>
            </MyLink>
          )}
        </div>
      </div>
    </>
  );
};

export default DynamicConfigForm;
