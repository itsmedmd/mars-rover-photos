import styles from "./rover-manifest.module.scss";

export const RoverManifest = ({
  name,
  status,
  launch_date,
  landing_date,
  total_photos,
}) => {
  return (
    <div className={styles["rover"]}>
      <h2 className={styles["rover__name"]}>
        {name}
        <p
          className={`
                    ${styles["rover__status"]}
                    ${
                      status === "active"
                        ? styles["rover__status--active"]
                        : styles["rover__status--inactive"]
                    }
                `}
        >
          {status}
        </p>
      </h2>
      <div className={styles["rover__data"]}>
        <div className={styles["rover__data-column"]}>
          <p className={styles["rover__data-text"]}>Launch date:</p>
          <p className={styles["rover__data-text"]}>Landing date:</p>
          <p className={styles["rover__data-text"]}>Total photos:</p>
        </div>

        <div className={styles["rover__data-column"]}>
          <p className={styles["rover__data-text"]}>{launch_date}</p>
          <p className={styles["rover__data-text"]}>{landing_date}</p>
          <p className={styles["rover__data-text"]}>{total_photos}</p>
        </div>
      </div>
    </div>
  );
};
