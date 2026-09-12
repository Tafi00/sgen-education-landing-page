import discItemsRaw from "./content/disc-items.json";
import discResultsRaw from "./content/disc-results.json";
import mbtiItemsRaw from "./content/mbti-items.json";
import mbtiResultsRaw from "./content/mbti-results.json";

import type { DiscContentSet, DiscResultContent } from "./disc";
import type { MbtiContentSet, MbtiResultContent } from "./mbti";
import type { MbtiKeyItem } from "./mbti-types";
import type { DiscKey, DiscKeyMap, QuizPublicSet } from "./types";

export * from "./types";
export * from "./mbti-types";
export { scoreDisc } from "./disc";
export type { DiscContentItem, DiscContentOption, DiscContentSet, DiscResultContent } from "./disc";
export { scoreMbti } from "./mbti";
export type { MbtiContentItem, MbtiContentOption, MbtiContentSet, MbtiResultContent } from "./mbti";

const discContent = discItemsRaw as DiscContentSet;
const mbtiContent = mbtiItemsRaw as MbtiContentSet;
const discResults = discResultsRaw as DiscResultContent[];
const mbtiResults = mbtiResultsRaw as MbtiResultContent[];

/** Tra cứu nội dung kết quả DISC theo mã (ví dụ "DI"); trả `undefined` nếu không có. */
export function getDiscResult(code: string): DiscResultContent | undefined {
  const normalized = code.trim().toUpperCase();
  return discResults.find((entry) => entry.code === normalized);
}

/** Tra cứu nội dung kết quả MBTI theo mã 4 ký tự (ví dụ "INTJ"); trả `undefined` nếu không có. */
export function getMbtiResult(code: string): MbtiResultContent | undefined {
  const normalized = code.trim().toUpperCase();
  return mbtiResults.find((entry) => entry.code === normalized);
}

/** Bộ câu hỏi DISC gửi cho client: đã loại bỏ thông tin nhóm tính cách của từng phương án. */
export function getDiscQuestionSet(): QuizPublicSet {
  return {
    key: "disc",
    title: discContent.title,
    instructions: discContent.instructions,
    scale: "disc-most-least",
    items: discContent.items.map((item) => ({
      id: item.id,
      order: item.order,
      text: item.text,
      options: item.options.map((option) => ({ id: option.id, label: option.label })),
    })),
  };
}

/** Bộ câu hỏi MBTI gửi cho client: đã loại bỏ thông tin cực tính cách của từng lựa chọn. */
export function getMbtiQuestionSet(): QuizPublicSet {
  return {
    key: "mbti",
    title: mbtiContent.title,
    instructions: mbtiContent.instructions,
    scale: "mbti-two-choice",
    items: mbtiContent.items.map((item) => ({
      id: item.id,
      order: item.order,
      text: item.text,
      options: item.options.map((option) => ({ id: option.id, label: option.label })),
    })),
  };
}

/** Bảng đáp án DISC cho server chấm điểm (optionId -> nhóm D/I/S/C). */
export function getDiscKeyMap(): DiscKeyMap {
  return discContent.items.map((item) => ({
    itemId: item.id,
    options: Object.fromEntries(item.options.map((option) => [option.id, option.dimension as DiscKey])),
  }));
}

/** Danh sách item MBTI kèm cực tính cách cho server chấm điểm. */
export function getMbtiKeyItems(): MbtiKeyItem[] {
  return mbtiContent.items.map((item) => ({
    id: item.id,
    dimension: item.dimension,
    options: item.options.map((option) => ({ id: option.id, pole: option.pole })),
  }));
}
