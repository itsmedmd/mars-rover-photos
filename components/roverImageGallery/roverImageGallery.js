import homeStyles from "styles/home.module.scss";
import { RoverImage } from "components";

export const RoverImageGallery = ({ photosArray }) => {
  const photosToRender = photosArray.map((photo) => {
    const imageProps = {
      src: photo.img_src,
      layout: "fill",
      quality: "30",
      alt: `${photo.rover.name} Mars rover image with ${photo.camera.full_name} on ${photo.earth_date}`,
    };

    return (
      <RoverImage key={`${photo.rover.name}-${photo.id}`} props={imageProps} />
    );
  });

  return <div className={homeStyles.gallery}>{photosToRender}</div>;
};
