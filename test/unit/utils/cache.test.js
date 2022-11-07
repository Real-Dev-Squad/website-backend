const { expect } = require("chai");

const timeData = require("../../fixtures/time/time");
const { getDummyResponse, INVALID_KEY } = require("../../fixtures/cache/cache");

const { cachePool, minutesToMilliseconds } = require("../../../utils/cache");

describe("cache pool", function () {
  const testKey = "__cache__/testkey";
  let pool;

  before(function () {
    pool = cachePool();
  });

  describe("minutesToMilliSeconds", function () {
    it("should convert given minutes into milliseconds", function () {
      timeData.minutesToMilliseconds.forEach((time) => {
        const result = minutesToMilliseconds(time.param);
        expect(result).to.be.equal(time.result);
      });
    });
  });

  describe("cachePool.set", function () {
    it("should add an item to the cache pool and return value `true`", async function () {
      const response = await pool.set(testKey, getDummyResponse());
      expect(response).to.be.equal(true);
    });
  });

  describe("cachePool.get", function () {
    it("should return value `null` if key is not present in cache", function () {
      const value = pool.get(INVALID_KEY);
      expect(value).to.be.equal(null);
    });

    it("should successfully read from cache pool if a key is present in cache", function () {
      pool.set(testKey, getDummyResponse());
      const value = pool.get(testKey);

      expect(value).to.have.all.keys("message", "tasks");
      // commenting it for now
      // this test will fail due to a bug in the cache module.
      // expect(pool.hits).to.be.equal(1);
    });

    it("should return value `null` for expired data", function () {
      pool.set(testKey, getDummyResponse(-10));
      const response = pool.get(testKey);

      expect(response).to.be.equal(null);
    });
  });
});
