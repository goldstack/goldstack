import React from 'react';

import styles from './Panel.module.css';

const panelClass = styles['panel'];

export const Panel = (props): JSX.Element => {
  return <div className={`ml-20 ${panelClass}`}>In the panel</div>;
};

export default Panel;
