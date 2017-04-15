var turf = require('@turf/turf');
var AWS = require('aws-sdk');

exports.handler = function(event, context, callback) {

  if (!callback || typeof callback !== 'function') throw new Error('callback is not a function');
  if (typeof event !== 'object') return callback('event is not an object');

  var s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.LAMBDA_REGION
  });

  var bucket = event.Records[0].s3.bucket.name;
  var key = event.Records[0].s3.object.key;
  var task = key.split('/')[0];

  var params = {
    Key: key,
    Bucket: bucket
  };

  s3.getObject(params, function(err, data) {
    if (err) return callback(err);
    
    try {
      var original = JSON.parse(data.Body);
    } catch (err) {
      return callback('Error parsing original GeoJSON');
    }

    if (turf[task]) {
      var final = turf[task](original, 500, 'meters');
      return callback(null, final);
    } else {
      return callback(`Turf method (${task}) does not exist.`);
    }
  });
};
