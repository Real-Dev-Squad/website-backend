const Sinon = require("sinon");
const { expect } = require("chai");
const authMiddleware = require("../../../middlewares/authenticate");
const authService = require("../../../services/authService");
const dataAccess = require("../../../services/dataAccessLayer");
const config = require("config");

describe("Authentication Middleware", function () {
  let req, res, nextSpy;

  beforeEach(function () {
    req = {
      cookies: {
        [config.get("userToken.cookieName")]: "validToken",
      },
      headers: {},
    };
    res = {
      cookie: Sinon.spy(),
      boom: {
        unauthorized: Sinon.spy(),
        forbidden: Sinon.spy(),
      },
    };
    nextSpy = Sinon.spy();
  });

  afterEach(function () {
    Sinon.restore();
  });

  describe("Token Verification", function () {
    it("should allow unrestricted user with valid token", async function () {
      const user = { id: "user123", roles: { restricted: false } };
      const verifyAuthTokenStub = Sinon.stub(authService, "verifyAuthToken").returns({ userId: user.id });
      const retrieveUsersStub = Sinon.stub(dataAccess, "retrieveUsers").resolves({ user });

      await authMiddleware(req, res, nextSpy);

      expect(verifyAuthTokenStub.calledOnce).to.equal(true);
      expect(verifyAuthTokenStub.returnValues[0]).to.deep.equal({ userId: user.id });
      expect(verifyAuthTokenStub.calledWith("validToken")).to.equal(true);

      expect(retrieveUsersStub.calledOnce).to.equal(true);
      const retrievedValue = await retrieveUsersStub.returnValues[0];
      expect(retrievedValue).to.deep.equal({ user });

      expect(nextSpy.calledOnce).to.equal(true);
      expect(res.boom.unauthorized.notCalled).to.equal(true);
      expect(res.boom.forbidden.notCalled).to.equal(true);
    });

    it("should deny restricted user access for non-GET requests", async function () {
      req.method = "POST";
      const user = { id: "user123", roles: { restricted: true } };
      const verifyAuthTokenStub = Sinon.stub(authService, "verifyAuthToken").returns({ userId: user.id });
      const retrieveUsersStub = Sinon.stub(dataAccess, "retrieveUsers").resolves({ user });

      await authMiddleware(req, res, nextSpy);

      expect(verifyAuthTokenStub.calledOnce).to.equal(true);
      expect(verifyAuthTokenStub.returnValues[0]).to.deep.equal({ userId: user.id });
      expect(verifyAuthTokenStub.calledWith("validToken")).to.equal(true);

      expect(retrieveUsersStub.calledOnce).to.equal(true);
      const retrievedValue = await retrieveUsersStub.returnValues[0];
      expect(retrievedValue).to.deep.equal({ user });

      expect(res.boom.forbidden.calledOnce).to.equal(true);
      expect(res.boom.forbidden.firstCall.args[0]).to.equal("You are restricted from performing this action");
      expect(nextSpy.notCalled).to.equal(true);
    });

    it("should deny access with invalid token", async function () {
      req.cookies[config.get("userToken.cookieName")] = "invalidToken";
      const verifyAuthTokenStub = Sinon.stub(authService, "verifyAuthToken").throws(new Error("Invalid token"));

      await authMiddleware(req, res, nextSpy);

      expect(verifyAuthTokenStub.calledOnce).to.equal(true);
      expect(verifyAuthTokenStub.threw()).to.equal(true);
      expect(verifyAuthTokenStub.exceptions[0].message).to.equal("Invalid token");
      expect(verifyAuthTokenStub.calledWith("invalidToken")).to.equal(true);

      expect(res.boom.unauthorized.calledOnce).to.equal(true);
      expect(res.boom.unauthorized.firstCall.args[0]).to.equal("Unauthenticated User");
      expect(nextSpy.notCalled).to.equal(true);
    });
  });

  describe("Error Handling", function () {
    it("should deny access when token is missing in production", async function () {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      await authMiddleware(req, res, nextSpy);

      expect(res.boom.unauthorized.calledOnce).to.equal(true);
      process.env.NODE_ENV = originalEnv;
    });

    it("should handle unexpected errors gracefully", async function () {
      const verifyAuthTokenStub = Sinon.stub(authService, "verifyAuthToken").throws(new Error("Unexpected error"));

      await authMiddleware(req, res, nextSpy);

      expect(verifyAuthTokenStub.calledOnce).to.equal(true);
      expect(verifyAuthTokenStub.threw()).to.equal(true);
      expect(verifyAuthTokenStub.exceptions[0].message).to.equal("Unexpected error");

      expect(res.boom.unauthorized.calledOnce).to.equal(true);
      expect(res.boom.unauthorized.firstCall.args[0]).to.equal("Unauthenticated User");
      expect(nextSpy.notCalled).to.equal(true);
    });
  });

  describe("Impersonation and Refresh Logic", function () {
    it("should allow impersonation and set userData of impersonated user", async function () {
      const user = { id: "user123", roles: { restricted: false } };

      const verifyAuthTokenStub = Sinon.stub(authService, "verifyAuthToken").returns({
        userId: "admin",
        impersonatedUserId: user.id,
      });

      const retrieveUsersStub = Sinon.stub(dataAccess, "retrieveUsers").resolves({ user });

      req.cookies = {
        [config.get("userToken.cookieName")]: "validToken",
      };

      req.method = "GET";
      req.baseUrl = "/impersonation";
      req.path = "/abc123";
      req.query = {};

      await authMiddleware(req, res, nextSpy);

      expect(verifyAuthTokenStub.calledOnce).to.equal(true);
      expect(retrieveUsersStub.calledOnce).to.equal(true);

      expect(req.userData.id).to.equal(user.id);
      expect(req.isImpersonating).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(true);
      expect(res.boom.unauthorized.notCalled).to.equal(true);
      expect(res.boom.forbidden.notCalled).to.equal(true);
    });

    it("should retirct all write/update type requests during impersonation", async function () {
      req.method = "POST";
      req.baseUrl = "/impersonation";
      req.path = "/abc123";
      req.query = {};

      Sinon.stub(authService, "verifyAuthToken").returns({ userId: "admin", impersonatedUserId: "impUser" });
      Sinon.stub(dataAccess, "retrieveUsers").resolves({ user: { id: "impUser", roles: {} } });

      await authMiddleware(req, res, nextSpy);

      expect(req.isImpersonating).to.equal(true);
      expect(res.boom.forbidden.calledOnce).to.equal(true);
      expect(res.boom.forbidden.firstCall.args[0]).to.include("Only viewing is permitted");
    });

    it("should allow PATCH STOP request during impersonation", async function () {
      req.method = "PATCH";
      req.baseUrl = "/impersonation";
      req.path = "/randomId";
      req.query = { action: "STOP" };

      Sinon.stub(authService, "verifyAuthToken").returns({ userId: "admin", impersonatedUserId: "impUser" });
      Sinon.stub(dataAccess, "retrieveUsers").resolves({ user: { id: "impUser", roles: {} } });

      await authMiddleware(req, res, nextSpy);

      expect(req.isImpersonating).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should refresh token if expired and within TTL", async function () {
      const now = Math.floor(Date.now() / 1000);
      req.cookies[config.get("userToken.cookieName")] = "expiredToken";

      Sinon.stub(authService, "verifyAuthToken").throws({ name: "TokenExpiredError" });
      Sinon.stub(authService, "decodeAuthToken").returns({
        userId: "user123",
        impersonatedUserId: "impUserId",
        iat: now - 10,
      });
      Sinon.stub(authService, "generateAuthToken").returns("newToken");
      Sinon.stub(dataAccess, "retrieveUsers").resolves({ user: { id: "user123", roles: {} } });

      await authMiddleware(req, res, nextSpy);

      expect(res.cookie.calledOnce).to.equal(true);
      expect(res.cookie.firstCall.args[1]).to.equal("newToken");
      expect(nextSpy.calledOnce).to.equal(true);
    });
  });
});
