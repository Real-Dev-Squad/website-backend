import * as admin from "firebase-admin";

export type QuestionBody = {
  id: string;
  question: string;
  createdBy: string;
  eventId: string;
  maxCharacters: number;
};

export type Question = {
  id: string;
  question: string;
  created_by: string;
  event_id: string;
  max_characters: string;
  created_at: admin.firestore.Timestamp;
};
