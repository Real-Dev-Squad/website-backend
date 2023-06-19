const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const userData = require("../fixtures/user/user")();
const superUser = userData[4];

const config = require("config");
const sinon = require("sinon");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe.only("Discord actions", function () {
  let superUserId;
  let superUserAuthToken;
  let fetchStub;
  beforeEach(async function () {
    fetchStub = sinon.stub(global, "fetch");
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    discordId = "12345";
  });

  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("POST /discord-actions/nickname", function (done) {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
      })
    );
    chai
      .request(app)
      .patch(`/discord-actions/nickname`)
      .set("cookie", `${cookieName}=${superUserAuthToken}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("nickname has been updated");
        return done();
      });
  });
});
