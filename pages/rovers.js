// utils
import Head from "next/head";

// components and styles
import Layout from "@/components/Layout";
import RoverManifest from "@/components/RoverManifest";
import styles from "@/styles/pages/rovers.module.scss";

export const getStaticProps = async () => {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];

  // Get latest data for each rover
  const promises = rovers.map(
    (rover) =>
      new Promise((resolve) => {
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
    props: {
      // Use only required data
      data: data.map((rover) => ({
        max_date: rover.max_date,
        launch_date: rover.launch_date,
        landing_date: rover.landing_date,
        total_photos: rover.total_photos,
        name: rover.name,
        status: rover.status,
      }))
    },
    revalidate: 3 * 60 * 60, // 3 hours in seconds
  };
};

const Rovers = ({ data }) => {
  // sort array descending by newest photo date
  data.sort((a, b) => {
    return new Date(b.max_date) - new Date(a.max_date);
  });

  return (
    <Layout withBackgroundImg={true}>
      <Head>
        <title>Mars rovers</title>
      </Head>

      <div className={styles["content"]}>
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
