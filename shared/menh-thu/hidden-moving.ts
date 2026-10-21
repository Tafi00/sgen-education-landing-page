import { getFourPillars, getHexagram, type HexagramResult } from "./metaphysics.js";

/**
 * Hào Ám động — dùng khi cả sáu hào gieo ra đều tĩnh (không có hào động).
 *
 * Tài liệu SGEN (trang "Tìm hào Ám động"):
 *   Ám động hào ba vị Đinh/Nhâm · hào Bốn Ất/Canh · Sơ hào Tân/Bính ·
 *   Mậu/Quý cư hào Nhị · Giáp tại hào Năm, Kỷ lục (hào sáu).
 *
 * Thiên Can lấy theo NGÀY THỰC TẾ gieo quẻ (không phải ngày sinh), tính theo giờ Asia/Ho_Chi_Minh
 * bằng đúng bộ tính Tứ trụ mà lá quẻ Lục Hào đang dùng, nên hai phần luôn khớp nhau.
 * Hào đánh số từ dưới lên: hào 1 ở dưới cùng, hào 6 trên cùng.
 */
export const HIDDEN_MOVING_BY_STEM: Readonly<Record<string, number>> = {
  Đinh: 3,
  Nhâm: 3,
  Ất: 4,
  Canh: 4,
  Tân: 1,
  Bính: 1,
  Mậu: 2,
  Quý: 2,
  Giáp: 5,
  Kỷ: 6,
};

export const CAST_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type CastMoment = { solarDate: string; time: string };

export type HiddenMovingLine = {
  /** Vị trí hào (1–6, từ dưới lên). */
  position: number;
  /** Thiên Can của ngày gieo quẻ đã dùng để xác định hào. */
  stem: string;
  /** Hào tĩnh ban đầu là Dương hay Âm. */
  polarity: "Dương" | "Âm";
  /** Chiều đổi của hào Ám động. */
  change: "Dương → Âm" | "Âm → Dương";
  /** Câu thông báo dùng nguyên văn trên giao diện và trong gói dữ liệu cho AI. */
  notice: string;
};

export type CastHexagram = {
  hexagram: HexagramResult;
  /** Sáu hào dùng để dựng quẻ: giống `lines` nhập vào, trừ hào Ám động đã được đổi thành hào động. */
  lines: number[];
  /** Các hào động tính theo kết quả gieo + hào Ám động (nếu có). */
  movingLines: number[];
  hidden: HiddenMovingLine | null;
};

/** Ngày giờ dương lịch của một thời điểm theo giờ Việt Nam, dạng `YYYY-MM-DD` / `HH:mm`. */
export function castMomentVN(at: Date = new Date()): CastMoment {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return { solarDate: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** Thiên Can của ngày tại thời điểm gieo (dùng bộ Tứ trụ giờ dân dụng, múi giờ +7). */
export function dayStemAt(moment: CastMoment): string {
  return getFourPillars(moment.solarDate, moment.time, 105.833, 7, "civil").pillars[2].stem;
}

function hasMovingLine(lines: number[]) {
  return lines.some((value) => value === 6 || value === 9);
}

/**
 * Dựng quẻ từ sáu hào gieo (6/7/8/9, từ dưới lên).
 * - Có hào động: giữ nguyên quy tắc hiện có, KHÔNG áp dụng hào Ám động.
 * - Không có hào động: đảo âm/dương đúng một hào theo Thiên Can ngày gieo để tạo quẻ Biến khác quẻ Chủ.
 */
export function castHexagram(lines: number[], moment: CastMoment): CastHexagram {
  if (lines.length !== 6) throw new Error("Cần đủ sáu hào để dựng quẻ.");
  if (hasMovingLine(lines)) {
    const hexagram = getHexagram(lines);
    return { hexagram, lines, movingLines: hexagram.moving, hidden: null };
  }

  const stem = dayStemAt(moment);
  const position = HIDDEN_MOVING_BY_STEM[stem];
  if (!position) throw new Error(`Chưa có quy tắc hào Ám động cho Thiên Can ${stem}.`);

  const original = lines[position - 1];
  const yang = original === 7;
  // Hào tĩnh được xử như hào động cùng cực: dương 7 → lão dương 9 (đổi sang âm), âm 8 → lão âm 6 (đổi sang dương).
  const effective = lines.map((value, index) => (index === position - 1 ? (yang ? 9 : 6) : value));
  const base = getHexagram(effective);
  const polarity = yang ? "Dương" : "Âm";
  const change = yang ? "Dương → Âm" : "Âm → Dương";
  const notice = `Không có hào động từ kết quả gieo. Áp dụng hào Ám động tại hào ${position} theo Thiên Can ${stem} của ngày gieo quẻ.`;
  const hexagram: HexagramResult = {
    ...base,
    movingDetails: base.movingDetails.map((detail) => ({ ...detail, polarity: `${polarity} ám động`, change })),
    readingRule: `Quẻ tĩnh, không có hào động từ kết quả gieo. Hào Ám động tại hào ${position} (Thiên Can ${stem}, ${polarity} → ${yang ? "Âm" : "Dương"}) cho biết điểm ngầm đang chuyển; đọc quẻ chủ để hiểu hoàn cảnh, lấy lời hào ${position} và quẻ biến làm chiều chuyển tiếp.`,
  };
  return { hexagram, lines: effective, movingLines: [position], hidden: { position, stem, polarity, change, notice } };
}
