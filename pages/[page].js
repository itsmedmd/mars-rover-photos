import { Layout, RoverImageGallery } from "components";

export async function getServerSideProps({ params }) {
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: "eu-central-1",
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com",
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const getItemPromise = new Promise((resolve, reject) => {
    const getItemParams = {
      TableName: "images",
      Key: { img: params.page },
    };

    dynamoDB.get(getItemParams, function (err, dataReceived) {
      if (err) {
        console.log("Error getting page data", err);
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
