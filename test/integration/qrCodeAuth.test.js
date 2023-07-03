const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const userData = require("../fixtures/user/user")();
const { userDeviceInfoDataArray } = require("../fixtures/qrCodeAuth/qrCodeAuth");
const addUser = require("../utils/addUser");

// Import fixtures
let userDeviceInfoData;
let wrongUserDeviceInfoData;
let userId;
const user = userData[0];

describe("mobile auth", function () {
  beforeEach(async function () {
    userId = await addUser(user);
    userDeviceInfoData = { ...userDeviceInfoDataArray[0], user_id: userId };
    wrongUserDeviceInfoData = userDeviceInfoDataArray[0];
  });
  afterEach(async function () {
    await cleanDb();

    sinon.restore();
  });
  it("Should return success response after storing user device info for mobile auth", function (done) {
    chai
      .request(app)
      .post("/auth/qr-code-auth")
      .send(userDeviceInfoData)
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        expect(response).to.have.status(201);
        expect(response.body.userDeviceInfoData).to.be.an("object");
        expect(response.body.message).to.equal("User Device Info added successfully!");
        expect(response.body.userDeviceInfoData.user_id).to.be.a("string");
        expect(response.body.userDeviceInfoData.device_info).to.be.a("string");
        expect(response.body.userDeviceInfoData.device_id).to.be.a("string");

        return done();
      });
  });

  it("Should return a 500 status code and the correct error message when an error occurs while storing user device info", function (done) {
    chai
      .request(app)
      .post("/auth/qr-code-auth")
      .send(wrongUserDeviceInfoData)
      .end((err, res) => {
        if (err) {
          return done();
        }
        expect(res).to.have.status(500);
        expect(res.body).to.eql({
          statusCode: 500,
          error: "Internal Server Error",
          message: "An internal server error occurred",
        });

        return done();
      });
  });
});
