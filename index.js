var buffer = require('@turf/buffer');
var AWS = require('aws-sdk');

exports.handler = function(event, context, callback) {

  console.log(JSON.stringify(event));

  var s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.LAMBDA_REGION
  });

  var bucket = event.Records[0].s3.bucket.name;
  var key = event.Records[0].s3.object.key;
  var task = key.split('/')[0];
  console.log('task: ', task);

  var params = {
    Key: key,
    Bucket: bucket
  };

  console.log('s3 params: ', params);

  s3.getObject(params, function(err, data) {
    if (err) return callback(err);

    try {
      var original = JSON.parse(data.Body);
      console.log('original geojson: ', JSON.stringify(original));
    } catch (err) {
      return callback('Error parsing original GeoJSON');
    }

    if (buffer) {
      var final = buffer(original, 500, 'meters');
      console.log('final geojson: ', JSON.stringify(final));
      return callback(null, final);
    } else {
      return callback(`Turf method (${task}) does not exist.`);
    }
  });
};
