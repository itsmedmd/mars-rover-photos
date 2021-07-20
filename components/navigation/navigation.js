import Link from "next/link";
import styles from "./navigation.module.scss";

export const Navigation = () => {
  return (
    <nav className={styles["navigation"]}>
      <Link href="/">
        <a>Photos</a>
      </Link>
      <Link href="/rovers">
        <a>Rovers</a>
      </Link>
    </nav>
  );
};
