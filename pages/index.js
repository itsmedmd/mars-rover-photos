// utils
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import imagesLoaded from "imagesloaded";
import { useSelector, useDispatch } from "react-redux";
import { activate, deactivate } from "@/store/reducers/pageLoadingSlice";
import toggleGalleryLoader from "@/utils/toggleGalleryLoader";
import isDeviceIOS from "@/utils/isDeviceIOS";

// components and styles
import Layout from "@/components/Layout";
import RoverImageGallery from "@/components/RoverImageGallery";
import PageLoader from "@/components/PageLoader";
import imageStyles from "@/components/RoverImageGallery/index.module.scss";
import styles from "@/styles/pages/mars.module.scss";

export const getStaticProps = async () => {
  // Setup config
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: "eu-central-1",
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const maxImagesCount = 3000;
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const pageCount = Math.floor(maxImagesCount / photosPerPage);
  const rovers = ["perseverance", "curiosity"];

  // Utility function
  const fetchUrl = (url) => {
    return new Promise((resolve) => {
      fetch(url)
        .then((res) => res.json())
        .then((data) => resolve(data))
        .catch((err) => {
          console.error(err);
          resolve([]);
        });
    });
  };

  // Create promises for all requests and run them asynchronously
  const promises = [];

  // Get photos from the most recent Mars sol (day) where photos are available for each rover
  rovers.forEach((rover) =>
    promises.push(
      fetchUrl(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
      )
    )
  );

  // Get more photos from rovers as a fallback from predetermined
  // Mars sols in case latest_photos returns very few photos
  const sols = [
    {
      sol: 811,
      rover: "perseverance"
    },
    {
      sol: 3846,
      rover: "curiosity"
    },
    {
      sol: 810,
      rover: "perseverance"
    },
    {
      sol: 3845,
      rover: "curiosity"
    },
    {
      sol: 806,
      rover: "perseverance"
    },
    {
      sol: 3844,
      rover: "curiosity"
    },
    {
      sol: 805,
      rover: "perseverance"
    },
    {
      sol: 3843,
      rover: "curiosity"
    },
  ];

  sols.forEach((sol) =>
    promises.push(
      fetchUrl(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/${sol.rover}/photos?api_key=${process.env.NASA_API_KEY}&sol=${sol.sol}`
      )
    )
  );

  const responses = await Promise.all(promises);

  let dataRovers = [];
  let dataFallback = [];

  responses.forEach((res) => {
    if (res?.latest_photos) {
      // add the latest photos to data array
      dataRovers = dataRovers.concat(res.latest_photos);
    } else if (res?.photos) {
      // add fallback photos after the latest photos
      dataFallback = dataFallback.concat(res.photos);
    }
  });

  let data = dataRovers.concat(dataFallback);

  if (data.length === 0) {
    return { notFound: true };
  }

  // Limit the amount of data used
  data = data.slice(0, photosPerPage * pageCount);

  const updateImageData = (itemsArray) => {
    // updating database with new data
    let lastPage = 0;
    for (let i = photosPerPage; i < itemsArray.length; i += photosPerPage) {
      const params = {
        TableName: "rovers",
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

      lastPage += photosPerPage;
    }

    // Deleting entries from the database if
    // new data does not exist for those pages.
    for (let i = lastPage + photosPerPage; i <= photosPerPage * pageCount; i += photosPerPage) {
      const params = {
        TableName: "rovers",
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

  // Save only necessary data
  data = data.map((item) => ({
    id: item.id || "",
    image: item.img_src || "",
    earthDate: item.earth_date || "",
    roverName: item.rover?.name || "",
    cameraName: item.camera?.full_name || "",
  }));

  updateImageData(data);

  // create image data set for the first (index) page
  data = data.slice(0, photosPerPage);

  return {
    props: {
      data,
      photosPerPage,
      cloudinaryName: process.env.CLOUDINARY_NAME
    },
    revalidate: 3 * 60 * 60, // 3 hours in seconds
  };
};

const Mars = ({ data, photosPerPage, cloudinaryName }) => {
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
    // breaks how the image is displayed in IOS devices, so we reset
    // image outerHTML - that makes the image display correctly
    const reloadImageSrcset = (item) => {
      const image = item.querySelectorAll("img[srcset]")[0];
      image.outerHTML = image.outerHTML;
    };

    // turn gallery loader on when prefilling the page during the first load
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
      setIsGalleryInitialised(true); // init masonry and infiniteScroll only once

      const masonryPromise = import("masonry-layout");
      const scrollPromise = import("infinite-scroll");
      const containerClass = "." + imageStyles["gallery"];
      const itemClass = "." + imageStyles["image-container"];

      // initialise Masonry and InfiniteScroll after initial page images load
      imagesLoaded(containerClass, () => {
        Promise.all([masonryPromise, scrollPromise]).then((values) => {
          setIsLoading(false);
          const isIOS = isDeviceIOS();
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
            status: "." + styles["page-load-status"],
            history: false,
            prefill: true,
            scrollThreshold: 3000,
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

            // relay every item for IOS devices because they don't render images set with srcset attribute
            if (isIOS) {
              items.forEach((item) => reloadImageSrcset(item));
            }

            const pageNumber = path.split("page-")[1];
            let progressCounter = 0;

            imagesLoaded(containerClass).on("progress", () => {
              if (progressCounter++ >= pageNumber || isIOS) {
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
    <Layout withBackgroundImg={true}>
      <Head>
        <title>Mars gallery</title>
      </Head>

      <PageLoader
        isActive={isLoading}
        text="Loading..."
      />

      <h1 className={styles["page-header"]}>
        Explore Mars with the most recent images from NASA&apos;s rovers
      </h1>

      <RoverImageGallery photosArray={data} cloudinaryName={cloudinaryName} />

      <div
        ref={loaderContainerRef}
        className={styles["page-load-status"]}
      >
        <p ref={loaderTextRef} className="infinite-scroll-request">
          Loading
          <span className={styles["loading-dot"]}>.</span>
          <span className={styles["loading-dot"]}>.</span>
          <span className={styles["loading-dot"]}>.</span>
        </p>
        <p
          ref={endTextRef}
          className="infinite-scroll-last infinite-scroll-error"
        >
          End of content, come back later for more photos
        </p>
      </div>
    </Layout>
  );
};

export default Mars;
