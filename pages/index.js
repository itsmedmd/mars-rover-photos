import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.scss";
import { Layout } from "../components";

export const getStaticProps = async () => {
  const query = `https://api.nasa.gov/mars-photos/api/v1/rovers/perseverance/latest_photos?api_key=${process.env.NASA_API_KEY}`;
  const res = await fetch(query);

  // logging headers
  for (var pair of res.headers.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  const data = await res.json();

  if (!data) {
    return { notFound: true };
  }

  return { props: { data } };
};

const Home = (props) => {
  console.log(props);
  const { data: roverData } = props;

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>
      <div className={styles.content}>
        {roverData.latest_photos.slice(0, 5).map((photo) => (
          <div className={styles.image} key={`${photo.rover.name}-${photo.id}`}>
            <Image
              src={photo.img_src}
              width="1440"
              height="960"
              alt={`${photo.rover.name} Mars rover image with ${photo.camera.full_name} on ${photo.earth_date}`}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;

/*
  import { useState, useEffect } from "react";

  const [rover, setRover] = useState("");
  const [querySubmit, setQuerySubmit] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setQuerySubmit(true);
  };

  const handleRoverChange = (e) => {
    setRover(e.target.value);
  };

useEffect(() => {
  if (querySubmit && rover) {
    fetch(query)
    .then(res => {
      if (res.status === 200) {
        console.log(res);
      } else {
        console.error("The response did not return status of 200.");
      }
      setRover("");
      setQuerySubmit(false);
    })
    .catch(err => {
      console.error("An error occurred while trying to send the request.", err);
      setRover("");
      setQuerySubmit(false);
    });
  }
}, [querySubmit, rover]);

      <form method="post" onSubmit={handleFormSubmit}>
        <label htmlFor="rovers">Choose a rover: </label>
        <select name="rovers" id="rovers" value={rover} onChange={handleRoverChange}>
          <option value="perseverance">Perseverance</option>
          <option value="curiosity">Curiosity</option>
          <option value="opportunity">Opportunity</option>
          <option value="spirit">Spirit</option>
        </select>
        <br/>
        <button>Send request</button>
      </form>
*/
