import React, { useState } from 'react';

import useSWR from 'swr';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';

import BootstrapIcon from './../icons/bootstrap.svg';
import RocketLaunchImage from './../img/rocket-launch.jpg';

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

const HomePage = (): JSX.Element => {
  const [displayData, setDisplayData] = useState(false);

  const toggleData = (): void => {
    setDisplayData(!displayData);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Next.js React Bootstrap</h1>
          <p>Welcome to Next.js with Bootstrap!</p>
          <p>
            <img src={BootstrapIcon} />
          </p>
          <Button onClick={toggleData}>Toggle Data Display</Button>
          {displayData && <FetchedContent />}
          <p>
            <Image src={RocketLaunchImage} fluid rounded></Image>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
