import jwt from "jsonwebtoken";
const externalServicePublicKey: jwt.Secret = config.get("externalServices.EXTERNAL_SERVICE_PUBLIC_KEY");

export const verifyAuthToken = async (token: string) => {
  try {
    const isValid = jwt.verify(token, externalServicePublicKey, {
      algorithms: ["RS256"],
    });

    return isValid;
  } catch (error) {
    return false;
  }
};
