import React, { useState } from 'react';

import { useRouter } from 'next/router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

import styled from 'styled-components';

import NextJsIcon from './../icons/nextjs.svg';
import NodeJsIcon from './../icons/nodejs.svg';
import LambdaIcon from './../icons/lambda.svg';
import SesIcon from './../icons/ses.svg';
import BootstrapIcon from './../icons/bootstrap_large.svg';

import S3Icon from './../icons/s3.svg';

import CloudFrontIcon from './../icons/cloudfront.svg';

import PackageList, { PackageListItem } from './../components/PackageList';

import { buildProjectConfig } from './../lib/buildProject';

import { getEndpoint } from '@goldstack/goldstack-api';

import Progress from './Progress';
import { event } from './../lib/ga';

import styles from './BuildProject.module.css';

const getPackageItems = (preferredElements: string[]): PackageListItem[] => {
  const baseList = [
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
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }],
    },
    {
      packageName: 'Lambda + Express',
      packageId: 'template:lambda-express',
      packageDescription: 'Scaleable and extensible backend based on Express',
      icons: [LambdaIcon, NodeJsIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'Packed with Webpack' },
        { name: 'API Gateway' },
        { name: 'Helmet' },
      ],
    },
    {
      packageName: 'NextJs + Bootstrap',
      packageId: 'template:app-nextjs-bootstrap',
      packageDescription:
        'NextJS wired to work with Bootstrap and be deployed to CloudFront CDN',
      icons: [NextJsIcon, BootstrapIcon],
      selected: false,
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
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }],
    },
    {
      packageName: 'S3',
      packageId: 'template:s3',
      packageDescription: 'Store and manage files in AWS S3',
      icons: [S3Icon],
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'TypeScript API' }],
    },
    {
      packageName: 'Email Send',
      packageId: 'template:email-send',
      packageDescription: 'Send emails through AWS SES',
      icons: [SesIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'DKIM and SPF' },
        { name: 'High volume sending' },
        { name: 'Extremely low costs' },
      ],
    },
  ];

  const headList = baseList
    .filter((pkg) => {
      return preferredElements.find(
        (el) => pkg.packageName.toLocaleLowerCase().indexOf(el) !== -1
      );
    })
    .map((el) => ({ ...el, selected: true }));

  const tailList = baseList.filter((pkg) => {
    return preferredElements.find(
      (el) => pkg.packageName.toLocaleLowerCase().indexOf(el) === -1
    );
  });

  return [...headList, ...tailList];
};

const ConfigureProjectButton = styled.button`
  &:hover {
    background-color: #0069d9;
  }
`;

interface BuildProjectParams {
  elements: string[];
}

export const BuildProject = (params: BuildProjectParams): JSX.Element => {
  const initSelected: string[] = [];
  const packages = getPackageItems(params.elements);
  packages
    .filter((el) => el.selected)
    .forEach((el) => {
      initSelected.push(el.packageId || 'error id not defined');
    });

  const [selectedPackages, setSelectedPackages] = useState<string[]>(
    initSelected
  );
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
          items={packages}
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
