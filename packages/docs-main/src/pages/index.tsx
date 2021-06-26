import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from 'src/components/Header';

const HomePage = (): JSX.Element => {
  return (
    <>
      <Header></Header>
      <Container>
        <Row>
          <Col className="space-3">
            <a href="/docs">Open Goldstack Documentation</a>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage;
