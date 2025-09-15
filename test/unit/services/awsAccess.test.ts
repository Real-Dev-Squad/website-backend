import { expect } from 'chai';
import sinon from 'sinon';
import {
  IdentitystoreClient,
  ListUsersCommand,
  CreateUserCommand,
  CreateGroupMembershipCommand,
} from "@aws-sdk/client-identitystore";
import {
  createUser,
  addUserToGroup,
  fetchAwsUserIdByUsername,
} from "../../../utils/awsFunctions.js";

describe('AWS Identity Store Functions', () => {
  let sendStub: sinon.SinonStub;

  beforeEach(() => {
    sinon.restore();
    
    // Create a stub for the send method
    sendStub = sinon.stub(IdentitystoreClient.prototype, 'send');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('fetchAwsUserIdByUsername', () => {
    it('should return userId when user is found', async () => {
      const mockResponse = {
        Users: [{
          UserId: 'test-user-id-123',
          UserName: 'testuser'
        }]
      };
      sendStub.resolves(mockResponse);

      const result = await fetchAwsUserIdByUsername('testuser');
      expect(result).to.equal('test-user-id-123');
      expect(sendStub.calledOnce).to.be.true;
      expect(sendStub.firstCall.args[0]).to.be.instanceOf(ListUsersCommand);
    });

    it('should return null when no user is found', async () => {
      const mockResponse = { Users: [] };
      sendStub.resolves(mockResponse);

      const result = await fetchAwsUserIdByUsername('nonexistentuser');
      expect(result).to.be.null;
    });

    it('should throw error when AWS call fails', async () => {
      sendStub.rejects(new Error('AWS Error'));

      try {
        await fetchAwsUserIdByUsername('testuser');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('Error while fetching user by username');
      }
    });
  });
  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const mockResponse = {
        UserId: 'new-user-id-123',
        UserName: 'newuser'
      };
      sendStub.resolves(mockResponse);

      const result = await createUser('newuser', 'newuser@example.com');
      expect(result).to.deep.equal(mockResponse);
      expect(sendStub.calledOnce).to.be.true;
      expect(sendStub.firstCall.args[0]).to.be.instanceOf(CreateUserCommand);
    });
    
    it('should throw error when user creation fails', async () => {
      sendStub.rejects(new Error('Creation Failed'));

      try {
        await createUser('newuser', 'newuser@example.com');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('Failed to create user');
      }
    });
  });
  describe('addUserToGroup', () => {
    it('should successfully add user to group', async () => {
      const mockResponse = {
        MembershipId: 'membership-123'
      };
      sendStub.resolves(mockResponse);

      const result = await addUserToGroup('group-123', 'user-123');
      expect(result).to.deep.equal(mockResponse);
      expect(sendStub.calledOnce).to.be.true;
      expect(sendStub.firstCall.args[0]).to.be.instanceOf(CreateGroupMembershipCommand);
    });

    it('should handle conflict exception', async () => {
      const error = new Error('Conflict');
      (error as any).__type = 'ConflictException';
      sendStub.rejects(error);

      const result = await addUserToGroup('group-123', 'user-123');
      expect(result).to.deep.equal({ conflict: true });
    });

    it('should throw error for non-conflict failures', async () => {
      sendStub.rejects(new Error('Other Error'));

      try {
        await addUserToGroup('group-123', 'user-123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('Failed to add user to group');
      }
    });
  });
});

