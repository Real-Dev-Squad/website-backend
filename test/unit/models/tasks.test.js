/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");
const cleanDb = require("../../utils/cleanDb");
const tasksData = require("../../fixtures/tasks/tasks")();
const tasks = require("../../../models/tasks");
const { addDependency, updateTask, fetchTask } = require("../../../models/tasks");
const firestore = require("../../../utils/firestore");
const { TASK_STATUS } = require("../../../constants/tasks");
const dependencyModel = firestore.collection("TaskDependencies");
const tasksModel = firestore.collection("tasks");

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

  describe("updateDependency", function () {
    it("should add dependencies to firestore", async function () {
      const data = {
        taskId: "taskId1",
        dependsOn: ["taskId2", "taskId3"],
      };
      const result = await updateTask(data);

      expect(result.taskDetails.taskId).to.equal(data.taskId);
      expect(result.taskDetails.dependsOn).to.equal(data.dependsOn);
    });
  });
  describe("update task", function () {
    afterEach(function () {
      sinon.restore();
    });

    it.only("should return correct result", async function () {
      const data = {
        title: "Test task-dependency",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "AVAILABLE",
        dependsOn: ["taskId2", "taskId3"],
        percentCompleted: 100,
        participants: [],
        isNoteworthy: true,
        assignee: false,
      };

      // const setStub = sinon.stub(tasksModel.doc("tasks"), "set").resolves();
      // const getStub = sinon.stub(tasksModel.doc("tasks"), "get").resolves({
      //   data: () => data,
      // });

      // const result = await updateTask(data);
      await tasksModel.doc("tasks").set(data);
      const dependencyDatas = (await tasksModel.doc("tasks").get()).data();
      console.log("datat12", dependencyDatas);
      // console.log("rs", result);
      const taskData = {
        title: "vinit",
      };
      const result3 = await updateTask(taskData, "tasks");
      console.log("assigne", taskData);
      console.log("d3", result3);
      // await tasksModel.doc("tasks").set(taskData);
      const dependencyData = await tasksModel.doc("tasks").get();
      console.log("docccc", dependencyData.data());
      // const result2 = await fetchTask(result3.taskId);
      // console.log("*******", result2);

      // expect(dependencyData.dependsOn).to.be.a("array");
      // expect(dependencyData.taskId).to.be.equal("taskId1");

      // setStub.restore();
      // getStub.restore();
    });
  });
});
