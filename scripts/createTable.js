var AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-central-1",
  endpoint: "http://localhost:8000",
});

var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: "images",
  KeySchema: [{ AttributeName: "img", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "img", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 20,
    WriteCapacityUnits: 20,
  },
};

dynamodb.createTable(params, function (err, data) {
  if (err) {
    console.error(
      "Unable to create table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      "Created table. Table description JSON:",
      JSON.stringify(data, null, 2)
    );
  }
});
