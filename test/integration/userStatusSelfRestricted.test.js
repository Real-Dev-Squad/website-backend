const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const { updateUserStatus } = require("../../models/userStatus");
const { generateUserStatusData } = require("../fixtures/userStatus/userStatus");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
const firestore = require("../../utils/firestore");

chai.use(chaiHttp);

describe("Restricted PATCH /users/status/self", function () {
  let jwt;
  let userId = "";

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    const initialStatus = generateUserStatusData("OOO", Date.now(), Date.now(), Date.now() + 86400000);
    await updateUserStatus(userId, initialStatus);
  });

  afterEach(async function () {
    await cleanDb();
  });

  it("Should return 400 when trying to update 'state'", async function () {
    const res = await chai
      .request(app)
      .patch("/users/status/self")
      .set("cookie", `${cookieName}=${jwt}`)
      .send({
        currentStatus: {
          state: "ACTIVE",
          updatedAt: Date.now(),
          from: Date.now(),
        },
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal("Bad Request");
    expect(res.body.message).to.include("Updating 'state' is not allowed via this endpoint");
  });

  it("Should return 400 when trying to update 'until'", async function () {
    const res = await chai
      .request(app)
      .patch("/users/status/self")
      .set("cookie", `${cookieName}=${jwt}`)
      .send({
        currentStatus: {
          until: Date.now() + 100000,
          updatedAt: Date.now(),
          from: Date.now(),
        },
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal("Bad Request");
    expect(res.body.message).to.include("Updating 'until' is not allowed via this endpoint");
  });

  it("Should allow updating other fields (message) and preserve state/until", async function () {
    // Current state is OOO. We update message.
    const newMessage = "Updated message via restricted endpoint";
    const now = Date.now();

    const res = await chai
      .request(app)
      .patch("/users/status/self")
      .set("cookie", `${cookieName}=${jwt}`)
      .send({
        currentStatus: {
          message: newMessage,
          updatedAt: now,
          from: now,
        },
      });

    expect(res).to.have.status(200);
    expect(res.body.message).to.equal("User Status updated successfully.");

    // Verify persistence
    const doc = await firestore.collection("usersStatus").where("userId", "==", userId).get();
    const data = doc.docs[0].data();

    expect(data.currentStatus.state).to.equal("OOO");
    expect(data.currentStatus.message).to.equal(newMessage);
    expect(data.currentStatus.until).to.not.equal(undefined);
  });
});
