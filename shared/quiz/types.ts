export type QuizKey = "disc" | "mbti";

export type QuizOptionPublic = { id: string; label: string };
export type QuizItemPublic = { id: string; order: number; text: string; options: QuizOptionPublic[]; groupLabel?: string };

/** Bộ câu hỏi trả về client: không chứa thông tin chấm điểm (dimension/pole). */
export type QuizPublicSet = {
  key: QuizKey;
  title: string;
  instructions: string;
  scale: "disc-most-least" | "mbti-two-choice";
  items: QuizItemPublic[];
};

export type QuizOptionFull = QuizOptionPublic & { dimension?: string; pole?: string };
export type QuizItemFull = { id: string; order: number; text: string; options: QuizOptionFull[] };

/* ------------------------------- DISC ------------------------------- */

export const DISC_KEYS = ["D", "I", "S", "C"] as const;
export type DiscKey = (typeof DISC_KEYS)[number];

export const DISC_LABELS: Record<DiscKey, string> = {
  D: "D — Thống lĩnh (Dominance)",
  I: "I — Ảnh hưởng (Influence)",
  S: "S — Kiên định (Steadiness)",
  C: "C — Tuân thủ (Compliance)",
};

/** Mỗi nhóm: chọn 1 phương án giống nhất (most) và 1 phương án ít giống nhất (least). */
export type DiscGroupAnswer = { itemId: string; most?: string; least?: string };

export type DiscScore = { key: DiscKey; raw: number; score: number };

export type DiscResult = {
  primary: DiscKey;
  secondary: DiscKey;
  code: string;
  scores: DiscScore[];
  answeredGroups: number;
};

export type DiscKeyMap = {
  itemId: string;
  /** optionId -> dimension */
  options: Record<string, DiscKey>;
}[];
