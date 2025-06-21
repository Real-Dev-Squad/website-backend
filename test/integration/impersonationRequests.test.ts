import chai from "chai";
import chaiHttp from "chai-http";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService, { generateAuthToken } from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import addUser from "../utils/addUser";
import * as impersonationModel from "../../models/impersonationRequests";
import { CreateImpersonationRequestBody, ImpersonationRequest } from "../../types/impersonationRequest";
import {
  REQUEST_ALREADY_APPROVED,
  REQUEST_ALREADY_REJECTED,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_STATE,
  UNAUTHORIZED_TO_UPDATE_REQUEST
} from "../../constants/requests";
import {
  impersonationRequestsBodyData,
  updateImpersonationRequestApproved,
  updateImpersonationRequestRejected
} from "../fixtures/impersonation-requests/impersonationRequests";

const { expect } = chai;
chai.use(chaiHttp);

const cookieName = config.get("userToken.cookieName");
const userData = userDataFixture();

let authToken: string;
let superUserToken: string;
let requestsEndpoint: string;
let testUserId1: string;
let testUserId2: string;
let testUserId3: string;
let testUserId4: string;
let testUserId5: string;
let testSuperUserId: string;
let impersonationRequestBody: CreateImpersonationRequestBody;
let impersonationRequest1: ImpersonationRequest;
let impersonationRequest2: ImpersonationRequest;

