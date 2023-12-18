import { applicationPayload, application } from "../types/application";

const getUserApplicationObject = (rawData: applicationPayload, userId: string, createdAt: string): application => {
  const data = {
    userId,
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
    createdAt,
  };
  return data;
};

module.exports = { getUserApplicationObject }