// const Sinon = require("sinon");
// const { expect } = require("chai");

// const firestore = require("../../../utils/firestore");
// const tasksModel = firestore.collection("tasks");
// const cleanDb = require("../../utils/cleanDb");
// const taskDataArray = require("../../fixtures/tasks/tasks");
// const { updateStatusToDone } = require("../../../services/users");

// const { skip } = require("node:test");

// describe("Tasks services", function () {
//   describe("task status COMPLETED to DONE in bulk", function () {
//     const tasks = [];
//     const taskDetails = [];
//     beforeEach(async function () {
//       const addTasksPromises = [];
//       taskDataArray.forEach((task) => {
//         const taskData = {
//           ...task,
//           status: "DONE",
//         };
//         addTasksPromises.push(tasksModel.add(taskData));
//       });

//       await Promise.all(addTasksPromises);

//       tasks.length = 0;
//       taskDetails.length = 0;

//       const snapshot = await tasksModel.where("status", "==", "COMPLETED").get();

//       snapshot.forEach((task) => {
//         const id = task.id;
//         const userData = task.data();
//         tasks.push({ ...userData, id });
//         taskDetails.push(userData.id);
//       });
//     });

//     afterEach(async function () {
//       await cleanDb();
//       Sinon.restore();
//     });

// skip("Should return successful response", async function () {
//     const res = await updateTaskStatusToDone(tasks);

//   expect(res).to.deep.equal({
//     totalUsersArchived: 8,
//     totalOperationsFailed: 0,
//     updatedUserDetails: taskDetails,
//     failedUserDetails: [],
//   });
// });

// skip("should return failed response", async function () {
//   const batchStub = Sinon.stub(firestore, "batch");
//   batchStub.returns({
//     update: function () {},
//     commit: function () {
//       throw new Error("Firebase batch operation failed");
//     },
//   });

//   const res = await updateTaskStatusToDone(tasks);

//   expect(res).to.deep.equal({
//     totalUpdatedStatus: 0,
//     totalOperationsFailed: 8,
//     updatedTaskDetails: [],
//     failedTaskDetails: taskDetails,
//   });
// });
//   });
// });
