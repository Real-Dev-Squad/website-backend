const { expect } = require("chai");
const {
  ROLES: { APPOWNER, SUPERUSER, MEMBER },
} = require("../../../constants/users");
const { userHasPermission } = require("../../../middlewares/authorizeRoles");

describe("authorizeRoles", function () {
  describe("userHasPermission", function () {
    it("user has no role and required roles is app_owner", function (done) {
      expect(userHasPermission([APPOWNER], {})).to.be.equal(false);
      return done();
    });

    it("user has app_owner role and required role is app_owner", function (done) {
      expect(userHasPermission([APPOWNER], { app_owner: true })).to.be.equal(true);
      return done();
    });

    it("user has super_user role and required role is app_owner", function (done) {
      expect(userHasPermission([APPOWNER], { super_user: true })).to.be.equal(false);
      return done();
    });

    it("user has super_user role and required role is super_user and app_owner", function (done) {
      expect(userHasPermission([SUPERUSER], { app_owner: true, super_user: true })).to.be.equal(true);
      return done();
    });

    it("user has member role set to false and required role is app_owner", function (done) {
      expect(userHasPermission([MEMBER], { member: false })).to.be.equal(false);
      return done();
    });

    it("user has member role set to string and required role is app_owner", function (done) {
      expect(userHasPermission([MEMBER], { member: "random_string" })).to.be.equal(false);
      return done();
    });
  });
});
