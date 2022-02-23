#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

echo 'Start firestore emulator and run unit tests:'
firebase emulators:exec 'nyc --n=models --n=middlewares/**.js --n=services --n=utils mocha test/unit/**'
