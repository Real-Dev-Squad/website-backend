import { Timestamp } from "firebase-admin/firestore";
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
  created_at: Timestamp;
};

export type Client = {
  id: string;
  res: CustomResponse;
};
