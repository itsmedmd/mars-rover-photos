import { useEffect } from "react";
import Head from "next/head";
import imagesLoaded from "imagesloaded";
import { Layout, RoverImageGallery } from "components";
import styles from "styles/home.module.scss";
import imageStyles from "components/roverImageGallery/rover-image-gallery.module.scss";

export const getStaticProps = async () => {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
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

  // format the date to have format of "YYYY-MM-DD"
  newestDate = newestDate.toISOString().split("T")[0];

  writeToFile("./data/images-data.json", data);
  writeToFile("./data/pages-count.json", {
    pageCount: data.length / photosPerPage,
  });

  console.log("page count:", data.length / photosPerPage);

  // create image data set for the first (index) page
  data = data.slice(0, photosPerPage);

  return {
    props: { data, newestDate, photosPerPage },
    revalidate: 3600,
  };
};

const Home = (props) => {
  const { data, newestDate, photosPerPage } = props;

  useEffect(() => {
    const initMasonry = async () => {
      if (typeof window !== "undefined") {
        // importing modules here because they
        // require window object for initialisation
        const { default: Masonry } = await import("masonry-layout");
        const { default: InfiniteScroll } = await import("infinite-scroll");

        const containerClass = "." + styles.gallery;
        const itemClass = "." + imageStyles["image-container"];
        const grid = document.querySelector(containerClass);

        // initialise Masonry and InfiniteScroll after initial images load
        imagesLoaded(grid, () => {
          console.log("initialising masonry and inf scroll");
          const myMasonry = new Masonry(grid, {
            itemSelector: itemClass,
            percentPosition: true,
          });

          // make ImagesLoaded available for InfiniteScroll
          // (needed for "outlayer" option)
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
            scrollThreshold: 100,
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
      }
    };
    initMasonry();
  }, [photosPerPage]);

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>

      <h1>Displaying photos of the most recent Sol (day on Mars).</h1>
      <h2>Most recent image received at {newestDate}.</h2>

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
