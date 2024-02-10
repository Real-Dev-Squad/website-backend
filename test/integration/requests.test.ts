import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
const { expect } = chai;
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
const cookieName = config.get("userToken.cookieName");
import addUser from "../utils/addUser";
import { createOooRequests, validOooStatusRequests, validOooStatusUpdate,createOooRequests2 } from "../fixtures/oooRequest/oooRequest";
import { createOooRequest, updateOooRequest } from "../../models/oooRequests";

const userData = userDataFixture();
chai.use(chaiHttp);

let authToken: string;
let superUserToken: string;
let oooRequestId: string;
let pendingOooRequestId: string;
let approvedOooRequestId: string;

describe("/requests", function () {
  beforeEach(async function () {
    const { id: oooRequestStatusId }: any = await createOooRequest(createOooRequests);
    oooRequestId = oooRequestStatusId;

    const { id: pendingOooId }: any = await createOooRequest(createOooRequests2);
    pendingOooRequestId = pendingOooId;

    const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
    const [userId, superUserId] = await Promise.all(userIdPromises);

    const { id: approveOooId }: any = await updateOooRequest(oooRequestId, { state: "APPROVED" }, superUserId);
    approvedOooRequestId = approveOooId;

    authToken = authService.generateAuthToken({ userId });
    superUserToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
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
    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .put(`/requests/${oooRequestId}?dev=true`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should update a request", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingOooRequestId}?dev=true`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("OOO status request updated successfully");
          done();
        });
    });

    it("should return 404 if request does not exist", function (done) {
      chai
        .request(app)
        .put(`/requests/invalidoooRequestId?dev=true`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Request does not exist");
          done();
        });
    });

    it("should return 400 if request is already approved", function (done) {
      chai
        .request(app)
        .put(`/requests/${approvedOooRequestId}?dev=true`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Request is already approved");
          done();
        });
    });
  });
});
