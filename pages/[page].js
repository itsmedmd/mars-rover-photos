import { Layout, RoverImageGallery } from "components";
import { useSelector } from "react-redux";

export async function getServerSideProps({ params }) {
  const photosPerPage = parseInt(process.env.PHOTOS_PER_PAGE);

  // try {
  //   const rawData = fs.readFileSync(fileName);
  //   data = JSON.parse(rawData);
  // } catch (err) {
  //   console.error(`error reading from file ${fileName}`, err);
  // }

  // taking only 'photosPerPage' number of photos starting from 'pageNumber'
  let pageNumber = params.page.split("-");
  pageNumber = parseInt(pageNumber[1]);
  // data = data.slice(pageNumber, pageNumber + photosPerPage);

  // if (data.length === 0) {
  //   return { notFound: true };
  // }

  return {
    props: { photosPerPage, pageNumber },
  };
}

const Page = ({ photosPerPage, pageNumber }) => {
  const images = useSelector((state) => state.imageData.images);
  //const data = images.slice(pageNumber, pageNumber + photosPerPage);
  console.log("[page], redux images:", images);
  //console.log("[page], images:", data);
  return <Layout></Layout>;
}; //<RoverImageGallery photosArray={data} />

export default Page;
