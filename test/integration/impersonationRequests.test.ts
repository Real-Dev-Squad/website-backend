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
import { REQUEST_CREATED_SUCCESSFULLY, REQUEST_STATE } from "../../constants/requests";
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

    it("should return request by specific ID", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&id=${impersonationRequest1.id}`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("object");
          expect(res.body.data.id).to.equal(impersonationRequest1.id);
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
          expect(res.body.data.every((r: any) => r.userId === testSuperUserId)).to.be.true;
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
          expect(res.body.data.every((r: any) => r.createdFor === userData[19].username)).to.be.true;
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

    it("should return 204 if request with given ID does not exist", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&id=randomId123`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(204);
          expect(res.body).to.deep.equal({});
          done();
        });
    });

    it("should return requests filtered by valid status", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&status=APPROVED`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("array");
          expect(res.body.data.every((r: any) => r.status === "APPROVED")).to.be.true;
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

    it("should return a request filtered by valid id, createdBy and status (done case)", function (done) {
      chai
        .request(app)
        .get(
          `${requestsEndpoint}&id=${impersonationRequest1.id}&createdBy=${impersonationRequest1.createdBy}&status=${impersonationRequest1.status}`
        )
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("object");
          expect(res.body.data.id).to.equal(impersonationRequest1.id);
          expect(res.body.data.createdBy).to.equal(impersonationRequest1.createdBy);
          expect(res.body.data.status).to.equal(impersonationRequest1.status);
          done();
        });
    });

    it("should return the nextPage link when page param is provided", function (done) {
      chai
        .request(app)
        .get(`${requestsEndpoint}&page=1&size=2`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("nextPage");
          expect(res.body.nextPage).to.be.equal("/impersonation/requests?dev=true&size=2&page=2");
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("count").to.equal(2);
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
});