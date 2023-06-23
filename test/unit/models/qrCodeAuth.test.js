const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const userDeviceInfo = require("../../../models/qrCodeAuth");
const userDeviceInfoModel = firestore.collection("QrCodeAuth");
const users = require("../../../models/users");
const userDataArray = require("../../fixtures/user/user")();
/**
 * Test the model functions and validate the data stored
 */

describe("UserDeviceInfo", function () {
  afterEach(async function () {
    await cleanDb();
  });
  describe("storeUserDeviceInfo", function () {
    it("should store user Id and device info of user for mobile auth", async function () {
      const userData = userDataArray[0];
      const { userId } = await users.addOrUpdate(userData);

      const userDeviceInfoData = {
        user_id: userId,
        device_info: "TEST_DEVICE_INFO",
        device_id: "TEST_DEVICE_ID",
        authorization_status: "NOT_INIT",
      };
      const response = await userDeviceInfo.storeUserDeviceInfo(userDeviceInfoData);

      const {
        user_id: userID,
        device_info: deviceInfo,
        device_id: deviceId,
        authorization_status: authorizationStatus,
      } = response.userDeviceInfoData;
      const data = (await userDeviceInfoModel.doc(userID).get()).data();

      Object.keys(userDeviceInfoData).forEach((key) => {
        expect(userDeviceInfoData[key.toString()]).to.deep.equal(data[key.toString()]);
      });
      expect(response).to.be.an("object");
      expect(userID).to.be.a("string");
      expect(deviceInfo).to.be.a("string");
      expect(deviceId).to.be.a("string");
      expect(authorizationStatus).to.be.a("string");
    });
  });
});
