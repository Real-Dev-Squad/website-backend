const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const arts = require("../../models/arts");
const cleanDb = require("../utils/cleanDb");

// Import fixtures
const artData = require("../fixtures/arts/arts")();

const config = require("config");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Arts", function () {
  let jwt;
  let userid;

  beforeEach(async function () {
    const userId = await addUser();
    userid = userId;
    jwt = authService.generateAuthToken({ userId });
    await arts.addArt(artData[0], userId);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /arts/user/add", function () {
    it("Should add the art in system", function (done) {
      chai
        .request(app)
        .post("/arts/user/add")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(artData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Art successfully added!");

          return done();
        });
    });
    it("Should return 401, for Unauthenticated User", function (done) {
      chai
        .request(app)
        .post("/arts/user/add")
        .send(artData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("GET /arts", function () {
    it("Should get all the arts in system", function (done) {
      chai
        .request(app)
        .get("/arts")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Arts returned successfully!");
          expect(res.body.arts).to.be.a("array");
          expect(res.body.arts[0]).to.be.a("object");
          expect(res.body.arts[0].title).to.equal(artData[0].title);

          return done();
        });
    });
  });

  describe("GET /arts/user/:userId", function () {
    it("Should get the art from firestore", function (done) {
      chai
        .request(app)
        .get(`/arts/user/${userid}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.arts).to.be.an("Array").with.lengthOf(1);
          expect(res.body.message).to.equal(`User Arts of userId ${userid} returned successfully`);
          return done();
        });
    });
  });

  describe("GET /arts/user/self", function () {
    it("Should get all the arts of the user", function (done) {
      chai
        .request(app)
        .get("/arts/user/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User arts returned successfully!");
          expect(res.body.arts).to.be.a("array");
          expect(res.body.arts[0]).to.be.a("object");
          expect(res.body.arts[0].title).to.equal(artData[0].title);

          return done();
        });
    });
    it("Should return 401, for Unauthenticated User", function (done) {
      chai
        .request(app)
        .get("/arts/user/self")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });
});
