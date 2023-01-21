import React from 'react';
import Head from 'next/head';
import Header from 'src/components/Header';
import AssembleStack from '../components/stackbuilder/AssembleStack';

const Index = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Goldstack - Project Builder</title>
      </Head>
      <Header></Header>
      <div className="container space-1 space-bottom-lg-1">
        <p>
          Project builder for fullstack serverless applications on AWS using
          TypeScript.
        </p>
      </div>
      <div className="container">
        <h2>Assemble Stack</h2>
        <AssembleStack></AssembleStack>
      </div>
    </>
  );
};

export default Index;
