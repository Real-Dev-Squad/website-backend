import chai from "chai";
const Sinon = require("sinon");
const { expect } = chai;
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

  describe("validateApplicationUpdateData", function () {
    it("should call next function if only status and feedback is passed, and status has any of the allowed values", async function () {
      const req = {
        body: {
          status: "accepted",
          feedback: "some feedback",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next function if any value other than status and feedback is passed", async function () {
      const req = {
        body: {
          batman: true,
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });

    it("should not call the next function if any value which is not allowed is sent in status", async function () {
      const req = {
        body: {
          status: "something",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationUpdateData(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });
  });

  describe("validateApplicationQueryParam", function () {
    it("should call the next function if allowed query params are passed", async function () {
      const req = {
        query: {
          userId: "kfjadskfj",
          status: "accepted",
          size: "4",
          next: "kfsdfksdfjksd",
          dev: "true",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationQueryParam(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(1);
    });

    it("should not call next function if any value that is not allowed is passed in query params", async function () {
      const req = {
        query: {
          hello: "true",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      await applicationValidator.validateApplicationQueryParam(req, res, nextSpy);
      expect(nextSpy.callCount).to.equal(0);
    });
  });
});
