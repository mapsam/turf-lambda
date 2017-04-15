var test = require('tape');
var AWS = require('aws-sdk-mock');

var handler = require('..').handler;
var sampleGeojsonPoint = require('./fixtures/geojson-point-feature.json');

// mocks the AWS s3.getObject method, returns a stringified geojson object
AWS.mock('S3', 'getObject', function(params, callback) {
  console.log('params: ', params);
  callback(null, { Body: JSON.stringify(sampleGeojsonPoint) });
});

test('handler: fails with invalid event object', function(t) {
  handler('not an object', {}, function(err, response) {
    t.ok(err, 'errored');
    t.ok(/event is not an object/.test(err), 'expected message');
    t.end();
  });
});

test('handler: throws without a callback', function(t) {
  var event = require('./fixtures/event-valid-buffer.json');
  try {
    handler(event, {});
    t.fail('do not get here');
  } catch(ex) {
    t.ok(ex, 'exception exists');
    t.ok(/callback is not a function/.test(ex), 'expected message');
    t.end();
  }
});

test('handler: fails with s3 key that has no turf method', function(t) {
  var event = require('./fixtures/event-invalid-notask.json');
  handler(event, {}, function(err, response) {
    t.ok(err, 'errored');
    t.ok(/Turf method \(invalid\) does not exist/.test(err), 'expected message');
    t.end();
  });
});

test('handler: successful point buffered', function(t) {
  var event = require('./fixtures/event-valid-buffer.json');
  handler(event, {}, function(err, response) {
    t.notOk(err, 'no error');
    t.equal(response.type, 'Feature', 'geojson feature returned');
    t.equal(response.geometry.type, 'Polygon', 'feature is a polygon');
    t.end();
  });
});
