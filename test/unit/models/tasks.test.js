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

describe("tasks", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("overdueTasks", function () {
    it("Should return overdue tasks", async function () {
      const task1 = await tasks.updateTask(tasksData[0]);
      const task2 = await tasks.updateTask(tasksData[1]);
      const { assignee1 } = task1;
      const { assignee2 } = task2;

      const newAvailableTasks = await tasks.overdueTasks([task1, task2]);
      newAvailableTasks.forEach((task) => {
        const { assignee, startedOn, endsOn, status, unassignedMember } = task;
        expect(unassignedMember).to.be.oneOf([assignee1, assignee2]);
        expect(status).to.equal("AVAILABLE");
        expect(assignee).to.equal(null);
        expect(startedOn).to.equal(null);
        expect(endsOn).to.equal(null);
      });
    });
  });
});
