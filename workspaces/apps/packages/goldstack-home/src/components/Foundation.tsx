import React from 'react';
import GoldDiamondIcon from './../icons/gold-diamond.svg';
import styles from './Foundation.module.css';

interface Feature {
  title: string;
  icon: any;
  highlight?: boolean;
}

interface FoundationProps {
  heading: string;
  features: Feature[];
}

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
                <span
                  className={styles.featureTitle}
                  style={{
                    fontWeight: feature.highlight ? 'bold' : 'normal',
                  }}
                >
                  {feature.title} {feature.highlight && <img src={GoldDiamondIcon}></img>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Foundation;
