import * as admin from "firebase-admin";
import { CustomResponse } from "./global";

export type QuestionBody = {
  id: string;
  question: string;
  createdBy: string;
  eventId: string;
  maxCharacters?: number | null;
};

export type Question = {
  id: string;
  question: string;
  created_by: string;
  event_id: string;
  max_characters: string | null;
  created_at: admin.firestore.Timestamp;
};

export type Client = {
  id: string;
  res: CustomResponse;
};
