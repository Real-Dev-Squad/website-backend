export const ACCESS_LEVEL = {
  PUBLIC: "public",
  INTERNAL: "internal",
  PRIVATE: "private",
  CONFIDENTIAL: "confidential",
};

export const ROLE_LEVEL = {
  private: ["super_user"],
  internal: ["super_user", "cloudfare_worker"],
  confidential: ["super_user"],
};

export const KEYS_NOT_ALLOWED = {
  public: ["email", "phone", "chaincode"],
  internal: ["phone", "chaincode"],
  private: ["chaincode"],
  confidential: [],
};

