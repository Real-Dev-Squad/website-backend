import { expect } from "chai";
import sinon from "sinon";

import { createArt } from "../../../middlewares/validators/arts.js";

describe("Test the arts validator", function () {
  it("Allows the request to pass", async function () {
    const req = {
      body: {
        title: "some title",
        price: 100,
        css: "random css",
      },
    };
    const res = {};
    const nextSpy = sinon.spy();
    await createArt(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
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
    await createArt(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
