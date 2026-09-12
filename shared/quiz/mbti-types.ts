export type MbtiDimension = "EI" | "SN" | "TF" | "JP";
export type MbtiPole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export type MbtiAnswers = Record<string, string>;

export type MbtiKeyItem = {
  id: string;
  dimension: MbtiDimension;
  options: { id: string; pole: MbtiPole }[];
};

export type MbtiDimensionScore = {
  dimension: MbtiDimension;
  first: MbtiPole;
  second: MbtiPole;
  firstCount: number;
  secondCount: number;
  /** 0–100: phần trăm nghiêng về cực thứ nhất. */
  firstPercent: number;
  /** 0–100: độ mạnh của xu hướng (khoảng cách tới 50). */
  strength: number;
};

export type MbtiResult = {
  code: string;
  dimensions: MbtiDimensionScore[];
  answered: number;
};

export const MBTI_DIMENSIONS: { dimension: MbtiDimension; first: MbtiPole; second: MbtiPole; label: string }[] = [
  { dimension: "EI", first: "E", second: "I", label: "Xu hướng năng lượng (Hướng ngoại / Hướng nội)" },
  { dimension: "SN", first: "S", second: "N", label: "Cách tiếp nhận thông tin (Giác quan / Trực giác)" },
  { dimension: "TF", first: "T", second: "F", label: "Cách ra quyết định (Lý trí / Cảm xúc)" },
  { dimension: "JP", first: "J", second: "P", label: "Cách tổ chức cuộc sống (Nguyên tắc / Linh hoạt)" },
];
