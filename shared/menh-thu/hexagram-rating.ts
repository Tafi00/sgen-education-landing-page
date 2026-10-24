import { getHexagramByTrigramOrder } from "./metaphysics.js";

/**
 * Mức Tốt / Trung Bình / Xấu của 64 quẻ theo "Bảng 64 quẻ Kinh Dịch" của SGEN (khách gửi 21/10/2026):
 * quẻ chữ ĐỎ là Tốt, quẻ chữ XANH là Trung Bình, quẻ chữ ĐEN nền VÀNG là Xấu.
 *
 * Bảng gốc có 8 hàng (thượng quái 1–8: Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn) × 8 cột (hạ quái 1–8), mỗi ô ghi
 * "thượng/hạ" như "7/1 Sơn Thiên Đại Súc" — cùng cách ghi với `getHexagramByTrigramOrder`.
 * Mỗi chữ: T = Tốt, B = Trung Bình, X = Xấu.
 *
 * Lưu ý: ô 8/8 (Địa Vi Khôn) bị che một phần trong ảnh khách gửi, đang đọc là Trung Bình — cần khách xác nhận lại.
 */
export type HexagramRating = "tot" | "trung-binh" | "xau";

const RATING_GRID = [
  "TBBXXXXX", // 1 Càn
  "BTBBBXBB", // 2 Đoài
  "TXBBBXXT", // 3 Ly
  "TXTBBBXT", // 4 Chấn
  "XBBTBXTB", // 5 Tốn
  "BXTXBXXB", // 6 Khảm
  "TXXBXXXX", // 7 Cấn
  "TTXBTBBB", // 8 Khôn
] as const;

const BY_LETTER: Record<string, HexagramRating> = { T: "tot", B: "trung-binh", X: "xau" };

export const HEXAGRAM_RATING_LABEL: Record<HexagramRating, string> = {
  tot: "Tốt",
  "trung-binh": "Trung Bình",
  xau: "Xấu",
};

/** Mức của từng quẻ theo số Văn Vương (1–64). */
const RATING_BY_NUMBER: Record<number, HexagramRating> = (() => {
  const result: Record<number, HexagramRating> = {};
  for (let upper = 1; upper <= 8; upper += 1) {
    for (let lower = 1; lower <= 8; lower += 1) {
      const hexagram = getHexagramByTrigramOrder(upper, lower);
      if (hexagram) result[hexagram.number] = BY_LETTER[RATING_GRID[upper - 1][lower - 1]];
    }
  }
  return result;
})();

/** Mức Tốt / Trung Bình / Xấu của quẻ số `number` (1–64); quẻ không hợp lệ trả `null`. */
export function hexagramRating(number: number): HexagramRating | null {
  return RATING_BY_NUMBER[number] ?? null;
}
