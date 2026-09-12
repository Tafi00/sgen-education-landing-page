import { Model, type Doc } from "../db/model.js";

export const LookupReport = new Model<LookupReportDoc>({
  table: "lookup_reports",
  fields: {
    type: { kind: "text" },
    title: { kind: "text" },
    inputs: { kind: "json" },
    result: { kind: "json" },
    memberId: { kind: "uuid" },
    leadId: { kind: "uuid" },
    shareToken: { kind: "text" },
    shareExpiresAt: { kind: "date" },
    source: { kind: "text" },
  },
});

export const QuizSet = new Model<QuizSetDoc>({
  table: "quiz_sets",
  fields: {
    key: { kind: "text" },
    version: { kind: "int" },
    title: { kind: "text" },
    instructions: { kind: "text" },
    scale: { kind: "text" },
    active: { kind: "bool" },
  },
});

export const QuizItem = new Model<QuizItemDoc>({
  table: "quiz_items",
  fields: {
    setId: { kind: "uuid" },
    itemId: { kind: "text" },
    order: { kind: "int" },
    text: { kind: "text" },
    options: { kind: "json" },
  },
});

export const QuizResult = new Model<QuizResultDoc>({
  table: "quiz_results",
  fields: {
    key: { kind: "text" },
    code: { kind: "text" },
    title: { kind: "text" },
    summary: { kind: "text" },
    strengths: { kind: "textarray" },
    cautions: { kind: "textarray" },
    careers: { kind: "textarray" },
    growth: { kind: "textarray" },
    relationships: { kind: "textarray" },
    teaming: { kind: "textarray" },
  },
});

export type LookupReportDoc = Doc & {
  type: string;
  title: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  memberId: string | null;
  leadId: string | null;
  shareToken: string;
  shareExpiresAt: Date | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;
};

export type QuizItemDoc = Doc & {
  setId: string;
  itemId: string;
  order: number;
  text: string;
  options: { optionId: string; label: string; dimension?: string; pole?: string }[];
  createdAt: Date;
  updatedAt: Date;
};

export type QuizResultDoc = Doc & {
  key: "disc" | "mbti";
  code: string;
  title: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  careers: string[];
  growth: string[];
  relationships: string[];
  teaming: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type QuizSetDoc = Doc & {
  key: "disc" | "mbti";
  version: number;
  title: string;
  instructions: string;
  scale: "disc-most-least" | "mbti-two-choice";
  active: boolean;
};
