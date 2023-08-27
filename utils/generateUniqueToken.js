const crypto = require("crypto");

export const generateUniqueToken = async () => {
  const uuidToken = crypto.randomUUID();
  const randomNumber = Math.floor(Math.random() * 1000000);
  const generationTime = Date.now();
  const encoder = new TextEncoder();
  const encodedString = encoder.encode(uuidToken + randomNumber + generationTime);
  const hash = await crypto.subtle.digest("SHA-256", encodedString);
  const token = [...new Uint8Array(hash)].map((x) => x.toString(16).padStart(2, "0")).join("");
  return token;
};
