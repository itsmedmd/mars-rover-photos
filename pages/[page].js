import { Layout, RoverImageGallery } from "components";

export async function getServerSideProps({ params }) {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const fileName = "./data/images-data.json";
  let data = []; // latest photos from all rovers

  try {
    const testName = "/tmp/testImages.json";
    console.log("--------------------READING TMP FROM PAGE:");
    const tempData = fs.readFileSync(testName);
    let tempDataJson = JSON.parse(tempData);
    console.log("data from TMP:", tempDataJson);

    const rawData = fs.readFileSync(fileName);
    data = JSON.parse(rawData);
  } catch (err) {
    console.error(`error reading from file ${fileName}`, err);
  }

  // taking only 'photosPerPage' number of photos starting from 'pageNumber'
  let pageNumber = params.page.split("-");
  pageNumber = parseInt(pageNumber[1]);
  data = data.slice(pageNumber, pageNumber + photosPerPage);

  if (data.length === 0) {
    return { notFound: true };
  }

  return {
    props: { data },
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
