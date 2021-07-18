import { Layout, RoverImageGallery } from "components";

export async function getStaticPaths() {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const fileName = "./data/pages-count.json";
  let pageCount;

  try {
    const rawData = fs.readFileSync(fileName);
    const data = JSON.parse(rawData);
    pageCount = data.pageCount;
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
  } catch (err) {
    console.error(`error reading from file ${fileName}`, err);
  }

  // taking only 'photosPerPage' number of photos starting from 'pageNumber'
  let pageNumber = params.page.split("-");
  pageNumber = parseInt(pageNumber[1]);
  data = data.slice(pageNumber, pageNumber + photosPerPage);

  return {
    props: { data },
    revalidate: 3600,
  };
}

const Page = ({ data }) => {
  return (
    <Layout>
      <RoverImageGallery photosArray={data} />
    </Layout>
  );
};

export default Page;
