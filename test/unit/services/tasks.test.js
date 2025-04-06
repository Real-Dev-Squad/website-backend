import { expect } from "chai";
import Sinon from "sinon";
import firestore from "../../../utils/firestore.js";
import cleanDb from "../../utils/cleanDb.js";
import taskDataArray from "../../fixtures/tasks/tasks.js";
import { fetchOrphanedTasks } from "../../../services/tasks.js";
import { usersData, tasksData } from "../../fixtures/abandoned-tasks/departed-users.js";
import * as tasks from "../../../models/tasks.js";
const tasksModel = firestore.collection("tasks");
const userModel = firestore.collection("users");

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
      const res = await tasks.updateTaskStatusToDone(tasks);

      expect(res).to.deep.equal({
        totalUpdatedStatus: 9,
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

      const res = await tasks.updateTaskStatusToDone(tasks);

      expect(res).to.deep.equal({
        totalUpdatedStatus: 0,
        totalOperationsFailed: 9,
        updatedTaskDetails: [],
        failedTaskDetails: taskDetails,
      });
    });
  });

  describe("fetchOrphanedTasks", function () {
    beforeEach(async function () {
      await cleanDb();

      const userPromises = usersData.map((user) => userModel.doc(user.id).set(user));
      await Promise.all(userPromises);

      const taskPromises = tasksData.map((task) => tasksModel.add(task));
      await Promise.all(taskPromises);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should fetch tasks assigned to archived and non-discord users", async function () {
      const orphanedTasks = await fetchOrphanedTasks();
      expect(orphanedTasks).to.be.an("array");
      expect(orphanedTasks).to.have.lengthOf(2);
    });

    it("should not include completed or done tasks", async function () {
      const orphanedTasks = await fetchOrphanedTasks();

      orphanedTasks.forEach((task) => {
        expect(task.status).to.not.be.oneOf(["DONE", "COMPLETED"]);
      });
    });

    it("should not include tasks from active users", async function () {
      const orphanedTasks = await fetchOrphanedTasks();

      orphanedTasks.forEach((task) => {
        expect(task.assignee).to.not.equal("active_user");
      });
    });

    it("should handle case when no users are archived", async function () {
      await cleanDb();

      const activeUser = usersData[2];
      await userModel.add(activeUser);

      const activeTask = tasksData[3];
      await tasksModel.add(activeTask);

      const orphanedTasks = await fetchOrphanedTasks();
      expect(orphanedTasks).to.be.an("array");
      expect(orphanedTasks).to.have.lengthOf(0);
    });

    it("should handle errors gracefully if getUsersWithIncompleteTasks fails", async function () {
      Sinon.stub(tasks, "fetchIncompleteTasksByUserIds").throws(new Error("Database query failed"));

      try {
        await fetchOrphanedTasks();
        expect.fail("Expected function to throw an error");
      } catch (error) {
        expect(error.message).to.equal("Database query failed");
      }
      Sinon.restore();
    });
  });
});
