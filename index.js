var buffer = require('@turf/buffer');
var AWS = require('aws-sdk');

module.exports.handler = function(event, context, callback) {

  var s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.LAMBDA_REGION
  });

  var info = 'arn:aws:s3:::cugos'.split(':::')[1].split('/');
  console.log('info: ', info);
  var bucket = info[0];
  var task = info[1];

  var params = {
    Key: task + '/' + event.Records[0].s3.object.key,
    Bucket: event.Records[0].s3.bucket.arn;
  };

  console.log('s3 params: ', params);

  s3.getObject(params, function(err, data) {
    try {
      var original = JSON.parse(data);
      console.log('original geojson: ', original);
    } catch (err) {
      return callback('Error parsing original GeoJSON');
    }

    if (buffer) {
      var final = buffer(original);
      return callback(null, final);
    } else {
      return callback(`Turf method (${task}) does not exist.`);
    }
  });
};
