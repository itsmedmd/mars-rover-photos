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
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: "eu-central-1",
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com",
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const rovers = ["perseverance", "curiosity"];

  const promises_latest = rovers.map(
    (rover) =>
      new Promise((resolve, reject) => {
        fetch(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => resolve(data))
          .catch((err) => {
            console.error(err);
            resolve([]);
          });
      })
  );

  const promises = [];
  const sol_limits = [207, 3242];

  // create promises for all 4 requests (2 to latest_photos and 2 for fallback photos) and run them asynchronously
  rovers.forEach((rover, id) => {
    // get photos from the most recent Mars sol where photos are available
    promises.push(
      new Promise((resolve, reject) => {
        fetch(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => resolve(data))
          .catch((err) => {
            console.error(err);
            resolve([]);
          });
      })
    );

    // get photos from a random Mars sol in case latest_photos returns very few photos
    const sol_number = Math.floor(Math.random() * sol_limits[id] + 5);
    promises.push(
      new Promise((resolve, reject) => {
        fetch(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${process.env.NASA_API_KEY}&sol=${sol_number}`
        )
          .then((res) => res.json())
          .then((data) => resolve(data))
          .catch((err) => {
            console.error(err);
            resolve([]);
          });
      })
    );
  });

  const responses = await Promise.all(promises);

  let data = [];
  // add only the latest photos to data array
  responses.forEach((res) => {
    if (res?.latest_photos) {
      data = data.concat(res.latest_photos);
    }
  });

  // add fallback photos after the latest photos
  responses.forEach((res) => {
    if (res?.photos) {
      data = data.concat(res.photos);
    }
  });

  if (data.length === 0) {
    return { notFound: true };
  }

  // getting a maximum of 26 pages of data (25 + index page)
  data = data.slice(0, photosPerPage * 26);

  const updateImageData = (itemsArray) => {
    // updating database with new data
    for (let i = photosPerPage; i < itemsArray.length; i += photosPerPage) {
      const params = {
        TableName: "images",
        Key: { img: `page-${i}` },
        UpdateExpression: "set imgData = :d",
        ExpressionAttributeValues: {
          ":d": JSON.stringify(itemsArray.slice(i, i + photosPerPage)),
        },
      };

      dynamoDB.update(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        }
      });
    }

    // deleting entries from the database if
    // new data does not exist for those pages
    const pageCount = itemsArray.length / photosPerPage;
    for (
      let i = photosPerPage * pageCount;
      i < photosPerPage * 26;
      i += photosPerPage
    ) {
      const params = {
        TableName: "images",
        Key: { img: `page-${i}` },
      };

      dynamoDB.delete(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to delete item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        }
      });
    }
  };

  updateImageData(data);

  // create image data set for the first (index) page
  data = data.slice(0, photosPerPage);

  return {
    props: { data, photosPerPage },
    revalidate: 10800,
  };
};

const Home = ({ data, photosPerPage }) => {
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
    // loading an image with AJAX that has a srcset attribute on it
    // breaks how the image is displayed in IOS devices, hence this fix
    const reloadImageSrcset = (item) => {
      const image = item.querySelectorAll("img[srcset]")[0];
      image.outerHTML = image.outerHTML;
    };

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

      // initialise Masonry and InfiniteScroll after initial page images load
      imagesLoaded(containerClass, () => {
        Promise.all([masonryPromise, scrollPromise]).then((values) => {
          setIsLoading(false);
          const { default: Masonry } = values[0];
          const { default: InfiniteScroll } = values[1];

          // initialise Masonry on the gallery
          const myMasonry = new Masonry(containerClass, {
            itemSelector: itemClass,
            percentPosition: true,
          });

          // add ImagesLoaded to InfiniteScroll (needed for "outlayer" option)
          InfiniteScroll.imagesLoaded = imagesLoaded;

          // initialise InfiniteScroll on the gallery
          const infScroll = new InfiniteScroll(containerClass, {
            path: function () {
              return `/page-${(this.loadCount + 1) * photosPerPage}`;
            },
            outlayer: myMasonry,
            append: itemClass,
            status: "." + styles["home__page-load-status"],
            history: false,
            prefill: true,
            scrollThreshold: 1000,
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
              // disable gallery loading animation if the gallery is no longer prefilling
              dispatch(deactivate());
            }

            // fix for IOS devices not rendering images set with srcset attribute
            const userAgent = navigator.userAgent;
            const chromeAgent = userAgent.indexOf("Chrome") > -1;
            let safariAgent = userAgent.indexOf("Safari") > -1;

            // Discard Safari since it also matches Chrome
            if (chromeAgent && safariAgent) {
              safariAgent = false;
            }

            const isApple =
              (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ||
              safariAgent;

            if (isApple) {
              items.forEach((item) => reloadImageSrcset(item));
            }

            const pageNumber = path.split("page-")[1];
            let progressCounter = 0;

            imagesLoaded(containerClass).on("progress", () => {
              if (progressCounter++ >= pageNumber || isApple) {
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
      <h1 className={styles["home__page-header"]}>
        Explore Mars with the most recent images from NASA&apos;s rovers!
      </h1>

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
          End of content, come back later for more photos!
        </p>
      </div>
    </Layout>
  );
};

export default Home;
