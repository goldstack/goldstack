import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import useSWR, { mutate } from 'swr';

import Header from 'src/components/Header';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

import ConfigureNavigate from 'src/components/ConfigureNavigate';
import DynamicConfigForm from 'src/components/DynamicConfigForm';

import type { ProjectData } from '@goldstack/project-repository';

import { getEndpoint } from '@goldstack/goldstack-api';

import { getConfigureSteps } from 'src/lib/getConfigureSteps';
import { wireProjectData } from 'src/lib/wireProjectData';

const fetcher = (url: string): any =>
  fetch(url, {
    credentials: 'include',
  }).then((r) => r.json());

const updateProject = async (projectData: ProjectData): Promise<ProjectData> => {
  const projectRes = await fetch(`${getEndpoint()}/projects/${projectData.projectId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(projectData),
  });
  if (projectRes.status !== 200) {
    throw new Error('Cannot update project');
  }
  return projectData;
};

const ConfigureProject = (): JSX.Element => {
  const router = useRouter();
  const { id, step, packageId } = router.query;
  // when page changes, trigger save to backend

  if (!id || !step || !packageId) {
    return (
      <>
        <Header></Header>
      </>
    );
  }

  const { data, error } = useSWR(`${getEndpoint()}/projects/${id}`, fetcher, {
    focusThrottleInterval: 5000,
    // we more or less never want the ui to fetch new versions
    dedupingInterval: 100000,
  });
  const { data: docsData, error: docsError } = useSWR(
    `${getEndpoint()}/projects/${id}/docs?doc=template-configure`,
    fetcher,
    {
      dedupingInterval: 100000,
    },
  );
  useEffect(() => {
    if (data) {
      // trigger async remote save
      mutate(`${getEndpoint()}/projects/${id}`, data, false);
      mutate(`${getEndpoint()}/projects/${id}`, updateProject(data));
    }
  }, [step]);
  if (error) {
    console.error('Cannot load project data');
    console.error(error);
    return (
      <>
        <Header></Header>
        <p>Unexpected error when loading project data.</p>
      </>
    );
  }
  if (docsError) {
    console.error('Cannot load template documentation');
    console.error(docsError);
  }
  if (!data) {
    return (
      <>
        <Header></Header>
        <div className="container space-4">
          <div className="w-md-80 w-lg-50 text-center mx-md-auto">
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
            <p className="pt-3">Loading project configuration ...</p>
          </div>
        </div>
      </>
    );
  }

  const projectData: ProjectData = wireProjectData(data);
  const configureSteps = getConfigureSteps({ ...data, docs: docsData });
  const onChange = (newData: ProjectData): void => {
    // local save
    mutate(`${getEndpoint()}/projects/${id}`, newData, false);
  };
  const onStepSubmit = async (data: ProjectData): Promise<void> => {
    // await updateProject(data);
    // mutate(`${process.env.API_URL}projects/${id}`);
  };

  return (
    <>
      <Header></Header>
      <main id="content" role="main">
        <Container className="space-1 space-md-2">
          <Row>
            <Col xs={8}>
              <div className="js-validate">
                <div className="border-bottom pb-7 mb-7">
                  <div className="row">
                    <div className="col">
                      <DynamicConfigForm
                        currentItem={
                          Array.isArray(step) ? parseInt(step[0]) : parseInt(step as string)
                        }
                        projectData={projectData}
                        packageId={packageId.toString()}
                        configureSteps={configureSteps}
                        onChange={onChange}
                        onStepSubmit={onStepSubmit}
                      ></DynamicConfigForm>
                    </div>

                    <div className="w-100"></div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={4}>
              <div className="pl-lg-4">
                <div className="card shadow-soft p-4 mb-4">
                  <div className="border-bottom pb-4 mb-4">
                    <h2 className="h3 mb-0">Configure Project</h2>
                  </div>
                  <div className="border-bottom pb-4 mb-4">
                    <ConfigureNavigate
                      configureSteps={configureSteps}
                      currentItem={
                        Array.isArray(step) ? parseInt(step[0]) : parseInt(step as string)
                      }
                    ></ConfigureNavigate>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};
export default ConfigureProject;
