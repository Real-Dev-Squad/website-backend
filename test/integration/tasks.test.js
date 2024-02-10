const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const firestore = require("../../utils/firestore");
const logsModel = firestore.collection("logs");
const app = require("../../server");
const tasks = require("../../models/tasks");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const userModel = require("../../models/users");
const userStatusModel = require("../../models/userStatus");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();
const tasksData = require("../fixtures/tasks/tasks")();
const { DINERO, NEELAM } = require("../../constants/wallets");
const cleanDb = require("../utils/cleanDb");
const { TASK_STATUS, tasksUsersStatus } = require("../../constants/tasks");
const updateTaskStatus = require("../fixtures/tasks/tasks1")();
const userStatusData = require("../fixtures/userStatus/userStatus");
const tasksModel = firestore.collection("tasks");
const discordService = require("../../services/discordService");
const { CRON_JOB_HANDLER } = require("../../constants/bot");
const { logType } = require("../../constants/logs");

chai.use(chaiHttp);

const appOwner = userData[3];
const superUser = userData[4];

let jwt, superUserJwt;
const { createProgressDocument } = require("../../models/progresses");
const { stubbedModelTaskProgressData } = require("../fixtures/progress/progresses");
const { convertDaysToMilliseconds } = require("../../utils/time");
const { getDiscordMembers } = require("../fixtures/discordResponse/discord-response");
const { generateCronJobToken } = require("../utils/generateBotToken");

const taskData = [
  {
    title: "Test task",
    type: "feature",
    endsOn: 1234,
    startedOn: 4567,
    status: "IN_PROGRESS",
    percentCompleted: 10,
    participants: [],
    assignee: appOwner.username,
    completionAward: { [DINERO]: 3, [NEELAM]: 300 },
    lossRate: { [DINERO]: 1 },
    isNoteworthy: true,
    isCollapsed: true,
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
    assignee: appOwner.username,
  },
];

