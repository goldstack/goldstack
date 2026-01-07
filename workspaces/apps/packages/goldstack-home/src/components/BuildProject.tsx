import { getEndpoint } from '@goldstack/goldstack-api';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import styled from 'styled-components';
import PackageList from './../components/PackageList';
import { buildProjectConfig } from './../lib/buildProject';
import { event } from './../lib/ga';
import { getTemplateData } from './../lib/templateData';
import styles from './BuildProject.module.css';

import NoModulesAddedModal from './NoModulesAddedModal';
import Progress from './Progress';

const ConfigureProjectButton = styled.button`
  &:hover {
    background-color: #0069d9;
  }
`;

interface BuildProjectParams {
  selectedIds: string[];
}

export const BuildProject = (params: BuildProjectParams): React.ReactNode => {
  const packages = getTemplateData(params.selectedIds);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  useEffect(() => {
    const initSelected: string[] = [];
    packages
      .filter((el) => el.selected)
      .forEach((el) => {
        initSelected.push(el.packageId || 'error id not defined');
      });
    setSelectedPackages(initSelected);
  }, [packages]);
  const [progressMessage, setProgressMessage] = useState('');
  const router = useRouter();

  const doConfigure = async (overrideWarning: boolean): Promise<void> => {
    if (!overrideWarning) {
      // show a warning modal if user has not selected any packages
      if (selectedPackages.length === 0) {
        setShowWarningModal(true);
        return;
      }
    }
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

  const clickConfigure = async (): Promise<void> => {
    doConfigure(false);
  };

  const proceedAfterWarning = async (): Promise<void> => {
    setShowWarningModal(false);
    doConfigure(true);
  };

  return (
    <>
      <Row>
        <PackageList
          selectedPackages={selectedPackages}
          items={packages}
          disabled={progressMessage !== ''}
          onDeselect={(packageId): void => {
            setSelectedPackages(selectedPackages.filter((el) => el !== packageId));
          }}
          onSelect={(packageId): void => {
            setSelectedPackages([...selectedPackages.filter((el) => el !== packageId), packageId]);
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

export default BuildProject;
