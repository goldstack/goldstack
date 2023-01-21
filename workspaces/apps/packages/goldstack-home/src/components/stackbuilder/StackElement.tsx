import React from 'react';

import Image from './../../img/ses_email_send.png';

import styles from './StackElement.module.css';

const StackElement = (): JSX.Element => {
  return (
    <div className={`card ${styles['element-card']}`}>
      <div className={styles['element-card-head']}>
        <button type="button" className={'btn btn-outline-success btn-xs '}>
          &lt; Add to stack
        </button>
        <h4 className={styles['element-card-title']}>Next.js UI</h4>
        <button type="button" className={'btn btn-outline-danger btn-xs '}>
          Remove from stack &gt;
        </button>
      </div>
      <div className={styles['element-card-body']}>
        <div className={`${styles['left-image-col']}`}>
          <img
            className={styles['left-image']}
            src={Image}
            alt="Card image cap"
          ></img>
        </div>
        <div className={styles['element-card-content']}>
          <p>Fast loading websites and dynamic web applications.</p>
        </div>
      </div>
    </div>
  );
};

export default StackElement;
