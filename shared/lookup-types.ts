export type LookupType = "numerology" | "disc" | "mbti" | "sim" | "batu" | "iching" | "xem-ngay";

export type VerdictTone = "good" | "warn" | "bad" | "neutral";

export type ResultBlock =
  | { kind: "metrics"; heading?: string; items: { label: string; value: string; note?: string }[] }
  | { kind: "text"; heading?: string; paragraphs: string[]; bullets?: string[] }
  | { kind: "score"; heading?: string; items: { label: string; value: number; max?: number; tone?: VerdictTone; note?: string }[] }
  | { kind: "table"; heading?: string; headings: string[]; rows: string[][] }
  | { kind: "cards"; heading?: string; items: { title: string; text: string; tone?: VerdictTone; meta?: string }[] }
  | { kind: "badges"; heading?: string; items: { label: string; tone?: VerdictTone }[] }
  | { kind: "section"; id: string; title: string; description?: string }
  | { kind: "chart3x3"; heading?: string; counts: Record<string, number>; note?: string }
  | {
      kind: "pinnacles";
      heading?: string;
      bases: { label: string; value: string }[];
      pinnacles: { value: string; range?: string }[];
    }
  | { kind: "ikigai"; heading?: string; passion: string[]; mission: string; expertise: string[]; career: string[] };

export type LookupResultPayload = {
  headline: string;
  subhead?: string;
  blocks: ResultBlock[];
  disclaimer?: string;
};

export const LOOKUP_TYPES: LookupType[] = ["numerology", "disc", "mbti", "sim", "batu", "iching", "xem-ngay"];

export const LOOKUP_LABELS: Record<LookupType, string> = {
  numerology: "Tra cứu Thần số học",
  disc: "Trắc nghiệm DISC",
  mbti: "Trắc nghiệm MBTI",
  sim: "Bói sim phong thủy",
  batu: "Phân tích Tứ Trụ Bát Tự",
  iching: "Gieo quẻ Kinh Dịch",
  "xem-ngay": "Xem ngày tốt xấu",
};

export const RESULTS_DISCLAIMER =
  "Kết quả mang tính tham khảo theo hệ phương pháp của SGEN Education, không thay thế tư vấn y tế, pháp lý hoặc tài chính.";
