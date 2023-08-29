const Sinon = require("sinon");
const { validateUpdateRoles } = require("../../../middlewares/validators/user");
const { expect } = require("chai");

describe("Test the roles update validator", function () {
  it("Allows the request to pass with member property", async function () {
    const req = {
      body: {
        member: true,
      },
    };
    const res = {};
    const nextSpy = Sinon.spy();
    await validateUpdateRoles(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });

  it("Allows the request to pass with archived property", async function () {
    const req = {
      body: {
        archived: true,
      },
    };
    const res = {};
    const nextSpy = Sinon.spy();
    await validateUpdateRoles(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });

  it("Throws an error if both member and archived properties are present", async function () {
    const req = {
      body: {
        member: true,
        archived: true,
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.stub().returns("Bad Request"),
      },
    };
    const nextSpy = Sinon.spy();
    await validateUpdateRoles(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });

  it("Throws an error if neither member nor archived properties are present", async function () {
    const req = {
      body: {},
    };
    const res = {
      boom: {
        badRequest: Sinon.stub().returns("Bad Request"),
      },
    };
    const nextSpy = Sinon.spy();
    await validateUpdateRoles(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
