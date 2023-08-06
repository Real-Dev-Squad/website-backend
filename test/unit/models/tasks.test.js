/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require("chai");
const { expect } = chai;
const cleanDb = require("../../utils/cleanDb");
const tasksData = require("../../fixtures/tasks/tasks")();
const tasks = require("../../../models/tasks");
const { addDependency, updateTask, getBuiltTasks } = require("../../../models/tasks");
const firestore = require("../../../utils/firestore");
const { TASK_STATUS } = require("../../../constants/tasks");
const dependencyModel = firestore.collection("TaskDependencies");
const tasksModel = firestore.collection("tasks");
const userData = require("../../fixtures/user/user");
const addUser = require("../../utils/addUser");

describe("tasks", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("overdueTasks", function () {
    it("Should return overdue tasks", async function () {
      const { taskDetails: taskData1, taskId: taskId1 } = await tasks.updateTask(tasksData[0]);
      const { taskDetails: taskData2, taskId: taskId2 } = await tasks.updateTask(tasksData[1]);

      const { assignee: assignee1 } = taskData1;
      const { assignee: assignee2 } = taskData2;

      const newAvailableTasks = await tasks.overdueTasks([
        { ...taskData1, id: taskId1 },
        { ...taskData2, id: taskId2 },
      ]);

      newAvailableTasks.forEach((task) => {
        const { unassignedMember } = task;
        const { assignee, startedOn, endsOn, status } = task.unassignedTask;
        expect(unassignedMember).to.be.oneOf([assignee1, assignee2]);
        expect(status).to.equal("AVAILABLE");
        expect(assignee).to.equal(null);
        expect(startedOn).to.equal(null);
        expect(endsOn).to.equal(null);
      });
    });
  });

  describe("addDependency", function () {
    it("should add dependencies to firestore and return dependsOn array", async function () {
      const data = {
        taskId: "taskId1",
        dependsOn: ["taskId2", "taskId3"],
      };
      const result = await addDependency(data);
      expect(result).to.deep.equal(data.dependsOn);
    });

    it("should throw an error if there is an error while creating dependencies", async function () {
      const data = {
        taskId: "taskId1",
        dependsOn: ["taskId2", "taskId3"],
      };
      const expectedError = new Error("test error");
      dependencyModel.doc = () => {
        throw expectedError;
      };
      try {
        await addDependency(data);
      } catch (err) {
        expect(err).to.deep.equal(expectedError);
      }
    });
  });

  describe("fetchTasks", function () {
    beforeEach(async function () {
      const tasksPromise = tasksData.map(async (task) => {
        await tasks.updateTask(task);
      });
      await Promise.all(tasksPromise);
    });

    it("should fetch all tasks", async function () {
      const result = await tasks.fetchTasks();

      expect(result).to.have.length(tasksData.length);
      result.forEach((task) => {
        const sameTask = tasksData.find((t) => t.title === task.title);
        expect(task).to.contain.all.keys(sameTask);
      });
    });
    it("should fetch tasks filtered by search term", async function () {
      const searchTerm = "task-dependency";
      const tasksSnapshot = await tasksModel.get();
      const result = await getBuiltTasks(tasksSnapshot, searchTerm);
      expect(result).to.have.lengthOf(1);
      result.forEach((task) => {
        expect(task.title.toLowerCase()).to.include(searchTerm.toLowerCase());
      });
      expect(tasksData[5].title.includes(searchTerm));
    });
    it("should return empty array when no search term is found", async function () {
      const searchTerm = "random";
      const tasksSnapshot = await tasksModel.get();
      const result = await getBuiltTasks(tasksSnapshot, searchTerm);
      expect(result).to.have.lengthOf(0);
    });
  });

  describe("paginatedTasks", function () {
    beforeEach(async function () {
      const tasksPromise = tasksData.map(async (task) => {
        await tasks.updateTask(task);
      });
      await Promise.all(tasksPromise);
    });

    it("should return allTasks, next and prev parameters", async function () {
      const result = await tasks.fetchPaginatedTasks({});

      expect(result).to.have.property("allTasks");
      expect(result).to.have.property("next");
      expect(result).to.have.property("prev");
    });

    it("should paginate and fetch all tasks when no status is passed", async function () {
      const SIZE = 5;
      const result = await tasks.fetchPaginatedTasks({});

      expect(result).to.have.property("allTasks");
      expect(result.allTasks).to.have.length(SIZE);
    });

    it("should paginate and fetch tasks with the passed size", async function () {
      const SIZE = 3;
      const result = await tasks.fetchPaginatedTasks({
        size: SIZE,
      });

      expect(result).to.have.property("allTasks");
      expect(result.allTasks).to.have.length(SIZE);
    });

    it("should fetch all tasks filtered by the status passed", async function () {
      const status = TASK_STATUS.ASSIGNED;
      const SIZE = 5;
      const result = await tasks.fetchPaginatedTasks({ status });

      const filteredTasks = tasksData.filter((task) => task.status === status);
      const tasksLength = filteredTasks.length > SIZE ? SIZE : filteredTasks.length;

      expect(result).to.have.property("allTasks");

      expect(result.allTasks).to.have.length(tasksLength);
      result.allTasks.forEach((task) => expect(task.status).to.be.equal(status));
    });
  });

  describe("update Dependency", function () {
    it("should add dependencies to firestore", async function () {
      const taskId = (await tasks.updateTask(tasksData[5])).taskId;
      await firestore.collection("tasks").doc(taskId).set(tasksData[5]);

      const taskId1 = (await tasks.updateTask(tasksData[3])).taskId;
      const taskId2 = (await tasks.updateTask(tasksData[4])).taskId;
      const dependsOn = [taskId1, taskId2];
      const data = {
        dependsOn,
      };

      await updateTask(data, taskId);
      const taskData = await tasks.fetchTask(taskId);
      taskData.dependencyDocReference.forEach((taskId) => {
        expect(dependsOn).to.include(taskId);
      });
    });
    it("should throw error when wrong id is passed", async function () {
      const taskId = (await tasks.updateTask(tasksData[5])).taskId;
      await firestore.collection("tasks").doc(taskId).set(tasksData[5]);

      const dependsOn = ["taskId1", "taskId2"];
      const data = {
        dependsOn,
      };

      try {
        await updateTask(data, taskId);
        expect.fail("Something went wrong");
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Invalid dependency passed");
      }
    });
  });
  describe("update tasks", function () {
    it("should update status when assignee pass as payload", async function () {
      const data = {
        assignee: "sagar",
      };
      const taskId = (await tasks.updateTask(tasksData[4])).taskId;

      const userArr = userData();
      const userId1 = await addUser(userArr[3]);

      await firestore.collection("tasks").doc(taskId).set(tasksData[4]);
      await firestore.collection("users").doc(userId1).set(userArr[3]);

      await updateTask(data, taskId);

      const modalResult = await tasks.fetchTask(taskId);
      expect(modalResult.taskData.status).to.be.equal(TASK_STATUS.ASSIGNED);
      expect(modalResult.taskData.assignee).to.be.equal("sagar");

      const firestoreResult = (await tasksModel.doc(taskId).get()).data();
      expect(firestoreResult.status).to.be.equal(TASK_STATUS.ASSIGNED);
      expect(firestoreResult.assignee).to.be.equal(userId1);
    });
  });
});
