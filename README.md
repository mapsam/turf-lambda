# turf lambda

Drop a GeoJSON into a particular bucket, run a turf function on that GeoJSON, put that GeoJSON into another bucket. Wham! :boom:

## Updating the lambda

1. `npm install --production` to install all dependencies
1. `npm run bundle` to zip the project (including `node_modules`)
1. Upload zip to lambda function
