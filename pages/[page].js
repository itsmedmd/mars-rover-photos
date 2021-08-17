import { Layout, RoverImageGallery } from "components";
import { useDispatch } from "react-redux";
import { activate } from "myRedux/reducers/pageLoadingSlice";

export async function getServerSideProps({ params }) {
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

  if (data.length === 0) {
    return { notFound: true };
  }

  return {
    props: { data },
  };
}

const Page = ({ data }) => {
  // dispatching action to enable gallery page loading animation
  const dispatch = useDispatch();
  dispatch(activate());

  return (
    <Layout>
      <RoverImageGallery photosArray={data} />
    </Layout>
  );
};

export default Page;
