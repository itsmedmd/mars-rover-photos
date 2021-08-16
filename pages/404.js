import Link from "next/link";
import styles from "styles/pages/404.module.scss";

const NotFound = () => {
  return (
    <div className={styles["not-found"]}>
      <h1 className={styles["not-found__heading"]}>
        This page does not exist.
      </h1>
      <Link href="/">
        <a className={styles["not-found__link"]}>Go to home page</a>
      </Link>
    </div>
  );
};

export default NotFound;
