import React from 'react';

import styles from './Panel.module.css';

export const Panel = (props): JSX.Element => {
  return <div className={styles['panel']}>In the panel</div>;
};

export default Panel;
