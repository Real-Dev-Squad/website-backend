import chai from "chai";
const { expect } = chai;
const { getUserApplicationObject } = require("../../../utils/application");

describe("getUserApplicationObject", async function () {
  it("should return application object", function () {
    const rawData = {
      firstName: "vinayak",
      lastName: "trivedi",
      city: "Kanpur",
      state: "UP",
      country: "India",
      college: "Christ Church College",
      skills: "React, NodeJs, Ember",
      introduction: "not needed",
      funFact: "kdfkasdjfkdk",
      forFun: "kfsfakdfjdskfds",
      numberOfHours: 10,
      whyRds: "aise hi",
      foundFrom: "twitter",
    };
    const data = getUserApplicationObject(rawData, "kfjasdkf", "December 13, 2023 at 5:44:59 AM UTC+5:30");

    expect(data).to.be.deep.equal({
      userId: "kfjasdkf",
      biodata: {
        firstName: rawData.firstName,
        lastName: rawData.lastName,
      },
      location: {
        city: rawData.city,
        state: rawData.state,
        country: rawData.country,
      },
      professional: {
        institution: rawData.college,
        skills: rawData.skills,
      },
      intro: {
        introduction: rawData.introduction,
        funFact: rawData.funFact,
        forFun: rawData.forFun,
        whyRds: rawData.whyRds,
        numberOfHours: rawData.numberOfHours,
      },
      foundFrom: rawData.foundFrom,
      status: "pending",
      createdAt: "December 13, 2023 at 5:44:59 AM UTC+5:30",
    });
  });
});
