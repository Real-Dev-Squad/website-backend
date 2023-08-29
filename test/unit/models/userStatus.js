const chai = require("chai");
const sinon = require("sinon");
const { NotFound, Forbidden } = require("http-errors");
const { expect } = chai;
const firestore = require("../../../utils/firestore");
const userStatusModel = firestore.collection("usersStatus");
const tasksModel = firestore.collection("tasks");
const { cancelOooStatus } = require("../../../models/userStatus");
const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const { userState } = require("../../../constants/userStatus");
const { generateStatusDataForCancelOOO } = require("../../fixtures/userStatus/userStatus");

describe("tasks", function () {
  let userId;
  let docRefUser0;
  beforeEach(async function () {
    userId = await addUser();
    docRefUser0 = userStatusModel.doc();
    const data = generateStatusDataForCancelOOO(userId, userState.OOO);
    await docRefUser0.set(data);
  });
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  it("Should cancel the OOO Status of the User", async function () {
    const response = await cancelOooStatus(userId);
    expect(response.userStatusExists).to.equal(true);
    expect(response.data.userId).to.equal(userId);
    expect(response.data.currentStatus).to.not.equal(userState.OOO);
  });

  it("should throw an error if unable to fetch the user status document", async function () {
    sinon.stub(userStatusModel, "where").throws(new Error("Unable to fetch user status document"));
    await cancelOooStatus(userId).catch((err) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.be.equal("Unable to fetch user status document");
    });
  });

  it("Should throw error when no User status document found", async function () {
    await cancelOooStatus("randomUserId").catch((err) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err).to.be.an.instanceOf(NotFound);
      expect(err.message).to.be.equal("No User status document found");
    });
  });

  it("Should throw an error if the status is not OOO", async function () {
    const data = generateStatusDataForCancelOOO(userId, userState.ACTIVE);
    await docRefUser0.set(data);
    await cancelOooStatus(userId).catch((err) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err).to.be.an.instanceOf(Forbidden);
      expect(err.message).to.be.equal("The OOO Status cannot be canceled because the current status is ACTIVE.");
    });
  });

  it("should throw an error if unable to fetch task assigned to user.", async function () {
    sinon.stub(tasksModel, "where").throws(new Error("Task not found"));
    await cancelOooStatus(userId).catch((err) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.be.equal("Task not found");
    });
  });
});
