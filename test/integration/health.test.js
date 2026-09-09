const { expect } = require("chai");
const { request } = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
describe("health", function () {
  it("uses the Express app so chai-http cannot close the shared server", function () {
    expect(app).to.be.a("function");
  });

  it("should return uptime from the healthcheck API", function (done) {
    request
      .execute(app)
      .get("/healthcheck")
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("uptime").that.is.a("number");

        return done();
      });
  });

  it("should return 401 from the authenticated healthcheck API for missing auth tokens", function (done) {
    request
      .execute(app)
      .get("/healthcheck/v2")
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(401);
        expect(res.body).to.be.an("object");
        expect(res.body).to.eql({
          statusCode: 401,
          error: "Unauthorized",
          message: "Unauthenticated User",
        });

        return done();
      });
  });

  it("should return 200 from the authenticated healthcheck API when token is passed", async function () {
    const userId = await addUser();
    const jwt = authService.generateAuthToken({ userId });

    const res = await request.execute(app).get("/healthcheck/v2").set("cookie", `${cookieName}=${jwt}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("uptime").that.is.a("number");
  });
});
