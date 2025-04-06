import chai from "chai";
import chaiHttp from "chai-http";

import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import addUser from "../utils/addUser.js";
import config from "config";
const { expect } = chai;
chai.use(chaiHttp);
const cookieName = config.get("userToken.cookieName");

describe("health", function () {
  it("should return uptime from the healthcheck API", function (done) {
    chai
      .request(app)
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
    chai
      .request(app)
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
    const jwt = generateAuthToken({ userId });

    chai
      .request(app)
      .get("/healthcheck/v2")
      .set("cookie", `${cookieName}=${jwt}`)
      .end((err, res) => {
        if (err) {
          throw err;
        }

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("uptime").that.is.a("number");
      });
  });
});
