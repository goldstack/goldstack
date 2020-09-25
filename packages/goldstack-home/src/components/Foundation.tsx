import React from 'react';
import styled from 'styled-components';

interface Feature {
  title: string;
  icon: any;
}

interface FoundationProps {
  heading: string;
  features: Feature[];
}

const FeatureTitle = styled.span`
  margin-top: 0.35rem;
`;

const Foundation = (props: FoundationProps): JSX.Element => {
  return (
    <>
      <div className="card h-100 transition-3d-hover">
        <div className="card-body">
          <h3 className="mb-3">{props.heading}</h3>
          {props.features.map((feature, index) => (
            <div className="media align-items-center mb-3" key={index}>
              <figure className="w-100 max-w-5rem mr-3">
                <img className="img-fluid" src={feature.icon}></img>
              </figure>
              <div className="media-body">
                <FeatureTitle>{feature.title}</FeatureTitle>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Foundation;