describe("Impersonation Requests", () => {
  requestsEndpoint = "/impersonation/requests?dev=true";

  beforeEach(async () => {
    const userIdPromises = [
      addUser(userData[16]),
      addUser(userData[19]),
      addUser(userData[12]),
      addUser(userData[0]),
      addUser(userData[1]),
      addUser(userData[4])
    ];
    [testUserId1, testUserId2, testUserId3, testUserId4, testUserId5, testSuperUserId] = await Promise.all(userIdPromises);

    impersonationRequestBody = {
      impersonatedUserId: testUserId1,
      reason: "User assistance required for account debugging."
    };

    impersonationRequest1 = await impersonationModel.createImpersonationRequest({
      ...impersonationRequestsBodyData[0],
      impersonatedUserId: testUserId2,
      createdFor: userData[19].username,
      userId: testSuperUserId,
      createdBy: userData[4].username
    });

    impersonationRequest2 = await impersonationModel.createImpersonationRequest({
      ...impersonationRequestsBodyData[0],
      impersonatedUserId: testUserId3,
      createdFor: userData[12].username,
      createdBy: userData[4].username,
      userId: testSuperUserId,
      status: REQUEST_STATE.APPROVED
    });

    authToken = authService.generateAuthToken({ userId: testUserId1 });
    superUserToken = authService.generateAuthToken({ userId: testSuperUserId });
  });

  afterEach(async () => {
    await cleanDb();
    sinon.restore();
  });

  describe("PATCH /impersonation/requests/:id", function () {
    let rejectedRequest;
    let impersonationRequest3;

    beforeEach(async () => {
      impersonationRequest1 = await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[0],
        impersonatedUserId: testUserId1,
        createdBy: userData[16].username,
        status: REQUEST_STATE.APPROVED
      });

      impersonationRequest2 = await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[1],
        impersonatedUserId: testUserId3,
        createdFor: userData[12].username
      });

      impersonationRequest3 = await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[2],
        impersonatedUserId: testUserId4
      });

      rejectedRequest = await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[3],
        impersonatedUserId: testUserId1,
        status: REQUEST_STATE.REJECTED
      });
    });

    it("should return 404 and 'Route not found' message when dev is false", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest1.id}?dev=false`)
        .send(updateImpersonationRequestApproved)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal("Route not found");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 404 and 'Route not found' message when dev is missing", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest1.id}`)
        .send(updateImpersonationRequestApproved)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          try {
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal("Route not found");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should update a request status to APPROVED if dev flag is present", function (done) {
      const tempAuthToken = generateAuthToken({ userId: testUserId3 });
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest2.id}?dev=true`)
        .send(updateImpersonationRequestApproved)
        .set("cookie", `${cookieName}=${tempAuthToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal(REQUEST_APPROVED_SUCCESSFULLY);
          expect(res.body.data.id).to.equal(impersonationRequest2.id);
          expect(res.body.data.lastModifiedBy).to.equal(impersonationRequest2.impersonatedUserId);
          done();
        });
    });

    it("should update a request status to REJECTED if dev flag is present", function (done) {
      const tempAuthToken = generateAuthToken({ userId: testUserId4 });
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest3.id}?dev=true`)
        .send(updateImpersonationRequestRejected)
        .set("cookie", `${cookieName}=${tempAuthToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal(REQUEST_REJECTED_SUCCESSFULLY);
          expect(res.body.data.id).to.equal(impersonationRequest3.id);
          expect(res.body.data.lastModifiedBy).to.equal(impersonationRequest3.impersonatedUserId);
          done();
        });
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest2.id}?dev=true`)
        .send(updateImpersonationRequestApproved)
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(401);
            expect(res.body.error).to.equal("Unauthorized");
            expect(res.body.message).to.equal("Unauthenticated User");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return NotFound Error if request does not exist", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/randomId?dev=true`)
        .send(updateImpersonationRequestApproved)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.error).to.equal("Not Found");
          expect(res.body.message).to.equal(REQUEST_DOES_NOT_EXIST);
          done();
        });
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/randomId?dev=true`)
        .send(updateImpersonationRequestApproved)
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(401);
            expect(res.body.error).to.equal("Unauthorized");
            expect(res.body.message).to.equal("Unauthenticated User");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 403 Forbidden if a request is already approved", function (done) {
      const tempAuthToken = generateAuthToken({ userId: testUserId1 });
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest1.id}?dev=true`)
        .set("cookie", `${cookieName}=${tempAuthToken}`)
        .send(updateImpersonationRequestApproved)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal("Forbidden");
          expect(res.body.message).to.equal(REQUEST_ALREADY_APPROVED);
          done();
        });
    });

    it("should return 403 Forbidden if a request is already rejected", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${rejectedRequest.id}?dev=true`)
        .set("cookie", `${cookieName}=${authToken}`)
        .send(updateImpersonationRequestRejected)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal("Forbidden");
          expect(res.body.message).to.equal(REQUEST_ALREADY_REJECTED);
          done();
        });
    });

    it("should return 400 if status is not provided", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest1.id}?dev=true`)
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ status: "" })
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal(`status must be APPROVED or REJECTED,"status" is not allowed to be empty`);
          done();
        });
    });

    it("should return 400 if status is not APPROVED/REJECTED", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest1.id}?dev=true`)
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ status: "ACTIVE" })
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal(`status must be APPROVED or REJECTED`);
          done();
        });
    });

    it("should return 500 if Firestore fails during updateImpersonationRequest (service catch block)", function (done) {
      const tempAuthToken = generateAuthToken({ userId: testUserId4 });
      sinon.stub(impersonationModel, "updateImpersonationRequest").throws(new Error("Firestore error"));
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest3.id}?dev=true`)
        .set("cookie", `${cookieName}=${tempAuthToken}`)
        .send({ status: "APPROVED" })
        .end(function (err, res) {
          expect(res).to.have.status(500);
          expect(res.body.message).to.equal("An internal server error occurred");
          sinon.restore();
          done();
        });
    });

    it("should throw 403 Forbidden if unauthorized user tries to update the request", function (done) {
      chai
        .request(app)
        .patch(`/impersonation/requests/${impersonationRequest3.id}?dev=true`)
        .send({ status: "APPROVED" })
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal("Forbidden");
          expect(res.body.message).to.equal(UNAUTHORIZED_TO_UPDATE_REQUEST);
          done();
        });
    });
  });
});