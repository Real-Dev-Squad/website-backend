import chai from "chai";
const Sinon = require("sinon");
const { expect } = chai;
const { authorizeOwnOrSuperUser } = require("../../../middlewares/authorizeOwnOrSuperUser");

describe("authorizeOwnOrSuperUser", function () {
  it("should call next function if user is super user", async function () {
    const req = {
      query: {
        id: "xyz",
      },
      userData: {
        id: "zyx",
        roles: {
          super_user: true,
        },
      },
    };
    const nextSpy = Sinon.spy();

    await authorizeOwnOrSuperUser(req, {}, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });

  it("should call the next function if user is not a super user but the userId in query param is equal to the user's userId", async function () {
    const req = {
      userData: {
        id: "xyz",
        roles: {
          super_user: true,
        },
      },
      query: {
        userId: "xyz",
      },
    };
    const nextSpy = Sinon.spy();

    await authorizeOwnOrSuperUser(req, {}, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });

  it("should not call next if the user is not super user and userId is not equal to userId in the query param", async function () {
    const req = {
      userData: {
        id: "xyz",
        roles: {
          super_user: false,
        },
      },
      query: {
        userId: "fkdsk",
      },
    };
    const res = {
      boom: {
        forbidden: () => {},
      },
    };
    const nextSpy = Sinon.spy();

    await authorizeOwnOrSuperUser(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
