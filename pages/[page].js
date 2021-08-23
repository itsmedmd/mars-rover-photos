import { Layout, RoverImageGallery } from "components";

export async function getServerSideProps({ params }) {
  const fs = require("fs");
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);
  const fileName = "./data/images-data.json";
  let data = []; // latest photos from all rovers

  try {
    const testName = "/tmp/testImages.json";
    console.log("--------------------WRITING TO TMP FROM PAGE:");
    fs.writeFile(
      testName,
      JSON.stringify({ testas: "labas as krabas" }),
      (err) => {
        if (err) {
          console.error(`error writing to file ${testName}`, err);
          return;
        }
      }
    );
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
