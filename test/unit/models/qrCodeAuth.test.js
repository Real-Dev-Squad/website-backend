const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const qrCodeAuth = require("../../../models/qrCodeAuth");
const { userDeviceInfoDataArray } = require("../../fixtures/qrCodeAuth/qrCodeAuth");
const qrCodeAuthModel = firestore.collection("QrCodeAuth");
const users = require("../../../models/users");
const userDataArray = require("../../fixtures/user/user")();
/**
 * Test the model functions and validate the data stored
 */

describe("mobile auth", function () {
  afterEach(async function () {
    await cleanDb();
  });
  describe("storeUserDeviceInfo", function () {
    const WRONG_USER_ID = "xynsasd";
    it("should store user Id and device info of user for mobile auth", async function () {
      const userData = userDataArray[0];
      const { userId } = await users.addOrUpdate(userData);

      const userDeviceInfoData = {
        ...userDeviceInfoDataArray[0],
        user_id: userId,
        authorization_status: "NOT_INIT",
      };

      const response = await qrCodeAuth.storeUserDeviceInfo(userDeviceInfoData);

      const {
        user_id: userID,
        device_info: deviceInfo,
        device_id: deviceId,
        authorization_status: authorizationStatus,
      } = response.userDeviceInfoData;
      const data = (await qrCodeAuthModel.doc(userID).get()).data();

      Object.keys(userDeviceInfoData).forEach((key) => {
        expect(userDeviceInfoData[key.toString()]).to.deep.equal(data[key.toString()]);
      });
      expect(response).to.be.an("object");
      expect(userID).to.be.a("string");
      expect(deviceInfo).to.be.a("string");
      expect(deviceId).to.be.a("string");
      expect(authorizationStatus).to.be.a("string");
    });

    it("should return userExist as false when the user document is not found", async function () {
      const userDeviceInfoData = {
        ...userDeviceInfoDataArray[0],
        user_id: WRONG_USER_ID,
        authorization_status: "NOT_INIT",
      };
      const response = await qrCodeAuth.storeUserDeviceInfo(userDeviceInfoData);
      expect(response.userExists).to.be.equal(false);
    });
  });

  describe("updateAuthStatus", function () {
    it("should update the auth status of an existing user", async function () {
      const userData = userDataArray[0];
      const { userId } = await users.addOrUpdate(userData);

      const userDeviceInfoData = {
        user_id: userId,
        device_info: "TEST_DEVICE_INFO",
        device_id: "TEST_DEVICE_ID",
        authorization_status: "NOT_INIT",
      };
      await qrCodeAuth.storeUserDeviceInfo(userDeviceInfoData);
      const response = await qrCodeAuth.updateStatus(userId, "AUTHORIZED");
      const updatedData = response.data;

      const data = (await qrCodeAuthModel.doc(userId).get()).data();

      Object.keys(updatedData).forEach((key) => {
        expect(updatedData[key]).to.deep.equal(data[key]);
      });

      expect(response).to.be.an("object");
      expect(response.userExists).to.be.equal(true);
    });

    it("should return userExist as false when the user document is not found", async function () {
      const response = await qrCodeAuth.updateStatus("fmk124", "REJECTED");
      expect(response.userExists).to.be.equal(false);
    });
  });
});
