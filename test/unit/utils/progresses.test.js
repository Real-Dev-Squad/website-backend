import { expect } from "chai";
import sinon from "sinon";
import fireStore from "../../../utils/firestore.js";
import { buildQueryToFetchPaginatedDocs, getPaginatedProgressDocs } from "../../../utils/progresses.js";
import { stubbedModelProgressData, stubbedModelTaskProgressData } from "../../fixtures/progress/progresses.js";
import cleanDb from "../../utils/cleanDb.js";
import { PROGRESSES_RESPONSE_MESSAGES } from "../../../constants/progresses.js";

const progressesCollection = fireStore.collection("progresses");

describe("Utils | Progresses", function () {
  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("buildQueryToFetchPaginatedDocs", function () {
    beforeEach(async function () {
      const progressData = stubbedModelTaskProgressData("userId", "task1", 1683072000000, 1682985600000);
      const progressData2 = stubbedModelTaskProgressData("userId2", "task2", 1683072000000, 1682985600000);
      const progressData3 = stubbedModelProgressData("userId", 1683072000000, 1682985600000);
      const progressData4 = stubbedModelProgressData("userId2", 1683072000000, 1682985600000);
      await progressesCollection.add(progressData);
      await progressesCollection.add(progressData2);
      await progressesCollection.add(progressData3);
      await progressesCollection.add(progressData4);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should build a query with type filter", async function () {
      const queryParams = {
        type: "task",
        size: 100,
        page: 0,
      };

      const { totalProgressCount } = await buildQueryToFetchPaginatedDocs(queryParams);
      expect(totalProgressCount).to.equal(2);
    });

    it("should build a query with userId filter", async function () {
      const queryParams = {
        userId: "userId",
        size: 100,
        page: 0,
      };

      const { baseQuery, totalProgressCount } = await buildQueryToFetchPaginatedDocs(queryParams);
      const results = await baseQuery.get();
      const docs = results.docs.map((doc) => doc.data());
      expect(docs[0].type).to.equal("user");
      expect(totalProgressCount).to.equal(1);
    });

    it("should build a query with taskId filter", async function () {
      const queryParams = {
        taskId: "task1",
        size: 100,
        page: 0,
      };

      const { totalProgressCount } = await buildQueryToFetchPaginatedDocs(queryParams);
      expect(totalProgressCount).to.equal(1);
    });

    it("should apply default sorting when orderBy is not provided", async function () {
      const queryParams = {
        type: "task",
        size: 100,
        page: 0,
      };

      const { baseQuery } = await buildQueryToFetchPaginatedDocs(queryParams);
      const results = await baseQuery.get();
      const docs = results.docs.map((doc) => doc.data());

      expect(docs[0].type).to.equal("task");
    });

    it("should handle pagination correctly", async function () {
      const queryParams = {
        type: "task",
        size: 1,
        page: 1,
      };

      const { baseQuery } = await buildQueryToFetchPaginatedDocs(queryParams);
      const results = await baseQuery.get();
      expect(results.size).to.equal(1);
    });

    it("should return empty results for a large page number", async function () {
      const queryParams = {
        type: "task",
        size: 100,
        page: 10,
      };

      const { baseQuery } = await buildQueryToFetchPaginatedDocs(queryParams);
      const results = await baseQuery.get();
      expect(results.size).to.equal(0);
    });
  });

  describe("getPaginatedProgressDocs", function () {
    beforeEach(async function () {
      const progressData = stubbedModelTaskProgressData("userId", "task1", 1683072000000, 1682985600000);
      const progressData2 = stubbedModelTaskProgressData("userId2", "task2", 1683072000000, 1682985600000);
      const progressData3 = stubbedModelProgressData("userId", 1683072000000, 1682985600000);
      const progressData4 = stubbedModelProgressData("userId2", 1683072000000, 1682985600000);
      await progressesCollection.add(progressData);
      await progressesCollection.add(progressData2);
      await progressesCollection.add(progressData3);
      await progressesCollection.add(progressData4);
    });

    afterEach(async function () {
      await cleanDb();
      sinon.restore();
    });

    it("should throw a NotFound error if no documents are found and no page is specified", async function () {
      const query = progressesCollection.where("userId", "==", "nonExistentUser");

      try {
        await getPaginatedProgressDocs(query);
        throw new Error("Test failed: expected a NotFound error to be thrown.");
      } catch (err) {
        expect(err.message).to.equal(PROGRESSES_RESPONSE_MESSAGES.PROGRESS_DOCUMENT_NOT_FOUND);
      }
    });

    it("should return an empty array if no documents are found and a page is specified", async function () {
      const query = progressesCollection.where("userId", "==", "nonExistentUser");
      const results = await getPaginatedProgressDocs(query, 1);

      // eslint-disable-next-line no-unused-expressions
      expect(results).to.be.an("array").that.is.empty;
    });

    it("should handle queries returning multiple documents", async function () {
      const query = progressesCollection.where("type", "==", "task");
      const results = await getPaginatedProgressDocs(query);

      expect(results).to.be.an("array").that.has.lengthOf(2);
      results.forEach((doc) => {
        expect(doc).to.have.property("id").that.is.a("string");
      });
    });
  });
});
