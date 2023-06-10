// utils
import { useRouter } from "next/router";

// components and styles
import Link from "next/link";
import styles from "./index.module.scss";

const Navigation = () => {
  const router = useRouter();

  return (
    <nav className={styles["navigation"]}>
      <ul className={styles["list"]}>
        <li className={styles["item"]}>
          <Link href="/">
            <a
              className={`
                  ${styles["link"]}
                  ${router.pathname === "/" ? styles["link-active"] : ""}
                `}
            >
              Gallery
            </a>
          </Link>
        </li>
        <li className={styles["item"]}>
          <Link href="/rovers">
            <a
              className={`
                  ${styles["link"]}
                  ${router.pathname === "/rovers" ? styles["link-active"] : ""}
                `}
            >
              Rovers
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
