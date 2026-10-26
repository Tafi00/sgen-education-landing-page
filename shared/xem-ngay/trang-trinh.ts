/**
 * Trạng Trình – Nguyễn Bỉnh Khiêm: Bát Thập Tam Mục (83 mục việc) theo giáo trình của khách. Nội dung từng mục (đoạn văn,
 * bảng Can → Chi ngày tốt, các bảng khác) ở `trang-trinh-data.ts`, sinh bằng `scripts/extract_trach_cat.py`.
 *
 * Danh sách mục của một ngày chỉ phụ thuộc Can Chi ngày: ngày có trong bảng ngày tốt chung (bảng Can → Chi đầu tiên)
 * của mục thì mục được tính, trừ các điều chỉnh trong `TRANG_TRINH_OVERRIDES`. Không tính các mục chia ngày tốt theo
 * tiết khí / tháng (23, 42, 54, 63), mục 33 (bảng là ngày KỊ) và các mục không có bảng Can → Chi.
 */
import { BRANCHES, STEMS } from "./calendar";
import { TRANG_TRINH_CONTENT, type TrangTrinhBlock } from "./trang-trinh-data";

type StemName = (typeof STEMS)[number];
type BranchName = (typeof BRANCHES)[number];
type CanChiName = `${StemName} ${BranchName}`;

export type { TrangTrinhBlock };
export type TrangTrinhDays = Partial<Record<StemName, BranchName[]>>;
export type TrangTrinhMuc = {
  no: number;
  title: string;
  /** Nội dung theo đúng thứ tự trong giáo trình. */
  blocks: TrangTrinhBlock[];
  /** Bảng ngày tốt chung dùng để lập danh sách mục của ngày; `null` nếu mục không có bảng này. */
  mainDays: TrangTrinhDays | null;
};

/** Mục có bảng Can → Chi nhưng không phải bảng ngày tốt chung (theo tiết khí / tháng, hoặc bảng ngày kị). */
const WITHOUT_MAIN_TABLE = new Set([23, 33, 42, 54, 63]);

export const TRANG_TRINH_MUC: Record<number, TrangTrinhMuc> = Object.fromEntries(
  Object.entries(TRANG_TRINH_CONTENT).map(([key, content]) => {
    const no = Number(key);
    const main = WITHOUT_MAIN_TABLE.has(no) ? undefined : content.blocks.find((block) => block.kind === "days");
    const muc: TrangTrinhMuc = {
      no,
      title: content.title,
      blocks: content.blocks,
      mainDays: main?.kind === "days" ? (main.days as TrangTrinhDays) : null,
    };
    return [no, muc];
  }),
);

/**
 * Chênh lệch giữa bảng chính và danh sách mục mà công cụ đối chiếu (xemngay.thayphongthuy.vn) thực sự hiển thị,
 * đã kiểm trên đủ 60 Can Chi. Không suy ra được bằng quy tắc chung nên ghi tường minh:
 * `remove` = ngày có trong bảng nhưng không tính, `add` = ngày không có trong bảng nhưng vẫn tính.
 */
export const TRANG_TRINH_OVERRIDES: Partial<Record<number, { add?: CanChiName[]; remove?: CanChiName[] }>> = {
  1: { remove: ["Giáp Thìn", "Giáp Thân", "Ất Mùi", "Bính Thìn", "Đinh Sửu", "Tân Hợi"] },
  2: { remove: ["Giáp Tuất", "Ất Mẹo"] },
  5: { remove: ["Giáp Thìn", "Giáp Ngọ", "Giáp Thân", "Mậu Dần"] },
  6: { remove: ["Đinh Dậu"] },
  8: { remove: ["Đinh Dậu", "Canh Tý"] },
  10: { remove: ["Bính Thân", "Kỷ Dậu"] },
  15: { remove: ["Tân Hợi"] },
  16: { remove: ["Ất Dậu"] },
  17: { remove: ["Giáp Thân"] },
  18: { remove: ["Kỷ Hợi"] },
  19: { remove: ["Giáp Thân"] },
  20: { remove: ["Bính Tý", "Bính Ngọ", "Quý Tị"] },
  21: { remove: ["Nhâm Dần"] },
  28: { remove: ["Đinh Dậu"] },
  29: { add: ["Bính Ngọ"] },
  32: { remove: ["Quý Tị"] },
  35: { remove: ["Canh Dần", "Nhâm Tý"] },
  36: { remove: ["Giáp Dần", "Giáp Ngọ", "Giáp Thân", "Giáp Tuất", "Bính Ngọ", "Quý Mẹo"] },
  37: { add: ["Kỷ Tị"], remove: ["Giáp Thân", "Giáp Tuất", "Ất Mùi", "Bính Ngọ"] },
  39: { remove: ["Giáp Dần", "Giáp Thân", "Ất Mùi", "Bính Tý", "Đinh Mùi"] },
  40: { remove: ["Giáp Dần", "Giáp Thìn", "Giáp Ngọ", "Giáp Thân", "Giáp Tuất"] },
  43: { remove: ["Giáp Dần", "Giáp Thân", "Bính Tý", "Đinh Mùi"] },
  44: { remove: ["Giáp Dần", "Giáp Ngọ", "Giáp Thân", "Ất Hợi"] },
  58: { remove: ["Đinh Tị"] },
  60: { add: ["Canh Dần", "Canh Thân"], remove: ["Đinh Hợi", "Mậu Dần", "Mậu Thân"] },
  61: { remove: ["Ất Hợi", "Nhâm Tý"] },
  78: { remove: ["Mậu Ngọ", "Nhâm Tý"] },
  82: { remove: ["Giáp Thân", "Nhâm Thân"] },
};

const ALIASES: Record<string, string> = { Quí: "Quý", Mão: "Mẹo", Tỵ: "Tị", Tí: "Tý" };

/** Chuẩn hoá tên Can Chi: gộp khoảng trắng, đổi "Ð" (U+00D0) → "Đ" và các cách viết khác (Quí, Mão, Tỵ, Tí). */
function normalizeCanChi(name: string) {
  return name
    .normalize("NFC")
    .replace(/\u00d0/g, "Đ")
    .trim()
    .split(/\s+/)
    .map((word) => ALIASES[word] ?? word)
    .join(" ");
}

/** Bảng tra Can Chi → các mục, dựng một lần từ bảng chính và phần điều chỉnh. */
const MUC_BY_CAN_CHI = (() => {
  const index = new Map<string, number[]>();
  for (const muc of Object.values(TRANG_TRINH_MUC).sort((a, b) => a.no - b.no)) {
    const days = new Set<string>();
    for (const [stem, branches] of Object.entries(muc.mainDays ?? {})) {
      for (const branch of branches ?? []) days.add(`${stem} ${branch}`);
    }
    const override = TRANG_TRINH_OVERRIDES[muc.no];
    for (const day of override?.add ?? []) days.add(day);
    for (const day of override?.remove ?? []) days.delete(day);
    for (const day of days) {
      const list = index.get(day);
      if (list) list.push(muc.no);
      else index.set(day, [muc.no]);
    }
  }
  return index;
})();

/** Các mục hợp với ngày có Can Chi `canChiName` (vd "Tân Dậu"), sắp tăng dần. */
export function getTrangTrinhMuc(canChiName: string): number[] {
  return [...(MUC_BY_CAN_CHI.get(normalizeCanChi(canChiName)) ?? [])];
}
