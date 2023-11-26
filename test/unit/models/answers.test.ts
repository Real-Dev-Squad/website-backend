// const chai = require("chai");
// const { expect } = chai;

import { expect } from "chai";

const cleanDb = require("../../utils/cleanDb");
const answerQuery = require("../../../models/answers");
const answerDataArray = require("../../fixtures/answers/answers");

describe("Answers", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("createAnswer", function () {
    it("should create a answer in db with the given data and add approved_by, status, rejected_by default values", async function () {
      const result = await answerQuery.createAnswer(answerDataArray[0]);

      expect(result).to.be.a("object");
      expect(result.id).to.equal(answerDataArray[0].id);
      expect(result.answer).to.equal(answerDataArray[0].answer);
      expect(result.event_id).to.equal(answerDataArray[0].eventId);
      expect(result.created_by).to.equal(answerDataArray[0].createdBy);
      expect(result.rejected_by).to.equal(null);
      expect(result.approved_by).to.equal(null);
      expect(result.status).to.equal("PENDING");
    });

    // it("should create a answer in db with the given data and add approved_by, status, rejected_by default values", async function () {
    //   const result = await answerQuery.createAnswer(answerDataArray[0]);
    // });
  });
});
