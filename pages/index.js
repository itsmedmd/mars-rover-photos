import { useEffect, useRef } from "react";
import Head from "next/head";
import styles from "styles/home.module.scss";
import imageStyles from "components/roverImage/rover-image.module.scss";
import { Layout, RoverImage } from "components";
import imagesLoaded from "imagesloaded";

export const getStaticProps = async () => {
  const fs = require("fs");
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];
  let data = []; // latest photos from all rovers
  let newestDate; // date of the most recent photo calculated from all rovers

  const writeToFile = (fileName, dataToWrite) => {
    // delete file before write because keeping the file causes
    // the content to be appended instead of overwritten
    fs.unlinkSync(fileName);
    fs.writeFile(
      fileName,
      JSON.stringify(dataToWrite),
      { flag: "a+" },
      (err) => {
        if (err) {
          console.error(`error writing to file ${fileName}`, err);
          return;
        }
        console.log(`success writing to file ${fileName}`);
      }
    );
  };

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

    // logging NASA API x-ratelimit-limit and x-ratelimit-remaining headers
    for (let pair of res.headers.entries()) {
      if (pair[0].includes("ratelimit")) {
        console.log(pair[0] + ": " + pair[1]);
      }
    }
  }

  if (!data) {
    return { notFound: true };
  }

  // format the date to have format of "YYYY-MM-DD"
  newestDate = newestDate.toISOString().split("T")[0];

  writeToFile("./data/images-data.json", data);
  writeToFile("./data/pages-count.json", { pageCount: data.length / 10 });

  data = data.slice(0, 10);

  return {
    props: { data, newestDate },
    revalidate: 3600,
  };
};

const Home = (props) => {
  const { data, newestDate } = props;
  const gridRef = useRef(null);

  const photosToRender = data.map((photo) => {
    const imageProps = {
      src: photo.img_src,
      layout: "fill",
      quality: "30",
      alt: `${photo.rover.name} Mars rover image with ${photo.camera.full_name} on ${photo.earth_date}`,
    };

    return (
      <RoverImage key={`${photo.rover.name}-${photo.id}`} props={imageProps} />
    );
  });

  useEffect(() => {
    const initMasonry = async () => {
      if (typeof window !== "undefined") {
        const { default: Masonry } = await import("masonry-layout");
        const { default: InfiniteScroll } = await import("infinite-scroll");
        const containerClass = "." + styles.gallery;
        const itemClass = "." + imageStyles.observer;

        const myMasonry = new Masonry(containerClass, {
          itemSelector: "none",
        });

        InfiniteScroll.imagesLoaded = imagesLoaded;

        imagesLoaded(containerClass, () => {
          console.log("images loaded!");
          const grid = document.querySelector(containerClass);

          myMasonry.options.itemSelector = itemClass;
          const items = grid.querySelectorAll(itemClass);
          myMasonry.appended(items);
        });

        const infScroll = new InfiniteScroll(containerClass, {
          path: function () {
            return `/page-${(this.loadCount + 1) * 10}`;
          },
          outlayer: myMasonry,
          append: itemClass,
          history: false,
        });
      }
    };

    initMasonry();
  }, []);

  console.log("rendering index.");
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
