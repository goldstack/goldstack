import Head from 'next/head';
import { useRouter } from 'next/router';
import { type ReactNode } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Footer from 'src/components/Footer';
import styled from 'styled-components';
import BuildProject from './../components/BuildProject';
import Header from './../components/Header';
import AWSIcon from './../icons/aws.svg';
import DockerIcon from './../icons/docker.svg';
import ESLintIcon from './../icons/eslint.svg';
import JestIcon from './../icons/jestjs.svg';
import SecurityIcon from './../icons/security.svg';
import TerraformIcon from './../icons/terraform.svg';
import TypeScriptIcon from './../icons/typescript.svg';
import VSCodeIcon from './../icons/vscode.svg';
import YarnIcon from './../icons/yarn.svg';
import { getPackageIds } from './../lib/stackParamUtils';

interface HeadingProps {
  caption: string;
  learnMoreLink: string;
}

const BasicsTitle = styled.span`
  // margin-top: 0.28rem;
`;
const BasicsImg = styled.img`
  width: 28px;
  height: 28px;
`;
const Item = (props: {
  icon: string;
  index: number;
  children?: ReactNode;
  title?: string;
}): JSX.Element => {
  return (
    <div className="media align-items-center mb-3" key={props.index}>
      <figure className="w-100 max-w-5rem mr-3">
        <BasicsImg className="img-fluid" src={props.icon}></BasicsImg>
      </figure>
      <div className="media-body">
        <BasicsTitle>{props.title || props.children}</BasicsTitle>
      </div>
    </div>
  );
};

const Front = (): JSX.Element => {
  const router = useRouter();
  const elementsStr = (router.query.stack as string) || '';
  const elements = elementsStr.split(',');
  return (
    <>
      <Head>
        <title>Goldstack Builder</title>
      </Head>
      <Header></Header>
      <main id="content" role="main">
        <Container fluid className="">
          <Row>
            <Col md={9}>
              <Container fluid className="overflow-hidden p-6">
                <BuildProject selectedIds={getPackageIds(elements)}></BuildProject>
              </Container>
            </Col>
            <Col md={3} className="p-4 bg-light">
              <h4>How does this work?</h4>
              <p>
                Add the stack building blocks you need. Then configure some basics such as which
                domain(s) your project should be deployed to.
              </p>
              <p>
                We then put together a downloadable archive of a sleek project. Just extract it and
                start coding.
              </p>
              <p>
                We get all the following pesky details configured for you so you will be at peak
                productivity from the very beginning:
              </p>
              <Item icon={TypeScriptIcon} index={0}>
                Enjoy code completion and static type checking with TypeScript.
              </Item>
              <Item icon={ESLintIcon} index={0}>
                Format code automatically using ESLint and Prettier.
              </Item>
              <Item icon={JestIcon} index={0}>
                Run tests with no hassle using Jest.
              </Item>
              <Item icon={VSCodeIcon} index={0}>
                Get coding in minutes with Visual Studio Code.
              </Item>
              <Item icon={YarnIcon} index={0}>
                Build modular applications using Yarn workspaces.
              </Item>
              <Item icon={TerraformIcon} index={0}>
                Deploy infrastructure right away by using predefined Terraform for every module.
              </Item>
              <Item icon={AWSIcon} index={0}>
                Every module deploys as scaleable, low cost serverless infrastructure on AWS.
              </Item>
              <Item icon={DockerIcon} index={0}>
                Builds run locally or in your CI in Docker containers.
              </Item>
              <Item icon={SecurityIcon} index={0}>
                Extensive documentation on how to deploy all resources with enterprise level
                security.
              </Item>
              <p>
                Goldstack provides professional, battle tested, and frequently updated starter
                templates. Starting with a Goldstack template will save you tons of time. But
                likewise it is a huge committment from us to develop and maintain these templates;
                thus we charge a small fee that will unlock support and unlimited template downloads
                for a month. Thank you for your support 🙏
              </p>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer></Footer>
    </>
  );
};

export default Front;
