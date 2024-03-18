import chai from "chai";
import chaiHttp from "chai-http";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
import addUser from "../utils/addUser";
import { createOooRequests } from "../fixtures/oooRequest/oooRequest";
import { createRequest } from "../../models/requests";
import { addLog } from "../../models/logs";
import { LOG_ACTION, REQUEST_LOG_TYPE } from "../../constants/requests";
const { expect } = chai;
const cookieName = config.get("userToken.cookieName");

const userData = userDataFixture();
chai.use(chaiHttp);

let authToken;
let superUserToken;
let oooRequestData;
describe("/logs", function () {
  beforeEach(async function () {
    const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
    const [userId, superUserId] = await Promise.all(userIdPromises);

    oooRequestData = { ...createOooRequests, requestedBy: userId };
    const requestResult = await createRequest(oooRequestData);
    const requestLog = {
      type: REQUEST_LOG_TYPE.REQUEST_CREATED,
      meta: {
        requestId: requestResult.id,
        action: LOG_ACTION.CREATE,
        createdBy: userId,
        createdAt: Date.now(),
      },
      body: requestResult,
    };
    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    authToken = authService.generateAuthToken({ userId });
    superUserToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /logs", function () {
    it("should return logs of specific type", function (done) {
      chai
        .request(app)
        .get("/logs/REQUEST_CREATED")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("Logs fetched successfully");
          expect(res.body.logs).to.have.lengthOf(1);
          const log = res.body.logs[0];
          expect(log).to.have.property("meta");
          expect(log).to.have.property("body");
          expect(log.type).to.equal("REQUEST_CREATED");
          return done();
        });
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .get("/logs?dev=true")
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });

    it("should return 401 if user is authorized to access the logs", function (done) {
      chai
        .request(app)
        .get("/logs")
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal("Unauthorized");
          expect(res.body.message).to.equal(`You are not authorized for this action.`);
          return done();
        });
    });

    it("should return 400, if user has access and dev flag is not", function (done) {
      chai
        .request(app)
        .get("/logs")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal(`Please use feature flag to make this request!`);
          return done();
        });
    });

    it("should return all Logs", function (done) {
      chai
        .request(app)
        .get("/logs?dev=true")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("All Logs fetched successfully");
          expect(res.body.data).to.lengthOf(1);
          return done();
        });
    });

    it("should return all formatted Logs", function (done) {
      chai
        .request(app)
        .get("/logs?dev=true&format=feed")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("All Logs fetched successfully");
          expect(res.body.data).to.lengthOf(1);
          return done();
        });
    });
  });
});
