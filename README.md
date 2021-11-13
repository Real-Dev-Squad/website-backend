![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Real-Dev-Squad/website-backend/Tests?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/Real-Dev-Squad/website-backend?style=for-the-badge)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=for-the-badge)](https://standardjs.com)

# Real Dev Squad API

<!-- TABLE OF CONTENTS -->
## Table of Contents

- [About the Project](#about-the-project)
- [Running the Project](#running-the-project)
- [Prerequisites](#prerequisites)
- [API Documentation](#api-documentation)
- [CONTRIBUTING](CONTRIBUTING.md)

## About the Project
This Project serves the backend APIs required for [Real Dev Squad](https://realdevsquad.com/) web projects. This project is built in [Express.js](https://expressjs.com/).

## Running the Project
```shell
npm install
npm start
```
#### Running in dev mode
```shell
npm run dev
```

#### Test local setup
```shell
npm run validate-setup
```

## Prerequisites
- The application uses [node-config](https://github.com/lorenwest/node-config)([documentation](https://github.com/lorenwest/node-config/wiki/Configuration-Files)) for managing config.
- Create a new file: `config/local.js`. Override the required config values from `config/development.js` and `config/default.js` into `config/local.js`.
- Register the application for [GitHub OAuth](https://docs.github.com/en/developers/apps/creating-an-oauth-app) to get the `clientId` and `clientSecret`. Add the callback URL as `http://<HOSTNAME>:<PORT>/auth/github/callback`
- Create an application on [FireStore](https://firebase.google.com/docs/firestore) and [generate a service file](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Add the service file credentials in the local config (or your env variables) as a string (don't forget to escape the newline in private_key)
- For running the project locally, [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) can also be used instead of using the remote DB. Steps for setting it up: [CONTRIBUTING.md - Using Firebase Emulator Locally](https://github.com/Real-Dev-Squad/website-backend/blob/develop/CONTRIBUTING.md#using-firebase-emulator-locally)

## API Documentation:
- View the RDS API documentation: [Real Dev Squad API](https://documenter.getpostman.com/view/2021368/TW6wH8Ns)
- You can also run the server and navigate to `http://<HOSTNAME>:<PORT>/api-docs` to view the API documentation.
- You can import the file [API Schema](https://github.com/Real-Dev-Squad/website-backend/blob/develop/public/apiSchema.json) to [Postman](https://www.postman.com/) or [SwaggerHub](https://swagger.io/tools/swaggerhub/).
- If any API changes have been made:
    - Write JS Doc on top of your routes using YAML based annotations in OPEN API 3.0 format.
    - Run `npm run generate-api-schema` to generate the API schema. A file `public/apiSchema.json` will be created/updated.

Check out our video on how to setup the backend here: [Wiki link](https://github.com/Real-Dev-Squad/website-backend/wiki/Backend-setup-and-understanding-the-flow)

Read more about contributing to the project: [CONTRIBUTING](CONTRIBUTING.md)
