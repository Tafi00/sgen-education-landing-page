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
 * việc. Nội dung mang tính tham khảo theo lịch pháp truyền thống.
 */

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

export type TrucInfo = InfoEntry & {
  /** Thứ tự trong vòng 12 trực, Kiến = 1 … Bế = 12. */
  order: number;
  /** Cách đọc phổ biến khác của tên trực. */
  alias?: string;
  /** Ngũ hành của trực. */
  element: string;
  /** Đánh giá chung: "Tốt" | "Xấu" | "Tùy việc". */
  luck: "Tốt" | "Xấu" | "Tùy việc";
  /** Ghi chú ngắn đi kèm mức tốt xấu. */
  luckNote: string;
  /** Diễn ý câu Bành Tổ kị nhật của trực. */
  saying: string;
  /** Ý nghĩa tên trực. */
  meaning: string;
  /** Việc nên làm (tên việc thông dụng). */
  suitable: string[];
  /** Việc không nên làm (tên việc thông dụng). */
  avoid: string[];
  /** Việc "Nghi" theo thuật ngữ Hán Việt cổ. */
  nghi: string[];
  /** Việc "Kị" theo thuật ngữ Hán Việt cổ. */
  ki: string[];
  /** Sao trùng với trực trong tháng. */
  stars?: { good: string[]; bad: string[] };
};

