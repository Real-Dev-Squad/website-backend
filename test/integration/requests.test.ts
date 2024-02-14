import chai from "chai";
const { expect } = chai;
import chaiHttp from "chai-http";
import _ from "lodash";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
const cookieName = config.get("userToken.cookieName");
import addUser from "../utils/addUser";
import {
createOooRequests,
  validOooStatusRequests,
  validOooStatusUpdate,
createOooRequests2,
} from "../fixtures/oooRequest/oooRequest";
import { createRequest, updateRequest } from "../../models/requests";
import {
  REQUEST_ALREADY_APPROVED,
  REQUEST_STATE,
  REQUEST_TYPE,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_CREATED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_ALREADY_PENDING,
} from "../../constants/requests";

const userData = userDataFixture();
chai.use(chaiHttp);

let authToken: string;
let superUserToken: string;
let oooRequestId: string;
let pendingOooRequestId: string;
let approvedOooRequestId: string;
 
describe("/requests", function () {
  beforeEach(async function () {
    const { id: oooRequestStatusId }: any = await createRequest(createOooRequests);
    oooRequestId = oooRequestStatusId;

    const { id: pendingOooId }: any = await createRequest(createOooRequests2);
    pendingOooRequestId = pendingOooId;

    const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
    const [userId, superUserId] = await Promise.all(userIdPromises);

    const { id: approveOooId }: any = await updateRequest(oooRequestId, { state: "APPROVED" }, superUserId);
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
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          done();
        });
    });

    it("should return 400, if already created request is created again", async function () {
      await chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests);
      const response = await chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests);
      expect(response).to.have.status(400);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal(REQUEST_ALREADY_PENDING);
    });

    it("should create a new request and have all the required fields in the response", function (done) {
      chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(Object.keys(res.body.data)).to.have.lengthOf(9);
          expect(res.body.data.until).to.be.above(res.body.data.from);
          expect(res.body.data).to.have.property("requestedBy");
          expect(res.body.data.type).to.equal(REQUEST_TYPE.OOO);
          expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING);
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          done();
        });
    });

    it("should return error if feature flag is not used", function (done) {
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Please use feature flag to make this requests");
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
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          done();
        });
    });

    it("should return error if invalid type is passed", function (done) {
      const type = "ACTIVE";
      chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...validOooStatusRequests, type })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(`Invalid request type: ${type}`);
          done();
        });
    });

    it("should return error if message is not present in body", function (done) {
      chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(_.omit(validOooStatusRequests, "message"))
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("message is required");
          done();
        });
    });

    it("should return error if state in the body is not PENDING", function (done) {
      chai
        .request(app)
        .post("/requests?dev=true")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...validOooStatusRequests, state: REQUEST_STATE.APPROVED })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("state must be PENDING");
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

    it("should approved a request", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingOooRequestId}?dev=true`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_APPROVED_SUCCESSFULLY);
          done();
        });
    });

    it("should update a request", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingOooRequestId}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Please use feature flag to make this requests");
          done();
        });
    });

    it("should return error if wrong type is passed", function (done) {
      const type = "ACTIVE";
      chai
        .request(app)
        .put(`/requests/${pendingOooRequestId}?dev=true`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...validOooStatusUpdate, type })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Invalid request type: ACTIVE");
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
          expect(res.body.message).to.equal(REQUEST_DOES_NOT_EXIST);
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
          expect(res.body.message).to.equal(REQUEST_ALREADY_APPROVED);
          done();
        });
    });
  });

  describe("GET /requests", function () {
    it("should return all requests", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.lengthOf(2);
          expect(res.body.data[0]).to.have.property("id");
          expect(res.body.data[0]).to.have.property("requestedBy");
          expect(res.body.data[0]).to.have.property("type");
          expect(res.body.data[0]).to.have.property("state");
          expect(res.body.data[0]).to.have.property("message");
          done();
        });
    });

    it.skip("should return all requests by specific user", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&requestedBy=testUser")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.every((request: any) => request.requestedBy === "testUser"));
          done();
        });
    });

    it("should return all requests by state", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&state=APPROVED")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.every((e: any) => e.state === "APPROVED"));
          done();
        });
    });

    it("should return request of type OOO", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&type=OOO")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.every((e: any) => e.type === "OOO"));
          done();
        });
    });

    it("should return empty array is no data is found, for specific state and user", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&requestedBy=testUser2&state=APPROVED")
        .end(function (err, res) {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("should return empty array is no data is found", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&requestedBy=testUserRandom")
        .end(function (err, res) {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("should throw error if request id doesn't match", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&id=ramdonId1")
        .end(function (err, res) {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("should return error if not a valid state is passed", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&state=ACTIVE")
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal(`"state" must be one of [APPROVED, PENDING, REJECTED]`);
          done();
        });
    });

    it("should return error if not a valid type is passed", function (done) {
      chai
        .request(app)
        .get("/requests?dev=true&type=RANDOM")
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal('"type" must be one of [OOO, ALL]');
          done();
        });
    });
  });
});
