const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const arts = require("../../models/arts");
const cleanDb = require("../utils/cleanDb");

// Import fixtures
const artData = require("../fixtures/arts/arts")();

const config = require("config");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Arts", function () {
  let jwt;

  beforeEach(async function () {
    const userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    await arts.addArt(artData[0], userId);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /arts/", function () {
    it("Should get all the arts in system", function (done) {
      chai
        .request(app)
        .get("/arts")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Arts returned successfully!");
          expect(res.body.arts).to.be.a("array");
          expect(res.body.arts[0]).to.be.a("object");
          expect(res.body.arts[0].title).to.equal(artData[0].title);

          return done();
        });
    });
  });
});
