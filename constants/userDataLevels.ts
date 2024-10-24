const ACCESS_LEVEL = {
  PUBLIC: "public",
  INTERNAL: "internal",
  PRIVATE: "private",
  CONFIDENTIAL: "confidential",
};

const ROLE_LEVEL = {
  private: ["super_user"],
  internal: ["super_user", "cloudfare_worker"],
  confidential: ["super_user"],
};

const KEYS_NOT_ALLOWED = {
  public: ["email", "phone", "chaincode"],
  internal: ["phone", "chaincode"],
  private: ["chaincode"],
  confidential: [],
};

module.exports = { ACCESS_LEVEL, KEYS_NOT_ALLOWED, ROLE_LEVEL };
