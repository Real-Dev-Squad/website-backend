const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");

const cleanDb = require("../../utils/cleanDb");
const multer = require("../../../utils/multer");

const errorMessage = require("../../../constants/errorMessages");
const multerConstant = require("../../../constants/multer");
const MB_1 = multerConstant.FILE_SIZE_1MB;
const profileFileSize = multerConstant.PROFILE_FILE_SIZE;

describe("multer", function () {
  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });
  describe("fileFilterImagesOnly", function () {
    const callBack = (err, success) => {
      return { err, success };
    };
    const fileType = [{ mimetype: "image/png" }, { mimetype: "test" }];
    it("should pass without any error", async function () {
      const response = await multer.fileFilterImagesOnly({}, fileType[0], callBack);

      expect(response).to.be.a("object");
      expect(response.err).to.be.equal(null);
      expect(response.success).to.be.equal(true);
    });
    it("should return error on passing invalid file type", async function () {
      const response = await multer.fileFilterImagesOnly({}, fileType[1], callBack);

      expect(response).to.be.a("object");
      expect(response.err.code).to.be.equal("TYPE_UNSUPPORTED_FILE");
      expect(response.success).to.be.equal(false);
    });
  });

  describe("", function () {
    let spy;
    const errCode = [
      { code: "LIMIT_FILE_SIZE" },
      { code: "LIMIT_UNEXPECTED_FILE" },
      { code: "TYPE_UNSUPPORTED_FILE" },
      { code: "TEST" },
    ];
    beforeEach(async function () {
      spy = sinon.spy();
    });

    it("should call the entityTooLarge error callback", function () {
      multer.multerErrorHandling(errCode[0], {}, { boom: { entityTooLarge: spy } }, {});
      expect(spy.callCount).to.be.equal(1);
      expect(spy.calledWith(errorMessage.FILE_TOO_LARGE(profileFileSize / MB_1))).to.be.equal(true);
    });
    it("should call the badData error callback", function () {
      multer.multerErrorHandling(errCode[1], {}, { boom: { badData: spy } }, {});
      expect(spy.callCount).to.be.equal(1);
      expect(spy.calledWith(errorMessage.ONLY_ONE_FILE_ALLOWED)).to.be.equal(true);
    });
    it("should call the unsupportedMediaType error callback", function () {
      multer.multerErrorHandling(errCode[2], {}, { boom: { unsupportedMediaType: spy } }, {});
      expect(spy.callCount).to.be.equal(1);
      expect(spy.calledWith(errorMessage.ONLY_IMAGE_SUPPORTED)).to.be.equal(true);
    });
    it("should call the badImplementation error callback", function () {
      multer.multerErrorHandling(errCode[3], {}, { boom: { badImplementation: spy } }, {});
      expect(spy.callCount).to.be.equal(1);
      expect(spy.calledWith(errorMessage.INTERNAL_SERVER_ERROR)).to.be.equal(true);
    });
  });
});
