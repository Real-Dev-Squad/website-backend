# Contributing to Real Dev Squad API

- [Getting Started](#getting-started)
- [Yarn Command Reference](#yarn-command-reference)
- [Project Structure](#project-structure)
- [Generating Authentication Token](#generating-authentication-token)
- [Testing Guidelines](#testing-guidelines)
- [Using Firebase Emulator Locally](#using-firebase-emulator-locally)
- [Pull request guidelines](#pull-request-guidelines)

## Getting Started

Instructions for initial setup can be found in the [README](README.md).

## Yarn Command Reference

##### `yarn`

Installs all `dependencies` listed in the root `package.json`.

##### `yarn run test`

The script associated with `yarn run test` will run all tests that ensures that your commit does not break anything in the
repository. This will run the lint, integration and unit tests.

##### `yarn run lint`

Runs the lint checks in the project.

##### `yarn run generate-api-schema`

Generates the API schema in the file `public/apiSchema.json`.

##### `yarn run validate-setup`

Runs the test for checking local development setup is working properly or not.

## Project Structure

The following project structure should be followed:

```shell script
|-- website-backend
    |-- config
    |   |-- custom-environment-variables.js
    |   |-- default.js
    |   |-- development.js
    |   |-- production.js
    |   |-- staging.js
    |   |-- test.js
    |-- controllers
    |   |-- health.js
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
    |   |-- authService.js // Files using any 3rd party library/service or providing any secific service in the project
    |-- scripts // Standalone scripts
    |-- test
    |   |-- fixtures
    |   |   |-- auth
    |   |       |-- githubUserInfo.js
    |   |-- integration // Integration tests
    |   |   |-- auth.test.js
    |   |-- unit // Unit tests
    |   |   |-- middlewares
    |   |   |-- services
    |   |-- utils // Utility functions to be used while testing
    |-- utils // Files containing utility functions
    |    |-- logger.js
    |-- .github
    |   |-- workflows
    |       |-- // Github actions files
    |-- .gitignore
    |-- .*rc, .*js, .*json, .*yml // config files for dependencies
    |-- CONTRIBUTING.md
    |-- README.md
    |-- CHANGELOG.md
    |-- app.js
    |-- package-lock.json
    |-- package.json
    |-- server.js // Contains server start logic

```

## Generating Authentication Token

- Run the project locally, make sure the server is listening to requests
- Navigate to `https://github.com/login/oauth/authorize?client_id=<GITHUB_CLIENT_ID>`
- Authorize the application
- Once authorized, check browser's cookies section. Copy the value of the cookie named `rds-session` (`rds-session-development` for development mode).
- Use the cookie for authenticated routes in the API.
- For non-production environments, authentication is also supported with the `Authorization` header.
- Authorization header: `Authorization: Bearer <token>`

## Production login:

https://github.com/login/oauth/authorize?client_id=23c78f66ab7964e5ef97

### Production login - Cookie:

rds-session

## Staging login:

https://github.com/login/oauth/authorize?client_id=ebb301661e883a85bf9a

### Staging login - Cookie:

rds-session-staging

## Testing Guidelines

- Libraries used in testing in the project:
  - [mocha](https://mochajs.org/): Test framework
  - [chai](https://www.chaijs.com/): Assertion library
  - [sinon](https://sinonjs.org/): JavaScript test spies, stubs and mocks
  - [nock](https://github.com/nock/nock/blob/main/README.md): HTTP requests mocking
- The test suite uses [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) for running firestore for tests([documentation](https://firebase.google.com/docs/emulator-suite/install_and_configure)).
- Pre-requisites:
  - Node.js version 8.0 or higher.
  - Java version 1.8 or higher.

## Using Firebase Emulator Locally

- [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) can be used locally as the DB for the project
- Pre-requisites:
  - Node.js version 8.0 or higher.
  - Java version 1.8 or higher.
- Run: `npx firebase emulators:start`
- The emulator will run and display the url you can access it on.
- You can view the emulator UI at: `http://localhost:4000`
- To run the application with using firebase emulator, run the following command([docs](https://firebase.google.com/docs/emulator-suite/connect_firestore#admin_sdks)):

```shell
export FIRESTORE_EMULATOR_HOST="localhost:<Firebase emulator PORT>"
```

## Running test scripts on Windows

- Git Bash is recommended for running test scripts on Windows.
- Run `yarn run test-integration` for running integration tests.
- Run `yarn run test-unit` for running unit tests.
- Make sure the server is not running.
- Make sure to close the emulator window after running the tests in order to avoid the blocking of the port for the next tests to run.
- For e.g - After running the integration tests, close the emulator window and then run the command for unit tests.

## Pull request guidelines

- Ensure that the tests pass locally before raising a PR.
- All pull requests should have base as the develop branch.
- Every pull request should have associated issue(s) on our [issue tracker](https://github.com/Real-Dev-Squad/website-backend/issues).
- For any non-trivial fixes and features, unit and integration tests must be added. The PR reviewer should not approve/merge PR(s) that lack these.
- The PR(s) should be merged only after the CI passes.

## Certain issues you may face while running the tests:

- Firestore emulator is not starting
- Java version is not above 11
- When we run yarn test, it runs both the unit and integration tests (in this order). So after the unit tests are done, the java process is not killed automatically and when our integration test run it gives error.

## Possible solutions for above issues (in particular order):

- add '--project=< your firestore app name>' flag to both the test scripts.
- Java version above 11 is needed for firebase tool version >= 11
- Either manually kill the java process after unit tests are done or run both the tests separately by running the test commands.
