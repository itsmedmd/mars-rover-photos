import Head from "next/head";
import Image from "next/image";
import styles from "styles/rovers.module.scss";
import { Layout } from "components";

export const getStaticProps = async () => {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];
  let data = []; // latest photos from all rovers

  for (let rover of rovers) {
    // fetch rover manifest data and add it to the array
    const res = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.NASA_API_KEY}`
    );
    const newData = await res.json();
    data = data.concat(newData.photo_manifest);

    // logging NASA API remaining requests count
    // (each request has 1 hour delay until it can be used again)
    for (let pair of res.headers.entries()) {
      if (pair[0] === "x-ratelimit-remaining") {
        console.log(pair[0] + ": " + pair[1]);
      }
    }
  }

  if (!data) {
    return { notFound: true };
  }

  return {
    props: { data },
    revalidate: 86400,
  };
};

const Rovers = (props) => {
  const { data } = props;

  // sort array descending by newest photo date
  data.sort((a, b) => {
    return new Date(b.max_date) - new Date(a.max_date);
  });

  const roversToRender = data.map((rover) => (
    <div key={`${rover.name}-manifest`}>
      <h2>{rover.name}</h2>
      <p>Status: {rover.status}</p>
      <p>Launch date: {rover.launch_date}</p>
      <p>Landing date: {rover.landing_date}</p>
      <p>Total photos: {rover.total_photos}</p>
      <p>Most recent photo taken at {rover.max_date}</p>
    </div>
  ));

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos - Rovers</title>
      </Head>
      <h1>Rovers!</h1>
      <div>{roversToRender}</div>
    </Layout>
  );
};

export default Rovers;
