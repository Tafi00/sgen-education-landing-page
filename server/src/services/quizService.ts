import { QuizItem, QuizResult, QuizSet } from "../models/index.js";
import { AppError } from "../middleware/errors.js";
import { scoreDisc } from "../../../shared/quiz/disc.js";
import { scoreMbti } from "../../../shared/quiz/mbti.js";
import type { QuizKey, QuizPublicSet, DiscKeyMap } from "../../../shared/quiz/types.js";
import type { MbtiKeyItem } from "../../../shared/quiz/mbti-types.js";
import type { LookupResultPayload } from "../../../shared/lookup-types.js";
import { discPayload, mbtiPayload } from "./lookupResult.js";

const QUIZ_LABEL: Record<QuizKey, string> = { disc: "DISC", mbti: "MBTI" };

async function loadActiveSet(key: QuizKey) {
  const set = await QuizSet.findOne({ key, active: true }).sort({ version: -1 });
  if (!set) throw new AppError(404, `Bộ câu hỏi ${QUIZ_LABEL[key]} chưa được cấu hình.`, "quiz_not_ready");
  const items = await QuizItem.find({ setId: set._id }).sort({ order: 1 }).lean();
  if (!items.length) throw new AppError(404, `Bộ câu hỏi ${QUIZ_LABEL[key]} chưa có câu hỏi nào.`, "quiz_empty");
  return { set, items };
}

/** Bộ câu hỏi gửi ra client: bỏ toàn bộ thông tin chấm điểm (dimension/pole). */
export async function loadPublicQuizSet(key: QuizKey): Promise<QuizPublicSet> {
  const { set, items } = await loadActiveSet(key);
  return {
    key,
    title: set.title,
    instructions: set.instructions,
    scale: set.scale as QuizPublicSet["scale"],
    items: items.map((item) => ({
      id: item.itemId,
      order: item.order,
      text: item.text,
      options: item.options.map((option) => ({ id: option.optionId, label: option.label })),
    })),
  };
}

export type QuizScoreOutcome = { code: string; payload: LookupResultPayload; answered: number };

export async function scoreQuiz(key: QuizKey, answers: Record<string, string>): Promise<QuizScoreOutcome> {
  const { items } = await loadActiveSet(key);
  if (key === "disc") {
    const keyMap: DiscKeyMap = items.map((item) => ({
      itemId: item.itemId,
      options: Object.fromEntries(item.options.map((option) => [option.optionId, option.dimension as "D" | "I" | "S" | "C"])),
    }));
    const groups = items.map((item) => ({
      itemId: item.itemId,
      most: answers[`${item.itemId}.most`],
      least: answers[`${item.itemId}.least`],
    }));
    const result = scoreDisc(groups, keyMap);
    const template = await QuizResult.findOne({ key, code: result.code }).lean();
    return { code: result.code, payload: discPayload(result, template), answered: result.answeredGroups };
  }

  const keyItems: MbtiKeyItem[] = items.map((item) => ({
    id: item.itemId,
    dimension: (item.options[0]?.dimension ?? "EI") as MbtiKeyItem["dimension"],
    options: item.options.map((option) => ({ id: option.optionId, pole: option.pole as MbtiKeyItem["options"][number]["pole"] })),
  }));
  const normalized: Record<string, string> = {};
  for (const [itemId, value] of Object.entries(answers)) {
    const item = items.find((candidate) => candidate.itemId === itemId);
    if (item && item.options.some((option) => option.optionId === value)) normalized[itemId] = value;
  }
  const result = scoreMbti(normalized, keyItems);
  const template = await QuizResult.findOne({ key, code: result.code }).lean();
  return { code: result.code, payload: mbtiPayload(result, template), answered: result.answered };
}
