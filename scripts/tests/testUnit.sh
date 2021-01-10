#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

# set environment variable for firestore emulator host
# @todo: Get port value from '../../firebase.json'
export FIRESTORE_EMULATOR_HOST='localhost:8080'

echo 'Start Firestore Emulator:'
firebase emulators:start &

echo 'Running unit tests:'
nyc mocha test/unit/**

# Erase the database
# @todo: Get port value from '../../firebase.json' and projectId from config
# Route; DELETE http://localhost:<PORT>/emulator/v1/projects/<PROJECT_ID>/databases/(default)/documents
echo 'Erasing Firestore data:'
curl -v -X DELETE 'http://localhost:8080/emulator/v1/projects/rds-dev/databases/(default)/documents'
