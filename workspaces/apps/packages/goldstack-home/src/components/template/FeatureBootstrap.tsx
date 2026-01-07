const FeatureBootstrap = (): React.ReactNode => {
  return (
    <div className="card bg-navy mb-5 w-md-80 w-lg-50 mx-md-auto text-left">
      <div className="card-body text-monospace font-size-1 p-6">
        <div className="mb-3">
          <span className="d-block text-white-70">{"import React from 'react';"}</span>
          <span className="d-block text-white-70">
            {"import Container from 'react-bootstrap/Container';"}
          </span>
          <span className="d-block text-white-70">{"import Row from 'react-bootstrap/Row';"}</span>
          <span className="d-block text-white-70">{"import Col from 'react-bootstrap/Col';"}</span>
        </div>
        <div className="mb-3">
          <span className="d-block text-white-70">...</span>
        </div>
        <div className="mb-0">
          <span className="d-block text-white-70">{'return (<Container>'}</span>
          <span className="d-block text-white-70 ml-2">{'<Row>'}</span>
          <span className="d-block text-white-70 ml-4">{'<Col>'}</span>
          <span className="d-block text-white-70 ml-6">{'...'}</span>
          <span className="d-block text-white-70 ml-4">{'</Col>'}</span>
          <span className="d-block text-white-70 ml-2">{'</Row>'}</span>
          <span className="d-block text-white-70">{'</Container>);'}</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureBootstrap;
