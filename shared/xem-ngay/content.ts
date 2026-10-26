/**
 * Từ điển nội dung cho trang xem ngày: lời giải nghĩa ngắn của từng mục
 * (Thập nhị Trực, Nhị thập bát tú, thần Hoàng/Hắc Đạo, sao giờ, Cửu tinh,
 * Lục Nhâm, ngày xuất hành, tiết khí, quan niệm dân gian, tương quan Can–Chi)
 * để hiện trong popover khi người dùng bấm vào một mục.
 *
 * Khoá dùng đúng cách viết tên của nguồn tham chiếu (vd. "Kiên", "Thâu",
 * "Can Kim Long", "Bửu Quang") để engine tra thẳng. Tên viết lệch, có tiền tố
 * "Trực …" hay hậu tố "… Hoàng Đạo", ": Tốt" thì tra qua {@link findInfo}.
 *
 * Phần `summary` là lời diễn giải riêng; danh sách việc nên/kiêng chỉ là tên
 * việc. Riêng Thập nhị Trực và Nhị thập bát tú lấy nguyên lời giáo trình của
 * khách (truc-tu-data.ts). Nội dung mang tính tham khảo theo lịch pháp truyền thống.
 */

import { TRUC_GIAO_TRINH, TU28_GIAO_TRINH, type TrucGiaoTrinh, type TuGiaoTrinh } from "./truc-tu-data";

export type InfoEntry = { name: string; summary: string };

/** Mức tốt xấu ba bậc dùng chung. */
export type Luck = "Cát" | "Hung" | "Bình";

/* ------------------------------------------------------------------ */
/* Tra cứu theo tên                                                    */
/* ------------------------------------------------------------------ */

const ALIASES = new WeakMap<object, Record<string, string>>();
const LOWER_INDEX = new WeakMap<object, Map<string, string>>();

/** Gắn bảng tên khác (tên lệch → khoá chuẩn) cho một từ điển; trả lại chính từ điển đó. */
function withAliases<T>(dict: Record<string, T>, aliases: Record<string, string>): Record<string, T> {
  ALIASES.set(dict, aliases);
  return dict;
}

/** Chuẩn hoá tên: NFC, Ð→Đ, Quí→Quý, Nhựt→Nhật, gộp khoảng trắng. */
export function normalizeName(raw: string) {
  return raw
    .normalize("NFC")
    .replace(/Ð/g, "Đ")
    .replace(/ð/g, "đ")
    .replace(/Quí(?=\s|$)/g, "Quý")
    .replace(/Nhựt/g, "Nhật")
    .replace(/\s+/g, " ")
    .trim();
}

/** Bỏ phần trang trí quanh tên: "Trực …", "Sao …", "… Hoàng/Hắc Đạo", ": Tốt/Xấu", "(…)". */
function stripDecorations(name: string) {
  return name
    .replace(/\s*\(.*\)$/, "")
    .replace(/\s*:\s*(Tốt|Xấu)$/i, "")
    .replace(/\s+(Hoàng|Hắc) Đạo$/i, "")
    .replace(/^(Trực|Sao)\s+/i, "")
    .trim();
}

function lowerIndex(dict: object) {
  let index = LOWER_INDEX.get(dict);
  if (!index) {
    index = new Map();
    for (const key of Object.keys(dict)) index.set(key.toLocaleLowerCase("vi"), key);
    const aliases = ALIASES.get(dict) ?? {};
    for (const [alias, key] of Object.entries(aliases)) {
      const lower = normalizeName(alias).toLocaleLowerCase("vi");
      if (!index.has(lower)) index.set(lower, key);
    }
    LOWER_INDEX.set(dict, index);
  }
  return index;
}

/**
 * Tra một mục theo nhãn hiển thị: thử khoá đúng, rồi tên đã chuẩn hoá,
 * rồi bỏ tiền tố/hậu tố, không phân biệt hoa thường, kể cả tên khác đã đăng ký.
 */
