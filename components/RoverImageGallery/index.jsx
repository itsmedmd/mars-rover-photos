import Image from "next/image";
import styles from "./index.module.scss";

const RoverImageGallery = ({ photosArray, cloudinaryName }) => {
  const getCloudinarySrc = (src) => {
    // cloudinaryName is public so it's safe to expose
    return `https://res.cloudinary.com/${cloudinaryName}/image/fetch/q_auto:eco,f_auto/${src}`;
  };

  return (
    <div className={styles["gallery"]}>
      {photosArray.map((photo, i) => (
        <div
          key={`${photo.roverName}-${photo.id}-${i}`}
          className={styles["image-container"]}
        >
          <Image
            priority
            layout="fill"
            unoptimized={true}
            src={getCloudinarySrc(photo.image)}
            className={styles["image"]}
            alt=""
          />
          <div className={styles["info-container"]}>
            <p className={styles["rover-name"]}>{photo.roverName} {`(${photo.cameraName})`}</p>
            <p className={styles["date"]}>{photo.earthDate}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoverImageGallery;
