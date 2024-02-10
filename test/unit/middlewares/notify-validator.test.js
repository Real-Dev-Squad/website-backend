const Sinon = require("sinon");

const { expect } = require("chai");
const { notifyValidator } = require("../../../middlewares/validators/notify");

describe("Test the notify validator", function () {
  it("Allows the request to pass with only user id", async function () {
    const req = {
      body: {
        title: "some title",
        body: "some body",
        userId: "user id",
      },
    };
    const res = {};
    const nextSpy = Sinon.spy();
    await notifyValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });

  it("Allows the request to pass with only role id", async function () {
    const req = {
      body: {
        title: "some title",
        body: "some body",
        groupRoleId: "group role id",
      },
    };
    const res = {};
    const nextSpy = Sinon.spy();
    await notifyValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });
  it("Stops the request if both user and role id are pass", async function () {
    const req = {
      body: {
        title: "some title",
        body: "some body",
        userId: "user id",
        groupRoleId: "some role id",
      },
    };
    const res = {
      boom: {
        badRequest: () => {},
      },
    };
    const nextSpy = Sinon.spy();
    await notifyValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });

  it("Stops the request to propogate to next", async function () {
    const req = {
      body: {
        "": "",
      },
    };
    const res = {
      boom: {
        badRequest: () => {},
      },
    };
    const nextSpy = Sinon.spy();
    await notifyValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
