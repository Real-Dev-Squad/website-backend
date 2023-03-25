/* eslint-disable no-unused-expressions */
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const isEmpty = require("../../utils/helpers").isEmpty;

let keysSpy;

describe("isEmpty", function () {
  beforeEach(function () {
    keysSpy = sinon.spy(Object, "keys");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should return true for empty string", function () {
    expect(isEmpty("")).to.be.true;
  });

  it("should return true for string with only spaces", function () {
    expect(isEmpty("   ")).to.be.true;
  });

  it("should return false for non-empty string", function () {
    expect(isEmpty("abc")).to.be.false;
  });

  it("should return true for empty object", function () {
    expect(isEmpty({})).to.be.true;
  });

  it("should return false for non-empty object", function () {
    expect(isEmpty({ name: "John", age: 25 })).to.be.false;
  });

  it("should return true for empty array", function () {
    expect(isEmpty([])).to.be.true;
  });

  it("should return false for non-empty array", function () {
    expect(isEmpty([1, 2, 3])).to.be.false;
  });

  it("should return true for null value", function () {
    expect(isEmpty(null)).to.be.true;
  });

  it("should return true for undefined value", function () {
    expect(isEmpty(undefined)).to.be.true;
  });

  it("should return true for NaN value", function () {
    expect(isEmpty(NaN)).to.be.true;
  });

  it("should call Object.keys for object type", function () {
    const obj = { name: "John", age: 25 };
    isEmpty(obj);
    expect(keysSpy.calledWith(obj)).to.be.true;
  });

  it("should not call Object.keys for non-object type", function () {
    isEmpty("");
    isEmpty([]);
    isEmpty(0);
    isEmpty(undefined);
    isEmpty(null);
    isEmpty(NaN);
    expect(keysSpy.called).to.be.false;
  });
});
