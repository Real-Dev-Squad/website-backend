import chai from "chai";
import chaiHttp from "chai-http";
import _ from "lodash";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import addUser from "../utils/addUser";
import * as impersonationModel from "../../models/impersonationRequests";
import * as validationService from "../../services/impersonationRequests";
import { CreateImpersonationRequestBody, ImpersonationRequest } from "../../types/impersonationRequest";
import { REQUEST_CREATED_SUCCESSFULLY, REQUEST_DOES_NOT_EXIST, REQUEST_STATE } from "../../constants/requests";
import { impersonationRequestsBodyData } from "../fixtures/impersonation-requests/impersonationRequests";

const { expect } = chai;
const cookieName = config.get("userToken.cookieName");
const userData = userDataFixture();
chai.use(chaiHttp);

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
    [
      testUserId1,
      testUserId2,
      testUserId3,
      testUserId4,
      testUserId5,
      testSuperUserId
    ] = await Promise.all(userIdPromises);

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

    await impersonationModel.createImpersonationRequest({
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
    sinon.restore();
    await cleanDb();
  });

  describe("POST /impersonation/requests", () => {
    it("should return 404 and 'Route not found' message when dev is false", function (done) {
      chai
        .request(app)
        .post("/impersonation/requests?dev=false")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.statusCode).to.equal(404);
          expect(res.body.message).to.equal("Route not found");
          done();
        });
    });

    it("should return 404 and 'Route not found' message when dev is missing", function (done) {
      chai
        .request(app)
        .post("/impersonation/requests")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.statusCode).to.equal(404);
          expect(res.body.message).to.equal("Route not found");
          done();
        });
    });

    it("should create a new request if dev is present", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody })
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          expect(res.body).to.have.property("data");
          done();
        });
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal("Unauthorized");
          expect(res.body.message).to.equal("Unauthenticated User");
          done();
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
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal("Unauthorized");
          expect(res.body.message).to.equal("You are not authorized for this action.");
          done();
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
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal("Unauthorized");
          expect(res.body.message).to.equal("Unauthenticated User");
          done();
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
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal("impersonatedUserId is required");
          done();
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
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal("reason is required");
          done();
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
          expect(res).to.have.status(404);
          expect(res.body.error).to.equal("Not Found");
          expect(res.body.message).to.equal("User not found");
          done();
        });
    });

    it("should return 403 Forbidden if an approved impersonation request already exists and isImpersonationFinished is false", function (done) {
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody, impersonatedUserId: testUserId3 })
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal("Forbidden");
          expect(res.body.message).to.equal("You are not allowed for this Operation at the moment");
          done();
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
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal("Forbidden");
          expect(res.body.message).to.equal("You are not allowed for this Operation at the moment");
          done();
        });
    });

    it("should return 500 response when creating Impersonation request fails", function (done) {
      sinon.stub(impersonationModel, "createImpersonationRequest").throws(new Error("Error while creating request"));

      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(impersonationRequestBody)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.statusCode).to.equal(500);
          expect(res.body.message).to.equal("An internal server error occurred");
          done();
        });
    });

    it("should return 500 if an unexpected error occurs", function (done) {
      sinon.stub(validationService, "createImpersonationRequestService").throws(new Error("Error while creating request"));
      chai
        .request(app)
        .post(requestsEndpoint)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...impersonationRequestBody, impersonatedUserId: testUserId3 })
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(500);
          expect(res.body.message).to.equal("An internal server error occurred");
          done();
        });
    });
  });

  describe("GET /impersonation/requests", function () {
    beforeEach(async () => {
      await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[3],
        impersonatedUserId: testUserId4,
        createdFor: userData[0].username,
        userId: testSuperUserId,
        status: REQUEST_STATE.REJECTED,
        createdBy: userData[4].username
      });

      await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[4],
        impersonatedUserId: testUserId5,
        createdFor: userData[1].username,
        userId: testSuperUserId,
        status: REQUEST_STATE.REJECTED,
        createdBy: userData[4].username
      });
    });

    it("should return 404 and 'Route not found' message when dev is false", function (done) {
      chai
        .request(app)
        .get("/impersonation/requests?dev=false")
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal("Route not found");
            done();
        });
    });

    it("should return 404 and 'Route not found' message when dev is missing", function (done) {
      chai
        .request(app)
        .get("/impersonation/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
            if(err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal("Route not found");
            done();
        });
    });

    it("should return all requests if dev flag is present", function (done) {
      chai
        .request(app)
        .get(requestsEndpoint)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("array");
          expect(res.body.data.length).to.be.equal(4);
          expect(res.body.data[0]).to.include.all.keys(
            "id", "createdBy", "userId", "impersonatedUserId", "createdFor"
          );
          done();
        });
    });


    it("should return all requests created by a specific user", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&createdBy=${userData[4].username}`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("array");
          expect(res.body.data.every((r) => r.userId === testSuperUserId)).to.be.true;
          expect(res.body.data.every((r)=>r.createdBy === userData[4].username)).to.be.true;
          done();
        });
    });

    it("should return all requests created for a specific user", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&createdFor=${userData[19].username}`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("array");
          expect(res.body.data.every((r) => r.createdFor === userData[19].username)).to.be.true;
          expect(res.body.data.length).to.equal(1);
          done();
        });
    });

    it("should return 204 with empty response body when no data found", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&createdBy=testUserRandom`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(204);
          expect(res.body).to.deep.equal({});
          done();
        });
    });

    it("should return requests filtered by status APPROVED", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&status=APPROVED`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("array");
          expect(res.body.data.every((r) => r.status === "APPROVED")).to.be.true;
          done();
        });
    });

    it("should return error if invalid status is passed", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&status=ACTIVE`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal(`"status" must be one of [APPROVED, PENDING, REJECTED]`);
          done();
        });
    });

    it("should return a next link when next param is provided", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&size=2`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("next");
          expect(res.body).to.have.property("prev");
          expect(res.body.prev).to.be.null;
          expect(res.body.next).to.be.not.null;
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("count").to.equal(2);
          done();
        });
    });

    it("should return count property with the number of requests", function (done) {
      chai
        .request(app)
        .get(requestsEndpoint)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("count");
          expect(res.body.count).to.be.a("number");
          expect(res.body.count).to.equal(res.body.data.length);
          done();
        });
    });

    it("should return the next page of results using next cursor", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&size=2`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res1) {
          if (err) return done(err);
          expect(res1).to.have.status(200);
          expect(res1.body).to.have.property("next").is.not.null;
          expect(res1.body).to.have.property("data").is.an("array");
          expect(res1.body.data.length).to.be.at.most(2);

          const nextEndpoint = res1.body.next;

          chai
            .request(app)
            .get(`${nextEndpoint}`)
            .set("cookie", `${cookieName}=${authToken}`)
            .end(function (err2, res2) {
              if (err2) return done(err2);
              expect(res2).to.have.status(200);
              expect(res2.body).to.have.property("data").is.an("array");
              expect(res2.body.data.length).to.be.at.most(2);
              expect(res2.body).to.have.property("prev").is.not.null;
              expect(res2.body.data[0].id).to.not.equal(res1.body.data[0].id);
              done();
            });
        });
    });

    it("should return the previous page of results using prev cursor", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&size=2`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res1) {
          if (err) return done(err);
          const nextEndpoint = res1.body.next;

          chai
            .request(app)
            .get(`${nextEndpoint}`)
            .set("cookie", `${cookieName}=${authToken}`)
            .end(function (err2, res2) {
              if (err2) return done(err2);

              const prevEndpoint = res2.body.prev;
              if (!prevEndpoint) return done();

              chai
                .request(app)
                .get(`${prevEndpoint}`)
                .set("cookie", `${cookieName}=${authToken}`)
                .end(function (err3, res3) {
                  if (err3) return done(err3);
                  expect(res3).to.have.status(200);
                  expect(res3.body).to.have.property("data").is.an("array");
                  expect(res3.body.data[0].id).to.equal(res1.body.data[0].id);
                  done();
                });
            });
        });
    });
  });
  describe("GET /impersonation/requests/:id", function () {
     it("should return 404 and 'Route not found' message when dev is false", function (done) {
      chai
        .request(app)
        .get("/impersonation/requests/randomId?dev=false")
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal("Route not found");
            done();
        });
    });

    it("should return 404 and 'Route not found' message when dev is missing", function (done) {
      chai
        .request(app)
        .get("/impersonation/requests/randomId")
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
            if(err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal("Route not found");
            done();
        });
    });

    it("should return request by specific ID", function (done) {
      chai
        .request(app)
        .get(`/impersonation/requests/${impersonationRequest1.id}?dev=true`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("object");
          expect(res.body.data.id).to.equal(impersonationRequest1.id);
          done();
        });
    });
    
    it("should return 404 and 'Route not found' message when route is not found", function (done) {
      chai
        .request(app)
        .get(`/impersonation/requests/randomId?dev=true`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
            if(err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal(REQUEST_DOES_NOT_EXIST);
            done();
        });
    });

    it("should return 400 and 'Bad Request' message when validator check fails", function (done) {
      chai
        .request(app)
        .get(`/impersonation/requests/4&8828**?dev=true`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
            if(err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal('"id" with value "4&8828**" fails to match the required pattern: /^[a-zA-Z0-9-_]+$/');
            done();
        });
    });

  }) 
});