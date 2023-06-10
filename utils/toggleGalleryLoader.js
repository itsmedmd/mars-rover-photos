const toggleGalleryLoader = (option, container, loaderText, endText) => {
  if (option === "on") {
    container.style.display = "block";
    loaderText.style.display = "block";
    endText.style.display = "none";
  } else if (option === "off") {
    container.style.display = "none";
    loaderText.style.display = "none";
    endText.style.display = "none";
  }
};

export default toggleGalleryLoader;
