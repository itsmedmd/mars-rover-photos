import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.scss";
import { Layout } from "../components";

export const getStaticProps = async () => {
  const probe = require("probe-image-size");
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

  /*
      cameras object is used to GREATLY REDUCE the time it takes to
      get width and height properties for each image
      
      example cameras object looks like this:

      {
        Perseverance:
        {
          NAVCAM_LEFT:
          {
            width: 1200,
            height: 901
          },
          OTHER_CAMERA:
          {
            ...
          }
        },
        Curiosity:
        {
          ...
        }
      }
  */
  const cameras = {};
  const marsPhotos = [...data.latest_photos];
  console.log("total images: ", marsPhotos.length);

  // getting width and height values for each image
  for (let i = 0; i < marsPhotos.length; i++) {
    let roverName = marsPhotos[i].rover.name;
    let camName = marsPhotos[i].camera.name;
    let imgCam =
      cameras[roverName] && cameras[roverName][camName]
        ? cameras[roverName][camName]
        : undefined;

    if (imgCam) {
      // if there is data about camera image size properties, use it
      marsPhotos[i].width = imgCam.width;
      marsPhotos[i].height = imgCam.height;
    } else {
      // else probe the image url for camera image size properties
      console.log("making a new request id: ", i);
      const probeData = await probe(marsPhotos[i].img_src);
      marsPhotos[i].width = probeData.width;
      marsPhotos[i].height = probeData.height;

      // initialise data object for camera image size properties
      if (cameras[roverName]) {
        cameras[roverName][camName] = {};
      } else {
        cameras[roverName] = {};
        cameras[roverName][camName] = {};
      }

      // add image size properties to the object
      cameras[roverName][camName].width = probeData.width;
      cameras[roverName][camName].height = probeData.height;
    }
  }

  console.log("all cameras:", cameras);

  return {
    props: { marsPhotos },
    revalidate: 600,
  };
};

const Home = (props) => {
  const { marsPhotos } = props;
  console.log(marsPhotos[0]);

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>
      <div className={styles.content}>
        <h1>Most recent image received at {marsPhotos[0].earth_date}</h1>
        {marsPhotos.slice(0, 5).map((photo) => (
          <div className={styles.image} key={`${photo.rover.name}-${photo.id}`}>
            <Image
              src={photo.img_src}
              width={photo.width}
              height={photo.height}
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
