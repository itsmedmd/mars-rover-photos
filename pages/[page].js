import Layout from "@/components/Layout";
import RoverImageGallery from "@/components/RoverImageGallery";

// Get data from database of Mars images for the requested page and render the page in the server
export async function getServerSideProps({ params }) {
  // Setup config
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: "eu-central-1",
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const getItemPromise = new Promise((resolve) => {
    const getItemParams = {
      TableName: "rovers",
      Key: { img: params.page },
    };

    dynamoDB.get(getItemParams, function (err, dataReceived) {
      if (err) {
        console.error("Error getting page data", err);
        resolve([]);
      } else {
        if (dataReceived?.Item?.imgData) {
          resolve(JSON.parse(dataReceived.Item.imgData));
        } else {
          resolve([]);
        }
      }
    });
  });

  let data = [];
  data = await getItemPromise;

  if (data.length === 0) {
    return { notFound: true };
  }

  return {
    props: {
      data,
      cloudinaryName: process.env.CLOUDINARY_NAME
    },
  };
}

const Page = ({ data, cloudinaryName }) => {
  return (
    <Layout>
      <RoverImageGallery photosArray={data} cloudinaryName={cloudinaryName} />
    </Layout>
  );
};

export default Page;
