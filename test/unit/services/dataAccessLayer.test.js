const chai = require("chai");
const chaiHttp = require("chai-http");

const userQuery = require("../../../models/users");
const sinon = require("sinon");
const { retrieveUsers, removeSensitiveInfo } = require("../../../services/dataAccessLayer");
const userData = require("../../fixtures/user/user")();
const remove = require("../../fixtures/user/removalData")();
chai.use(chaiHttp);
const expect = chai.expect;

describe("Data Access Layer", function () {
  describe("retrieveUsers", function () {
    it("should fetch a single user by ID and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUser");
      fetchUserStub.returns(Promise.resolve({ user: userData[12] }));

      const result = await retrieveUsers({ id: userData[12].id });
      removeSensitiveInfo(userData[12]);
      expect(result.user).to.deep.equal(userData[12]);
      remove.forEach((key) => {
        expect(userData[12]).to.not.have.property(key);
      });
    });

    it("should fetch users by username and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchUsers");
      fetchUserStub.returns(Promise.resolve({ users: [userData[12]] }));
      const result = await retrieveUsers({ usernames: [userData[12].username] });
      removeSensitiveInfo(userData[12]);
      result.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        remove.forEach((key) => {
          expect(userData[12]).to.not.have.property(key);
        });
      });
    });

    it("should fetch paginated users and remove sensitive info", async function () {
      const fetchUserStub = sinon.stub(userQuery, "fetchPaginatedUsers");
      fetchUserStub.returns(Promise.resolve({ allUsers: [userData[12]], nextId: 3, prevId: 1 }));
      const query = { page: 1 };
      const result = await retrieveUsers({ query });
      removeSensitiveInfo(userData[12]);
      result.allUsers.forEach((element) => {
        expect(element).to.deep.equal(userData[12]);
        remove.forEach((key) => {
          expect(userData[12]).to.not.have.property(key);
        });
      });
    });
  });

  describe("removeSensitiveInfo", function () {
    it("should remove sensitive information from the users object", function () {
      removeSensitiveInfo(userData);
      remove.forEach((key) => {
        expect(userData[12]).to.not.have.property(key);
      });
    });
  });
});
