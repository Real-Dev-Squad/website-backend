const ACCESS_LEVEL = {
  PUBLIC: "public",
  INTERNAL: "internal",
  PRIVATE: "private",
  CONFIDENTIAL: "confidential",
};

const ROLE_LEVEL = {
  private: ["super_user"],
  internal: ["super_user"],
  confidential: ["super_user"],
};

const ROLE_ACCESS = {
  public: ["email", "phone", "chaincode"],
  internal: ["phone", "chaincode"],
  private: ["chaincode"],
  confidential: [],
};

module.exports = { ACCESS_LEVEL, ROLE_ACCESS, ROLE_LEVEL };
