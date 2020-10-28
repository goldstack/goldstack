/* eslint-disable @typescript-eslint/camelcase */
import React, { useState } from 'react';

import { useRouter } from 'next/router';
import ProjectData from '@goldstack/project-repository/dist/types/ProjectData';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import assert from 'assert';
import styled from 'styled-components';

import { getEndpoint } from '@goldstack/goldstack-api';
import { validateProject, StepValidation } from './../lib/validateProject';

import * as Fullstory from '@fullstory/browser';
import Progress from './Progress';

import { event } from './../lib/ga';
import Spinner from 'react-bootstrap/Spinner';

const BuildProjectButton = styled.button`
  &:hover {
    background-color: #0069d9;
  }
`;

const ValidationResult = (props: { result: StepValidation }): JSX.Element => {
  return (
    <>
      <p>
        {props.result.valid ? '✔️' : '❌'} {props.result.stepName}
      </p>
    </>
  );
};

const buildPackage = async (data: ProjectData): Promise<any> => {
  const packageRes = await fetch(
    `${getEndpoint()}/projects/${data.projectId}/packages`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(data),
    }
  );
  if (packageRes.status !== 200) {
    throw new Error('Cannot build package for project');
  }
  return await packageRes.json();
};

const ProjectConfigSummary = (props: {
  projectData: ProjectData;
}): JSX.Element => {
  const [progressMessage, setProgressMessage] = useState<string | undefined>(
    undefined
  );
  const router = useRouter();
  const validationResult = validateProject(props.projectData);

  const allValid = !validationResult.find((result) => result.valid === false);

  const clickBuildProject = async (): Promise<void> => {
    try {
      event({
        action: 'begin_checkout',
        category: 'projects',
        label: '',
        value: 0,
      });
    } catch (e) {
      console.warn('Cannot log Google Analytics event begin_checkout');
      console.warn(e);
    }
    try {
      Fullstory.setUserVars({
        selectedTemplates_strs: props.projectData.packageConfigs.map(
          (config) => config.package.template
        ),
      });
    } catch (e) {
      console.warn(
        'Cannot set Fullstory custom env variables for build project.'
      );
      console.log(e);
    }

    setProgressMessage('Building project package ...');
    const { packageId } = await buildPackage(props.projectData);
    setProgressMessage('Done!');
    assert(packageId);
    router.push(
      `/projects/${props.projectData.projectId}/packages/${packageId}/pricing-options`
    );
  };

  return (
    <>
      {validationResult.map((result, idx) => (
        <ValidationResult result={result} key={idx}></ValidationResult>
      ))}
      {!allValid && (
        <p>
          Please complete the configuration for the steps marked with ❌ above.
        </p>
      )}

      {allValid && (
        <p>
          Click the button below to build the downloadable archive for your
          project.
        </p>
      )}
      <Row className="space-top-2 space-bottom-2">
        <Col xs={3}></Col>
        <Col xs={6} className="text-center">
          <BuildProjectButton
            disabled={!allValid || progressMessage !== undefined}
            onClick={clickBuildProject}
            type="button"
            className="btn btn-primary btn-lg transition-3d-hover"
          >
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
              hidden={!progressMessage}
            ></Spinner>{' '}
            Build Project 🛠️
          </BuildProjectButton>
        </Col>
        <Col xs={3}>
          <Progress progressMessage={progressMessage || ''}></Progress>
        </Col>
      </Row>
    </>
  );
};

export default ProjectConfigSummary;
