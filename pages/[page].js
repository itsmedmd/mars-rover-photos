import { Layout, RoverImageGallery } from "components";

export async function getServerSideProps({ params }) {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const fileName = "./data/images-data.json";
  let data = []; // latest photos from all rovers

  try {
    //const testName = "/tmp/testImages.json";
    //console.log("--------------------READING TMP FROM PAGE:");
    //const tempData = fs.readFileSync(testName);
    //let tempDataJson = JSON.parse(tempData);
    //console.log("data from TMP:", tempDataJson);
    console.log("tryna to read directory!!!!!!!!!!!!!!");
    const dir = "/tmp/";

    // list all files in the directory
    fs.readdir(dir, (err, files) => {
      if (err) {
        throw err;
      }

      // files object contains all files names
      // log them on console
      files.forEach((file) => {
        console.log("FILE::: ", file);
      });
    });

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
