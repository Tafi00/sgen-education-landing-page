/**
 * Engine luận sim phong thủy cho số điện thoại Việt Nam.
 *
 * Input: {@link SimInput} gồm số điện thoại (bắt buộc) và thông tin ngày giờ
 * sinh (tuỳ chọn).
 * Output: {@link SimReport} tổng hợp quẻ Kinh Dịch, ngũ hành dãy số, âm dương
 * và phần đối chiếu bản mệnh.
 *
 * Toàn bộ phép tính là hàm thuần và tất định: cùng input luôn cho cùng output,
 * không dùng số ngẫu nhiên hay thời gian hiện tại. Kết quả mang tính tham khảo
 * theo các khung lý số phổ biến, không phải kết luận khoa học.
 */
import {
  ELEMENTS,
  TRIGRAMS,
  getBaziSupportProfile,
  getFourPillars,
  getHexagram,
  isValidDateString,
  isValidTimeString,
  type ElementName,
} from "../menh-thu/metaphysics";
import type { SimInput, SimMethodResult, SimReport, SimVerdict } from "./types";
import { detectCarrier, normalizePhone } from "./carriers";

/** Ngũ hành quy cho từng chữ số theo bảng Lạc Thư/Hà Đồ. 0 không gán ngũ hành. */
const ELEMENT_BY_DIGIT: Record<string, ElementName | null> = {
  "0": null,
  "1": "Thủy",
  "2": "Thổ",
  "3": "Mộc",
  "4": "Mộc",
  "5": "Thổ",
  "6": "Kim",
  "7": "Kim",
  "8": "Thổ",
  "9": "Hỏa",
};

/** Từ khoá quẻ được xem là thuận lợi khi chấm điểm khối Kinh Dịch. */
const FAVORABLE_KEYWORDS: Record<string, true> = {
  "Khởi tạo": true, "Tiếp nhận": true, "Khai trí": true, "Kỷ luật": true, "Liên kết": true, "Hanh thông": true,
  "Đồng lòng": true, "Sung túc": true, "Khiêm nhường": true, "Hứng khởi": true, "Tùy thời": true, "Sửa cũ": true,
  "Tiến gần": true, "Quyết đoán": true, "Trở về": true, "Chân thành": true, "Nuôi sức lớn": true, "Dưỡng nuôi": true,
  "Sáng rõ": true, "Cảm ứng": true, "Bền lâu": true, "Sức mạnh": true, "Thăng tiến": true, "Giữ sáng": true,
  "Nề nếp": true, "Tháo gỡ": true, "Tăng ích": true, "Quyết mở": true, "Gặp gỡ": true, "Tụ hội": true, "Đi lên": true,
  "Nguồn sống": true, "Đổi mới": true, "Chuyển hóa": true, "Tĩnh chỉ": true, "Tiến dần": true, "Thịnh mãn": true,
  "Thuận nhập": true, "Hòa duyệt": true, "Thành tín": true, "Đã xong": true,
};

/** Từ khoá quẻ được xem là cần thận trọng khi chấm điểm khối Kinh Dịch. */
const CAUTION_KEYWORDS: Record<string, true> = {
  "Gian nan ban đầu": true, "Chờ đúng lúc": true, "Tranh chấp": true, "Tích lũy nhỏ": true, "Thận trọng": true,
  "Bế tắc": true, "Quan sát": true, "Bóc tách": true, "Gánh nặng": true, "Hiểm sâu": true, "Lùi đúng lúc": true,
  "Khác biệt": true, "Trở ngại": true, "Giảm bớt": true, "Khốn khó": true, "Chấn động": true, "Duyên lệch": true,
  "Lữ hành": true, "Phân tán": true, "Việc nhỏ": true, "Chưa xong": true,
};

