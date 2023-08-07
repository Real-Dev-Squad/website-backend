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
  ACCESS_LEVEL,
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
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
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
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(user).to.not.have.property(key);
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
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
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
        USER_SENSITIVE_DATA.forEach((key) => {
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
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(user).to.not.have.property(key);
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
      result.forEach((user) => {
        expect(user).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(user).to.not.have.property(key);
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
    it("should return default user fields if email does not exist in userdata and INTERNAL access requested", function () {
      const data = {};
      const result = privilegedAccess(userData[11], data, ACCESS_LEVEL.INTERNAL);
      expect(result.email).to.equal(undefined);
    });

    it("should set only email for INTERNAL access if email exists", function () {
      const data = {
        email: "test@test.com",
      };
      const result = privilegedAccess(userData[11], data, ACCESS_LEVEL.INTERNAL);
      expect(result).to.have.property("email");
    });

    it("should set email and phone for PRIVATE access if email and phone exists", function () {
      const data = {
        email: "test@test.com",
        phone: "1234567890",
      };
      const result = privilegedAccess(userData[11], data, ACCESS_LEVEL.PRIVATE);
      expect(result).to.have.property("email");
      expect(result).to.have.property("phone");
    });

    it("should set email, phone, and chaincode for CONFIDENTIAL access if email,phone and chaincode exists", function () {
      const data = {
        email: "test@test.com",
        phone: "1234567890",
        chaincode: "abc7896",
      };
      const result = privilegedAccess(userData[11], data, ACCESS_LEVEL.CONFIDENTIAL);
      expect(result).to.have.property("email");
      expect(result).to.have.property("phone");
      expect(result).to.have.property("chaincode");
    });
  });

  describe("levelSpecificAccess", function () {
    it("should return the user object for PUBLIC level after removing all sensitive info", function () {
      const result = levelSpecificAccess(userData[12], ACCESS_LEVEL.PUBLIC);
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(result).to.not.have.property(key);
      });
    });

    it('should return "unauthorized" for non-superuser role', function () {
      const unauthorizedRole = { role: { super_user: false } };
      const result = levelSpecificAccess(userData[12], ACCESS_LEVEL.PRIVATE, unauthorizedRole);
      expect(result).to.equal("unauthorized");
    });

    it("should call privilegedAccess for INTERNAL level and super_user role", function () {
      userData[11].email = "test@test.com";
      const role = { super_user: true };
      const result = levelSpecificAccess(userData[11], ACCESS_LEVEL.INTERNAL, role);
      expect(result).to.have.property("email");
    });

    it("should call privilegedAccess for PRIVATE level and super_user role", function () {
      userData[11].email = "test@test.com";
      userData[11].phone = "8976509889";
      const role = { super_user: true };
      const user = levelSpecificAccess(userData[11], ACCESS_LEVEL.PRIVATE, role);
      expect(user).to.have.property("email");
      expect(user).to.have.property("phone");
    });

    it("should call privilegedAccess for CONFIDENTIAL level and super_user role", function () {
      userData[11].email = "test@test.com";
      userData[11].phone = "8976509889";
      userData[11].chaincode = "1234567";
      const role = { super_user: true };
      const user = levelSpecificAccess(userData[11], ACCESS_LEVEL.CONFIDENTIAL, role);
      expect(user).to.have.property("email");
      expect(user).to.have.property("phone");
      expect(user).to.have.property("chaincode");
    });
  });
});
