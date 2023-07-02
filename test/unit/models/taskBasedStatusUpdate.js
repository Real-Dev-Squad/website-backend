const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const firestore = require("../../../utils/firestore");
const userStatusModel = firestore.collection("usersStatus");
const tasksModel = firestore.collection("tasks");
const { updateStatusOnTaskCompletion } = require("../../../models/userStatus");
const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const { userState } = require("../../../constants/userStatus");
const userData = require("../../fixtures/user/user");
const allTasks = require("../../fixtures/tasks/tasks");
const { generateStatusDataForState } = require("../../fixtures/userStatus/userStatus");

describe("Tests for the Model Function to Update Status Based on Task Completion", function () {
  let userId;
  let taskArr;
  beforeEach(async function () {
    userId = await addUser(userData[6]);
    taskArr = allTasks();
  });
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("Should throw an error in case of Query fails.", function () {
    it("Should throw an error if the task db query fails.", async function () {
      sinon.stub(tasksModel, "where").throws(new Error("Unable to fetch task"));
      await updateStatusOnTaskCompletion(userId).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.be.equal("Unable to fetch task");
      });
    });

    it("Should throw an error if the user status db query fails.", async function () {
      sinon.stub(userStatusModel, "where").throws(new Error("Unable to fetch user status"));
      await updateStatusOnTaskCompletion(userId).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.be.equal("Unable to fetch task");
      });
    });
  });

  describe("User is IDLE without any Task", function () {
    it("Should Create a new user status Document with status IDLE if the status document doesn't exist & the user is IDLE.", async function () {
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal(
        "UserStatus Document did not previously exist, New UserStatus Document created and updated to an IDLE status."
      );
      expect(res.data.currentStatus).to.equal(userState.IDLE);
    });

    it("Should change the Future Status to IDLE if no other task is assigned to the user and the user is currently OOO .", async function () {
      const statusData = await generateStatusDataForState(userId, userState.OOO);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("As the user is currently OOO, the future status has been updated to IDLE.");
      expect(res.data.currentStatus).to.equal(userState.OOO);
      expect(res.data.futureStatus).to.equal(userState.IDLE);
    });

    it("Should not change the IDLE state if no other task is assigned to the user.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.IDLE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status is already IDLE");
      expect(res.data.currentStatus).to.equal(userState.IDLE);
    });

    it("Should not change the ACTIVE state to IDLE if no other task is assigned to the user.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.ACTIVE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status has been updated to IDLE");
      expect(res.data.previousStatus).to.equal(userState.ACTIVE);
      expect(res.data.currentStatus).to.equal(userState.IDLE);
    });
  });

  describe("User has an Active Task", function () {
    beforeEach(async function () {
      const sampleTask1 = taskArr[0];
      sampleTask1.assignee = userId;
      const taskDocId1 = tasksModel.doc();
      await taskDocId1.set(sampleTask1);
    });

    it("Should Create a new user status Document with status ACTIVE if the status document doesn't exist & the user is ACTIVE.", async function () {
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal(
        "UserStatus Document did not previously exist, New UserStatus Document created and updated to an ACTIVE status."
      );
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change the Future Status to ACTIVE if another task is assigned to the user and the user is currently OOO .", async function () {
      const statusData = await generateStatusDataForState(userId, userState.OOO);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("As the user is currently OOO, the future status has been updated to ACTIVE.");
      expect(res.data.currentStatus).to.equal(userState.OOO);
      expect(res.data.futureStatus).to.equal(userState.ACTIVE);
    });

    it("Should not change the ACTIVE state if the user is already ACTIVE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.ACTIVE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status is already ACTIVE");
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change to ACTIVE state if the user is not ACTIVE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.IDLE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateStatusOnTaskCompletion(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status has been updated to ACTIVE");
      expect(res.data.previousStatus).to.equal(userState.IDLE);
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });
  });
});
