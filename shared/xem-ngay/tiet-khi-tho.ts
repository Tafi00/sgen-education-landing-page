/**
 * Lời tiết khí theo lịch dân gian — nội dung hiện khi rê chuột vào "Nhị thập tứ khí" ở trang Xem ngày.
 *
 * Khách (anh Phạm Bá Nha, 24/10/2026) yêu cầu lấy đúng nội dung của trang mẫu xemngay.thayphongthuy.vn: mỗi tiết khí có
 * tên gọi dân gian riêng ("Sương Mù Xuất Hiện") và vị trí trong tháng tiết khí ("Cuối Tháng 09"); hai tiết khí cùng tháng
 * dùng chung bài thơ chọn ngày của tháng đó (ngày tốt, Sát Chủ, Thọ Tử, thiên hỏa, sát sư, ngày trùng, thủy triều)
 * và phần chú thích (trùng tang, trùng phục, Tứ phế, Tứ Ly, Tứ Tuyệt). Chép nguyên văn; chỉ sửa khoảng trắng sau dấu chấm
 * và viết hoa đầu câu chú thích. Dòng rỗng trong bài thơ là chỗ ngắt khổ.
 */

export type TietKhiTho = {
  name: string;
  /** Tên gọi dân gian, VD "Sương Mù Xuất Hiện". */
  subtitle: string;
  /** "(Cuối Tháng 09 Theo Lịch Tiết Khí)" — tiết mở đầu tháng là "Đầu", trung khí là "Cuối". */
  period: string;
  /** Tháng theo lịch tiết khí: 1 = tháng Giêng (từ Lập Xuân) … 12 = tháng Chạp. */
  month: number;
  verse: readonly string[];
  notes: readonly string[];
};

