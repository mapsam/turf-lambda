var turf = require('@turf/turf');
var AWS = require('aws-sdk');

module.exports.handler = function(event, context, callback) {

  var s3 = new AWS.S3({ accessKeyId: process.env.CUGOS_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.CUGOS_AWS_SECRET_ACCESS_KEY, region: process.env.LAMBDA_REGION });
  console.log('event: ', JSON.stringify(event));

  callback(null, 'complete!');
}
