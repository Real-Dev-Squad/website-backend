import jwt from "jsonwebtoken";
import config from "config";

const externalServicePublicKey = config.get("externalServices.EXTERNAL_SERVICE_PUBLIC_KEY") as string;

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
