import Head from "next/head";
import Image from "next/image";
import styles from "../styles/rovers.module.scss";
import { Layout } from "../components";

const Home = () => {
  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos - Rovers</title>
      </Head>
      <div className={styles.content}></div>
    </Layout>
  );
};

export default Home;
