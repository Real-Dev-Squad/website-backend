#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

# get project_id value from firestore config
json=$(node -e "console.log(require('config').get('firestore'))")
project_id=$(echo $json | grep -o '"project_id":[^,}]*' | cut -d':' -f2 | tr -d '"' | tr -d '[:space:]')

echo 'Start firestore emulator and run unit tests:'
firebase emulators:exec 'nyc --x=controllers --x=test --x=docs  --recursive --x=mockdata --x=dist mocha test/unit/**' --project=$project_id
