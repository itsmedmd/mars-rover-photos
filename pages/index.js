import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.scss";
import { Layout } from "../components";

export const getStaticProps = async () => {
  const query = `https://api.nasa.gov/mars-photos/api/v1/rovers/perseverance/latest_photos?api_key=${process.env.NASA_API_KEY}`;
  const res = await fetch(query);
  const data = await res.json();

  // logging NASA API x-ratelimit-limit and x-ratelimit-remaining headers
  for (let pair of res.headers.entries()) {
    if (pair[0].includes("ratelimit")) {
      console.log(pair[0] + ": " + pair[1]);
    }
  }

  if (!data) {
    return { notFound: true };
  }

  const marsPhotos = [...data.latest_photos];
  return {
    props: { marsPhotos },
    revalidate: 600,
  };
};

const Home = (props) => {
  const { marsPhotos } = props;

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>
      <div className={styles.content}>
        <h1>Most recent image received at {marsPhotos[0].earth_date}</h1>
        {marsPhotos.map((photo) => (
          <div
            className={styles["image-container"]}
            key={`${photo.rover.name}-${photo.id}`}
          >
            <Image
              src={photo.img_src}
              layout="fill"
              quality="60"
              placeholder="blur"
              blurDataURL={photo.img_src}
              className={styles.image}
              alt={`${photo.rover.name} Mars rover image with ${photo.camera.full_name} on ${photo.earth_date}`}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
