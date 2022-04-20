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
const { toFirestoreData } = require("../../utils/tasks");
const { DINERO, NEELAM } = require("../../constants/wallets");
const cleanDb = require("../utils/cleanDb");
chai.use(chaiHttp);

const appOwner = userData[3];

let jwt;

describe("Tasks", function () {
  let taskId1, taskId;

  before(async function () {
    const userId = await addUser(appOwner);
    jwt = authService.generateAuthToken({ userId });

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
    taskId = (await tasks.updateTask(await toFirestoreData(taskData[0]))).taskId;
    taskId1 = taskId;

    // Add the completed task
    taskId = (await tasks.updateTask(await toFirestoreData(taskData[1]))).taskId;
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
          status: "completed",
          percentCompleted: 10,
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
    it("Should return 400 if assignee username does not exist", function (done) {
      chai
        .request(app)
        .post("/tasks")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "Test task - Create",
          type: "feature",
          endsOn: 123,
          startedOn: 456,
          status: "completed",
          percentCompleted: 10,
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          assignee: "dummyUser",
          participants: [],
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User not found");
          return done();
        });
    });
    it("Should not return invalid username in participants", function (done) {
      chai
        .request(app)
        .post("/tasks")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "Test task - Create",
          type: "group",
          endsOn: 123,
          startedOn: 456,
          status: "completed",
          percentCompleted: 10,
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          assignee: appOwner.username,
          participants: ["dummyUser"],
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
          expect(res.body.task.participants).to.be.an("array");
          expect(res.body.task.participants).to.have.a.lengthOf(0);

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

  describe("GET /tasks/self", function () {
    it("Should get all the active and blocked tasks of the user", function (done) {
      const taskStatus = ["active", "completed"];

      chai
        .request(app)
        .get("/tasks/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length.above(0);
          res.body.forEach((task) => {
            expect(taskStatus).to.include(task.status);
          });

          return done();
        });
    });

    it("Should return all the completed tasks of the user when query 'completed' is true", function (done) {
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
          expect(res.body[0].status).to.equal("completed");

          return done();
        });
    });

    it("Should return assignee task", async function () {
      const { userId: assignedUser } = await userModel.addOrUpdate({
        github_id: "prakashchoudhary07",
        username: "user1",
      });
      const assignedTask = {
        title: "Assigned task",
        purpose: "To Test mocha",
        featureUrl: "<testUrl>",
        type: "group",
        links: ["test1"],
        endsOn: "<unix timestamp>",
        startedOn: "<unix timestamp>",
        status: "active",
        percentCompleted: 10,
        dependsOn: ["d12", "d23"],
        participants: ["user1"],
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
        isNoteworthy: true,
      };
      const { taskId } = await tasks.updateTask(await toFirestoreData(assignedTask));
      const res = await chai
        .request(app)
        .get("/tasks/self")
        .set("cookie", `${cookieName}=${authService.generateAuthToken({ userId: assignedUser })}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("array");
      expect(res.body[0].id).to.equal(taskId);
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

    it("Should return 400 if assignee username does not exist", function (done) {
      chai
        .request(app)
        .patch("/tasks/" + taskId1)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          assignee: "dummyUser",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User not found");

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

  describe("PATCH /self/:id", function () {
    const taskStatusData = {
      status: "currentStatus",
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

    it("Should give error for no cookie", async function (done) {
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
        })
        .catch(done());
    });
  });
});
