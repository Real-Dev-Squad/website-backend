const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const { userDeviceInfoDataArray } = require("../../fixtures/userDeviceInfo/userDeviceInfo");
const userDeviceInfo = require("../../../models/userDeviceInfo");
const userDeviceInfoModel = firestore.collection("userDeviceInfo");
/**
 * Test the model functions and validate the data stored
 */

describe("UserDeviceInfo", function () {
  afterEach(async function () {
    await cleanDb();
  });
  describe("storeUserDeviceInfo", function () {
    it("should store user Id and device type of user for mobile auth", async function () {
      const userDeviceInfoData = userDeviceInfoDataArray[0];
      const response = await userDeviceInfo.storeUserDeviceInfo(userDeviceInfoData);
      const { userId, deviceType } = response.userDeviceInfoData;
      const data = (await userDeviceInfoModel.doc(userId).get()).data();

      Object.keys(userDeviceInfoData).forEach((key) => {
        expect(userDeviceInfoData[key]).to.deep.equal(data[key]);
      });
      expect(response).to.be.an("object");
      expect(userId).to.be.a("string");
      expect(deviceType).to.be.a("string");
    });
  });
});
