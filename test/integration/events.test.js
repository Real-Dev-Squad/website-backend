const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const eventData = require("../fixtures/events/events")();
const event1Data = eventData[0];

const userData = require("../fixtures/user/user")();

const eventQuery = require("../../models/events");

const defaultUser = userData[0];

const config = require("config");
const sinon = require("sinon");

const { EventTokenService, EventAPIService } = require("../../services");

const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("events", function () {
  let authToken;
  let userId;

  beforeEach(async function () {
    userId = await addUser(defaultUser);
    authToken = authService.generateAuthToken({ userId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST events - createEvent", function () {
    let service;

    afterEach(function () {
      service.restore();
    });

    it("returns the created room data when the request is successful", function (done) {
      const eventData = {
        name: "TestingEvent",
        description: "Hello world! How are you",
        region: "in",
        userId: userId,
      };

      service = sinon.stub(EventAPIService.prototype, "post").returns(event1Data);

      chai
        .request(app)
        .post("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(eventData)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(201);
          expect(response.body.name).to.equal(event1Data.name);
          expect(response.body.description).to.equal(event1Data.description);
          expect(response.body.region).to.equal(event1Data.region);
          expect(response.body.enabled).to.be.equal(true);

          return done();
        });
    });

    it("returns an error when the request to the API service fails", function (done) {
      service = sinon.stub(EventAPIService.prototype, "post").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .post("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({
          name: "Test Event",
          description: "This is a test event",
          region: "in",
          userId: userId,
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't create event. Please try again later");

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      const eventData = {
        id: "test-room-id",
        name: "Test Room",
        description: "This is a test room",
        region: "in",
        userId: userId,
      };
      chai
        .request(app)
        .post(`/events`)
        .send(eventData)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(401);
          expect(response.body.error).to.be.equal("Unauthorized");
          expect(response.body.message).to.be.equal("Unauthenticated User");

          return done();
        });
    });
  });

  describe("GET /events - getAllEvents", function () {
    let service;

    afterEach(function () {
      service.restore();
    });

    it("should return all events information based on query parameters and enabled as false", function (done) {
      service = sinon.stub(EventAPIService.prototype, "get").returns({ limit: 10, last: "id", data: eventData });

      chai
        .request(app)
        .get("/events?limit=10&enabled=false")
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.have.all.keys("limit", "data", "last");
          if (response.body.data === null) {
            expect(response.body.data).to.be.a("null");
          } else {
            expect(response.body.data).to.be.an("array");
          }

          return done();
        });
    });

    it("should return all events information based on query parameters and enabled as true", function (done) {
      service = sinon.stub(EventAPIService.prototype, "get").returns({ limit: 10, last: "id", data: eventData });

      chai
        .request(app)
        .get("/events?limit=10&enabled=true")
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.have.all.keys("limit", "data", "last");
          expect(response.body.data).to.be.an("array");
          expect(response.body.data.length).to.be.at.most(10);

          return done();
        });
    });

    it("returns an error if there is a problem retrieving events", function (done) {
      service = sinon.stub(EventAPIService.prototype, "get").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .get("/events?limit=10&enabled=true")
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't get events. Please try again later");

          return done();
        });
    });
  });

  describe("POST /events/join - joinEvent", function () {
    let tokenService;

    afterEach(function () {
      tokenService.restore();
    });

    it("should return a token when the request is successful", function (done) {
      const payload = {
        roomId: event1Data.id,
        userId: "5678",
        role: "guest",
      };
      tokenService = sinon.stub(EventTokenService.prototype, "getAuthToken").returns("test-token");

      chai
        .request(app)
        .post("/events/join")
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(201);
          expect(response.body.token).to.be.a("string");
          expect(response.body.message).to.be.a("string");
          expect(response.body.success).to.be.equal(true);

          return done();
        });
    });
  });

  describe("GET /events/:id - getEventById", function () {
    let service;

    afterEach(function () {
      service.restore();
    });

    it("Should return event information if the event exists", function (done) {
      const roomId = event1Data.room_id;
      service = sinon.stub(EventAPIService.prototype, "get").returns(event1Data);
      chai
        .request(app)
        .get(`/events/${roomId}`)
        .send({ isActiveRoom: false })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.id).to.equal(roomId);
          expect(response.body.name).to.be.a("string");

          return done();
        });
    });

    it("Should return 500 if an error occurs while retrieving the room information", function (done) {
      const roomId = "invalid-room-id";
      const mockError = { code: "ERR_BAD_REQUEST", message: "Unable to retrieve event details" };

      service = sinon.stub(EventAPIService.prototype, "get").rejects(mockError);

      chai
        .request(app)
        .get(`/events/${roomId}`)
        .send({ enabled: true })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body).to.be.an("object");
          expect(response.body.error).to.equal(mockError.code);
          expect(response.body.message).to.equal(mockError.message);

          return done();
        });
    });
  });

  describe("PATCH /events - updateEvent", function () {
    let service;

    afterEach(function () {
      service.restore();
      sinon.restore();
    });

    it("returns the enabled event data when the request is successful", function (done) {
      const payload = {
        enabled: true,
      };
      service = sinon.stub(EventAPIService.prototype, "post").returns(payload);
      sinon.stub(eventQuery, "updateEvent").resolves({ ...event1Data, enabled: true });

      chai
        .request(app)
        .patch("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload, id: event1Data.room_id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.message).to.be.a("string");
          expect(response.body.data.enabled).to.equal(true);

          return done();
        });
    });

    it("returns the disabled room data when the request is successful", function (done) {
      const payload = {
        enabled: false,
      };

      service = sinon.stub(EventAPIService.prototype, "post").returns(payload);

      sinon.stub(eventQuery, "updateEvent").resolves({ ...event1Data, enabled: false });

      chai
        .request(app)
        .patch("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload, id: event1Data.room_id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.message).to.be.a("string");
          expect(response.body.data.enabled).to.equal(false);

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .patch(`/events`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(401);
          expect(response.body.error).to.be.equal("Unauthorized");
          expect(response.body.message).to.be.equal("Unauthenticated User");

          return done();
        });
    });
  });

  describe("PATCH /events/end - endActiveEvent", function () {
    let service;

    afterEach(function () {
      service.restore();
      sinon.restore();
    });

    it("returns a success message when the request is successful", function (done) {
      const payload = {
        reason: "Event ended by user",
        lock: true,
      };
      service = sinon.stub(EventAPIService.prototype, "post").returns({ message: "session is ending" });

      sinon.stub(eventQuery, "endActiveEvent").returns({ message: "Event ended successfully." });

      chai
        .request(app)
        .patch("/events/end")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload, id: event1Data.room_id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.message).to.be.a("string");
          expect(response.body.message).to.equal("Event ended successfully.");

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      const id = event1Data.id;
      const payload = {
        eventCode: "test-code",
        role: "moderator",
      };
      chai
        .request(app)
        .post(`/events/${id}/codes`)
        .send({ ...payload })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(401);
          expect(response.body.error).to.be.equal("Unauthorized");
          expect(response.body.message).to.be.equal("Unauthenticated User");

          return done();
        });
    });
  });

  describe("POST /events/:id/codes", function () {
    it("should return bad request if the role is not maven", function (done) {
      const id = event1Data.id;
      const payload = {
        id: "test-id",
        eventCode: "test-code",
        role: "moderator",
      };
      chai
        .request(app)
        .post(`/events/${id}/codes`)
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body.message).to.equal("Currently the room codes feature is only for mavens!");
          expect(response.body.message).to.be.a("string");

          return done();
        });
    });
    it("should return unauthorized error if user is not authenticated", function (done) {
      const id = event1Data.id;
      // const payload = {
      //   id: "test-id",
      //   eventCode: "test-code",
      //   role: "moderator",
      // };
      chai
        .request(app)
        .post(`/events/${id}/codes`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(401);
          expect(response.body.error).to.be.equal("Unauthorized");
          expect(response.body.message).to.be.equal("Unauthenticated User");

          return done();
        });
    });
    // it('should return room code created successfully', function (done) {
    //   const id = event1Data.id;

    //   const payload = {
    //     eventCode: 'test-code', role: 'maven'
    //   }

    //   const demo = {
    //     id: 'test-id',
    //     event_id: event1Data.id,
    //     code: 'test-code',
    //     role: 'maven',
    //   }

    //   const createEventCodeStub = sinon.stub(eventQuery, 'createEventCode');
    //   createEventCodeStub.resolves(demo);

    //   console.log(createEventCodeStub.callCount)

    //   // Stub eventRef.update method for updating event data
    //   const eventRefStub = {
    //     update: sinon.stub().resolves(),
    //   };
    //   console.log(eventRefStub.callCount)

    //   eventRefStub.update({
    //     event_codes: {
    //       by_role: {
    //         mavens: ['test-code'],
    //       },
    //     },
    //   });

    //   // Stub eventModel.doc method to return the eventRefStub
    //   const eventModelStub = {
    //     doc: sinon.stub().returns(eventRefStub),
    //   };

    //   // Replace the original eventModel with the stubbed version
    //   const originalEventModel = eventQuery.eventModel;
    //   eventQuery.eventModel = eventModelStub;
    //   // eventQuery.createEventCode(payload);
    //   chai
    //     .request(app)
    //     .post(`/events/${id}/codes`)
    //     .set("cookie", `${cookieName}=${authToken}`)
    //     .send({ ...payload })
    //     .end((error, response) => {
    //       if (error) {
    //         console.log({ error })
    //         return done(error);
    //       }
    //       expect(response).to.have.status(201);
    //       expect(response.body).to.be.an("object");
    //       expect(response.body.message).to.equal('Event code created succesfully!');
    //       expect(response.body.message).to.be.a("string");
    //       expect(response.body.eventCodeObjectFromDB).to.be.an('object');
    //       // expect(response.body.eventCodeObjectFromDB.id).to.equal('test-id');
    //       expect(response.body.eventCodeObjectFromDB.event_id).to.equal(id);
    //       expect(response.body.eventCodeObjectFromDB.code).to.equal('test-code');
    //       expect(response.body.eventCodeObjectFromDB.role).to.equal('maven');

    //       return done();
    //     });
    //   eventQuery.eventModel = originalEventModel;
    //   createEventCodeStub.restore();
    // })
  });
});
