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
const { addDependency, updateTask } = require("../../../models/tasks");
const firestore = require("../../../utils/firestore");
const { TASK_STATUS } = require("../../../constants/tasks");
const dependencyModel = firestore.collection("TaskDependencies");

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

    it("should fetch all tasks when dev is false and no status is passed to the fetchTasks function", async function () {
      const result = await tasks.fetchTasks();

      expect(result).to.have.length(tasksData.length);
      result.forEach((task) => {
        const sameTask = tasksData.find((t) => t.title === task.title);
        expect(task).to.contain.all.keys(sameTask);
      });
    });

    it("should fetch all tasks when dev is false but status is passed to the fetchTasks function", async function () {
      const status = TASK_STATUS.ASSIGNED;
      const result = await tasks.fetchTasks(false, status);

      expect(result).to.have.length(tasksData.length);

      result.forEach((task) => {
        const sameTask = tasksData.find((t) => t.title === task.title);
        expect(task).to.contain.all.keys(sameTask);
      });
    });

    it("should fetch all tasks when dev is true but no status is passed to the fetchTasks function", async function () {
      const result = await tasks.fetchTasks(true);

      expect(result).to.have.length(tasksData.length);

      result.forEach((task) => {
        const sameTask = tasksData.find((t) => t.title === task.title);
        expect(task).to.contain.all.keys(sameTask);
      });
    });

    it("should fetch tasks filtered by the status when dev is true ans no status is passed to the fetchTasks function", async function () {
      const status = TASK_STATUS.ASSIGNED;
      const result = await tasks.fetchTasks(true, status);
      const taskDataByStatus = tasksData.filter((data) => data.status === status);

      expect(result).to.have.length(taskDataByStatus.length);
      result.forEach((task) => expect(task.status).to.equal(status));

      result.forEach((task) => {
        const sameTask = taskDataByStatus.find((t) => t.title === task.title);
        expect(task).to.contain.all.keys(sameTask);
      });
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
});
