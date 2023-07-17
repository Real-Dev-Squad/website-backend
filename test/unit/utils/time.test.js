const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const timeUtils = require("../../../utils/time");

const timeData = require("../../fixtures/time/time");

describe("time", function () {
  afterEach(async function () {
    await cleanDb();
  });
  describe("convertMinutesToMilliseconds", function () {
    it("should convert and return Minutes in Milliseconds", function () {
      for (const query of timeData.minutesToMilliseconds) {
        const result = timeUtils.convertMinutesToMilliseconds(query.param);
        expect(result).to.be.equal(query.result);
      }
    });
  });

  describe("convertHoursToMilliseconds", function () {
    it("should convert and return Hours in Milliseconds", function () {
      for (const query of timeData.hoursToMilliseconds) {
        const result = timeUtils.convertHoursToMilliseconds(query.param);
        expect(result).to.be.equal(query.result);
      }
    });
  });

  describe("convertDaysToMilliseconds", function () {
    it("should convert and return Days in Milliseconds", function () {
      for (const query of timeData.daysToMilliseconds) {
        const result = timeUtils.convertDaysToMilliseconds(query.param);
        expect(result).to.be.equal(query.result);
      }
    });
  });

  describe("getTimeInSecondAfter", function () {
    it("should return the time in second after duration", function () {
      for (const query of timeData.timeInSecondsAfter) {
        const result = timeUtils.getTimeInSecondAfter(query.param);
        expect(result).to.be.equal(query.result);
      }
    });
    it("should return the current time", function () {
      const currentTime = Date.now();
      sinon.stub(Date, "now").returns(currentTime);
      const result = timeUtils.getTimeInSecondAfter({});

      expect(result).to.be.equal(parseInt(Date.now() / 1000));
      sinon.restore();
    });
  });

  describe("getBeforeHourTime", function () {
    it("should return the time in firestore timestamp before duration", function () {
      for (const query of timeData.timeBeforeHour) {
        const result = timeUtils.getBeforeHourTime(query.param.timestamp, query.param.hours)._seconds;
        expect(result).to.be.equal(query.result);
      }
    });
  });
});
