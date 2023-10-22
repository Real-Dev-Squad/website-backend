const chai = require("chai");
const chaiHttp = require("chai-http");

const userQuery = require("../../../models/users");
const members = require("../../../models/members");
const sinon = require("sinon");

const {
  retrieveUsers,
  removeSensitiveInfo,
  retrieveDiscordUsers,
  retrieveUsersWithRole,
  retrieveMembers,
  retreiveFilteredUsers,
  levelSpecificAccess,
  fetchUsersForKeyValues,
} = require("../../../services/dataAccessLayer");

const { KEYS_NOT_ALLOWED, ACCESS_LEVEL } = require("../../../constants/userDataLevels");

const userData = require("../../fixtures/user/user")();

chai.use(chaiHttp);
const expect = chai.expect;
let fetchUserStub;

describe("Data Access Layer", function () {
  describe("retrieveUsers", function () {
    it("should fetch a single user by ID and remove sensitive info", async function () {
      fetchUserStub = sinon.stub(userQuery, "fetchUser");
      fetchUserStub.returns(Promise.resolve({ user: userData[12] }));
      const result = await retrieveUsers({ id: userData[12].id });
      removeSensitiveInfo(userData[12]);
      expect(result.user).to.deep.equal(userData[12]);
      KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
        expect(result.user).to.not.have.property(key);
      });
    });

    it("should check if the given username is available and remove sensitive info", async function () {
      fetchUserStub.returns(Promise.resolve({ user: userData[12] }));
      const result = await retrieveUsers({ username: userData[12].username });
      removeSensitiveInfo(userData[12]);
      expect(result.user).to.deep.equal(userData[12]);
      KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
        expect(result.user).to.not.have.property(key);
      });
    });

    it("should fetch users by username and remove sensitive info", async function () {
      fetchUserStub = sinon.stub(userQuery, "fetchUsers");
      fetchUserStub.returns(Promise.resolve({ users: [userData[12]] }));
      const result = await retrieveUsers({ usernames: [userData[12].username] });
      removeSensitiveInfo(userData[12]);
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(user).to.not.have.property(key);
        });
      });
    });

    it("should fetch paginated users and remove sensitive info", async function () {
      fetchUserStub = sinon.stub(userQuery, "fetchPaginatedUsers");
      fetchUserStub.returns(Promise.resolve({ allUsers: [userData[12]], nextId: 3, prevId: 1 }));
      const query = { page: 1 };
      const result = await retrieveUsers({ query });
      removeSensitiveInfo(userData[12]);
      result.users.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(user).to.not.have.property(key);
        });
      });
    });

    it("should return /users/self data and remove sensitive info", async function () {
      const userdata = userData[12];
      await retrieveUsers({ userdata });
      removeSensitiveInfo(userData[12]);
      KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
        expect(userdata).to.not.have.property(key);
      });
    });
  });

  describe("retrieveDiscordUsers", function () {
    it("should fetch discord users and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "getDiscordUsers");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const result = await retrieveDiscordUsers();
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(user).to.not.have.property(key);
        });
      });
    });
  });

  describe("retrieveUsersWithRole", function () {
    it("should fetch users with role and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(members, "fetchUsersWithRole");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const query = { showArchived: true };
      const result = await retrieveUsersWithRole(query);
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(user).to.not.have.property(key);
        });
      });
    });
  });

  describe("retrieveMembers", function () {
    it("should fetch members and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(members, "fetchUsers");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const result = await retrieveMembers();
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(user).to.not.have.property(key);
        });
      });
    });

    it("should fetch multiple users details based on ids and remove sensitive data", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUserByIds");
      fetchUserStub.returns(Promise.resolve({ [userData[12].id]: userData[12] }));
      const result = await retrieveUsers({ userIds: [userData[12].id] });
      removeSensitiveInfo(userData[12]);
      Object.keys(result).forEach((id) => {
        expect(result[id]).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(result[id]).to.not.have.property(key);
        });
      });
    });

    it("should return empty object if array with no userIds are provided", async function () {
      const result = await retrieveUsers({ userIds: [] });
      expect(result).to.deep.equal({});
    });
  });

  describe("retrieveFilteredUsers", function () {
    it("should fetch query based filtered users and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "getUsersBasedOnFilter");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const query = { state: "ACTIVE" };
      const result = await retreiveFilteredUsers(query);
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
          expect(user).to.not.have.property(key);
        });
      });
    });
  });

  describe("removeSensitiveInfo", function () {
    it("should remove sensitive information from the users object", function () {
      removeSensitiveInfo(userData[12]);
      KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
        expect(userData[12]).to.not.have.property(key);
      });
    });
  });

  describe("levelSpecificAccess", function () {
    it("should return the user object for PUBLIC level after removing all sensitive info", function () {
      const result = levelSpecificAccess({ ...userData[12] }, ACCESS_LEVEL.PUBLIC);
      KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
        expect(result).to.not.have.property(key);
      });
    });

    it('should return "unauthorized" for non-superuser role', function () {
      const unauthorizedRole = "member";
      const result = levelSpecificAccess({ ...userData[12] }, ACCESS_LEVEL.PRIVATE, unauthorizedRole);
      expect(result).to.equal("unauthorized");
    });

    it("should keep sensitive info for valid role and level", function () {
      const user = { ...userData[12], email: "a@b.com", phone: "7890654329", chaincode: "78906" };
      const role = "super_user";
      const level = ACCESS_LEVEL.PRIVATE;
      const result = levelSpecificAccess(user, level, role);
      KEYS_NOT_ALLOWED[level].forEach((key) => {
        expect(result).to.not.have.property(key);
      });
      expect(result).to.have.property("phone");
      expect(result).to.have.property("email");
    });
  });

  describe("fetchUsersForKeyValues", function () {
    afterEach(async function () {
      sinon.restore();
    });
    it("should return list of users for a single value", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUserForKeyValue");
      fetchUserStub.returns(Promise.resolve([userData[12], userData[11]]));

      const usersList = await fetchUsersForKeyValues("discordId", "1234");

      expect(usersList.length).to.be.equal(2);
      expect(usersList).to.be.deep.equal([userData[12], userData[11]]);
    });

    it("should return list of users for a multiple value", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUsersListForMultipleValues");
      fetchUserStub.returns(Promise.resolve([userData[12], userData[11]]));

      const usersList = await fetchUsersForKeyValues("discordId", ["1234", "23434"]);

      expect(usersList.length).to.be.equal(2);
      expect(usersList).to.be.deep.equal([userData[12], userData[11]]);
    });

    it("should return list of users without sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUsersListForMultipleValues");
      fetchUserStub.returns(Promise.resolve([userData[12]]));

      const [user] = await fetchUsersForKeyValues("discordId", ["1234", "23434"]);

      KEYS_NOT_ALLOWED[ACCESS_LEVEL.PUBLIC].forEach((key) => {
        expect(user).to.not.have.property(key);
      });
    });

    it("should return list of users with sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUsersListForMultipleValues");
      fetchUserStub.returns(Promise.resolve([userData[1]]));

      const [user] = await fetchUsersForKeyValues("discordId", ["1234", "23434"], false);

      expect(user).to.be.deep.equal(userData[1]);
    });
  });
});
