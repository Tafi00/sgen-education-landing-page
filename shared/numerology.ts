const ALPHABET_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const MASTER_VALUES: Record<number, string> = { 11: "11/2", 22: "22/4" };
const EXTENDED_VALUES: Record<number, string> = {
  ...MASTER_VALUES,
  13: "13/4",
  14: "14/5",
  16: "16/7",
  19: "19/1",
};

export type NumerologyMetricKey =
  | "lifePath"
  | "destiny"
  | "soul"
  | "attitude"
  | "personalYear"
  | "peaks"
  | "interaction"
  | "maturity";

export type NumerologyMetric = {
  key: NumerologyMetricKey;
  label: string;
  value: string;
  note: string;
};

export type NumerologyReport = {
  displayName: string;
  birthDateLabel: string;
  coreNumber: number;
  metrics: NumerologyMetric[];
};

/** Một mục chỉ số trong báo cáo đầy đủ; `values` cho chỉ số nhiều số (lặp, nợ nghiệp…). */
export type FullMetric = { key: string; label: string; value: string; values?: string[]; note: string };

export type NumerologySection = { id: string; title: string; metrics: FullMetric[] };

export type PinnacleNode = { value: string; range?: string };

/** Biểu đồ chặng đường đời: 3 gốc (ngày/tháng/năm) + 4 đỉnh kèm khoảng tuổi. */
export type LifePathChart = {
  day: string;
  month: string;
  year: string;
  birthNumber: string;
  pinnacles: PinnacleNode[];
};

export type IkigaiChart = { passion: string[]; mission: string; expertise: string[]; career: string[] };

export type NumerologyFullReport = NumerologyReport & {
  sections: NumerologySection[];
  lifePathChart: LifePathChart;
  ikigai: IkigaiChart;
  birthChart: Record<number, number>;
  nameChart: Record<number, number>;
  commonNameMetrics?: FullMetric[];
};

const NUMBER_MESSAGES: Record<number, string> = {
  1: "Chủ động, độc lập và có năng lượng tiên phong.",
  2: "Tinh tế, giàu khả năng kết nối và hợp tác.",
  3: "Sáng tạo, lạc quan và có thế mạnh biểu đạt.",
  4: "Thực tế, kỷ luật và bền bỉ xây nền tảng.",
  5: "Linh hoạt, yêu tự do và học tốt qua trải nghiệm.",
  6: "Tận tâm, trách nhiệm và hướng về cộng đồng.",
  7: "Sâu sắc, quan sát tốt và luôn tìm kiếm sự thật.",
  8: "Có tư duy quản trị, bản lĩnh và hướng tới thành tựu.",
  9: "Nhân ái, bao dung và mong muốn tạo giá trị chung.",
  11: "Trực giác mạnh, nhạy cảm và có khả năng truyền cảm hứng.",
  22: "Kết hợp tầm nhìn lớn với năng lực kiến tạo thực tế.",
};

function normalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .replaceAll("đ", "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ");
}

function digitSum(number: number) {
  return String(number)
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
}

/**
 * Rút gọn theo đúng engine Python gốc (`convert_to_single_number`):
 * cộng dồn, giữ lại số đặc biệt gặp giữa chừng, rồi cộng chữ số tối đa 2 lần.
 */
function reducePy(numbers: number[], specialValues: Record<number, string> = {}) {
  if (numbers.length === 1 && numbers[0] === 0) return 1;
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  if (total in specialValues) return total;
  const first = digitSum(total);
  if (first in specialValues) return first;
  return digitSum(first);
}

/** Rút gọn lặp tới khi còn một chữ số hoặc chạm số đặc biệt (`convert_to_single_number_without_reduce`). */
function reducePyDeep(numbers: number[], specialValues: Record<number, string> = {}) {
  if (numbers.length === 1 && numbers[0] === 0) return 1;
  const total = numbers.reduce((sum, number) => sum + number, 0);
  if (total > 9 && !(total in specialValues)) {
    return reducePyDeep([...String(total)].map(Number), specialValues);
  }
  return total;
}

/** Quy số đặc biệt về căn số: 11→11, 22→22, 13→4, 14→5, 16→7, 19→1 (`convert_specialvalue`). */
function pyRoot(number: number) {
  if (number === 13) return 4;
  if (number === 14) return 5;
  if (number === 16) return 7;
  if (number === 19) return 1;
  return number;
}

