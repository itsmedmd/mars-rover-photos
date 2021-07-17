import Image from "next/image";
import styles from "./rover-image.module.scss";

export const RoverImage = ({ props }) => {
  return (
    <div className={styles.observer}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image priority className={styles.image} {...props} />
    </div>
  );
};
