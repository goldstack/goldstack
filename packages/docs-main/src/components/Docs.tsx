import React from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import Header from 'src/components/Header';

import Navigation from './Navigation';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import sitemap from './../data/docs/sitemap.json';

import { Heading } from '@goldstack/toc-generator';
import styles from './Docs.module.css';

import Toc from './Toc';
interface DocsProps {
  contentHtml?: string;
  title?: string;
  toc: Heading[];
}

const Docs = (props: DocsProps): JSX.Element => {
  const { query } = useRouter();

  const path = query.slug ? (query.slug as string[]).join('/') : '/';
  const content = props.contentHtml || '';

  return (
    <>
      <Head>
        <title>{props.title ? props.title : 'Goldstack Documentation'}</title>
      </Head>
      <Header></Header>
      <main className="container-fluid space-top-3 space-top-md-2 pl-lg-7 pr-xl-7">
        <div className="row justify-content-lg-end space-bottom-3">
          <nav className="mt-2 col-lg-3 col-xl-2 hs-sidebar navbar-expand-lg px-0 ml-xl-7">
            <div className="collapse navbar-collapse" id="sidebar-nav">
              <Navigation
                items={sitemap[0].children}
                currentPath={path}
              ></Navigation>
            </div>
          </nav>
          <div className="col-lg-6">
            {props.title && <h1>{props.title}</h1>}
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              id="doc-content"
            ></div>
          </div>
          <div className="col-lg-3">
            <Toc headings={props.toc}></Toc>
          </div>
        </div>
        <Row>
          <Col className="text-center">
            © {new Date().getFullYear()} Pureleap Pty. Ltd. and Contributors
          </Col>
        </Row>
      </main>
    </>
  );
};

export default Docs;