export function findInfo<T>(dict: Record<string, T>, label: string | null | undefined): T | undefined {
  if (!label) return undefined;
  const base = normalizeName(label);
  const index = lowerIndex(dict);
  for (const candidate of [base, stripDecorations(base)]) {
    if (Object.prototype.hasOwnProperty.call(dict, candidate)) return dict[candidate];
    const key = index.get(candidate.toLocaleLowerCase("vi"));
    if (key) return dict[key];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Thập nhị Trực                                                       */
/* ------------------------------------------------------------------ */

/**
 * Lấy nguyên từ giáo trình "Trạch Cát Lý Số" (truc-tu-data.ts): tên khác, tính chất Kiết / Hung, ngũ hành,
 * Hoàng / Hắc đạo, Nên – Kị của mục 4 "Ý nghĩa Cát – Hung Thập nhị trực" và câu Bành Tổ kỵ nhật.
 * `summary` là lời dịch câu Bành Tổ.
 */
export type TrucInfo = InfoEntry & Omit<TrucGiaoTrinh, "name">;

export const TRUC_INFO: Record<string, TrucInfo> = withAliases<TrucInfo>(
  Object.fromEntries(
    TRUC_GIAO_TRINH.map(({ name, ...item }) => [name, { ...item, name: `Trực ${name}`, summary: item.banhTo[1] ?? item.banhTo[0] }]),
  ),
  { "Kiến": "Kiên", "Thu": "Thâu" },
);

/* ------------------------------------------------------------------ */
/* Nhị thập bát tú                                                     */
/* ------------------------------------------------------------------ */

/**
 * Lời từng sao lấy nguyên từ giáo trình "Trạch Cát Lý Số" (truc-tu-data.ts); thêm các dữ kiện suy từ tên và thứ tự
 * sao: thất diệu, ngày chủ trị, chòm Tứ tượng. `summary` là lời "Theo Tuyển Trạch Thông Thư và của Thái Bá Lệ".
 */
export type Tu28Info = InfoEntry & Omit<TuGiaoTrinh, "key" | "name"> & {
  /** Thứ tự từ Giác (1) tới Chẩn (28). */
  order: number;
  /** Tên sao như giáo trình viết (Cang, Vỹ, Chuỷ…). */
  short: string;
  /** Thất diệu của sao: Mộc, Kim, Thổ, Nhật, Nguyệt, Hỏa, Thủy. */
  element: string;
  /** Ngày trong tuần do sao chủ trị. */
  weekday: string;
  /** Chòm Tứ tượng và phương. */
  group: string;
};

const WEEKDAY_BY_ELEMENT: Record<string, string> = {
  Mộc: "Thứ Năm",
  Kim: "Thứ Sáu",
  Thổ: "Thứ Bảy",
  Nhật: "Chủ Nhật",
  Nguyệt: "Thứ Hai",
  Hỏa: "Thứ Ba",
  Thủy: "Thứ Tư",
};
const TU28_GROUPS = ["Thanh Long (phương Đông)", "Huyền Vũ (phương Bắc)", "Bạch Hổ (phương Tây)", "Chu Tước (phương Nam)"];

export const TU28_INFO: Record<string, Tu28Info> = withAliases<Tu28Info>(
  Object.fromEntries(
    TU28_GIAO_TRINH.map(({ key, name, ...item }, index) => {
      const element = key.split(" ")[1];
      const info: Tu28Info = {
        ...item,
        name: key,
        summary: item.thaiBaLe,
        order: index + 1,
        short: name,
        element,
        weekday: WEEKDAY_BY_ELEMENT[element],
        group: TU28_GROUPS[Math.floor(index / 7)],
      };
      return [key, info];
    }),
  ),
  {
    "Cang Kim Long": "Can Kim Long",
    "Tĩnh Mộc Can": "Tỉnh Mộc Can",
    "Tỉnh Mộc Hãn": "Tỉnh Mộc Can",
    "Liễu Thổ Chướng": "Liễu Thổ Chương",
    "Vỹ Hỏa Hổ": "Vĩ Hỏa Hổ",
    "Truỷ Hỏa Hầu": "Chủy Hỏa Hầu",
    "Chuỷ Hỏa Hầu": "Chủy Hỏa Hầu",
  },
);

/* ------------------------------------------------------------------ */
/* 12 thần Hoàng Đạo / Hắc Đạo của ngày                                */
/* ------------------------------------------------------------------ */

export type DayOfficerInfo = InfoEntry & { type: "Hoàng Đạo" | "Hắc Đạo"; alias?: string };

export const DAY_OFFICER_INFO: Record<string, DayOfficerInfo> = withAliases<DayOfficerInfo>(
  {
    "Thanh Long": {
      name: "Thanh Long",
      type: "Hoàng Đạo",
      summary: "Thần đứng đầu sáu Hoàng Đạo, khí ngày sáng sủa; khởi sự việc gì cũng thuận lợi.",
    },
    "Minh Đường": {
      name: "Minh Đường",
      type: "Hoàng Đạo",
      summary: "Ngày thuận cho gặp gỡ người có địa vị, xin việc, cầu thăng tiến.",
    },
    "Thiên Hình": {
      name: "Thiên Hình",
      type: "Hắc Đạo",
      summary: "Thần chủ về hình phạt; tránh kiện tụng, tranh chấp pháp lý.",
    },
    "Chu Tước": {
      name: "Chu Tước",
      type: "Hắc Đạo",
      summary: "Thần chủ về khẩu thiệt; dễ sinh cãi vã, kiện cáo, nên hạn chế tranh luận.",
    },
    "Kim Quỹ": {
      name: "Kim Quỹ",
      type: "Hoàng Đạo",
      summary: "Tượng rương vàng; tốt cho cưới hỏi, cầu con, cầu tài.",
    },
    "Kim Đường": {
      name: "Kim Đường",
      type: "Hoàng Đạo",
      alias: "Bảo Quang",
      summary: "Còn gọi là Bảo Quang (Bửu Quang); khí ngày hanh thông, việc lớn nhỏ đều dễ thành.",
    },
    "Bạch Hổ": {
      name: "Bạch Hổ",
      type: "Hắc Đạo",
      summary: "Thần mang sát khí; kỵ hầu hết việc lớn, chỉ hợp săn bắt và tế lễ.",
    },
    "Ngọc Đường": {
      name: "Ngọc Đường",
      type: "Hoàng Đạo",
      summary: "Thuận mọi việc, nhất là văn thư, học hành, khai bút; kém với việc bùn đất, bếp núc.",
    },
    "Thiên Lao": {
      name: "Thiên Lao",
      type: "Hắc Đạo",
      summary: "Thần chủ về giam hãm; mọi việc dễ bế tắc, chỉ hợp việc trấn yểm.",
    },
    "Huyền Vũ": {
      name: "Huyền Vũ",
      type: "Hắc Đạo",
      summary: "Thần chủ về mờ ám, mất mát; kỵ kiện tụng, giao tiếp, đề phòng lừa gạt.",
    },
    "Tư Mệnh": {
      name: "Tư Mệnh",
      type: "Hoàng Đạo",
      summary: "Thần coi giữ vận mệnh; ngày tốt cho hầu hết công việc.",
    },
    "Câu Trận": {
      name: "Câu Trận",
      type: "Hắc Đạo",
      summary: "Thần chủ về vướng víu, níu kéo; rất kỵ dời nhà, làm nhà và tang lễ.",
    },
  },
  { "Bảo Quang": "Kim Đường", "Bửu Quang": "Kim Đường" },
);

/* ------------------------------------------------------------------ */
/* Sao theo giờ                                                        */
/* ------------------------------------------------------------------ */

export type HourStarInfo = InfoEntry & { luck: Luck };

export const HOUR_STAR_INFO: Record<string, HourStarInfo> = withAliases<HourStarInfo>(
  {
    // Sáu giờ Hoàng Đạo
    "Thanh Long": { name: "Thanh Long", luck: "Cát", summary: "Giờ Hoàng Đạo đứng đầu; làm việc gì cũng thuận." },
    "Minh Đường": {
      name: "Minh Đường",
      luck: "Cát",
      summary: "Giờ Hoàng Đạo, lợi cho gặp cấp trên, quý nhân và việc cầu thăng tiến.",
    },
    "Kim Quỹ": { name: "Kim Quỹ", luck: "Cát", summary: "Giờ Hoàng Đạo, hợp cưới hỏi, cầu tài, cầu con." },
    "Kim Đường": {
      name: "Kim Đường",
      luck: "Cát",
      summary: "Giờ Hoàng Đạo (Bảo Quang); mọi việc thông suốt, dễ thành.",
    },
    "Bửu Quang": {
      name: "Bửu Quang",
      luck: "Cát",
      summary: "Tên khác của Kim Đường Hoàng Đạo; giờ sáng sủa, việc gì cũng hanh thông.",
    },
    "Ngọc Đường": {
      name: "Ngọc Đường",
      luck: "Cát",
      summary: "Giờ Hoàng Đạo, hợp văn thư, học hành, ký giấy tờ; tránh việc bùn đất, bếp núc.",
    },
    "Tư Mệnh": {
      name: "Tư Mệnh",
      luck: "Cát",
      summary: "Giờ Hoàng Đạo, việc gì cũng tốt, nhất là việc làm ban ngày.",
    },
    // Sáu giờ Hắc Đạo
    "Thiên Hình": { name: "Thiên Hình", luck: "Hung", summary: "Giờ Hắc Đạo, kỵ kiện tụng, tranh chấp." },
    "Chu Tước": { name: "Chu Tước", luck: "Hung", summary: "Giờ Hắc Đạo, dễ sinh cãi cọ, thị phi." },
    "Bạch Hổ": {
      name: "Bạch Hổ",
      luck: "Hung",
      summary: "Giờ Hắc Đạo nhiều sát khí; tránh việc lớn, chỉ hợp săn bắt, tế lễ.",
    },
    "Thiên Lao": { name: "Thiên Lao", luck: "Hung", summary: "Giờ Hắc Đạo, việc dễ bị trói buộc, trì trệ." },
    "Huyền Vũ": {
      name: "Huyền Vũ",
      luck: "Hung",
      summary: "Giờ Hắc Đạo, đề phòng mất mát, lừa gạt; kỵ kiện tụng, giao tiếp.",
    },
    "Câu Trận": { name: "Câu Trận", luck: "Hung", summary: "Giờ Hắc Đạo, kỵ dời nhà, làm nhà, tang lễ." },
    // Quý nhân và sao tốt theo can/chi ngày
    "Thiên Ất": {
      name: "Thiên Ất",
      luck: "Cát",
      summary: "Thiên Ất quý nhân theo can ngày: giờ dễ có người giúp, lợi cho cầu xin, gặp gỡ, gỡ khó khăn.",
    },
    "Phúc Tinh": {
      name: "Phúc Tinh",
      luck: "Cát",
      summary: "Phúc Tinh quý nhân: giờ mang phúc lộc, hợp cầu phúc, cầu tài.",
    },
    "Thiên Quan": {
      name: "Thiên Quan",
      luck: "Cát",
      summary: "Thiên Quan quý nhân: giờ lợi cho việc công quyền, xin việc, thăng chức.",
    },
    "Hỷ Thần": {
      name: "Hỷ Thần",
      luck: "Cát",
      summary: "Giờ của thần vui mừng theo can ngày; hợp cưới hỏi, tiệc tùng, gặp gỡ.",
    },
    "Nhật Lộc": {
      name: "Nhật Lộc",
      luck: "Cát",
      summary: "Giờ đúng vị trí Lộc của can ngày; lợi cho cầu tài, làm ăn.",
    },
    "Nhật Mã": {
      name: "Nhật Mã",
      luck: "Cát",
      summary: "Giờ Dịch Mã của chi ngày; thuận cho đi xa, di chuyển, giao thương.",
    },
    "Nhật Hiệp": {
      name: "Nhật Hiệp",
      luck: "Cát",
      summary: "Giờ Lục Hợp với chi ngày; khí hòa hợp, thuận cho hợp tác, ký kết, cưới hỏi.",
    },
    // Sao trung tính và sao xấu
    "Nhật Kiên": {
      name: "Nhật Kiên",
      luck: "Bình",
      summary: "Giờ trùng chi với ngày (Nhật Kiến), khí ngày mạnh nhất; tốt xấu tùy sao đi kèm.",
    },
    "Nhật Phá": {
      name: "Nhật Phá",
      luck: "Hung",
      summary: "Giờ xung với chi ngày, dễ đổ vỡ; tránh khởi sự việc lớn.",
    },
    "Nhật Hình": {
      name: "Nhật Hình",
      luck: "Hung",
      summary: "Giờ tương hình với chi ngày, dễ va chạm, tổn thương, kiện cáo.",
    },
    "Nhật Hại": {
      name: "Nhật Hại",
      luck: "Hung",
      summary: "Giờ tương hại với chi ngày, dễ bị cản trở ngầm, tiểu nhân quấy phá.",
    },
    "Tuần Không": {
      name: "Tuần Không",
      luck: "Hung",
      summary: "Giờ rơi vào Tuần Không của ngày; việc làm dễ rỗng, khó đến kết quả.",
    },
    "Lộ Không": {
      name: "Lộ Không",
      luck: "Hung",
      summary: "Triệt Lộ Không Vong: giờ như bị chặn đường, kỵ xuất hành, cầu tài.",
    },
    "Bất Ngộ": {
      name: "Bất Ngộ",
      luck: "Hung",
      summary: "Ngũ Bất Ngộ: can giờ khắc can ngày, mưu sự khó gặp may, nhất là xuất hành.",
    },
  },
  {
    // Tên lệch gặp trong dữ liệu tham chiếu
    "Bửu Quan": "Bửu Quang",
    "Bảo Quang": "Bửu Quang",
    "Nhật Kiến": "Nhật Kiên",
    "Nhân Lộc": "Nhật Lộc",
    "Hỷ Lạc": "Hỷ Thần",
    "Thiên Long": "Thanh Long",
  },
);

/* ------------------------------------------------------------------ */
/* Cửu tinh                                                            */
/* ------------------------------------------------------------------ */

export type CuuTinhInfo = InfoEntry & {
  /** Số của sao trong Lạc Thư (1…9). */
  number: number;
  /** Tên sao Bắc Đẩu tương ứng. */
  star: string;
  element: string;
  color: string;
  /** "Cát" | "Hung" | "Đại hung". */
  luck: string;
};

export const CUU_TINH_INFO: Record<string, CuuTinhInfo> = {
  "Nhất Bạch": {
    name: "Nhất Bạch",
    number: 1,
    star: "Tham Lang",
    element: "Thủy",
    color: "Trắng",
    luck: "Cát",
    summary: "Sao số 1, chủ về quan lộc, trí tuệ và duyên tình cảm; thuận cho học hành, công danh.",
  },
  "Nhị Hắc": {
    name: "Nhị Hắc",
    number: 2,
    star: "Cự Môn",
    element: "Thổ",
    color: "Đen",
    luck: "Hung",
    summary: "Sao bệnh phù, chủ ốm đau, sức khỏe sa sút; phương có sao này nên giữ yên tĩnh.",
  },
  "Tam Bích": {
    name: "Tam Bích",
    number: 3,
    star: "Lộc Tồn",
    element: "Mộc",
    color: "Xanh biếc",
    luck: "Hung",
    summary: "Sao thị phi, dễ phát sinh cãi vã, kiện tụng, hao của.",
  },
  "Tứ Lục": {
    name: "Tứ Lục",
    number: 4,
    star: "Văn Khúc",
    element: "Mộc",
    color: "Xanh lục",
    luck: "Cát",
    summary: "Sao văn xương, lợi cho thi cử, học hành, viết lách, sáng tác.",
  },
  "Ngũ Hoàng": {
    name: "Ngũ Hoàng",
    number: 5,
    star: "Liêm Trinh",
    element: "Thổ",
    color: "Vàng",
    luck: "Đại hung",
    summary: "Sao đại hung giữ trung cung, chủ tai họa, bệnh tật; kỵ động thổ ở phương sao bay tới.",
  },
  "Lục Bạch": {
    name: "Lục Bạch",
    number: 6,
    star: "Vũ Khúc",
    element: "Kim",
    color: "Trắng",
    luck: "Cát",
    summary: "Sao quyền uy, chủ chức vị, quý nhân và tài lộc vững vàng.",
  },
  "Thất Xích": {
    name: "Thất Xích",
    number: 7,
    star: "Phá Quân",
    element: "Kim",
    color: "Đỏ",
    luck: "Hung",
    summary: "Sao phá tài, dễ gặp trộm cắp, khẩu thiệt, thương tích do kim khí.",
  },
  "Bát Bạch": {
    name: "Bát Bạch",
    number: 8,
    star: "Tả Phù",
    element: "Thổ",
    color: "Trắng",
    luck: "Cát",
    summary: "Sao tài lộc, chủ điền sản và của cải bền lâu.",
  },
  "Cửu Tử": {
    name: "Cửu Tử",
    number: 9,
    star: "Hữu Bật",
    element: "Hỏa",
    color: "Tím",
    luck: "Cát",
    summary: "Sao hỷ khí, chủ tin vui, danh tiếng; là sao đương vận của Vận 9 (2024–2043).",
  },
};

/** Thứ tự đọc bảng Cửu tinh của nguồn: hàng trên (Bắc) → hàng dưới (Nam), trái → phải. */
const CUU_TINH_OFFSETS = [1, -4, 3, 2, 0, -2, -3, 4, -1];

/** Bảng phi tinh 3×3 khi sao `center` (1…9) nhập trung cung, trả mảng 9 số theo thứ tự trên. */
export function cuuTinhGrid(center: number) {
  return CUU_TINH_OFFSETS.map((offset) => ((((center - 1 + offset) % 9) + 9) % 9) + 1);
}

/* ------------------------------------------------------------------ */
/* Tiểu Lục Nhâm                                                       */
/* ------------------------------------------------------------------ */

export type LucNhamInfo = InfoEntry & { luck: Luck; order: number };

export const LUC_NHAM_INFO: Record<string, LucNhamInfo> = {
  "Đại An": {
    name: "Đại An",
    order: 1,
    luck: "Cát",
    summary: "Quẻ bình yên: việc đang làm ổn định, người đi xa vẫn an, bệnh tình thuyên giảm. Hợp cầu tài, giữ nếp cũ.",
  },
  "Lưu Liên": {
    name: "Lưu Liên",
    order: 2,
    luck: "Hung",
    summary: "Quẻ trì trệ: việc kéo dài, khó dứt điểm, người đi chưa về. Nên kiên nhẫn chờ thời, tránh nóng vội.",
  },
  "Tốc Hỷ": {
    name: "Tốc Hỷ",
    order: 3,
    luck: "Cát",
    summary: "Quẻ tin vui đến nhanh: cầu tài, gặp gỡ, tìm đồ thất lạc đều sớm có kết quả; nên làm sớm trong khung giờ.",
  },
  "Xích Khẩu": {
    name: "Xích Khẩu",
    order: 4,
    luck: "Hung",
    summary: "Quẻ khẩu thiệt: dễ cãi vã, kiện cáo, hiểu lầm; nên giữ lời, tránh tranh luận và ký kết.",
  },
  "Tiểu Cát": {
    name: "Tiểu Cát",
    order: 5,
    luck: "Cát",
    summary: "Quẻ may mắn nhỏ: mưu sự hòa thuận, có người giúp, tin tức tốt; hợp giao dịch, gặp gỡ.",
  },
  "Không Vong": {
    name: "Không Vong",
    order: 6,
    luck: "Hung",
    summary: "Quẻ trống rỗng: việc dễ đổ bể, cầu tài khó thành, đồ mất khó tìm; nên tránh việc quan trọng.",
  },
};

/* ------------------------------------------------------------------ */
/* Ngày xuất hành (Khổng Minh)                                         */
/* ------------------------------------------------------------------ */

export type XuatHanhInfo = InfoEntry & { luck: Luck; /** Nhóm tháng âm lịch dùng vòng tên này. */ months: string };

const XH_GROUP_A = "Tháng 1, 4, 7, 10 âm lịch";
const XH_GROUP_B = "Tháng 2, 5, 8, 11 âm lịch";
const XH_GROUP_C = "Tháng 3, 6, 9, 12 âm lịch";

export const XUAT_HANH_INFO: Record<string, XuatHanhInfo> = withAliases<XuatHanhInfo>(
  {
    // Vòng 6 ngày
    "Đường Phong": {
      name: "Đường Phong",
      luck: "Cát",
      months: XH_GROUP_A,
      summary: "Như đi đường gặp gió thuận: chuyến đi suôn sẻ, dễ được người có thế lực giúp đỡ.",
    },
    "Kim Thổ": {
      name: "Kim Thổ",
      luck: "Hung",
      months: XH_GROUP_A,
      summary: "Ra đi dễ gặp trục trặc, tiền bạc không như ý; nếu không gấp thì nên dời ngày.",
    },
    "Kim Dương": {
      name: "Kim Dương",
      luck: "Cát",
      months: XH_GROUP_A,
      summary: "Đường đi thông thoáng, công việc trôi chảy, có lợi về tiền bạc.",
    },
    "Thuần Dương": {
      name: "Thuần Dương",
      luck: "Cát",
      months: XH_GROUP_A,
      summary: "Khí dương thuần, đi lại thuận lợi; việc lớn có cơ hội thành công.",
    },
    "Đạo Tặc": {
      name: "Đạo Tặc",
      luck: "Hung",
      months: XH_GROUP_A,
      summary: "Tên ngày đã báo điềm mất mát: đi xa dễ hao của, cần giữ đồ cẩn thận.",
    },
    "Hảo Thương": {
      name: "Hảo Thương",
      luck: "Cát",
      months: XH_GROUP_A,
      summary: "Ngày tốt cho người buôn bán: ra đi thuận lợi, làm ăn có lời.",
    },
    // Vòng 8 ngày nhóm "Thiên"
    "Thiên Đạo": {
      name: "Thiên Đạo",
      luck: "Hung",
      months: XH_GROUP_B,
      summary: "Đi xa hay cầu tài dễ vướng cản trở; có được việc thì cũng tốn kém.",
    },
    "Thiên Môn": {
      name: "Thiên Môn",
      luck: "Cát",
      months: XH_GROUP_B,
      summary: "Như cửa trời rộng mở: lên đường vừa ý, mong gì dễ được nấy.",
    },
    "Thiên Đường": {
      name: "Thiên Đường",
      luck: "Cát",
      months: XH_GROUP_B,
      summary: "Ra ngoài gặp quý nhân, buôn bán có lời, việc gì cũng thuận.",
    },
    "Thiên Tài": {
      name: "Thiên Tài",
      luck: "Cát",
      months: XH_GROUP_B,
      summary: "Ngày đi xa rất tốt, cầu tài được lộc, có người nâng đỡ.",
    },
    "Thiên Tặc": {
      name: "Thiên Tặc",
      luck: "Hung",
      months: XH_GROUP_B,
      summary: "Khởi hành bất lợi, đường sá nhiều trở ngại, dễ mất của.",
    },
    "Thiên Dương": {
      name: "Thiên Dương",
      luck: "Cát",
      months: XH_GROUP_B,
      summary: "Lên đường gặp may, có người trợ giúp, làm ăn khấm khá.",
    },
    "Thiên Hầu": {
      name: "Thiên Hầu",
      luck: "Hung",
      months: XH_GROUP_B,
      summary: "Đi đường dễ gặp chuyện bất ngờ, va chạm hoặc cãi vã; nên hạn chế đi xa.",
    },
    "Thiên Thương": {
      name: "Thiên Thương",
      luck: "Cát",
      months: XH_GROUP_B,
      summary: "Rất hợp đi gặp cấp trên hoặc lo việc tiền bạc; công việc nhìn chung thuận buồm.",
    },
    // Vòng 8 ngày nhóm Bạch Hổ – Thanh Long
    "Bạch Hổ Đầu": {
      name: "Bạch Hổ Đầu",
      luck: "Cát",
      months: XH_GROUP_C,
      summary: "Ứng với phần đầu hổ trắng, khí thế mạnh: đi đâu cũng được việc.",
    },
    "Bạch Hổ Kiếp": {
      name: "Bạch Hổ Kiếp",
      luck: "Cát",
      months: XH_GROUP_C,
      summary: "Chuyến đi như ý, hướng nào cũng có thể gặp may.",
    },
    "Bạch Hổ Túc": {
      name: "Bạch Hổ Túc",
      luck: "Hung",
      months: XH_GROUP_C,
      summary: "Ứng với chân hổ, bước đi nặng nề: không hợp đi xa, việc lớn dễ dang dở.",
    },
    "Huyền Vũ": {
      name: "Huyền Vũ",
      luck: "Hung",
      months: XH_GROUP_C,
      summary: "Ra đường hay gặp chuyện bất hòa, cãi cọ, lòng không yên.",
    },
    "Thanh Long Đầu": {
      name: "Thanh Long Đầu",
      luck: "Cát",
      months: XH_GROUP_C,
      summary: "Ứng với đầu rồng xanh: lên đường thuận, càng tốt nếu khởi hành từ sớm.",
    },
    "Thanh Long Kiếp": {
      name: "Thanh Long Kiếp",
      luck: "Cát",
      months: XH_GROUP_C,
      summary: "Đi lại thông suốt, mọi việc diễn ra như mong muốn.",
    },
    "Thanh Long Túc": {
      name: "Thanh Long Túc",
      luck: "Hung",
      months: XH_GROUP_C,
      summary: "Ứng với chân rồng, khí đã yếu: khởi hành kém may, việc dự định khó thành.",
    },
    "Chu Tước": {
      name: "Chu Tước",
      luck: "Hung",
      months: XH_GROUP_C,
      summary: "Chim đỏ chủ khẩu thiệt: ra đi không tốt, việc hay bỏ dở, dễ dính thị phi.",
    },
  },
  { "Thiên đạo": "Thiên Đạo" },
);

/* ------------------------------------------------------------------ */
/* 24 tiết khí                                                         */
/* ------------------------------------------------------------------ */

export type TietKhiInfo = InfoEntry & {
  /** Nghĩa của tên. */
  meaning: string;
  /** "Tiết" mở đầu tháng tiết khí, "Khí" (trung khí) ở giữa tháng. */
  kind: "Tiết" | "Khí";
  /** Tháng theo lịch tiết khí: 1 = tháng Dần (từ Lập Xuân) … 12 = tháng Sửu. */
  month: number;
  season: "Xuân" | "Hạ" | "Thu" | "Đông";
  /** Kinh độ Mặt Trời lúc bắt đầu (độ). */
  longitude: number;
  /** Ngày dương lịch thường gặp. */
  approxDate: string;
};

const SEASONS = ["Xuân", "Hạ", "Thu", "Đông"] as const;

/** [tên, nghĩa tên, kinh độ, ngày dương lịch thường gặp, ghi chú]; bắt đầu từ Lập Xuân. */
const TIET_KHI_SEEDS: [string, string, number, string, string][] = [
  ["Lập Xuân", "Bắt đầu mùa xuân", 315, "4/2", "Mở đầu tháng Giêng (tháng Dần) theo tiết khí và là mốc đổi năm trong Tứ trụ."],
  ["Vũ Thủy", "Mưa ẩm", 330, "19/2", "Băng giá tan, mưa xuân nhiều lên, cây cối đâm chồi."],
  ["Kinh Trập", "Sâu bọ thức giấc", 345, "6/3", "Sấm đầu mùa, côn trùng ngủ đông tỉnh dậy; mở đầu tháng Hai (Mẹo)."],
  ["Xuân Phân", "Giữa xuân", 0, "21/3", "Ngày và đêm dài gần bằng nhau, đánh dấu giữa mùa xuân."],
  ["Thanh Minh", "Trời trong sáng", 15, "5/4", "Khí trời trong mát, là dịp tảo mộ tổ tiên; mở đầu tháng Ba (Thìn)."],
  ["Cốc Vũ", "Mưa nuôi lúa", 30, "20/4", "Mưa nhiều, thuận cho lúa và hoa màu sinh trưởng."],
  ["Lập Hạ", "Bắt đầu mùa hè", 45, "6/5", "Mở đầu mùa hè và tháng Tư (Tị) theo tiết khí."],
  ["Tiểu Mãn", "Lúa bắt đầu căng hạt", 60, "21/5", "Hạt lúa vào sữa, mùa màng đầy dần nhưng chưa chín."],
  ["Mang Chủng", "Gieo hạt có râu", 75, "6/6", "Lúc gieo trồng các loại hạt có râu như lúa; mở đầu tháng Năm (Ngọ)."],
  ["Hạ Chí", "Giữa hè", 90, "21/6", "Ngày dài nhất, đêm ngắn nhất ở Bắc bán cầu; dương khí lên đỉnh rồi bắt đầu suy."],
  ["Tiểu Thử", "Nóng nhẹ", 105, "7/7", "Bắt đầu những ngày nắng nóng; mở đầu tháng Sáu (Mùi)."],
  ["Đại Thử", "Nóng nhất", 120, "23/7", "Giai đoạn oi bức nhất trong năm."],
  ["Lập Thu", "Bắt đầu mùa thu", 135, "8/8", "Mở đầu mùa thu và tháng Bảy (Thân); khí trời dịu dần."],
  ["Xử Thử", "Hết nóng", 150, "23/8", "Cái nóng lui dần, miền Bắc thường có mưa ngâu."],
  ["Bạch Lộ", "Sương trắng", 165, "8/9", "Đêm se lạnh, hơi nước đọng thành sương; mở đầu tháng Tám (Dậu)."],
  ["Thu Phân", "Giữa thu", 180, "23/9", "Ngày và đêm dài gần bằng nhau, đánh dấu giữa mùa thu."],
  ["Hàn Lộ", "Sương lạnh", 195, "8/10", "Sương đêm lạnh hơn, trời chuyển mát rõ; mở đầu tháng Chín (Tuất)."],
  ["Sương Giáng", "Sương giá xuống", 210, "23/10", "Sương mù dày, vùng lạnh bắt đầu có sương giá; khép lại mùa thu."],
  ["Lập Đông", "Bắt đầu mùa đông", 225, "7/11", "Mở đầu mùa đông và tháng Mười (Hợi)."],
  ["Tiểu Tuyết", "Tuyết nhỏ", 240, "22/11", "Khí lạnh tăng, phương Bắc bắt đầu có tuyết rơi nhẹ."],
  ["Đại Tuyết", "Tuyết lớn", 255, "7/12", "Tuyết rơi dày ở vùng lạnh; mở đầu tháng Mười Một (Tý)."],
  ["Đông Chí", "Giữa đông", 270, "22/12", "Đêm dài nhất năm; âm khí cực thịnh, dương khí bắt đầu sinh lại."],
  ["Tiểu Hàn", "Rét nhẹ", 285, "6/1", "Bắt đầu vào rét; mở đầu tháng Chạp (Sửu)."],
  ["Đại Hàn", "Rét đậm", 300, "20/1", "Đợt rét nhất năm, khép lại vòng 24 tiết khí."],
];

export const TIET_KHI_INFO: Record<string, TietKhiInfo> = Object.fromEntries(
  TIET_KHI_SEEDS.map(([name, meaning, longitude, approxDate, note], index) => {
    const month = Math.floor(index / 2) + 1;
    const info: TietKhiInfo = {
      name,
      meaning,
      kind: index % 2 === 0 ? "Tiết" : "Khí",
      month,
      season: SEASONS[Math.floor((month - 1) / 3)],
      longitude,
      approxDate,
      summary: `Mặt Trời ở kinh độ ${longitude}°, thường rơi vào khoảng ${approxDate} dương lịch. ${note}`,
    };
    return [name, info];
  }),
);

/* ------------------------------------------------------------------ */
/* Quan niệm dân gian                                                  */
/* ------------------------------------------------------------------ */

export type DanGianInfo = InfoEntry & { luck: Luck };

export const DAN_GIAN_INFO: Record<string, DanGianInfo> = {
  "Tam Nương": {
    name: "Tam Nương",
    luck: "Hung",
    summary:
      "Các ngày 3, 7, 13, 18, 22, 27 âm lịch. Dân gian tin rằng khởi sự việc lớn như cưới hỏi, khai trương, xuất hành vào những ngày này dễ gặp trắc trở.",
  },
  "Nguyệt Kị": {
    name: "Nguyệt Kị",
    luck: "Hung",
    summary:
      "Các ngày 5, 14, 23 âm lịch, quen gọi là ngày \"mùng năm, mười bốn, hăm ba\". Người xưa khuyên tránh đi xa và làm việc hệ trọng.",
  },
  "Dương Công Kị": {
    name: "Dương Công Kị",
    luck: "Hung",
    summary:
      "13 ngày xấu cố định trong năm âm lịch do Dương Quân Tùng tổng kết (như 13/1, 11/2, 9/3, 7/4, 5/5, 3/6, 27/8, 25/9, 23/10, 21/11, 19/12 và hai ngày trong tháng 7). Kỵ khởi công, cưới hỏi, đi xa.",
  },
  "Sóc Vọng": {
    name: "Sóc Vọng",
    luck: "Cát",
    summary:
      "Ngày mùng 1 (Sóc) và rằm (Vọng) âm lịch. Theo tín ngưỡng phương Đông là lúc trời đất giao hòa, hợp lễ bái, cầu an, sám hối; nhiều người đi chùa vào những ngày này.",
  },
  "Vong Linh": {
    name: "Vong Linh",
    luck: "Bình",
    summary:
      "Ngày kề sau Sóc hoặc Vọng (thường là mùng 2 và 16 âm lịch) được lịch dân gian ghi chú riêng. Không xếp vào ngày kiêng kỵ, việc thường ngày vẫn làm được.",
  },
  "Nguyệt Tận": {
    name: "Nguyệt Tận",
    luck: "Hung",
    summary:
      "Ngày cuối cùng của tháng âm lịch (29 hoặc 30). Khí của tháng đã cạn nên người xưa kiêng khởi sự việc mới.",
  },
  "Tứ Tuyệt": {
    name: "Tứ Tuyệt",
    luck: "Hung",
    summary:
      "Ngày liền trước Lập Xuân, Lập Hạ, Lập Thu, Lập Đông: khí mùa cũ đã kiệt mà mùa mới chưa tới. Kỵ khởi công, xuất hành, cưới hỏi.",
  },
  "Tứ Ly": {
    name: "Tứ Ly",
    luck: "Hung",
    summary:
      "Ngày liền trước Xuân Phân, Hạ Chí, Thu Phân, Đông Chí, lúc âm dương đang tách lìa để chuyển giao. Kỵ cưới hỏi, xuất hành và việc lớn.",
  },
  "Ngày Thường": {
    name: "Ngày Thường",
    luck: "Bình",
    summary:
      "Không rơi vào ngày kiêng kỵ nào theo quan niệm dân gian; tốt xấu xét theo các yếu tố khác như Trực, sao, Hoàng/Hắc Đạo.",
  },
};

/* ------------------------------------------------------------------ */
/* Tương quan ngũ hành Can – Chi của ngày                              */
/* ------------------------------------------------------------------ */

export type TuongQuanInfo = InfoEntry & {
  /** Quan hệ sinh khắc giữa Can và Chi ngày. */
  relation: "Can sinh Chi" | "Chi sinh Can" | "Can Chi đồng hành" | "Can khắc Chi" | "Chi khắc Can";
  luck: Luck;
  /** Ví dụ một ngày thuộc loại này. */
  example: string;
};

export const TUONG_QUAN_INFO: Record<string, TuongQuanInfo> = {
  "Bảo Nhật Đại Kiết": {
    name: "Bảo Nhật Đại Kiết",
    relation: "Can sinh Chi",
    luck: "Cát",
    example: "Giáp Ngọ (Mộc sinh Hỏa)",
    summary:
      "Thiên can sinh cho địa chi: khí từ trên đổ xuống thuận chiều, ngày rất tốt, việc gì cũng dễ thành.",
  },
  "Thoa Nhật Tiểu Kiết": {
    name: "Thoa Nhật Tiểu Kiết",
    relation: "Chi sinh Can",
    luck: "Cát",
    example: "Giáp Tý (Thủy sinh Mộc)",
    summary:
      "Địa chi sinh cho thiên can: bên dưới nâng đỡ bên trên, ngày tốt vừa phải, hợp việc cần người hỗ trợ.",
  },
  "Bát Chuyên Đồng Khí": {
    name: "Bát Chuyên Đồng Khí",
    relation: "Can Chi đồng hành",
    luck: "Bình",
    example: "Giáp Dần (cùng Mộc)",
    summary:
      "Can và Chi cùng một hành: khí thuần nhất, chuyên chú. Ngày bình hòa, hợp việc cần giữ vững hơn là việc phải dung hòa nhiều bên.",
  },
  "Chế Nhật Tiểu Hung": {
    name: "Chế Nhật Tiểu Hung",
    relation: "Can khắc Chi",
    luck: "Hung",
    example: "Canh Dần (Kim khắc Mộc)",
    summary:
      "Thiên can khắc địa chi: bên trên chế ngự bên dưới, ngày hơi xấu; công việc dễ gò bó nhưng vẫn kiểm soát được.",
  },
  "Phạt Nhật Đại Hung": {
    name: "Phạt Nhật Đại Hung",
    relation: "Chi khắc Can",
    luck: "Hung",
    example: "Bính Tý (Thủy khắc Hỏa)",
    summary:
      "Địa chi khắc thiên can: bên dưới phạm lên bên trên, khí ngày nghịch. Ngày rất xấu, nên tránh việc trọng đại.",
  },
};
