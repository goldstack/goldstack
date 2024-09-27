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

import NextjsIcon from './../icons/nextjs.svg';
import BootstrapIcon from './../icons/bootstrap.svg';
import CloudFrontIcon from './../icons/cloudfront.svg';
import ExpressIcon from './../icons/nodejs.svg';
import ReactIcon from './../icons/reactjs.svg';
import GatewayIcon from './../icons/aws-api-gateway.svg';
import S3Icon from './../icons/s3.svg';
import SESIcon from './../icons/ses.svg';
interface CheckboxProps {
  title: string;
  className?: string;
  element: string;
  icon: any;
  templateLink?: string;
  isAlpha?: boolean;
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
            <img
              style={{ width: '1.5em', marginRight: '0.5em' }}
              src={props.icon}
            ></img>
            {props.title}

            {props.isAlpha && (
              <>
                {' '}
                <span className="badge badge-pill badge-secondary">Alpha</span>
              </>
            )}

            {props.templateLink && (
              <a
                href={props.templateLink}
                className="font-size-1"
                style={{ marginLeft: '0.5em' }}
                target="_blank"
                rel="noreferrer"
              >
                more information
              </a>
            )}
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
    router.push(`/projects/${projectId}/packages/${packageId}/get-template`);
  };

  const clickConfigure = () => {
    doConfigure(false);
  };

  return (
    <>
      <Container className="space-2">
        <div className="w-md-80 w-lg-40 mx-md-auto mb-5 mb-md-9">
          <h4>Select templates to include in project:</h4>
        </div>
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <div className="card shadow-soft">
              <div className="card-body space-1 ">
                <div className="border-bottom mb-4">
                  <div className="border-bottom pb-2 mb-4">
                    <h2 className="h3 mb-0">Fullstack</h2>
                  </div>
                  <Checkbox
                    title="React Server-Side Rendering (SSR)"
                    element="server-side-rendering"
                    disabled={building}
                    icon={ReactIcon}
                    templateLink={'/templates/server-side-rendering'}
                    checked={elements.indexOf('server-side-rendering') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Hetzner VPS"
                    element="hetzner-vps"
                    disabled={building}
                    icon={'https://cdn.goldstack.party/img/202409/hetzner.svg'}
                    templateLink={'/templates/hetzner-vps'}
                    checked={elements.indexOf('hetzner-vps') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <div className="border-bottom pb-2 mb-4">
                    <h2 className="h3 mb-0">UI</h2>
                  </div>
                  <Checkbox
                    title="Next.js 13"
                    element="nextjs"
                    icon={NextjsIcon}
                    disabled={building}
                    templateLink={'/templates/nextjs'}
                    checked={elements.indexOf('nextjs') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Next.js 13 + Bootstrap"
                    icon={BootstrapIcon}
                    element="bootstrap"
                    disabled={building}
                    templateLink={'/templates/nextjs-bootstrap'}
                    checked={elements.indexOf('bootstrap') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Static Website"
                    element="static-website"
                    icon={CloudFrontIcon}
                    templateLink={'/templates/static-website'}
                    disabled={building}
                    checked={elements.indexOf('static-website') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>

                  <div className="border-bottom pb-2 mb-4 mt-6">
                    <h2 className="h3 mb-0">Backend</h2>
                  </div>
                  <Checkbox
                    title="Serverless API"
                    element="serverless-api"
                    disabled={building}
                    icon={GatewayIcon}
                    templateLink={'/templates/serverless-api'}
                    checked={elements.indexOf('serverless-api') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Lambda + Express.js"
                    element="express"
                    disabled={building}
                    icon={ExpressIcon}
                    templateLink={'/templates/express-lambda'}
                    checked={elements.indexOf('express') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Lambda + Go Gin"
                    element="gin"
                    disabled={building}
                    icon="https://cdn.goldstack.party/img/202104/go_gin.png"
                    isAlpha={true}
                    templateLink={'/templates/go-gin'}
                    checked={elements.indexOf('gin') !== -1}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <div className="border-bottom pb-2 mb-4 mt-6">
                    <h2 className="h3 mb-0">Services</h2>
                  </div>
                  <Checkbox
                    title="User Management"
                    element="user-management"
                    disabled={building}
                    icon={'https://cdn.goldstack.party/img/202212/cognito.svg'}
                    checked={elements.indexOf('user-management') !== -1}
                    templateLink={'/templates/user-management'}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="DynamoDB"
                    element="dynamodb"
                    disabled={building}
                    icon={'https://cdn.goldstack.party/img/202205/dynamodb.svg'}
                    checked={elements.indexOf('dynamodb') !== -1}
                    templateLink={'/templates/dynamodb'}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="S3"
                    element="s3"
                    disabled={building}
                    icon={S3Icon}
                    checked={elements.indexOf('s3') !== -1}
                    templateLink={'/templates/s3'}
                    onChange={checkboxChange}
                  ></Checkbox>
                  <Checkbox
                    title="Email"
                    element="email-send"
                    icon={SESIcon}
                    disabled={building}
                    checked={elements.indexOf('email-send') !== -1}
                    templateLink={'/templates/ses'}
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
        <meta
          property="og:title"
          content="Compose a JavaScript Starter Project from Templates"
          key="title"
        />
        <meta
          name="description"
          content="Build a JavaScript Project from our templates such as Next.js + Bootstrap, Express.js, Serverless AWS Lambda API and others."
        />
        <meta
          property="og:description"
          content="Build a JavaScript Project from our templates such as Next.js + Bootstrap, Express.js, Serverless AWS Lambda API and others."
        />
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
