const chai = require("chai");
const { expect } = chai;
const cleanDb = require("../../utils/cleanDb");
const { getPaginatedProgressDocument } = require("../../../models/progresses");
const fireStore = require("../../../utils/firestore");
const progressesCollection = fireStore.collection("progresses");
const { stubbedModelTaskProgressData, stubbedModelProgressData } = require("../../fixtures/progress/progresses");
const addUser = require("../../utils/addUser");
const usersDataArray = require("../../fixtures/user/user")();
const {
  PROGRESSES_RESPONSE_MESSAGES: { PROGRESS_DOCUMENT_NOT_FOUND },
} = require("../../../constants/progresses");
describe("buildQueryToFetchPaginatedDocs", function () {
  let userId;
  let userId2;
  let userId3;
  const taskId = "taskId1";
  const taskId2 = "taskId2";

  beforeEach(async function () {
    userId = await addUser(usersDataArray[0]);
    userId2 = await addUser(usersDataArray[1]);
    userId3 = await addUser(usersDataArray[2]);
    const progressData = stubbedModelTaskProgressData(userId, taskId, 1683072000000, 1682985600000);
    const progressData2 = stubbedModelTaskProgressData(userId2, taskId2, 1683072000000, 1682985600000);
    const progressData3 = stubbedModelProgressData(userId, 1683072000000, 1682985600000);
    const progressData4 = stubbedModelProgressData(userId2, 1683072000000, 1682985600000);
    await progressesCollection.add(progressData);
    await progressesCollection.add(progressData2);
    await progressesCollection.add(progressData3);
    await progressesCollection.add(progressData4);
  });

  afterEach(async function () {
    await cleanDb();
  });

  it("should return progress documents for type=task", async function () {
    const size = 1;
    const { progressDocs, totalProgressCount } = await getPaginatedProgressDocument({ type: "task", size });

    expect(progressDocs).to.have.lengthOf(size);
    expect(totalProgressCount).to.equal(2);
    expect(progressDocs[0].type).to.equal("task");
  });

  it("should return paginated progress documents and total count", async function () {
    const size = 1;
    const { progressDocs, totalProgressCount } = await getPaginatedProgressDocument({ type: "user", size });

    expect(progressDocs).to.have.lengthOf(size);
    expect(totalProgressCount).to.equal(2);
  });

  it("should throw error when no progress documents match the query", async function () {
    try {
      await getPaginatedProgressDocument({
        size: 1,
        userId: userId3,
      });
      throw new Error("Test failed: expected a NotFound error to be thrown.");
    } catch (err) {
      expect(err.message).to.equal(PROGRESS_DOCUMENT_NOT_FOUND);
    }
  });

  it("should paginate results correctly when a specific page is requested", async function () {
    const page = 1;
    const size = 1;
    const { progressDocs, totalProgressCount } = await getPaginatedProgressDocument({ type: "user", page, size });

    expect(progressDocs).to.have.lengthOf(size);
    expect(totalProgressCount).to.equal(2);
  });

  it("should use default page value when page is not provided", async function () {
    const size = 2;
    const { progressDocs, totalProgressCount } = await getPaginatedProgressDocument({ type: "user", size });

    expect(progressDocs).to.have.lengthOf(size);
    expect(totalProgressCount).to.equal(2);
  });

  it("should filter progress documents by userId", async function () {
    const size = 1;
    const { progressDocs, totalProgressCount } = await getPaginatedProgressDocument({
      size,
      userId,
    });

    expect(totalProgressCount).to.equal(1);
    expect(progressDocs).to.have.lengthOf(size);
  });
});
