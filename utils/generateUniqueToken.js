import { generateAuthToken } from "../services/authService";

export const generateUniqueToken = async (userId) => {
  const token = generateAuthToken({ userId });
  return token;
};
