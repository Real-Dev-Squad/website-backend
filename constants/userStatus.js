const userState = {
  ACTIVE: "ACTIVE",
  IDLE: "IDLE",
  OOO: "OOO",
  ONBOARDING: "ONBOARDING",
};

const discordNicknameLength = 32;

const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CANCEL_OOO = "cancelOoo";

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = { userState, CANCEL_OOO, month, discordNicknameLength, ONE_DAY_IN_MS };
