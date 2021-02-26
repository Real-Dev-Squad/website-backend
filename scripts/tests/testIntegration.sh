#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

echo 'Start firestore emulator and run integration tests:'
firebase emulators:exec './node_modules/.bin/nyc ./node_modules/.bin/mocha test/integration/**'
