import { useState, useEffect } from "react";
import styles from "./page-loader.module.scss";

export const PageLoader = ({ isActive }) => {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timeout;
    if (!isActive) {
      timeout = setTimeout(() => setIsFinished(true), 1500);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return (
    <div
      className={`
            ${styles["loader"]}
            ${!isActive && styles["loader--invisible"]}
            ${isFinished && styles["loader--finished"]}
        `}
    >
      <div className={styles["loader__spinner"]}></div>
      <div className={styles["loader__spinner"]}></div>
      <div className={styles["loader__spinner"]}></div>
      <div className={styles["loader__spinner"]}></div>
    </div>
  );
};
