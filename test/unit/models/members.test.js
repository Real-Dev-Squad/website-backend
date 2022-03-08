const chai = require("chai");
const { expect } = chai;

const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");
const members = require("../../../models/members");
const { ROLES } = require("../../../constants/users");
const userDataArray = require("../../fixtures/user/user")();

describe("members", function () {
  let user;
  const ignoreKeys = ["phone", "email", "tokens"];
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
      const userData = userDataArray[0];

      expect(result).to.be.a("array");
      Object.keys(userData).forEach((key) => {
        if (!ignoreKeys.includes(key)) {
          expect(user[parseInt(key) || key]).to.deep.equal(userData[parseInt(key) || key]);
        } else {
          expect(user[parseInt(key) || key]).to.be.equal(undefined);
        }
      });
    });
  });

  describe("fetchUserWithRole", function () {
    it("should return user with role:member", async function () {
      const result = await members.fetchUsersWithRole(ROLES.MEMBER);
      const user = result[0];
      const userData = userDataArray[0];

      expect(result).to.be.a("array");
      Object.keys(userData).forEach((key) => {
        if (!ignoreKeys.includes(key)) {
          expect(userData[parseInt(key) || key]).to.deep.equal(user[parseInt(key) || key]);
        } else {
          expect(user[parseInt(key) || key]).to.be.equal(undefined);
        }
      });
      expect(user.roles[ROLES.MEMBER]).to.be.equal(true);
    });
    it("should return empty array", async function () {
      const result = await members.fetchUsersWithRole(undefined);

      expect(result).to.be.a("array").of.length(0);
    });
  });

  describe("moveToMember", function () {
    let user2;
    beforeEach(async function () {
      user2 = await addUser(userDataArray[2]);
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
      expect(response.users[0]).to.be.equal(userDataArray[0].username);
    });
  });

  describe("deleteIsMemberProperty", function () {
    it("should delete isMember property of user", async function () {
      const response = await members.deleteIsMemberProperty();

      expect(response).to.be.a("object");
      expect(response.count).to.be.a("number");
      expect(response.users).to.be.a("array");
      expect(response.users[0]).to.be.equal(userDataArray[0].username);
    });
  });

  describe("addArchiveRoleToMembers", function () {
    let user2;
    beforeEach(async function () {
      user2 = await addUser(userDataArray[5]);
    });
    it("should add role of archivedMember=true", async function () {
      const response = await members.addArchiveRoleToMembers(user);

      expect(response).to.be.a("object");
      expect(response.isArchived).to.be.equal(false);
    });

    it("should not add a role of archivedMember if already exist", async function () {
      const response = await members.addArchiveRoleToMembers(user2);

      expect(response).to.be.a("object");
      expect(response.isArchived).to.be.equal(true);
    });
  });
});