/** Bài thơ chọn ngày và chú thích của từng tháng tiết khí. */
const MONTHS: Record<number, { verse: readonly string[]; notes: readonly string[] }> = {
  1: {
    verse: [
      "Tháng giêng chính nguyệt xuân phong",
      "Mẹo Dậu Hợi nhật với cùng vị Thân",
      "Ấy là đại cát mười phần",
      "Dùng làm mọi việc ân cần chẳng sai",
      "",
      "Ngày Tuất Thọ Tử cho hay",
      "Mồng năm mười chín là ngay thủy triều",
      "",
      "Trùng tang Canh Giáp chẳng yên",
      "Ngày Tị Sát Chủ mọi điều chẳng yên",
      "Đạo chiêm Hợi Tý chớ quên",
      "Ngày Tý thiên hỏa chớ nên làm nhà",
      "Tý Dần sát sư đó mà",
      "Ngày Tuất Hợi vi ấy là không vong",
      "Ba xuân cũng vậy cho thông.",
    ],
    notes: [
      "Trùng tang Canh, trùng phục Giáp. Thiên địa trùng phục Tị Hợi.",
      "Tứ phế Canh Thân, Tân Dậu. Tứ Ly trước xuân phân 1 ngày. Tứ Tuyệt trước lập xuân 1 ngày.",
    ],
  },
  2: {
    verse: [
      "Tháng hai trạch nhật cát hung lại bày",
      "Vị Thân và Tuất mấy ngày",
      "Dùng làm mọi việc thật hay yên lành",
      "Ngày Thìn Thọ Tử cho minh",
      "Mồng ba mười bảy nước sinh là ngày",
      "Cùng ngày mười chín cho hay",
      "Tân Ất trùng nhật là ngày chẳng nghi",
      "Ngày Tý Sát Chủ làm gì",
      "Ngày Mẹo thiên hỏa vậy thì cho nhanh",
      "Sát sư Tị Mẹo rành rành.",
    ],
    notes: [
      "Trùng tang Tân, trùng phục Ất. Thiên địa trùng phục Tị Hợi.",
      "Tứ phế Canh Thân, Tân Dậu. Tứ Ly trước xuân phân 1 ngày. Tứ Tuyệt trước lập xuân 1 ngày.",
    ],
  },
  3: {
    verse: [
      "Tháng ba lại kể phân minh từng ngày",
      "Thìn Tị Dậu Tuất lành thay",
      "Ngày Hợi Thọ Tử chẳng yêu",
      "Mười ba thủy Triều hăm bảy nước sinh",
      "Ngày Mùi Sát Chủ cho minh",
      "Trùng tang Mậu Kỷ thực tình ngày hung",
      "Ngọ là thiên hỏa cho thông",
      "Sát ư ngày vị (Mùi) đại hung chẳng lành.",
    ],
    notes: [
      "Trùng tang Mậu, trùng phục Kỷ. Thiên địa trùng phục Tị Hợi.",
      "Tứ phế Canh Thân, Tân Dậu. Tứ Ly trước xuân phân 1 ngày. Tứ Tuyệt trước lập xuân 1 ngày.",
    ],
  },
  4: {
    verse: [
      "Tháng tư lại kể tinh anh",
      "Tý Tuất Ngọ nhật yên lành tốt thay",
      "Ngày Tị Thọ Tử cho hay",
      "Mẹo là Sát Chủ từ nay chớ lầm",
      "Mười một cùng với hăm lăm",
      "Nước sinh ngày ấy cớ làm việc chi",
      "Sát sư ngày Mẹo phải ghi",
      "Dậu là thiên hỏa Bính Nhâm ngày trùng",
      "Tý Dần và Tị không vong",
      "Mùa hạ cũng phải cho thông chớ lầm.",
    ],
    notes: [
      "Trùng tang Bính, trùng phục Nhâm. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Nhâm Tý, Quý Hợi. Tứ Ly trước hạ chí 1 ngày, Tứ Tuyệt trước lập hạ một ngày.",
    ],
  },
  5: {
    verse: [
      "Lại xem đến kỳ tháng năm",
      "Vị Tuất Thìn nhật dụng tâm cho tường",
      "Ba ngày đại cát cát xương",
      "Khởi sự mọi việc lo lường đều nên",
      "Ngày Tý Thọ Tử chớ quên",
      "Cũng là thiên hỏa chớ nên làm nhà",
      "Mồng chín cùng với hăm ba",
      "Thủy triều con nước nhớ mà chớ quên",
      "Ngày Thân Sát Chủ nhớ nghiền",
      "Lại thêm Đinh Quý nối liền trùng tang.",
    ],
    notes: [
      "Trùng tang Đinh, trùng phục Quý. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Nhâm Tý, Quý Hợi. Tứ Ly trước hạ chí 1 ngày, Tứ Tuyệt trước lập hạ một ngày.",
    ],
  },
  6: {
    verse: [
      "Tháng sáu lại kể tỏ tường",
      "Vị Thân ấy thực là đường tốt thay",
      "Ngày Tuất Sát Chủ nhớ ngay",
      "Mồng bảy hai mốt là ngày nước sinh",
      "Ngọ thời Thọ Tử cho minh",
      "Mẹo là thiên hỏa nhắc mình chớ quên",
      "Trùng tang Mậu Kỷ nhớ bền",
      "Sát sư ngày Tuất phải nghiền cho thông.",
    ],
    notes: [
      "Trùng tang Kỷ, trùng phục Mậu. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Nhâm Tý, Quý Hợi. Tứ Ly trước hạ chí 1 ngày, Tứ Tuyệt trước lập hạ một ngày.",
    ],
  },
  7: {
    verse: [
      "Tháng bảy Dần Tuất đẹp lòng",
      "Sửu là Sát Chủ chẳng xong tý nào",
      "Cũng là Thọ Tử đó sao",
      "Ngày Ngọ thiên hỏa thế nào chẳng thông",
      "Giáp Canh là những ngày trùng",
      "Đạo chiêm Tị Ngọ chẳng dùng làm chi",
      "Sát sư ngày Ngọ tránh đi",
      "Dậu Thân Sửu nhật ấy thì không vong",
      "Ba thu cùng vậy tương đồng",
      "Thủy triều phải nhớ như cùng tháng giêng. (5, 19)",
    ],
    notes: [
      "Trùng tang Canh, trùng phục Giáp. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Giáp Dần, Ất Mẹo. Tứ Ly trước thu phân 1 ngày, Tứ Tuyệt trước lập thu một ngày.",
    ],
  },
  8: {
    verse: [
      "Tháng tám lại kể cho tinh",
      "Sửu Dần ngày ấy phân minh rõ ràng",
      "Dùng làm mọi việc an khang",
      "Ngày Hợi Sát Chủ tai ương đã đành",
      "Vị (Mùi) là Thọ Tử chẳng lành",
      "Ngày trùng Tân Ất rõ ràng phân minh",
      "Ngày Dậu thiên hỏa đinh ninh",
      "Sát sư ngày Hợi cho minh chớ lầm",
      "Mọi điều cẩn thận cao thâm",
      "Thủy triều muốn biết đi tầm tháng hai. (3, 17, 19)",
    ],
    notes: [
      "Trùng tang Tân, trùng phục Ất. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Giáp Dần, Ất Mẹo. Tứ Ly trước thu phân 1 ngày, Tứ Tuyệt trước lập thu một ngày.",
    ],
  },
  9: {
    verse: [
      "Tháng chín lại nhớ không sai",
      "Mẹo Tị Thân Tuất Hợi thời tốt thay",
      "Sát Chủ ngày Ngọ chẳng sai",
      "Sát sư ngày Sửu ghi ngay vào lòng",
      "Mậu Kỷ là những ngày trùng",
      "Ngày Dần Thọ Tử đại hung đó mà",
      "Ngày Tý thiên hỏa kể ra",
      "Thủy triều như tháng ba đà kể trên. (13, 27)",
    ],
    notes: [
      "Trùng tang Kỷ, trùng phục Mậu. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Giáp Dần, Ất Mẹo. Tứ Ly trước thu phân 1 ngày, Tứ Tuyệt trước lập thu một ngày.",
    ],
  },
  10: {
    verse: [
      "Tháng mười kể tiếp một thiên",
      "Ngày Thìn Tị Tuất cũng nên kiếm dùng",
      "Ngày Mẹo thiên hỏa thực hung",
      "Ngày Dậu Sát Chủ chớ dùng chẳng nên",
      "Ngày Thân Thọ Tử nêu lên",
      "Mùa đông Thân Dậu đạo chiêm chớ lầm",
      "Trùng tang tháng này Bính Nhâm",
      "Sát sư ngày Dậu Mẹo Dần không vong",
      "Thủy triều tứ nguyệt tương đồng",
      "Kể là mười một với cùng hăm lăm.",
    ],
    notes: [
      "Trùng tang Nhâm, trùng phục Bính. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Bính Ngọ, Đinh Tị. Tứ Ly trước đông chí 1 ngày, Tứ Tuyệt trước lập đông một ngày.",
    ],
  },
  11: {
    verse: [
      "Mười một tháng ấy chẳng lầm",
      "Sửu Thìn Tị Tuất thực nhằm lành thay",
      "Ngày Dần Sát Chủ cho hay",
      "Mẹo là Thọ Tử từ rày nhớ ghi",
      "Tý Dần kiêm kị sát sư",
      "Thiên hỏa tháng này Ngọ nhật đồng tương",
      "Thủy triều lại giống tháng năm",
      "Kể là mười một với cùng hăm lăm.",
    ],
    notes: [
      "Trùng tang Quý, trùng phục Đinh. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Bính Ngọ, Đinh Tị. Tứ Ly trước đông chí 1 ngày, Tứ Tuyệt trước lập đông một ngày.",
    ],
  },
  12: {
    verse: [
      "Tháng chạp lại xin kể ra",
      "Dần Thân vị nhật ấy là cát tinh",
      "Ngày Thìn Sát Chủ chẳng lành",
      "Dậu là Thọ Tử hỏa tinh nhật đồng",
      "Sát sư Thìn nhật ghi thông",
      "Trùng phục, ngày trùng Mậu Kỷ chẳng sai",
      "Thủy triều mồng bảy nhớ dai",
      "Cùng ngày hai mốt ai ơi cho tường",
      "Bốn mùa trực nhật cát xương",
      "Ai ai học thuộc các chương làu làu",
      "Tháng ngày tường cả trước sau",
      "Danh xưng tiêu dạ mới hầu tiên sư.",
    ],
    notes: [
      "Trùng tang Mậu, trùng phục Kỷ. Thiên địa trùng phục Tị, Hợi.",
      "Tứ phế: Bính Ngọ, Đinh Tị. Tứ Ly trước đông chí 1 ngày, Tứ Tuyệt trước lập đông một ngày.",
    ],
  },
};