/** Từ điển dân gian tự định nghĩa cho các cặp/cụm số thường được nhắc tới. */
const FOLK_TOKENS: ReadonlyArray<{ token: string; label: string; bonus: number }> = [
  { token: "68", label: "lộc phát (68)", bonus: 8 },
  { token: "86", label: "phát lộc (86)", bonus: 8 },
  { token: "39", label: "thần tài nhỏ (39)", bonus: 8 },
  { token: "79", label: "thần tài lớn (79)", bonus: 8 },
  { token: "38", label: "ông địa nhỏ (38)", bonus: 6 },
  { token: "78", label: "ông địa lớn (78)", bonus: 6 },
  { token: "8888", label: "tứ quý 8", bonus: 12 },
  { token: "6666", label: "tứ quý 6", bonus: 10 },
  { token: "9999", label: "tứ quý 9", bonus: 10 },
  { token: "1111", label: "tứ quý 1", bonus: 8 },
  { token: "123", label: "số tiến 123", bonus: 8 },
  { token: "234", label: "số tiến 234", bonus: 6 },
  { token: "567", label: "số tiến 567", bonus: 8 },
  { token: "789", label: "số tiến 789", bonus: 8 },
];

/** Kẹp điểm về khoảng 0–100 và làm tròn về số nguyên. */
function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Xếp hạng sắc thái theo ngưỡng điểm dùng chung cho mọi khối. */
function toneFromScore(score: number): SimVerdict {
  if (score >= 70) return "good";
  if (score >= 50) return "neutral";
  if (score >= 35) return "warn";
  return "bad";
}

/** Quy 6 chữ số cuối thành 6 hào (7 dương / 8 âm), hào 1 ở vị trí thấp nhất. */
function digitsToLines(phone: string): number[] {
  return phone
    .slice(-6)
    .split("")
    .map(Number)
    .reverse()
    .map((digit) => (digit % 2 === 0 ? 8 : 7));
}

/** Đổi 3 hào thành khoá nhị phân để tra bát quái trong bảng TRIGRAMS. */
function trigramOf(lines: number[]) {
  const key = lines.map((value) => (value === 7 ? "1" : "0")).join("");
  return TRIGRAMS.find((item) => item.key === key);
}

/** Đếm số lần xuất hiện của từng chữ số trong dãy số điện thoại. */
function countDigits(phone: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const char of phone) counts[char] = (counts[char] ?? 0) + 1;
  return counts;
}

/** Chấm điểm khối ngũ hành: càng nhiều hành hiện diện càng thuận, vượng quá thì trừ. */
function scoreElements(
  counts: Record<ElementName, number>,
  dominantCount: number,
  presentCount: number,
): number {
  const breadth = presentCount * 12;
  const overload = Math.max(0, dominantCount - 3) * 10;
  return clamp(30 + breadth - overload);
}

/** Biện luận dân gian trên dãy số đã chuẩn hoá. */
function analyzeFolk(phone: string) {
  const digits = phone.split("").map(Number);
  const pairs: string[] = [];
  for (let i = 0; i < digits.length - 1; i += 1) {
    if (digits[i] === digits[i + 1]) pairs.push(`${digits[i]}${digits[i + 1]}`);
  }

  let hasRun = false;
  for (let i = 0; i < digits.length - 2; i += 1) {
    const step = digits[i + 1] - digits[i];
    const next = digits[i + 2] - digits[i + 1];
    if ((step === 1 && next === 1) || (step === -1 && next === -1)) hasRun = true;
  }

  const reversed = [...digits].reverse().join("");
  const isPalindrome = phone === reversed;
  const lastSix = phone.slice(-6);
  const isLastSixPalindrome = lastSix === [...lastSix].reverse().join("");

  const hits = FOLK_TOKENS.filter((item) => phone.includes(item.token));

  let score = 48 + pairs.length * 6;
  if (hasRun) score += 10;
  if (isPalindrome) score += 10;
  else if (isLastSixPalindrome) score += 6;
  for (const hit of hits) score += hit.bonus;

  return { score: clamp(score), pairs, hasRun, isPalindrome, isLastSixPalindrome, hits };
}

