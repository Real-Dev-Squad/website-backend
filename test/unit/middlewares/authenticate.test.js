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
      cookies: {},
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
      req.cookies[config.get("userToken.cookieName")] = "validToken";
      const user = { id: "user123", roles: { restricted: false } };

      Sinon.stub(authService, "verifyAuthToken").returns({ userId: user.id });
      Sinon.stub(dataAccess, "retrieveUsers").resolves({ user });

      await authMiddleware(req, res, nextSpy);

      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should deny restricted user access for non-GET requests", async function () {
      req.cookies[config.get("userToken.cookieName")] = "validToken";
      req.method = "POST";
      const user = { id: "user123", roles: { restricted: true } };

      Sinon.stub(authService, "verifyAuthToken").returns({ userId: user.id });
      Sinon.stub(dataAccess, "retrieveUsers").resolves({ user });

      await authMiddleware(req, res, nextSpy);

      expect(res.boom.forbidden.calledOnce).to.equal(true);
      expect(nextSpy.called).to.equal(false);
    });

    it("should deny access with invalid token", async function () {
      req.cookies[config.get("userToken.cookieName")] = "invalidToken";

      Sinon.stub(authService, "verifyAuthToken").throws(new Error("Invalid token"));

      await authMiddleware(req, res, nextSpy);

      expect(res.boom.unauthorized.calledOnce).to.equal(true);
      expect(nextSpy.called).to.equal(false);
    });
  });

  describe("Error Handling", function () {
    it("should deny access when token is missing in production", async function () {
      process.env.NODE_ENV = "production";
      await authMiddleware(req, res, nextSpy);

      expect(res.boom.unauthorized.calledOnce).to.equal(true);
      expect(nextSpy.called).to.equal(false);
    });

    it("should handle unexpected errors gracefully", async function () {
      req.cookies[config.get("userToken.cookieName")] = "validToken";

      Sinon.stub(authService, "verifyAuthToken").throws(new Error("Unexpected error"));

      await authMiddleware(req, res, nextSpy);

      expect(res.boom.unauthorized.calledOnce).to.equal(true);
      expect(nextSpy.called).to.equal(false);
    });
  });
});
