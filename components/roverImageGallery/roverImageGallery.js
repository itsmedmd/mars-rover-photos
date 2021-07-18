import Image from "next/image";
import homeStyles from "styles/home.module.scss";
import styles from "./rover-image-gallery.module.scss";

export const RoverImageGallery = ({ photosArray }) => {
  return (
    <div className={homeStyles.gallery}>
      {photosArray.map((photo) => (
        <div
          key={`${photo.rover.name}-${photo.id}`}
          className={styles["image-container"]}
        >
          <Image
            priority
            quality="30"
            layout="fill"
            src={photo.img_src}
            className={styles.image}
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
