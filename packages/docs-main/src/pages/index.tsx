import React, { useState } from 'react';

import styled from 'styled-components';
import useSWR from 'swr';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const fetcher = (url: string): any => fetch(url).then((r) => r.json());

const FetchedContent = (): JSX.Element => {
  const { data, error } = useSWR(
    'https://jsonplaceholder.typicode.com/todos/1',
    fetcher
  );

  if (error) {
    return <p>Cannot load data</p>;
  }

  if (!data) {
    return <p>Loading ...</p>;
  }

  return <>{data && <p>Data: {'' + data.title}</p>}</>;
};

const StyledH1 = styled.h1`
  font-size: 50px;
  color: ${({ theme }): string => theme.colors.title};
`;

const HomePage = (): JSX.Element => {
  const [displayData, setDisplayData] = useState(false);

  const toggleData = (): void => {
    setDisplayData(!displayData);
  };

  return (
    <Container>
      <Row>
        <Col>
          <StyledH1>Next.js React Bootstrap</StyledH1>
          <p>Welcome to Next.js with Bootstrap!</p>
          <p>{/* <img src={BootstrapIcon} /> */}</p>
          <Button onClick={toggleData}>Toggle Data Display</Button>
          {displayData && <FetchedContent />}
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
