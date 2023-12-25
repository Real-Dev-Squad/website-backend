// const chai = require("chai");
// const { expect } = chai;

import { expect } from "chai";
const sinon = require("sinon");
import { Answer, AnswerFieldsToUpdate } from "../../../typeDefinitions/answers";
const firestore = require("../../../utils/firestore");
const answerModel = firestore.collection("answers");

const cleanDb = require("../../utils/cleanDb");
const answerQuery = require("../../../models/answers");
const answerDataArray = require("../../fixtures/answers/answers");

describe("Answers", function () {
  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("createAnswer", function () {
    it("should create a answer in db with the given data and add approved_by, status, rejected_by default values", async function () {
      const createdAnswer: Answer = await answerQuery.createAnswer(answerDataArray[0]);

      expect(createdAnswer).to.be.a("object");
      expect(createdAnswer.id).to.equal(answerDataArray[0].id);
      expect(createdAnswer.answer).to.equal(answerDataArray[0].answer);
      expect(createdAnswer.event_id).to.equal(answerDataArray[0].eventId);
      expect(createdAnswer.answered_by).to.equal(answerDataArray[0].answeredBy);
      expect(createdAnswer.reviewed_by).to.equal(null);
      expect(createdAnswer.status).to.equal("PENDING");
    });

    it("should throw error while creating answer", async function () {
      sinon.stub(answerQuery, "createAnswer").throws(new Error("Error while creating answer"));

      try {
        await answerQuery.createAnswer(answerDataArray[0]);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal("Error while creating answer");
      }
    });
  });

  describe("updateAnswer", function () {
    let createdAnswer: Answer;
    let createdAnswerId: string;
    beforeEach(async function () {
      createdAnswer = await answerQuery.createAnswer(answerDataArray[0]);
      createdAnswerId = createdAnswer.id;
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should update answer with rejected data", async function () {
      const fieldsToUpdate: AnswerFieldsToUpdate = {
        status: "REJECTED",
        reviewed_by: "satyam-bajpai",
      };

      const updatedAnswer: Answer = await answerQuery.updateAnswer(createdAnswerId, fieldsToUpdate);

      expect(updatedAnswer).to.be.a("object");
      expect(updatedAnswer.id).to.equal(answerDataArray[0].id);
      expect(updatedAnswer.reviewed_by).to.equal(fieldsToUpdate.reviewed_by);
      expect(updatedAnswer.status).to.equal(fieldsToUpdate.status);
      expect(updatedAnswer.answer).to.equal(answerDataArray[0].answer);
      expect(updatedAnswer.event_id).to.equal(answerDataArray[0].eventId);
      expect(updatedAnswer.answered_by).to.equal(answerDataArray[0].answeredBy);
      expect(updatedAnswer.updated_at.toDate()).to.not.equal(createdAnswer.updated_at.toDate());
    });

    it("should update answer with approved data", async function () {
      const fieldsToUpdate: AnswerFieldsToUpdate = {
        status: "APPROVED",
        reviewed_by: "satyam-bajpai",
      };
      const updatedAnswer: Answer = await answerQuery.updateAnswer(createdAnswerId, fieldsToUpdate);

      expect(updatedAnswer).to.be.a("object");
      expect(updatedAnswer.id).to.equal(answerDataArray[0].id);
      expect(updatedAnswer.reviewed_by).to.equal(fieldsToUpdate.reviewed_by);
      expect(updatedAnswer.status).to.equal(fieldsToUpdate.status);
      expect(updatedAnswer.answer).to.equal(answerDataArray[0].answer);
      expect(updatedAnswer.event_id).to.equal(answerDataArray[0].eventId);
      expect(updatedAnswer.answered_by).to.equal(answerDataArray[0].answeredBy);
      expect(updatedAnswer.updated_at.toDate()).to.not.equal(createdAnswer.updated_at.toDate());
    });

    it("should throw error while updating the answer", async function () {
      const fieldsToUpdate: AnswerFieldsToUpdate = {
        status: "APPROVED",
        reviewed_by: "satyam-bajpai",
      };

      sinon.stub(answerQuery, "updateAnswer").throws(new Error("Error while updating answer"));

      try {
        await answerQuery.updateAnswer(createdAnswerId, fieldsToUpdate);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal("Error while updating answer");
      }
    });
  });
});
