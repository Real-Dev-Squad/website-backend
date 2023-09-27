import { generateAuthToken } from "../services/authService";

export const generateUniqueToken = (userId) => {
  const token = generateAuthToken({ userId });
  return token;
};
