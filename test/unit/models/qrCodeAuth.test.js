const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const qrCodeAuthModel = require("../../../models/qrCodeAuth");
const qrCodeAuth = firestore.collection("QrCodeAuth");
const users = require("../../../models/users");
const Sinon = require("sinon");
const userDataArray = require("../../fixtures/user/user")();

describe("QrCodeAuthModel", function () {
  afterEach(async function () {
    await cleanDb();
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
      await qrCodeAuthModel.storeUserDeviceInfo(userDeviceInfoData);
      const response = await qrCodeAuthModel.updateStatus(userId, "AUTHORIZED");
      const updatedData = response.data;

      const data = (await qrCodeAuth.doc(userId).get()).data();

      Object.keys(updatedData).forEach((key) => {
        expect(updatedData[key]).to.deep.equal(data[key]);
      });

      expect(response).to.be.an("object");
      expect(response.userExists).to.be.equal(true);
    });

    it("should return userExist as false when the user document is not found", async function () {
      const response = await qrCodeAuthModel.updateStatus("fmk124", "REJECTED");
      expect(response.userExists).to.be.equal(false);
    });

    it("should throw server error", async function () {
      await qrCodeAuthModel.updateStatus(12345, "AUTHORIZED");

      const errorFunc = Sinon.spy(() => {
        throw new Error("Wrong Id");
      });

      expect(errorFunc.callCount).to.be.equal(1);
    });
  });
});
