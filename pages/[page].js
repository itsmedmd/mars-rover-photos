import { Layout, RoverImageGallery } from "components";

export async function getServerSideProps({ params }) {
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: "eu-central-1",
    endpoint: "http://localhost:8000",
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const getItemPromise = new Promise((resolve, reject) => {
    const getItemParams = {
      TableName: "images",
      Key: {
        img: params.page,
      },
    };

    dynamoDB.get(getItemParams, function (err, dataReceived) {
      if (err) {
        console.log("Error getting page data", err);
        resolve([]);
      } else {
        if (dataReceived?.Item?.data) {
          resolve(JSON.parse(dataReceived.Item.data));
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