function formatValue(value: number, specialValues: Record<number, string>) {
  return specialValues[value] ?? String(value);
}

/** Căn số của một giá trị đã định dạng: "13/4" → 4, "11/2" → 2, "7" → 7. */
function rootValue(value: string) {
  return Number(value.split("/").at(-1));
}

function parseBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) throw new Error("Ngày sinh không hợp lệ.");
  return { day, month, year };
}

const VOWELS = "aeiou";

/** Chữ Y đóng vai trò nguyên âm khi đứng cuối từ sau phụ âm, đứng đầu trước phụ âm, hoặc giữa hai phụ âm. */
function yVowelBonus(word: string) {
  const index = word.indexOf("y");
  if (index < 0) return 0;
  const prev = index > 0 ? word[index - 1] : "";
  const next = index + 1 < word.length ? word[index + 1] : "";
  if (prev && !VOWELS.includes(prev) && !next) return 7;
  if (!prev && next && !VOWELS.includes(next)) return 7;
  if (prev && next && !VOWELS.includes(prev) && !VOWELS.includes(next)) return 7;
  return 0;
}

/** Chữ Y đóng vai trò phụ âm khi đứng cạnh ít nhất một nguyên âm. */
function yConsonantBonus(word: string) {
  const index = word.indexOf("y");
  if (index < 0) return 0;
  const prev = index > 0 ? word[index - 1] : "";
  const next = index + 1 < word.length ? word[index + 1] : "";
  if ((prev && VOWELS.includes(prev)) || (next && VOWELS.includes(next))) return 7;
  return 0;
}

function wordLetters(normalizedName: string) {
  return normalizedName.split(" ").filter(Boolean);
}

function sumWordChars(word: string, chars: string) {
  let total = 0;
  for (const letter of word) {
    if (chars.includes(letter)) total += ALPHABET_VALUES[letter] ?? 0;
  }
  return total;
}

/** Nội tâm: tổng nguyên âm từng từ (Y theo ngữ cảnh), rút gọn từng từ rồi cộng lại. */
function pySoul(normalizedName: string) {
  const words = wordLetters(normalizedName);
  const perWord = words.map((word) => sumWordChars(word, VOWELS) + yVowelBonus(word));
  const reduced = perWord.map((num) => {
    if (num === 11 || num === 22) return num;
    const first = num > 9 ? digitSum(num) : num;
    return digitSum(first);
  });
  const final = reducePy(reduced, EXTENDED_VALUES);
  return formatValue(final, EXTENDED_VALUES);
}

/** Tương tác: tổng phụ âm từng từ (Y cạnh nguyên âm tính là phụ âm). */
function pyInteraction(normalizedName: string) {
  const words = wordLetters(normalizedName);
  const perWord = words.map((word) => sumWordChars(word, "bcdfghjklmnpqrstvwxz") + yConsonantBonus(word));
  const reduced = perWord.map((num) => {
    if (num === 11 || num === 22 || perWord.length === 1) return num;
    const first = num > 9 ? digitSum(num) : num;
    return digitSum(first);
  });
  const final = reducePy(reduced, EXTENDED_VALUES);
  return formatValue(final, EXTENDED_VALUES);
}

/** Sứ mệnh: rút gọn từng từ theo bảng đầy đủ, quy số đặc biệt về căn rồi cộng lại. */
function pyDestiny(normalizedName: string) {
  const words = wordLetters(normalizedName);
  const perWord = words.map((word) => reducePy([...word].map((letter) => ALPHABET_VALUES[letter] ?? 0), EXTENDED_VALUES));
  const rooted = perWord.map((num) => (num in EXTENDED_VALUES ? pyRoot(num) : num));
  const final = reducePy(rooted, EXTENDED_VALUES);
  return formatValue(final, EXTENDED_VALUES);
}

/** Chỉ số từ một nhóm chữ cái cố định (logic, cảm xúc, trực giác, trải nghiệm). */
function pyLetterGroup(normalizedName: string, chars: string) {
  const total = sumWordChars(normalizedName.replaceAll(" ", ""), chars);
  const final = reducePyDeep([total], MASTER_VALUES);
  return formatValue(final, MASTER_VALUES);
}

