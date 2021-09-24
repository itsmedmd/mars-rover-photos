import Image from "next/image";
import styles from "./rover-image-gallery.module.scss";

export const RoverImageGallery = ({ photosArray }) => {
  const cloudinaryName = "dskuy1qja";

  const getCloudinarySrc = (src) => {
    return `https://res.cloudinary.com/${cloudinaryName}/image/fetch/q_auto:eco,f_auto/${src}`;
  };

  return (
    <div className={styles["gallery"]}>
      {photosArray.map((photo) => (
        <div
          key={`${photo.rover.name}-${photo.id}`}
          className={styles["gallery__image-container"]}
        >
          <Image
            priority
            layout="fill"
            unoptimized={true}
            src={getCloudinarySrc(photo.img_src)}
            className={styles["gallery__image"]}
            alt={`
                ${photo.rover.name} Mars rover image taken with 
                ${photo.camera.full_name} on ${photo.earth_date}
              `}
          />
        </div>
      ))}
    </div>
  );
};
