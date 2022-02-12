const { expect } = require("chai");
const { userHasPermission } = require("../../../middlewares/authorization");

describe("userHasPermission", function () {
  it("user has default role and no required role is provided", function (done) {
    expect(userHasPermission("", { default: true })).to.be.equal(true);
    return done();
  });

  it("user has default role and required role is `appOwner`", function (done) {
    expect(userHasPermission("appOwner", { default: true })).to.be.equal(false);
    return done();
  });

  it("user has app_owner role and required role is `appOwner`", function (done) {
    expect(userHasPermission("appOwner", { app_owner: true })).to.be.equal(true);
    return done();
  });

  it("user has super_user role and required role is `appOwner`", function (done) {
    expect(userHasPermission("appOwner", { super_user: true })).to.be.equal(true);
    return done();
  });

  it("user has app_owner role and required role is `superUser`", function (done) {
    expect(userHasPermission("superUser", { app_owner: true })).to.be.equal(false);
    return done();
  });
});
