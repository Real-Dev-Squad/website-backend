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
Add the required keys in `config/development.json` for running the service.
- Register the application for [GitHub OAuth](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps) to get the `clientId` and `clientSecret`
- Create an application on [FireStore](https://firebase.google.com/docs/firestore) and [generate a service file](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Add the service file with the name `firestore-private-key.json` in the project root. 

## Running tests
- `npm run test`: Runs the test suite
