import { useEffect, useState } from "react";
import Head from "next/head";
import imagesLoaded from "imagesloaded";
import { Layout, RoverImageGallery, PageLoader } from "components";
import styles from "styles/home.module.scss";
import imageStyles from "components/roverImageGallery/rover-image-gallery.module.scss";

export const getStaticProps = async () => {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const rovers = ["perseverance", "curiosity"];
  let newestDate;

  const writeToFile = (fileName, dataToWrite) => {
    fs.writeFile(fileName, JSON.stringify(dataToWrite), (err) => {
      if (err) {
        console.error(`error writing to file ${fileName}`, err);
        return;
      }
    });
  };

  console.time("photos fetch");
  const promises = rovers.map(
    (rover) =>
      new Promise((resolve, reject) => {
        fetch(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data?.latest_photos[0]?.earth_date) {
              const newDate = new Date(data.latest_photos[0].earth_date);
              if (!newestDate || newDate.getTime() > newestDate.getTime()) {
                newestDate = newDate;
              }
            }
            resolve(data);
          });
      })
  );

  const responses = await Promise.all(promises);
  let data = [];
  responses.forEach((res) => (data = data.concat(res.latest_photos)));
  console.timeEnd("photos fetch");

  if (!data) {
    return { notFound: true };
  }

  data = data.slice(0, 180);
  writeToFile("./data/images-data.json", data);

  // create image data set for the first (index) page
  data = data.slice(0, photosPerPage);

  // format the date to have a format of "YYYY-MM-DD"
  newestDate = newestDate.toISOString().split("T")[0];

  return {
    props: { data, newestDate, photosPerPage },
    revalidate: 10800,
  };
};

const Home = (props) => {
  const { data, newestDate, photosPerPage } = props;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const masonryPromise = import("masonry-layout");
      const scrollPromise = import("infinite-scroll");
      const containerClass = "." + styles["gallery"];
      const itemClass = "." + imageStyles["image-container"];
      const grid = document.querySelector(containerClass);

      // initialise Masonry and InfiniteScroll after index page images load
      imagesLoaded(grid, () => {
        Promise.all([masonryPromise, scrollPromise]).then((values) => {
          setIsLoading(false);
          const { default: Masonry } = values[0];
          const { default: InfiniteScroll } = values[1];

          // initialise Masonry on the grid
          const myMasonry = new Masonry(grid, {
            itemSelector: itemClass,
            percentPosition: true,
          });

          // add ImagesLoaded to InfiniteScroll (needed for "outlayer" option)
          InfiniteScroll.imagesLoaded = imagesLoaded;

          // initialise InfiniteScroll on the grid
          const infScroll = new InfiniteScroll(grid, {
            path: function () {
              return `/page-${(this.loadCount + 1) * photosPerPage}`;
            },
            outlayer: myMasonry,
            append: itemClass,
            status: "." + styles["page-load-status"],
            history: false,
            prefill: true,
            scrollThreshold: 800,
          });

          // relay the masonry every time a new image is loaded and skip
          // relaying when "progress" is fired on already rendered images
          infScroll.on("append", (response, path, items) => {
            const pageNumber = path.split("page-")[1];
            let progressCounter = 0;

            imagesLoaded(grid).on("progress", () => {
              if (progressCounter++ >= pageNumber) {
                myMasonry.layout();
              }
            });
          });
        });
      });
    }
  }, [photosPerPage]);

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>

      <PageLoader isActive={isLoading} />
      <p className={styles["newest-image-date"]}>
        Most recent image received at {newestDate}.
      </p>

      <RoverImageGallery photosArray={data} />

      <div className={styles["page-load-status"]}>
        <p className="infinite-scroll-request">Loading...</p>
        <p className="infinite-scroll-last">End of content</p>
        <p className="infinite-scroll-error">No more pages to load</p>
      </div>
    </Layout>
  );
};

export default Home;
