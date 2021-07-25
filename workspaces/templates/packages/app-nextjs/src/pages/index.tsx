import React, { useState } from 'react';
import useSWR from 'swr';

import styles from './index.module.css';

import ReactIcon from './../icons/react.svg';
import RocketLaunchImg from './../img/rocket-launch.jpg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): any => fetch(url).then((r) => r.json());

const FetchedContent = (): JSX.Element => {
  const { data, error } = useSWR(
    'https://jsonplaceholder.typicode.com/todos/1',
    fetcher
  );

  if (error) {
    return <div>Cannot load data</div>;
  }

  if (!data) {
    return <div>Loading ...</div>;
  }

  return <div>{data && <div>Data: {'' + data.title}</div>}</div>;
};

const HomePage = (): JSX.Element => {
  const [displayData, setDisplayData] = useState(false);

  const toggleData = (): void => {
    setDisplayData(!displayData);
  };

  return (
    <>
      <h1 className={styles.title}>Welcome to Next.js!</h1>
      <p>
        <img src={ReactIcon} width="60"></img>
      </p>
      <p>Goldstack deployment: {process.env.GOLDSTACK_DEPLOYMENT}</p>
      <button onClick={toggleData}>Toggle Data Display</button>
      {displayData && <FetchedContent />}
      <p>
        <img src={RocketLaunchImg} width="800"></img>
      </p>
    </>
  );
};

export default HomePage;
