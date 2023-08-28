const { expect } = require("chai");
const sinon = require("sinon");
const firestore = require("../../../utils/firestore");

const { ROLES } = require("../../../constants/events");
const authorizeEventRoles = require("../../../middlewares/authorizeEventRoles");
const eventModel = firestore.collection("events");

const eventQuery = require("../../../models/events");
const eventDataArray = require("../../fixtures/events/events")();
const eventData = eventDataArray[0];

describe("authorizeEventRoles", function () {
  let req, res, next;

  beforeEach(function () {
    req = {
      body: {},
      params: {},
      userData: {
        roles: {},
      },
    };
    res = {
      boom: {
        unauthorized: sinon.stub(),
        badImplementation: sinon.stub(),
      },
    };
    next = sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should call next if user has valid role and valid body role", async function () {
    req.body.role = ROLES.HOST;
    req.userData.roles = { super_user: true, moderator: true };

    await authorizeEventRoles(["host", "moderator"])(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
  });

  it("should call next if user has valid role and valid body role (MODERATOR)", async function () {
    req.body.role = ROLES.MODERATOR;
    req.userData.roles = { super_user: true, moderator: true };

    await authorizeEventRoles(["host", "moderator"])(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
  });

  it("should call next if user has MAVEN role and allowedEventCodes include eventCode", async function () {
    req.body.role = ROLES.MAVEN;
    req.body.roomId = eventData.room_id;
    req.body.eventCode = "code1";

    const docRef = eventModel.doc(eventData.room_id);
    await docRef.set(eventData);

    await eventQuery.getAllEventCodes(eventData.room_id);

    await authorizeEventRoles(["maven"])(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
  });

  it("should call next if user has GUEST role", async function () {
    req.body.role = ROLES.GUEST;

    await authorizeEventRoles(["guest"])(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
  });

  it("should return unauthorized if user doesn't have required role", async function () {
    req.body.role = ROLES.HOST;
    req.userData.roles = { member: true };
    res.boom.unauthorized.returns("Unauthorized");

    await authorizeEventRoles(["host"])(req, res, next);

    expect(res.boom.unauthorized.calledOnceWith("You are not authorized for this action.")).to.be.equal(true);
    expect(next.called).to.be.equal(false);
  });

  it("should return unauthorized if user has invalid role", async function () {
    req.body.role = "INVALID_ROLE";
    res.boom.unauthorized.returns("Unauthorized");

    await authorizeEventRoles(["host"])(req, res, next);

    expect(res.boom.unauthorized.calledOnceWith("You are not authorized for this action.")).to.be.equal(true);
    expect(next.called).to.be.equal(false);
  });

  it("should return bad implementation if allowedRoles contain invalid role", async function () {
    res.boom.badImplementation.returns("Bad implementation");

    await authorizeEventRoles(["host", "INVALID_ROLE"])(req, res, next);

    expect(res.boom.badImplementation.calledOnceWith("Route authorization failed. Please contact admin")).to.be.equal(
      true
    );
    expect(next.called).to.be.equal(false);
  });
});
