import React from 'react';

import Image from './../../img/ses_email_send.png';

import styles from './StackElement.module.css';

const StackElement = (): JSX.Element => {
  return (
    <div className={`card ${styles['element-card']}`}>
      <div className={styles['element-card-head']}>
        <button
          type="button"
          className={`btn btn-outline-success btn-xs ${styles['element-button']} `}
        >
          &lt;
        </button>
        <button
          type="button"
          className={`btn btn-outline-danger btn-xs ${styles['element-button']} `}
        >
          -
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
          <h4>Next.js UI</h4>
          <p>Fast loading websites and dynamic web applications.</p>
        </div>
      </div>
    </div>
  );
};

export default StackElement;
