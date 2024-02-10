import { Response } from "express";
import * as admin from "firebase-admin";

export type AnswerBody = {
  id: string;
  eventId: string;
  answeredBy: string;
  answer: string;
  questionId: string;
};

export type AnswerStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AnswerFieldsToUpdate = {
  status?: AnswerStatus;
  reviewed_by: string;
};

export type Answer = {
  id: string;
  reviewed_by: string | null;
  event_id: string;
  answer: string;
  updated_at: admin.firestore.Timestamp;
  answered_by: string;
  created_at: admin.firestore.Timestamp;
  question_id: string;
  status: AnswerStatus;
};

export type AnswerQueryFields = {
  status: AnswerStatus;
  questionId: string;
  eventId: string;
};

export type AnswerClient = {
  id: string;
  res: Response;
  status?: string;
};
