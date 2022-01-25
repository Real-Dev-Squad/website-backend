#!/bin/bash

# "tdd-files-list.txt only contain those files that are to be tested locally during development.
# Wildcards are allowed in the filepaths. You can add any number of paths.
# Note - Don't forget the newline in the end.

BASEDIR=$(dirname "$0")
tddFilename="$BASEDIR/tdd-files-list.txt"

allPaths=""
while read -r line; do
    name="$line"
    echo "Will run tests from file :- $name"
    allPaths+="$name "
done < "$tddFilename"

export NODE_ENV='test'
echo '\nStart firestore emulator and run tests during TDD only:\n'

# Read config meanings here: https://github.com/istanbuljs/nyc#common-configuration-options
firebase emulators:exec "nyc --check-coverage=true --all=false --skip-full=true --per-file=true mocha --watch $allPaths"

# Aim to achieve these results when you exit:
# =============================== Coverage summary ===============================
# Statements   : 100% (  )
# Branches     : 100% (  )
# Functions    : 100% (  )
# Lines        : 100% (  )
# ================================================================================

# Upon exiting, the script is expected to say "Script exited unsuccessfully (code 130)"

# NOTE - Before commiting the code, run `yarn test` to run all the tests.
