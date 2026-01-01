import GoldDiamondIcon from './../icons/gold-diamond.svg';
import styles from './Foundation.module.css';

interface Feature {
  title: string;
  icon: string;
  highlight?: boolean;
}

interface FoundationProps {
  heading: string;
  features: Feature[];
}

const Foundation = (props: FoundationProps): JSX.Element => {
  return (
    <div className="card h-100 transition-3d-hover">
      <div className="card-body">
        <h3 className="mb-3">{props.heading}</h3>
        {props.features.map((feature) => (
          <div className="media align-items-center mb-3" key={feature.title}>
            <figure className="w-100 max-w-5rem mr-3">
              <img className="img-fluid" src={feature.icon} alt="" />
            </figure>
            <div className="media-body">
              <span
                className={styles.featureTitle}
                style={{
                  fontWeight: feature.highlight ? 'bold' : 'normal',
                }}
              >
                {feature.title} {feature.highlight && <img src={GoldDiamondIcon} alt="" />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Foundation;
