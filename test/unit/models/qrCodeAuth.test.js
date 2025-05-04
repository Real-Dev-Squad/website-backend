import { expect } from "chai";
import cleanDb from "../../utils/cleanDb.js";
import firestore from "../../../utils/firestore.js";
import qrCodeAuth from "../../../models/qrCodeAuth.js";
import { userDeviceInfoDataArray } from "../../fixtures/qrCodeAuth/qrCodeAuth.js";
import users from "../../../models/users.js";
import userDataArray from "../../fixtures/user/user.js";

const qrCodeAuthModel = firestore.collection("QrCodeAuth");
/**
 * Test the model functions and validate the data stored
 */

describe("mobile auth", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("storeUserDeviceInfo", function () {
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

  describe("retrieveUserDeviceInfo", function () {
    it("should fetch the user device info for mobile auth", async function () {
      const userData = userDataArray[0];
      const { userId } = await users.addOrUpdate(userData);

      const userDeviceInfoData = {
        ...userDeviceInfoDataArray[0],
        user_id: userId,
        authorization_status: "NOT_INIT",
        access_token: "ACCESS_TOKEN",
      };

      await qrCodeAuth.storeUserDeviceInfo(userDeviceInfoData);
      const response = await qrCodeAuth.retrieveUserDeviceInfo({ deviceId: userDeviceInfoData.device_id });
      const userDeviceInfo = response.data;
      const {
        user_id: userID,
        device_info: deviceInfo,
        device_id: deviceId,
        authorization_status: authorizationStatus,
        access_token: accessToken,
      } = userDeviceInfo;

      const data = (await qrCodeAuthModel.doc(userId).get()).data();

      Object.keys(userDeviceInfo).forEach((key) => {
        expect(userDeviceInfo[key]).to.deep.equal(data[key]);
      });

      expect(response).to.be.an("object");
      expect(userID).to.be.a("string");
      expect(deviceInfo).to.be.a("string");
      expect(deviceId).to.be.a("string");
      expect(authorizationStatus).to.be.a("string");
      expect(accessToken).to.be.a("string");
    });
  });

  describe("retrieveUserDeviceInfo with userId", function () {
    it("should fetch the user device info for mobile auth", async function () {
      const userData = userDataArray[0];
      const { userId } = await users.addOrUpdate(userData);

      const userDeviceInfoData = {
        ...userDeviceInfoDataArray[0],
        user_id: userId,
        authorization_status: "NOT_INIT",
        access_token: "ACCESS_TOKEN",
      };

      await qrCodeAuth.storeUserDeviceInfo(userDeviceInfoData);
      const response = await qrCodeAuth.retrieveUserDeviceInfo({ userId: userDeviceInfoData.user_id });
      const userDeviceInfo = response.data;
      const {
        user_id: userID,
        device_info: deviceInfo,
        device_id: deviceId,
        authorization_status: authorizationStatus,
        access_token: accessToken,
      } = userDeviceInfo;

      const data = (await qrCodeAuthModel.doc(userId).get()).data();

      Object.keys(userDeviceInfo).forEach((key) => {
        expect(userDeviceInfo[key]).to.deep.equal(data[key]);
      });

      expect(response).to.be.an("object");
      expect(userID).to.be.a("string");
      expect(deviceInfo).to.be.a("string");
      expect(deviceId).to.be.a("string");
      expect(authorizationStatus).to.be.a("string");
      expect(accessToken).to.be.a("string");
    });
  });
});
