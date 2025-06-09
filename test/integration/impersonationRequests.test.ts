import chai from "chai";
const { expect } = chai;
import chaiHttp from "chai-http";
import _ from "lodash";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
const cookieName = config.get("userToken.cookieName");
import addUser from "../utils/addUser";
import * as requestQuery from "../../models/impersonationRequests";
import * as validationService from "../../services/impersonationRequests";
import { CreateImpersonationRequestBody } from "../../types/impersonationRequest";
import { REQUEST_CREATED_SUCCESSFULLY, REQUEST_STATE } from "../../constants/requests";
import { impersonationRequestsBodyData } from "../fixtures/impersonation-requests/impersonationRequests";

const userData = userDataFixture();
chai.use(chaiHttp);

let testUserId: string;
let testUserId2: string;
let testUserId3: string;
let testSuperUserId: string;
let authToken: string;
let superUserToken: string;
let impersonationRequestBody: CreateImpersonationRequestBody;

describe("Impersonation Requests", () => {
  const requestsEndpoint: string = "/impersonation/requests?dev=true";

  beforeEach(async () => {
    const userIdPromises = [
      addUser(userData[16]),
      addUser(userData[18]),
      addUser(userData[12]),
      addUser(userData[4])
    ];
    const [userId1, userId2, userId3, superUserId] = await Promise.all(userIdPromises);
    testUserId = userId1;
    testUserId2 = userId2;
    testUserId3 = userId3;
    testSuperUserId = superUserId;

    impersonationRequestBody = {
      impersonatedUserId: testUserId,
      reason: "User assistance required for account debugging."
    };

    await requestQuery.createImpersonationRequest({
      ...impersonationRequestsBodyData[0],
      impersonatedUserId: testUserId2,
      userId: superUserId,
    });
    await requestQuery.createImpersonationRequest({
      ...impersonationRequestsBodyData[0],
      impersonatedUserId: testUserId3,
      userId: superUserId,
      status: REQUEST_STATE.APPROVED
    });

    authToken = authService.generateAuthToken({ userId: testUserId });
    superUserToken = authService.generateAuthToken({ userId: testSuperUserId });
  });

  afterEach(async () => {
    sinon.restore();
    await cleanDb();
  });

  describe("POST /impersonation/requests", () => {
    it("should return 501 and 'Feature not implemented' message when dev is false", function (done) {
      chai
        .request(app)
        .post("/impersonation/requests?dev=false")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res.statusCode).to.equal(501);
            expect(res.body.message).to.equal("Feature not implemented");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 501 and 'Feature not implemented' message when dev is missing", function (done) {
      chai
        .request(app)
        .post("/impersonation/requests")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          try {
            expect(res.statusCode).to.equal(501);
            expect(res.body.message).to.equal("Feature not implemented");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should not return 501 and should create a new request if dev is present", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody })
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(201);
            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
            expect(res.body).to.have.property("data");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .send(impersonationRequestBody)
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

    it("should return 401 if user is not a superuser", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${authToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(401);
            expect(res.body.error).to.equal("Unauthorized");
            expect(res.body.message).to.equal("You are not authorized for this action.");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 401 if auth token is invalid", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=invalidToken`)
        .send(impersonationRequestBody)
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

    it("should return 400 if impersonatedUserId is not provided", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(_.omit(impersonationRequestBody, "impersonatedUserId"))
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Bad Request");
            expect(res.body.message).to.equal("impersonatedUserId is required");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 400 if reason is not provided", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(_.omit(impersonationRequestBody, "reason"))
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Bad Request");
            expect(res.body.message).to.equal("reason is required");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 404 if impersonated user does not exist", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody, impersonatedUserId: "nonexistentUserId" })
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(404);
            expect(res.body.error).to.equal("Not Found");
            expect(res.body.message).to.equal("User not found");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 403 Forbidden if an approved impersonation request already exists", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody, impersonatedUserId: testUserId3 })
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(403);
            expect(res.body.error).to.equal("Forbidden");
            expect(res.body.message).to.equal("Please complete impersonation before creating a new request");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 403 Forbidden if a pending impersonation request already exists", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody, impersonatedUserId: testUserId2 })
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(403);
            expect(res.body.error).to.equal("Forbidden");
            expect(res.body.message).to.equal("Request already exists please wait for approval or rejection");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 500 response when creating Impersonation request fails", function (done) {
      sinon.stub(requestQuery, "createImpersonationRequest").throws(new Error("Error while creating request"));

      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal("An internal server error occurred");
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it("should return 500 if an error occurs while validating the request", function (done) {
      sinon.stub(validationService, "createImpersonationRequestService").throws(new Error("Error while creating request"));
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody, impersonatedUserId: testUserId3 })
        .end(function (err, res) {
          if (err) return done(err);
          try {
            expect(res).to.have.status(500);
            expect(res.body.message).to.equal("An internal server error occurred");
            done();
          } catch (e) {
            done(e);
          }
        });
    });
  });
});