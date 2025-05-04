import { expect } from "chai";
import sinon from "sinon";

import { createChallenge } from "../../../middlewares/validators/challenges.js";

describe("Middleware | Validators | Challenges", function () {
  describe("create challenge validator", function () {
    it("lets the request pass to next", async function () {
      const req = {
        body: {
          level: "Noob",
          title: "The noob challenge",
          start_date: 1254324345,
          end_date: 354654345,
        },
      };
      const res = {};
      const nextSpy = sinon.spy();
      await createChallenge(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("Stops the propogation of the next", async function () {
      const req = {
        body: {
          level: "Noob",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await createChallenge(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });
});
