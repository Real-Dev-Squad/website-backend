# Website Backend

## Steps
- Clone the repository
- Navigate into the repo

## Running the project
```shell script
$ npm install
$ npm start 
```

## Running in dev mode
```shell script
$ npm run dev
```

## Prerequisites
- Create a new file: `config/local.js`. Override the required config values from `config/development.js` and `config/default.js` into `config/local.js`.
- Register the application for [GitHub OAuth](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps) to get the `clientId` and `clientSecret`
- Create an application on [FireStore](https://firebase.google.com/docs/firestore) and [generate a service file](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Add the service file with the name `firestore-private-key.json` in the project root. 

## Generating authentication token
- Navigate to `https://github.com/login/oauth/authorize?client_id=<GITHUB_CLIENT_ID>`
- Authorise the application.
- Copy the response cookie named `rds-session` from the redirected request from the API.
- Use the cookie for authenticated routes in the API.
- For non-production environments, authentication is also supported with the `Authorization` header.
- Authorization header: `Authorization: Bearer <token>`

## Running tests
- `npm run test`: Runs the test suite

## API documentation:
- If any API changes have been made:
    - Write JS Doc on top of your routes using YAML based annotations in OPEN API 3.0 format.
    - Run `npm run generate-api-schema` to generate the API schema. A file `public/apiSchema.json` will be created/updated.
- Run the server and navigate to `http://localhost:<PORT>/api-docs`
