import { useEffect } from "react";
import Head from "next/head";
import styles from "styles/home.module.scss";
import imageStyles from "components/roverImage/rover-image.module.scss";
import { Layout, RoverImage } from "components";
//import Masonry from "masonry-layout";

export const getStaticProps = async () => {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];

  let data = []; // latest photos from all rovers
  let newestDate; // date of the most recent photo calculated from all rovers

  for (let rover of rovers) {
    //`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
    // fetch rover photos and add it to the array
    const res = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${process.env.NASA_API_KEY}&sol=1000`
    );
    const newData = await res.json();
    data = data.concat(newData.photos);

    // find if there is a more recent photo from the new set of data
    if (newData?.photos[0]?.earth_date) {
      const newDate = new Date(newData.photos[0].earth_date);
      if (!newestDate || newDate.getTime() > newestDate.getTime()) {
        newestDate = newDate;
      }
    }
  }

  if (!data) {
    return { notFound: true };
  }

  // format the date to have format of "YYYY-MM-DD"
  newestDate = newestDate.toISOString().split("T")[0];

  return {
    props: { data, newestDate },
    revalidate: 3600,
  };
};

const Home = (props) => {
  const { data, newestDate } = props;

  const photosToRender = data.map((photo) => {
    const imageProps = {
      src: photo.img_src,
      layout: "fill",
      quality: "90",
      alt: `${photo.rover.name} Mars rover image with ${photo.camera.full_name} on ${photo.earth_date}`,
    };

    return (
      <RoverImage
        rootMargin="0px 0px 2000px 0px"
        key={`${photo.rover.name}-${photo.id}`}
        props={imageProps}
      />
    );
  });

  useEffect(() => {
    const initMasonry = async () => {
      if (typeof window !== "undefined") {
        const { default: Masonry } = await import("masonry-layout");

        const myMasonry = new Masonry("." + styles.gallery, {
          itemSelector: "." + imageStyles.observer,
          columnWidth: 500,
        });
      }
    };

    initMasonry();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>
      <h1 className={styles.text}>
        Displaying photos of the most recent Sol (day on Mars).
      </h1>
      <h2 className={styles.text}>
        Most recent image received at {newestDate}.
      </h2>
      <div className={styles.gallery}>{photosToRender}</div>
    </Layout>
  );
};

export default Home;
