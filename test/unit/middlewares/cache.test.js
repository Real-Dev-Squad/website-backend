const sinon = require("sinon");
const { expect } = require("chai");
const { cacheResponse, invalidateCache } = require("../../../utils/cache");

const { dummyResponse } = require("../../fixtures/cache/cache");

const responseBody = JSON.stringify(dummyResponse);

describe("Middleware | Utils | cache", function () {
  afterEach(function () {
    sinon.restore();
  });
  it("should cache the response", function () {
    const cacheTestKey = "__cache__1";

    const request = {
      method: "GET",
      originalUrl: "/test1",
    };

    const response = {
      statusCode: 200,
      send: sinon.spy(),
    };

    const nextSpy = sinon.spy();

    const cacheMiddleware = cacheResponse({ invalidationKey: cacheTestKey });

    cacheMiddleware(request, response, nextSpy);

    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(1);

    cacheMiddleware(request, response, nextSpy);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(2);
  });

  it("should invalidate stale response", function () {
    const cacheTestKey = "__cache__2";

    const request = {
      method: "GET",
      originalUrl: "/test2",
    };
    const response = {
      on: sinon.spy(),
      statusCode: 200,
      send: sinon.spy(),
    };

    const nextSpy = sinon.spy();

    const cacheMiddlewareForCache = cacheResponse({ invalidationKey: cacheTestKey });

    cacheMiddlewareForCache(request, response, nextSpy);

    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(1);

    const cacheMiddlewareForInvalidation = invalidateCache({ invalidationKeys: [cacheTestKey] });

    cacheMiddlewareForInvalidation(request, response, nextSpy);
    response.send(responseBody);

    response.on.withArgs("finish").yield();

    expect(response.on.callCount).to.equal(1);
    expect(nextSpy.callCount).to.equal(2);
    expect(response.send.callCount).to.equal(2);

    cacheMiddlewareForCache(request, response, nextSpy);
    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(3);
    expect(response.send.callCount).to.equal(3);
  });

  it("should not cache the response", function () {
    const cacheTestKey = "__cache__3";
    const request = {
      method: "GET",
      originalUrl: "/test3",
    };

    const response = {
      statusCode: 400,
      send: sinon.spy(),
    };

    const nextSpy = sinon.spy();

    const cacheMiddleware = cacheResponse({ invalidationKey: cacheTestKey });

    cacheMiddleware(request, response, nextSpy);

    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(1);

    cacheMiddleware(request, response, nextSpy);
    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(2);

    expect(response.send.callCount).to.equal(2);
  });

  it("should not invalidate stale the response if theres an error", function () {
    const cacheTestKey = "__cache__4";

    const request = {
      method: "GET",
      originalUrl: "/test4",
    };
    const response = {
      on: sinon.spy(),
      statusCode: 200,
      send: sinon.spy(),
    };

    const nextSpy = sinon.spy();

    const cacheMiddlewareForCache = cacheResponse({ invalidationKey: cacheTestKey });

    cacheMiddlewareForCache(request, response, nextSpy);

    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(1);

    response.statusCode = 400;

    const cacheMiddlewareForInvalidation = invalidateCache({ invalidationKeys: [cacheTestKey] });

    cacheMiddlewareForInvalidation(request, response, nextSpy);
    response.send(responseBody);

    response.on.withArgs("finish").yield();

    expect(response.on.callCount).to.equal(1);
    expect(nextSpy.callCount).to.equal(2);
    expect(response.send.callCount).to.equal(2);

    response.statusCode = 200;
    cacheMiddlewareForCache(request, response, nextSpy);

    expect(nextSpy.callCount).to.equal(2);
    expect(response.send.callCount).to.equal(3);
  });
});