describe("Tasks", function () {
  let taskId1, taskId;

  before(async function () {
    const userId = await addUser(appOwner);
    const superUserId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });

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
          dependsOn: [],
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Task created successfully!");
          expect(res.body.task).to.be.a("object");
          expect(res.body.task.id).to.be.a("string");
          expect(res.body.task.createdAt).to.be.a("number");
          expect(res.body.task.updatedAt).to.be.a("number");
          expect(res.body.task.createdBy).to.equal(appOwner.username);
          expect(res.body.task.assignee).to.equal(appOwner.username);
          expect(res.body.task.participants).to.be.a("array");
          expect(res.body.task.dependsOn).to.be.a("array");
          return done();
        });
    });
    it("Should have same time for createdAt and updatedAt for new tasks", function (done) {
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
          dependsOn: [],
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Task created successfully!");
          expect(res.body.task).to.be.a("object");
          expect(res.body.task.createdAt).to.be.a("number");
          expect(res.body.task.updatedAt).to.be.a("number");
          expect(res.body.task.createdAt).to.be.eq(res.body.task.updatedAt);
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
    let taskId2, taskId3;
    before(async function () {
      taskId2 = (await tasks.updateTask({ ...taskData[0], createdAt: 1621717694, updatedAt: 1700680830 })).taskId;
      taskId3 = (await tasks.updateTask({ ...taskData[1], createdAt: 1621717694, updatedAt: 1700775753 })).taskId;
    });

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
          expect(res.body.tasks[0].dependsOn).to.be.a("array");
          const taskWithParticipants = res.body.tasks[0];

          if (taskWithParticipants.type === "group") {
            expect(taskWithParticipants.participants).to.include(appOwner.username);
          } else {
            expect(taskWithParticipants.assignee).to.equal(appOwner.username);
          }

          return done();
        });
    });

    it("Should call paginated tasks when dev flag passed to GET /tasks is true", function (done) {
      const fetchPaginatedUserStub = sinon.stub(tasks, "fetchPaginatedTasks");
      chai
        .request(app)
        .get("/tasks?dev=true")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(fetchPaginatedUserStub.calledOnce).to.be.equal(true);

          return done();
        });
    });

    it("Should get all tasks filtered with status when passed to GET /tasks", function (done) {
      chai
        .request(app)
        .get(`/tasks?dev=true&status=${TASK_STATUS.IN_PROGRESS}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body).to.have.property("next");
          expect(res.body).to.have.property("prev");

          const tasksData = res.body.tasks ?? [];
          tasksData.forEach((task) => {
            expect(task.status).to.equal(TASK_STATUS.IN_PROGRESS);
          });
          return done();
        });
    });

    it("Should get all tasks filtered with status ,assignee, title when passed to GET /tasks", function (done) {
      chai
        .request(app)
        .get(`/tasks?status=${TASK_STATUS.IN_PROGRESS}&dev=true&assignee=sagar&title=Test`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body).to.have.property("next");
          expect(res.body).to.have.property("prev");

          const tasksData = res.body.tasks ?? [];
          tasksData.forEach((task) => {
            expect(task.status).to.equal(TASK_STATUS.IN_PROGRESS);
            expect(task.assignee).to.equal("sagar");
            expect(task.title).to.include("Test");
          });
          return done();
        });
    });

    it("Should get all tasks filtered with status, multiple assignees, title when passed to GET /tasks", function (done) {
      chai
        .request(app)
        .get(`/tasks?status=${TASK_STATUS.IN_PROGRESS}&dev=true&assignee=sagar,ankur&title=Test`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body).to.have.property("next");
          expect(res.body).to.have.property("prev");

          const tasksData = res.body.tasks ?? [];
          tasksData.forEach((task) => {
            expect(task.status).to.equal(TASK_STATUS.IN_PROGRESS);
            expect(task.assignee).to.be.oneOf(["sagar", "ankur"]);
            expect(task.title).to.include("Test");
          });
          return done();
        });
    });

    it("Should get all overdue tasks GET /tasks", function (done) {
      chai
        .request(app)
        .get(`/tasks?dev=true&status=overdue`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.tasks[0].id).to.be.oneOf([taskId, taskId1, taskId2, taskId3]);
          return done();
        });
    });

    it("Should get all overdue tasks filtered with assignee when passed to GET /tasks", function (done) {
      chai
        .request(app)
        .get(`/tasks?dev=true&status=overdue&assignee=${appOwner.username}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body).to.have.property("next");
          expect(res.body).to.have.property("prev");

          const tasksData = res.body.tasks ?? [];
          tasksData.forEach((task) => {
            expect(task.assignee).to.equal(appOwner.username);
            expect(task.title).to.include("Test task");
          });
          return done();
        });
    });

    it("Should get tasks when correct query parameters are passed", function (done) {
      chai
        .request(app)
        .get("/tasks?dev=true&size=1&page=0")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body).to.have.property("next");
          expect(res.body).to.have.property("prev");

          expect(res.body.tasks.length).to.be.equal(1);
          return done();
        });
    });

    it("Should get next and previous page results based returned by the links in the response", async function () {
      const initialReq = `/tasks?size=1&dev=true`;
      const response = await chai.request(app).get(initialReq);
      expect(response).to.have.status(200);
      expect(response.body).to.be.a("object");
      expect(response.body.message).to.equal("Tasks returned successfully!");
      expect(response.body).to.have.property("next");
      expect(response.body).to.have.property("prev");
      expect(response.body.tasks).to.have.length(1);

      const nextPageLink = response.body.next;
      const nextPageResponse = await chai.request(app).get(nextPageLink);

      expect(nextPageResponse).to.have.status(200);
      expect(nextPageResponse.body).to.be.a("object");
      expect(nextPageResponse.body.message).to.equal("Tasks returned successfully!");
      expect(nextPageResponse.body).to.have.property("next");
      expect(nextPageResponse.body).to.have.property("prev");
      expect(nextPageResponse.body.tasks).to.have.length(1);

      const prevPageLink = nextPageResponse.body.prev;
      const previousPageResponse = await chai.request(app).get(prevPageLink);

      expect(previousPageResponse).to.have.status(200);
      expect(previousPageResponse.body).to.be.a("object");
      expect(previousPageResponse.body.message).to.equal("Tasks returned successfully!");
      expect(previousPageResponse.body).to.have.property("next");
      expect(previousPageResponse.body).to.have.property("prev");
      expect(previousPageResponse.body.tasks).to.have.length(1);
    });
    it("Should get tasks filtered by search term", function (done) {
      const searchTerm = "task";
      chai
        .request(app)
        .get("/tasks?q=searchTerm:task")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Filter tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");

          const matchingTasks = res.body.tasks;
          matchingTasks.forEach((task) => {
            expect(task.title.toLowerCase()).to.include(searchTerm.toLowerCase());
          });
          expect(matchingTasks).to.have.length(6);

          return done();
        });
    });
    it("Should get tasks filtered by search term and handle no tasks found", function (done) {
      chai
        .request(app)
        .get(`/tasks?q=searchTerm:random1`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("No tasks found.");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body.tasks).to.have.lengthOf(0);
          return done();
        });
    });
    it("Should return no task found when there is no searchterm", function (done) {
      chai
        .request(app)
        .get(`/tasks?q=searchTerm:`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("No tasks found.");
          expect(res.body.tasks).to.be.a("array");
          expect(res.body.tasks).to.have.lengthOf(0);
          return done();
        });
    });
    it("Should get paginated tasks ordered by updatedAt in desc order ", function (done) {
      chai
        .request(app)
        .get("/tasks?dev=true&size=5&page=0")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Tasks returned successfully!");
          expect(res.body.tasks).to.be.a("array");
          const tasks = res.body.tasks;
          // Check if Tasks are returned in desc order of updatedAt field
          for (let i = 0; i < tasks.length - 1; i++) {
            expect(tasks[+i].updatedAt).to.be.greaterThanOrEqual(tasks[i + 1].updatedAt);
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
          expect(res.body.taskData.dependsOn).to.be.a("array");

          return done();
        });
    });
    it("Should return isCollapsed property in response", function (done) {
      chai
        .request(app)
        .get(`/tasks/${taskId1}/details`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.taskData).to.have.property("isCollapsed");
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
    it("Should update the task for the given taskId", function (done) {
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

    it("should update updatedAt field when patch request is made", function (done) {
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

    it("should update updatedAt field", function (done) {
      chai
        .request(app)
        .get(`/tasks/${taskId1}/details`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.taskData.updatedAt).to.be.a("number");
          expect(res.body.taskData.updatedAt).to.be.not.eq(tasksData[0].updatedAt);
          expect(res.body.taskData.updatedAt).to.be.not.eq(res.body.taskData.createdAt);
          return done();
        });
    });

    it("Should update dependency", async function () {
      taskId = (await tasks.updateTask(tasksData[5])).taskId;
      const taskId1 = (await tasks.updateTask(tasksData[5])).taskId;
      const taskId2 = (await tasks.updateTask(tasksData[5])).taskId;

      const dependsOn = [taskId1, taskId2];
      const res = await chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ dependsOn });
      expect(res).to.have.status(204);
      const res2 = await chai.request(app).get(`/tasks/${taskId}/details`);
      expect(res2).to.have.status(200);
      expect(res2.body.taskData.dependsOn).to.be.a("array");
      res2.body.taskData.dependsOn.forEach((taskId) => {
        expect(dependsOn).to.include(taskId);
      });

      return taskId;
    });

    it("Should return 400 if any of taskid is not exist", async function () {
      taskId = (await tasks.updateTask(tasksData[5])).taskId;
      const taskId1 = (await tasks.updateTask(tasksData[5])).taskId;
      const dependsOn = ["taskId5", "taskId6", taskId1];
      const res = await chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ dependsOn });
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("Invalid dependency");
    });

    it("Should update status when assignee pass as a payload", async function () {
      taskId = (await tasks.updateTask(tasksData[5])).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ assignee: "sagar" });
      expect(res).to.have.status(204);
      const res2 = await chai.request(app).get(`/tasks/${taskId}/details`);
      expect(res2).to.have.status(200);
      expect(res2.body.taskData.assignee).to.be.equal("sagar");

      expect(res2.body.taskData.status).to.be.equal(TASK_STATUS.ASSIGNED);

      return taskId;
    });

    it("Should add startedOn field when assignee passed as a payload", async function () {
      taskId = (await tasks.updateTask(tasksData[5])).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ assignee: "sagar", endsOn: 1695804641, status: TASK_STATUS.ASSIGNED });
      expect(res).to.have.status(204);
      const res2 = await chai.request(app).get(`/tasks/${taskId}/details`);
      const startedOn = Math.round(new Date().getTime() / 1000);
      expect(res2.body.taskData).to.have.property("startedOn");
      expect(res2.body.taskData.startedOn).to.be.equal(startedOn);
    });

    it("Should use the existing startedOn field if it is passed in the payload", async function () {
      taskId = (await tasks.updateTask(tasksData[5])).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ assignee: "sagar", endsOn: 1695804641, status: TASK_STATUS.ASSIGNED, startedOn: 1695804041 });
      expect(res).to.have.status(204);
      const res2 = await chai.request(app).get(`/tasks/${taskId}/details`);
      expect(res2.body.taskData).to.have.property("startedOn");
      expect(res2.body.taskData.startedOn).to.be.equal(1695804041);
    });
    it("should check updated dependsOn", function (done) {
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
          expect(res.body.taskData.dependsOn).to.be.a("array");

          return done();
        });
    });
    it("Should update the task status collapsed for the given taskid", function (done) {
      chai
        .request(app)
        .patch("/tasks/" + taskId1)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          isCollapsed: true,
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
    it("Should return fail response if percent completed is < 0 or > 100", function (done) {
      chai
        .request(app)
        .patch("/tasks/" + taskId1)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          status: TASK_STATUS.IN_REVIEW,
          percentCompleted: 120,
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

    it("Should return 204 if assignee exists", function (done) {
      chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ assignee: `${userData[4].username}` })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(204);
          return done();
        });
    });

    it("should return 404 if assignee is not in user db", function (done) {
      chai
        .request(app)
        .patch(`/tasks/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ assignee: "invaliduser" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("User doesn't exist");
          return done();
        });
    });
  });

  describe("GET /tasks/:username", function () {
    it("Should return 200 when username is valid", function (done) {
      chai
        .request(app)
        .get(`/tasks/${appOwner.username}?status=IN_PROGRESS`) // TODO: if status is passed in lowercase it fails, fix this
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
        .get("/tasks/dummyUser?status=in_progress")
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

    const taskData = {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "VERIFIED",
      percentCompleted: 10,
      participants: [],
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true,
    };

    it("Should throw 400 Bad Request if the user tries to update the status of a task to AVAILABLE", function (done) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(taskStatusData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal("The value for the 'status' field is invalid.");
          return done();
        });
    });

    it("Should update the task status for given self taskid", function (done) {
      taskStatusData.status = "IN_PROGRESS";
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
          expect(res.body.taskLog).to.have.property("type");
          expect(res.body.taskLog).to.have.property("id");
          expect(res.body.taskLog.body).to.be.a("object");
          expect(res.body.taskLog.meta).to.be.a("object");
          expect(res.body.message).to.equal("Task updated successfully!");

          expect(res.body.taskLog.body.new.status).to.equal(taskStatusData.status);
          expect(res.body.taskLog.body.new.percentCompleted).to.equal(taskStatusData.percentCompleted);
          return done();
        });
    });

    it("Should update the task status for given self taskid under feature flag", function (done) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ status: "DONE", percentCompleted: 100 })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.taskLog).to.have.property("type");
          expect(res.body.taskLog).to.have.property("id");
          expect(res.body.taskLog.body).to.be.a("object");
          expect(res.body.taskLog.meta).to.be.a("object");
          expect(res.body.message).to.equal("Task updated successfully!");

          expect(res.body.taskLog.body.new.status).to.equal("DONE");
          expect(res.body.taskLog.body.new.percentCompleted).to.equal(100);
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

    it("Should return fail response if percentage is < 0 or  > 100", function (done) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, percentCompleted: -10 })
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
      taskStatusData.status = "IN_PROGRESS";
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
      const userId = await addUser(userData[0]);
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
      taskStatusData.status = "IN_PROGRESS";
      taskId = (await tasks.updateTask({ ...taskData, assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(taskStatusData);

      expect(res).to.have.status(403);
      expect(res.body.message).to.be.equal("Status cannot be updated. Please contact admin.");
    });
    it("Should give 403 if new status is 'MERGED' ", async function () {
      taskId = (await tasks.updateTask({ ...taskData, assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "MERGED" });

      expect(res.body.message).to.be.equal("Status cannot be updated. Please contact admin.");
    });
    it("Should give 403 if new status is 'BACKLOG' ", async function () {
      taskId = (await tasks.updateTask({ ...taskData, assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "BACKLOG" });

      expect(res.body.message).to.be.equal("Status cannot be updated. Please contact admin.");
    });

    it("Should give 400 if percentCompleted is not 100 and new status is COMPLETED ", async function () {
      taskId = (await tasks.updateTask({ ...taskData, status: "REVIEW", assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "COMPLETED" });

      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Status cannot be updated. Task is not completed yet");
    });

    it("Should give 400 if percentCompleted is not 100 and new status is DONE under feature flag ", async function () {
      taskId = (await tasks.updateTask({ ...taskData, status: "REVIEW", assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "DONE" });

      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Status cannot be updated. Task is not done yet");
    });

    it("Should give 400 if percentCompleted is not 100 and new status is VERIFIED ", async function () {
      taskId = (await tasks.updateTask({ ...taskData, status: "REVIEW", assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "VERIFIED" });

      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Status cannot be updated. Task is not completed yet");
    });

    it("Should give 400 if percentCompleted is not 100 and new status is VERIFIED under feature flag", async function () {
      taskId = (await tasks.updateTask({ ...taskData, status: "REVIEW", assignee: appOwner.username })).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...taskStatusData, status: "VERIFIED" });

      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Status cannot be updated. Task is not done yet");
    });

    it("Should give 400 if status is COMPLETED and newpercent is less than 100", async function () {
      const taskData = {
        title: "Test task",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "completed",
        percentCompleted: 100,
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
        .send({ percentCompleted: 80 });

      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Task percentCompleted can't updated as status is COMPLETED");
    });

    it("Should give 400 if status is DONE and newpercent is less than 100 under feature flag", async function () {
      taskId = (await tasks.updateTask(updateTaskStatus[0])).taskId;
      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId}?userStatusFlag=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ percentCompleted: 80 });

      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Task percentCompleted can't updated as status is DONE");
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

  describe("POST /tasks/migration", function () {
    it("Should update status COMPLETED to DONE successful", async function () {
      const taskData1 = { status: "COMPLETED" };
      await firestore.collection("tasks").doc("updateTaskStatus1").set(taskData1);
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${superUserJwt}`);
      expect(res).to.have.status(200);
      expect(res.body.totalTasks).to.be.equal(1);
      expect(res.body.totalUpdatedStatus).to.be.equal(1);
      expect(res.body.updatedTaskDetails).to.deep.equal(["updateTaskStatus1"]);
      expect(res.body.totalOperationsFailed).to.be.equal(0);
      expect(res.body.failedTaskDetails).to.deep.equal([]);
    });

    it("Should not update if not found any COMPLETED task status ", async function () {
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${superUserJwt}`);
      expect(res).to.have.status(200);
      expect(res.body.totalTasks).to.be.equal(0);
      expect(res.body.totalUpdatedStatus).to.be.equal(0);
      expect(res.body.updatedTaskDetails).to.deep.equal([]);
      expect(res.body.totalOperationsFailed).to.be.equal(0);
      expect(res.body.failedTaskDetails).to.deep.equal([]);
    });

    it("should throw an error if firestore batch operations fail", async function () {
      const stub = sinon.stub(firestore, "batch");
      stub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firestore batch commit failed!");
        },
      });
      const taskData1 = { status: "COMPLETED" };
      await firestore.collection("tasks").doc("updateTaskStatus1").set(taskData1);
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${superUserJwt}`);
      expect(res.status).to.equal(500);
      const response = res.body;
      expect(response.message).to.be.equal("An internal server error occurred");
    });

    it("Should return 401 if not super_user", async function () {
      const nonSuperUserId = await addUser(appOwner);
      const nonSuperUserJwt = authService.generateAuthToken({ userId: nonSuperUserId });
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${nonSuperUserJwt}`);
      expect(res).to.have.status(401);
    });
  });

  describe("POST /tasks/migration for adding createdAt+updatedAt", function () {
    beforeEach(async function () {
      const userId = await addUser(appOwner);
      const superUserId = await addUser(superUser);
      jwt = authService.generateAuthToken({ userId });
      superUserJwt = authService.generateAuthToken({ userId: superUserId });
      // Add the active task
      await tasks.updateTask(tasksData[0]);
      await tasks.updateTask(tasksData[1]);
      await tasks.updateTask(tasksData[3]);
      await tasks.updateTask(tasksData[4]);
      await tasks.updateTask(tasksData[5]);
      await tasks.updateTask(tasksData[6]);
    });
    afterEach(async function () {
      await cleanDb();
    });
    it("Should return 401 if not super_user", async function () {
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${jwt}`);
      expect(res).to.have.status(401);
    });

    // TASK createdAt and updatedAt migration script
    it("Should update status createdAt and updatedAt", async function () {
      // Add new tasks with createdAt and updatedAt present
      await tasks.updateTask({ ...tasksData[7], createdAt: null, updatedAt: null });
      await tasks.updateTask({ ...tasksData[8], createdAt: null, updatedAt: null });
      await tasks.updateTask({ ...tasksData[9], updatedAt: null });
      await tasks.updateTask({ ...tasksData[10], createdAt: null });
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${superUserJwt}`).send({
        action: "ADD",
        field: "CREATED_AT+UPDATED_AT",
      });
      expect(res).to.have.status(200);
      expect(res.body.totalTasks).to.be.equal(10);
      expect(res.body.totalTaskToBeUpdate).to.be.equal(4);
      expect(res.body.totalTasksUpdated).to.be.equal(4);
      expect(res.body.totalFailedTasks).to.be.equal(0);
      expect(res.body.failedTasksIds).to.deep.equal([]);
    });

    it("Should update status createdAt and updatedAt, if filed doesn't exists", async function () {
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${superUserJwt}`).send({
        action: "ADD",
        field: "CREATED_AT+UPDATED_AT",
      });
      expect(res).to.have.status(200);
      expect(res.body.totalTasks).to.be.equal(6);
      expect(res.body.totalTaskToBeUpdate).to.be.equal(0);
      expect(res.body.totalTasksUpdated).to.be.equal(0);
      expect(res.body.totalFailedTasks).to.be.equal(0);
      expect(res.body.failedTasksIds).to.deep.equal([]);
    });

    it("should return failed stats if firestore batch operations fail for adding createdAt and updatedAt", async function () {
      await tasks.updateTask({ ...tasksData[7], createdAt: null, updatedAt: null });
      await tasks.updateTask({ ...tasksData[8], createdAt: null, updatedAt: null });
      await tasks.updateTask({ ...tasksData[9], updatedAt: null });
      await tasks.updateTask({ ...tasksData[10], createdAt: null });
      const stub = sinon.stub(firestore, "batch");
      stub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firestore batch commit failed!");
        },
      });
      const res = await chai.request(app).post("/tasks/migration").set("cookie", `${cookieName}=${superUserJwt}`).send({
        action: "ADD",
        field: "CREATED_AT+UPDATED_AT",
      });
      expect(res).to.have.status(200);
      expect(res.body.totalTasks).to.be.equal(10);
      expect(res.body.totalTaskToBeUpdate).to.be.equal(4);
      expect(res.body.totalTasksUpdated).to.be.equal(0);
      expect(res.body.totalFailedTasks).to.be.equal(4);
      expect(res.body.failedTasksIds.length).to.equal(4);
    });
  });

  describe("GET /tasks/users", function () {
    let activeUserWithProgressUpdates;
    let idleUser;
    let userNotInDiscord;
    let jwtToken;
    let getDiscordMembersStub;
    beforeEach(async function () {
      await cleanDb();
      idleUser = { ...userData[9], discordId: getDiscordMembers[0].user.id };
      activeUserWithProgressUpdates = { ...userData[10], discordId: getDiscordMembers[1].user.id };
      const activeUserWithNoUpdates = { ...userData[0], discordId: getDiscordMembers[2].user.id };
      userNotInDiscord = { ...userData[4], discordId: "Not in discord" };
      const {
        idleStatus: idleUserStatus,
        activeStatus: activeUserStatus,
        userStatusDataForOooState: oooUserStatus,
      } = userStatusData;
      const userIdList = await Promise.all([
        await addUser(idleUser), // idle user with no task progress updates
        await addUser(activeUserWithProgressUpdates), // active user with task progress updates
        await addUser(activeUserWithNoUpdates), // active user with no task progress updates
        await addUser(userNotInDiscord), // OOO user with
      ]);
      await Promise.all([
        await userStatusModel.updateUserStatus(userIdList[0], idleUserStatus),
        await userStatusModel.updateUserStatus(userIdList[1], activeUserStatus),
        await userStatusModel.updateUserStatus(userIdList[2], activeUserStatus),
        await userStatusModel.updateUserStatus(userIdList[3], oooUserStatus),
      ]);

      const tasksPromise = [];

      for (let index = 0; index < 4; index++) {
        const task = tasksData[index];
        const validTask = {
          ...task,
          assignee: userIdList[index],
          startedOn: (new Date().getTime() - convertDaysToMilliseconds(7)) / 1000,
          endsOn: (new Date().getTime() + convertDaysToMilliseconds(4)) / 1000,
          status: TASK_STATUS.IN_PROGRESS,
        };

        tasksPromise.push(tasksModel.add(validTask));
      }
      const taskIdList = (await Promise.all(tasksPromise)).map((tasksDoc) => tasksDoc.id);
      const progressDataList = [];

      const date = new Date();
      date.setDate(date.getDate() - 1);
      const progressData = stubbedModelTaskProgressData(null, taskIdList[2], date.getTime(), date.valueOf());
      progressDataList.push(progressData);

      await Promise.all(progressDataList.map(async (progress) => await createProgressDocument(progress)));
      const discordMembers = [...getDiscordMembers].map((user) => {
        return { ...user };
      });
      const roles1 = [...discordMembers[0].roles, "9876543210"];
      const roles2 = [...discordMembers[1].roles, "9876543210"];
      discordMembers[0].roles = roles1;
      discordMembers[1].roles = roles2;
      getDiscordMembersStub = sinon.stub(discordService, "getDiscordMembers");
      getDiscordMembersStub.returns(discordMembers);
      jwtToken = generateCronJobToken({ name: CRON_JOB_HANDLER });
    });
    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });
    it("should return successful response with user id list", async function () {
      const response = await chai
        .request(app)
        .get("/tasks/users/discord")
        .query({ q: `status:${tasksUsersStatus.MISSED_UPDATES}` })
        .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.body).to.be.deep.equal({
        message: "Discord details of users with status missed updates fetched successfully",
        data: {
          usersToAddRole: [activeUserWithProgressUpdates.discordId],
          tasks: 4,
          missedUpdatesTasks: 3,
        },
      });
      expect(response.status).to.be.equal(200);
    });
    it("should return successful response with user id when all params are passed", async function () {
      const response = await chai
        .request(app)
        .get("/tasks/users/discord")
        .query({
          size: 5,
          q: `status:${tasksUsersStatus.MISSED_UPDATES} -weekday:sun -weekday:mon -weekday:tue -weekday:wed -weekday:thu -weekday:fri -date:231423432 -days-count:4`,
        })
        .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.body).to.be.deep.equal({
        message: "Discord details of users with status missed updates fetched successfully",
        data: {
          usersToAddRole: [],
          tasks: 4,
          missedUpdatesTasks: 0,
        },
      });
      expect(response.status).to.be.equal(200);
    });

    it("should return bad request error when status is not passed", async function () {
      const response = await chai
        .request(app)
        .get("/tasks/users/discord")
        .query({})
        .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.body).to.be.deep.equal({
        error: "Bad Request",
        message: '"status" is required',
        statusCode: 400,
      });
      expect(response.status).to.be.equal(400);
    });
    it("should save logs when there is an error", async function () {
      getDiscordMembersStub.throws(new Error("Error occurred"));
      await chai
        .request(app)
        .get("/tasks/users/discord")
        .query({ q: `status:${tasksUsersStatus.MISSED_UPDATES}` })
        .set("Authorization", `Bearer ${jwtToken}`);

      const logsRef = await logsModel.where("type", "==", logType.TASKS_MISSED_UPDATES_ERRORS).get();
      let tasksLogs;
      logsRef.forEach((data) => {
        tasksLogs = data.data();
      });
      expect(tasksLogs.body.error).to.be.equal("Error: Error occurred");
    });
  });
});
