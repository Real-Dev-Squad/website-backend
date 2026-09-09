import { Response } from "express";
import { Timestamp } from "firebase-admin/firestore";

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
  updated_at: Timestamp;
  answered_by: string;
  created_at: Timestamp;
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
