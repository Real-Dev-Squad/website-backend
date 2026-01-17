const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");
const passport = require("passport");
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const config = require("config");
const { generateGithubAuthRedirectUrl } = require("..//utils/github");
const { generateGoogleAuthRedirectUrl, stubPassportAuthenticate } = require("..//utils/googleauth");
const { addUserToDBForTest } = require("../../utils/users");
const userData = require("../fixtures/user/user")();

chai.use(chaiHttp);

// Import fixtures
const githubUserInfo = require("../fixtures/auth/githubUserInfo")();
const googleUserInfo = require("../fixtures/auth/googleUserInfo")();

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
    const githubOauthURL = generateGithubAuthRedirectUrl({ state: RDS_MEMBERS_SITE_URL + "/?isMobileApp=true" });
    const res = await chai
      .request(app)
      .get("/auth/github/login")
      .query({ redirectURL: RDS_MEMBERS_SITE_URL, sourceUtm: "rds-mobile-app" })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(githubOauthURL);
  });

  it("should redirect the user to new sign up flow if they are have incomplete user details true", async function () {
    const redirectURL = config.get("services.rdsUi.newSignupUrl");

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

  it("should not redirect the user to new sign up flow if they have incomplete user details true, when redirect URL contains dev=true flag", async function () {
    const redirectURL = "https://www.realdevsquad.com/?dev=true";
    const rdsUiUrl = new URL(redirectURL).href;
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

  it("should send rds-session-v2 in res cookie", async function () {
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));

    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", githubUserInfo[0]);
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get("/auth/github/callback")
      .query({ code: "codeReturnedByGithub", state: rdsUiUrl.href + "?v2=true" })
      .redirects(0);

    expect(res).to.have.status(302);
    // rds-session-v2=token; Domain=realdevsquad.com; Path=/; Expires=Tue, 06 Oct 2020 11:23:07 GMT; HttpOnly; Secure
    expect(res.headers["set-cookie"]).to.have.length(2); /* res has 2 cookies rds-session & rds-session-v2 */
    expect(res.headers["set-cookie"][1])
      .to.be.a("string")
      .and.satisfy((msg) => msg.startsWith(config.get("userToken.cookieV2Name")));
    expect(res.headers["set-cookie"][1]).to.include("HttpOnly");
    expect(res.headers["set-cookie"][1]).to.include("Secure");
    expect(res.headers["set-cookie"][1]).to.include(`Domain=${rdsUiUrl.hostname}`);
    expect(res.headers["set-cookie"][1]).to.include("SameSite=Lax");
  });

  it("should redirect to the correct URL and update user email when GitHub API returns primary email", async function () {
    const rdsUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    const fakeEmails = [
      { primary: true, email: "primary@example.com" },
      { primary: false, email: "secondary@example.com" },
    ];
    const fetchStub = sinon.stub(global, "fetch").resolves(new Response(JSON.stringify(fakeEmails)));

    sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
      callback(null, "accessToken", {
        username: "github-user",
        displayName: "GitHub User",
        _json: { email: null, created_at: "2022-01-01" },
        id: 12345,
      });
      return (req, res, next) => {};
    });

    const res = await chai
      .request(app)
      .get(`/auth/github/callback`)
      .query({ code: "codeReturnedByGithub", state: rdsUrl })
      .redirects(0);
    expect(res).to.have.status(302);

    const fetchArgs = fetchStub.getCall(0).args;
    expect(fetchArgs[0]).to.equal("https://api.github.com/user/emails");
    expect(fetchArgs[1].headers.Authorization).to.equal("token accessToken");
  });

  it("should return google call back URL", async function () {
    const googleOauthURL = generateGoogleAuthRedirectUrl({});
    const res = await chai.request(app).get("/auth/google/login?dev=true").redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(googleOauthURL);
  });

  it("should return google call back URL with redirectUrl", async function () {
    const RDS_MEMBERS_SITE_URL = "https://members.realdevsquad.com";
    const googleOauthURL = generateGoogleAuthRedirectUrl({ state: RDS_MEMBERS_SITE_URL });
    const res = await chai
      .request(app)
      .get("/auth/google/login?dev=true")
      .query({ redirectURL: RDS_MEMBERS_SITE_URL })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(googleOauthURL);
  });

  it("should redirect the google user to new sign up flow if they are have incomplete user details true", async function () {
    const redirectURL = config.get("services.rdsUi.newSignupUrl");
    stubPassportAuthenticate(googleUserInfo[0]);

    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle" })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(redirectURL);
  });

  it("should redirect the google user to the goto page on successful login, if user has incomplete user details false", async function () {
    await addUserToDBForTest(googleUserInfo[1]);
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    stubPassportAuthenticate(googleUserInfo[0]);

    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle", state: rdsUiUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should redirect the google user to the redirect URL provided on successful login, if user has incomplete user details false", async function () {
    await addUserToDBForTest(googleUserInfo[1]);
    const rdsUrl = new URL("https://dashboard.realdevsquad.com").href;
    stubPassportAuthenticate(googleUserInfo[0]);
    const res = await chai
      .request(app)
      .get(`/auth/google/callback`)
      .query({ code: "codeReturnedByGoogle", state: rdsUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUrl);
  });

  it("should redirect the google user to realdevsquad.com if non RDS URL provided, any url that is other than *.realdevsquad.com is invalid", async function () {
    await addUserToDBForTest(googleUserInfo[1]);
    const invalidRedirectUrl = new URL("https://google.com").href;
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    stubPassportAuthenticate(googleUserInfo[0]);

    const res = await chai
      .request(app)
      .get(`/auth/google/callback`)
      .query({ code: "codeReturnedByGoogle", state: invalidRedirectUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should redirect the google user to realdevsquad.com if invalid redirect URL provided", async function () {
    await addUserToDBForTest(googleUserInfo[1]);
    const invalidRedirectUrl = "invalidURL";
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    stubPassportAuthenticate(googleUserInfo[0]);
    const res = await chai
      .request(app)
      .get(`/auth/google/callback`)
      .query({ code: "codeReturnedByGoogle", state: invalidRedirectUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should issue JWT cookie on using google login", function (done) {
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));

    stubPassportAuthenticate(googleUserInfo[0]);

    chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle" })
      .redirects(0)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(302);
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

  it("should return 403 Forbidden if a developer tries to log in using google", async function () {
    await addUserToDBForTest(googleUserInfo[3]);
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    stubPassportAuthenticate(googleUserInfo[2]);

    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle", state: rdsUiUrl })
      .redirects(0);
    expect(res).to.have.status(403);
    const errorMessage = "Google Login is restricted for developers,please use github Login";
    expect(res.body.message).to.equal(errorMessage);
  });

  it("should return 403 Forbidden if a non-developer tries to login using github", async function () {
    await addUserToDBForTest(userData[3]);
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    const userInfoFromGitHub = {
      ...githubUserInfo[0],
      _json: {
        ...githubUserInfo[0]._json,
        email: "abc1@gmail.com",
      },
    };
    stubPassportAuthenticate(userInfoFromGitHub);

    const res = await chai
      .request(app)
      .get("/auth/github/callback")
      .query({ code: "codeReturnedByGithub", state: rdsUiUrl })
      .redirects(0);
    expect(res).to.have.status(403);
    const errorMessage = "Github Login is restricted for non-developers,please use Google Login";
    expect(res.body.message).to.equal(errorMessage);
  });

  it("should log in existing github user with no role and same email via google OAuth", async function () {
    await addUserToDBForTest(userData[1]);
    const newSignupUrl = new URL(config.get("services.rdsUi.newSignupUrl")).href;
    const userInfoFromGoogle = {
      ...googleUserInfo[0],
      emails: [{ value: "abc@gmail.com", verified: true }],
    };
    stubPassportAuthenticate(userInfoFromGoogle);

    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle", state: newSignupUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(newSignupUrl);
  });

  it("should get the verified email and redirect the google user to the goto page on successful login", async function () {
    await addUserToDBForTest(googleUserInfo[1]);
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    const googleUser = {
      ...googleUserInfo[0],
      emails: [
        { value: "test123@example.com", verified: false },
        { value: "test12@gmail.com", verified: true },
      ],
    };
    stubPassportAuthenticate(googleUser);

    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle", state: rdsUiUrl })
      .redirects(0);
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal(rdsUiUrl);
  });

  it("should return 404 if dev feature flag is not enabled", async function () {
    const res = await chai.request(app).get("/auth/google/login");

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal("Route not found");
  });

  it("should return 401 if google email does not exist", async function () {
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    const userInfoWithoutEmail = {
      ...googleUserInfo[0],
      emails: [],
    };

    stubPassportAuthenticate(userInfoWithoutEmail);

    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle", state: rdsUiUrl })
      .redirects(0);

    expect(res).to.have.status(401);
    expect(res.body.message).to.equal("No email found in Google account");
  });

  it("should return 401 if no verified email exists", async function () {
    const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl")).href;
    const userInfoWithUnverifiedEmail = {
      ...googleUserInfo[0],
      emails: [{ value: "test@example.com", verified: false }],
    };
    stubPassportAuthenticate(userInfoWithUnverifiedEmail);
    const res = await chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle", state: rdsUiUrl })
      .redirects(0);

    expect(res).to.have.status(401);
    expect(res.body.message).to.equal("No verified email found in Google account");
  });

  it("should return 401 if google auth call fails", function (done) {
    chai
      .request(app)
      .get("/auth/google/callback")
      .query({ code: "codeReturnedByGoogle" })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(401);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("User cannot be authenticated");

        return done();
      });
  });
});
