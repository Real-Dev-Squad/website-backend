const { expect } = require("chai");
const { ROLES } = require("../../../constants/users");
const { userHasPermission } = require("../../../middlewares/authorizeRoles");

describe("authorizeRoles", function () {
  describe("userHasPermission", function () {
    it("user has no role and required roles is app_owner", function (done) {
      expect(userHasPermission([ROLES.APPOWNER], {})).to.be.equal(false);
      return done();
    });

    it("user has app_owner role and required role is app_owner", function (done) {
      expect(userHasPermission([ROLES.APPOWNER], { app_owner: true })).to.be.equal(true);
      return done();
    });

    it("user has super_user role and required role is app_owner", function (done) {
      expect(userHasPermission([ROLES.APPOWNER], { super_user: true })).to.be.equal(false);
      return done();
    });

    it("user has app_owner role and required role is super_user", function (done) {
      expect(userHasPermission([ROLES.SUPERUSER], { app_owner: true })).to.be.equal(false);
      return done();
    });
  });
});
