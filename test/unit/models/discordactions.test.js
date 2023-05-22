const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const firestore = require("../../../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");

const {
  createNewRole,
  getAllGroupRoles,
  isGroupRoleExists,
  addGroupRoleToMember,
} = require("../../../models/discordactions");
const { groupData, roleData, existingRole } = require("../../fixtures/discordactions/discordactions");

describe("discordactions", function () {
  describe("createGroupRoles", function () {
    let addStub;

    beforeEach(function () {
      addStub = sinon.stub(discordRoleModel, "add").resolves({ id: "test-id" });
    });

    afterEach(function () {
      addStub.restore();
    });

    it("should create a new role in the database", async function () {
      const roleData = { name: "Test Role" };
      const result = await createNewRole(roleData);
      expect(result).to.deep.equal({ id: result.id, roleData });
    });

    it("should throw an error if creating role fails", async function () {
      const roleData = { name: "Test Role" };
      addStub.rejects(new Error("Database error"));
      return createNewRole(roleData).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("getAllGroupRoles", function () {
    let getStub;

    beforeEach(function () {
      getStub = sinon.stub(discordRoleModel, "get").resolves({
        forEach: (callback) => groupData.forEach(callback),
      });
    });

    afterEach(function () {
      getStub.restore();
    });

    it("should return all group-roles from the database", async function () {
      const result = await getAllGroupRoles();
      expect(result.groups).to.be.an("array");
    });

    it("should throw an error if getting group-roles fails", async function () {
      getStub.rejects(new Error("Database error"));
      return getAllGroupRoles().catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("isGroupRoleExists", function () {
    let getStub;

    beforeEach(function () {
      getStub = sinon.stub(discordRoleModel, "where").returns({
        limit: sinon.stub().resolves({
          empty: true,
          forEach: sinon.stub(),
        }),
      });
    });

    afterEach(function () {
      getStub.restore();
    });

    it("should return true if role doesn't exist in the database", async function () {
      const result = await isGroupRoleExists("Test Role");
      expect(result.wasSuccess).to.equal(true);
      expect(getStub.calledOnceWith("rolename", "==", "Test Role")).to.equal(false);
    });

    it("should return false if role already exists in the database", async function () {
      const existingRole = { rolename: "Test Role" };
      const callbackFunction = (role) => {
        const roleData = role.data();
        existingRole.push(roleData);
      };

      getStub.returns({
        limit: sinon.stub().resolves({
          empty: false,
          forEach: callbackFunction,
        }),
      });

      const errorCallback = sinon.stub();
      const result = await isGroupRoleExists("Test Role");
      expect(result.wasSuccess).to.equal(true);
      expect(getStub.calledOnceWith("rolename", "==", "Test Role")).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(false);
    });

    it("should throw an error if getting group-roles fails", async function () {
      getStub.rejects(new Error("Database error"));
      return isGroupRoleExists("Test Role").catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("addGroupRoleToMember", function () {
    let getStub, addStub;

    beforeEach(function () {
      getStub = sinon.stub(memberRoleModel, "where");
      addStub = sinon.stub(memberRoleModel, "add");
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should add role to member and return success", async function () {
      getStub.resolves({
        empty: true,
      });
      addStub.resolves();

      const result = await addGroupRoleToMember(roleData);

      expect(result.wasSuccess).to.equal(true);
      expect(result.roleData).to.deep.equal(roleData);
    });

    it("should return existing role if user already has the role", async function () {
      const callbackFunction = (role) => {
        existingRole.roleData = role.data();
      };

      getStub.returns({
        limit: sinon.stub().resolves({
          empty: false,
          forEach: callbackFunction,
        }),
      });
      const result = await addGroupRoleToMember(roleData);
      delete result.id;

      expect(result).to.deep.equal(existingRole);
    });

    it("should throw an error if adding role fails", async function () {
      const error = new Error("Database error");
      getStub.resolves({
        empty: true,
      });
      addStub.rejects(error);

      return addGroupRoleToMember(roleData).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });
});
