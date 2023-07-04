const chai = require("chai");
const { expect } = chai;
const firestore = require("../../utils/firestore");
const addUser = require("../utils/addUser");
const authService = require("../../services/authService");
const userData = require("../fixtures/user/user")();
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const { generateStatusDataForState } = require("../fixtures/userStatus/userStatus");
const allTasks = require("../fixtures/tasks/tasks");
const { userState } = require("../../constants/userStatus");
const cookieName = config.get("userToken.cookieName");

describe("Task Based Status Updates", function () {
  describe("PATCH /tasks/self/:taskId - Update User Status Document on marking Task as Completed.", function () {
    let userId;
    let superUserId;
    let userJwt;
    let taskArr;
    const reqBody = {
      status: "COMPLETED",
      percentCompleted: 100,
    };

    beforeEach(async function () {
      userId = await addUser(userData[6]);
      userJwt = authService.generateAuthToken({ userId });
      superUserId = await addUser(userData[4]);
      taskArr = allTasks();
      const sampleTask1 = taskArr[0];
      sampleTask1.assignee = userId;
      sampleTask1.createdBy = superUserId;
      await firestore.collection("tasks").doc("taskid123").set(sampleTask1);
    });

    afterEach(async function () {
      await cleanDb();
    });

    describe("User is IDLE without any Task", function () {
      it("Should Create a new user status Document with status IDLE if the status document doesn't exist & the user is IDLE.", async function () {
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal(
          "UserStatus Document did not previously exist, New UserStatus Document created and updated to an IDLE status."
        );
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.IDLE);
      });

      it("Should change the Future Status to IDLE if no other task is assigned to the user and the user is currently OOO .", async function () {
        const statusData = generateStatusDataForState(userId, userState.OOO);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal(
          "As the user is currently OOO, the future status has been updated to IDLE."
        );
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.OOO);
        expect(res.body.userStatus.data.futureStatus).to.equal(userState.IDLE);
      });

      it("Should not change the IDLE state if no other task is assigned to the user.", async function () {
        const statusData = generateStatusDataForState(userId, userState.IDLE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status is already IDLE");
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.IDLE);
      });

      it("Should not change the ACTIVE state to IDLE if no other task is assigned to the user.", async function () {
        const statusData = generateStatusDataForState(userId, userState.ACTIVE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status has been updated to IDLE");
        expect(res.body.userStatus.data.previousStatus).to.equal(userState.ACTIVE);
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.IDLE);
      });
    });

    describe("User has an Active Task", function () {
      beforeEach(async function () {
        const sampleTask2 = taskArr[1];
        sampleTask2.assignee = userId;
        sampleTask2.createdBy = superUserId;
        await firestore.collection("tasks").doc("taskid234").set(sampleTask2);
      });

      it("Should Create a new user status Document with status ACTIVE if the status document doesn't exist & the user is ACTIVE.", async function () {
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal(
          "UserStatus Document did not previously exist, New UserStatus Document created and updated to an ACTIVE status."
        );
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
      });

      it("Should change the Future Status to ACTIVE if another task is assigned to the user and the user is currently OOO .", async function () {
        const statusData = generateStatusDataForState(userId, userState.OOO);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal(
          "As the user is currently OOO, the future status has been updated to ACTIVE."
        );
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.OOO);
        expect(res.body.userStatus.data.futureStatus).to.equal(userState.ACTIVE);
      });

      it("Should not change the ACTIVE state if the user is already ACTIVE.", async function () {
        const statusData = generateStatusDataForState(userId, userState.ACTIVE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status is already ACTIVE");
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
      });

      it("Should change to ACTIVE state if the user is not ACTIVE.", async function () {
        const statusData = generateStatusDataForState(userId, userState.IDLE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123?userStatusFlag=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status has been updated to ACTIVE");
        expect(res.body.userStatus.data.previousStatus).to.equal(userState.IDLE);
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
      });
    });
  });

  describe("POST /tasks Status Update on New Task Creation", function () {
    let userId;
    let superUserId;
    let superUserJwt;
    let taskArr;
    const reqBody = {
      title: "Upgrade Package in all React Sites",
      type: "feature",
      status: "ASSIGNED",
      priority: "HIGH",
      percentCompleted: 0,
    };

    beforeEach(async function () {
      userId = await addUser(userData[6]);
      superUserId = await addUser(userData[4]);
      superUserJwt = authService.generateAuthToken({ userId: superUserId });
      taskArr = allTasks();
      const assignee = userData[6].username;
      reqBody.assignee = assignee;
      const sampleTask1 = taskArr[0];
      sampleTask1.assignee = userId;
      sampleTask1.createdBy = superUserId;
      await firestore.collection("tasks").doc("taskid123").set(sampleTask1);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Should Create a new user status Document with status ACTIVE if the status document doesn't exist.", async function () {
      const res = await chai
        .request(app)
        .post(`/tasks?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal("success");
      expect(res.body.userStatus.message).to.equal(
        "UserStatus Document did not previously exist, New UserStatus Document created and updated to an ACTIVE status."
      );
      expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change the Future Status to ACTIVE if the user is currently OOO .", async function () {
      const statusData = await generateStatusDataForState(userId, userState.OOO);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await chai
        .request(app)
        .post(`/tasks?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal("success");
      expect(res.body.userStatus.message).to.equal(
        "As the user is currently OOO, the future status has been updated to ACTIVE."
      );
      expect(res.body.userStatus.data.currentStatus).to.equal(userState.OOO);
      expect(res.body.userStatus.data.futureStatus).to.equal(userState.ACTIVE);
    });

    it("Should not change the ACTIVE state if the user is already ACTIVE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.ACTIVE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await chai
        .request(app)
        .post(`/tasks?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal("success");
      expect(res.body.userStatus.message).to.equal("The status is already ACTIVE");
      expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change the status to ACTIVE if the status is not ACTIVE i.e IDLE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.IDLE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await chai
        .request(app)
        .post(`/tasks?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal("success");
      expect(res.body.userStatus.message).to.equal("The status has been updated to ACTIVE");
      expect(res.body.userStatus.data.previousStatus).to.equal(userState.IDLE);
      expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should throw an error to if an invalid state is set in the Status.", async function () {
      const statusData = await generateStatusDataForState(userId, "InvalidState");
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await chai
        .request(app)
        .post(`/tasks?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal(500);
      expect(res.body.userStatus.error).to.equal("Internal Server Error");
      expect(res.body.userStatus.message).to.equal(
        "Please reach out to the administrator as your user status is not recognized as valid."
      );
    });

    it("Should give NotFound message if the userName is invalid.", async function () {
      reqBody.assignee = "funkeyMonkey123";
      const res = await chai
        .request(app)
        .post(`/tasks?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal(404);
      expect(res.body.userStatus.error).to.equal("Not Found");
      expect(res.body.userStatus.message).to.equal(
        "Something went wrong. Username funkeyMonkey123 could not be found."
      );
    });
  });
});
