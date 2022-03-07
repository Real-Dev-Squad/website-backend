const chai = require("chai");
const { expect } = chai;

const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");
const members = require("../../../models/members");
const { ROLES } = require("../../../constants/users");
const userData = require("../../fixtures/user/user")();
// const firestore = require("../../../utils/firestore");
// const userModel = firestore.collection("users");

describe("members", function () {
  let user;
  beforeEach(async function () {
    user = await addUser();
  });
  after(async function () {
    await cleanDb();
  });

  describe("fetchUsers", function () {
    it("should return all the users", async function () {
      const result = await members.fetchUsers();
      const user = result[0];

      expect(result).to.be.a("array");
      expect(user.first_name).to.be.a("string");
      expect(user.last_name).to.be.a("string");
      expect(user.username).to.be.a("string");
      expect(user.isMember).to.be.a("boolean");
    });
  });

  describe("fetchUserWithRole", function () {
    it("should return user with role:member", async function () {
      const result = await members.fetchUsersWithRole(ROLES.MEMBER);
      const user = result[0];

      expect(result).to.be.a("array");
      expect(user.first_name).to.be.a("string");
      expect(user.last_name).to.be.a("string");
      expect(user.isMember).to.be.equal(true);
    });
    it("should return empty array", async function () {
      const result = await members.fetchUsersWithRole(undefined);

      expect(result).to.be.a("array").of.length(0);
    });
  });

  describe("moveToMember", function () {
    let user2;
    beforeEach(async function () {
      user2 = await addUser(userData[2]);
    });
    it("should not move the user to member if already a member", async function () {
      const response = await members.moveToMembers(user);

      expect(response).to.be.a("object");
      expect(response.isAlreadyMember).to.be.equal(true);
      expect(response.movedToMember).to.be.equal(false);
    });
    it("should move the user to member if already not a member", async function () {
      const response = await members.moveToMembers(user2);

      expect(response).to.be.a("object");
      expect(response.isAlreadyMember).to.be.equal(false);
      expect(response.movedToMember).to.be.equal(true);
    });
  });

  describe("migrateUsers", function () {
    it("should do member to role migration", async function () {
      const response = await members.migrateUsers();

      expect(response).to.be.a("object");
      expect(response.count).to.be.a("number");
      expect(response.users).to.be.a("array");
    });
  });

  describe("deleteIsMemberProperty", function () {
    it("should delete isMember property of user", async function () {
      const response = await members.deleteIsMemberProperty();

      expect(response).to.be.a("object");
      expect(response.count).to.be.a("number");
      expect(response.users).to.be.a("array");
    });
  });

  describe("addArchiveRoleToMembers", function () {
    it("should add role of archivedMember=true", async function () {
      const response = await members.addArchiveRoleToMembers(user);

      expect(response).to.be.a("object");
      expect(response.isArchived).to.be.a("boolean");
    });
  });
});
