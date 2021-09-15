import Head from "next/head";
import styles from "styles/pages/rovers.module.scss";
import { Layout, RoverManifest } from "components";

export const getStaticProps = async () => {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];

  const promises = rovers.map(
    (rover) =>
      new Promise((resolve, reject) => {
        fetch(
          `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.NASA_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => resolve(data.photo_manifest));
      })
  );

  const data = await Promise.all(promises);

  if (!data) {
    return { notFound: true };
  }

  return {
    props: { data },
    revalidate: 10800,
  };
};

const Rovers = ({ data }) => {
  // sort array descending by newest photo date
  data.sort((a, b) => {
    return new Date(b.max_date) - new Date(a.max_date);
  });

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos - Rovers</title>
      </Head>

      <div className={styles["rovers__background"]}></div>

      <div className={styles["rovers__content"]}>
        {data.map((rover) => (
          <RoverManifest
            key={`${rover.name}-manifest`}
            name={rover.name}
            status={rover.status}
            launch_date={rover.launch_date}
            landing_date={rover.landing_date}
            total_photos={rover.total_photos}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Rovers;