/** Đối chiếu dãy số với Nhật chủ nếu có ngày sinh hợp lệ. */
function analyzePersonal(
  input: SimInput,
  digitCounts: Record<string, number>,
): SimReport["personalFit"] {
  if (!input.birthDate || !isValidDateString(input.birthDate)) return null;
  const time = input.birthTime ?? "12:00";
  if (!isValidTimeString(time)) return null;

  try {
    const pillars = getFourPillars(input.birthDate, time).pillars;
    const profile = getBaziSupportProfile(pillars);
    const supportElements = Array.from(new Set([profile.usefulElement, profile.joyElement]));
    const supportSet = new Set<ElementName>([...supportElements, profile.dayElement]);

    let matched = 0;
    for (const [digit, count] of Object.entries(digitCounts)) {
      const element = ELEMENT_BY_DIGIT[digit];
      if (element && supportSet.has(element)) matched += count;
    }
    const matchScore = clamp((matched / 10) * 100);

    return {
      supportElements,
      matchScore,
      tone: toneFromScore(matchScore),
      note: `Đối chiếu với Nhật chủ ${profile.dayElement} (${profile.status}): nhóm hỗ trợ gồm ${supportElements.join(", ")} và chính hành ngày. Tỷ lệ chữ số thuộc nhóm này là ${matched}/10.`,
    };
  } catch {
    return null;
  }
}

/**
 * Luận sim phong thủy theo số điện thoại.
 *
 * @param input Số điện thoại (bắt buộc) và ngày/giờ sinh (tuỳ chọn cho phần bản mệnh).
 * @returns Báo cáo tất định gồm quẻ Kinh Dịch, ngũ hành, âm dương, các khối điểm và ghi chú.
 * @throws Error khi số điện thoại không hợp lệ (lỗi tiếng Việt từ `normalizePhone`).
 */
