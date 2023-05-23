const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const roomData = require("../fixtures/events/events")();
const room1Data = roomData[0];

const userData = require("../fixtures/user/user")();

const eventQuery = require("../../models/events");

const defaultUser = userData[0];

const config = require("config");
const Sinon = require("sinon");

const { EventTokenService } = require("../../services/EventTokenService");
const { EventAPIService } = require("../../services/EventAPIService");
const cookieName = config.get("userToken.cookieName");

const tokenService = new EventTokenService();
const apiService = new EventAPIService(tokenService);

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

  describe("POST events - createRoom", function () {
    afterEach(function () {
      Sinon.restore();
    });

    it("returns the created room data when the request is successful", function (done) {
      const roomData = {
        name: "TestingEvent",
        description: "Hello world! How are you",
        region: "in",
      };
      Sinon.stub(apiService, "post").resolves(room1Data);
      Sinon.stub(eventQuery, "createRoom").resolves(room1Data);

      chai
        .request(app)
        .post("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(roomData)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(201);
          expect(response.body).to.deep.equal(room1Data);

          return done();
        });
    });

    it("returns an error when the request to the API service fails", function (done) {
      Sinon.stub(apiService, "post").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .post("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({
          name: "Test Room",
          description: "This is a test room",
          region: "in",
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't create room. Please try again later");

          return done();
        });
    });

    it("returns an error when the request to the eventQuery fails", function (done) {
      const roomData = {
        id: "test-room-id",
        name: "Test Room",
        description: "This is a test room",
        region: "in",
      };
      Sinon.stub(apiService, "post").resolves(roomData);
      Sinon.stub(eventQuery, "createRoom").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .post("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(roomData)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't create room. Please try again later");

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .post(`/events`)
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

  describe("GET /events - getAllRooms", function () {
    it("should return all events information based on query parameters and enabled as false", function (done) {
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
      Sinon.stub(apiService, "get").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .get("/events")
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't get events. Please try again later");

          apiService.get.restore();

          return done();
        });
    });
  });

  describe("POST /join - joinRoom", function () {
    afterEach(function () {
      Sinon.restore();
    });

    it("should return a token when the request is successful", function (done) {
      const payload = {
        roomId: room1Data.id,
        userId: "5678",
        role: "guest",
      };
      Sinon.stub(tokenService, "getAuthToken").resolves("test-token");

      chai
        .request(app)
        .post("/events/join")
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.token).to.be.a("string");
          expect(response.body.msg).to.be.a("string");
          expect(response.body.success).to.be.equal(true);

          return done();
        });
    });
  });

  describe("GET /events/:id - getRoomById", function () {
    // TODO: failing
    it("Should return room information if the room exists and is enabled", function (done) {
      const roomId = room1Data.id;
      chai
        .request(app)
        .get(`/events/${roomId}`)
        .send({ isActiveRoom: true })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.id).to.equal(roomId);
          expect(response.body.name).to.be.a("string");
          expect(response.body.session).to.be.a("object");

          return done();
        });
    });

    it("Should return 500 if an error occurs while retrieving the room information", function (done) {
      const roomId = "invalid-room-id";
      const mockError = { code: "ERR_BAD_REQUEST", message: "Unable to retrieve room details" };
      Sinon.stub(apiService, "get").rejects(mockError);

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

          apiService.get.restore();
          return done();
        });
    });
  });

  describe("PUT rooms - updateRoom", function () {
    afterEach(function () {
      Sinon.restore();
    });

    it("returns the enabled room data when the request is successful", function (done) {
      const payload = {
        enabled: true,
      };
      Sinon.stub(apiService, "post").resolves(payload);
      Sinon.stub(eventQuery, "updateRoom").resolves({ ...room1Data, enabled: true });

      chai
        .request(app)
        .put("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload, id: room1Data.room_id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.message).to.be.a("string");
          expect(response.body.data.id).to.equal(room1Data.room_id);
          expect(response.body.data.enabled).to.equal(true);

          return done();
        });
    });

    it("returns the disabled room data when the request is successful", function (done) {
      const payload = {
        enabled: false,
      };
      Sinon.stub(apiService, "post").resolves(payload);
      Sinon.stub(eventQuery, "updateRoom").resolves({ ...room1Data, enabled: false });

      chai
        .request(app)
        .put("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload, id: room1Data.room_id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.message).to.be.a("string");
          expect(response.body.data.id).to.equal(room1Data.room_id);
          expect(response.body.data.enabled).to.equal(false);

          return done();
        });
    });

    it("returns an error when the request to the eventQuery fails", function (done) {
      const payload = {
        enabled: true,
      };

      Sinon.stub(apiService, "post").resolves(payload);
      Sinon.stub(eventQuery, "updateRoom").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .put("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ enabled: true, id: room1Data.id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error.code).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't update room. Please try again later.");

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .put(`/events`)
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

  describe("DELETE / - endActiveRoom", function () {
    afterEach(function () {
      Sinon.restore();
    });

    // TODO: failing
    it("returns a success message when the request is successful", function (done) {
      const payload = {
        reason: "Room ended by user",
        lock: true,
      };
      Sinon.stub(apiService, "post").resolves({});
      Sinon.stub(eventQuery, "endActiveRoom").resolves({});

      chai
        .request(app)
        .delete("/events")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...payload, id: room1Data.id })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body.message).to.be.a("string");
          expect(response.body.message).to.equal("Session is ended.");

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .delete("/events")
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
});
