import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
const { expect } = chai;
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userData from "../fixtures/user/user";
const cookieName = config.get("userToken.cookieName");
import addUser from "../utils/addUser";
import { validOooStatusRequests, validOooStatusUpdate } from "../fixtures/oooRequest/oooRequest";
import { createOooRequest } from "../../models/oooRequests";

chai.use(chaiHttp);
let authToken: string;
let superUserToken: string;
let oooRequestData :any;

describe("Requests", async () => {
  const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
  const [userId, superUserId] = await Promise.all(userIdPromises);
  authToken = authService.generateAuthToken({ userId });
  superUserToken = authService.generateAuthToken({ superUserId });
  sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));

  after(async () => {
    await cleanDb();
  });

  describe("POST /requests", function () {
    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .post("/requests?dev=true")
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should create a new request", function (done) {
      chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("OOO status requested successfully");
          done();
        });
    });
  });

  describe("PUT /requests/:id", function () {
    beforeEach(async function () {
      oooRequestData = await createOooRequest(validOooStatusRequests);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should update a request", function (done) {
      chai
        .request(app)
        .put(`/requests/${oooRequestData.id}?dev=true`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          const resBody = res.body;
          console.log({ resBody });
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("OOO status updated successfully");
          done();
        });
    });
  });
});
