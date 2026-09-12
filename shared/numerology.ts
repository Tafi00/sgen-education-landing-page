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

function reduceNumbers(numbers: number[], specialValues: Record<number, string> = {}) {
  let total = 0;
  let special = 0;

  numbers.forEach((number) => {
    if (number in specialValues) special = number;
    total += number;
    if (total in specialValues) special = total;
  });

  if (special !== 0 && (total - special) % 9 === 0) return special;
  if (total in specialValues) return total;
  return total % 9 || 9;
}

function reduceFully(number: number, specialValues: Record<number, string> = {}) {
  let current = number;
  while (current > 9 && !(current in specialValues)) {
    current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

function formatValue(value: number, specialValues: Record<number, string>) {
  return specialValues[value] ?? String(value);
}

function rootValue(value: string) {
  return Number(value.split("/").at(-1));
}

function parseBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) throw new Error("Ngày sinh không hợp lệ.");
  return { day, month, year };
}

function calculateBirthdayMetric(
  birthDate: string,
  kind: "lifePath" | "birthday" | "attitude" | "personalYear",
  referenceYear: number,
) {
  const { day, month, year } = parseBirthDate(birthDate);
  const specials = kind === "lifePath" || kind === "birthday" ? EXTENDED_VALUES : MASTER_VALUES;
  const reducedDay = reduceNumbers([day], specials);
  const reducedMonth = reduceNumbers([month], specials);

  if (kind === "birthday") return formatValue(reducedDay, specials);
  if (kind === "attitude") return formatValue(reduceNumbers([reducedDay, reducedMonth], specials), specials);
  if (kind === "personalYear") {
    const reducedYear = reduceNumbers([referenceYear], specials);
    return formatValue(reduceNumbers([reducedDay, reducedMonth, reducedYear], specials), specials);
  }

  const reducedYear = reduceNumbers([year], specials);
  return formatValue(reduceNumbers([reducedDay, reducedMonth, reducedYear], specials), specials);
}

function isContextualY(word: string, index: number) {
  if (word[index] !== "y" || index === 0) return false;
  const vowels = "aeiou";
  const previous = word[index - 1];
  const next = word[index + 1];
  return (!next && !vowels.includes(previous)) || Boolean(next && (!vowels.includes(previous) || !vowels.includes(next)));
}

function calculateNameMetric(
  fullName: string,
  kind: "destiny" | "soul" | "interaction",
) {
  const words = normalizeName(fullName).split(" ").filter(Boolean);
  const specials = kind === "interaction" ? { 13: "13/4", 14: "14/5", 16: "16/7", 19: "19/1" } : EXTENDED_VALUES;

  const wordTotals = words.map((word) => {
    const values = [...word].flatMap((letter, index) => {
      const isY = isContextualY(word, index);
      const included = kind === "destiny"
        || (kind === "soul" && ("aeiou".includes(letter) || isY))
        || (kind === "interaction" && (!"aeiouy".includes(letter) || isY));
      return included && ALPHABET_VALUES[letter] ? [ALPHABET_VALUES[letter]] : [];
    });
    return values.length ? reduceNumbers(values) : 0;
  }).filter(Boolean);

  const value = wordTotals.length ? reduceNumbers(wordTotals, specials) : 1;
  return formatValue(value, specials);
}

function calculatePeaks(birthDate: string) {
  const { day, month, year } = parseBirthDate(birthDate);
  const reducedDay = reduceNumbers([day], MASTER_VALUES);
  const reducedMonth = reduceNumbers([month], MASTER_VALUES);
  const reducedYear = reduceFully(year, MASTER_VALUES);
  const first = reduceNumbers([reducedDay, reducedMonth], MASTER_VALUES);
  const second = reduceNumbers([reducedDay, reducedYear], MASTER_VALUES);
  const third = reduceNumbers([first, second], MASTER_VALUES);
  const fourth = reduceNumbers([reducedMonth, reducedYear], MASTER_VALUES);
  return [first, second, third, fourth].map((value) => formatValue(value, MASTER_VALUES)).join(" · ");
}

export function calculateNumerologyReport(
  fullName: string,
  birthDate: string,
  referenceYear = new Date().getFullYear(),
): NumerologyReport {
  const name = fullName.trim().replace(/\s+/g, " ");
  const { day, month, year } = parseBirthDate(birthDate);
  const lifePath = calculateBirthdayMetric(birthDate, "lifePath", referenceYear);
  const destiny = calculateNameMetric(name, "destiny");
  const soul = calculateNameMetric(name, "soul");
  const attitude = calculateBirthdayMetric(birthDate, "attitude", referenceYear);
  const personalYear = calculateBirthdayMetric(birthDate, "personalYear", referenceYear);
  const interaction = calculateNameMetric(name, "interaction");
  const maturityNumber = reduceNumbers([rootValue(lifePath), rootValue(destiny)], MASTER_VALUES);
  const maturity = formatValue(maturityNumber, MASTER_VALUES);

  const metrics: NumerologyMetric[] = [
    { key: "lifePath", label: "Đường đời", value: lifePath, note: NUMBER_MESSAGES[Number(lifePath.split("/")[0])] ?? NUMBER_MESSAGES[rootValue(lifePath)] },
    { key: "destiny", label: "Sứ mệnh", value: destiny, note: "Năng lực và hướng đóng góp thể hiện qua họ tên khai sinh." },
    { key: "soul", label: "Nội tâm", value: soul, note: "Động lực sâu bên trong và điều khiến bạn cảm thấy đủ đầy." },
    { key: "attitude", label: "Thái độ", value: attitude, note: "Cách bạn phản ứng và tạo ấn tượng trong những tiếp xúc đầu tiên." },
    { key: "personalYear", label: `Năm cá nhân ${referenceYear}`, value: personalYear, note: "Năng lượng chủ đạo của năm hiện tại để bạn chọn nhịp phát triển phù hợp." },
    { key: "peaks", label: "4 đỉnh cao", value: calculatePeaks(birthDate), note: "Bốn nguồn năng lượng nổi bật trên hành trình phát triển cuộc đời." },
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
