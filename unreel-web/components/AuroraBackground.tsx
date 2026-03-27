import React from 'react';
import styles from './AuroraBackground.module.css';

const AuroraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.auroraBg}>
        <div className={styles.auroraCircle1} />
        <div className={styles.auroraCircle2} />
        <div className={styles.auroraCircle3} />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default AuroraBackground;
