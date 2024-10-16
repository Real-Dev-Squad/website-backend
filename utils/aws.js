const {
  IdentitystoreClient,
  ListUsersCommand,
  CreateUserCommand,
  CreateGroupMembershipCommand,
} = require("@aws-sdk/client-identitystore");
const config = require("config");

// Fetch configuration variables
const accessKeyId = config.get("aws.access_key") || null;
const secretAccessKey = config.get("aws.secret_key") || null;
const region = config.get("aws.region") || "us-east-1";
const identityStoreId = config.get("aws.identity_store_id");

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
          secretAccessKey: secretAccessKey,
        },
      });
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
  const client = configureAWSCredentials(); // Use the singleton client

  // Create the command to list users by Username
  const getUserByIdCommand = new ListUsersCommand({
    IdentityStoreId: identityStoreId,
    Filters: [
      {
        AttributePath: "Username",
        AttributeValue: username,
      },
    ],
  });

  try {
    // Send the command to AWS Identity Store
    const response = await client.send(getUserByIdCommand);

    if (response.Users && response.Users.length > 0) {
      const userId = response.Users[0].UserId;
      return userId;
    } else {
      logger.error("No users found for the provided username.");
      return null;
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
const createUser = async ({ username, email }) => {
  const client = configureAWSCredentials(); // Use the singleton client

  const params = {
    IdentityStoreId: identityStoreId, // required
    UserName: username,
    Name: {
      Formatted: username,
      FamilyName: username,
      GivenName: username,
    },
    DisplayName: username,
    Emails: [
      {
        Value: email,
        Type: "work",
        Primary: true,
      },
    ],
  };

  try {
    const command = new CreateUserCommand(params);
    const response = await client.send(command);
    return response;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * This function adds the user to the IAM group provided
 */
const addUserToGroup = async (groupId, userId) => {
  // Configure AWS SDK credentials and client
  const client = configureAWSCredentials(); // Use the singleton client

  try {
    // Create the command to add the user to the group
    const command = new CreateGroupMembershipCommand({
      IdentityStoreId: identityStoreId, // Identity Store ID
      GroupId: groupId, // Group ID to which the user will be added
      MemberId: {
        UserId: userId, // User ID of the member to be added
      },
    });

    // Send the command to AWS Identity Store
    const response = await client.send(command);
    return response; // Return the response for further processing if needed
  } catch (error) {
    // Log an error message if the operation fails
    logger.error("Error adding user to group:", error);
    throw new Error(`Failed to add user to group: ${error.message}`); // Re-throw with a descriptive message
  }
};

/**
 * Function to get UserId by username from AWS Identity Store
 * @param {string} username - The username of the user
 * @returns {Promise<string|null>} - The UserId if found, otherwise null
 */
const fetchAwsUserIdByUsername = async (username) => {
  const client = configureAWSCredentials(); // reusing the same instance - (Singleton object)
  try {
    // Define the command to list users
    const command = new ListUsersCommand({
      IdentityStoreId: identityStoreId,
      Filters: [
        {
          AttributePath: "UserName",  // Filter by UserName attribute
          AttributeValue: username,   // The username value to search for
        },
      ],
    });
    console.log("COmmand passed = ", username);
    // Send the command to AWS
    const response = await client.send(command);

    // Check if the user was found
    if (response.Users && response.Users.length > 0) {
      const userId = response.Users[0].UserId;
      console.log(`UserId for username "${username}" is: ${userId}`);
      return userId;
    } else {
      console.log(`No user found with username: ${username}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching UserId:", error);
    return null;
  }
};

module.exports = { fetchUserIdFromUsername, createUser, addUserToGroup, fetchAwsUserIdByUsername };
