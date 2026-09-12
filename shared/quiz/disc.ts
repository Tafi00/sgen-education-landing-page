import { DISC_KEYS, type DiscGroupAnswer, type DiscKey, type DiscKeyMap, type DiscResult, type DiscScore } from "./types";

/** Một phương án trong bộ đề DISC, kèm nhóm tính cách dùng để chấm điểm (phía server giữ). */
export type DiscContentOption = { id: string; label: string; dimension: DiscKey };

/** Một nhóm câu hỏi DISC gồm nhiều phương án thuộc các nhóm D/I/S/C. */
export type DiscContentItem = { id: string; order: number; text: string; options: DiscContentOption[] };

/** Toàn bộ bộ đề DISC đọc từ JSON nội dung. */
export type DiscContentSet = { key: "disc"; title: string; instructions: string; items: DiscContentItem[] };

/** Nội dung mô tả một tổ hợp kết quả DISC (primary + secondary). */
export type DiscResultContent = {
  code: string;
  title: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  careers: string[];
  growth: string[];
  teaming: string[];
};

/** Giới hạn giá trị trong khoảng 0–100. */
function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/**
 * Chấm điểm DISC từ câu trả lời và bảng đáp án.
 *
 * Input:
 * - `answers`: mỗi phần tử là một nhóm đã trả lời, gồm `itemId` và optionId của lựa chọn
 *   "most" (giống nhất) và "least" (ít giống nhất). Có thể thiếu một trong hai.
 * - `key`: bảng ánh xạ do server dựng (client không nhận), mỗi nhóm cho biết optionId nào
 *   thuộc nhóm D/I/S/C nào.
 *
 * Quy tắc chấm:
 * - "most" cộng +2 điểm cho nhóm của phương án; "least" trừ −1 điểm cho nhóm của phương án.
 * - Bỏ qua câu trả lời thiếu hoặc có itemId/optionId không khớp `key`.
 * - Gọi N = số nhóm thực tế của `key` (N > 0). Điểm thô `raw` được chuẩn hoá về thang 0–100
 *   theo công thức từng đoạn, đảm bảo raw = 0 ⇒ 50:
 *   - raw < 0: `score = 50 + raw × 50 / N` (raw = −N ⇒ 0);
 *   - raw ≥ 0: `score = 50 + raw × 50 / (2N)` (raw = 2N ⇒ 100).
 *   Nếu N = 0 thì mọi nhóm nhận 50.
 * - `answeredGroups` = số nhóm có ít nhất một lựa chọn hợp lệ.
 *
 * Output: `DiscResult` gồm primary (điểm cao nhất), secondary (cao thứ hai, luôn khác primary),
 * `code` = primary + secondary, điểm của cả 4 nhóm và số nhóm hợp lệ. Khi hoà điểm, thứ tự ưu
 * tiên là D, I, S, C.
 */
export function scoreDisc(answers: DiscGroupAnswer[], key: DiscKeyMap): DiscResult {
  const raw: Record<DiscKey, number> = { D: 0, I: 0, S: 0, C: 0 };
  const optionsByItem = new Map<string, Record<string, DiscKey>>();
  for (const group of key) optionsByItem.set(group.itemId, group.options);

  let answeredGroups = 0;
  for (const answer of answers) {
    const options = optionsByItem.get(answer.itemId);
    if (!options) continue;

    let applied = false;
    const most = answer.most ? options[answer.most] : undefined;
    if (most) {
      raw[most] += 2;
      applied = true;
    }
    const least = answer.least ? options[answer.least] : undefined;
    if (least) {
      raw[least] -= 1;
      applied = true;
    }
    if (applied) answeredGroups += 1;
  }

  const groups = key.length;
  const scores: DiscScore[] = DISC_KEYS.map((dimension) => {
    const value = raw[dimension];
    const score =
      groups <= 0
        ? 50
        : Math.round(value < 0 ? 50 + (value * 50) / groups : 50 + (value * 50) / (2 * groups));
    return { key: dimension, raw: value, score: clampScore(score) };
  });

  const ranked = [...scores].sort(
    (a, b) => b.score - a.score || DISC_KEYS.indexOf(a.key) - DISC_KEYS.indexOf(b.key),
  );
  const primary = ranked[0].key;
  const secondary = ranked[1].key;

  return {
    primary,
    secondary,
    code: `${primary}${secondary}`,
    scores,
    answeredGroups,
  };
}