export const TRUC_INFO: Record<string, TrucInfo> = withAliases<TrucInfo>(
  {
    "Kiên": {
      name: "Trực Kiên",
      order: 1,
      alias: "Kiến",
      element: "Thổ",
      luck: "Tùy việc",
      luckNote: "Thuận cho xuất hành, kém cho động thổ",
      saying: "Ngày Kiến thuận lên đường đi xa, nhưng đừng mở kho xuất của.",
      meaning: "Kiến là dựng lên: sinh khí của tháng vừa đứng vững, vạn vật đang lúc mạnh mẽ.",
      summary:
        "Trực mở đầu vòng 12 trực, rơi vào ngày có chi trùng chi của tháng. Hợp khởi sự, đi xa, nhận chức; nên tránh đào đất, động thổ, an táng và mở kho.",
      suitable: ["Xuất hành", "Khởi đầu việc mới", "Nhận chức", "Giao thiệp", "Ký giao ước"],
      avoid: ["Động thổ, đắp nền", "Lợp nhà", "Đào ao, giếng", "An táng", "Mở kho", "Kê giường", "Dạm hỏi", "Nộp đơn từ"],
      nghi: [
        "An phủ biên cảnh", "Chiêu hiền", "Cử chánh trực", "Giao thiệp", "Huấn binh", "Hành hạnh", "Khiển sử",
        "Lâm chánh thân dân", "Phó nhậm", "Thi ân phong bái", "Thiêm ước", "Thượng quan", "Tuyển tướng", "Xuất hành",
        "Xuất sư",
      ],
      ki: [
        "An táng", "Chỉnh dung thế đầu", "Chỉnh thủ túc giáp", "Cầu tự", "Cầu y", "Doanh kiến cung thất", "Giải trừ",
        "Hoại viên", "Hưng tạo", "Khai thương khố", "Khải toản", "Kỳ phúc", "Kết hôn nhân", "Liệu bệnh", "Nạp thái",
        "Phá thổ", "Phá ốc", "Phạt mộc", "Thiện thành quách", "Thượng biểu chương", "Thượng lương", "Thượng sách",
        "Thụ trụ", "Tiến biểu chương", "Tu cung thất", "Tu thương khố", "Tu trí sản thất", "Tài chủng", "Vấn danh",
        "Xuất hóa tài", "Động thổ",
      ],
      stars: { good: [], bad: ["Thổ Phủ"] },
    },
    "Trừ": {
      name: "Trực Trừ",
      order: 2,
      element: "Thủy",
      luck: "Tốt",
      luckNote: "Tốt cho việc bỏ cũ, chữa bệnh",
      saying: "Ngày Trừ hợp bốc thuốc, chữa trị; bệnh tật dễ dứt.",
      meaning: "Trừ là quét bỏ: dọn đi điều xấu, cái cũ để đón cái mới.",
      summary:
        "Ngày dọn dẹp, hợp thanh lý đồ cũ, chữa bệnh, cắt tóc, xả tang. Không hợp cưới hỏi, đi xa hay bỏ vốn lớn.",
      suitable: [
        "Dọn dẹp, thanh lý đồ cũ", "Chữa bệnh, châm cứu", "Uống thuốc", "Cắt tóc", "Làm hàng rào", "Đắp nền",
        "Cúng Táo quân", "Xả tang",
      ],
      avoid: ["Cưới hỏi", "Đi xa", "Xuất kho, xuất tiền", "Bỏ vốn làm ăn", "Hội họp đông người"],
      nghi: [
        "Bàn thiên", "Chỉnh dung thế đầu", "Chỉnh thủ túc giáp", "Cầu y", "Cử chánh trực", "Giải trừ", "Hành hạnh",
        "Khiển sử", "Liệu bệnh", "Lâm chánh thân dân", "Mộc dục", "Nhập hỏa", "Phó nhậm", "Thi ân phong bái",
        "Thượng quan", "Tảo xá vũ", "Tống lễ", "Xuất hành", "Xuất hóa", "Động thổ",
      ],
      ki: ["Kết hôn nhân", "Thiêm ước", "Viễn hành"],
    },
    "Mãn": {
      name: "Trực Mãn",
      order: 3,
      element: "Thổ",
      luck: "Tùy việc",
      luckNote: "Tốt cho cúng tế, cầu tài; kém với việc khác",
      saying: "Ngày Mãn thuận mở hàng buôn bán, nhưng uống thuốc lại dễ rước họa.",
      meaning: "Mãn là đầy đủ: kho trời sung túc, mùa màng no đủ.",
      summary:
        "Ngày đầy, hợp việc tiền của như mở hàng, mua bán, thu nợ, nhập kho. Tránh dùng cho chôn cất, nhận chức, uống thuốc và đơn từ.",
      suitable: [
        "Khai trương", "Mua bán", "Cho vay, thu nợ", "Nhập kho", "Sửa kho", "Dựng nhà", "Xuất hành", "Học nghề",
      ],
      avoid: ["An táng", "Nhận chức", "Uống thuốc", "Nộp đơn từ", "Dạm hỏi"],
      nghi: [
        "Bổ viên", "Cầu tài", "Giao dịch", "Khai thương khố", "Khai thị", "Kinh lạc", "Lập khoán", "Lập khế",
        "Nạp tài", "Tiến nhân khẩu", "Tu thương khố", "Tài chế", "Tắc huyệt", "Xuất hóa tài",
      ],
      ki: [
        "Chiêu hiền", "Cầu y", "Cử chánh trực", "Kết hôn nhân", "Liệu bệnh", "Lâm chánh thân dân", "Nạp thái",
        "Phó nhậm", "Thi ân phong bái", "Thượng quan", "Vấn danh",
      ],
      stars: { good: ["Thiên Phủ"], bad: ["Thổ Ôn", "Quả Tú", "Thiên Cẩu"] },
    },
    "Bình": {
      name: "Trực Bình",
      order: 4,
      element: "Thủy",
      luck: "Tùy việc",
      luckNote: "Ngày trung bình, việc nhỏ dùng được",
      saying: "Ngày Bình hợp trát vữa, san lấp; riêng kê đặt giường mới thì nên tránh.",
      meaning: "Bình là bằng phẳng, quân bình: ngày yên ả, không nghiêng hẳn về tốt hay xấu.",
      summary:
        "Ngày trung bình, hợp san bằng, sửa đường, tô trát, bồi đắp. Không nên dùng cho việc trọng đại như khai trương, động thổ hay đào khoét.",
      suitable: [
        "Sửa đường, bắc cầu", "Sửa tường rào", "Nạo vét, san lấp", "Bồi đắp, xây kè", "Nhập kho ngũ cốc",
        "Gác đòn dông", "Hạ thủy thuyền",
      ],
      avoid: [
        "Khai trương", "Động thổ", "Kê, đóng giường", "Nhận chức, thừa kế", "Đào mương, đào giếng", "Tháo nước",
      ],
      nghi: ["Bình trì đạo đồ", "Phá thổ", "Tu sức viên tường"],
      ki: [
        "An phủ biên cảnh", "An sàng", "An táng", "Ban chiếu", "Bàn di", "Chiêu hiền", "Cầu tự", "Cầu y", "Cổ chú",
        "Cử chánh trực", "Doanh kiến cung thất", "Giao dịch", "Giá thú", "Giải trừ", "Huấn binh", "Hành hạnh",
        "Hưng tạo", "Khai cừ xuyên tỉnh", "Khai thương khố", "Khai thị", "Khiển sử", "Khánh tứ", "Khải toản",
        "Kinh lạc", "Kỳ phúc", "Kết hôn nhân", "Liệu bệnh", "Lâm chánh thân dân", "Lập khoán", "Mục dưỡng",
        "Nạp súc", "Nạp thái", "Nạp tài", "Phó nhậm", "Quan đới", "Thi ân phong bái", "Thiện thành quách",
        "Thưởng hạ", "Thượng biểu chương", "Thượng lương", "Thượng quan", "Thượng sách", "Thụ trụ",
        "Tiến biểu chương", "Tiến nhân khẩu", "Trúc đê phòng", "Tu cung thất", "Tu thương khố", "Tu trí sản thất",
        "Tuyên bố chánh sự", "Tuyển tướng", "Tài chế", "Tài chủng", "Uấn nhưỡng", "Vấn danh", "Xuất hóa tài",
        "Xuất sư", "Yến hội", "Động thổ",
      ],
      stars: { good: [], bad: ["Tiểu Hao"] },
    },
    "Định": {
      name: "Trực Định",
      order: 5,
      element: "Mộc",
      luck: "Tốt",
      luckNote: "Tốt cho cầu tài, ký kết, tiệc tùng; kỵ kiện tụng, chữa bệnh",
      saying: "Ngày Định hợp mua thêm vật nuôi và cho con em đi học.",
      meaning: "Định là yên vị: mọi việc ổn định, có nền nếp.",
      summary:
        "Ngày yên ổn, hợp việc cần bền vững như ký kết, buôn bán, xây dựng, nhập học, dạm hỏi. Nên tránh kiện tụng, đi xa và chữa bệnh.",
      suitable: [
        "Ký kết, giao dịch", "Buôn bán", "Xây dựng, đắp nền", "Sửa bếp", "Lắp đặt máy móc", "Nhập học", "Dạm hỏi",
        "Nộp đơn từ", "Tiệc tùng", "Nuôi gia súc",
      ],
      avoid: ["Kiện tụng, tranh chấp", "Đi xa", "Chữa bệnh"],
      nghi: [
        "Giá thú", "Khai thị", "Khởi tạo", "Kỳ phúc", "Nhập học", "Nhập hỏa", "Quan đới", "Thượng nhâm", "Trang tu",
        "Tu lộ", "Tạo ốc", "Tế tự", "Động thổ",
      ],
      ki: ["Giao thiệp", "Tố tụng", "Xuất hành"],
      stars: { good: ["Tam Hợp", "Thiên Giải"], bad: ["Đại Hao", "Tử Khí", "Quan Phù"] },
    },
    "Chấp": {
      name: "Trực Chấp",
      order: 6,
      element: "Hỏa",
      luck: "Tùy việc",
      luckNote: "Tốt cho xây dựng, truy bắt; kém cho xuất hành, khai trương",
      saying: "Ngày Chấp thuận cho việc truy bắt; kẻ gian khó thoát.",
      meaning: "Chấp là nắm giữ: gìn giữ, duy trì những gì đã có.",
      summary:
        "Ngày nắm giữ, hợp thu nhận người, lập khế ước, khởi công xây dựng và truy bắt. Không hợp xuất hành, dời chỗ, khai trương hay bỏ vốn.",
      suitable: [
        "Khởi công xây dựng", "Đắp nền", "Lập khế ước", "Tuyển người", "Chữa bệnh", "Săn bắt", "Truy bắt kẻ gian",
      ],
      avoid: ["Xuất hành", "Chuyển nhà", "Khai trương", "Bỏ vốn làm ăn", "Cho vay", "Mở kho"],
      nghi: ["Giá thú", "Thú cấu", "Trang tu", "Tạo ốc", "Tế tự"],
      ki: [
        "Bàn thiên", "Giao dịch", "Khai thương khố", "Khai thị", "Kinh doanh", "Lập khoán", "Nạp tài", "Tu thương khố",
        "Xuất hành", "Xuất hóa tài",
      ],
    },
    "Phá": {
      name: "Trực Phá",
      order: 7,
      element: "Hỏa",
      luck: "Xấu",
      luckNote: "Xấu cho việc lớn; chỉ hợp chữa bệnh, phá dỡ",
      saying: "Ngày Phá nên dùng để chữa bệnh, người ốm mau hồi phục.",
      meaning: "Phá là vỡ ra: ngày xung với tháng (Nguyệt Phá), sinh khí tan rã.",
      summary:
        "Ngày xung với tháng nên đại kỵ việc trọng đại như cưới hỏi, khai trương, động thổ, ký kết. Chỉ thích hợp phá dỡ nhà cũ, bỏ đồ hỏng và chữa bệnh.",
      suitable: ["Phá dỡ nhà cũ", "Đập tường, dỡ kho", "Chữa bệnh", "Uống thuốc"],
      avoid: [
        "Cưới hỏi", "Khai trương, mở hàng", "Động thổ, đắp nền", "Cho vay", "Kê giường", "Nhận chức", "Nhập học",
        "Nộp đơn từ",
      ],
      nghi: ["Cầu y", "Hoại viên", "Liệu bệnh", "Phá thổ", "Phá ốc", "Sách tá"],
      ki: [
        "An phủ biên cảnh", "An sàng", "An táng", "An đối ngại", "Ban chiếu", "Bàn di", "Bổ viên", "Chiêu hiền",
        "Chỉnh dung thế đầu", "Chỉnh thủ túc giáp", "Cầu tự", "Cổ chú", "Cử chánh trực", "Doanh kiến cung thất",
        "Giao dịch", "Giá thú", "Huấn binh", "Hành hạnh", "Hưng tạo", "Khai cừ", "Khai thương khố", "Khai thị",
        "Khiển sử", "Khánh tứ", "Khải toản", "Kinh lạc", "Kỳ phúc", "Kết hôn nhân", "Lâm chánh thân dân", "Lập khoán",
        "Mục dưỡng", "Nạp súc", "Nạp thái", "Nạp tài", "Phó nhậm", "Phạt mộc", "Quan đới", "Thi ân phong bái",
        "Thiện thành quách", "Thưởng hạ", "Thượng biểu chương", "Thượng lương", "Thượng quan", "Thượng sách",
        "Thụ trụ", "Tiến biểu chương", "Tiến nhân khẩu", "Trúc đê phòng", "Tu cung thất", "Tu sức viên tường",
        "Tu thương khố", "Tu trí sản thất", "Tuyên bố chánh sự", "Tuyển tướng", "Tài chế", "Tài chủng", "Tắc huyệt",
        "Uấn nhưỡng", "Vấn danh", "Xuyên tỉnh", "Xuất hóa tài", "Xuất sư", "Yến hội", "Động thổ",
      ],
      stars: { good: [], bad: ["Nguyệt Phá"] },
    },
    "Nguy": {
      name: "Trực Nguy",
      order: 8,
      element: "Thủy",
      luck: "Tùy việc",
      luckNote: "Nhiều rủi ro, cần thận trọng",
      saying: "Ngày Nguy đánh bắt ven bờ còn được, ra khơi đi thuyền thì bất lợi.",
      meaning: "Nguy là hiểm nghèo: ngày dễ gặp trắc trở, cần dè dặt.",
      summary:
        "Ngày tiềm ẩn rủi ro, việc lớn phần nhiều nên tránh, nhất là đi đường thủy, leo cao, cưới hỏi, khai trương. Việc nhỏ như kê giường, cúng bái vẫn dùng được.",
      suitable: ["Kê, đóng giường", "Đánh bắt cá", "Săn bắt", "Cúng tế, cầu phúc", "Làm lò gốm, lò nhuộm"],
      avoid: [
        "Khai trương", "Hùn hạp", "Cưới hỏi", "Đi thuyền, đường thủy", "Leo núi", "Đốn cây", "An táng", "Xuất hành",
      ],
      nghi: [
        "An phủ biên cảnh", "An sàng", "Huấn binh", "Huấn luyện", "Kỳ phúc", "Phá thổ", "Sách tá", "Tuyển tướng",
        "Tế tự",
      ],
      ki: ["Giá thú", "Phạt mộc", "Thiên tỉ", "Thủ ngư", "Thừa thuyền", "Tạo táng", "Xuất hành", "Điền liệp", "Đăng sơn"],
    },
    "Thành": {
      name: "Trực Thành",
      order: 9,
      element: "Kim",
      luck: "Tốt",
      luckNote: "Tốt cho xuất hành, cưới hỏi, khai trương; kỵ kiện tụng",
      saying: "Ngày Thành hợp cho việc học; đưa nhau ra kiện thì khó phân thắng.",
      meaning: "Thành là nên việc: vạn vật đến lúc hoàn tất, được xem là ngày đại cát.",
      summary:
        "Một trong những trực tốt nhất, thuận cho hầu hết việc lớn: khai trương, cưới hỏi, dựng nhà, nhập học, ký kết, xuất hành. Chỉ nên tránh kiện tụng, tranh chấp.",
      suitable: [
        "Khai trương", "Cưới hỏi", "Dựng nhà, động thổ", "Nhập học, học nghề", "Ký kết, giao dịch", "Xuất hành",
        "Chuyển nhà", "Cúng tế", "Chữa bệnh", "Đào ao, giếng", "Hạ thủy thuyền",
      ],
      avoid: ["Kiện tụng", "Tranh chấp", "An táng"],
      nghi: [
        "An phủ biên cảnh", "Bàn di", "Cầu tài", "Khai thị", "Lập khế", "Mục dưỡng", "Nhập học", "Thụ trụ",
        "Trúc đê phòng", "Tài chủng", "Xuất hành",
      ],
      ki: ["Tố tụng"],
      stars: { good: ["Thiên Hỷ", "Tam Hợp"], bad: ["Cô Thần"] },
    },
    "Thâu": {
      name: "Trực Thâu",
      order: 10,
      alias: "Thu",
      element: "Thủy",
      luck: "Tùy việc",
      luckNote: "Tốt cho thu hoạch, nhập kho; kỵ khởi công, xuất hành, an táng",
      saying: "Ngày Thâu hợp gom góp, làm việc thiện; nhưng nên giữ của cẩn thận.",
      meaning: "Thâu (Thu) là gặt hái: thu về những gì đã gieo, cất vào kho.",
      summary:
        "Ngày thu gom, hợp nhập kho, thu nợ, thu hoạch mùa màng, mua gia súc. Không nên khởi công việc mới, xuất hành, chi tiền lớn hay làm tang lễ.",
      suitable: [
        "Thu hoạch, gặt hái", "Nhập kho, cất trữ", "Thu nợ, nhập tài", "Mua gia súc", "Xây kho", "Đắp nền",
        "Kê giường", "Nhận chức", "Nộp đơn từ",
      ],
      avoid: ["Khởi công việc mới", "Xuất hành", "Chi tiền, xuất vốn", "Tang lễ, an táng", "Cưới hỏi"],
      nghi: [
        "An đối ngại", "Bình trì đạo đồ", "Bổ viên", "Bộ tróc", "Chỉnh dung thế đầu", "Chỉnh thủ túc giáp",
        "Hoãn hình ngục", "Hành huệ ái", "Mộc dục", "Mục dưỡng", "Nhập học", "Nạp súc", "Nạp tài", "Phá ốc hoại viên",
        "Phạt mộc", "Thi ân huệ", "Thủ ngư", "Tiến nhân khẩu", "Tu sức viên tường", "Tu thương khố", "Tuyết oan uổng",
        "Tuất cô quỳnh", "Tài chủng", "Tảo xá vũ", "Tắc huyệt", "Tế tự", "Tứ xá", "Điền liệp", "Đàm ân",
      ],
      ki: [
        "An phủ biên cảnh", "An sàng", "An táng", "Ban chiếu", "Bàn di", "Chiêu hiền", "Cầu tự", "Cầu y", "Cổ chú",
        "Cử chánh trực", "Doanh kiến cung thất", "Giao dịch", "Giá thú", "Giải trừ", "Huấn binh", "Hành hạnh",
        "Hưng tạo", "Khai cừ", "Khai thương khố", "Khai thị", "Khiển sử", "Khánh tứ", "Khải toản", "Kinh lạc",
        "Kỳ phúc", "Kết hôn nhân", "Liệu bệnh", "Lâm chánh thân dân", "Lập khoán", "Nạp thái", "Phá thổ", "Phó nhậm",
        "Quan đới", "Thi ân phong bái", "Thiện thành quách", "Thưởng hạ", "Thượng lương", "Thượng quan",
        "Thượng sách", "Thụ trụ", "Tiến biểu chương",
      ],
      stars: { good: [], bad: ["Địa Phá"] },
    },
    "Khai": {
      name: "Trực Khai",
      order: 11,
      element: "Kim",
      luck: "Tốt",
      luckNote: "Tốt hầu hết việc, trừ an táng và đào huyệt",
      saying: "Ngày Khai hợp nhận chức, cầu quan; dùng để chôn cất thì không lành.",
      meaning: "Khai là mở ra: khởi đầu thông suốt, mọi việc được khai mở.",
      summary:
        "Ngày khai thông, rất hợp để bắt đầu: khai trương, nhập học, nhận chức, xuất hành, chữa bệnh. Kiêng an táng, tang lễ và việc đào huyệt.",
      suitable: [
        "Khai trương", "Nhập học, học nghề", "Nhận chức", "Xuất hành", "Sửa nhà, làm bếp", "Kê giường",
        "Đào ao, giếng, khơi mương", "Chữa bệnh", "Nuôi gia súc", "Lắp đặt máy móc",
      ],
      avoid: ["An táng", "Tang lễ", "Đào huyệt", "Đốn cây, trồng cây", "Kiện tụng", "Săn bắt"],
      nghi: [
        "An sàng", "An đối ngại", "Ban chiếu", "Bàn di", "Chiêu hiền", "Cầu tự", "Cầu y", "Cử chánh trực", "Giải trừ",
        "Hoãn hình ngục", "Hành huệ ái", "Hành hạnh", "Hưng tạo", "Khai cừ", "Khai thị", "Khiển sử", "Khánh tứ",
        "Kỳ phúc", "Liệu bệnh", "Lâm chánh thân dân", "Mục dưỡng", "Nhập học", "Phó nhậm", "Thi ân huệ",
        "Thi ân phong bái", "Thiện thành quách", "Thưởng hạ", "Thượng biểu chương", "Thượng lương", "Thượng quan",
        "Thượng sách", "Thụ trụ", "Tiến biểu chương", "Tu cung thất", "Tu trí sản thất", "Tuyên chánh sự",
        "Tuyết oan uổng", "Tuất cô quỳnh", "Tài chế", "Tài chủng", "Tế tự", "Tứ xá", "Xuyên tỉnh", "Xuất hành",
        "Yến hội", "Đàm ân", "Động thổ",
      ],
      ki: ["An táng", "Khải toản", "Phá thổ", "Phóng trái", "Phạt mộc", "Thủ ngư", "Tố tụng", "Điền liệp"],
      stars: { good: ["Sinh Khí"], bad: [] },
    },
    "Bế": {
      name: "Trực Bế",
      order: 12,
      element: "Kim",
      luck: "Tùy việc",
      luckNote: "Hợp việc đóng lại, lấp kín; kỵ mở mới",
      saying: "Ngày Bế tránh chữa bệnh về mắt; hợp nhất là kê đặt giường.",
      meaning: "Bế là đóng kín: ngày cuối vòng 12 trực, trời đất khép lại, cất giấu.",
      summary:
        "Ngày khép lại, hợp đắp, lấp, xây tường, đặt táng, làm nhà vệ sinh. Không nên khai trương, nhận chức, đào ao giếng, kiện tụng hay chữa bệnh mắt.",
      suitable: [
        "Xây đắp tường", "Lấp hố", "An táng", "Gắn cửa, gác đòn dông", "Làm nhà vệ sinh",
        "Bốc thuốc, chữa bệnh (trừ bệnh mắt)", "Chiết cành",
      ],
      avoid: [
        "Khai trương", "Nhận chức, thừa kế", "Đào ao, giếng", "Kiện tụng", "Chữa bệnh mắt", "Nhập học", "Nuôi tằm",
        "Cưới hỏi", "Xuất hành",
      ],
      nghi: [
        "Bổ viên", "Kỳ phúc", "Mai huyệt", "Mai trì", "Trúc đê phòng", "Tu ốc", "Tạo táng", "Tắc huyệt", "Tế tự",
        "Điền bổ",
      ],
      ki: [
        "An sàng", "Ban chiếu", "Bàn di", "Chiêu hiền", "Cầu y", "Cử chánh trực", "Doanh kiến cung thất", "Giá thú",
        "Hành hạnh", "Hưng tạo", "Khai cừ", "Khai thương khố", "Khai thị", "Khiển sử", "Khánh tứ", "Kết hôn nhân",
        "Liệu bệnh", "Lâm chánh thân dân", "Nạp thái", "Phó nhậm", "Thi ân phong bái", "Thưởng hạ",
        "Thượng biểu chương", "Thượng lương", "Thượng quan", "Thượng sách", "Thụ trụ", "Tiến biểu chương",
        "Tiến nhân khẩu", "Tu cung thất", "Tu trí sản thất", "Tuyên bố chánh sự", "Vấn danh", "Xuyên tỉnh",
        "Xuất hành", "Xuất hóa tài", "Xuất sư", "Yến hội", "Động thổ",
      ],
    },
  },
  { "Kiến": "Kiên", "Thu": "Thâu" },
);

