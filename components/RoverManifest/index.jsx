import styles from "./index.module.scss";

const RoverManifest = ({
  name,
  status,
  launch_date,
  landing_date,
  total_photos,
}) => {
  return (
    <div className={styles["rover"]}>
      <h2 className={styles["name"]}>
        {name}
        <p
          className={`
            ${styles["status"]}
            ${status === "active" ? styles["active"] : styles["inactive"]}
          `}
        >
          {status}
        </p>
      </h2>
      <div className={styles["data"]}>
        <div className={styles["data-column"]}>
          <p className={styles["data-text"]}>Launch date:</p>
          <p className={styles["data-text"]}>Landing date:</p>
          <p className={styles["data-text"]}>Total photos:</p>
        </div>

        <div className={styles["data-column"]}>
          <p className={styles["data-text"]}>{launch_date}</p>
          <p className={styles["data-text"]}>{landing_date}</p>
          <p className={styles["data-text"]}>{total_photos}</p>
        </div>
      </div>
    </div>
  );
};

export default RoverManifest;
