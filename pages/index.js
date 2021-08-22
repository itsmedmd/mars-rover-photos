import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import imagesLoaded from "imagesloaded";
import { Layout, RoverImageGallery, PageLoader } from "components";
import toggleGalleryLoader from "scripts/toggleGalleryLoader";

import styles from "styles/pages/home.module.scss";
import imageStyles from "components/roverImageGallery/rover-image-gallery.module.scss";

import { useSelector, useDispatch } from "react-redux";
import { activate, deactivate } from "myRedux/reducers/pageLoadingSlice";

export const getStaticProps = async () => {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const rovers = ["perseverance", "curiosity"];
  let newestDate;

  const writeToFile = (fileName, dataToWrite) => {
    fs.mkdir("./data", (error) => {
      if (error.code !== "EEXIST") console.log(error);
    });
    fs.writeFile(fileName, JSON.stringify(dataToWrite), (err) => {
      if (err) {
        console.error(`error writing to file ${fileName}`, err);
        return;
      }
    });
  };

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

  if (data.length === 0) {
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
  const [isGalleryInitialised, setIsGalleryInitialised] = useState(false);

  // infinite scroll status (loader) refs need to have their inline style
  // changed in order to show loader when prefilling the page
  const loaderContainerRef = useRef(null);
  const loaderTextRef = useRef(null);
  const endTextRef = useRef(null);

  const pagesPrefillingCount = useSelector((state) => state.pageLoading.value);
  const dispatch = useDispatch();

  useEffect(() => {
    // turn gallery loader on when prefilling the page
    if (
      loaderContainerRef?.current &&
      loaderTextRef?.current &&
      endTextRef?.current
    ) {
      if (pagesPrefillingCount >= 1) {
        toggleGalleryLoader(
          "on",
          loaderContainerRef.current,
          loaderTextRef.current,
          endTextRef.current
        );
      } else {
        toggleGalleryLoader(
          "off",
          loaderContainerRef.current,
          loaderTextRef.current,
          endTextRef.current
        );
      }
    }

    if (typeof window !== "undefined" && !isGalleryInitialised) {
      setIsGalleryInitialised(true); // init masonry and infiniteScroll once
      const masonryPromise = import("masonry-layout");
      const scrollPromise = import("infinite-scroll");
      const containerClass = "." + imageStyles["gallery"];
      const itemClass = "." + imageStyles["gallery__image-container"];
      const grid = document.querySelector(containerClass);

      // initialise Masonry and InfiniteScroll after initial page images load
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
            status: "." + styles["home__page-load-status"],
            history: false,
            prefill: true,
            scrollThreshold: 800,
          });

          infScroll.on("request", () => {
            if (infScroll.isPrefilling) {
              // enable gallery loading animation if gallery is prefilling
              dispatch(activate());
            }
          });

          // relay the masonry every time a new image is loaded and skip
          // relaying when "progress" is fired on already rendered images
          infScroll.on("append", (response, path, items) => {
            if (!infScroll.isPrefilling) {
              // disable gallery loading animation if gallery is no longer prefilling
              dispatch(deactivate());
            }

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
  }, [
    photosPerPage,
    loaderContainerRef,
    loaderTextRef,
    endTextRef,
    pagesPrefillingCount,
    dispatch,
    isGalleryInitialised,
  ]);

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos</title>
      </Head>

      <PageLoader isActive={isLoading} />
      <p className={styles["home__newest-image-date"]}>
        Most recent image received at {newestDate}.
      </p>

      <RoverImageGallery photosArray={data} />

      <div
        ref={loaderContainerRef}
        className={styles["home__page-load-status"]}
      >
        <p ref={loaderTextRef} className="infinite-scroll-request">
          Loading
          <span className={styles["home__loading-dot"]}>.</span>
          <span className={styles["home__loading-dot"]}>.</span>
          <span className={styles["home__loading-dot"]}>.</span>
        </p>
        <p
          ref={endTextRef}
          className="infinite-scroll-last infinite-scroll-error"
        >
          End of content
        </p>
      </div>
    </Layout>
  );
};

export default Home;
