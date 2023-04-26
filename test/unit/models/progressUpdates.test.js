/* eslint-disable security/detect-object-injection */
const cleanDb = require("../../utils/cleanDb");

const firestore = require("../../../utils/firestore");

const progressUpdates = require("../../../models/progressUpdates");

const progressUpdatesData = require("../../fixtures/progressUpdates/progressUpdates")();
const progressUpdatesModel = firestore.collection("progressUpdates");
const { expect } = require("chai");

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip("progress Updates", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("add progress data", function () {
    it("adds the progress data to the model", async function () {
      const progressData = progressUpdatesData[0];
      const { id } = await progressUpdates.addProgressUpdates(progressData);
      const storedData = (await progressUpdatesModel.doc(id).get()).data();
      Object.keys(progressData).forEach((key) => {
        expect(progressData[key]).to.be.deep.equal(storedData[key]);
      });
    });
  });

  describe("get Progress data", function () {
    it("Retrieves the latest Progress based on userId", async function () {
      const progressData = progressUpdatesData[0];
      progressUpdatesModel.add(progressData);
      const data = (await progressUpdates.getLatestProgress("USER", progressData.user_id)).data;
      Object.keys(progressData).forEach((key) => {
        expect(progressData[key]).to.be.deep.equal(data[key]);
      });
    });

    it("Retrieves the latest progress based on taskId", async function () {
      const progressData = progressUpdatesData[0];
      await progressUpdates.addProgressUpdates(progressData);
      const data = (await progressUpdates.getLatestProgress("TASK", progressData.task_id)).data;
      Object.keys(progressData).forEach((key) => {
        expect(progressData[key]).to.be.deep.equal(data[key]);
      });
    });
  });
});
