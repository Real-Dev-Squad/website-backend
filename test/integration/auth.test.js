const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");
const passport = require("passport");
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const { generateGithubAuthRedirectUrl } = require("..//utils/github");
const { addUserToDBForTest } = require("../../utils/users");
const userData = require("../fixtures/user/user")();

chai.use(chaiHttp);

// Import fixtures
const githubUserInfo = require("../fixtures/auth/githubUserInfo")();

describe("auth", function () {
  afterEach(async function () {
    await cleanDb();

    sinon.restore();
  });

  it("should return github call back URL", async function () {
    const githubOauthURL = generateGithubAuthRedirectUrl({});
    const res = await chai.request(app).get("/auth/github/login").redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(githubOauthURL);
  });

  it("should return github call back URL with redirectUrl", async function () {
    const RDS_MEMBERS_SITE_URL = "https://members.realdevsquad.com";
    const githubOauthURL = generateGithubAuthRedirectUrl({ state: RDS_MEMBERS_SITE_URL });
    const res = await chai
      .request(app)
      .get("/auth/github/login")
      .query({ redirectURL: RDS_MEMBERS_SITE_URL })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(githubOauthURL);
  });

  it("should return github call back URL with redirectUrl for mobile-app", async function () {
    const RDS_MEMBERS_SITE_URL = "https://members.realdevsquad.com";
    const githubOauthURL = generateGithubAuthRedirectUrl({ state: RDS_MEMBERS_SITE_URL });
    const res = await chai
      .request(app)
      .get("/auth/github/login")
      .query({ redirectURL: RDS_MEMBERS_SITE_URL, sourceUtm: "rds-mobile-app" })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(githubOauthURL);
  });
  it("should redirect the user to new sign up flow if they are have incomplete user details true", async function () {
    const redirectURL = "https://my.realdevsquad.com/new-signup";

    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get("/auth/github/callback")
      .query({ code: "codeReturnedByGithub" })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(redirectURL);
  });

  // same data should be return from github and same data should be added there
  it("should redirect the request to the goto page on successful login, if user has incomplete user details false", async function () {
    await addUserToDBForTest(userData[0]);
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get("/auth/github/callback")
      .query({ code: "codeReturnedByGithub", state: rdsUiUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should redirect the request to the redirect URL provided on successful login, if user has incomplete user details false", async function () {
    await addUserToDBForTest(userData[0]);
    const rdsUrl = new URL("https://dashboard.realdevsquad.com").href;
    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get(`/auth/github/callback`)
      .query({ code: "codeReturnedByGithub", state: rdsUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUrl);
  });

  it("should redirect the realdevsquad.com if non RDS URL provided, any url that is other than *.realdevsquad.com is invalid", async function () {
    await addUserToDBForTest(userData[0]);
    const invalidRedirectUrl = new URL("https://google.com").href;
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get(`/auth/github/callback`)
      .query({ code: "codeReturnedByGithub", state: invalidRedirectUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should redirect the realdevsquad.com if invalid redirect URL provided", async function () {
    await addUserToDBForTest(userData[0]);
    const invalidRedirectUrl = "invalidURL";
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get(`/auth/github/callback`)
      .query({ code: "codeReturnedByGithub", state: invalidRedirectUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should send a cookie with JWT in the response", function (done) {
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));

    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    chai
      .request(app)
      .get("/auth/github/callback")
      .query({ code: "codeReturnedByGithub" })
      .redirects(0)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(302);
        // rds-session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VySWQiLCJpYXQiOjE1OTkzOTEzODcsImV4cCI6MTYwMTk4MzM4N30.AljtAmXpZUmErubhSBbA0fQtG9DwH4ci6iroa9z5MBjIPFfQ5FSbaOqU0CQlmgOe-U7XDVPuGBp7GzBzA4yCH7_3PSS9JrHwEVZQQBScTUC-WHDradit5nD1ryKPqJE2WlRO6q0uLOKEukMj-7iPXQ-ykdYwtlokhyJbLVS1S3E; Domain=realdevsquad.com; Path=/; Expires=Tue, 06 Oct 2020 11:23:07 GMT; HttpOnly; Secure
        expect(res.headers["set-cookie"]).to.have.length(1);
        expect(res.headers["set-cookie"][0])
          .to.be.a("string")
          .and.satisfy((msg) => msg.startsWith(config.get("userToken.cookieName")));
        expect(res.headers["set-cookie"][0]).to.include("HttpOnly");
        expect(res.headers["set-cookie"][0]).to.include("Secure");
        expect(res.headers["set-cookie"][0]).to.include(`Domain=${rdsUiUrl.hostname}`);
        expect(res.headers["set-cookie"][0]).to.include("SameSite=Lax");

        return done();
      });
  });

  it("should return 401 if github call fails", function (done) {
    chai
      .request(app)
      .get("/auth/github/callback")
      .query({ code: "codeReturnedByGithub" })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(401);
        expect(res.body).to.be.an("object");
        expect(res.body).to.eql({
          statusCode: 401,
          error: "Unauthorized",
          message: "User cannot be authenticated",
        });

        return done();
      });
  });

  it("Should clear the rds session cookies", function (done) {
    chai
      .request(app)
      .get("/auth/signout")
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(200);
        expect(res.body).to.be.a("object");
        expect(res.body.message).to.equal("Signout successful");
        expect(res.headers["set-cookie"][0]).to.include(`${config.get("userToken.cookieName")}=;`);
        return done();
      });
  });
});
