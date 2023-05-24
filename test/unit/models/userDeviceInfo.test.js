const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const userDeviceInfo = require("../../../models/userDeviceInfo");
const userDeviceInfoModel = firestore.collection("userDeviceInfo");
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
      };
      const response = await userDeviceInfo.storeUserDeviceInfo(userDeviceInfoData);

      const { user_id: userID, device_info: deviceInfo } = response.userDeviceInfoData;
      const data = (await userDeviceInfoModel.doc(userID).get()).data();

      Object.keys(userDeviceInfoData).forEach((key) => {
        expect(userDeviceInfoData[key]).to.deep.equal(data[key]);
      });
      expect(response).to.be.an("object");
      expect(userID).to.be.a("string");
      expect(deviceInfo).to.be.a("string");
    });
  });
});
