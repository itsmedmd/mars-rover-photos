import Link from "next/link";
import styles from "./navigation.module.scss";

export const Navigation = () => {
  return (
    <nav className={styles["navigation"]}>
      <Link href="/">
        <a className={styles["navigation__item"]}>Photos</a>
      </Link>
      <Link href="/rovers">
        <a className={styles["navigation__item"]}>Rovers</a>
      </Link>
    </nav>
  );
};
