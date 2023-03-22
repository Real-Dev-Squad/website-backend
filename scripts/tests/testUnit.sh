#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

echo 'Start firestore emulator and run unit tests:'
firebase emulators:exec 'nyc --x=controllers --x=test --x=docs --x=mockdata mocha test/unit/**'
