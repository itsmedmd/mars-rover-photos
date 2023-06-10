import styles from "./index.module.scss";
import Navigation from "@/components/Navigation";

const Layout = ({ hideOverflow, withBackgroundImg, children }) => {
  return (
    <div
      className={`
        ${styles["layout"]}
        ${withBackgroundImg ? styles["with-background-img"] : ""}
      `}
    >
      <Navigation />

      <main className={`
        ${styles["main"]}
        ${hideOverflow ? styles["hidden-overflow"]: ""}
      `}
      >
        { children }
      </main>
    </div>
  );
};

export default Layout;
