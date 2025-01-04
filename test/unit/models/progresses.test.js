const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { addUserDetailsToProgressDocs } = require("../../../models/progresses");
const cleanDb = require("../../utils/cleanDb");
const users = require("../../../models/users");
const userDataArray = require("../../fixtures/user/user")();
const { removeSensitiveInfo } = require("../../../services/dataAccessLayer");
describe("getProgressDocument", function () {
  afterEach(function () {
    cleanDb();
    sinon.restore();
  });

  it("should add userData to progress documents correctly", async function () {
    const userData = userDataArray[0];
    const userData2 = userDataArray[1];
    const { userId } = await users.addOrUpdate(userData);
    const { userId: userId2 } = await users.addOrUpdate(userData2);
    const updatedUserData = { ...userData, id: userId };
    const updatedUserData2 = { ...userData2, id: userId2 };
    removeSensitiveInfo(updatedUserData);
    removeSensitiveInfo(updatedUserData2);
    const mockProgressDocs = [
      { userId: userId, taskId: 101 },
      { userId: userId2, taskId: 102 },
    ];

    const result = await addUserDetailsToProgressDocs(mockProgressDocs);

    expect(result).to.deep.equal([
      { userId, taskId: 101, userData: updatedUserData },
      { userId: userId2, taskId: 102, userData: updatedUserData2 },
    ]);
  });

  it("should handle errors and set userData as null", async function () {
    const userData = userDataArray[0];
    await users.addOrUpdate(userData);

    const mockProgressDocs = [{ userId: "userIdNotExists", taskId: 101 }];

    const result = await addUserDetailsToProgressDocs(mockProgressDocs);

    expect(result).to.deep.equal([{ userId: "userIdNotExists", taskId: 101, userData: null }]);
  });
});
