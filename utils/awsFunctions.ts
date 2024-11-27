import {
    IdentitystoreClient,
    ListUsersCommand,
    CreateUserCommand,
    CreateGroupMembershipCommand,
    ListUsersCommandInput,
    CreateUserCommandInput,
    CreateGroupMembershipCommandInput,
  } from "@aws-sdk/client-identitystore";
  import config from "config";
  
  // Define the configuration variables with proper types
  const accessKeyId: string = config.get<string>("aws.access_key");
  const secretAccessKey: string = config.get<string>("aws.secret_key");
  const region: string = config.get<string>("aws.region");
  const identityStoreId: string = config.get<string>("aws.identity_store_id");
  
  let client: IdentitystoreClient;
  
  /**
   * Configures AWS SDK credentials and returns a singleton IdentitystoreClient instance.
   * @returns {IdentitystoreClient} Singleton AWS Identitystore client
   */
  function configureAWSCredentials(): IdentitystoreClient {
    if (!client) {
      if (accessKeyId && secretAccessKey) {
        client = new IdentitystoreClient({
          region: region,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        });
      }
    }
    return client!;
  }
  
  /**
   * Creates the user in the Identity store.
   * @param {string} username - The username to create.
   * @param {string} email - The email to associate with the user.
   * @returns {Promise<any>} - The AWS response or error.
   */
  export const createUser = async (username: string, email: string): Promise<any> => {
    const client = configureAWSCredentials();
  
    const params: CreateUserCommandInput = {
      IdentityStoreId: identityStoreId,
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
      return (await client.send(command));
    } catch (error) {
      console.error(`The error from create user ${error}`);
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  /**
   * This function adds the user to the IAM group.
   * @param {string} groupId - The group ID to add the user to.
   * @param {string} userId - The user ID to add to the group.
   * @returns {Promise<any>} - The AWS response or error.
   */
export const addUserToGroup = async (groupId: string, awsUserId: string): Promise<any> => {
    const client = configureAWSCredentials();
  
    const params: CreateGroupMembershipCommandInput = {
      IdentityStoreId: identityStoreId,
      GroupId: groupId,
      MemberId: {
        UserId: awsUserId,
      },
    };
  
    try {
      const command = new CreateGroupMembershipCommand(params);
      return (await client.send(command));
    } catch (error) {
      if (error.__type === 'ConflictException'){
        return { conflict: true };
      }

      throw new Error(`Failed to add user to group: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  /**
   * Function to get UserId by username from AWS Identity Store.
   * @param {string} username - The username of the user.
   * @returns {Promise<string | null>} - The UserId if found, otherwise null.
   */
  export const fetchAwsUserIdByUsername = async (username: string): Promise<string | null> => {
    const client = configureAWSCredentials();
  
    const params: ListUsersCommandInput = {
      IdentityStoreId: identityStoreId,
      Filters: [
        {
          AttributePath: "UserName",
          AttributeValue: username,
        },
      ],
    };
    
    let response;
    try {
      response = await client.send(new ListUsersCommand(params));
    } catch (err) {
      throw new Error(`Error while fetching user by username: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (response.Users && response.Users.length > 0) {
      const userId = response.Users[0].UserId;
      return userId;
    } else {
      return null;
    }
  };
  