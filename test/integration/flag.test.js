const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();
const superUser = userData[4];

const flagData = {
  title: "dark - mode",
  enabled: true,
  roles: ["members", "no_role", "super_user"],
  users: {
    "pallab id": "true",
    "rohit id": "false",
  },
};

chai.use(chaiHttp);

describe("flags", function () {
  let jwt;

  beforeEach(async function () {
    const userId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /flag/add", function () {
    it("Should return flag Id", function (done) {
      chai
        .request(app)
        .post("/flag/add")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(flagData)
        .end((err, res) => {
          if (err) {
            throw done(err);
          }
          expect(res.body.flagId).to.be.a("string");
          expect(res.body.message).to.equal("Add feature flag successfully!");

          return done();
        });
    });
  });
});
