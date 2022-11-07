const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const tasks = require("../../models/tasks");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const userModel = require("../../models/users");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();
const tasksData = require("../fixtures/tasks/tasks")();
const { DINERO, NEELAM } = require("../../constants/wallets");
const cleanDb = require("../utils/cleanDb");
const { TASK_STATUS } = require("../../constants/tasks");
chai.use(chaiHttp);

const appOwner = userData[3];
const superUser = userData[4];

let jwt, superUserJwt;

describe("Tasks", function () {
  let taskId1, taskId;

  before(async function () {
    const userId = await addUser(appOwner);
    const superUserId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });

    const taskData = [
      {
        title: "Test task",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "active",
        percentCompleted: 10,
        participants: [],
        assignee: appOwner.username,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
        isNoteworthy: true,
      },
      {
        title: "Test task",
        purpose: "To Test mocha",
        featureUrl: "<testUrl>",
        type: "group",
        links: ["test1"],
        endsOn: 1234,
        startedOn: 54321,
        status: "completed",
        percentCompleted: 10,
        dependsOn: ["d12", "d23"],
        participants: [appOwner.username],
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
        isNoteworthy: false,
      },
    ];

    // Add the active task
    taskId = (await tasks.updateTask(taskData[0])).taskId;
    taskId1 = taskId;

    // Add the completed task
    taskId = (await tasks.updateTask(taskData[1])).taskId;
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("POST /tasks - creates a new task", function () {
    it("Should return success response after adding the task", function (done) {
      chai
        .request(app)
        .post("/tasks")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "Test task - Create",
          type: "feature",
          endsOn: 123,
          startedOn: 456,
          status: "AVAILABLE",
          percentCompleted: 10,
          priority: "HIGH",
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          assignee: appOwner.username,
          participants: [],
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Task created successfully!");
          expect(res.body.id).to.be.a("string");
          expect(res.body.task).to.be.a("object");
          expect(res.body.task.createdBy).to.equal(appOwner.username);
          expect(res.body.task.assignee).to.equal(appOwner.username);
          expect(res.body.task.participants).to.be.a("array");
          return done();
        });
    });
    it("should return fail response if task has a non-acceptable status value", function (done) {
      chai
        .request(app)
        .post("/tasks")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "Test task - Create",
          type: "feature",
          endsOn: 123,
          startedOn: 456,
          status: "invalidStatus",
          percentCompleted: 10,
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          assignee: appOwner.username,
          participants: [],
        })
        .end((err, res) => {
          if (err) return done(err);

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });
  });

  describe("GET /tasks", function () {
    it("Should get all the list of tasks", function (done) {
      chai
        .request(app)
        .get("/tasks")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          const taskWithParticipants = res.body.tasks[0];

          if (taskWithParticipants.type === "group") {
            expect(taskWithParticipants.participants).to.include(appOwner.username);
          } else {
            expect(taskWithParticipants.assignee).to.equal(appOwner.username);
          }

          return done();
        });
    });
  });

  describe("GET /tasks/:id/details", function () {
    it("should return the task task with the Id that we provide in the route params", function (done) {
      chai
        .request(app)
        .get(`/tasks/${taskId1}/details`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("task returned successfully");
          expect(res.body.taskData).to.be.a("object");
          return done();
        });
    });
  });

  describe("GET /tasks/self", function () {
    it("Should return all the completed tasks of the user when query 'completed' is true", function (done) {
      const { COMPLETED } = TASK_STATUS;
      chai
        .request(app)
        .get("/tasks/self?completed=true")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done;
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("array");
          expect(res.body[0].status).to.equal(COMPLETED);

          return done();
        });
    });

    it("Should return all assignee task", async function () {
      const { userId: assignedUser } = await userModel.addOrUpdate({
        github_id: "prakashchoudhary07",
        username: "user1",
      });
      const assignedTask = [
        {
          title: "Test task",
          type: "feature",
          endsOn: 1234,
          startedOn: 4567,
          status: "IN_PROGRESS",
          percentCompleted: 10,
          participants: [],
          assignee: "user1",
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          isNoteworthy: true,
        },
        {
          title: "Test task",
          type: "feature",
          endsOn: 1234,
          startedOn: 4567,
          status: "BLOCKED",
          percentCompleted: 10,
          participants: [],
          assignee: "user1",
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          isNoteworthy: true,
        },
      ];
      const { taskId: taskId1 } = await tasks.updateTask(assignedTask[0]);
      const { taskId: taskId2 } = await tasks.updateTask(assignedTask[1]);
      const res = await chai
        .request(app)
        .get("/tasks/self")
        .set("cookie", `${cookieName}=${authService.generateAuthToken({ userId: assignedUser })}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("array");
      expect([taskId1, taskId2]).to.include(taskId1);
    });

    it("Should return 401 if not logged in", function (done) {
      chai
        .request(app)
        .get("/tasks/self")
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("PATCH /tasks", function () {
    it("Should update the task for the given taskid", function (done) {
      chai
        .request(app)
        .patch("/tasks/" + taskId1)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "new-title",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(204);

          return done();
        });
    });
    it("Should return fail response if task data has a non-acceptable status value to update the task for the given taskid", function (done) {
      chai
        .request(app)
        .patch("/tasks/" + taskId1)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "new-title",
          status: "invalidStatus",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.error).to.equal("Bad Request");
          return done();
        });
    });

    it("Should return 404 if task does not exist", function (done) {
      chai
        .request(app)
        .patch("/tasks/taskid")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "new-title",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Task not found");

          return done();
        });
    });
  });

  describe("GET /tasks/:username", function () {
    it("Should return 200 when username is valid", function (done) {
      chai
        .request(app)
        .get(`/tasks/${appOwner.username}?status=active`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");

          const task1 = res.body.tasks[0];

          if (task1.type === "group") {
            expect(task1.participants).to.include(appOwner.username);
          } else {
            expect(task1.assignee).to.equal(appOwner.username);
          }

          expect(res.body.tasks).to.be.a("array");
          return done();
        });
    });

    it("Should return 404 when username is invalid", function (done) {
      chai
        .request(app)
        .get("/tasks/dummyUser?status=active")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User doesn't exist");
          return done();
        });
    });
  });

  describe("PATCH /tasks/self/:id", function () {
    const taskStatusData = {
      status: "AVAILABLE",
      percentCompleted: 50,
    };

    it("Should update the task status for given self taskid", function (done) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(taskStatusData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("Task updated successfully!");
          return done();
        });
    });
    it("Should return fail response if task data has non-acceptable status value to update the task status for given self taskid", function (done) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "invalidStatus" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.error).to.equal("Bad Request");
          return done();
        });
    });

    it("Should return 404 if task doesnt exist", function (done) {
      chai
        .request(app)
        .patch("/tasks/self/wrongtaskId")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(taskStatusData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal("Task doesn't exist");
          return done();
        });
    });

    it("Should return Forbidden error if task is not assigned to self", async function () {
      const { userId } = await addUser(userData[1]);
      const jwt = authService.generateAuthToken({ userId });

      const res = await chai.request(app).patch(`/tasks/self/${taskId1}`).set("cookie", `${cookieName}=${jwt}`);

      expect(res).to.have.status(403);
      expect(res.body.message).to.equal("This task is not assigned to you");
    });

    it("Should give error for no cookie", function (done) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .send(taskStatusData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });

    it("Should give 403 if status is already 'VERIFIED' ", async function () {
      const taskData = {
        title: "Test task",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "VERIFIED",
        percentCompleted: 10,
        participants: [],
        assignee: appOwner.username,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
        isNoteworthy: true,
      };
      taskId = (await tasks.updateTask(taskData)).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(taskStatusData);

      expect(res).to.have.status(403);
      expect(res.body.message).to.be.equal("Status cannot be updated. Please contact admin.");
    });

    it("should give a response message as 'Task updated but another task not found' if we have completed 100% task and a task is not available", async function () {
      const taskData = tasksData[3];
      taskId = (await tasks.updateTask(taskData)).taskId;

      const dataToSend = { percentCompleted: 100 };

      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}?dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(dataToSend);

      expect(res).to.have.status(200);
      expect(res.body.message).to.be.equal("Task updated but another task not found");
    });

    it("should give a response message 'task updated and another task got assigned' if we have completed the task 100% and another task is assigned to us", async function () {
      const taskData = tasksData[4];
      await tasks.updateTask(taskData);

      const dataToSend = { percentCompleted: 100 };

      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}?dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(dataToSend);

      expect(res).to.have.a.status(200);
      expect(res.body.message).to.be.equal("task updated and another task got assigned");
    });
  });

  describe("GET /tasks/overdue", function () {
    it("Should return all the overdue Tasks", async function () {
      await tasks.updateTask(tasksData[0]);
      await tasks.updateTask(tasksData[1]);
      const res = await chai.request(app).get("/tasks/overdue").set("cookie", `${cookieName}=${superUserJwt}`);

      expect(res).to.have.status(200);
      expect(res.body.newAvailableTasks).to.be.a("array");
      res.body.newAvailableTasks.forEach((task) => {
        const { status, startedOn, endsOn, assignee } = task.unassignedTask;
        expect(status).to.equal(TASK_STATUS.AVAILABLE);
        expect(assignee).to.equal(null);
        expect(startedOn).to.equal(null);
        expect(endsOn).to.equal(null);
      });
    });

    it("Should return [] if no overdue task", async function () {
      await tasks.updateTask(tasksData[2]);
      const res = await chai.request(app).get("/tasks/overdue").set("cookie", `${cookieName}=${superUserJwt}`);

      expect(res).to.have.status(200);
      expect(res.body.newAvailableTasks).to.have.lengthOf(0);
      expect(res.body.message).to.be.equal("No overdue tasks found");
    });
  });

  describe("PATCH /tasks/assign/self", function () {
    it("should not assign a task to the user if they do not have status idle", async function () {
      const taskData = tasksData[4];
      await tasks.updateTask(taskData);

      const res = await chai.request(app).patch(`/tasks/assign/self`).set("cookie", `${cookieName}=${jwt}`).send();

      expect(res).to.have.status(200);
      expect(res.body.message).to.be.equal("Task cannot be assigned to users with active or OOO status");
    });

    it("should assign task to the user if their status is idle and task is available", async function () {
      const taskData = tasksData[4];
      await tasks.updateTask(taskData);

      const res = await chai
        .request(app)
        .patch(`/tasks/assign/self`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send();

      expect(res).to.have.status(200);
      expect(res.body.message).to.be.equal("Task assigned");
    });
  });
});
