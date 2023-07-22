const Sinon = require("sinon");
const { expect } = require("chai");
const { validateMassUpdate } = require("../../../middlewares/validators/userStatus");

describe("Middleware | Validators | massUpdateUserStatus", function () {
  describe("validateMassUpdate", function () {
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("lets the request pass to the next function for a valid query", async function () {
      const res = {};
      const req = {
        body: {
          users: [
            {
              userId: "4kAkRv9TBlOfR6WEUhoQ",
              expectedState: "IDLE",
            },
            {
              userId: "SooJK37gzjIZfFNH0tlL",
              expectedState: "ACTIVE",
            },
          ],
        },
      };
      const nextSpy = Sinon.spy();
      await validateMassUpdate(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("lets throw an error if an empty array is passed.", async function () {
      const badRequestSpy = Sinon.spy();
      const res = {
        boom: {
          badRequest: badRequestSpy,
        },
      };
      const req = {
        body: {
          users: [],
        },
      };
      const nextSpy = Sinon.spy();
      await validateMassUpdate(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(badRequestSpy.callCount).to.be.equal(1);
      expect(nextSpy.callCount).to.be.equal(0);
    });

    it("lets throw an error if an array is passed with invalid values.", async function () {
      const badRequestSpy = Sinon.spy();
      const res = {
        boom: {
          badRequest: badRequestSpy,
        },
      };
      const req = {
        body: {
          users: [123],
        },
      };
      const nextSpy = Sinon.spy();
      await validateMassUpdate(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(badRequestSpy.callCount).to.be.equal(1);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
