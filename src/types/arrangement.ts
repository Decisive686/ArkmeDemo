import type { RecordSourceConversation } from "@/types/record";

export type ArrangementStatus =
  | "active"
  | "maybeDone"
  | "done"
  | "expired"
  | "archived";

export type ArrangementFocus =
  | "today"
  | "recent"
  | "confirm"
  | "later"
  | "quiet";

export type ArrangementSourceType =
  | "manual"
  | "record"
  | "self"
  | "private"
  | "group"
  | "context";

export type ArrangementExecutionType = "user" | "aiAssist" | "aiAuto";

export type ArrangementSource = {
  type: ArrangementSourceType;
  label: string;
  snippet?: string;
  recordUid?: string;
  conversation?: RecordSourceConversation;
};

export type ArrangementItem = {
  uid: string;
  title: string;
  timeText: string;
  location: string;
  people: string[];
  note: string;
  status: ArrangementStatus;
  focus: ArrangementFocus;
  source: ArrangementSource;
  confidence?: number;
  executionType: ArrangementExecutionType;
  createdAt: number;
  updatedAt: number;
};

export type ArrangementDraft = Omit<
  ArrangementItem,
  "uid" | "createdAt" | "updatedAt"
>;

export type ArrangementApiSettings = {
  mode: "mock" | "openai";
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  aiEnabled: boolean;
  autoCreate: boolean;
};
