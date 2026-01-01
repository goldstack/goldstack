import type { MoreDetails } from '@goldstack/template-metadata';
import AngleRight from './../icons/font-awesome/solid/angle-right.svg';
import { dataUriToSrc } from './../utils/utils';
import styles from './LearnMore.module.css';

export const LeftArrow = (): JSX.Element => {
  const angleRight = dataUriToSrc(AngleRight);
  return (
    <span className={styles['angle-right']} dangerouslySetInnerHTML={{ __html: angleRight }}></span>
  );
};

const LearnMore = (props: MoreDetails): JSX.Element => {
  return (
    <div className="text-center mb-7 mt-5">
      <p>
        {props.description} <span></span>
        {props.link && (
          <a className="font-weight-bold" href={props.link}>
            Learn more
            <LeftArrow />
          </a>
        )}
      </p>
    </div>
  );
};

export default LearnMore;
