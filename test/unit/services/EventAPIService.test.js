/* eslint-disable no-unused-expressions */
const chai = require("chai");
const sinon = require("sinon");
const axios = require("axios");
const sinonChai = require("sinon-chai");
const { API_100MS_BASE_URL } = require("../../../constants/events");
const { EventTokenService } = require("../../../services/EventTokenService");
const { EventAPIService } = require("../../../services/EventAPIService");

const { expect } = chai;
chai.use(sinonChai);

describe("EventAPIService", function () {
  let axiosStub;
  let tokenService;
  let axiosInstance;
  let service;

  beforeEach(function () {
    axiosInstance = {
      get: sinon.stub().resolves({ status: 200, data: {} }),
      post: sinon.stub().resolves({ status: 200, data: {} }),
      interceptors: {
        request: {
          use: sinon.stub(),
        },
        response: {
          use: sinon.stub(),
        },
      },
    };

    axiosStub = sinon.stub(axios, "create").returns(axiosInstance);

    tokenService = new EventTokenService();
    service = new EventAPIService(tokenService);
  });

  afterEach(function () {
    axiosStub.restore();
  });

  describe("Constructor", function () {
    it("should create an Axios instance with the correct baseURL", function () {
      expect(axiosStub).to.have.been.calledWithExactly({
        baseURL: API_100MS_BASE_URL,
        timeout: 3 * 60000,
      });
    });

    it("should configure Axios interceptors", function () {
      expect(axiosInstance.interceptors.request.use).to.have.been.called;
      expect(axiosInstance.interceptors.response.use).to.have.been.called;
    });
  });

  describe("#get", function () {
    it("should make a GET request with the correct path and query parameters", async function () {
      const path = "/events";
      const queryParams = { page: 1, limit: 10 };
      await service.get(path, queryParams);
      expect(axiosInstance.get).to.have.been.calledWith(path, { params: queryParams });
    });

    it("should return the response data", async function () {
      const responseData = { events: [{ id: 1, name: "Event 1" }] };
      axiosInstance.get.resolves({ status: 200, data: responseData });
      const path = "/events";
      const queryParams = { page: 1, limit: 10 };
      const result = await service.get(path, queryParams);
      expect(result).to.deep.equal(responseData);
    });
  });

  describe("#post", function () {
    it("should make a POST request with the correct path and payload", async function () {
      const path = "/events";
      const payload = { name: "Event 1" };
      await service.post(path, payload);
      expect(axiosInstance.post).to.have.been.calledWith(path, payload);
    });

    it("should make a POST request without payload if not provided", async function () {
      const path = "/events";
      await service.post(path);
      expect(axiosInstance.post).to.have.been.calledWith(path, {});
    });

    it("should return the response data", async function () {
      const responseData = { eventId: 1, success: true };
      axiosInstance.post.resolves({ status: 200, data: responseData });
      const path = "/events";
      const payload = { name: "Event 1" };
      const result = await service.post(path, payload);
      expect(result).to.deep.equal(responseData);
    });
  });
});