/* ------------------------------------------------------------------ */
/* Nhị thập bát tú                                                     */
/* ------------------------------------------------------------------ */

export type Tu28Info = InfoEntry & {
  /** Thứ tự từ Giác (1) tới Chẩn (28). */
  order: number;
  /** Tên gọi tắt của sao. */
  short: string;
  /** Thất diệu của sao: Mộc, Kim, Thổ, Nhật, Nguyệt, Hỏa, Thủy. */
  element: string;
  /** Con vật tượng trưng (tướng tinh). */
  animal: string;
  luck: "Tốt" | "Xấu";
  /** Vị tướng ứng với sao (Vân Đài nhị thập bát tướng). */
  general: string;
  /** Ngày trong tuần do sao chủ trị. */
  weekday: string;
  /** Chòm Tứ tượng và phương. */
  group: string;
  /** Đánh giá ngắn theo hai trường phái. */
  views: { trungHoa: string; vietNam: string };
  suitable: string[];
  avoid: string[];
  /** Trường hợp ngoại lệ theo chi ngày (Đăng Viên, Phục Đoạn, Diệt Một…). */
  exception?: string;
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

type Tu28Seed = Omit<Tu28Info, "name" | "order" | "element" | "weekday" | "group">;

/** Danh sách theo thứ tự Giác → Chẩn; ngũ hành, ngày chủ trị và chòm suy ra từ tên và vị trí. */
const TU28_SEEDS: [string, Tu28Seed][] = [
  ["Giác Mộc Giao", {
    short: "Giác", animal: "Giao long", luck: "Tốt", general: "Đặng Vũ",
    views: { trungHoa: "Xấu cho hôn nhân, tế tự, mai táng", vietNam: "Tốt, riêng mai táng xấu" },
    summary: "Sao đứng đầu chòm Thanh Long, chủ về vinh hiển. Rất hợp xây dựng, cưới hỏi và thi cử; điều kỵ chính là chôn cất, sửa sang mồ mả.",
    suitable: ["Khởi công xây dựng", "Cưới hỏi", "Thi cử, cầu công danh"],
    avoid: ["An táng", "Sửa mộ"],
    exception: "Ngày Dần là Đăng Viên, mọi việc hanh thông. Ngày Ngọ phạm Phục Đoạn Sát: tránh chôn cất, xuất hành, thừa kế. Ngày Sóc phạm Diệt Một: kỵ đi thuyền, nấu rượu.",
  }],
  ["Can Kim Long", {
    short: "Cang", animal: "Rồng", luck: "Xấu", general: "Ngô Hán",
    views: { trungHoa: "Xấu cho hôn nhân, tế tự, mai táng", vietNam: "Xấu mọi việc" },
    summary: "Sao dữ của chòm Thanh Long, dễ kéo theo tang chế, kiện cáo và hao tán điền sản. Gần như chỉ hợp may vá.",
    suitable: ["Cắt may áo, màn"],
    avoid: ["An táng", "Cưới hỏi", "Kiện tụng", "Xây nhà"],
    exception: "Thuộc Thất Sát tinh. Gặp ngày Hợi, Mẹo, Mùi lại tốt, nhất là ngày Mùi. Ngày rằm phạm Diệt Một: kỵ đi thuyền, nấu rượu, nhận chức.",
  }],
  ["Đê Thổ Lạc", {
    short: "Đê", animal: "Lạc (loài lửng)", luck: "Xấu", general: "Giả Phục",
    views: { trungHoa: "Tốt, tăng tài lộc", vietNam: "Xấu mọi việc" },
    summary: "Đại hung tinh, hầu như không việc nào hợp. Đặc biệt tránh xây dựng, chôn cất, cưới hỏi và đi đường sông nước.",
    suitable: [],
    avoid: ["Khởi công xây dựng", "An táng", "Cưới hỏi", "Xuất hành đường thủy"],
    exception: "Gặp ngày Thân, Tý, Thìn thì dùng được, tốt nhất ngày Thìn (Đăng Viên).",
  }],
  ["Phòng Nhật Thố", {
    short: "Phòng", animal: "Thỏ", luck: "Tốt", general: "Cảnh Yêm",
    views: { trungHoa: "Mọi việc bất lợi", vietNam: "Tốt mọi việc" },
    summary: "Đại cát tinh của chòm Thanh Long, việc lớn đều thuận, từ dựng nhà, cưới hỏi đến xuất hành, an táng. Gần như không phải kiêng gì.",
    suitable: ["Xây nhà", "An táng", "Cưới hỏi", "Xuất hành", "Đi thuyền", "Mưu sự", "Khai hoang", "Cắt may"],
    avoid: [],
    exception: "Ngày Dậu là Đăng Viên, càng tốt. Các ngày Kỷ Tị, Đinh Tị, Kỷ Dậu, Quý Dậu, Đinh Sửu, Tân Sửu vẫn tốt nhưng kỵ chôn cất. Ngày Tị phạm Phục Đoạn Sát.",
  }],
  ["Tâm Nguyệt Hồ", {
    short: "Tâm", animal: "Cáo", luck: "Xấu", general: "Khấu Tuân",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Hung tinh, làm việc gì cũng khó trọn vẹn và dễ vướng thị phi. Nên tránh mọi việc khởi tạo, nhất là xây cất, cưới hỏi, chôn cất.",
    suitable: [],
    avoid: ["Xây dựng", "Cưới hỏi", "An táng", "Kê giường", "Kiện tụng"],
    exception: "Ngày Dần là Đăng Viên, có thể dùng cho việc nhỏ.",
  }],
  ["Vĩ Hỏa Hổ", {
    short: "Vĩ", animal: "Hổ", luck: "Tốt", general: "Sầm Bành",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh, hợp hầu hết việc dựng xây, thủy lợi, cưới hỏi, khai trương. Chỉ nên tránh kê giường mới và đi thuyền.",
    suitable: ["Khởi tạo", "An táng", "Cưới hỏi", "Xây dựng", "Trổ cửa", "Đào ao, giếng", "Khai mương", "Khai trương", "Khai hoang"],
    avoid: ["Kê, đóng giường", "Đi thuyền"],
    exception: "Ngày Hợi, Mẹo, Mùi kỵ chôn cất; ngày Mùi là Hãm Địa. Ngày Kỷ Mẹo rất xấu, các ngày Mẹo khác tạm dùng.",
  }],
  ["Cơ Thủy Báo", {
    short: "Cơ", animal: "Báo", luck: "Tốt", general: "Phùng Dị",
    views: { trungHoa: "Xấu cho hôn nhân, tu tạo", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh cuối chòm Thanh Long, thuận cho xây cất, mộ phần, khai trương, xuất hành và thủy lợi. Kiêng đóng giường, đi đường thủy.",
    suitable: ["Khởi tạo", "An táng", "Sửa mộ", "Trổ cửa", "Khai trương", "Xuất hành", "Tháo nước, đào kênh"],
    avoid: ["Kê, đóng giường", "Đi thuyền"],
    exception: "Gặp ngày Thân, Tý, Thìn thì kỵ nhiều việc (ngày Tý tạm dùng). Ngày Thìn là Đăng Viên nhưng phạm Phục Đoạn: tránh chôn cất, xuất hành, chia gia tài.",
  }],
  ["Đẩu Mộc Giải", {
    short: "Đẩu", animal: "Giải (dân gian gọi là cua)", luck: "Tốt", general: "Tống Hữu",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh mở đầu chòm Huyền Vũ, tốt cho xây cất, buôn bán, giao dịch và công danh. Rất kỵ đi thuyền.",
    suitable: ["Xây, sửa mộ phần", "Trổ cửa", "Thủy lợi", "Khai hoang", "May mặc", "Kinh doanh, giao dịch", "Cầu công danh"],
    avoid: ["Đi thuyền"],
    exception: "Ngày Tị kém sức, ngày Dậu tốt. Ngày Sửu là Đăng Viên nhưng phạm Phục Đoạn: tránh chôn cất, xuất hành, thừa kế.",
  }],
  ["Ngưu Kim Ngưu", {
    short: "Ngưu", animal: "Trâu", luck: "Xấu", general: "Sái Tuân",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Hung tinh chòm Huyền Vũ, khởi sự việc gì cũng dễ hao tổn. Lạ là lại hợp đi thuyền và may mặc.",
    suitable: ["Đi thuyền", "Cắt may"],
    avoid: ["Xây nhà", "Cưới hỏi", "Trổ cửa", "Thủy lợi", "Gieo cấy", "Khai trương", "Xuất hành đường bộ"],
    exception: "Thuộc Thất Sát tinh. Ngày Ngọ là Đăng Viên, ngày Tuất bình yên. Ngày Dần là Tuyệt Nhật (trừ Nhâm Dần). Rơi vào 14 âm lịch phạm Diệt Một: kỵ đi thuyền.",
  }],
  ["Nữ Thổ Bức", {
    short: "Nữ", animal: "Dơi", luck: "Xấu", general: "Cảnh Đan",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Hung tinh, phần lớn việc khởi tạo đều bất lợi. Chỉ dùng được cho may vá, kết màn.",
    suitable: ["Kết màn, may áo"],
    avoid: ["Trổ cửa", "Tháo nước", "An táng", "Kiện tụng"],
    exception: "Ngày Hợi, Mẹo, Mùi bị coi là bước đường cùng, nặng nhất là Quý Hợi. Ngày Mẹo phạm Phục Đoạn: tránh chôn cất, xuất hành, chia gia tài.",
  }],
  ["Hư Nhật Thử", {
    short: "Hư", animal: "Chuột", luck: "Xấu", general: "Cái Duyên",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Chữ Hư nghĩa là trống rỗng, hư hao; sao này hầu như không hợp việc gì. Nhất là tránh xây cất, cưới hỏi, khai trương.",
    suitable: [],
    avoid: ["Xây nhà", "Cưới hỏi", "Khai trương", "Trổ cửa", "Tháo nước, đào kênh"],
    exception: "Gặp ngày Thân, Tý, Thìn thì dùng được, tốt nhất ngày Thìn. Ngày Tý là Đăng Viên nhưng phạm Phục Đoạn. Ngày 7, 8, 22, 23 âm lịch phạm Diệt Một: kỵ đi thuyền.",
  }],
  ["Nguy Nguyệt Yến", {
    short: "Nguy", animal: "Chim én", luck: "Xấu", general: "Kiên Đàm",
    views: { trungHoa: "Xấu nhiều tốt ít", vietNam: "Xấu mọi việc" },
    summary: "Hung tinh chủ về nguy hiểm, nên tránh xây cao, trổ cửa và việc liên quan sông nước. Riêng chôn cất và kê giường lại yên ổn.",
    suitable: ["An táng", "Kê giường"],
    avoid: ["Dựng nhà", "Trổ cửa", "Gác đòn dông", "Tháo nước, đào mương", "Đi thuyền"],
    exception: "Gặp ngày Tị, Dậu, Sửu thì tốt, nhất là ngày Dậu. Ngày Sửu là Đăng Viên, làm việc được hiển đạt.",
  }],
  ["Thất Hỏa Trư", {
    short: "Thất", animal: "Lợn", luck: "Tốt", general: "Cảnh Thuần",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Đại cát tinh, trăm việc khởi công đều thuận, đặc biệt là dựng nhà, cưới hỏi, an táng. Không có điều gì cần kiêng.",
    suitable: ["Xây nhà", "Cưới hỏi", "An táng", "Trổ cửa", "Thủy lợi", "Đi thuyền", "Khai hoang"],
    avoid: [],
    exception: "Ngày Dần, Ngọ, Tuất nhìn chung tốt; ngày Ngọ là Đăng Viên. Bính Dần, Nhâm Dần, Giáp Ngọ rất hợp xây dựng, an táng; các ngày Dần khác phạm Phục Đoạn.",
  }],
  ["Bích Thủy Du", {
    short: "Bích", animal: "Du (dân gian gọi là rái cá)", luck: "Tốt", general: "Tang Cung",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh cuối chòm Huyền Vũ, việc gì khởi đầu cũng tốt, kể cả khai trương, xuất hành. Không có việc phải kiêng.",
    suitable: ["Xây nhà", "Cưới hỏi", "An táng", "Trổ cửa", "Thủy lợi", "Khai trương", "Xuất hành", "Làm việc thiện"],
    avoid: [],
    exception: "Gặp ngày Hợi, Mẹo, Mùi thì kỵ nhiều việc, nhất là vào mùa đông. Ngày Hợi là Đăng Viên nhưng phạm Phục Đoạn.",
  }],
  ["Khuê Mộc Lang", {
    short: "Khuê", animal: "Sói", luck: "Xấu", general: "Mã Vũ",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu, riêng xây dựng tốt" },
    summary: "Sao đầu chòm Bạch Hổ, được việc xây dựng và học hành nhưng xấu cho chôn cất, khai trương, trổ cửa.",
    suitable: ["Dựng nhà", "Nhập học", "Cầu công danh", "Cắt may"],
    avoid: ["An táng", "Khai trương", "Trổ cửa", "Khơi đường nước", "Đào ao, giếng", "Kiện tụng", "Kê giường"],
    exception: "Thuộc Thất Sát tinh. Ngày Thân là Đăng Viên, lợi cho tiến thân; ngày Ngọ (nhất là Canh Ngọ) mưu sự đắc lợi; ngày Thìn tốt vừa.",
  }],
  ["Lâu Kim Cẩu", {
    short: "Lâu", animal: "Chó", luck: "Tốt", general: "Lưu Long",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh, chủ về gia đạo thịnh vượng, hợp dựng nhà, cưới hỏi, trổ cửa. Chỉ kiêng đóng giường và đi đường thủy.",
    suitable: ["Dựng cột, cất lầu", "Cưới hỏi", "Trổ cửa", "Thủy lợi", "Cắt may"],
    avoid: ["Kê, đóng giường", "Đi đường thủy"],
    exception: "Ngày Dậu là Đăng Viên, rất lợi; ngày Tị tốt, ngày Sửu tốt vừa. Ngày cuối tháng phạm Diệt Một: kỵ đi thuyền, nấu rượu.",
  }],
  ["Vị Thổ Trĩ", {
    short: "Vị", animal: "Chim trĩ", luck: "Tốt", general: "Ô Thành",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh, chủ phú quý; khởi công việc gì cũng có lợi. Kiêng duy nhất là đi thuyền.",
    suitable: ["Xây dựng", "Cưới hỏi", "An táng", "Khai hoang", "Gieo trồng"],
    avoid: ["Đi thuyền"],
    exception: "Ngày Dần (nhất là Mậu Dần) mất khí, rất xấu cho cưới hỏi, xây nhà. Ngày Tuất là Đăng Viên, hợp cầu công danh nhưng phạm Phục Đoạn.",
  }],
  ["Mão Nhật Kê", {
    short: "Mão", animal: "Gà", luck: "Xấu", general: "Vương Lương",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Hung tinh, ngoài việc xây dựng thì hầu như không hợp. Đặc biệt kỵ chôn cất.",
    suitable: ["Xây dựng"],
    avoid: ["An táng", "Cưới hỏi", "Trổ cửa", "Tháo nước", "Khai trương", "Xuất hành", "Kê giường"],
    exception: "Ngày Mùi mất khí. Ngày Ất Mẹo, Đinh Mẹo tốt; ngày Mẹo là Đăng Viên hợp cưới hỏi; riêng Quý Mẹo khởi công dễ hao tiền.",
  }],
  ["Tất Nguyệt Ô", {
    short: "Tất", animal: "Quạ", luck: "Tốt", general: "Trần Tuấn",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh, lợi cho ruộng vườn, của cải và hôn nhân. Hầu như mọi việc đều dùng được, chỉ tránh đi thuyền.",
    suitable: ["An táng", "Cưới hỏi", "Trổ cửa", "Đào kênh, khơi mương", "Làm ruộng", "Khai trương", "Xuất hành", "Nhập học"],
    avoid: ["Đi thuyền"],
    exception: "Ngày Thân, Tý, Thìn đều tốt; ngày Thân là Đăng Viên, cưới hỏi và an táng đại cát.",
  }],
  ["Chủy Hỏa Hầu", {
    short: "Chủy", animal: "Khỉ", luck: "Xấu", general: "Phó Tuấn",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu, riêng xây dựng tốt" },
    summary: "Hung tinh, dễ vướng chuyện pháp lý, hao tán của cải. Đại kỵ việc chôn cất và mồ mả.",
    suitable: [],
    avoid: ["Khởi công", "An táng", "Sửa mộ", "Làm sinh phần, đóng thọ"],
    exception: "Ngày Tị càng xấu. Ngày Dậu là Đăng Viên (nhưng phạm Phục Đoạn); ngày Sửu đắc địa, Đinh Sửu và Tân Sửu rất tốt.",
  }],
  ["Sâm Thủy Viên", {
    short: "Sâm", animal: "Vượn", luck: "Tốt", general: "Đỗ Mậu",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu, riêng xây dựng tốt" },
    summary: "Sao xếp tốt nhưng có hai mặt: thuận cho xây cất, học hành, thủy lợi; ngược lại không hợp cưới hỏi, chôn cất.",
    suitable: ["Xây nhà", "Trổ cửa", "Nhập học", "Đi thuyền", "Thủy lợi"],
    avoid: ["Cưới hỏi", "An táng", "Kê giường", "Kết bạn"],
    exception: "Ngày Tuất là Đăng Viên, hợp nhận chức, cầu công danh.",
  }],
  ["Tỉnh Mộc Can", {
    short: "Tỉnh", animal: "Hãn (chó rừng)", luck: "Tốt", general: "Diêu Kỳ",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Cát tinh đầu chòm Chu Tước, chủ đỗ đạt và ruộng vườn tươi tốt. Hợp xây cất, học hành, thủy lợi; kỵ việc mồ mả.",
    suitable: ["Xây dựng", "Trổ cửa", "Khơi đường nước", "Đào giếng", "Nhận chức", "Nhập học", "Đi thuyền"],
    avoid: ["An táng", "Sửa mộ", "Làm sinh phần, đóng thọ"],
    exception: "Gặp ngày Hợi, Mẹo, Mùi đều dùng được; ngày Mùi là Nhập Miếu, khởi sự vẻ vang.",
  }],
  ["Quỷ Kim Dương", {
    short: "Quỷ", animal: "Dê", luck: "Xấu", general: "Vương Phách",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Xấu, riêng mai táng tốt" },
    summary: "Hung tinh với việc dựng xây, cưới hỏi, trổ cửa; trái lại rất hợp chôn cất.",
    suitable: ["An táng", "Khai hoang", "Cắt may"],
    avoid: ["Xây nhà", "Cưới hỏi", "Trổ cửa", "Tháo nước", "Đào ao, giếng", "Động thổ", "Xây tường, dựng cột"],
    exception: "Ngày Tý là Đăng Viên, tốt cho thừa kế, nhận chức. Ngày Thân phạm Phục Đoạn. Ngày 16 âm lịch phạm Diệt Một: kỵ đi thuyền.",
  }],
  ["Liễu Thổ Chương", {
    short: "Liễu", animal: "Hoẵng (cheo)", luck: "Xấu", general: "Nhậm Quang",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Hung tinh, không có việc gì hợp; nặng nhất là chôn cất, xây cất và việc sông nước.",
    suitable: [],
    avoid: ["An táng", "Xây đắp", "Trổ cửa", "Tháo nước", "Thủy lợi"],
    exception: "Ngày Ngọ trăm việc tốt; ngày Tị là Đăng Viên, hợp thừa kế, nhận chức. Ngày Dần, Tuất rất kỵ xây cất và an táng.",
  }],
  ["Tinh Nhật Mã", {
    short: "Tinh", animal: "Ngựa", luck: "Xấu", general: "Lý Trung",
    views: { trungHoa: "Xấu nhiều tốt ít", vietNam: "Xấu, riêng xây dựng tốt" },
    summary: "Sao xấu, chỉ có lợi cho việc làm thêm phòng ốc. Tránh cưới hỏi, chôn cất, khơi mương.",
    suitable: ["Xây phòng mới"],
    avoid: ["An táng", "Cưới hỏi", "Khơi thông đường nước"],
    exception: "Thuộc Thất Sát tinh. Ngày Dần, Ngọ, Tuất tốt; ngày Ngọ là Nhập Miếu. Ngày Thân là Đăng Giá: xây cất tốt nhưng chôn cất nguy.",
  }],
  ["Trương Nguyệt Lộc", {
    short: "Trương", animal: "Nai", luck: "Tốt", general: "Vạn Tu",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Xấu mọi việc" },
    summary: "Cát tinh, trăm việc khởi công đều thuận, từ dựng nhà, cưới hỏi đến an táng. Chỉ kiêng việc đóng thuyền, hạ thủy.",
    suitable: ["Xây nhà", "Lợp mái", "Trổ cửa", "Cưới hỏi", "An táng", "Làm ruộng, nuôi tằm", "Khai hoang", "Cắt may", "Thủy lợi"],
    avoid: ["Đóng, sửa thuyền", "Hạ thủy thuyền"],
    exception: "Ngày Hợi, Mẹo, Mùi đều tốt; ngày Mùi là Đăng Viên nhưng phạm Phục Đoạn.",
  }],
  ["Dực Hỏa Xà", {
    short: "Dực", animal: "Rắn", luck: "Xấu", general: "Bi Đồng",
    views: { trungHoa: "Tốt mọi việc", vietNam: "Nhìn chung không tốt" },
    summary: "Hung tinh, gần như chỉ hợp may mặc (được tiền tài). Tránh xây dựng, cưới hỏi, chôn cất.",
    suitable: ["Cắt may"],
    avoid: ["An táng", "Cưới hỏi", "Xây nhà", "Gác đòn dông", "Trổ cửa", "Thủy lợi"],
    exception: "Gặp ngày Thân, Tý, Thìn đều thuận, đẹp nhất là ngày Thìn. Ngày Tý là Đăng Viên, hợp thừa kế, nhận chức.",
  }],
  ["Chẩn Thủy Dẫn", {
    short: "Chẩn", animal: "Giun", luck: "Tốt", general: "Lưu Trực",
    views: { trungHoa: "Xấu mọi việc", vietNam: "Tốt mọi việc" },
    summary: "Sao cuối chòm Chu Tước, chủ thăng tiến và giàu có; hầu hết việc đều tốt. Chỉ tránh đi thuyền.",
    suitable: ["Xây lầu gác", "An táng", "Cưới hỏi", "Dựng phòng", "Xuất hành", "Khai hoang"],
    avoid: ["Đi thuyền"],
    exception: "Ngày Tị, Dậu, Sửu đều tốt; ngày Sửu là Vượng Địa, ngày Tị là Đăng Viên.",
  }],
];

export const TU28_INFO: Record<string, Tu28Info> = withAliases<Tu28Info>(
  Object.fromEntries(
    TU28_SEEDS.map(([name, seed], index) => {
      const element = name.split(" ")[1];
      const info: Tu28Info = {
        name,
        order: index + 1,
        element,
        weekday: WEEKDAY_BY_ELEMENT[element],
        group: TU28_GROUPS[Math.floor(index / 7)],
        ...seed,
      };
      return [name, info];
    }),
  ),
  {
    "Cang Kim Long": "Can Kim Long",
    "Tĩnh Mộc Can": "Tỉnh Mộc Can",
    "Tỉnh Mộc Hãn": "Tỉnh Mộc Can",
    "Liễu Thổ Chướng": "Liễu Thổ Chương",
    "Vỹ Hỏa Hổ": "Vĩ Hỏa Hổ",
    "Truỷ Hỏa Hầu": "Chủy Hỏa Hầu",
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
