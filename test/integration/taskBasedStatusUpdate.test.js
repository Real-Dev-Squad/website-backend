const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const firestore = require("../../utils/firestore");
const userStatusModel = firestore.collection("usersStatus");
const addUser = require("../utils/addUser");
const authService = require("../../services/authService");
const userData = require("../fixtures/user/user")();
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const { generateStatusDataForState } = require("../fixtures/userStatus/userStatus");
const allTasks = require("../fixtures/tasks/tasks");
const { userState } = require("../../constants/userStatus");
const cookieName = config.get("userToken.cookieName");
const userStatusModelFunction = require("../../models/userStatus");

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
          .patch(`/tasks/self/taskid123`)
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
          .patch(`/tasks/self/taskid123`)
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
          .patch(`/tasks/self/taskid123`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status is already IDLE");
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.IDLE);
      });

      it("Should change the ACTIVE state to IDLE if no other task is assigned to the user.", async function () {
        const statusData = generateStatusDataForState(userId, userState.ACTIVE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status has been updated to IDLE");
        expect(res.body.userStatus.data.previousStatus).to.equal(userState.ACTIVE);
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.IDLE);
      });

      it("Should not change the IDLE state if no other task is assigned to the user. & current task status is updated (excluding completed, e.g., in progress).", async function () {
        const statusData = generateStatusDataForState(userId, userState.IDLE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        reqBody.status = "NEEDS_REVIEW";
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status is already IDLE");
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.IDLE);
      });

      it("Should change the ACTIVE state to IDLE if no other task is assigned to the user. & current task status is updated (excluding completed, e.g., in progress).", async function () {
        const statusData = generateStatusDataForState(userId, userState.ACTIVE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        reqBody.status = "NEEDS_REVIEW";
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123`)
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
          .patch(`/tasks/self/taskid123`)
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
          .patch(`/tasks/self/taskid123`)
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
          .patch(`/tasks/self/taskid123`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status is already ACTIVE");
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
      });

      it("Should change to ACTIVE state if the user is not ACTIVE. ", async function () {
        const statusData = generateStatusDataForState(userId, userState.IDLE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status has been updated to ACTIVE");
        expect(res.body.userStatus.data.previousStatus).to.equal(userState.IDLE);
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
      });

      it("Should not change the ACTIVE state if the user is already ACTIVE. & current task status is updated (excluding completed, e.g., in progress).", async function () {
        const statusData = generateStatusDataForState(userId, userState.ACTIVE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        reqBody.status = "NEEDS_REVIEW";
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .send(reqBody);
        expect(res.body.userStatus.status).to.equal("success");
        expect(res.body.userStatus.message).to.equal("The status is already ACTIVE");
        expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
      });

      it("Should change to ACTIVE state if the user is not ACTIVE. & current task status is updated (excluding completed, e.g., in progress).", async function () {
        const statusData = generateStatusDataForState(userId, userState.IDLE);
        await firestore.collection("usersStatus").doc("userStatus").set(statusData);
        reqBody.status = "NEEDS_REVIEW";
        const res = await chai
          .request(app)
          .patch(`/tasks/self/taskid123`)
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
      const res = await chai.request(app).post(`/tasks`).set("cookie", `${cookieName}=${superUserJwt}`).send(reqBody);
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
      const res = await chai.request(app).post(`/tasks`).set("cookie", `${cookieName}=${superUserJwt}`).send(reqBody);
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
      const res = await chai.request(app).post(`/tasks`).set("cookie", `${cookieName}=${superUserJwt}`).send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal("success");
      expect(res.body.userStatus.message).to.equal("The status is already ACTIVE");
      expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should change the status to ACTIVE if the status is not ACTIVE i.e IDLE.", async function () {
      const statusData = await generateStatusDataForState(userId, userState.IDLE);
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await chai.request(app).post(`/tasks`).set("cookie", `${cookieName}=${superUserJwt}`).send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal("success");
      expect(res.body.userStatus.message).to.equal("The status has been updated to ACTIVE");
      expect(res.body.userStatus.data.previousStatus).to.equal(userState.IDLE);
      expect(res.body.userStatus.data.currentStatus).to.equal(userState.ACTIVE);
    });

    it("Should throw an error to if an invalid state is set in the Status.", async function () {
      const statusData = await generateStatusDataForState(userId, "InvalidState");
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);
      const res = await chai.request(app).post(`/tasks`).set("cookie", `${cookieName}=${superUserJwt}`).send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal(500);
      expect(res.body.userStatus.error).to.equal("Internal Server Error");
      expect(res.body.userStatus.message).to.equal(
        "Please reach out to the administrator as your user status is not recognized as valid."
      );
    });

    it("Should give NotFound message if the userName is invalid.", async function () {
      reqBody.assignee = "funkeyMonkey123";
      const res = await chai.request(app).post(`/tasks`).set("cookie", `${cookieName}=${superUserJwt}`).send(reqBody);
      expect(res.status).to.equal(200);
      expect(res.body.userStatus.status).to.equal(404);
      expect(res.body.userStatus.error).to.equal("Not Found");
      expect(res.body.userStatus.message).to.equal(
        "Something went wrong. Username funkeyMonkey123 could not be found."
      );
    });
  });

  describe("PATCH Integration tests for Changing the status to IDLE based on users list passed", function () {
    let [userId0, userId1, userId2, userId3, userId4, userId5, userId6, userId7, userId8, userId9] = [];
    let superUserJwt;
    let listUsers;
    const reqBody = {};

    beforeEach(async function () {
      userId0 = await addUser(userData[0]);
      userId1 = await addUser(userData[1]);
      userId2 = await addUser(userData[2]);
      userId3 = await addUser(userData[3]);
      userId4 = await addUser(userData[4]);
      userId5 = await addUser(userData[5]);
      userId6 = await addUser(userData[6]);
      userId7 = await addUser(userData[7]);
      userId8 = await addUser(userData[8]);
      userId9 = await addUser(userData[9]);
      superUserJwt = authService.generateAuthToken({ userId: userId4 });
      listUsers = [
        { userId: userId0, state: "IDLE" },
        { userId: userId1, state: "IDLE" },
        { userId: userId2, state: "IDLE" },
        { userId: userId3, state: "IDLE" },
        { userId: userId4, state: "IDLE" },
        { userId: userId5, state: "ACTIVE" },
        { userId: userId6, state: "ACTIVE" },
        { userId: userId7, state: "ACTIVE" },
        { userId: userId8, state: "ACTIVE" },
        { userId: userId9, state: "ACTIVE" },
      ];
      reqBody.users = listUsers;
      await userStatusModel.doc("userStatus000").set(generateStatusDataForState(userId0, userState.ACTIVE));
      await userStatusModel.doc("userStatus001").set(generateStatusDataForState(userId1, userState.OOO));
      await userStatusModel.doc("userStatus002").set(generateStatusDataForState(userId2, userState.IDLE));
      await userStatusModel.doc("userStatus003").set(generateStatusDataForState(userId3, userState.ONBOARDING));
      await userStatusModel.doc("userStatus005").set(generateStatusDataForState(userId5, userState.ACTIVE));
      await userStatusModel.doc("userStatus006").set(generateStatusDataForState(userId6, userState.OOO));
      await userStatusModel.doc("userStatus007").set(generateStatusDataForState(userId7, userState.IDLE));
      await userStatusModel.doc("userStatus008").set(generateStatusDataForState(userId8, userState.ONBOARDING));
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should return the correct results when there are no errors", async function () {
      const res = await chai
        .request(app)
        .patch(`/users/status/batch`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(200);
      const response = res.body.data;
      expect(response).to.have.all.keys(
        "usersCount",
        "unprocessedUsers",
        "onboardingUsersAltered",
        "onboardingUsersUnaltered",
        "activeUsersAltered",
        "activeUsersUnaltered",
        "idleUsersAltered",
        "idleUsersUnaltered"
      );
      expect(response.usersCount).to.equal(10);
      expect(response.unprocessedUsers).to.equal(0);
      expect(response.onboardingUsersAltered).to.equal(1);
      expect(response.onboardingUsersUnaltered).to.equal(1);
      expect(response.activeUsersAltered).to.equal(3);
      expect(response.activeUsersUnaltered).to.equal(1);
      expect(response.idleUsersAltered).to.equal(3);
      expect(response.idleUsersUnaltered).to.equal(1);

      const userStatus000Data = (await userStatusModel.doc("userStatus000").get()).data();
      expect(userStatus000Data.currentStatus.state).to.equal(userState.IDLE);
      const userStatus001Data = (await userStatusModel.doc("userStatus001").get()).data();
      expect(userStatus001Data.currentStatus.state).to.equal(userState.OOO);
      expect(userStatus001Data.futureStatus.state).to.equal(userState.IDLE);
      const userStatus002Data = (await userStatusModel.doc("userStatus002").get()).data();
      expect(userStatus002Data.currentStatus.state).to.equal(userState.IDLE);
      const userStatus003Data = (await userStatusModel.doc("userStatus003").get()).data();
      expect(userStatus003Data.currentStatus.state).to.equal(userState.ONBOARDING);
      const userStatus004SnapShot = await userStatusModel.where("userId", "==", userId4).limit(1).get();
      const [userStatus004Doc] = userStatus004SnapShot.docs;
      const userStatus004Data = userStatus004Doc.data();
      expect(userStatus004Data.currentStatus.state).to.equal(userState.IDLE);
      const userStatus005Data = (await userStatusModel.doc("userStatus005").get()).data();
      expect(userStatus005Data.currentStatus.state).to.equal(userState.ACTIVE);
      const userStatus006Data = (await userStatusModel.doc("userStatus006").get()).data();
      expect(userStatus006Data.currentStatus.state).to.equal(userState.OOO);
      expect(userStatus006Data.futureStatus.state).to.equal(userState.ACTIVE);
      const userStatus007Data = (await userStatusModel.doc("userStatus007").get()).data();
      expect(userStatus007Data.currentStatus.state).to.equal(userState.ACTIVE);
      const userStatus008Data = (await userStatusModel.doc("userStatus008").get()).data();
      expect(userStatus008Data.currentStatus.state).to.equal(userState.ACTIVE);
      const userStatus009SnapShot = await userStatusModel.where("userId", "==", userId9).limit(1).get();
      const [userStatus009Doc] = userStatus009SnapShot.docs;
      const userStatus009Data = userStatus009Doc.data();
      expect(userStatus009Data.currentStatus.state).to.equal(userState.ACTIVE);
    });

    it("should throw an error if users firestore batch operations fail", async function () {
      sinon.stub(firestore, "batch").throws(new Error("something went wrong"));

      const res = await chai
        .request(app)
        .patch(`/users/status/batch`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send(reqBody);
      expect(res.status).to.equal(500);
      const response = res.body;
      expect(response.message).to.be.equal(
        "The server has encountered an unexpected error. Please contact the administrator for more information."
      );
    });
  });

  describe("GET users/status?taskStatus=IDLE Find Users without Assigned Or InProgress Tasks", function () {
    let userId1;
    let userId2;
    let userId3;

    let superUserId;
    let superUserJwt;

    beforeEach(async function () {
      userId1 = await addUser(userData[6]);
      userId2 = await addUser(userData[8]);
      userId3 = await addUser(userData[9]);
      superUserId = await addUser(userData[4]);
      superUserJwt = authService.generateAuthToken({ userId: superUserId });

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
      await cleanDb();
    });
    it("should get the users who without Assigned Or InProgress Tasks", async function () {
      const response = await chai
        .request(app)
        .get(`/users/status?aggregate=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`);
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("All users based on tasks found successfully.");
      expect(response.body.data.totalUsers).to.equal(4);
      expect(response.body.data.totalIdleUsers).to.equal(2);
      expect(response.body.data.totalActiveUsers).to.equal(2);
      expect(response.body.data.totalUnprocessedUsers).to.equal(0);
      expect(response.body.data.unprocessedUsers).to.deep.equal([]);
      expect(response.body.data)
        .to.have.deep.property("users")
        .that.has.deep.members([
          { userId: userId1, state: "ACTIVE" },
          { userId: userId2, state: "ACTIVE" },
          { userId: userId3, state: "IDLE" },
          { userId: superUserId, state: "IDLE" },
        ]);
    });

    it("should throw an error when an error occurs", async function () {
      sinon
        .stub(userStatusModelFunction, "getTaskBasedUsersStatus")
        .throws(
          new Error(
            "The server has encountered an unexpected error. Please contact the administrator for more information."
          )
        );
      const response = await chai
        .request(app)
        .get(`/users/status?aggregate=true`)
        .set("cookie", `${cookieName}=${superUserJwt}`);
      expect(response.status).to.equal(500);
      expect(response.body.message).to.equal(
        "The server has encountered an unexpected error. Please contact the administrator for more information."
      );
    });
  });
});
