#!/bin/bash

# set 'test' environment
export NODE_ENV='test'
export NODE_CONFIG_DIR='./test/config'
export NODE_OPTIONS="--loader ts-node/esm --experimental-specifier-resolution=node"

# get project_id value from firestore config
json=$(node -e "console.log(require('config').get('firestore'))")
project_id=$(echo $json | grep -o '"project_id":[^,}]*' | cut -d':' -f2 | tr -d '"' | tr -d '[:space:]')

echo 'Start firestore emulator and run integration tests:'
firebase emulators:exec "nyc mocha 'test/integration/**/*.ts' 'test/integration/**/*.js'" --project=$project_id
