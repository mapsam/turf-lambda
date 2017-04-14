var turf = require('@turf/turf');
var AWS = require('aws-sdk');

exports.handler = function(event, context, callback) {

  var s3 = new AWS.S3({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: process.env.LAMBDA_REGION });

  console.log('event: ', event);
  console.log('context: ', context);

  callback(null, 'complete!');
}
