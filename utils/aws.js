const { IdentitystoreClient, ListUsersCommand, CreateUserCommand, CreateGroupMembershipCommand } = require('@aws-sdk/client-identitystore');
const config = require('config');

// Fetch configuration variables
const accessKeyId = config.get('aws.access_key') || null;
const secretAccessKey = config.get('aws.secret_key') || null;
const region = config.get('aws.region') || 'us-east-1';
const identityStoreId = config.get('aws.identity_store_id');

// Create a singleton IdentitystoreClient instance
let client;

/**
 * Configures AWS SDK credentials and returns a singleton IdentitystoreClient instance.
 * @returns {IdentitystoreClient} Singleton AWS Identitystore client
 */
function configureAWSCredentials() {
    if (!client) {
        if (accessKeyId && secretAccessKey) {
            // If credentials exist, create the IdentitystoreClient with explicit credentials
            client = new IdentitystoreClient({
                region: region,
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey
                }
            });
        } else {
            // Use default credentials chain (IAM role, etc.)
            console.log('No AWS credentials provided, using default IAM role or credentials chain.');
            client = new IdentitystoreClient({ region: region });
        }
    }
    return client;
}

/**
 * Lists users from AWS Identity Store filtered by username.
 * @param {string} username - Username to filter users by
 * @returns {Promise<void>}
 */
async function fetchUserIdFromUsername(username) {
    const client = configureAWSCredentials();  // Use the singleton client

    // Create the command to list users by Username
    const getUserByIdCommand = new ListUsersCommand({
        IdentityStoreId: identityStoreId,
        Filters: [
            {
                AttributePath: 'Username',
                AttributeValue: username
            }
        ]
    });

    try {
        // Send the command to AWS Identity Store
        const response = await client.send(getUserByIdCommand);

        if (response.Users && response.Users.length > 0) {
            const userId = response.Users[0].UserId;
            console.log("The userid is", userId);
            return userId;
        } else {
            console.log('No users found for the provided username.');
        }
    } catch (err) {
        throw new Error(`Failed to list users: ${err.message}`);
    }
}

/**
 * Creates the user in the Identity store the details which have to be passed are
 * 1. username
 * 2. emailId
 * 3. IdentityStoreId
 */
const createUser = async ({ 
    username, 
    // formattedName, 
    // familyName, 
    // givenName, 
    // displayName, 
    email 
}) => {
    const client = configureAWSCredentials();  // Use the singleton client

    const params = {
        IdentityStoreId: identityStoreId, // required
        UserName: username,
        Name: {
            Formatted: username,
            FamilyName: username,
            GivenName: username,
            // MiddleName: "STRING_VALUE", // Uncomment if needed
            // HonorificPrefix: "STRING_VALUE", // Uncomment if needed
            // HonorificSuffix: "STRING_VALUE", // Uncomment if needed
        },
        DisplayName: username,
        Emails: [
            {
                Value: email,
                Type: 'work',
                Primary: true,
            },
        ],
        // Uncomment and add more fields as necessary
        // Addresses: [ /* ... */ ],
        // PhoneNumbers: [ /* ... */ ],
        // UserType: "STRING_VALUE",
        // Title: "STRING_VALUE",
        // PreferredLanguage: "STRING_VALUE",
        // Locale: "STRING_VALUE",
        // Timezone: "STRING_VALUE",
    };

    try {
        const command = new CreateUserCommand(params);
        const response = await client.send(command);
        console.log('User added successfully:', response);
        return response;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error(`Failed to create user: ${error.message}`);
    }
};

/**
 * This function adds the user to the IAM group provided
 */
const addUserToGroup = async (groupId, userId) => {
    // Configure AWS SDK credentials and client
    const client = configureAWSCredentials();  // Use the singleton client

    try {
        // Create the command to add the user to the group
        const command = new CreateGroupMembershipCommand({
            IdentityStoreId: identityStoreId, // Identity Store ID
            GroupId: groupId,                   // Group ID to which the user will be added
            MemberId: {
                UserId: userId,               // User ID of the member to be added
            }
        });
        
        console.log("The request is", command);
        // Send the command to AWS Identity Store
        const response = await client.send(command);
        console.log("User added to group successfully:", response);
        return response;  // Return the response for further processing if needed
    } catch (error) {
        // Log an error message if the operation fails
        console.error("Error adding user to group:", error);
        throw new Error(`Failed to add user to group: ${error.message}`);  // Re-throw with a descriptive message
    }
};


module.exports = { fetchUserIdFromUsername, createUser, addUserToGroup };
