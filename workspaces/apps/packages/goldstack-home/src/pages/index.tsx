import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import TypeScriptIcon from './../icons/typescript.svg';
import ESLintIcon from './../icons/eslint.svg';
import TerraformIcon from './../icons/terraform.svg';
import AWSIcon from './../icons/aws.svg';
import YarnIcon from './../icons/yarn.svg';
import JestIcon from './../icons/jestjs.svg';
import VSCodeIcon from './../icons/vscode.svg';
import DockerIcon from './../icons/docker.svg';
import DocusaurusIcon from './../icons/docusaurus.svg';
import SecurityIcon from './../icons/security.svg';

import RelaxedCoder from './../illustrations/relaxing-man.svg';

import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from './../components/Header';

import { allTemplates } from '@goldstack/project-template-data';
import PackageList from './../components/PackageList';

import Foundation from './../components/Foundation';
import GoldstackProcess from './../components/GoldstackProcess';
import GoldstackBenefits from './../components/GoldstackBenefits';

import Footer from './../components/Footer';
import TemplateCallToAction from './../components/template/TemplateCallToAction';
import TemplateCard from './../components/template/TemplateCard';

const Front = (): JSX.Element => {
  const router = useRouter();
  const elementsStr = (router.query.stack as string) || '';
  const elements = elementsStr.split(',');
  return (
    <>
      <Head>
        <title>Goldstack - Starter Project Builder</title>
        <meta
          property="og:title"
          content="Goldstack - Starter Project Builder"
          key="title"
        />
        <meta
          name="description"
          content="Save tons of time with a starter project assembled by Goldstack."
        />
        <meta
          property="og:description"
          content="Save tons of time with a starter project assembled by Goldstack."
        />
      </Head>
      <Header></Header>
      <main id="content" role="main">
        <Container className="space-top-1 space-top-md-2">
          <div className="w-md-80 w-lg-40 text-center mx-md-auto mb-5 mb-md-9">
            <h2>Templates</h2>
          </div>
          <Row>
            {allTemplates().map((template, idx) => (
              <div className="col-md-4 mb-3" key={idx}>
                <TemplateCard template={template} />
              </div>
            ))}
          </Row>
          <Row className="align-items-lg-center">
            <div className="col-lg-5 mb-7 mb-lg-0">
              <div className="mb-4">
                <h1>First-Class Starter Projects</h1>
                <p>
                  Save tons of time by starting with a starter project assembled
                  by Goldstack.
                </p>
                <a
                  className="btn btn-primary btn-wide transition-3d-hover"
                  href="/build"
                >
                  ✔ Start Building Your Project Now
                </a>
              </div>
            </div>

            <div className="col-lg-7">
              <img
                className="img-fluid"
                src={RelaxedCoder}
                alt="Relaxing coder"
              />
            </div>
          </Row>
        </Container>
        <Container>
          <div className="container space-3 space-lg-3">
            <div className="w-md-80 w-lg-50 text-center mx-md-auto mb-5 mb-md-9">
              <h2>About</h2>
            </div>

            <div className="w-md-75 mx-md-auto">
              <div className="row">
                <div className="col-lg-6">
                  <p>
                    It often takes hours, if not days, to get the basic setup
                    for a new JavaScript/ TypeScript project working, especially
                    if you are aiming for something fancy such as a monorepo 😕.
                  </p>
                </div>

                <div className="col-lg-6">
                  <p>
                    Goldstack provides high-quality starter projects tailored to
                    your specific requirements using our
                    <em>starter project builder</em> 🛠️.{' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>

        <Container className="space-top-1 space-bottom-3 space-bottom-lg-3">
          <div className="w-md-80 w-lg-50 text-center mx-md-auto mb-5 mb-md-9">
            <h2>Solid Foundations for Every Project</h2>
          </div>
          <Row hidden>
            <Col xs={4}>
              <Foundation
                heading="Made for Joyful Development"
                features={[
                  {
                    icon: TypeScriptIcon,
                    title: 'TypeScript',
                    highlight: elements.includes('typescript'),
                  },
                  {
                    icon: YarnIcon,
                    title: 'Yarn Workspaces',
                    highlight: elements.includes('yarn'),
                  },
                  {
                    icon: ESLintIcon,
                    title: 'ESLint and Prettier',
                    highlight: elements.includes('eslint'),
                  },
                  {
                    icon: JestIcon,
                    title: 'Jest',
                    highlight: elements.includes('jest'),
                  },
                  {
                    icon: VSCodeIcon,
                    title: 'Visual Studio Code',
                    highlight: elements.includes('vscode'),
                  },
                ]}
              ></Foundation>
            </Col>
            <Col xs={4}>
              <Foundation
                heading="Infrastructure Ready to Go"
                features={[
                  {
                    icon: TerraformIcon,
                    title: 'Terraform',
                    highlight: elements.includes('terraform'),
                  },
                  {
                    icon: AWSIcon,
                    title: 'AWS',
                    highlight: elements.includes('aws'),
                  },
                  {
                    icon: DockerIcon,
                    title: 'Docker',
                    highlight: elements.includes('docker'),
                  },
                ]}
              ></Foundation>
            </Col>
            <Col xs={4}>
              <Foundation
                heading="Best-in-class Documentation"
                features={[
                  {
                    icon: DocusaurusIcon,
                    title: 'Tailored getting started guides',
                  },
                  {
                    icon: SecurityIcon,
                    title: 'Security Hardening',
                  },
                ]}
              ></Foundation>
            </Col>
          </Row>
          <Row>
            <PackageList
              onSelect={(): void => {
                // do nothing
              }}
              onDeselect={(): void => {
                // do nothing
              }}
              selectedPackages={[]}
              items={[
                {
                  packageName: 'Made for Joyful Development',
                  packageDescription: (
                    <>
                      {/* <p>Well-configured statically typed goodness</p> */}
                      <ul>
                        <li>TypeScript</li>
                        <li>Eslint and prettier</li>
                        <li>Jest</li>
                        <li>Yarn workspaces</li>
                        <li>VSCode config</li>
                      </ul>
                    </>
                  ),
                  icons: [TypeScriptIcon, YarnIcon],
                  selected: false,
                  alwaysIncluded: true,
                  features: [],
                },
                {
                  packageName: 'Infrastructure Ready to Go',
                  packageDescription: (
                    <>
                      {/* <p>Robust and nimble builds and infrastructre</p> */}
                      <ul>
                        <li>npm scripts for testing, build and deployment</li>
                        <li>
                          Terraform configuration, easy to adapt and extend
                        </li>
                        <li>
                          Scalable, low-cost serverless resources on the AWS
                          cloud
                        </li>
                        <li>Docker-based builds</li>
                      </ul>
                    </>
                  ),
                  icons: [TerraformIcon, AWSIcon, DockerIcon],
                  alwaysIncluded: true,
                  selected: false,
                  features: [],
                },
                {
                  packageName: 'Documentation',
                  packageDescription: (
                    <>
                      <p>Detailed docs to help you lift off</p>
                      <ul>
                        <li>Tailored getting started guides</li>
                        <li>Module reference</li>
                        <li>Deployment</li>
                        <li>Security harding</li>
                      </ul>
                    </>
                  ),
                  icons: [DocusaurusIcon],
                  alwaysIncluded: true,
                  selected: false,
                  features: [],
                },
              ]}
            ></PackageList>
          </Row>
        </Container>

        <Container className="space-bottom-3">
          <GoldstackProcess></GoldstackProcess>
        </Container>

        <Container>
          <GoldstackBenefits></GoldstackBenefits>
        </Container>

        <Container className="space-top-1 space-bottom-3  ">
          <TemplateCallToAction
            action={{
              link: '/build',
              title: '✔ Start Building Your Project Now',
            }}
          ></TemplateCallToAction>
        </Container>

        <Footer></Footer>
      </main>
    </>
  );
};

export default Front;
