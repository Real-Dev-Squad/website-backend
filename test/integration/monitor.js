const chai = require("chai");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const taskData = require("../fixtures/tasks/tasks")();
const { updateTask } = require("../../models/tasks");
const {
  predefinedTrackedProgressDataForUser,
  predefinedTrackedProgressDataForTask,
  isISOString,
  trackedProgressUserDataForPost,
  trackedProgressTaskDataForPost,
  trackedProgressDataForPatch,
} = require("../fixtures/trackedProgress");

const userData = require("../fixtures/user/user")();
const [userData0, userData1, , , superUserData] = userData;

const cookieName = config.get("userToken.cookieName");
const { expect } = chai;

describe("Test the tracked Progress API", function () {
  let userId0, userId1, superUser;
  let userIdToken0, superUserToken;
  let taskId0, taskId1;

  beforeEach(async function () {
    userId0 = await addUser(userData0);
    userIdToken0 = authService.generateAuthToken({ userId: userId0 });
    userId1 = await addUser(userData1);
    superUser = await addUser(superUserData);
    superUserToken = authService.generateAuthToken({ userId: superUser });

    const taskObject0 = await updateTask(taskData[0]);
    taskId0 = taskObject0.taskId;
    const taskObject1 = await updateTask(taskData[1]);
    taskId1 = taskObject1.taskId;

    const docRefUser0 = firestore.collection("trackedProgresses").doc();
    await docRefUser0.set({ ...predefinedTrackedProgressDataForUser, userId: userId0 });

    const docRefTask0 = firestore.collection("trackedProgresses").doc();
    await docRefTask0.set({ ...predefinedTrackedProgressDataForTask, taskId: taskId0 });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("Verify the POST call for monitor route", function () {
    it("stores the tracked progress document for user", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId1,
        });
      expect(response).to.have.status(201);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource created successfully.");
      expect(response.body.data).to.be.an("object");

      expect(response.body.data).to.have.all.keys([
        "id",
        "type",
        "userId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
      const { id, type, userId, monitored, frequency, createdAt, updatedAt } = response.body.data;
      expect(id).to.be.a("string");
      expect(type).to.be.equal("user");
      expect(userId).to.be.equal(userId1);
      expect(monitored).to.be.equal(true);
      expect(frequency).to.be.equal(1);
      expect(createdAt).to.satisfy(isISOString);
      expect(updatedAt).to.satisfy(isISOString);
    });

    it("throws 409 if tracked progress document already exists for the same user", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId0,
        });
      expect(response).to.have.status(409);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.be.equal("Resource is already being tracked.");
    });

    it("stores the tracked progress document for task", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressTaskDataForPost,
          taskId: taskId1,
        });
      expect(response).to.have.status(201);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource created successfully.");
      expect(response.body.data).to.be.an("object");

      expect(response.body.data).to.have.all.keys([
        "id",
        "type",
        "taskId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
      const { id, type, taskId, monitored, frequency, createdAt, updatedAt } = response.body.data;
      expect(id).to.be.a("string");
      expect(type).to.be.equal("task");
      expect(taskId).to.be.equal(taskId1);
      expect(monitored).to.be.equal(true);
      expect(frequency).to.be.equal(2);
      expect(createdAt).to.satisfy(isISOString);
      expect(updatedAt).to.satisfy(isISOString);
    });

    it("throws 409 if tracked progress document already exists for the same task", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressTaskDataForPost,
          taskId: taskId0,
        });
      expect(response).to.have.status(409);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.be.equal("Resource is already being tracked.");
    });

    it("throws 400 Bad Request if the payload is incorrect", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressTaskDataForPost,
          type: "event", // passing incorrect type
          taskId: taskId0,
        });
      expect(response).to.have.status(400);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.keys(["error", "message", "statusCode"]);
      expect(response.body.error).to.be.equal("Bad Request");
      expect(response.body.message).to.be.equal("Type field is restricted to either 'user' or 'task'.");
    });

    it("Handles unauthenticated user request with 401 Unauthorized", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId0,
        });
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["error", "message", "statusCode"]);
      expect(response.body.error).to.be.equal("Unauthorized");
      expect(response.body.message).to.be.equal("Unauthenticated User");
    });

    it("handles unauthorized user request who don't have super user permission", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId0,
        });
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["error", "message", "statusCode"]);

      expect(response.body.error).to.equal("Unauthorized");
      expect(response.body.message).to.equals("You are not authorized for this action.");
    });

    it("handles no resource found with 404 if the task / user does not exist", async function () {
      const response = await chai
        .request(app)
        .post("/monitor")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: "invalid-user",
        });
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.be.equal("User with id invalid-user does not exist.");
    });
  });

  describe("Verify the PATCH call for monitor route", function () {
    it("Updates the tracked progress document for user", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/user/${userId0}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource updated successfully.");
      expect(response.body.data).to.be.an("object");

      expect(response.body.data).to.have.all.keys([
        "id",
        "type",
        "userId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
      const { id, type, userId, monitored, frequency, createdAt, updatedAt } = response.body.data;
      expect(id).to.be.a("string");
      expect(frequency).to.be.a("number");
      expect(type).to.be.equal("user");
      expect(userId).to.be.equal(userId0);
      expect(monitored).to.be.equal(false);
      expect(createdAt).to.satisfy(isISOString);
      expect(updatedAt).to.satisfy(isISOString);
    });

    it("throws 404 if tried to update a user document that doesn't exist", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/user/${userId1}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });

    it("Updates the tracked progress document for task", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/task/${taskId0}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource updated successfully.");
      expect(response.body.data).to.be.an("object");
      expect(response.body.data).to.have.all.keys([
        "id",
        "type",
        "taskId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);

      const { id, type, taskId, monitored, frequency, createdAt, updatedAt } = response.body.data;

      expect(id).to.be.a("string");
      expect(frequency).to.be.a("number");
      expect(type).to.be.equal("task");
      expect(taskId).to.be.equal(taskId0);
      expect(monitored).to.be.equal(false);
      expect(createdAt).to.satisfy(isISOString);
      expect(updatedAt).to.satisfy(isISOString);
    });

    it("throws 404 if tried to update a task document that doesn't exist", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/task/${taskId1}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });

    it("throws 400 Bad Request if the payload is incorrect", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/user/${taskId0}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ monitored: "false" });
      expect(response).to.have.status(400);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.keys(["message", "error", "statusCode"]);
      expect(response.body.statusCode).to.be.equal(400);
      expect(response.body.error).to.be.equal("Bad Request");
      expect(response.body.message).to.be.equal("monitored field must be a boolean value.");
    });

    it("Handles unauthenticated user request with 401 Unauthorized", async function () {
      const response = await chai.request(app).patch(`/monitor/task/${taskId0}`).send(trackedProgressDataForPatch);
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.keys(["message", "error", "statusCode"]);
      expect(response.body.statusCode).to.be.equal(401);
      expect(response.body.error).to.be.equal("Unauthorized");
      expect(response.body.message).to.be.equal("Unauthenticated User");
    });

    it("handles unauthorized user request who don't have super user permission", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/task/${taskId0}`)
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "error", "statusCode"]);
      expect(response.body.statusCode).to.be.equal(401);
      expect(response.body.error).to.be.equal("Unauthorized");
      expect(response.body.message).to.be.equal("You are not authorized for this action.");
    });

    it("handles no resource found with 404 if the task / user does not exist", async function () {
      const response = await chai
        .request(app)
        .patch(`/monitor/user/invalid-task`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });
  });

  describe("Verify the GET call for monitor route", function () {
    it("Returns the tracked progress document for a specific user", async function () {
      const response = await chai.request(app).get(`/monitor?userId=${userId0}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.data).to.be.an("object");
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.have.all.keys([
        "id",
        "type",
        "userId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
    });

    it("Returns the tracked progress document for a specific task", async function () {
      const response = await chai.request(app).get(`/monitor?taskId=${taskId0}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.keys(["message", "data"]);
      expect(response.body.data).to.be.an("object");
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.have.all.keys([
        "id",
        "type",
        "taskId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
    });

    it("Should return 404 No tracked progress exist in user collection", async function () {
      const response = await chai.request(app).get(`/monitor?userId=${userId1}`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.key("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });

    it("Should return 404 No tracked progress exist in task collection", async function () {
      const response = await chai.request(app).get(`/monitor?taskId=${taskId1}`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.key("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });

    it("Returns 404 for invalid user id", async function () {
      const response = await chai.request(app).get("/monitor?userId=invalidUserId");
      expect(response).to.have.status(404);
      expect(response.body.message).to.be.equal("User with id invalidUserId does not exist.");
    });

    it("Returns 404 for invalid task id", async function () {
      const response = await chai.request(app).get("/monitor?taskId=invalidTaskId");
      expect(response).to.have.status(404);
      expect(response.body.message).to.be.equal("Task with id invalidTaskId does not exist.");
    });

    it("Returns the tracked progress document for a user type", async function () {
      const response = await chai.request(app).get(`/monitor?type=user`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.be.an("array").with.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.all.keys([
        "id",
        "createdAt",
        "type",
        "userId",
        "frequency",
        "updatedAt",
        "monitored",
      ]);
      const { id, createdAt, type, userId, frequency, updatedAt, monitored } = trackedProgress;
      expect(id).to.be.a("string");
      expect(monitored).to.be.a("boolean");
      expect(createdAt).to.be.a("string").and.satisfy(isISOString);
      expect(type).to.be.a("string");
      expect(userId).to.be.a("string");
      expect(frequency).to.be.a("number");
      expect(updatedAt).to.be.a("string").and.satisfy(isISOString);
    });

    it("Returns the tracked progress document for a user type and monitored", async function () {
      const response = await chai.request(app).get(`/monitor?type=user&monitored=true`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.be.an("array");
      expect(response.body.data).to.have.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.all.keys([
        "id",
        "createdAt",
        "type",
        "userId",
        "frequency",
        "updatedAt",
        "monitored",
      ]);
      const { id, createdAt, type, userId, frequency, updatedAt, monitored } = trackedProgress;
      expect(id).to.be.a("string");
      expect(monitored).to.be.a("boolean");
      expect(createdAt).to.be.a("string").and.satisfy(isISOString);
      expect(type).to.be.a("string");
      expect(userId).to.be.a("string");
      expect(frequency).to.be.a("number");
      expect(updatedAt).to.be.a("string").and.satisfy(isISOString);
    });

    it("Returns an empty array if none of the query matches for user", async function () {
      const response = await chai.request(app).get(`/monitor?type=user&monitored=false`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource not found.");
      expect(response.body.data).to.be.an("array").with.lengthOf(0);
    });

    it("Returns the tracked progress document for a task type", async function () {
      const response = await chai.request(app).get(`/monitor?type=task`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.be.an("array").with.lengthOf(1);
      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.all.keys([
        "id",
        "type",
        "taskId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
      const { id, createdAt, type, taskId, frequency, updatedAt, monitored } = trackedProgress;
      expect(id).to.be.a("string");
      expect(monitored).to.be.a("boolean");
      expect(createdAt).to.be.a("string").and.satisfy(isISOString);
      expect(type).to.be.a("string");
      expect(taskId).to.be.a("string");
      expect(frequency).to.be.a("number");
      expect(updatedAt).to.be.a("string").and.satisfy(isISOString);
    });

    it("Returns the tracked progress document for a task type and monitored", async function () {
      const response = await chai.request(app).get(`/monitor?type=task&monitored=true`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.be.an("array").with.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.all.keys([
        "id",
        "type",
        "taskId",
        "monitored",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
      const { id, createdAt, type, taskId, frequency, updatedAt, monitored } = trackedProgress;
      expect(id).to.be.a("string");
      expect(monitored).to.be.a("boolean");
      expect(createdAt).to.be.a("string").and.satisfy(isISOString);
      expect(type).to.be.a("string");
      expect(taskId).to.be.a("string");
      expect(frequency).to.be.a("number");
      expect(updatedAt).to.be.a("string").and.satisfy(isISOString);
    });

    it("Returns an empty array if none of the query matches for task", async function () {
      const response = await chai.request(app).get(`/monitor?type=task&monitored=false`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys(["message", "data"]);
      expect(response.body.message).to.be.equal("Resource not found.");
      expect(response.body.data).to.be.an("array").with.lengthOf(0);
    });
  });
});
