#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

echo 'Start firestore emulator and run unit tests:'
firebase emulators:exec 'nyc mocha --require ts-node/register test/unit/**'
