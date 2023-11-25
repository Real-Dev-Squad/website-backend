const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const questionQuery = require("../../../models/questions");
const questionDataArray = require("../../fixtures/questions/questions");
const questionDataWithMaxWords = questionDataArray[0];
const questionDataWithoutMaxWords = questionDataArray[1];

describe("Questions", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("createQuestion", function () {
    it("should create a question in db with the given data and is_new and max_characters should be added by default if not provided", async function () {
      const result = await questionQuery.createQuestion(questionDataWithoutMaxWords);

      expect(result).to.be.a("object");
      expect(result.question).to.equal(questionDataWithoutMaxWords.question);
      expect(result.event_id).to.equal(questionDataWithoutMaxWords.eventId);
      expect(result.created_by).to.equal(questionDataWithoutMaxWords.createdBy);
      expect(result.max_characters).to.equal(null);
      expect(result.is_new).to.equal(true);
    });

    it("should create a question in db with the given data and is_new should be default to true and max_characters should be added as provided", async function () {
      const result = await questionQuery.createQuestion(questionDataWithMaxWords);

      expect(result).to.be.a("object");
      expect(result.question).to.equal(questionDataWithMaxWords.question);
      expect(result.event_id).to.equal(questionDataWithMaxWords.eventId);
      expect(result.created_by).to.equal(questionDataWithMaxWords.createdBy);
      expect(result.is_new).to.equal(true);
      expect(result.max_characters).to.equal(questionDataWithMaxWords.maxCharacters);
    });
  });

  describe("getQuestions", function () {
    beforeEach(async function () {
      await questionQuery.createQuestion(questionDataWithoutMaxWords);
    });

    it("should get question with is_new=true attribute", async function () {
      const result = await questionQuery.getQuestions({ isNew: true });

      expect(result).to.be.a("object");
      expect(result.question).to.equal(questionDataWithoutMaxWords.question);
      expect(result.event_id).to.equal(questionDataWithoutMaxWords.eventId);
      expect(result.created_by).to.equal(questionDataWithoutMaxWords.createdBy);
      expect(result.max_characters).to.equal(null);
      expect(result.is_new).to.equal(true);
    });
  });

  describe("updateQuestions", function () {
    let questionId;
    beforeEach(async function () {
      const createdQuestion = await questionQuery.createQuestion(questionDataWithoutMaxWords);
      questionId = createdQuestion.id;
    });

    it("should update question with given data", async function () {
      const result = await questionQuery.updateQuestion(questionId, { is_new: false });

      expect(result).to.be.a("object");
      expect(result.question).to.equal(questionDataWithoutMaxWords.question);
      expect(result.event_id).to.equal(questionDataWithoutMaxWords.eventId);
      expect(result.created_by).to.equal(questionDataWithoutMaxWords.createdBy);
      expect(result.max_characters).to.equal(null);
      expect(result.is_new).to.equal(false);
    });
  });
});
