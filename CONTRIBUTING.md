
# Contributing to RDS website-backend

  - [Getting Started](#getting-started)
  - [NPM Command Reference](#npm-command-reference)
  - [Project Structure](#project-structure)
  - [Pull request guidelines](#pull-request-guidelines)

## Getting Started

Instructions on initial setup can be found in the [README](/README.md).

## NPM Command Reference

#### `npm install`

Installs all `dependencies` listed in the root `package.json`.

#### `npm run test`

The script associated with `npm test` will run all tests that ensures that your commit does not break anything in the
repository. This will run the lint, integration and unit tests.

## Project Structure

``` shell script
|-- website-backend
    |-- config
    |   |-- default.js
    |   |-- development.js
    |   |-- production.js
    |   |-- staging.js
    |   |-- test.js
    |-- controllers
    |   |-- healthController.js
    |   |-- // Controller files concerning function on a similar entity
    |-- logs
    |   |-- // log files
    |-- middlewares
    |   |-- // individual middleware files to be required on server start or in the route middleware
    |-- models
    |   |-- // Files consisting of the individual table/collection config and wrapper interaction functions
    |-- routes
    |   |-- index.js // routes files separated by their first path string
    |   |-- auth.js // the individual routes files should contain the OPEN API JSDOC reference
    |-- services
    |   |-- authService.js // Files using any 3rd party service or providing any secific service in the project
    |-- test
    |   |-- fixtures
    |   |   |-- auth
    |   |       |-- githubUserInfo.js
    |   |-- integration // Integration tests
    |   |   |-- authController.test.js
    |   |-- unit // Unit tests
    |-- utils // Files containing utility functions
    |    |-- logger.js
    |-- .github
    |   |-- workflows
    |       |-- // Github actions files
    |-- .gitignore
    |-- .*rc, .*js, .*json, .*yml // config files for dependencies 
    |-- CONTRIBUTING.md
    |-- README.md
    |-- app.js
    |-- firestore-private-key.json // Firestore key file
    |-- package-lock.json
    |-- package.json
    |-- server.js // Contains server start logic

```

## Pull request guidelines

  - All pull requests should be to the develop branch. 
  - Every pull request should have associated issue(s) on our [issue tracker](https://github.com/Real-Dev-Squad/website-backend/issues).
  - For any non-trivial fixes and features, unit and integration tests must be added. The PR reviewer should not approve/merge PR(s) that lack these.
  - The PR(s) should be merged only after the CI passes.


