#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

echo 'Start firestore emulator and run integration tests:'
firebase emulators:exec 'nyc --n=controllers/** mocha test/integration/**'
