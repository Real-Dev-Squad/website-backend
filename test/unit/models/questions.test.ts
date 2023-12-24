import { expect } from "chai";
// const { expect } = chai;

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
    it("should create a question in db with the given data and max_characters should be added by default if not provided", async function () {
      const result = await questionQuery.createQuestion(questionDataWithoutMaxWords);

      expect(result).to.be.a("object");
      expect(result.question).to.equal(questionDataWithoutMaxWords.question);
      expect(result.event_id).to.equal(questionDataWithoutMaxWords.eventId);
      expect(result.created_by).to.equal(questionDataWithoutMaxWords.createdBy);
      expect(result.max_characters).to.equal(null);
    });

    it("should create a question in db with the given data and max_characters should be added as provided", async function () {
      const result = await questionQuery.createQuestion(questionDataWithMaxWords);

      expect(result).to.be.a("object");
      expect(result.question).to.equal(questionDataWithMaxWords.question);
      expect(result.event_id).to.equal(questionDataWithMaxWords.eventId);
      expect(result.created_by).to.equal(questionDataWithMaxWords.createdBy);
      expect(result.max_characters).to.equal(questionDataWithMaxWords.maxCharacters);
    });
  });
});
