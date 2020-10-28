import React, { useState } from 'react';

import { useRouter } from 'next/router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

import styled from 'styled-components';

import NextJsIcon from './../icons/nextjs.svg';
import NodeJsIcon from './../icons/nodejs.svg';
import LambdaIcon from './../icons/lambda.svg';
import BootstrapIcon from './../icons/bootstrap_large.svg';

import S3Icon from './../icons/s3.svg';

import CloudFrontIcon from './../icons/cloudfront.svg';

import PackageList, { PackageListItem } from './../components/PackageList';

import { buildProjectConfig } from './../lib/buildProject';

import { getEndpoint } from '@goldstack/goldstack-api';

import Progress from './Progress';
import { event } from './../lib/ga';

import styles from './BuildProject.module.css';

const getPackageItems = (): PackageListItem[] => {
  return [
    {
      packageName: 'NextJs',
      packageId: 'template:app-nextjs',
      packageDescription: (
        <>
          <p>
            Rapidly develop React applications deployed to AWS CloudFront CDN
          </p>
        </>
      ),
      icons: [NextJsIcon],
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }],
    },
    {
      packageName: 'Lambda + Express',
      packageId: 'template:lambda-express',
      packageDescription: 'Scaleable and extensible backend based on Express',
      icons: [LambdaIcon, NodeJsIcon],
      alwaysIncluded: false,
      features: [
        { name: 'Packed with Webpack' },
        { name: 'API Gateway' },
        { name: 'Helmet' },
      ],
    },
    {
      packageName: 'S3',
      packageId: 'template:s3',
      packageDescription: 'Store and manage files in AWS S3',
      icons: [S3Icon],
      alwaysIncluded: false,
      features: [{ name: 'TypeScript API' }],
    },
    {
      packageName: 'NextJs + Bootstrap',
      packageId: 'template:app-nextjs-bootstrap',
      packageDescription:
        'NextJS wired to work with Bootstrap and be deployed to CloudFront CDN',
      icons: [NextJsIcon, BootstrapIcon],
      alwaysIncluded: false,
      features: [
        { name: 'S3 + CloudFront CDN' },
        { name: 'SASS' },
        { name: 'SVG Icons' },
      ],
    },
    {
      packageName: 'Static Website',
      packageId: 'template:static-website-aws',
      packageDescription: 'Deploy static files to a CloudFront CDN',
      icons: [CloudFrontIcon],
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }],
    },
  ];
};

const ConfigureProjectButton = styled.button`
  &:hover {
    background-color: #0069d9;
  }
`;

export const BuildProject = (): JSX.Element => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [progressMessage, setProgressMessage] = useState('');
  const router = useRouter();

  const clickConfigure = async (): Promise<void> => {
    event({
      action: 'start_configuration',
      category: 'projects',
      label: '',
      value: 0,
    });
    const projectConfig = buildProjectConfig(selectedPackages);
    setProgressMessage('Creating temporary session ...');
    const sessionRes = await fetch(`${getEndpoint()}/sessions`, {
      method: 'POST',
      credentials: 'include',
    });
    if (sessionRes.status !== 200) {
      throw new Error('Cannot create session');
    }
    setProgressMessage('Creating project ...');
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
    const projectId = (await projectRes.json()).projectId;
    router.push(`/projects/${projectId}/configure/1`);
  };

  return (
    <>
      <Row>
        <PackageList
          items={getPackageItems()}
          onSelect={(selectedIds): void => {
            setSelectedPackages(selectedIds);
          }}
        ></PackageList>
      </Row>
      <Row className="space-top-2 space-bottom-2">
        <Col xs={4}></Col>
        <Col xs={4} className="text-center">
          <ConfigureProjectButton
            disabled={progressMessage !== ''}
            onClick={clickConfigure}
            type="button"
            className="btn btn-primary btn-lg transition-3d-hover"
          >
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
              hidden={!progressMessage}
              className={styles.spinner}
            ></Spinner>{' '}
            Configure Project 🛠️
          </ConfigureProjectButton>
        </Col>
        <Col xs={4}>
          <Progress progressMessage={progressMessage}></Progress>
        </Col>
      </Row>
    </>
  );
};

export default BuildProject;
