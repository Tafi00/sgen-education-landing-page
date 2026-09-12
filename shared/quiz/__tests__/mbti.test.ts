import { describe, expect, it } from "vitest";
import mbtiItems from "../content/mbti-items.json";
import mbtiResults from "../content/mbti-results.json";
import { scoreMbti } from "../mbti";
import { MBTI_DIMENSIONS, type MbtiAnswers, type MbtiDimension, type MbtiKeyItem, type MbtiPole } from "../mbti-types";

const keyItems: MbtiKeyItem[] = mbtiItems.items.map((item) => ({
  id: item.id,
  dimension: item.dimension as MbtiDimension,
  options: item.options.map((option) => ({ id: option.id, pole: option.pole as MbtiPole })),
}));

const FIRST_POLE: Record<MbtiDimension, MbtiPole> = { EI: "E", SN: "S", TF: "T", JP: "J" };

/** Trả lời mọi item của một cặp bằng cực `pick` (first hoặc second) của cặp đó. */
function answersForPole(dimension: MbtiDimension, pick: "first" | "second"): MbtiAnswers {
  const entry = MBTI_DIMENSIONS.find((item) => item.dimension === dimension)!;
  const wanted = pick === "first" ? entry.first : entry.second;
  const answers: MbtiAnswers = {};
  for (const item of mbtiItems.items.filter((row) => row.dimension === dimension)) {
    answers[item.id] = item.options.find((option) => option.pole === wanted)!.id;
  }
  return answers;
}

describe("scoreMbti", () => {
  it("tất cả chọn cực first cho code ESTJ, firstPercent 100 và strength 100", () => {
    const answers: MbtiAnswers = {};
    for (const item of mbtiItems.items) {
      answers[item.id] = item.options.find((option) => option.pole === FIRST_POLE[item.dimension as MbtiDimension])!.id;
    }
    const result = scoreMbti(answers, keyItems);
    expect(result.code).toBe("ESTJ");
    expect(result.answered).toBe(48);
    for (const dimension of result.dimensions) {
      expect(dimension.firstPercent).toBe(100);
      expect(dimension.strength).toBe(100);
      expect(dimension.firstCount).toBe(12);
      expect(dimension.secondCount).toBe(0);
    }
  });

  it("tất cả chọn cực second cho code INFP", () => {
    const answers: MbtiAnswers = {};
    for (const item of mbtiItems.items) {
      const dimension = item.dimension as MbtiDimension;
      answers[item.id] = item.options.find((option) => option.pole !== FIRST_POLE[dimension])!.id;
    }
    const result = scoreMbti(answers, keyItems);
    expect(result.code).toBe("INFP");
    for (const dimension of result.dimensions) {
      expect(dimension.firstPercent).toBe(0);
      expect(dimension.strength).toBe(100);
    }
  });

  it("hoà 6-6 lấy cực first với strength 0", () => {
    const answers = answersForPole("EI", "first");
    const ei = mbtiItems.items.filter((item) => item.dimension === "EI");
    for (const item of ei.slice(6)) {
      answers[item.id] = item.options.find((option) => option.pole === "I")!.id;
    }
    const result = scoreMbti(answers, keyItems);
    const eiScore = result.dimensions.find((entry) => entry.dimension === "EI")!;
    expect(eiScore.firstCount).toBe(6);
    expect(eiScore.secondCount).toBe(6);
    expect(eiScore.firstPercent).toBe(50);
    expect(eiScore.strength).toBe(0);
    expect(result.code[0]).toBe("E");
  });

  it("cặp thiếu dữ liệu mặc định cực first và strength 0", () => {
    const result = scoreMbti({}, keyItems);
    expect(result.answered).toBe(0);
    expect(result.code).toBe("ESTJ");
    for (const dimension of result.dimensions) {
      expect(dimension.firstPercent).toBe(50);
      expect(dimension.strength).toBe(0);
    }
  });

  it("bỏ qua đáp án sai id và đếm đúng số câu hợp lệ", () => {
    const answers: MbtiAnswers = {
      "không-tồn-tại": mbtiItems.items[0].options[0].id,
      [mbtiItems.items[0].id]: "option-sai",
      [mbtiItems.items[1].id]: mbtiItems.items[1].options.find((option) => option.pole === FIRST_POLE[mbtiItems.items[1].dimension as MbtiDimension])!.id,
    };
    const result = scoreMbti(answers, keyItems);
    expect(result.answered).toBe(1);
    expect(result.dimensions.every((entry) => entry.firstCount + entry.secondCount <= 1)).toBe(true);
  });

  it("code ghép đúng thứ tự 4 cặp tính cách", () => {
    const answers = answersForPole("TF", "second");
    const result = scoreMbti(answers, keyItems);
    expect(result.dimensions.map((entry) => entry.dimension)).toEqual(MBTI_DIMENSIONS.map((entry) => entry.dimension));
    expect(result.code).toHaveLength(4);
  });
});

describe("mbti-items.json", () => {
  it("có 48 item, 12 item mỗi cặp tính cách", () => {
    expect(mbtiItems.items).toHaveLength(48);
    for (const dimension of ["EI", "SN", "TF", "JP"] as const) {
      expect(mbtiItems.items.filter((item) => item.dimension === dimension)).toHaveLength(12);
    }
  });

  it("mỗi cặp có đúng 6 item đặt cực first ở phương án a và 6 ở phương án b", () => {
    for (const { dimension, first } of MBTI_DIMENSIONS) {
      const items = mbtiItems.items.filter((item) => item.dimension === dimension);
      const firstAtA = items.filter((item) => item.options[0].pole === first).length;
      const firstAtB = items.filter((item) => item.options[1].pole === first).length;
      expect(firstAtA).toBe(6);
      expect(firstAtB).toBe(6);
    }
  });

  it("mỗi item có đúng 2 lựa chọn đối lập thuộc cặp của nó", () => {
    for (const item of mbtiItems.items) {
      expect(item.options).toHaveLength(2);
      expect(new Set(item.options.map((option) => option.pole)).size).toBe(2);
    }
  });
});

describe("mbti-results.json", () => {
  it("phủ đủ 16 mã từ tích Descartes của 4 cặp", () => {
    const cartesian = (["EI", "SN", "TF", "JP"] as const).reduce<string[]>(
      (acc, dimension) => {
        const entry = MBTI_DIMENSIONS.find((item) => item.dimension === dimension)!;
        return acc.length === 0 ? [entry.first, entry.second] : acc.flatMap((prefix) => [prefix + entry.first, prefix + entry.second]);
      },
      [],
    );
    expect(cartesian).toHaveLength(16);
    const codes = mbtiResults.map((entry) => entry.code);
    expect(codes).toHaveLength(16);
    expect(new Set(codes).size).toBe(16);
    expect([...codes].sort()).toEqual([...cartesian].sort());
  });

  it("mỗi kết quả có đầy đủ trường và mảng 4–5 mục", () => {
    for (const entry of mbtiResults) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.summary.length).toBeGreaterThan(0);
      for (const field of ["strengths", "cautions", "careers", "growth", "relationships"] as const) {
        expect(entry[field].length).toBeGreaterThanOrEqual(4);
        expect(entry[field].length).toBeLessThanOrEqual(5);
      }
    }
  });
});