/** Cân bằng: tổng chữ cái đầu mỗi từ, rút gọn về một chữ số. */
function pyBalance(normalizedName: string) {
  const initials = wordLetters(normalizedName).map((word) => ALPHABET_VALUES[word[0]] ?? 0);
  return String(reducePy(initials));
}

/** Bài học nghiệp: các con số 1–9 còn thiếu trong họ tên. */
function pyMissingNumbers(normalizedName: string) {
  const missing = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const letter of normalizedName.replaceAll(" ", "")) {
    missing.delete(ALPHABET_VALUES[letter] ?? 0);
  }
  missing.delete(0);
  return [...missing].sort((a, b) => a - b);
}

/** Đam mê: các con số xuất hiện nhiều nhất trong họ tên, theo thứ tự xuất hiện đầu tiên. */
function pyPassion(normalizedName: string) {
  const counts = new Map<number, number>();
  for (const letter of normalizedName.replaceAll(" ", "")) {
    const value = ALPHABET_VALUES[letter];
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const max = Math.max(0, ...counts.values());
  return [...counts.entries()].filter(([, count]) => count === max).map(([value]) => value);
}

/** Số lặp: căn số xuất hiện nhiều nhất trong 6 chỉ số nền; trả rỗng khi tất cả khác nhau. */
function repeatedRoots(values: string[]) {
  const roots = values.map(rootValue);
  const max = Math.max(...roots.map((value) => roots.filter((item) => item === value).length));
  const repeated = [...new Set(roots.filter((value) => roots.filter((item) => item === value).length === max))];
  if (repeated.length === roots.length) return [] as number[];
  return repeated.sort((a, b) => a - b);
}

/** Nợ nghiệp: căn số của các chỉ số mang nợ 13/14/16/19, loại trùng. */
function karmicDebts(values: string[]) {
  const debts = new Set<number>();
  for (const value of values) {
    for (const debt of ["13", "14", "16", "19"]) {
      if (value.includes(debt)) debts.add(rootValue(value));
    }
  }
  return [...debts].sort((a, b) => a - b);
}

function pyAttitude(day: number, month: number) {
  const reducedDay = reducePy([day], MASTER_VALUES);
  const reducedMonth = digitSum(month);
  return formatValue(reducePy([reducedDay, reducedMonth], MASTER_VALUES), MASTER_VALUES);
}

function pyBirthNumber(day: number) {
  const reducedDay = reducePy([day], EXTENDED_VALUES);
  return formatValue(reducePy([reducedDay], EXTENDED_VALUES), EXTENDED_VALUES);
}

function pyPersonalYear(day: number, month: number, referenceYear: number) {
  const reducedDay = pyRoot(reducePy([day], EXTENDED_VALUES));
  const reducedMonth = month === 12 ? 3 : month === 10 ? 1 : month;
  const reducedYear = pyRoot(reducePy([referenceYear], EXTENDED_VALUES));
  return formatValue(reducePy([reducedDay, reducedMonth, reducedYear], EXTENDED_VALUES), EXTENDED_VALUES);
}

function pyLifePath(day: number, month: number, year: number) {
  const reducedDay = pyRoot(reducePy([day], EXTENDED_VALUES));
  const reducedMonth = month === 12 ? 3 : month === 10 ? 1 : month;
  const reducedYear = pyRoot(reducePy([year], EXTENDED_VALUES));
  return formatValue(reducePy([reducedDay, reducedMonth, reducedYear], EXTENDED_VALUES), EXTENDED_VALUES);
}

/**
 * Biểu đồ chặng đường đời: 3 gốc ngày/tháng/năm + 4 đỉnh.
 * Đỉnh 3 tính từ căn số (cộng chữ số một lần) của đỉnh 1 và đỉnh 2, giữ 11/22.
 */
function pyLifePathChart(day: number, month: number, year: number) {
  const rawDay = day === 11 || day === 22 ? day : reducePy([day], EXTENDED_VALUES);
  const dayRoot = day === 11 || day === 22 ? day : pyRoot(rawDay);
  const rawMonth = month === 11 ? 11 : digitSum(month);
  const rawYear = reducePy([year], EXTENDED_VALUES);
  const yearRoot = rawYear === 11 || rawYear === 22 ? rawYear : pyRoot(rawYear);

  const pinnacle1 = reducePy([dayRoot, rawMonth], EXTENDED_VALUES);
  const pinnacle2 = reducePy([dayRoot, yearRoot], EXTENDED_VALUES);
  const pinnacle1Root = pinnacle1 === 11 || pinnacle1 === 22 ? pinnacle1 : digitSum(pinnacle1);
  const pinnacle2Root = pinnacle2 === 11 || pinnacle2 === 22 ? pinnacle2 : digitSum(pinnacle2);
  const pinnacle3 = reducePy([pinnacle1Root, pinnacle2Root], EXTENDED_VALUES);
  const pinnacle4 = reducePy([rawMonth, yearRoot], EXTENDED_VALUES);

  return {
    day: formatValue(rawDay, EXTENDED_VALUES),
    month: formatValue(rawMonth, EXTENDED_VALUES),
    year: formatValue(rawYear, EXTENDED_VALUES),
    pinnacles: [pinnacle1, pinnacle2, pinnacle3, pinnacle4].map((value) => formatValue(value, EXTENDED_VALUES)),
  };
}

/** Khoảng tuổi của đỉnh đầu: 36 trừ số đầu của Đường đời (nợ nghiệp lấy căn số). */
function pinnacleAgeBase(lifePath: string) {
  const numerator = Number(lifePath.split("/")[0]);
  const base = ["19/1", "22/4", "16/7", "14/5", "13/4"].includes(lifePath) ? rootValue(lifePath) : numerator;
  return 36 - base;
}

/** Biểu đồ ngày sinh: đếm từng chữ số 1–9 trong ngày/tháng/năm sinh, bỏ số 0. */
function birthChartCounts(day: number, month: number, year: number) {
  const counts: Record<number, number> = {};
  for (const digit of `${day}${month}${year}`) {
    const value = Number(digit);
    if (value === 0) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

/** Biểu đồ họ tên: đếm từng giá trị 1–9 của các chữ cái trong họ tên. */
function nameChartCounts(normalizedName: string) {
  const counts: Record<number, number> = {};
  for (const letter of normalizedName.replaceAll(" ", "")) {
    const value = ALPHABET_VALUES[letter];
    if (!value) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function metric(key: string, label: string, value: string, note: string, values?: string[]): FullMetric {
  return values && values.length ? { key, label, value, values, note } : { key, label, value, note };
}

function calculateNameMetrics(normalizedName: string) {
  return {
    soul: pySoul(normalizedName),
    interaction: pyInteraction(normalizedName),
    destiny: pyDestiny(normalizedName),
  };
}

export function calculateNumerologyReport(
  fullName: string,
  birthDate: string,
  referenceYear = new Date().getFullYear(),
): NumerologyReport {
  const name = fullName.trim().replace(/\s+/g, " ");
  const { day, month, year } = parseBirthDate(birthDate);
  const normalized = normalizeName(name);

  const lifePath = pyLifePath(day, month, year);
  const destiny = pyDestiny(normalized);
  const soul = pySoul(normalized);
  const attitude = pyAttitude(day, month);
  const personalYear = pyPersonalYear(day, month, referenceYear);
  const interaction = pyInteraction(normalized);
  const maturity = formatValue(reducePy([rootValue(lifePath), rootValue(destiny)], MASTER_VALUES), MASTER_VALUES);
  const peaks = pyLifePathChart(day, month, year).pinnacles.join(" · ");

  const metrics: NumerologyMetric[] = [
    { key: "lifePath", label: "Đường đời", value: lifePath, note: NUMBER_MESSAGES[Number(lifePath.split("/")[0])] ?? NUMBER_MESSAGES[rootValue(lifePath)] },
    { key: "destiny", label: "Sứ mệnh", value: destiny, note: "Năng lực và hướng đóng góp thể hiện qua họ tên khai sinh." },
    { key: "soul", label: "Nội tâm", value: soul, note: "Động lực sâu bên trong và điều khiến bạn cảm thấy đủ đầy." },
    { key: "attitude", label: "Thái độ", value: attitude, note: "Cách bạn phản ứng và tạo ấn tượng trong những tiếp xúc đầu tiên." },
    { key: "personalYear", label: `Năm cá nhân ${referenceYear}`, value: personalYear, note: "Năng lượng chủ đạo của năm hiện tại để bạn chọn nhịp phát triển phù hợp." },
    { key: "peaks", label: "4 đỉnh cao", value: peaks, note: "Bốn nguồn năng lượng nổi bật trên hành trình phát triển cuộc đời." },
    { key: "interaction", label: "Tương tác", value: interaction, note: "Cách bạn biểu hiện ra bên ngoài và kết nối với môi trường xung quanh." },
    { key: "maturity", label: "Trưởng thành", value: maturity, note: "Năng lượng hội tụ khi Đường đời và Sứ mệnh cùng được phát huy." },
  ];

  return {
    displayName: name,
    birthDateLabel: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
    coreNumber: Number(lifePath.split("/")[0]),
    metrics,
  };
}

/**
 * Báo cáo đầy đủ theo engine Python gốc của SGEN: 20 chỉ số chia 5 nhóm,
 * biểu đồ chặng đường đời, Ikigai, biểu đồ ngày sinh và biểu đồ họ tên.
 */
export function calculateFullNumerologyReport(
  fullName: string,
  birthDate: string,
  referenceYear = new Date().getFullYear(),
  commonName?: string,
): NumerologyFullReport {
  const base = calculateNumerologyReport(fullName, birthDate, referenceYear);
  const normalized = normalizeName(base.displayName);
  const { day, month, year } = parseBirthDate(birthDate);

  const { soul, interaction, destiny } = calculateNameMetrics(normalized);
  const logic = pyLetterGroup(normalized, "aghjlnp");
  const emotion = pyLetterGroup(normalized, "biorstxz");
  const intuition = pyLetterGroup(normalized, "cfkquvy");
  const experience = pyLetterGroup(normalized, "demw");
  const missing = pyMissingNumbers(normalized);
  const subconscious = 9 - missing.length;
  const attitude = pyAttitude(day, month);
  const balance = pyBalance(normalized);
  const personalYear = pyPersonalYear(day, month, referenceYear);
  const lifePath = pyLifePath(day, month, year);
  const birthNumber = pyBirthNumber(day);
  const maturity = formatValue(reducePy([rootValue(lifePath), rootValue(destiny)], MASTER_VALUES), MASTER_VALUES);
  const passion = pyPassion(normalized);
  const repeated = repeatedRoots([destiny, lifePath, birthNumber, soul, interaction, attitude]);
  const soulInteraction = String(Math.abs(rootValue(soul) - rootValue(interaction)));
  const destinyLifePath = String(Math.abs(rootValue(destiny) - rootValue(lifePath)));

  const chart = pyLifePathChart(day, month, year);
  const debts = karmicDebts([destiny, lifePath, soul, interaction, birthNumber, personalYear, chart.year, ...chart.pinnacles]);

  const ageBase = pinnacleAgeBase(lifePath);
  const pinnacles: PinnacleNode[] = chart.pinnacles.map((value, index) => ({
    value,
    range: index === 0 ? `0 – ${ageBase}` : `${ageBase + (index - 1) * 9 + 1} – ${ageBase + index * 9}`,
  }));

  const sections: NumerologySection[] = [
    {
      id: "the-gioi-ben-trong",
      title: "Thế giới bên trong",
      metrics: [
        metric("soul", "Nội tâm", soul, "Động lực sâu bên trong và điều khiến bạn cảm thấy đủ đầy."),
        metric("logic", "Logic", logic, "Khả năng lập luận, phân tích và tư duy có hệ thống."),
        metric("emotion", "Cảm xúc", emotion, "Cách bạn cảm nhận và biểu đạt cảm xúc."),
        metric("intuition", "Trực giác", intuition, "Khả năng nắm bắt điều chưa nói ra và linh cảm."),
        metric("experience", "Trải nghiệm", experience, "Cách bạn học và trưởng thành qua va chạm thực tế."),
        metric("subconscious", "Tiềm thức", String(subconscious), "Nguồn năng lượng ngầm, bù trừ cho các bài học còn thiếu."),
      ],
    },
    {
      id: "the-gioi-ben-ngoai",
      title: "Thế giới bên ngoài",
      metrics: [
        metric("repeated", "Số lặp", repeated.join(", "), "Căn số xuất hiện nhiều nhất trong sáu chỉ số nền — năng lượng bị lặp lại, dễ quá tải.", repeated.map(String)),
        metric("attitude", "Thái độ", attitude, "Cách bạn phản ứng và tạo ấn tượng trong những tiếp xúc đầu tiên."),
        metric("interaction", "Tương tác", interaction, "Cách bạn biểu hiện ra bên ngoài và kết nối với môi trường xung quanh."),
      ],
    },
    {
      id: "phat-trien-ban-than",
      title: "Phát triển bản thân",
      metrics: [
        metric("balance", "Cân bằng", balance, "Cách bạn giữ nhịp và xử lý áp lực trong cuộc sống."),
        metric("missing", "Bài học nghiệp", missing.join(", "), "Các con số còn thiếu trong họ tên — bài học cần chủ động bồi đắp.", missing.map(String)),
        metric("debts", "Nợ nghiệp", debts.join(", "), "Căn số của các chỉ số mang nợ nghiệp 13/14/16/19 xuất hiện trong bản đồ.", debts.map(String)),
      ],
    },
    {
      id: "dinh-huong-su-nghiep",
      title: "Định hướng sự nghiệp — mục đích cuộc đời",
      metrics: [
        metric("personalYear", `Năm cá nhân ${referenceYear}`, personalYear, "Năng lượng chủ đạo của năm hiện tại để bạn chọn nhịp phát triển phù hợp."),
        metric("destiny", "Sứ mệnh", destiny, "Năng lực và hướng đóng góp thể hiện qua họ tên khai sinh."),
        metric("lifePath", "Đường đời", lifePath, NUMBER_MESSAGES[Number(lifePath.split("/")[0])] ?? NUMBER_MESSAGES[rootValue(lifePath)]),
        metric("birthNumber", "Ngày sinh", birthNumber, "Tài năng đặc trưng bộc lộ sớm, quy từ chính ngày bạn sinh ra."),
        metric("maturity", "Trưởng thành", maturity, "Năng lượng hội tụ khi Đường đời và Sứ mệnh cùng được phát huy."),
        metric("passion", "Đam mê", passion.join(", "), "Con số xuất hiện nhiều nhất trong họ tên — nguồn hứng thú tự nhiên.", passion.map(String)),
      ],
    },
    {
      id: "nguon-luc-ho-tro",
      title: "Nguồn lực hỗ trợ",
      metrics: [
        metric("soulInteraction", "Kết nối Nội tâm — Tương tác", soulInteraction, "Khoảng cách giữa nhu cầu bên trong và hình ảnh bên ngoài; càng nhỏ càng đồng nhất."),
        metric("destinyLifePath", "Kết nối Sứ mệnh — Đường đời", destinyLifePath, "Khoảng cách giữa hướng đóng góp và hành trình cuộc đời; càng nhỏ càng thuận."),
      ],
    },
  ];

  const ikigai: IkigaiChart = {
    passion: passion.map(String),
    mission: String(rootValue(destiny)),
    expertise: [soul, interaction, birthNumber].map((value) => String(rootValue(value))),
    career: [lifePath, maturity, personalYear].map((value) => String(rootValue(value))),
  };

  const report: NumerologyFullReport = {
    ...base,
    sections,
    lifePathChart: { day: chart.day, month: chart.month, year: chart.year, birthNumber, pinnacles },
    ikigai,
    birthChart: birthChartCounts(day, month, year),
    nameChart: nameChartCounts(normalized),
  };

  const normalizedCommon = commonName ? normalizeName(commonName) : "";
  if (normalizedCommon) {
    const common = calculateNameMetrics(normalizedCommon);
    report.commonNameMetrics = [
      metric("commonDestiny", "Sứ mệnh theo tên thường dùng", common.destiny, "Năng lực bạn thể hiện qua tên gọi hằng ngày."),
      metric("commonSoul", "Nội tâm theo tên thường dùng", common.soul, "Nhu cầu bên trong khi được gọi bằng tên thường dùng."),
      metric("commonInteraction", "Tương tác theo tên thường dùng", common.interaction, "Ấn tượng bạn tạo ra qua tên gọi hằng ngày."),
    ];
  }

  return report;
}
