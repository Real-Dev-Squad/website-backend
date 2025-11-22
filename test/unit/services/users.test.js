const Sinon = require("sinon");
const { expect } = require("chai");

const firestore = require("../../../utils/firestore");
const userModel = firestore.collection("users");
const tasksModel = firestore.collection("tasks");
const cleanDb = require("../../utils/cleanDb");
const userDataArray = require("../../fixtures/user/user")();
const userServices = require("../../../services/users");
const { generateUniqueUsername, getUsersWithIncompleteTasks, validateUserSignup } = userServices;
const { addOrUpdate, archiveUsers } = require("../../../models/users");
const userQuery = require("../../../models/users");
const { ALL_USER_ROLES } = require("../../../constants/users");
const Forbidden = require("http-errors").Forbidden;
const {
  usersData: abandonedUsersData,
  tasksData: abandonedTasksData,
} = require("../../fixtures/abandoned-tasks/departed-users");
const tasks = require("../../../models/tasks");

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

      const taskPromises = abandonedTasksData.map((task) => tasksModel.add(task));
      await Promise.all(taskPromises);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should fetch users with abandoned tasks", async function () {
      const users = abandonedUsersData.slice(0, 2);
      const usersWithAbandonedTasks = await getUsersWithIncompleteTasks(users);

      expect(usersWithAbandonedTasks).to.be.an("array");
      expect(usersWithAbandonedTasks).to.have.lengthOf(2);
    });

    it("should not include user who are present in discord or not archived", async function () {
      const users = abandonedUsersData.slice(0, 2);
      const result = await getUsersWithIncompleteTasks(users);

      result.forEach((user) => {
        expect(user.roles.in_discord).to.not.equal(true);
        expect(user.roles.archived).to.not.equal(false);
      });
    });

    it("should return an empty array if there are no users with abandoned tasks", async function () {
      await cleanDb();

      const activeTask = abandonedTasksData[3];
      await tasksModel.add(activeTask);

      const result = await getUsersWithIncompleteTasks([]);
      expect(result).to.be.an("array");
      expect(result).to.have.lengthOf(0);
    });

    it("should throw an error if fetchIncompleteTaskForUser fails", async function () {
      const users = abandonedUsersData.slice(0, 2);
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

  describe("validateUserSignup", function () {
    let setIncompleteUserDetailsStub;

    beforeEach(function () {
      setIncompleteUserDetailsStub = Sinon.stub(userQuery, "setIncompleteUserDetails").resolves({});
    });

    afterEach(function () {
      Sinon.restore();
    });

    describe("when incompleteUserDetails is true", function () {
      const userId = "test-user-id";
      const incompleteUserDetails = true;
      const firstName = "John";
      const lastName = "Doe";
      const role = "developer";

      it("should throw Forbidden error when firstName is missing", async function () {
        try {
          await validateUserSignup(userId, incompleteUserDetails, null, lastName, role, null);
          expect.fail("Expected function to throw Forbidden error");
        } catch (error) {
          expect(error).to.be.instanceOf(Forbidden);
          expect(error.message).to.equal("You are not authorized to perform this operation");
        }
      });

      it("should throw Forbidden error when lastName is missing", async function () {
        try {
          await validateUserSignup(userId, incompleteUserDetails, firstName, null, role, null);
          expect.fail("Expected function to throw Forbidden error");
        } catch (error) {
          expect(error).to.be.instanceOf(Forbidden);
          expect(error.message).to.equal("You are not authorized to perform this operation");
        }
      });

      it("should throw Forbidden error when role is missing", async function () {
        try {
          await validateUserSignup(userId, incompleteUserDetails, firstName, lastName, null, null);
          expect.fail("Expected function to throw Forbidden error");
        } catch (error) {
          expect(error).to.be.instanceOf(Forbidden);
          expect(error.message).to.equal("You are not authorized to perform this operation");
        }
      });

      it("should throw Forbidden error when firstName is empty string", async function () {
        try {
          await validateUserSignup(userId, incompleteUserDetails, "", lastName, role, null);
          expect.fail("Expected function to throw Forbidden error");
        } catch (error) {
          expect(error).to.be.instanceOf(Forbidden);
          expect(error.message).to.equal("You are not authorized to perform this operation");
        }
      });

      it("should generate username and call setIncompleteUserDetails when all required fields are present", async function () {
        const result = await validateUserSignup(userId, incompleteUserDetails, firstName, lastName, role, null);
        expect(result).to.be.a("string");
        expect(result.length).to.be.greaterThan(0);
        expect(setIncompleteUserDetailsStub.calledOnce).to.equal(true);
        expect(setIncompleteUserDetailsStub.firstCall.args[0]).to.equal(userId);
      });
    });

    describe("when incompleteUserDetails is false", function () {
      const userId = "test-user-id";
      const incompleteUserDetails = false;
      const firstName = "John";
      const lastName = "Doe";

      it("should throw Forbidden error when user already has a role and tries to set a new role", async function () {
        const existingRole = ALL_USER_ROLES[0];
        const newRole = "designer";

        try {
          await validateUserSignup(userId, incompleteUserDetails, firstName, lastName, newRole, existingRole);
          expect.fail("Expected function to throw Forbidden error");
        } catch (error) {
          expect(error).to.be.instanceOf(Forbidden);
          expect(error.message).to.equal("Cannot update role again");
        }
      });

      it("should return null when no role is provided", async function () {
        const result = await validateUserSignup(userId, incompleteUserDetails, firstName, lastName, null, null);

        expect(result).to.equal(null);
        expect(setIncompleteUserDetailsStub.called).to.equal(false);
      });

      it("should return null when user does not have an existing role and tries to set one", async function () {
        const newRole = "developer";

        const result = await validateUserSignup(userId, incompleteUserDetails, firstName, lastName, newRole, null);

        expect(result).to.equal(null);
        expect(setIncompleteUserDetailsStub.called).to.equal(false);
      });

      it("should return null when existingRole is not in ALL_USER_ROLES", async function () {
        const existingRole = "invalid_role";
        const newRole = "developer";

        const result = await validateUserSignup(
          userId,
          incompleteUserDetails,
          firstName,
          lastName,
          newRole,
          existingRole
        );

        expect(result).to.equal(null);
        expect(setIncompleteUserDetailsStub.called).to.equal(false);
      });

      it("should return null when existingRole is empty string", async function () {
        const existingRole = "";
        const newRole = "developer";

        const result = await validateUserSignup(
          userId,
          incompleteUserDetails,
          firstName,
          lastName,
          newRole,
          existingRole
        );

        expect(result).to.equal(null);
        expect(setIncompleteUserDetailsStub.called).to.equal(false);
      });
    });
  });
});
