const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");
const nock = require("nock");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();
const cleanDb = require("../utils/cleanDb");

chai.use(chaiHttp);

const user = userData[6];
let jwt;
let goalSiteConfig;

describe("Goals Site", function () {
  before(async function () {
    const userId = await addUser(user);
    user.id = userId;
    jwt = authService.generateAuthToken({ userId: userId });
    goalSiteConfig = config.services.goalAPI;

    nock(goalSiteConfig.baseUrl)
      .post("/auth_token")
      .reply((uri, requestBody) => {
        const parsedBody = JSON.parse(requestBody);

        if (parsedBody.goal_api_secret_key === goalSiteConfig.secretKey) {
          return [200, { token: "goal_site_test_token_cookie123", token_expiry: new Date().getTime() }];
        }
        return [400, { data: "something went wrong" }];
      });
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("POST /token - set goal site token as cookie", function () {
    it("Should set the cookie successfully on the request and return success", function (done) {
      chai
        .request(app)
        .post("/goals/token/")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });
  });
});
