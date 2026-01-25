import React, { useState, useEffect } from 'react';
import ReactIcon from './../src/icons/react.svg';
import RocketLaunchImg from './../src/img/rocket-launch.jpg';
import styles from './index.module.css';

const FetchedContent = (): React.ReactNode => {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Cannot load data</div>;
  }

  if (loading) {
    return <div>Loading ...</div>;
  }

  return <div>{data && <div>Data: {`${data.title}`}</div>}</div>;
};

const HomePage = (): React.ReactNode => {
  const [displayData, setDisplayData] = useState(false);

  const toggleData = (): void => {
    setDisplayData(!displayData);
  };

  return (
    <>
      <h1 className={styles.title}>Welcome to Next.js</h1>
      <p>
        <img src={ReactIcon || 'dummy'} width="60"></img>
      </p>
      <p>Goldstack deployment: {process.env.GOLDSTACK_DEPLOYMENT}</p>
      <button onClick={toggleData}>Toggle Data Display</button>
      {displayData && <FetchedContent />}
      <p>
        <img src={RocketLaunchImg || 'dummy'} width="800"></img>
      </p>
    </>
  );
};

export default HomePage;
