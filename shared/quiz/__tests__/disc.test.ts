import { describe, expect, it } from "vitest";
import discItems from "../content/disc-items.json";
import discResults from "../content/disc-results.json";
import { scoreDisc } from "../disc";
import { getDiscKeyMap, getDiscQuestionSet, getDiscResult, getMbtiQuestionSet, getMbtiResult } from "../index";
import { DISC_KEYS, type DiscGroupAnswer, type DiscKey, type DiscKeyMap } from "../types";

const keyMap: DiscKeyMap = discItems.items.map((item) => ({
  itemId: item.id,
  options: Object.fromEntries(item.options.map((option) => [option.id, option.dimension as DiscKey])),
}));

/** Chọn phương án "most" của nhóm `target` (và "least" nếu có) cho mọi nhóm trong đề. */
function answersForMost(target: DiscKey, least?: DiscKey): DiscGroupAnswer[] {
  return discItems.items.map((item) => {
    const most = item.options.find((option) => option.dimension === target)!;
    const leastOption = least ? item.options.find((option) => option.dimension === least) : undefined;
    return { itemId: item.id, most: most.id, least: leastOption?.id };
  });
}

describe("scoreDisc", () => {
  it("cho điểm cao nhất thuộc đúng nhóm khi chọn most đồng loạt", () => {
    const result = scoreDisc(answersForMost("D", "I"), keyMap);
    expect(result.primary).toBe("D");
    expect(result.scores.find((entry) => entry.key === "D")!.score).toBe(100);
    expect(result.code[0]).toBe("D");
    expect(result.answeredGroups).toBe(discItems.items.length);
  });

  it("chuẩn hoá điểm thô 0 về 50 và cận âm nhất về 0", () => {
    const single: DiscGroupAnswer[] = [{ itemId: discItems.items[0].id, most: discItems.items[0].options.find((o) => o.dimension === "D")!.id, least: discItems.items[0].options.find((o) => o.dimension === "I")!.id }];
    const result = scoreDisc(single, keyMap);
    expect(result.scores.find((entry) => entry.key === "S")!.raw).toBe(0);
    expect(result.scores.find((entry) => entry.key === "S")!.score).toBe(50);
    expect(result.scores.find((entry) => entry.key === "I")!.raw).toBe(-1);
    expect(result.scores.find((entry) => entry.key === "I")!.score).toBe(47);

    const allLeastS = scoreDisc(answersForMost("D", "S"), keyMap);
    expect(allLeastS.scores.find((entry) => entry.key === "S")!.score).toBe(0);
  });

  it("hoà điểm thì ưu tiên thứ tự D, I, S, C", () => {
    const half = discItems.items.length / 2;
    const answers: DiscGroupAnswer[] = discItems.items.map((item, index) => {
      const dimension: DiscKey = index < half ? "D" : "I";
      return { itemId: item.id, most: item.options.find((option) => option.dimension === dimension)!.id };
    });
    const result = scoreDisc(answers, keyMap);
    expect(result.scores.find((entry) => entry.key === "D")!.raw).toBe(result.scores.find((entry) => entry.key === "I")!.raw);
    expect(result.primary).toBe("D");
    expect(result.secondary).toBe("I");
    expect(result.code).toBe("DI");
  });

  it("bỏ qua đáp án thiếu, sai itemId và sai optionId", () => {
    const answers: DiscGroupAnswer[] = [
      { itemId: "không-tồn-tại", most: "x", least: "y" },
      { itemId: discItems.items[0].id, most: "option-sai", least: "khác" },
      { itemId: discItems.items[1].id, most: discItems.items[1].options[0].id },
      { itemId: discItems.items[1].id },
    ];
    const result = scoreDisc(answers, keyMap);
    expect(result.answeredGroups).toBe(1);
    expect(result.scores.reduce((sum, entry) => sum + entry.raw, 0)).toBe(2);
  });

  it("trả về đủ 4 nhóm điểm và kết quả ổn định khi không có câu trả lời", () => {
    const result = scoreDisc([], keyMap);
    expect(result.scores.map((entry) => entry.key)).toEqual([...DISC_KEYS]);
    expect(result.answeredGroups).toBe(0);
    expect(result.code).toBe("DI");
    expect(result.scores.every((entry) => entry.score === 50)).toBe(true);
  });
});

describe("disc-items.json", () => {
  it("có 16 nhóm, mỗi nhóm đủ 4 nhóm tính cách", () => {
    expect(discItems.items).toHaveLength(16);
    for (const item of discItems.items) {
      expect(item.options).toHaveLength(4);
      expect([...item.options.map((option) => option.dimension)].sort()).toEqual([...DISC_KEYS].sort());
    }
  });

  it("không phải mọi nhóm đều xếp phương án theo thứ tự D, I, S, C", () => {
    const asDiscOrder = discItems.items.filter((item) =>
      item.options.every((option, index) => option.dimension === DISC_KEYS[index]),
    );
    expect(asDiscOrder.length).toBeLessThan(discItems.items.length);
  });
});

describe("disc-results.json", () => {
  it("phủ đủ 12 tổ hợp primary/secondary không trùng nhau", () => {
    const codes = discResults.map((entry) => entry.code);
    expect(codes).toHaveLength(12);
    expect(new Set(codes).size).toBe(12);
    const expected = DISC_KEYS.flatMap((primary) => DISC_KEYS.filter((secondary) => secondary !== primary).map((secondary) => `${primary}${secondary}`));
    expect([...codes].sort()).toEqual(expected.sort());
  });

  it("mỗi kết quả có đầy đủ trường và mảng 4–5 mục", () => {
    for (const entry of discResults) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.summary.length).toBeGreaterThan(0);
      for (const field of ["strengths", "cautions", "careers", "growth", "teaming"] as const) {
        expect(entry[field].length).toBeGreaterThanOrEqual(4);
        expect(entry[field].length).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe("loaders", () => {
  it("getDiscQuestionSet trả bộ câu hỏi công khai, không lộ nhóm tính cách", () => {
    const set = getDiscQuestionSet();
    expect(set.key).toBe("disc");
    expect(set.scale).toBe("disc-most-least");
    expect(set.items).toHaveLength(16);
    for (const item of set.items) {
      for (const option of item.options) {
        expect(Object.keys(option)).toEqual(["id", "label"]);
      }
    }
  });

  it("getDiscKeyMap dựng đúng bảng đáp án 16 nhóm × 4 phương án", () => {
    const key = getDiscKeyMap();
    expect(key).toHaveLength(16);
    for (const group of key) {
      expect(Object.keys(group.options)).toHaveLength(4);
    }
  });

  it("getDiscResult và getMbtiResult tra cứu không phân biệt hoa thường", () => {
    expect(getDiscResult("di")?.code).toBe("DI");
    expect(getDiscResult("DI")?.title.length).toBeGreaterThan(0);
    expect(getDiscResult("XX")).toBeUndefined();
    expect(getMbtiResult("intj")?.code).toBe("INTJ");
    expect(getMbtiResult("ZZZZ")).toBeUndefined();
  });

  it("getMbtiQuestionSet trả 48 câu, mỗi câu 2 lựa chọn không lộ cực", () => {
    const set = getMbtiQuestionSet();
    expect(set.key).toBe("mbti");
    expect(set.scale).toBe("mbti-two-choice");
    expect(set.items).toHaveLength(48);
    for (const item of set.items) {
      expect(item.options).toHaveLength(2);
      for (const option of item.options) {
        expect(Object.keys(option)).toEqual(["id", "label"]);
      }
    }
  });
});
