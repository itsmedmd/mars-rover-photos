import styles from "styles/home.module.scss";
import { Layout, RoverImage } from "components";

export async function getStaticPaths() {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const fileName = "./data/pages-count.json";
  let pageCount;

  try {
    const rawData = fs.readFileSync(fileName);
    const data = JSON.parse(rawData);
    pageCount = data.pageCount;
    console.log(`success reading from file ${fileName}`);
  } catch (err) {
    console.error(`error reading from file ${fileName}`, err);
  }

  const paths = [];
  for (let i = 1; i <= pageCount; i++) {
    paths.push({
      params: {
        page: `page-${i * photosPerPage}`,
      },
    });
  }

  //console.log("all paths:", paths);

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const fileName = "./data/images-data.json";
  let data = []; // latest photos from all rovers

  try {
    const rawData = fs.readFileSync(fileName);
    data = JSON.parse(rawData);
    console.log(`success reading from file ${fileName}`);
  } catch (err) {
    console.error(`error reading from file ${fileName}`, err);
  }

  let pageNumber = params.page.split("-");
  pageNumber = parseInt(pageNumber[1]);
  data = data.slice(pageNumber, pageNumber + photosPerPage);
  console.log(
    "taking page from ",
    pageNumber,
    " to ",
    pageNumber + photosPerPage
  );

  return {
    props: { data },
    revalidate: 3600,
  };
}

const Page = ({ data }) => {
  /////////////////////////////////////create component for this
  //
  //
  //
  //
  //
  const photosToRender = data.map((photo) => {
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

  console.log("rendering a page.");
  return (
    <Layout>
      <div className={styles.gallery}>{photosToRender}</div>
    </Layout>
  );
};

export default Page;
