import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./navigation.module.scss";

export const Navigation = () => {
  const router = useRouter();
  const [isHomeCurrentPage, setIsHomeCurrentPage] = useState(true);

  useEffect(() => {
    if (router.pathname === "/rovers") {
      setIsHomeCurrentPage(false);
    } else if (router.pathname === "/") {
      setIsHomeCurrentPage(true);
    } else {
      setIsHomeCurrentPage(null);
    }
  }, [router.pathname]);

  return (
    <nav className={styles["navigation"]}>
      <Link href="/">
        <a
          className={`
            ${styles["navigation__item"]}
            ${isHomeCurrentPage ? styles["navigation__item--current"] : ""}
          `}
        >
          Photos
        </a>
      </Link>
      <Link href="/rovers">
        <a
          className={`
          ${styles["navigation__item"]}
          ${
            isHomeCurrentPage === false
              ? styles["navigation__item--current"]
              : ""
          }
        `}
        >
          Rovers
        </a>
      </Link>
    </nav>
  );
};