/** Tên gọi dân gian và vị trí trong tháng của 24 tiết khí. */
const TERMS: Record<string, { subtitle: string; position: "Đầu" | "Cuối"; month: number }> = {
  "Lập Xuân": { subtitle: "Bắt Đầu Mùa Xuân", position: "Đầu", month: 1 },
  "Vũ Thủy": { subtitle: "Mưa Ẩm", position: "Cuối", month: 1 },
  "Kinh Trập": { subtitle: "Sâu Nở", position: "Đầu", month: 2 },
  "Xuân Phân": { subtitle: "Giữa Xuân", position: "Cuối", month: 2 },
  "Thanh Minh": { subtitle: "Trời Trong Sáng", position: "Đầu", month: 3 },
  "Cốc Vũ": { subtitle: "Mưa Rào", position: "Cuối", month: 3 },
  "Lập Hạ": { subtitle: "Bắt Đầu Mùa Hè", position: "Đầu", month: 4 },
  "Tiểu Mãn": { subtitle: "Lũ Nhỏ", position: "Cuối", month: 4 },
  "Mang Chủng": { subtitle: "Chòm Sao Tua Rua Mọc", position: "Đầu", month: 5 },
  "Hạ Chí": { subtitle: "Giữa Hè", position: "Cuối", month: 5 },
  "Tiểu Thử": { subtitle: "Nóng Nhẹ", position: "Đầu", month: 6 },
  "Đại Thử": { subtitle: "Nóng Oi", position: "Cuối", month: 6 },
  "Lập Thu": { subtitle: "Bắt Đầu Mùa Thu", position: "Đầu", month: 7 },
  "Xử Thử": { subtitle: "Mưa Ngâu", position: "Cuối", month: 7 },
  "Bạch Lộ": { subtitle: "Nắng Nhạt", position: "Đầu", month: 8 },
  "Thu Phân": { subtitle: "Giữa Thu", position: "Cuối", month: 8 },
  "Hàn Lộ": { subtitle: "Mát Mẻ", position: "Đầu", month: 9 },
  "Sương Giáng": { subtitle: "Sương Mù Xuất Hiện", position: "Cuối", month: 9 },
  "Lập Đông": { subtitle: "Bắt Đầu Mùa Đông", position: "Đầu", month: 10 },
  "Tiểu Tuyết": { subtitle: "Tuyết Xuất Hiện", position: "Cuối", month: 10 },
  "Đại Tuyết": { subtitle: "Tuyết Dày", position: "Đầu", month: 11 },
  "Đông Chí": { subtitle: "Giữa Đông", position: "Cuối", month: 11 },
  "Tiểu Hàn": { subtitle: "Giữa Đông", position: "Đầu", month: 12 },
  "Đại Hàn": { subtitle: "Rét Đậm", position: "Cuối", month: 12 },
};

export function tietKhiTho(name: string): TietKhiTho | undefined {
  const term = TERMS[name];
  const month = term && MONTHS[term.month];
  if (!term || !month) return undefined;
  return {
    name,
    subtitle: term.subtitle,
    period: `(${term.position} Tháng ${String(term.month).padStart(2, "0")} Theo Lịch Tiết Khí)`,
    month: term.month,
    verse: month.verse,
    notes: month.notes,
  };
}
