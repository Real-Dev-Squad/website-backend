const { expect } = require("chai");
const firestore = require("../../../utils/firestore");
const { githubModalCircularDependency } = require("../../../utils/circularDependency");
const cleanDb = require("../../utils/cleanDb");
const userDataArray = require("../../fixtures/user/user")();
const userModel = firestore.collection("users");

describe("circularDependency", function () {
  beforeEach(async function () {
    const addUsersPromises = [];
    userDataArray.forEach((user) => {
      addUsersPromises.push(userModel.add(user));
    });
    await Promise.all(addUsersPromises);
  });

  afterEach(async function () {
    await cleanDb();
  });
  it("should give array of object with is and github_created_at keys", async function () {
    const data = ["ankushdharkar"];

    const dataS = await githubModalCircularDependency(data);

    expect(dataS[0].github_created_at).to.equal(1341655281000);
  });
});
