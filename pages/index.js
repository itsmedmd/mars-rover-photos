import Head from "next/head";
import styles from "../styles/home.module.scss";

export default function Home() {
  return (
    <div className={styles.home}>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>
      <main className={styles.main}></main>
    </div>
  );
}
