import { expect } from "chai";
import sinon from "sinon";
import { Answer, AnswerFieldsToUpdate } from "../../../typeDefinitions/answers.js";

import cleanDb from "../../utils/cleanDb.js";
import * as answerQuery from "../../../models/answers";
import { SAMPLE_ANSWER_DATA as answerDataArray } from "../../fixtures/answers/answers";

describe("Answers", function () {
  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("createAnswer", function () {
    it("should create a answer in db with the given data and add approved_by, status, rejected_by default values", async function () {
      const createdAnswer: any = await answerQuery.createAnswer(answerDataArray[0] as any);

      expect(createdAnswer).to.be.a("object");
      expect(createdAnswer.id).to.equal(answerDataArray[0].id);
      expect(createdAnswer.answer).to.equal(answerDataArray[0].answer);
      expect(createdAnswer.event_id).to.equal(answerDataArray[0].eventId);
      expect(createdAnswer.answered_by).to.equal(answerDataArray[0].answeredBy);
      expect(createdAnswer.reviewed_by).to.equal(null);
      expect(createdAnswer.status).to.equal("PENDING");
    });

    it("should throw error if something goes wrong while creating answer", async function () {
      sinon.stub(answerQuery, "createAnswer").throws(new Error("Error while creating answer"));

      try {
        await answerQuery.createAnswer(answerDataArray[0] as any);
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
      createdAnswer = await answerQuery.createAnswer(answerDataArray[0] as any) as any;
      createdAnswerId = createdAnswer.id;
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should update answer with rejected status", async function () {
      const fieldsToUpdate: AnswerFieldsToUpdate = {
        status: "REJECTED",
        reviewed_by: "satyam-bajpai",
      };

      const updatedAnswer: any = await answerQuery.updateAnswer(createdAnswerId, fieldsToUpdate);

      expect(updatedAnswer).to.be.a("object");
      expect(updatedAnswer.id).to.equal(answerDataArray[0].id);
      expect(updatedAnswer.reviewed_by).to.equal(fieldsToUpdate.reviewed_by);
      expect(updatedAnswer.status).to.equal(fieldsToUpdate.status);
      expect(updatedAnswer.answer).to.equal(answerDataArray[0].answer);
      expect(updatedAnswer.event_id).to.equal(answerDataArray[0].eventId);
      expect(updatedAnswer.answered_by).to.equal(answerDataArray[0].answeredBy);
      expect(updatedAnswer.updated_at.toDate()).to.not.equal(createdAnswer.updated_at.toDate());
    });

    it("should update answer with approved status", async function () {
      const fieldsToUpdate: AnswerFieldsToUpdate = {
        status: "APPROVED",
        reviewed_by: "satyam-bajpai",
      };
      const updatedAnswer: any = await answerQuery.updateAnswer(createdAnswerId, fieldsToUpdate);

      expect(updatedAnswer).to.be.a("object");
      expect(updatedAnswer.id).to.equal(answerDataArray[0].id);
      expect(updatedAnswer.reviewed_by).to.equal(fieldsToUpdate.reviewed_by);
      expect(updatedAnswer.status).to.equal(fieldsToUpdate.status);
      expect(updatedAnswer.answer).to.equal(answerDataArray[0].answer);
      expect(updatedAnswer.event_id).to.equal(answerDataArray[0].eventId);
      expect(updatedAnswer.answered_by).to.equal(answerDataArray[0].answeredBy);
      expect(updatedAnswer.updated_at.toDate()).to.not.equal(createdAnswer.updated_at.toDate());
    });

    it("should throw error if something goes wrong while updating answer", async function () {
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

  describe("getAnswers", function () {
    const answersThatWillBeAdded = [answerDataArray[0], answerDataArray[3]];
    beforeEach(async function () {
      await answerQuery.createAnswer(answerDataArray[0] as any);
      await answerQuery.createAnswer(answerDataArray[3] as any);
    });
    afterEach(async function () {
      await cleanDb();
    });

    it("should get answers for the requested query", async function () {
      const queryFields = {
        questionId: "demo-question-id-1",
      };
      const answers: Answer[] = await answerQuery.getAnswers(queryFields as any);

      expect(answers).to.be.a("array");
      expect(answers).to.be.of.length(2);

      answersThatWillBeAdded.forEach((answerBody, idx) => {
        expect(answers[idx].id).to.be.equal(answerBody.id);
        expect(answers[idx].event_id).to.be.equal(answerBody.eventId);
        expect(answers[idx].question_id).to.be.equal(answerBody.questionId);
        expect(answers[idx].answer).to.be.equal(answerBody.answer);
        expect(answers[idx].answered_by).to.be.equal(answerBody.answeredBy);
        expect(answers[idx].reviewed_by).to.be.equal(null);
      });
    });

    it("should throw error if something goes wrong while getting answer", async function () {
      sinon.stub(answerQuery, "getAnswers").throws(new Error("Error while getting answers"));
      const queryFields = {
        questionId: "demo-question-id-1",
      };
      try {
        await answerQuery.getAnswers(queryFields as any);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal("Error while getting answers");
      }
    });
  });
});
