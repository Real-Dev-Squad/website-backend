const Sinon = require("sinon");
const { expect } = require("chai");

const firestore = require("../../../utils/firestore");
const tasksModel = firestore.collection("tasks");
const cleanDb = require("../../utils/cleanDb");
const taskDataArray = require("../../fixtures/tasks/tasks")();
const { updateTaskStatusToDone } = require("../../../services/tasks");

describe("Tasks services", function () {
  describe("task status COMPLETED to DONE in bulk", function () {
    const tasks = [];
    const taskDetails = [];
    beforeEach(async function () {
      const addTasksPromises = [];
      taskDataArray.forEach((task) => {
        const taskData = {
          ...task,
          status: "COMPLETED",
        };
        addTasksPromises.push(tasksModel.add(taskData));
      });

      await Promise.all(addTasksPromises);

      tasks.length = 0;
      taskDetails.length = 0;

      const snapshot = await tasksModel.where("status", "==", "COMPLETED").get();

      snapshot.forEach((task) => {
        const id = task.id;
        const taskData = task.data();
        tasks.push({ ...taskData, id });
        taskDetails.push(id);
      });
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("successfully updated task status COMPLETED To DONE", async function () {
      const res = await updateTaskStatusToDone(tasks);

      expect(res).to.deep.equal({
        totalUpdatedStatus: 8,
        totalOperationsFailed: 0,
        updatedTaskDetails: taskDetails,
        failedTaskDetails: [],
      });
    });

    it("should throw an error if firebase batch operation fails", async function () {
      const batchStub = Sinon.stub(firestore, "batch");
      batchStub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firebase batch operation failed");
        },
      });

      const res = await updateTaskStatusToDone(tasks);

      expect(res).to.deep.equal({
        totalUpdatedStatus: 0,
        totalOperationsFailed: 8,
        updatedTaskDetails: [],
        failedTaskDetails: taskDetails,
      });
    });
  });
});
