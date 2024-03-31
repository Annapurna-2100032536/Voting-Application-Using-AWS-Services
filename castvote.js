"use strict";

console.log("Loading function");
const doc = require("aws-sdk");
// const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB.DocumentClient();

const castVote = (payload, callback) => {
  if (typeof payload === "string") {
    payload = JSON.parse(payload);
  }

  var params = {
    Key: {
      candidate: payload.vote,
    },
    TableName: "VoteTally",
    AttributeUpdates: {
      tally: {
        Action: "ADD",
        Value: 1,
      },
    },
  };

  console.log("Casting Vote:", JSON.stringify(params, null, 2));

  dynamo.update(params, (err, data) => {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response

    callback(err, data);
  });
};

exports.handler = (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const done = (err, res) =>
    callback(null, {
      statusCode: err ? "400" : "204",
      body: err ? err.message : JSON.stringify(res),
      headers: {
        "Content-Type": "application/json",
      },
    });

  switch (event.httpMethod) {
    case "POST":
      castVote(event.body, done);
      break;
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};
