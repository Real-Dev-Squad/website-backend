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
    const goalsBackendUserId = "test_1";
    jwt = authService.generateAuthToken({ userId: userId });
    goalSiteConfig = config.services.goalAPI;

    nock(goalSiteConfig.baseUrl)
      .post("/api/v1/user/")
      .reply(function (uri, requestBody) {
        const headers = this.req.headers;

        if (headers["Rest-Key"] === goalSiteConfig.secretKey) {
          return [
            200,
            {
              message: "success",
              user: {
                rds_id: userId,
                token: {
                  exp: 1694625316,
                  access: "access-token-goal-site-backend",
                },
                created_at: "2023-09-12T17:07:28.242030Z",
                modified_at: "2023-09-12T17:15:16.383069Z",
                roles: {
                  restricted: false,
                },
                id: goalsBackendUserId,
              },
            },
          ];
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

  describe("GET /token - set goal site token as cookie", function () {
    it("Should set the cookie successfully on the request and return success", function (done) {
      chai
        .request(app)
        .get("/goals/token/")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("user");
          const userResponseData = res.body.user;
          expect(userResponseData).to.have.property("rds_id");
          expect(userResponseData).to.have.property("token");
          return done();
        });
    });
  });
});
