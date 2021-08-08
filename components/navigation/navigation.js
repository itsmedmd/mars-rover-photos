import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./navigation.module.scss";

export const Navigation = () => {
  const [isHomeCurrentPage, setIsHomeCurrentPage] = useState(true);

  useEffect(() => {
    if (window.location.pathname === "/rovers") {
      setIsHomeCurrentPage(false);
    } else if (window.location.pathname === "/") {
      setIsHomeCurrentPage(true);
    } else {
      setIsHomeCurrentPage(null);
    }
  }, []);

  return (
    <nav className={styles["navigation"]}>
      <Link href="/">
        <a
          className={`${styles["navigation__item"]} ${
            isHomeCurrentPage ? styles["navigation__item--current"] : ""
          }`}
        >
          Photos
        </a>
      </Link>
      <Link href="/rovers">
        <a
          className={`${styles["navigation__item"]} ${
            isHomeCurrentPage === false
              ? styles["navigation__item--current"]
              : ""
          }`}
        >
          Rovers
        </a>
      </Link>
    </nav>
  );
};
