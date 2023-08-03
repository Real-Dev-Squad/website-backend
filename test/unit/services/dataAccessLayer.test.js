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
  privilegedAccess,
  levelSpecificAccess,
  AccessLevel,
} = require("../../../services/dataAccessLayer");

const userData = require("../../fixtures/user/user")();
const { USER_SENSITIVE_DATA } = require("../../../constants/users");

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
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(result.user).to.not.have.property(key);
      });
    });

    it("should check if the given username is available and remove sensitive info", async function () {
      fetchUserStub.returns(Promise.resolve({ user: userData[12] }));
      const result = await retrieveUsers({ username: userData[12].username });
      removeSensitiveInfo(userData[12]);
      expect(result.user).to.deep.equal(userData[12]);
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(result.user).to.not.have.property(key);
      });
    });

    it("should fetch users by username and remove sensitive info", async function () {
      fetchUserStub = sinon.stub(userQuery, "fetchUsers");
      fetchUserStub.returns(Promise.resolve({ users: [userData[12]] }));
      const result = await retrieveUsers({ usernames: [userData[12].username] });
      removeSensitiveInfo(userData[12]);
      result.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(element).to.not.have.property(key);
        });
      });
    });

    it("should fetch paginated users and remove sensitive info", async function () {
      fetchUserStub = sinon.stub(userQuery, "fetchPaginatedUsers");
      fetchUserStub.returns(Promise.resolve({ allUsers: [userData[12]], nextId: 3, prevId: 1 }));
      const query = { page: 1 };
      const result = await retrieveUsers({ query });
      removeSensitiveInfo(userData[12]);
      result.users.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(element).to.not.have.property(key);
        });
      });
    });

    it("should return /users/self data and remove sensitive info", async function () {
      const userdata = userData[12];
      await retrieveUsers({ userdata });
      removeSensitiveInfo(userData[12]);
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(userdata).to.not.have.property(key);
      });
    });
  });

  describe("retrieveDiscordUsers", function () {
    it("should fetch discord users and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "getDiscordUsers");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const result = await retrieveDiscordUsers();
      result.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(element).to.not.have.property(key);
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
      result.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(element).to.not.have.property(key);
        });
      });
    });
  });

  describe("retrieveMembers", function () {
    it("should fetch members and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(members, "fetchUsers");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const result = await retrieveMembers();
      result.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(element).to.not.have.property(key);
        });
      });
    });
  });

  describe("retrieveFilteredUsers", function () {
    it("should fetch query based filtered users and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "getUsersBasedOnFilter");
      fetchUserStub.returns(Promise.resolve([userData[12]]));
      const query = { state: "ACTIVE" };
      const result = await retreiveFilteredUsers(query);
      result.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(element).to.not.have.property(key);
        });
      });
    });
  });

  describe("removeSensitiveInfo", function () {
    it("should remove sensitive information from the users object", function () {
      removeSensitiveInfo(userData);
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(userData[12]).to.not.have.property(key);
      });
    });
  });

  describe("privilegedAccess", function () {
    const data = {
      email: "test@test.com",
      phone: "1234567890",
      chaincode: "abc7896",
    };
    it("should set only email for INTERNAL access", function () {
      const result = privilegedAccess(userData[11], data, AccessLevel.INTERNAL);
      expect(result).to.have.property("email");
    });

    it("should set email and phone for PRIVATE access", function () {
      const result = privilegedAccess(userData[11], data, AccessLevel.PRIVATE);
      expect(result).to.have.property("email");
      expect(result).to.have.property("phone");
    });

    it("should set email, phone, and chaincode for CONFIDENTIAL access", function () {
      const result = privilegedAccess(userData[11], data, AccessLevel.CONFIDENTIAL);
      expect(result).to.have.property("email");
      expect(result).to.have.property("phone");
      expect(result).to.have.property("chaincode");
    });
  });

  describe("levelSpecificAccess", function () {
    it("should return the user object for PUBLIC level after removing all sensitive info", function () {
      const result = levelSpecificAccess(userData[12], AccessLevel.PUBLIC);
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(result).to.not.have.property(key);
      });
    });

    it('should return "unauthorized" for non-superuser role', function () {
      const unauthorizedRole = { role: { super_user: false } };
      const result = levelSpecificAccess(userData[12], AccessLevel.PRIVATE, unauthorizedRole);
      expect(result).to.equal("unauthorized");
    });

    it("should call privilegedAccess for PRIVATE level and super_user role", function () {
      userData.email = "test@test.com";
      userData.phone = "8976509889";
      const role = { super_user: true };
      const user = levelSpecificAccess(userData[11], AccessLevel.PRIVATE, role);
      expect(user).to.have.property("email");
      expect(user).to.have.property("phone");
    });
  });
});
