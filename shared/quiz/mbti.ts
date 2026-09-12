import {
  MBTI_DIMENSIONS,
  type MbtiAnswers,
  type MbtiDimension,
  type MbtiDimensionScore,
  type MbtiKeyItem,
  type MbtiPole,
  type MbtiResult,
} from "./mbti-types";

/** Một lựa chọn trong bộ đề MBTI, kèm cực tính cách dùng để chấm điểm (phía server giữ). */
export type MbtiContentOption = { id: string; label: string; pole: MbtiPole };

/** Một câu hỏi MBTI gồm 2 lựa chọn đối lập thuộc cùng một cặp tính cách. */
export type MbtiContentItem = { id: string; order: number; text: string; dimension: MbtiDimension; options: MbtiContentOption[] };

/** Toàn bộ bộ đề MBTI đọc từ JSON nội dung. */
export type MbtiContentSet = { key: "mbti"; title: string; instructions: string; items: MbtiContentItem[] };

/** Nội dung mô tả một nhóm tính cách MBTI (4 ký tự). */
export type MbtiResultContent = {
  code: string;
  title: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  careers: string[];
  growth: string[];
  relationships: string[];
};

/**
 * Chấm điểm MBTI từ câu trả lời và danh sách item đã gắn cực.
 *
 * Input:
 * - `answers`: map `itemId -> optionId` người dùng đã chọn.
 * - `items`: mỗi item có `dimension` (EI | SN | TF | JP) và 2 lựa chọn, mỗi lựa chọn gắn một `pole`.
 *
 * Quy tắc chấm:
 * - Đếm số lựa chọn theo từng cực. Bỏ qua đáp án thiếu hoặc optionId không tồn tại.
 * - Với mỗi cặp tính cách, gọi `first`/`second` theo `MBTI_DIMENSIONS`
 *   (EI → E/I, SN → S/N, TF → T/F, JP → J/P).
 *   `firstPercent` = phần trăm lựa chọn nghiêng về cực `first` (làm tròn), `strength` = |firstPercent − 50| × 2 (thang 0–100).
 * - Hoà 6–6 ⇒ `firstPercent` = 50, lấy cực `first` với `strength` = 0.
 * - Cặp không có câu nào được trả lời ⇒ mặc định cực `first`, `firstPercent` = 50, `strength` = 0.
 * - `code` ghép 4 ký tự theo thứ tự E/I, S/N, T/F, J/P; `answered` = số item có đáp án hợp lệ.
 *
 * Output: `MbtiResult` gồm `code`, điểm chi tiết từng cặp (`dimensions`) và số câu đã trả lời.
 */
export function scoreMbti(answers: MbtiAnswers, items: MbtiKeyItem[]): MbtiResult {
  const tally: Record<MbtiPole, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  let answered = 0;

  for (const item of items) {
    const chosen = answers[item.id];
    if (!chosen) continue;
    const option = item.options.find((candidate) => candidate.id === chosen);
    if (!option) continue;
    tally[option.pole] += 1;
    answered += 1;
  }

  const dimensions: MbtiDimensionScore[] = MBTI_DIMENSIONS.map(({ dimension, first, second }) => {
    const firstCount = tally[first];
    const secondCount = tally[second];
    const total = firstCount + secondCount;
    const firstPercent = total === 0 ? 50 : Math.round((firstCount / total) * 100);
    const strength = Math.abs(firstPercent - 50) * 2;
    return { dimension, first, second, firstCount, secondCount, firstPercent, strength };
  });

  const code = dimensions.map((entry) => (entry.firstPercent >= 50 ? entry.first : entry.second)).join("");

  return { code, dimensions, answered };
}
