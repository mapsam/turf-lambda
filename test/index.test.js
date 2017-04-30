var test = require('tape');
var AWS = require('aws-sdk-mock');

var handler = require('..').handler;
var event = require('./fixtures/event-valid.json');

test('handler: fails with invalid event object', function(t) {
  handler('not an object', {}, function(err, response) {
    t.ok(err, 'errored');
    t.ok(/event is not an object/.test(err), 'expected message');
    t.end();
  });
});

test('handler: throws without a callback', function(t) {
  try {
    handler(event, {});
    t.fail('do not get here');
  } catch(ex) {
    t.ok(ex, 'exception exists');
    t.ok(/callback is not a function/.test(ex), 'expected message');
    t.end();
  }
});

// test('handler: fails with s3 key that has no turf method', function(t) {
//   var event = require('./fixtures/event-invalid-notask.json');
//   handler(event, {}, function(err, response) {
//     t.ok(err, 'errored');
//     t.ok(/Turf method \(invalid\) does not exist/.test(err), 'expected message');
//     t.end();
//   });
// });

AWS.mock('S3', 'getObject', function(params, callback) {
  var gj = require('./fixtures/geojson-feature-no-operation.json');
  callback(null, { Body: JSON.stringify(gj) });
});

test('handler: geojson Feature without turf-lambda:operation property fails', function(t) {
  handler(event, {}, function(err, response) {
    t.ok(err, 'errored');
    console.log(err);
    t.ok(/Feature has no turf-lambda:operation/.test(err), 'expected error message');
    t.end();
  });
});

test('handler: geojson Feature without turf-lambda:parameters property fails', function(t) {
  t.end();
});

test('handler: geojson FeatureCollection without turf-lambda object or Features without turf-lambda properties fails', function(t) {
  t.end();
});

AWS.mock('S3', 'getObject', function(params, callback) {
  var gj = require('./fixtures/geojson-feature-point.json');
  callback(null, { Body: JSON.stringify(gj) });
});

test('handler: Feature buffered successfully', function(t) {
  handler(event, {}, function(err, response) {
    t.notOk(err, 'no error');
    t.equal(response.type, 'Feature', 'geojson feature returned');
    t.equal(response.geometry.type, 'Polygon', 'feature is a polygon');
    t.end();
  });
});

test('handler: FeatureCollection with turf-lambda object buffered successfully', function(t) {
  t.end();
});

test('handler: FeatureCollection with each Features properties buffered successfully', function(t) {
  t.end();
});
