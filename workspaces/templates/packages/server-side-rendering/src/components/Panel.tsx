import React from 'react';
import styles from './Panel.module.css';

const panelClass = styles.panel;

export const Panel = (_props): React.ReactNode => {
  return <div className={`ml-20 ${panelClass}`}>In the panel</div>;
};

export default Panel;
