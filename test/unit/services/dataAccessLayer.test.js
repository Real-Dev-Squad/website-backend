const chai = require("chai");
const chaiHttp = require("chai-http");

const userQuery = require("../../../models/users");
const members = require("../../../models/members");
const sinon = require("sinon");
const { retrieveUsers, removeSensitiveInfo, retrieveDiscordUsers, retrieveUsersWithRole, retrieveMembers } = require("../../../services/dataAccessLayer");
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
        expect(userData[12]).to.not.have.property(key);
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
          expect(userData[12]).to.not.have.property(key);
        });
      });
    });

    it("should fetch paginated users and remove sensitive info", async function () {
      fetchUserStub = sinon.stub(userQuery, "fetchPaginatedUsers");
      fetchUserStub.returns(Promise.resolve({ allUsers: [userData[12]], nextId: 3, prevId: 1 }));
      const query = { page: 1 };
      const result = await retrieveUsers({ query });
      removeSensitiveInfo(userData[12]);
      result.allUsers.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        USER_SENSITIVE_DATA.forEach((key) => {
          expect(userData[12]).to.not.have.property(key);
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
      const query = {showArchived : true};
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

  describe("removeSensitiveInfo", function () {
    it("should remove sensitive information from the users object", function () {
      removeSensitiveInfo(userData);
      USER_SENSITIVE_DATA.forEach((key) => {
        expect(userData[12]).to.not.have.property(key);
      });
    });
  });
});
