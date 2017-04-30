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
  // var task = key.split('/')[0];

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

    if (original.type === 'Feature') {
      var operation = original.properties['turf-lambda:operation'];
      if (!operation) return callback(new Error('Feature has no turf-lambda:operation'));
      var parameters = original.properties['turf-lambda:parameters'];
      if (!parameters) return callback(new Error('Feature has no turf-lambda:parameters'));

      console.log('do we get here?');
      runTask(original, operation, parameters, function(err, final) {
        if (err) return callback(err);
        return callback(null, final);
      });
    } else if (original.type === 'FeatureCollection' && original['turf-lambda']) {
      var operation = original['turf-lambda']['turf-lambda:operation'];
      var parameters = original['turf-lambda']['turf-lambda:parameters'];
      runTask(original, operation, parameters, function(err, final) {
        if (err) return callback(err);
        return callback(null, final);
      });
    } else if (original.type === 'FeatureCollection') {
      // loop through each individual feature
      var final = {type: 'FeatureCollection', features: []};
      original.features.forEach(function(feature) {
        var featureOperation = feature.properties['turf-lambda:operation'];
        var featureParameters = feature.properties['turf-lambda:parameters'];
        if (featureOperations && featureParameters) {
          runTask(feature, featureOperation, featureParameters, function(err, finalFeature) {
            if (err) return callback(err);
            final.features.push(finalFeature);
          });
        }
      });

      if (!final.features.length) return callback(new Error('FeatureCollection features did not have any turf-lambda operations specified.'));
      return callback(null, final);
    } else {
      return callback(null, 'Not a valid GeoJSON');
    }


  });
};

/**
 * Run a turf task based on an operation
 * @param {Object} geojson - the geojson object to perform a turf operation
 * @param {String} operation - a turf operation to run
 * @param {Array} parameters - the parameters to pass into the turf operation.
 * The first parameter must be the GeoJSON object
 * @param {Function} callback
 */
function runTask(geojson, operation, parameters, callback) {
  var applied = buildParameters(geojson, parameters);
  if (turf[operation]) {
    try {
      var final = turf[operation].apply(this, applied);
      return callback(null, final);
    } catch (err) {
      return callback(err);
    }
  } else {
    return callback(`Turf method (${operation}) does not exist.`);
  }
}

function buildParameters(gj, parameters) {
  var finalParams = [gj];
  parameters.forEach(function(p) { finalParams.push(p); });
  return finalParams;
}
