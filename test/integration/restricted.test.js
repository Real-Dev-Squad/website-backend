import chai from "chai";
import chaiHttp from "chai-http";
import config from "config";
import sinon from "sinon";

import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import cleanDb from "../utils/cleanDb.js";
import userData from "../fixtures/user/user.js";
import addUser from "../utils/addUser.js";
import { getDiscordMembers } from "../fixtures/discordResponse/discord-response.js";

const { expect } = chai;
const cookieName = config.get("userToken.cookieName");
const unrestrictedUser = userData[0];
const restrictedUser = userData[2];

chai.use(chaiHttp);

describe("checkRestrictedUser", function () {
  let restrictedJwt;
  let unrestrictedJwt;
  let fetchStub;

  before(async function () {
    const restrictedUserId = await addUser(restrictedUser);
    const unrestrictedUserId = await addUser(unrestrictedUser);
    restrictedJwt = generateAuthToken({ userId: restrictedUserId });
    unrestrictedJwt = generateAuthToken({ userId: unrestrictedUserId });

    fetchStub = sinon.stub(global, "fetch");
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(getDiscordMembers),
      })
    );
  });

  after(async function () {
    sinon.restore();
    await cleanDb();
  });

  it("should allow GET request coming from restricted user", function (done) {
    chai
      .request(app)
      .get("/users/self")
      .set("cookie", `${cookieName}=${restrictedJwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(200);
        expect(res).to.be.a("object");
        return done();
      });
  });

  it("should allow non-GET request coming from unrestricted user", function (done) {
    chai
      .request(app)
      .patch("/users/self")
      .set("cookie", `${cookieName}=${unrestrictedJwt}`)
      .send({
        first_name: "Test",
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(204);
        return done();
      });
  });

  it("should deny non-GET request coming from restricted user", function (done) {
    chai
      .request(app)
      .patch("/users/self")
      .set("cookie", `${cookieName}=${restrictedJwt}`)
      .send({
        first_name: "Test",
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(403);
        return done();
      });
  });
});