export function analyzeSim(input: SimInput): SimReport {
  const phone = normalizePhone(input.phone);
  const carrier = detectCarrier(phone);

  const lines = digitsToLines(phone);
  const primary = getHexagram(lines);
  const mutualLines = [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
  const mutual = getHexagram(mutualLines);
  const lowerTrigram = trigramOf(lines.slice(0, 3));
  const upperTrigram = trigramOf(lines.slice(3, 6));

  // --- Ngũ hành ---------------------------------------------------------
  const digitCounts = countDigits(phone);
  const counts: Record<ElementName, number> = { Mộc: 0, Hỏa: 0, Thổ: 0, Kim: 0, Thủy: 0 };
  for (const [digit, count] of Object.entries(digitCounts)) {
    const element = ELEMENT_BY_DIGIT[digit];
    if (element) counts[element] += count;
  }
  const ranked = ELEMENTS.map((element) => ({ element, count: counts[element] }));
  const maxCount = Math.max(...ranked.map((item) => item.count));
  const dominant = ranked.find((item) => item.count === maxCount)?.element ?? "Mộc";
  const missing = ranked.filter((item) => item.count === 0).map((item) => item.element);
  const presentCount = ranked.filter((item) => item.count > 0).length;
  const lastDigit = phone[phone.length - 1];
  const lastDigitElement = ELEMENT_BY_DIGIT[lastDigit];

  // --- Âm dương ---------------------------------------------------------
  let yin = 0;
  let yang = 0;
  for (const digit of phone) {
    if (Number(digit) % 2 === 0) yin += 1;
    else yang += 1;
  }
  const balanced = Math.abs(yin - yang) <= 1;

  const personalFit = analyzePersonal(input, digitCounts);

  // --- Các khối phương pháp --------------------------------------------
  const ichingScore = (() => {
    const yangCount = lines.filter((value) => value === 7).length;
    const balanceBonus = (3 - Math.abs(yangCount - 3)) * 6;
    const bias =
      (FAVORABLE_KEYWORDS[primary.primary.keyword] ? 1 : CAUTION_KEYWORDS[primary.primary.keyword] ? -1 : 0) +
      (FAVORABLE_KEYWORDS[mutual.primary.keyword] ? 1 : CAUTION_KEYWORDS[mutual.primary.keyword] ? -1 : 0);
    return clamp(62 + balanceBonus + bias * 7);
  })();

  const elementScore = scoreElements(counts, maxCount, presentCount);
  const yinYangScore = clamp(balanced ? 88 + (yin === yang ? 12 : 0) : 88 - (Math.abs(yin - yang) - 1) * 12);
  const folk = analyzeFolk(phone);

  const methods: SimMethodResult[] = [
    {
      key: "iching",
      name: "Quẻ Kinh Dịch",
      score: ichingScore,
      tone: toneFromScore(ichingScore),
      summary: `Quẻ chủ ${primary.primary.name} (${primary.primary.keyword}) chuyển sang quẻ hỗ ${mutual.primary.name} (${mutual.primary.keyword}); dãy số tĩnh nên không có hào động.`,
      bullets: [
        `Quẻ chủ ${primary.primary.name}: ${primary.primary.message}`,
        `Quẻ hỗ ${mutual.primary.name}: ${mutual.primary.message}`,
        `Quẻ biến ${primary.changed.name}: cùng quẻ chủ vì không có hào động, dùng để đối chiếu xu thế ổn định.`,
        `Hạ quái ${lowerTrigram?.name ?? "?"} (${lowerTrigram?.nature ?? "?"}), thượng quái ${upperTrigram?.name ?? "?"} (${upperTrigram?.nature ?? "?"}).`,
      ],
    },
    {
      key: "element",
      name: "Ngũ hành dãy số",
      score: elementScore,
      tone: toneFromScore(elementScore),
      summary: `Hành vượng là ${dominant}; ${missing.length > 0 ? `các hành khuyết gồm ${missing.join(", ")}` : "năm hành đều hiện diện trong dãy số"}.`,
      bullets: [
        `Số lần quy đổi: ${ranked.map((item) => `${item.element} ${item.count}`).join(", ")}.`,
        `Hành vượng: ${dominant} (${maxCount}/10 chữ số quy đổi).`,
        missing.length > 0 ? `Hành khuyết: ${missing.join(", ")}.` : "Không có hành nào khuyết hoàn toàn.",
        lastDigitElement
          ? `Chữ số cuối ${lastDigit} thuộc hành ${lastDigitElement}.`
          : `Chữ số cuối là 0 nên không gán ngũ hành.`,
      ],
    },
    {
      key: "yin-yang",
      name: "Âm dương cân bằng",
      score: yinYangScore,
      tone: toneFromScore(yinYangScore),
      summary: balanced
        ? `Dãy số cân bằng âm dương với ${yin} chữ số chẵn và ${yang} chữ số lẻ.`
        : `Dãy số lệch âm dương với ${yin} chữ số chẵn và ${yang} chữ số lẻ.`,
      bullets: [
        `Chẵn (âm): ${yin}/10; lẻ (dương): ${yang}/10.`,
        `Độ lệch âm dương: ${Math.abs(yin - yang)}; ngưỡng cân bằng là lệch không quá 1.`,
        `Quy ước: chữ số chẵn tính là âm, chữ số lẻ tính là dương.`,
      ],
    },
    {
      key: "folk",
      name: "Quan niệm dân gian",
      score: folk.score,
      tone: toneFromScore(folk.score),
      summary: `Dãy số ${
        folk.pairs.length > 0 || folk.hasRun || folk.hits.length > 0
          ? "có một số điểm được dân gian ưa chuộng"
          : "không nổi bật theo lớp quan niệm dân gian"
      }.`,
      bullets: [
        folk.pairs.length > 0
          ? `Cặp số lặp liền kề: ${folk.pairs.join(", ")}.`
          : "Không có cặp số lặp liền kề.",
        folk.hasRun ? "Có cụm số tiến hoặc lùi liên tiếp 3 chữ số." : "Không có cụm số tiến/lùi liên tiếp.",
        folk.isPalindrome
          ? "Toàn bộ dãy số đối xứng (palindrome)."
          : folk.isLastSixPalindrome
            ? "Sáu chữ số cuối đối xứng."
            : "Dãy số không đối xứng.",
        folk.hits.length > 0
          ? `Cụm số theo từ điển tham khảo: ${folk.hits.map((item) => item.label).join(", ")}.`
          : "Không khớp cụm số nào trong từ điển tham khảo.",
        "Đây là lớp quan niệm dân gian tham khảo, không phải căn cứ lý số.",
      ],
    },
  ];

  if (personalFit) {
    methods.push({
      key: "personal",
      name: "Đối chiếu bản mệnh",
      score: personalFit.matchScore,
      tone: personalFit.tone,
      summary: `Tỷ lệ chữ số thuộc nhóm hỗ trợ cho Nhật chủ đạt ${personalFit.matchScore}/100.`,
      bullets: [
        `Nhóm hỗ trợ: ${personalFit.supportElements.join(", ")}.`,
        `Tỷ lệ chữ số hỗ trợ: ${personalFit.matchScore}/100 (tính trên 10 chữ số).`,
        personalFit.note,
      ],
    });
  }

  // --- Tổng hợp ---------------------------------------------------------
  const weights: Record<string, number> = { iching: 0.3, element: 0.25, "yin-yang": 0.15, folk: 0.1, personal: 0.2 };
  const weightSum = methods.reduce((total, method) => total + weights[method.key], 0);
  const overallScore = clamp(
    methods.reduce((total, method) => total + method.score * weights[method.key], 0) / weightSum,
  );
  const tone = toneFromScore(overallScore);

  const sorted = [...methods].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const head =
    tone === "good"
      ? "Tổng thể dãy số được đánh giá thuận theo các khung luận phổ biến."
      : tone === "neutral"
        ? "Tổng thể dãy số ở mức trung tính, có điểm thuận nhưng chưa nổi bật."
        : tone === "warn"
          ? "Tổng thể dãy số ở mức cần thận trọng theo các khung luận phổ biến."
          : "Tổng thể dãy số ít tương hợp theo các khung luận phổ biến.";
  const detail =
    methods.length > 1
      ? `Điểm mạnh nằm ở khối ${best.name} (${best.score}/100); khối ${weakest.name} (${weakest.score}/100) là phần cần lưu ý nhất.`
      : `Điểm tổng hợp dựa trên khối ${best.name} (${best.score}/100).`;
  const overallSummary = `${head} ${detail} Kết quả chỉ mang tính tham khảo, không phải căn cứ khoa học hay quyết định.`;

  const notes = [
    "Quy tắc quy đổi hào: lấy sáu chữ số cuối của số điện thoại và đọc từ phải sang trái; hào 1 ứng với chữ số cuối cùng (vị trí thấp nhất), chữ số chẵn quy thành hào âm (8), chữ số lẻ quy thành hào dương (7). Dãy số tĩnh nên không có hào động.",
    "Quẻ hỗ được ghép từ hào 2–3–4 làm hạ quái và hào 3–4–5 làm thượng quái; quẻ biến trùng quẻ chủ vì không có hào động.",
    "Số 0 không được gán ngũ hành theo bảng Lạc Thư/Hà Đồ dùng ở đây; đây là điểm gây tranh luận giữa các trường phái, nên 0 chỉ được tính trong phần âm dương.",
    `Nhà mạng nhận diện theo bảng đầu số hiện hành: ${carrier}.`,
    "Mỗi trường phái luận giải một khác nhau trên cùng một dãy số; kết quả chỉ mang tính tham khảo và không hứa hẹn về y khoa, tài chính hay vận mệnh.",
  ];

  return {
    phone,
    carrier,
    overallScore,
    tone,
    overallSummary,
    hexagram: {
      lines,
      primary: primary.primary.name,
      mutual: mutual.primary.name,
      changing: primary.changed.name,
      changingLine: 0,
      movingLines: [],
    },
    elements: { counts, dominant, missing, lastDigitElement },
    yinYang: {
      yin,
      yang,
      balanced,
      note: `Chẵn ${yin} – lẻ ${yang}; ${balanced ? "xem là cân bằng" : "chênh lệch đáng kể"} theo ngưỡng lệch tối đa 1.`,
    },
    personalFit,
    methods,
    notes,
  };
}
