import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from './../components/Header';
import Footer from './../components/Footer';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { event } from './../lib/ga';
import NoModulesAddedModal from './../components/NoModulesAddedModal';

import { ProjectData } from '@goldstack/project-repository';
import { getPackageIds } from './../lib/stackParamUtils';

import { buildProjectConfig } from './../lib/buildProject';

import { getEndpoint } from '@goldstack/goldstack-api';
import { PackageConfig } from '@goldstack/project-config';

interface CheckboxProps {
  title: string;
  className?: string;
  element: string;
  disabled: boolean;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = (props: CheckboxProps): JSX.Element => {
  return (
    <>
      <div className={`form-group ${props.className || ''}`}>
        <div className="custom-control custom-checkbox">
          <input
            type="checkbox"
            id={props.element}
            disabled={props.disabled}
            className="custom-control-input"
            checked={props.checked || false}
            onChange={props.onChange}
          ></input>
          <label className="custom-control-label" htmlFor={props.element}>
            {props.title}
          </label>
        </div>
      </div>
    </>
  );
};

const ProgressIndicator = (props: { message: string }): JSX.Element => {
  return (
    <>
      <div style={{ display: 'inline-block' }}>
        <div
          className="spinner-border ml-4"
          role="status"
          style={{ display: 'inline-block' }}
        >
          <span className="sr-only">Progress indicator</span>
        </div>
        <div className="ml-2" style={{ display: 'inline-block' }}>
          {props.message}
        </div>
      </div>
    </>
  );
};

const ModuleSelection = (props: { elements: string[] }) => {
  const [elements, setElements] = useState(props.elements);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [building, setBuilding] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setElements(props.elements);
  }, [props.elements]);

  const proceedAfterWarning = async (): Promise<void> => {
    setShowWarningModal(false);
    doConfigure(true);
  };
  // NextJs must always be selected when bootstrap is selected
  if (
    elements.indexOf('bootstrap') !== -1 &&
    elements.indexOf('nextjs') === -1
  ) {
    elements.push('nextjs');
    setElements([...elements]);
  }

  const checkboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (elements.indexOf(event.target.id) === -1) {
        elements.push(event.target.id);
      }
      setElements([...elements]);
    } else {
      const idx = elements.indexOf(event.target.id);
      if (idx !== -1) {
        elements.splice(idx, 1);
        setElements([...elements]);
      }
    }
  };

  const doConfigure = async (ignoreNoModulesSelected: boolean) => {
    const selectedElements = [...elements];
    // allow either nextjs or nextjs and bootstrap
    if (
      selectedElements.indexOf('bootstrap') !== -1 &&
      selectedElements.indexOf('nextjs') !== -1
    ) {
      const idx = selectedElements.indexOf('nextjs');
      selectedElements.splice(idx, 1);
    }
    const packageIds = getPackageIds(selectedElements);
    if (!ignoreNoModulesSelected) {
      if (packageIds.length === 0) {
        setShowWarningModal(true);
        return;
      }
    }
    setProgressMessage('Creating session');
    setBuilding(true);
    event({
      action: 'start_building',
      category: 'projects',
      label: '',
      value: 0,
    });

    const projectConfig = buildProjectConfig(packageIds);

    const sessionRes = await fetch(`${getEndpoint()}/sessions`, {
      method: 'POST',
      credentials: 'include',
    });
    if (sessionRes.status !== 200) {
      throw new Error('Cannot create session');
    }
    setProgressMessage('Building project');
    const projectRes = await fetch(`${getEndpoint()}/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(projectConfig),
    });
    if (projectRes.status !== 200) {
      throw new Error('Cannot create project');
    }
    const projectData: ProjectData = await projectRes.json();
    const projectId = projectData.projectId;
    setProgressMessage('Creating download bundle');

    const packageRes = await fetch(
      `${getEndpoint()}/projects/${projectId}/packages`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(projectData),
      }
    );

    const packageId = (await packageRes.json()).packageId;
    router.push(`/projects/${projectId}/packages/${packageId}/pricing-options`);
    // const projectId = (await projectRes.json()).projectId;
    // router.push(`/projects/${projectId}/configure/1`);
  };

  const clickConfigure = () => {
    doConfigure(false);
  };

  return (
    <>
      <Container className="space-2">
        <div className="w-md-80 w-lg-40 text-center mx-md-auto mb-5 mb-md-9">
          <h2>Select the modules you need</h2>
        </div>
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <div className="card shadow-soft">
              <div className="card-body space-1 ">
                <div className="border-bottom mb-4">
                  <div className="border-bottom pb-2 mb-4">
                    <h2 className="h3 mb-0">UI</h2>
                  </div>
                  <Checkbox
                    title="NextJs"
                    element="nextjs"
                    disabled={building}
                    checked={elements.indexOf('nextjs') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="With Bootstrap"
                    element="bootstrap"
                    disabled={building}
                    className="ml-4"
                    checked={
                      elements.indexOf('nextjs') !== -1 &&
                      elements.indexOf('bootstrap') !== -1
                    }
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Static Website"
                    element="static-website"
                    disabled={building}
                    checked={elements.indexOf('static-website') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>

                  <div className="border-bottom pb-2 mb-4 mt-6">
                    <h2 className="h3 mb-0">Backend</h2>
                  </div>
                  <Checkbox
                    title="Lambda with Express Server"
                    element="express"
                    disabled={building}
                    checked={elements.indexOf('express') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>

                  <div className="border-bottom pb-2 mb-4 mt-6">
                    <h2 className="h3 mb-0">Services</h2>
                  </div>
                  <Checkbox
                    title="S3"
                    element="s3"
                    disabled={building}
                    checked={elements.indexOf('s3') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Email"
                    element="email-send"
                    disabled={building}
                    checked={elements.indexOf('email-send') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                </div>
                <Button
                  className="btn btn-primary btn transition-3d-hover"
                  disabled={building}
                  onClick={clickConfigure}
                >
                  🛠 Build Project
                </Button>
                {building && (
                  <ProgressIndicator
                    message={progressMessage}
                  ></ProgressIndicator>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <NoModulesAddedModal
        handleProceed={proceedAfterWarning}
        show={showWarningModal}
        handleAddModules={(): void => {
          setShowWarningModal(false);
        }}
      ></NoModulesAddedModal>
    </>
  );
};

const Build = (): JSX.Element => {
  const router = useRouter();
  const elementsStr = (router.query.stack as string) || '';

  return (
    <>
      <Head>
        <title>Goldstack Project Builder</title>
      </Head>

      <Header></Header>
      <main id="content" role="main">
        <ModuleSelection elements={elementsStr.split(',')}></ModuleSelection>
      </main>
      <Footer></Footer>
    </>
  );
};

export default Build;
