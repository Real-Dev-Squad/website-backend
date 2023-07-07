const chai = require("chai");
const sinon = require("sinon");
// const admin = require("firebase-admin");
const { expect } = chai;
const firestore = require("../../../utils/firestore");
const userStatusModel = firestore.collection("usersStatus");
const tasksModel = firestore.collection("tasks");
const {
  updateStatusOnTaskCompletion,
  updateUserStatusOnNewTaskAssignment,
  updateUserStatusOnTaskUpdate,
  getUsersWithoutAssignedOrInProgressTasks,
} = require("../../../models/userStatus");
const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const { userState } = require("../../../constants/userStatus");
const userData = require("../../fixtures/user/user");
const allTasks = require("../../fixtures/tasks/tasks");
const { generateStatusDataForState } = require("../../fixtures/userStatus/userStatus");

describe("Update Status based on task update", function () {
  describe("Tests for the Model Function to Update Status Based on Task Completion", function () {
    let userId;
    let taskArr;
    beforeEach(async function () {
      userId = await addUser(userData()[6]);
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

  describe("Test the Model Function for Status update on Task Assignment/Update", function () {
    let userId;
    beforeEach(async function () {
      const userInfo = userData()[6];
      userId = await addUser(userInfo);
    });
    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });
    it("Should Create a new user status Document with status ACTIVE if the status document doesn't exist.", async function () {
      const res = await updateUserStatusOnNewTaskAssignment(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal(
        "UserStatus Document did not previously exist, New UserStatus Document created and updated to an ACTIVE status."
      );
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change the Future Status to ACTIVE if the user is currently OOO .", async function () {
      const statusData = await generateStatusDataForState(userId, userState.OOO);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateUserStatusOnNewTaskAssignment(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("As the user is currently OOO, the future status has been updated to ACTIVE.");
      expect(res.data.currentStatus).to.equal(userState.OOO);
      expect(res.data.futureStatus).to.equal(userState.ACTIVE);
    });

    it("Should not change the ACTIVE state if the user is already ACTIVE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.ACTIVE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateUserStatusOnNewTaskAssignment(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status is already ACTIVE");
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change the status to ACTIVE if the status is not ACTIVE i.e IDLE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.IDLE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await updateUserStatusOnNewTaskAssignment(userId);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status has been updated to ACTIVE");
      expect(res.data.previousStatus).to.equal(userState.IDLE);
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should throw an error if the user status Query fails.", async function () {
      sinon.stub(userStatusModel, "where").throws(new Error("Unable to retrieve the current status"));
      await updateUserStatusOnNewTaskAssignment(userId).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.be.equal("Unable to retrieve the current status");
      });
    });

    it("Should throw an error to if an invalid state is set in the Status", async function () {
      const statusData = await generateStatusDataForState(userId, "InvalidState");
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      await updateUserStatusOnNewTaskAssignment(userId).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.be.equal(
          "Please reach out to the administrator as your user status is not recognized as valid."
        );
      });
    });

    it("Should give NotFound message if the userName is invalid.", async function () {
      const res = await updateUserStatusOnTaskUpdate("funkeyMonkey123");
      expect(res).to.deep.equal({
        status: 404,
        error: "Not Found",
        message: "Something went wrong. Username funkeyMonkey123 could not be found.",
      });
    });

    it("Should return an valid status if the userName is valid.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.IDLE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const userName = userData()[6].username;
      const res = await updateUserStatusOnTaskUpdate(userName);
      expect(res.status).to.equal("success");
      expect(res.message).to.equal("The status has been updated to ACTIVE");
      expect(res.data.previousStatus).to.equal(userState.IDLE);
      expect(res.data.currentStatus).to.equal(userState.ACTIVE);
    });
  });

  describe("getUsersWithoutAssignedOrInProgressTasks", function () {
    let userId1;
    let userId2;
    let userId3;

    beforeEach(async function () {
      const userArr = userData();
      userId1 = await addUser(userArr[6]);
      userId2 = await addUser(userArr[8]);
      userId3 = await addUser(userArr[9]);
      const taskArr = allTasks();

      const sampleTask1 = taskArr[0];
      sampleTask1.assignee = userId1;
      sampleTask1.status = "ASSIGNED";

      const sampleTask2 = taskArr[1];
      sampleTask2.assignee = userId2;
      sampleTask2.status = "IN_PROGRESS";

      const sampleTask3 = taskArr[2];
      sampleTask3.assignee = userId3;
      sampleTask3.status = "COMPLETED";

      await firestore.collection("tasks").doc("taskId001").set(sampleTask1);
      await firestore.collection("tasks").doc("taskId002").set(sampleTask2);
      await firestore.collection("tasks").doc("taskId003").set(sampleTask3);
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should return the correct results when there are no errors", async function () {
      const result = await getUsersWithoutAssignedOrInProgressTasks();
      expect(result.totalValidUsersCount).to.equal(3);
      expect(result.usersWithoutAssignedOrInProgressTasksCount).to.equal(1);
      expect(result.usersWithoutAssignedOrInProgressTasks).to.deep.equal([userId3]);
      expect(result.usersNotProcessedCount).to.equal(0);
      expect(result.usersNotProcessed).to.deep.equal([]);
    });

    it("should return the correct results when there are errors", async function () {
      // const usersCollection = firestore.collection("users");
      // ----------------------------------------------------------------------------------------
      // sinon.stub(usersCollection, "get").throws(new Error("Unable to fetch users"));
      // ----------------------------------------------------------------------------------------
      // sinon.stub(usersCollection, "where").callsFake((query) => {
      // console.log("Stubbed get method called");
      //   if (query.where("roles.in_discord", "==", true) && query.where("roles.archived", "==", false)) {
      //     throw new Error("Unable to fetch users");
      //   } else {
      //     return usersCollection.get();
      //   }
      // });
      // ----------------------------------------------------------------------------------------
      // sinon.stub(usersCollection, "get").callsFake(() => {
      //   console.log("Stubbed get method called");
      //   throw new Error("Unable to fetch users");
      // });
      // ----------------------------------------------------------------------------------------
      // sinon.stub(usersCollection, "where").returns(usersCollection);
      // sinon.stub(usersCollection, "get").throws(new Error("Unable to fetch users"));
      // ----------------------------------------------------------------------------------------
      // sinon.stub(usersCollection, "where").returnsThis();
      // sinon.stub(usersCollection, "get").throws(new Error("Unable to fetch users"));
      // ----------------------------------------------------------------------------------------
      // sinon.stub(usersCollection, "where").callsFake((query) => {
      //   console.log("Stubbed where method called with query:", query);
      //   return usersCollection;
      // });
      // sinon.stub(usersCollection, "get").callsFake(() => {
      //   console.log("Stubbed get method called");
      //   throw new Error("Unable to fetch users");
      // });
      // ----------------------------------------------------------------------------------------
      // const queryStub = sinon.stub().throws(new Error('Unable to fetch users'));
      // sinon.stub(usersCollection, 'where').returns({ get: queryStub });
      // ----------------------------------------------------------------------------------------
      // Mocking the entire firestore to throw an error
      // sinon.stub(admin, 'initializeApp').throws(new Error('Unable to initializeApp'));
      // sinon.stub(admin, 'initializeApp').callsFake(() => {
      //   console.log("Stubbed initializeApp");
      //   throw new Error("Unable to initializeApp");
      // });
      // ----------------------------------------------------------------------------------------
      // const result = await getUsersWithoutAssignedOrInProgressTasks();
      // expect(result).to.deep.equal(expectedResult);
    });
  });
});
