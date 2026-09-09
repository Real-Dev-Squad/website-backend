import { expect } from "chai";
import sinon from "sinon";
const Sinon = sinon;
const applicationValidator = require("../../../middlewares/validators/application");
const applicationsData = require("../../fixtures/applications/applications")();

describe("application validator test", function () {
  describe("validateApplicationData", function () {
    it("should call next function if everything is according to the validator", async function () {
      const rawData = {
        ...applicationsData[6],
        imageUrl: "https://example.com/image.jpg",
      };

      const req = {
        body: rawData,
      };

      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationData(req, {}, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call the next function if a required field is missed", async function () {
      const rawData = {
        ...applicationsData[6],
        imageUrl: "https://example.com/image.jpg",
      };
      delete rawData.numberOfHours;

      const req = {
        body: rawData,
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should not call the next function if any of the values which have a wordCount restriction doesn't contain the expected number of words", async function () {
      const rawData = {
        ...applicationsData[6],
        imageUrl: "https://example.com/image.jpg",
        whyRds: "jfaskdfjsd",
      };

      const req = {
        body: rawData,
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should not call the next function if number of hours is not a number", async function () {
      const rawData = {
        ...applicationsData[6],
        imageUrl: "https://example.com/image.jpg",
        numberOfHours: "10",
      };

      const req = {
        body: rawData,
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });
  });

  describe("validateApplicationFeedbackData", function () {
    let req: any;
    let res: any;
    let nextSpy: sinon.SinonSpy;

    beforeEach(function () {
      req = {
        body: {},
      };
      res = {
        boom: {
          badRequest: () => {},
        },
      };
      nextSpy = Sinon.spy();
    });

    it("should call next function if only status and feedback is passed, and status has any of the allowed values", async function () {
      req.body = {
        status: "accepted",
        feedback: "some feedback",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next function if any value other than status and feedback is passed", async function () {
      req.body = {
        batman: true,
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should not call the next function if any value which is not allowed is sent in status", async function () {
      req.body = {
        status: "something",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should call next function when status is accepted with optional feedback", async function () {
      req.body = {
        status: "accepted",
        feedback: "Great work!",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next function when status is rejected with optional feedback", async function () {
      req.body = {
        status: "rejected",
        feedback: "Not a good fit",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next function when status is changes_requested with feedback", async function () {
      req.body = {
        status: "changes_requested",
        feedback: "Please update your skills section",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next function when status is changes_requested without feedback", async function () {
      req.body = {
        status: "changes_requested",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should not call next function when status is changes_requested with empty feedback string", async function () {
      req.body = {
        status: "changes_requested",
        feedback: "",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should call next function when status is accepted with empty feedback string", async function () {
      req.body = {
        status: "accepted",
        feedback: "",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next function when status is rejected with empty feedback string", async function () {
      req.body = {
        status: "rejected",
        feedback: "",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next function when status is missing", async function () {
      req.body = {
        feedback: "Some feedback",
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should not call next function when status is null", async function () {
      req.body = {
        status: null,
      };
      await applicationValidator.validateApplicationFeedbackData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });
  });

  describe("validateApplicationUpdateData", function () {
    let req: any;
    let res: any;
    let nextSpy: sinon.SinonSpy;

    const validWordString =
      "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty " +
      "twenty-one twenty-two twenty-three twenty-four twenty-five twenty-six twenty-seven twenty-eight twenty-nine thirty " +
      "thirty-one thirty-two thirty-three thirty-four thirty-five thirty-six thirty-seven thirty-eight thirty-nine forty " +
      "forty-one forty-two forty-three forty-four forty-five forty-six forty-seven forty-eight forty-nine fifty " +
      "fifty-one fifty-two fifty-three fifty-four fifty-five fifty-six fifty-seven fifty-eight fifty-nine sixty " +
      "sixty-one sixty-two sixty-three sixty-four sixty-five sixty-six sixty-seven sixty-eight sixty-nine seventy " +
      "seventy-one seventy-two seventy-three seventy-four seventy-five seventy-six seventy-seven seventy-eight seventy-nine eighty " +
      "eighty-one eighty-two eighty-three eighty-four eighty-five eighty-six eighty-seven eighty-eight eighty-nine ninety " +
      "ninety-one ninety-two ninety-three ninety-four ninety-five ninety-six ninety-seven ninety-eight ninety-nine hundred";

    beforeEach(function () {
      req = { body: {} };
      res = { boom: { badRequest: Sinon.spy() } };
      nextSpy = Sinon.spy();
    });

    it("should call next when body has at least one allowed field (introduction)", async function () {
      req.body = { introduction: "Updated intro" };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
      expect(res.boom.badRequest.called).to.be.false;
    });

    it("should call next when body has imageUrl as valid URI", async function () {
      req.body = { imageUrl: "https://example.com/photo.jpg" };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next when body has foundFrom", async function () {
      req.body = { foundFrom: "LinkedIn" };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next when body has numberOfHours within range", async function () {
      req.body = { numberOfHours: 50 };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next when body has professional with institution and skills", async function () {
      req.body = { professional: { institution: "MIT", skills: "React, Node.js, TypeScript" } };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next when body has socialLink with valid phoneNumber", async function () {
      req.body = { socialLink: { phoneNumber: "+919876543210", github: "https://github.com/user" } };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should call next when body has forFun/funFact/whyRds with at least 100 words", async function () {
      req.body = { forFun: validWordString };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next when body is empty", async function () {
      req.body = {};
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(res.boom.badRequest.firstCall.args[0]).to.include("at least one allowed field");
    });

    it("should not call next when body has only disallowed field", async function () {
      req.body = { batman: true };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });

    it("should not call next when imageUrl is not a valid URI", async function () {
      req.body = { imageUrl: "not-a-uri" };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });

    it("should not call next when professional.skills has fewer than 5 characters", async function () {
      req.body = { professional: { skills: "abc" } };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });

    it("should not call next when forFun has fewer than 100 words", async function () {
      req.body = { forFun: "just a few words here" };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });

    it("should not call next when numberOfHours is less than 1", async function () {
      req.body = { numberOfHours: 0 };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });

    it("should not call next when numberOfHours is greater than 168", async function () {
      req.body = { numberOfHours: 170 };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });

    it("should not call next when socialLink.phoneNumber has invalid format", async function () {
      req.body = { socialLink: { phoneNumber: "invalid" } };
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
      expect(res.boom.badRequest.called).to.be.true;
    });
  });

  describe("validateApplicationQueryParam", function () {
    let req: any;
    let res: any;
    let nextSpy: sinon.SinonSpy;

    beforeEach(function () {
      req = {
        query: {},
      };
      res = {
        boom: {
          badRequest: () => {},
        },
      };
      nextSpy = Sinon.spy();
    });

    it("should call the next function if allowed query params are passed", async function () {
      req.query = {
        userId: "kfjadskfj",
        status: "accepted",
        size: "4",
        next: "kfsdfksdfjksd",
        dev: "true",
      };
      await applicationValidator.validateApplicationQueryParam(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next function if any value that is not allowed is passed in query params", async function () {
      req.query = {
        hello: "true",
      };
      await applicationValidator.validateApplicationQueryParam(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });
  });
});
