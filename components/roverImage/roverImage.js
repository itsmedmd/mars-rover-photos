import React, { useState } from "react";
import Image from "next/image";
import { InView } from "react-intersection-observer";
import styles from "./rover-image.module.scss";

export const RoverImage = ({ rootMargin, props }) => {
  const [isInView, setIsInView] = useState(false);
  if (isInView) console.log("in view !");

  return (
    <InView
      className={styles.observer}
      rootMargin={rootMargin}
      // thanks to the condition "!isInView &&" image is loaded only once
      onChange={(inView) => !isInView && setIsInView(inView)}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image priority={isInView} className={styles.image} {...props} />
    </InView>
  );
};
