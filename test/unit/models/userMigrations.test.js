const chai = require("chai");
const { expect } = chai;
const firestore = require("../../../utils/firestore");
const userModel = firestore.collection("users");
const cleanDb = require("../../utils/cleanDb");
const userMigrationModel = require("../../../models/userMigrations");
const userData = require("../../fixtures/user/user")();
const addUser = require("../../utils/addUser");

describe("userColorMigrations", function () {
  const MAX_TRANSACTION_WRITES = 500;

  beforeEach(async function () {
    await addUser(userData[0]);
    await addUser(userData[1]);
    await addUser(userData[2]);
    await addUser(userData[3]);
    await addUser(userData[4]);
    await addUser(userData[6]);
  });
  afterEach(async function () {
    await cleanDb();
  });

  it("should add color property to added users which dont have a color property", async function () {
    const response = await userMigrationModel.addDefaultColors();

    expect(response.totalUsersFetched).to.equal(6);
    expect(response.totalUsersUpdated).to.equal(5);
    expect(response.totalUsersUnaffected).to.equal(1);
  });
  it("should make sure that batch updates are working properly by passing smaller batch size", async function () {
    const SMALL_BATCH_SIZE = 2;
    const response = await userMigrationModel.addDefaultColors(SMALL_BATCH_SIZE);
    expect(response.totalUsersFetched).to.equal(6);
    expect(response.totalUsersUpdated).to.equal(5);
    expect(response.totalUsersUnaffected).to.equal(1);
  });
  it("should not affect users already having color property", async function () {
    // Manually add a color property to a user
    const userId = await addUser(userData[0]);
    await userModel.doc(userId).update({ colors: { color_id: 3 } });
    const response = await userMigrationModel.addDefaultColors(MAX_TRANSACTION_WRITES);
    expect(response.totalUsersFetched).to.equal(6);
    expect(response.totalUsersUpdated).to.equal(4);
    expect(response.totalUsersUnaffected).to.equal(2);

    // Check that the user with a color property was unaffected
    const updatedUser = await userModel.doc(userId).get();
    expect(updatedUser.data().colors.color_id).to.equal(3);
  });
});
