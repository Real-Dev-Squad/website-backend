const Firestore = require('@google-cloud/firestore');

/**
 * Link - https://cloud.google.com/firestore/docs/quickstart-servers#add_the_server_client_library_to_your_app
 * @return {object} - Returns an instance of Firestore
 */
const getFirestoreDB = () => {
    return new Firestore({
        projectId: 'rds-test-playground'
    });
}

module.exports = getFirestoreDB;
