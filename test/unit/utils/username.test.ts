import chai from "chai";
import { formatUsername } from "../../../utils/username";
const { expect } = chai;
const { MAX_USERNAME_LENGTH } = require("../../../constants/users");

describe("formatUsername", function () {
  it("should return a username with the correct format for valid first and last name", function () {
    const firstName = "Vinit";
    const lastName = "Khandal";
    const suffix = 1;

    const result = formatUsername(firstName, lastName, suffix);

    expect(result).to.be.a("string");
    expect(result).to.equal("vinit-khandal-1");
  });

  it("should trim extra spaces from first and last name", function () {
    const firstName = "  Vinit ";
    const lastName = "  Khandal  ";
    const suffix = 2;

    const result = formatUsername(firstName, lastName, suffix);

    expect(result).to.be.a("string");
    expect(result).to.equal("vinit-khandal-2");
  });

  it("should return 'null' for invalid first name containing non-alphabetical characters", function () {
    const firstName = "Vinit123";
    const lastName = "Khandal";
    const suffix = 1;

    const result = formatUsername(firstName, lastName, suffix);

    expect(result).to.equal("null-khandal-1");
  });

  it("should return 'null' for invalid last name containing non-alphabetical characters", function () {
    const firstName = "Vinit";
    const lastName = "Kh@ndal";
    const suffix = 1;

    const result = formatUsername(firstName, lastName, suffix);

    expect(result).to.equal("vinit-null-1");
  });

  it("should truncate the last name to fit within the max length", function () {
    const firstName = "Christopher";
    const lastName = "MontgomeryWellington";
    const suffix = 1;
  
    const result = formatUsername(firstName, lastName, suffix);
  
    expect(result).to.be.a("string");
    expect(result).to.have.lengthOf.at.most(MAX_USERNAME_LENGTH);
  
    const expectedFirstName = "christopher";
    const expectedTruncatedLastName = "montgomerywellingt";
    const expectedSuffix = "-1";
  
    expect(result).to.equal(`${expectedFirstName}-${expectedTruncatedLastName}${expectedSuffix}`);
  });
  
  it("should handle the suffix correctly when the full username exceeds max length", function () {
    const firstName = "ChristopherJonathan";
    const lastName = "MontgomeryWellington";
    const suffix = 99;
  
    const result = formatUsername(firstName, lastName, suffix);
  
    expect(result).to.be.a("string");
    expect(result).to.have.lengthOf.at.most(MAX_USERNAME_LENGTH);
  
    const expectedFirstName = "christopherjonathan";
    const expectedTruncatedLastName = "montgomer";
    const expectedSuffix = "-99";
  
    expect(result).to.equal(`${expectedFirstName}-${expectedTruncatedLastName}${expectedSuffix}`);
  });  

  it("should use only the first part of the first name if it contains multiple words", function () {
    const firstName = "Vinit Kumar";
    const lastName = "Khandal";
    const suffix = 1;
  
    const result = formatUsername(firstName, lastName, suffix);
  
    expect(result).to.equal("vinit-khandal-1");
  });

  it("should use only the last part of the last name if it contains multiple words", function () {
    const firstName = "Vinit";
    const lastName = "Kumar-Khandal";
    const suffix = 1;

    const result = formatUsername(firstName, lastName, suffix);

    expect(result).to.equal("vinit-khandal-1");
  });
  
  it("should return 'null' for an empty first name", function () {
    const firstName = "";
    const lastName = "Khandal";
    const suffix = 1;
  
    const result = formatUsername(firstName, lastName, suffix);
  
    expect(result).to.equal("null-khandal-1");
  });
  
  it("should return 'null' for an empty last name", function () {
    const firstName = "Vinit";
    const lastName = "";
    const suffix = 1;
  
    const result = formatUsername(firstName, lastName, suffix);
  
    expect(result).to.equal("vinit-null-1");
  });  
});
