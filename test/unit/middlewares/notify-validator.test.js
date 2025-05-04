import { expect } from "chai";
import sinon from "sinon";

import { notifyValidator } from "../../../middlewares/validators/notify.js";

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
    const nextSpy = sinon.spy();
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
    const nextSpy = sinon.spy();
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
    const nextSpy = sinon.spy();
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
    const nextSpy = sinon.spy();
    await notifyValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
