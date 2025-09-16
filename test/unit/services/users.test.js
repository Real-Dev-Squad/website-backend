import { expect } from "chai";
import Sinon from "sinon";
import firestore from "../../../utils/firestore.js";
import cleanDb from "../../utils/cleanDb.js";
import userDataArray from "../../fixtures/user/user.js";
import { generateUniqueUsername, getUsersWithIncompleteTasks } from "../../../services/users.js";
import { addOrUpdate, archiveUsers } from "../../../models/users.js";
import { usersData, tasksData } from "../../fixtures/abandoned-tasks/departed-users.js";
import tasks from "../../../models/tasks.js";

const userModel = firestore.collection("users");
const tasksModel = firestore.collection("tasks");

describe("Users services", function () {
  describe("archive inactive discord users in bulk", function () {
    const users = [];
    const userDetails = [];

    beforeEach(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user) => {
        const userData = {
          ...user,
          roles: {
            ...user.roles,
            in_discord: false,
            archived: false,
          },
        };
        addUsersPromises.push(userModel.add(userData));
      });
      await Promise.all(addUsersPromises);

      users.length = 0;
      userDetails.length = 0;

      const snapshot = await userModel
        .where("roles.in_discord", "==", false)
        .where("roles.archived", "==", false)
        .get();

      snapshot.forEach((user) => {
        const id = user.id;
        const userData = user.data();
        const { first_name: firstName, last_name: lastName } = userData;
        users.push({ ...userData, id });
        userDetails.push({ id, firstName, lastName });
      });
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("Should return successful response", async function () {
      const res = await archiveUsers(users);

      expect(res).to.deep.equal({
        message: "Successfully completed batch updates",
        totalUsersArchived: 21,
        totalOperationsFailed: 0,
        updatedUserDetails: userDetails,
        failedUserDetails: [],
      });
    });

    it("should return failed response", async function () {
      const batchStub = Sinon.stub(firestore, "batch");
      batchStub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firebase batch operation failed");
        },
      });

      const res = await archiveUsers(users);

      expect(res).to.deep.equal({
        message: "Firebase batch operation failed",
        totalUsersArchived: 0,
        totalOperationsFailed: 21,
        updatedUserDetails: [],
        failedUserDetails: userDetails,
      });
    });
  });

  describe("generateUniqueUsername", function () {
    it("should generate a unique username when existing users are present", async function () {
      const userData = userDataArray[15];
      await addOrUpdate(userData);
      const newUsername = await generateUniqueUsername("shubham", "sigdar");
      expect(newUsername).to.deep.equal("shubham-sigdar-2");
    });

    it("should generate a unique username when no existing users are present", async function () {
      const userData = userDataArray[15];
      await addOrUpdate(userData);

      const newUsername = await generateUniqueUsername("john", "doe");

      expect(newUsername).to.equal("john-doe-1");
    });
  });

  describe("fetchUsersWithAbandonedTasks", function () {
    beforeEach(async function () {
      await cleanDb();

      const taskPromises = tasksData.map((task) => tasksModel.add(task));
      await Promise.all(taskPromises);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should fetch users with abandoned tasks", async function () {
      const users = usersData.slice(0, 2);
      const usersWithAbandonedTasks = await getUsersWithIncompleteTasks(users);

      expect(usersWithAbandonedTasks).to.be.an("array");
      expect(usersWithAbandonedTasks).to.have.lengthOf(2);
    });

    it("should not include user who are present in discord or not archived", async function () {
      const users = usersData.slice(0, 2);
      const result = await getUsersWithIncompleteTasks(users);

      result.forEach((user) => {
        expect(user.roles.in_discord).to.not.equal(true);
        expect(user.roles.archived).to.not.equal(false);
      });
    });

    it("should return an empty array if there are no users with abandoned tasks", async function () {
      await cleanDb();

      const activeTask = tasksData[3];
      await tasksModel.add(activeTask);

      const result = await getUsersWithIncompleteTasks([]);
      expect(result).to.be.an("array");
      expect(result).to.have.lengthOf(0);
    });

    it("should throw an error if fetchIncompleteTaskForUser fails", async function () {
      const users = usersData.slice(0, 2);
      Sinon.stub(tasks, "fetchIncompleteTasksByUserIds").throws(new Error("Database query failed"));

      try {
        await getUsersWithIncompleteTasks([users]);
        expect.fail("Expected function to throw an error");
      } catch (error) {
        expect(error.message).to.equal("Database query failed");
      }
      Sinon.restore();
    });
  });
});
