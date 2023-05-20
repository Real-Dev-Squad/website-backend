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

/* eslint-disable mocha/no-skipped-tests */
describe.skip("Test the tracked Progress API", function () {
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

  describe("Verify the POST call for tracked progresses", function () {
    it("stores the tracked progress document for user", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId1,
        });
      expect(response).to.have.status(201);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource created successfully.");
      expect(response.body).to.have.property("data").that.is.an("object");

      const data = response.body.data;
      expect(data).to.have.keys(["id", "type", "userId", "currentlyTracked", "frequency", "createdAt", "updatedAt"]);
      expect(data).to.have.property("id").that.is.a("string");
      expect(data).to.have.property("type").that.equals("user");
      expect(data).to.have.property("userId").that.equals(userId1);
      expect(data).to.have.property("currentlyTracked").that.equals(true);
      expect(data).to.have.property("frequency").that.equals(1);
      expect(data).to.have.property("createdAt").that.is.a("string").and.satisfy(isISOString);
      expect(data).to.have.property("updatedAt").that.is.a("string").and.satisfy(isISOString);
    });

    it("throws 409 if tracked progress document already exists for the same user", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId0,
        });
      expect(response).to.have.status(409);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource is already being tracked.");
    });

    it("stores the tracked progress document for task", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressTaskDataForPost,
          taskId: taskId1,
        });
      expect(response).to.have.status(201);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource created successfully.");
      expect(response.body).to.have.property("data").that.is.an("object");

      const data = response.body.data;
      expect(data).to.have.keys(["id", "type", "taskId", "currentlyTracked", "frequency", "createdAt", "updatedAt"]);
      expect(data).to.have.property("id").that.is.a("string");
      expect(data).to.have.property("type").that.equals("task");
      expect(data).to.have.property("taskId").that.equals(taskId1);
      expect(data).to.have.property("currentlyTracked").that.equals(true);
      expect(data).to.have.property("frequency").that.equals(2);
      expect(data).to.have.property("createdAt").that.is.a("string").and.satisfy(isISOString);
      expect(data).to.have.property("updatedAt").that.is.a("string").and.satisfy(isISOString);
    });

    it("throws 409 if tracked progress document already exists for the same task", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressTaskDataForPost,
          taskId: taskId0,
        });
      expect(response).to.have.status(409);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource is already being tracked.");
    });

    it("throws 400 Bad Request if the payload is incorrect", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressTaskDataForPost,
          type: "event", // passing incorrect type
          taskId: taskId0,
        });
      expect(response).to.have.status(400);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.equals("Bad Request");
      expect(response.body)
        .to.have.property("message")
        .that.equals("Type field is restricted to either 'user' or 'task'.");
    });

    it("Handles unauthenticated user request with 401 Unauthorized", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId0,
        });
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.equals("Unauthorized");
      expect(response.body).to.have.property("message").that.equals("Unauthenticated User");
    });

    it("handles unauthorized user request who don't have super user permission", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: userId0,
        });
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.equals("Unauthorized");
      expect(response.body).to.have.property("message").that.equals("You are not authorized for this action.");
    });

    it("handles no resource found with 404 if the task / user does not exist", async function () {
      const response = await chai
        .request(app)
        .post("/tracked-progresses")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({
          ...trackedProgressUserDataForPost,
          userId: "invalid-user",
        });
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("User with id invalid-user does not exist.");
    });
  });

  describe("Verify the PATCH call for tracked progresses", function () {
    it("Updates the tracked progress document for user", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/user/${userId0}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource updated successfully.");
      expect(response.body).to.have.property("data").that.is.an("object");

      const data = response.body.data;
      expect(data).to.have.keys(["id", "type", "userId", "currentlyTracked", "frequency", "createdAt", "updatedAt"]);
      expect(data).to.have.property("id").that.is.a("string");
      expect(data).to.have.property("type").that.equals("user");
      expect(data).to.have.property("userId").that.equals(userId0);
      expect(data).to.have.property("currentlyTracked").that.equals(false);
    });

    it("throws 404 if tried to update a user document that doesn't exist", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/user/${userId1}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource not found.");
    });

    it("Updates the tracked progress document for task", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/task/${taskId0}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource updated successfully.");
      expect(response.body).to.have.property("data").that.is.an("object");

      const data = response.body.data;
      expect(data).to.have.keys(["id", "type", "taskId", "currentlyTracked", "frequency", "createdAt", "updatedAt"]);
      expect(data).to.have.property("id").that.is.a("string");
      expect(data).to.have.property("type").that.equals("task");
      expect(data).to.have.property("taskId").that.equals(taskId0);
      expect(data).to.have.property("currentlyTracked").that.equals(false);
    });

    it("throws 404 if tried to update a task document that doesn't exist", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/task/${taskId1}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource not found.");
    });

    it("throws 400 Bad Request if the payload is incorrect", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/user/${taskId0}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ currentlyTracked: "false" });
      expect(response).to.have.status(400);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.equals("Bad Request");
      expect(response.body).to.have.property("message").that.equals("currentlyTracked field must be a boolean value.");
    });

    it("Handles unauthenticated user request with 401 Unauthorized", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/task/${taskId0}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.equals("Unauthorized");
      expect(response.body).to.have.property("message").that.equals("Unauthenticated User");
    });

    it("handles unauthorized user request who don't have super user permission", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/task/${taskId0}`)
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(401);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.equals("Unauthorized");
      expect(response.body).to.have.property("message").that.equals("You are not authorized for this action.");
    });

    it("handles no resource found with 404 if the task / user does not exist", async function () {
      const response = await chai
        .request(app)
        .patch(`/tracked-progresses/user/invalid-task`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(trackedProgressDataForPatch);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource not found.");
    });
  });

  describe("Verify the GET endpoint for retrieving progress document for the user on a particular date", function () {
    it("Returns the tracked progress document for a specific user", async function () {
      const response = await chai.request(app).get(`/tracked-progresses/user/${userId0}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.keys(["message", "data"]);
      expect(response.body.data).to.be.an("object");
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.have.keys([
        "id",
        "type",
        "userId",
        "currentlyTracked",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
    });

    it("Returns the tracked progress document for a specific task", async function () {
      const response = await chai.request(app).get(`/tracked-progresses/task/${taskId0}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.keys(["message", "data"]);
      expect(response.body.data).to.be.an("object");
      expect(response.body.message).to.be.equal("Resource retrieved successfully.");
      expect(response.body.data).to.have.keys([
        "id",
        "type",
        "taskId",
        "currentlyTracked",
        "frequency",
        "createdAt",
        "updatedAt",
      ]);
    });

    it("Should return 404 No tracked progress exist in user collection", async function () {
      const response = await chai.request(app).get(`/tracked-progresses/user/${userId1}`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.key("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });

    it("Should return 404 No tracked progress exist in task collection", async function () {
      const response = await chai.request(app).get(`/tracked-progresses/task/${taskId1}`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.key("message");
      expect(response.body.message).to.be.equal("Resource not found.");
    });

    it("Returns 404 for invalid user id", async function () {
      const response = await chai.request(app).get(`/tracked-progresses/user/invalidUserId`);
      expect(response).to.have.status(404);
      expect(response.body.message).to.be.equal("User with id invalidUserId does not exist.");
    });

    it("Returns 404 for invalid task id", async function () {
      const response = await chai.request(app).get(`/tracked-progresses/task/invalidTaskId`);
      expect(response).to.have.status(404);
      expect(response.body.message).to.be.equal("Task with id invalidTaskId does not exist.");
    });
  });

  describe("Verify the GET endpoint for retrieving progress documents of specific type", function () {
    it("Returns the tracked progress document for a user type", async function () {
      const response = await chai.request(app).get(`/tracked-progresses?type=user`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource retrieved successfully.");
      expect(response.body).to.have.property("data").that.is.an("array").with.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.property("id").that.is.a("string");
      expect(trackedProgress).to.have.property("currentlyTracked").that.is.a("boolean");
      expect(trackedProgress).to.have.property("createdAt").that.is.a("string").and.satisfy(isISOString);
      expect(trackedProgress).to.have.property("type").that.is.a("string");
      expect(trackedProgress).to.have.property("userId").that.is.a("string");
      expect(trackedProgress).to.have.property("frequency").that.is.a("number");
      expect(trackedProgress).to.have.property("updatedAt").that.is.a("string").and.satisfy(isISOString);
    });

    it("Returns the tracked progress document for a user type and currentlyTracked", async function () {
      const response = await chai.request(app).get(`/tracked-progresses?type=user&currentlyTracked=true`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource retrieved successfully.");
      expect(response.body).to.have.property("data").that.is.an("array").with.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.property("id").that.is.a("string");
      expect(trackedProgress).to.have.property("currentlyTracked").that.is.a("boolean");
      expect(trackedProgress).to.have.property("createdAt").that.is.a("string").and.satisfy(isISOString);
      expect(trackedProgress).to.have.property("type").that.is.a("string");
      expect(trackedProgress).to.have.property("userId").that.is.a("string");
      expect(trackedProgress).to.have.property("frequency").that.is.a("number");
      expect(trackedProgress).to.have.property("updatedAt").that.is.a("string").and.satisfy(isISOString);
    });

    it("Returns an empty array if none of the query matches for user", async function () {
      const response = await chai.request(app).get(`/tracked-progresses?type=user&currentlyTracked=false`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource not found.");
      expect(response.body).to.have.property("data").that.is.an("array").with.lengthOf(0);
    });

    it("Returns the tracked progress document for a task type", async function () {
      const response = await chai.request(app).get(`/tracked-progresses?type=task`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource retrieved successfully.");
      expect(response.body).to.have.property("data").that.is.an("array").with.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.property("id").that.is.a("string");
      expect(trackedProgress).to.have.property("currentlyTracked").that.is.a("boolean");
      expect(trackedProgress).to.have.property("createdAt").that.is.a("string").and.satisfy(isISOString);
      expect(trackedProgress).to.have.property("type").that.is.a("string");
      expect(trackedProgress).to.have.property("taskId").that.is.a("string");
      expect(trackedProgress).to.have.property("frequency").that.is.a("number");
      expect(trackedProgress).to.have.property("updatedAt").that.is.a("string").and.satisfy(isISOString);
    });

    it("Returns the tracked progress document for a task type and currentlyTracked", async function () {
      const response = await chai.request(app).get(`/tracked-progresses?type=task&currentlyTracked=true`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource retrieved successfully.");
      expect(response.body).to.have.property("data").that.is.an("array").with.lengthOf(1);

      const trackedProgress = response.body.data[0];
      expect(trackedProgress).to.be.an("object");
      expect(trackedProgress).to.have.property("id").that.is.a("string");
      expect(trackedProgress).to.have.property("currentlyTracked").that.is.a("boolean");
      expect(trackedProgress).to.have.property("createdAt").that.is.a("string").and.satisfy(isISOString);
      expect(trackedProgress).to.have.property("type").that.is.a("string");
      expect(trackedProgress).to.have.property("taskId").that.is.a("string");
      expect(trackedProgress).to.have.property("frequency").that.is.a("number");
      expect(trackedProgress).to.have.property("updatedAt").that.is.a("string").and.satisfy(isISOString);
    });

    it("Returns an empty array if none of the query matches for task", async function () {
      const response = await chai.request(app).get(`/tracked-progresses?type=task&currentlyTracked=false`);
      expect(response).to.have.status(404);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("message").that.equals("Resource not found.");
      expect(response.body).to.have.property("data").that.is.an("array").with.lengthOf(0);
    });
  });
});
