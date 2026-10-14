/**
 * Trạng Trình – Nguyễn Bỉnh Khiêm: danh mục việc (mục 1–83) cùng bảng Can Chi ngày tốt cho từng việc.
 *
 * Mỗi mục có một bảng chính (cột Can → các Chi hợp) và có thể thêm bảng phụ (vd "khá tốt" của mục 28).
 * Danh sách mục của một ngày chỉ phụ thuộc Can Chi ngày: ngày có trong bảng chính thì mục được tính,
 * trừ các điều chỉnh ghi trong `TRANG_TRINH_OVERRIDES`. Bảng phụ chỉ để tham khảo, không tính vào danh sách.
 * Các mục không có bảng Can Chi (9, 11, 12, 23–27, 30, 31, 33, 42, 54, 59, 63, 68, 72, 81) không có trong danh mục.
 * Phần tóm tắt và ghi chú được viết lại ngắn gọn; chỉ giữ dữ kiện (tên mục, bảng ngày, trực, tên sao).
 */
import { BRANCHES, STEMS } from "./calendar";

type StemName = (typeof STEMS)[number];
type BranchName = (typeof BRANCHES)[number];
type CanChiName = `${StemName} ${BranchName}`;

export type TrangTrinhTable = { caption?: string; days: Partial<Record<StemName, BranchName[]>> };
export type TrangTrinhMuc = { no: number; title: string; summary: string; tables: TrangTrinhTable[]; notes: string[] };

/**
 * Danh mục theo số mục. Bảng ngày giữ đúng bảng gốc, chỉ sửa ba chỗ lệch cột hiển nhiên (Can và Chi khác âm dương,
 * không thể thành ngày): mục 1 cột Mậu → Kỷ, mục 7 cột Đinh → Mậu (đều khớp công cụ gốc), mục 37 bỏ "Ất Dần".
 */
export const TRANG_TRINH_MUC: Record<number, TrangTrinhMuc> = {
  1: {
    no: 1,
    title: "Đại Minh Nhật",
    summary: "Nhóm ngày Đại Minh, được xem là ngày trời đất quang đãng, dùng chung cho hầu hết việc khởi sự như làm đồ vật, dựng công trình hay bắt đầu một việc mới.",
    tables: [
      { days: { Giáp: ["Thìn", "Thân"], Ất: ["Tị", "Mùi"], Bính: ["Thìn", "Ngọ"], Đinh: ["Sửu", "Hợi"], Kỷ: ["Mẹo", "Mùi", "Dậu"], Canh: ["Thân", "Tuất"], Tân: ["Mùi", "Dậu", "Hợi"], Nhâm: ["Dần", "Thìn", "Ngọ", "Thân"], Quý: ["Dậu"] } },
    ],
    notes: [],
  },
  2: {
    no: 2,
    title: "Khởi Tạo",
    summary: "Ngày bắt đầu chế tạo hoặc xây dựng một thứ mới, chẳng hạn dựng nhà hay đóng thuyền, để công việc về sau suôn sẻ.",
    tables: [
      { days: { Giáp: ["Tuất"], Ất: ["Mẹo", "Dậu", "Hợi"], Kỷ: ["Tị", "Mùi", "Dậu"], Tân: ["Mùi"], Nhâm: ["Tý", "Thân"] } },
    ],
    notes: [
      "Tốt nhất khi gặp trực Thành hoặc Khai.",
    ],
  },
  3: {
    no: 3,
    title: "Tu Tạo",
    summary: "Tám ngày Đại Du Tu dành cho việc sửa sang, thêm bớt công trình đã có hơn là làm mới.",
    tables: [
      { days: { Bính: ["Thìn"], Đinh: ["Tị"], Mậu: ["Ngọ"], Kỷ: ["Mùi"], Canh: ["Thân"], Tân: ["Dậu"], Nhâm: ["Tý"], Quý: ["Sửu"] } },
    ],
    notes: [
      "Tám ngày chia thành hai chuỗi liền nhau: Nhâm Tý – Quý Sửu và Bính Thìn – Tân Dậu.",
      "Việc sửa chữa nên làm xong trong cùng một chuỗi, không kéo sang ngày ngoài chuỗi.",
    ],
  },
  4: {
    no: 4,
    title: "Lợp Nhà, Che Mái, Làm Nóc",
    summary: "Ngày lợp mái, che hiên hay làm phần nóc che mưa nắng cho nhà cửa, kể cả mui ghe.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thìn", "Thân"], Ất: ["Tị", "Mùi", "Dậu"], Mậu: ["Tý", "Dần", "Thìn", "Thân"], Kỷ: ["Sửu", "Mẹo", "Dậu", "Hợi"], Canh: ["Dần"], Tân: ["Sửu", "Hợi"], Nhâm: ["Tý"], Quý: ["Mẹo", "Tị", "Mùi", "Dậu"] } },
    ],
    notes: [],
  },
  5: {
    no: 5,
    title: "Động Đất Ban Nền",
    summary: "Ngày bắt đầu đào xới, san phẳng mặt bằng để chuẩn bị nền trước khi xây cất.",
    tables: [
      { days: { Giáp: ["Tý", "Thìn", "Ngọ", "Thân"], Bính: ["Thân", "Tuất"], Mậu: ["Dần", "Tuất"], Kỷ: ["Mẹo", "Hợi"], Canh: ["Tý", "Thìn"], Tân: ["Tị"], Quý: ["Sửu", "Dậu"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ, Định, Chấp, Thành, Khai.",
      "Hoặc ngày có sao tốt: Thiên Đức, Nguyệt Đức, Thiên Ân, Huỳnh Đạo, Nguyệt Không.",
      "Tránh trực: Kiên, Phá, Bình, Thu.",
      "Tránh sao xấu: Thổ Ôn, Thổ Cấm, Thổ Phủ, Thổ Kị, Thiên Tặc, Cửu Thổ Quỷ, Thiên Địa Chuyển Sát, Nguyệt Kiên Chuyển Sát.",
      "Đại kị động thổ: Quý Mùi, Ất Mùi, Mậu Ngọ.",
    ],
  },
  6: {
    no: 6,
    title: "Xây Đắp Nền, Tường",
    summary: "Ngày đắp nền nhà, nền công trình hoặc xây tường vách.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thân"], Ất: ["Sửu", "Mẹo", "Mùi"], Bính: ["Ngọ"], Đinh: ["Mẹo", "Mùi", "Dậu"], Mậu: ["Thìn"], Kỷ: ["Mẹo", "Hợi"], Canh: ["Ngọ", "Thân"], Tân: ["Tị", "Mùi", "Dậu"], Nhâm: ["Tý"], Quý: ["Sửu"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ, Định, Chấp, Thành, Khai.",
      "Hoặc ngày có sao tốt: Thiên Đức, Nguyệt Đức, Nguyệt Không, Thiên Ân, Huỳnh Đạo.",
      "Tránh trực: Kiên, Phá, Bình, Thu.",
      "Tránh sao xấu: Thổ Ôn, Thổ Cấm, Thổ Phủ, Thổ Kị, Thiên Tặc, Cửu Thổ Quỷ, Thiên Địa Chuyển Sát, Nguyệt Kiên Chuyển Sát.",
      "Riêng xây tường vách: nên tìm ngày Phục Đoạn và trực Bế.",
      "Đại kị: Ất Mùi, Mậu Ngọ, Quý Mùi.",
    ],
  },
  7: {
    no: 7,
    title: "Khởi Công Làm Giàn Gác",
    summary: "Ngày bắt đầu dựng giàn (giàn bếp, giàn giáo…) hoặc làm sàn gác, gác lửng trong nhà.",
    tables: [
      { days: { Giáp: ["Thân", "Tuất"], Ất: ["Mẹo", "Mùi", "Dậu", "Hợi"], Bính: ["Ngọ"], Mậu: ["Tý", "Dần", "Thân"], Kỷ: ["Mẹo", "Tị", "Mùi", "Dậu", "Hợi"], Canh: ["Dần", "Thân"], Tân: ["Mùi", "Dậu"], Nhâm: ["Tý", "Dần", "Ngọ"], Quý: ["Mẹo"] } },
    ],
    notes: [
      "Nên có sao tốt: Thiên Đức, Nguyệt Đức, Nguyệt Không.",
      "Tránh sao xấu: Thiên Tặc, Địa Tặc, Hỏa Tinh, Nguyệt Xung, Tứ Tuyệt, Diệt Một, Xích Khẩu, Đại Không Vong, Phủ Đầu Sát, Mộc Mã Sát, Tiểu Không Vong, Đao Chiến Sát, Phá Bại Nhật, Chánh Tứ Phế, Thiên Địa, Hoang Vu.",
    ],
  },
  8: {
    no: 8,
    title: "Đặt Táng",
    summary: "Ngày đặt táng (đá kê chân cột) để dựng cột nhà; cũng dùng khi lắp cửa hay kê gác.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thân", "Tuất"], Ất: ["Sửu", "Mẹo", "Mùi", "Hợi"], Bính: ["Dần", "Thìn", "Ngọ"], Đinh: ["Tị", "Dậu", "Hợi"], Mậu: ["Tý", "Dần", "Thìn", "Thân", "Tuất"], Kỷ: ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu", "Hợi"], Canh: ["Tý", "Dần", "Ngọ", "Thân"], Tân: ["Tị", "Mùi", "Dậu"], Nhâm: ["Tý", "Dần", "Ngọ"], Quý: ["Sửu", "Mẹo", "Tị", "Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn, Bình, Thành, Khai.",
      "Hoặc ngày có sao tốt: Thiên Đức, Nguyệt Đức, Thiên Đức Hợp, Nguyệt Đức Hợp, Thiên Phúc, Thiên Phú, Thiên Hỷ, Thiên Ân, Nguyệt Ân.",
      "Tránh sao xấu: Chánh Tứ Phế, Thiên Tặc, Địa Tặc, Thiên Hỏa, Địa Hỏa.",
    ],
  },
  10: {
    no: 10,
    title: "Gác Đòn Dông",
    summary: "Ngày đặt cây đòn nóc (đòn dông), bộ phận cao nhất và hệ trọng nhất của khung nhà.",
    tables: [
      { days: { Giáp: ["Tý", "Ngọ", "Thân", "Tuất"], Ất: ["Sửu", "Mẹo", "Tị"], Bính: ["Tý", "Thân", "Tuất"], Đinh: ["Mẹo", "Tị", "Mùi", "Dậu"], Mậu: ["Tý", "Dần", "Thìn", "Tuất"], Kỷ: ["Tị", "Mùi", "Dậu", "Hợi"], Canh: ["Tý", "Dần", "Thìn", "Ngọ"], Tân: ["Sửu", "Mùi", "Dậu", "Hợi"], Nhâm: ["Dần", "Ngọ", "Thân"], Quý: ["Sửu", "Mẹo", "Hợi"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn, Bình, Thành, Khai.",
      "Hoặc ngày có sao tốt: Thiên Đức, Nguyệt Đức, Thiên Đức Hợp, Nguyệt Đức Hợp, Thiên Phúc, Thiên Phú, Thiên Hỷ, Thiên Ân, Nguyệt Ân.",
      "Tránh sao xấu: Chánh Tứ Phế, Thiên Tặc, Địa Tặc, Thiên Hỏa, Địa Hỏa.",
      "Nếu kịp gác đòn dông ngay trong ngày dựng cột thì không cần chọn ngày riêng.",
    ],
  },
  13: {
    no: 13,
    title: "Sửa Chữa Kho Lẫm",
    summary: "Ngày tu bổ kho, vựa chứa hàng bị hư hỏng cho kín và chắc lại.",
    tables: [
      { days: { Giáp: ["Tý", "Ngọ"], Ất: ["Sửu", "Mùi"], Bính: ["Dần"], Đinh: ["Mẹo"], Nhâm: ["Ngọ"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn.",
    ],
  },
  14: {
    no: 14,
    title: "Đem Ngũ Cốc Vào Kho",
    summary: "Ngày đưa lúa gạo, nông sản vào kho cất giữ để tránh hao hụt.",
    tables: [
      { days: { Ất: ["Dậu"], Kỷ: ["Sửu", "Mẹo"], Canh: ["Dần", "Ngọ"], Tân: ["Tị"], Nhâm: ["Ngọ"], Quý: ["Mẹo", "Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn, Bình, Thu.",
      "Nên có sao tốt: Thiên Đức, Nguyệt Đức.",
    ],
  },
  15: {
    no: 15,
    title: "Về Nhà Mới, Chuyển Chỗ Ở",
    summary: "Ngày dọn vào nhà mới xây hoặc chuyển đến nơi ở mới mua, mới thuê.",
    tables: [
      { days: { Giáp: ["Tý", "Thìn"], Ất: ["Sửu", "Mùi", "Dậu"], Bính: ["Dần", "Thìn", "Ngọ"], Đinh: ["Sửu", "Tị"], Mậu: ["Dần", "Thìn"], Canh: ["Dần", "Ngọ"], Tân: ["Hợi"], Nhâm: ["Dần", "Thìn", "Tuất"], Quý: ["Sửu", "Mẹo", "Tị"] } },
    ],
    notes: [],
  },
  16: {
    no: 16,
    title: "Làm Nhà Bếp Hay Sửa Nhà Bếp",
    summary: "Ngày xây mới hoặc sửa gian nhà bếp; khác với việc xây cái bếp nấu ở mục 17.",
    tables: [
      { days: { Giáp: ["Dần", "Thân"], Ất: ["Mẹo", "Dậu"], Bính: ["Dần"], Mậu: ["Dần"], Kỷ: ["Mẹo", "Tị", "Mùi"], Canh: ["Thân"], Tân: ["Mùi"], Nhâm: ["Tý"] } },
    ],
    notes: [
      "Nên chọn trực: Định, Thành, Khai.",
    ],
  },
  17: {
    no: 17,
    title: "Xây Bếp",
    summary: "Ngày xây hoặc đặt cái bếp nấu ăn, nơi gắn liền với sức khỏe cả nhà.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thân", "Tuất"], Ất: ["Sửu", "Mẹo", "Mùi", "Hợi"], Kỷ: ["Tị", "Mùi"], Canh: ["Ngọ", "Thân"], Tân: ["Mùi", "Hợi"], Nhâm: ["Thìn"], Quý: ["Sửu", "Mùi", "Dậu"] } },
    ],
    notes: [
      "Có thể chọn theo tháng âm: tháng 1–2 ngày Tuất, Sửu; tháng 3–4 ngày Tý, Mẹo; tháng 5–6 ngày Dần, Tị; tháng 7–8 ngày Thìn, Mùi; tháng 9–10 ngày Ngọ, Dậu; tháng 11–12 ngày Thân, Hợi.",
      "Đây chỉ là cách chọn cơ bản; chọn kỹ cần xét thêm tuổi và hoàn cảnh chủ nhà.",
    ],
  },
  18: {
    no: 18,
    title: "Thờ Phụng Táo Thần",
    summary: "Ngày cúng hoặc lập bàn thờ ông Táo.",
    tables: [
      { days: { Giáp: ["Thìn", "Thân", "Tuất"], Ất: ["Mẹo", "Dậu", "Hợi"], Bính: ["Ngọ"], Đinh: ["Mẹo", "Dậu", "Hợi"], Kỷ: ["Mẹo", "Dậu", "Hợi"], Canh: ["Thìn"], Tân: ["Dậu", "Hợi"], Nhâm: ["Thân"], Quý: ["Sửu", "Mẹo", "Dậu", "Hợi"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ, Thành, Khai.",
    ],
  },
  19: {
    no: 19,
    title: "Tạ Lễ Đất Đai",
    summary: "Ngày làm lễ tạ thổ, cúng đất đai.",
    tables: [
      { days: { Giáp: ["Dần", "Thân"], Đinh: ["Sửu", "Mùi"], Canh: ["Tý", "Ngọ"], Quý: ["Tị", "Hợi"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ, Thành, Khai.",
    ],
  },
  20: {
    no: 20,
    title: "Lót Giường",
    summary: "Ngày kê, đặt hoặc đóng giường ngủ, việc liên quan đến giấc ngủ và sức khỏe.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thìn", "Tuất"], Ất: ["Sửu", "Mẹo", "Tị", "Dậu"], Bính: ["Tý", "Dần", "Thìn", "Ngọ", "Tuất"], Đinh: ["Sửu", "Mẹo", "Tị", "Dậu", "Hợi"], Mậu: ["Tý", "Ngọ", "Tuất"], Kỷ: ["Tị", "Mùi", "Hợi"], Canh: ["Tý", "Thìn", "Ngọ"], Tân: ["Tị", "Mùi", "Dậu"], Nhâm: ["Dần", "Tuất"], Quý: ["Mẹo", "Tị"] } },
    ],
    notes: [
      "Nên chọn trực: Khai, Nguy.",
      "Tránh trực: Kiên, Phá, Bình, Thu.",
      "Đại kị ngày gặp sao: Tâm, Mẹo, Khuê, Lâu, Cơ, Vĩ, Sâm, Nguy — nhất là khi kê giường chờ sinh nở.",
    ],
  },
  21: {
    no: 21,
    title: "Nạp Lễ - Định Thân",
    summary: "Ngày hai gia đình mang lễ đến để chính thức kết thân, chuẩn bị cho việc cưới hỏi.",
    tables: [
      { days: { Giáp: ["Dần"], Ất: ["Mẹo"], Bính: ["Dần", "Ngọ", "Tuất"], Đinh: ["Mẹo", "Tị", "Mùi"], Mậu: ["Tý", "Dần", "Ngọ"], Kỷ: ["Mẹo", "Mùi"], Nhâm: ["Tý", "Dần", "Thìn"], Quý: ["Mẹo", "Tị"] } },
    ],
    notes: [
      "Nên chọn trực: Định, Thành.",
      "Nên có sao tốt: Huỳnh Đạo, Tam Hợp.",
      "Tránh trực: Kiên, Phá.",
      "Tránh sao xấu: Hà Khôi, Câu Giảo.",
    ],
  },
  22: {
    no: 22,
    title: "Làm Lễ Hỏi, Lễ Cưới Gả, Lễ Đưa Rước Dâu – Rể",
    summary: "Ngày làm đám hỏi, đám cưới và đưa rước dâu rể; ngày nay thường gộp chung trong một ngày.",
    tables: [
      { days: { Ất: ["Tị"], Bính: ["Tý", "Dần", "Tuất"], Đinh: ["Mẹo"], Mậu: ["Tý", "Dần"], Kỷ: ["Mẹo"], Canh: ["Dần"], Nhâm: ["Dần"], Quý: ["Mẹo"] } },
    ],
    notes: [
      "Nên chọn trực: Thành.",
      "Nên có sao tốt: Huỳnh Đạo, Sinh Khí, Tục Thế, Âm Dương Hợp, Nhân Dân Hợp; tốt nhất là ngày Bất Tương.",
    ],
  },
  28: {
    no: 28,
    title: "Chôn Cất",
    summary: "Ngày an táng người đã mất, việc được tin là ảnh hưởng nhiều đến con cháu.",
    tables: [
      { caption: "Rất tốt", days: { Giáp: ["Thân"], Ất: ["Dậu"], Bính: ["Ngọ", "Thân"], Đinh: ["Dậu"], Kỷ: ["Dậu"], Canh: ["Thân"], Tân: ["Dậu"], Nhâm: ["Dần", "Ngọ", "Thân"], Quý: ["Dậu"] } },
      { caption: "Khá tốt", days: { Giáp: ["Dần", "Thìn"], Ất: ["Tị"], Bính: ["Thìn"], Canh: ["Ngọ"], Nhâm: ["Thìn"] } },
    ],
    notes: [
      "Bảng “khá tốt” chỉ dùng khi không chọn được ngày trong bảng “rất tốt”.",
      "Ngoài hai bảng này còn có ngày tốt khác tùy theo từng tháng.",
    ],
  },
  29: {
    no: 29,
    title: "Xả Tang",
    summary: "Ngày làm lễ mãn tang, thôi thờ bài vị khi đã đủ thời gian để tang.",
    tables: [
      { days: { Giáp: ["Thân"], Ất: ["Mẹo"], Bính: ["Tý", "Thân"], Mậu: ["Ngọ"], Kỷ: ["Mùi", "Dậu"], Canh: ["Tý", "Thân"], Tân: ["Mẹo", "Hợi"], Nhâm: ["Tý", "Thân"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ.",
    ],
  },
  32: {
    no: 32,
    title: "Ngày Tốt Đi Thuyền",
    summary: "Ngày khởi hành bằng ghe thuyền trên sông, biển, vốn nhiều rủi ro.",
    tables: [
      { days: { Giáp: ["Tý", "Ngọ"], Ất: ["Mùi", "Dậu"], Bính: ["Dần", "Thìn"], Đinh: ["Mẹo"], Mậu: ["Tý", "Dần", "Thìn", "Ngọ"], Kỷ: ["Tị", "Mùi"], Canh: ["Tý"], Tân: ["Sửu", "Mẹo", "Mùi", "Dậu"], Nhâm: ["Dần", "Ngọ"], Quý: ["Mẹo", "Tị"] } },
    ],
    notes: [],
  },
  34: {
    no: 34,
    title: "Đóng Thuyền Hay Sửa Chữa Thuyền",
    summary: "Ngày khởi công đóng mới hoặc sửa chữa ghe thuyền.",
    tables: [
      { days: { Giáp: ["Tuất"], Ất: ["Mẹo", "Dậu", "Hợi"], Kỷ: ["Tị", "Mùi", "Dậu"], Canh: ["Thân"], Tân: ["Mùi"], Nhâm: ["Tý"] } },
    ],
    notes: [
      "Nên chọn trực: Bình, Định, Thành.",
      "Nên có sao tốt: Phòng, Ngưu, Thất, Sâm, Tỉnh, Thiên Ân, Nguyệt Ân, Thiên Đức Hợp, Nguyệt Đức Hợp, Yếu An, Nguyệt Tài.",
      "Tránh trực: Kiên, Phá, Bình, Thu.",
      "Tránh sao xấu: Đê, Vĩ, Cơ, Đẩu, Nguy, Lâu, Vị, Mẹo, Trương (nặng nhất), Chẩn, Bạch Ba, Hàm Trì, Thủy Ngân, Xúc Thủy Long, Bát Phong.",
      "Tránh giờ Đại Ác và giờ Thiên Phiên Địa Phúc.",
      "Tránh tháng Phong Ba: tháng có chi trùng chi của năm (vd năm Tý thì tháng Tý).",
    ],
  },
  35: {
    no: 35,
    title: "Làm Mui Ghe Thuyền",
    summary: "Ngày đóng hoặc lợp mui che cho ghe thuyền.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thìn", "Thân"], Ất: ["Tị", "Mùi", "Dậu"], Mậu: ["Tý", "Dần", "Thìn", "Thân"], Kỷ: ["Sửu", "Mẹo", "Dậu", "Hợi"], Canh: ["Dần"], Tân: ["Sửu", "Hợi"], Nhâm: ["Tý"], Quý: ["Mẹo", "Tị", "Mùi", "Dậu"] } },
    ],
    notes: [
      "Tránh trực: Phá.",
      "Tránh sao xấu: Thiên Hỏa, Thiên Tặc, Địa Tặc, Bát Phong.",
    ],
  },
  36: {
    no: 36,
    title: "Hạ Thủy Thuyền Mới",
    summary: "Ngày đưa thuyền mới đóng hoặc mới sửa xong xuống nước.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Ngọ", "Thân", "Tuất"], Ất: ["Sửu", "Mẹo", "Hợi"], Bính: ["Dần", "Ngọ", "Tuất"], Đinh: ["Sửu", "Mẹo", "Mùi"], Kỷ: ["Mẹo", "Dậu"], Canh: ["Tý", "Dần", "Ngọ", "Thân"], Tân: ["Sửu", "Mẹo", "Mùi"], Nhâm: ["Dần"], Quý: ["Sửu", "Mẹo"] } },
    ],
    notes: [
      "Dùng chung thần sát và trực với mục 31 (xuất hành), vì hạ thủy cũng coi như lên đường.",
      "Rất kị chở hàng ra đi vào ngày Thân.",
    ],
  },
  37: {
    no: 37,
    title: "Khai Trương, Mở Kho, Nhập Kho, Cất Vật Quý",
    summary: "Ngày mở cửa hàng buôn bán, xuất nhập hàng trong kho, hoặc cất giữ, lấy ra đồ quý như vàng bạc.",
    tables: [
      { days: { Giáp: ["Tý", "Thân", "Tuất"], Ất: ["Sửu", "Mẹo", "Mùi", "Hợi"], Bính: ["Tý", "Dần", "Ngọ"], Đinh: ["Sửu"], Kỷ: ["Mùi", "Hợi"], Canh: ["Tý", "Dần", "Ngọ", "Thân"], Tân: ["Mẹo", "Mùi", "Dậu"], Nhâm: ["Tý", "Ngọ"], Quý: ["Mẹo", "Mùi"] } },
    ],
    notes: [],
  },
  38: {
    no: 38,
    title: "Mua Hàng, Bán Hàng",
    summary: "Ngày bắt đầu việc mua bán, giao thương.",
    tables: [
      { days: { Giáp: ["Dần"], Bính: ["Tuất"], Đinh: ["Mùi"], Kỷ: ["Mẹo", "Dậu"], Nhâm: ["Dần"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn, Thành.",
    ],
  },
  39: {
    no: 39,
    title: "Lập Khế Ước Giao Dịch",
    summary: "Ngày ký giấy tờ, hợp đồng mua bán, trao đổi.",
    tables: [
      { days: { Giáp: ["Dần", "Thân"], Ất: ["Mẹo", "Mùi"], Bính: ["Tý"], Đinh: ["Sửu", "Mùi"], Mậu: ["Thân"], Kỷ: ["Mùi"], Canh: ["Tý"], Tân: ["Mẹo", "Mùi", "Dậu"], Nhâm: ["Tý", "Thìn", "Ngọ"], Quý: ["Mẹo", "Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Chấp, Thành.",
      "Nên có sao tốt: Thiên Đức, Nguyệt Đức.",
      "Tránh ngày Trường Đoản Tinh (ngày âm lịch): tháng Giêng 7, 21; tháng Hai 4, 19; tháng Ba 1, 16; tháng Tư 9, 25; tháng Năm 15, 25; tháng Sáu 10, 20; tháng Bảy 8, 22; tháng Tám 4, 5, 18, 19; tháng Chín 3, 4, 16, 17; tháng Mười 1, 14; tháng Mười Một 12, 22; tháng Chạp 9, 25.",
    ],
  },
  40: {
    no: 40,
    title: "Đặt Yên Máy Dệt",
    summary: "Ngày lắp đặt cố định khung cửi, máy dệt; cũng dùng được cho máy in, máy chế biến và các loại máy sản xuất khác.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"], Ất: ["Sửu", "Tị"], Bính: ["Thìn", "Thân"], Đinh: ["Sửu", "Mẹo", "Dậu", "Hợi"], Mậu: ["Tý", "Tuất"], Kỷ: ["Sửu", "Mẹo", "Hợi"], Tân: ["Tị", "Hợi"], Nhâm: ["Tý", "Dần", "Thìn", "Thân"], Quý: ["Sửu", "Tị", "Mùi", "Dậu"] } },
    ],
    notes: [
      "Nên chọn trực: Bình, Định, Mãn, Thành, Khai.",
    ],
  },
  41: {
    no: 41,
    title: "Đặt Yên Cối Xay",
    summary: "Ngày đặt cố định cối xay hoặc các loại cối khác vào chỗ.",
    tables: [
      { days: { Giáp: ["Tuất"], Ất: ["Hợi"], Canh: ["Tý", "Dần", "Ngọ", "Thân"], Tân: ["Dậu"] } },
    ],
    notes: [],
  },
  43: {
    no: 43,
    title: "Mua Ruộng Đất, Phòng Nhà, Sản Vật",
    summary: "Ngày mua ruộng vườn, đất đai, nhà cửa hay tài sản có giá trị.",
    tables: [
      { days: { Giáp: ["Dần", "Thân"], Ất: ["Mẹo", "Mùi"], Bính: ["Tý"], Đinh: ["Sửu", "Mùi"], Mậu: ["Thân"], Kỷ: ["Mùi"], Canh: ["Tý"], Tân: ["Mẹo", "Mùi", "Dậu"], Nhâm: ["Tý", "Thìn", "Ngọ"], Quý: ["Mẹo", "Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Định, Thành.",
    ],
  },
  44: {
    no: 44,
    title: "Cày Ruộng, Gieo Giống",
    summary: "Ngày bắt đầu cày đất và gieo hạt cho vụ mùa.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thìn", "Ngọ", "Thân"], Ất: ["Sửu", "Mùi", "Dậu", "Hợi"], Bính: ["Tý", "Thìn", "Ngọ", "Thân", "Tuất"], Đinh: ["Sửu", "Mẹo", "Tị"], Mậu: ["Dần", "Ngọ", "Thân", "Tuất"], Kỷ: ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu", "Hợi"], Canh: ["Tý", "Ngọ", "Thân"], Tân: ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu"], Nhâm: ["Dần", "Thìn", "Ngọ"], Quý: ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu", "Hợi"] } },
    ],
    notes: [],
  },
  45: {
    no: 45,
    title: "Ngâm Thóc",
    summary: "Ngày ngâm thóc giống chuẩn bị gieo mạ.",
    tables: [
      { days: { Giáp: ["Tuất"], Ất: ["Mẹo", "Dậu", "Hợi"], Nhâm: ["Thìn", "Ngọ"] } },
    ],
    notes: [],
  },
  46: {
    no: 46,
    title: "Ương Mạ",
    summary: "Ngày gieo ương mạ hoặc ươm hạt các loại cây trồng.",
    tables: [
      { days: { Giáp: ["Thìn", "Ngọ"], Ất: ["Mẹo", "Tị"], Bính: ["Ngọ"], Đinh: ["Mùi"], Mậu: ["Thân"], Kỷ: ["Dậu"], Canh: ["Dần"], Tân: ["Mùi", "Dậu"], Nhâm: ["Ngọ"], Quý: ["Dậu"] } },
    ],
    notes: [],
  },
  47: {
    no: 47,
    title: "Trồng Lúa",
    summary: "Ngày cấy mạ xuống ruộng.",
    tables: [
      { days: { Giáp: ["Thìn", "Ngọ"], Kỷ: ["Mẹo", "Dậu"], Canh: ["Ngọ"], Tân: ["Tị"], Nhâm: ["Ngọ", "Thân"], Quý: ["Mẹo", "Mùi", "Dậu"] } },
    ],
    notes: [
      "Nên chọn trực: Khai, Thu.",
    ],
  },
  48: {
    no: 48,
    title: "Gặt Lúa",
    summary: "Ngày bắt đầu thu hoạch lúa.",
    tables: [
      { days: { Giáp: ["Thìn", "Ngọ"], Kỷ: ["Mẹo", "Dậu"], Tân: ["Tị"], Nhâm: ["Ngọ", "Thân"], Quý: ["Mẹo", "Mùi", "Dậu"] } },
    ],
    notes: [
      "Nên chọn trực: Khai, Thu, Thành.",
    ],
  },
  49: {
    no: 49,
    title: "Đào Giếng",
    summary: "Ngày khởi công đào giếng mới.",
    tables: [
      { days: { Giáp: ["Tý", "Ngọ"], Ất: ["Sửu", "Tị"], Canh: ["Tý"], Tân: ["Sửu", "Dậu", "Hợi"], Nhâm: ["Dần"], Quý: ["Dậu"] } },
    ],
    notes: [],
  },
  50: {
    no: 50,
    title: "Sửa Giếng",
    summary: "Ngày nạo vét, đắp thành, đào sâu hay mở rộng giếng đang dùng.",
    tables: [
      { days: { Giáp: ["Thân"], Ất: ["Tị"], Đinh: ["Tị"], Canh: ["Tý"], Tân: ["Sửu", "Hợi"], Quý: ["Sửu"] } },
    ],
    notes: [],
  },
  51: {
    no: 51,
    title: "Đào Hồ, Ao",
    summary: "Ngày khởi công đào ao hồ để trữ nước hoặc nuôi cá, thủy sản.",
    tables: [
      { days: { Giáp: ["Tý", "Thân"], Ất: ["Sửu", "Tị"], Đinh: ["Tị"], Mậu: ["Tuất"], Canh: ["Tý"], Tân: ["Sửu", "Dậu", "Hợi"], Nhâm: ["Ngọ"], Quý: ["Sửu", "Dậu", "Hợi"] } },
    ],
    notes: [
      "Nên chọn trực: Thành, Khai.",
      "Ao nuôi cá, thủy sản nên gặp ngày Thiên Cẩu Thủ Đường.",
      "Tránh sao xấu: Hà Khôi, Thiên Cương, Tử Khí, Thổ Ôn, Thiên Bách Không.",
    ],
  },
  52: {
    no: 52,
    title: "Khai Thông Hào Rãnh",
    summary: "Ngày đào, khơi thông mương rãnh để nước ra vào dễ dàng.",
    tables: [
      { days: { Giáp: ["Tý"], Ất: ["Sửu"], Bính: ["Tuất"], Mậu: ["Thân"], Kỷ: ["Mẹo"], Canh: ["Thìn"], Tân: ["Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Khai.",
    ],
  },
  53: {
    no: 53,
    title: "Làm Cầu Tiêu",
    summary: "Ngày khởi công làm nhà vệ sinh.",
    tables: [
      { days: { Ất: ["Sửu", "Mùi"], Bính: ["Tý", "Dần", "Thìn", "Thân"], Đinh: ["Mẹo", "Dậu"], Mậu: ["Thìn"], Kỷ: ["Mẹo", "Hợi"], Canh: ["Tý"], Tân: ["Sửu", "Tị", "Dậu", "Hợi"], Nhâm: ["Tý"], Quý: ["Sửu"] } },
    ],
    notes: [
      "Nên chọn trực: Bế.",
      "Nên gặp ngày Phục Đoạn.",
      "Rất tốt: Bính Thìn (Thiên Lung Nhật), Tân Dậu (Địa Á Nhật).",
    ],
  },
  55: {
    no: 55,
    title: "Vào Núi Đốn Cây",
    summary: "Ngày lên rừng đốn cây, mong chuyến đi bình an và không phạm thần linh.",
    tables: [
      { days: { Giáp: ["Dần", "Ngọ", "Thân", "Tuất"], Ất: ["Mẹo", "Mùi", "Dậu", "Hợi"], Bính: ["Ngọ", "Thân"], Đinh: ["Mùi"], Mậu: ["Tý", "Dần", "Thân"], Kỷ: ["Mẹo", "Tị", "Mùi", "Dậu"], Canh: ["Ngọ", "Thân"], Tân: ["Mùi", "Dậu"], Nhâm: ["Dần", "Ngọ", "Thân"] } },
    ],
    notes: [
      "Nên chọn trực: Thành, Định, Khai.",
      "Nên có sao tốt: Huỳnh Đạo, Minh Tinh, Thiên Đức, Nguyệt Đức.",
      "Tránh sao xấu: Thiên Tặc, Hỏa Tinh, Chánh Tứ Phế, Xích Khẩu.",
      "Đốn cây tùng: chọn ngày Thìn tháng 7, lúc trời tạnh ráo.",
      "Đốn tre, trúc, tầm vông: chọn ngày Phục Đoạn, Phục Ương (ngày Tý) hoặc Trùng Phục (ngày Kỷ) trong tháng Chạp, đốn vào giữa trưa để ít mối mọt.",
    ],
  },
  56: {
    no: 56,
    title: "Nạp Nô Tỳ",
    summary: "Ngày nhận người làm, thuê người giúp việc.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Ngọ", "Thân"], Ất: ["Sửu", "Mẹo", "Mùi", "Hợi"], Bính: ["Dần", "Ngọ", "Tuất"], Đinh: ["Mùi"], Mậu: ["Dần", "Thìn"], Kỷ: ["Mùi", "Hợi"], Canh: ["Tý"], Tân: ["Mẹo", "Dậu", "Hợi"], Nhâm: ["Tý", "Thìn", "Thân"], Quý: ["Mẹo", "Tị"] } },
    ],
    notes: [
      "Nên chọn trực: Thành, Mãn.",
    ],
  },
  57: {
    no: 57,
    title: "Kết Màn May Áo",
    summary: "Ngày may, giăng màn hoặc cắt may quần áo.",
    tables: [
      { days: { Giáp: ["Tý", "Dần", "Thìn", "Ngọ", "Tuất"], Ất: ["Sửu", "Mẹo", "Tị", "Mùi", "Hợi"], Bính: ["Tý", "Thìn", "Thân", "Tuất"], Đinh: ["Sửu", "Hợi"], Mậu: ["Tý", "Thìn", "Tuất"], Kỷ: ["Sửu", "Mẹo", "Tị"], Canh: ["Tý", "Dần", "Thân"], Tân: ["Sửu", "Dậu"], Nhâm: ["Thìn", "Tuất"], Quý: ["Sửu", "Mẹo", "Tị", "Dậu"] } },
    ],
    notes: [
      "Nên chọn ngày hành Thủy, ngày trực Bế, Thành, Khai hoặc ngày sao Nữ.",
      "Tránh sao xấu: Thiên Tặc, Hỏa Tinh, Trường Đoản Tinh.",
    ],
  },
  58: {
    no: 58,
    title: "Vẽ Tượng Họa Chân Dung",
    summary: "Ngày vẽ tượng, vẽ chân dung; ngày nay có thể áp dụng cho cả việc chụp ảnh.",
    tables: [
      { days: { Giáp: ["Tý", "Thân"], Ất: ["Sửu", "Tị"], Bính: ["Dần"], Đinh: ["Mẹo", "Tị"], Mậu: ["Thìn"], Kỷ: ["Tị", "Hợi"], Canh: ["Tý", "Dần", "Thân"], Tân: ["Sửu", "Mẹo", "Tị"], Nhâm: ["Dần", "Thìn", "Ngọ"], Quý: ["Mẹo", "Tị", "Mùi"] } },
    ],
    notes: [
      "Nên có sao tốt: Phúc Sinh, Phúc Hậu, Yếu An, Thánh Tâm, Thiên Thụy, Sinh Khí, Âm Đức, Ích Hậu, Tục Thế.",
      "Tránh sao xấu: Thiên Ôn, Thọ Tử, Tứ Phế, Câu Giải, Thần Cách.",
      "Tránh trực: Kiên, Phá.",
    ],
  },
  60: {
    no: 60,
    title: "Nhập Học",
    summary: "Ngày đầu tiên đi học hoặc chuyển sang học ở trường mới.",
    tables: [
      { days: { Giáp: ["Dần", "Thìn", "Thân", "Tuất"], Ất: ["Mẹo", "Tị", "Mùi", "Hợi"], Bính: ["Tý", "Thìn", "Ngọ", "Thân"], Đinh: ["Mùi", "Hợi"], Mậu: ["Dần", "Thân"], Tân: ["Mẹo", "Dậu"], Nhâm: ["Thìn"], Quý: ["Mẹo", "Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Định, Thành, Khai.",
      "Nên có sao tốt: Phúc Sinh, Phúc Hậu, Yếu An, Thánh Tâm, Thiên Thụy, Sinh Khí, Âm Đức, Ích Hậu, Tục Thế.",
      "Tránh trực: Bế, Phá.",
      "Rất kị ngày Tứ Phế và hai ngày Bính Dần, Tân Sửu (ngày mất và ngày chôn của Thương Hiệt, ông tổ chữ viết).",
    ],
  },
  61: {
    no: 61,
    title: "Lên Quan Nhận Chức",
    summary: "Ngày nhậm chức hoặc nhận nhiệm sở mới.",
    tables: [
      { days: { Giáp: ["Tý", "Thân"], Ất: ["Dậu", "Hợi"], Bính: ["Tý", "Dần", "Ngọ", "Tuất"], Đinh: ["Mẹo"], Mậu: ["Tý", "Thìn", "Thân"], Kỷ: ["Mẹo", "Tị", "Hợi"], Canh: ["Tý", "Ngọ", "Thân", "Tuất"], Tân: ["Dậu", "Hợi"], Nhâm: ["Tý", "Dần", "Ngọ"], Quý: ["Sửu", "Tị"] } },
    ],
    notes: [
      "Tránh trực: Kiên, Mãn, Bình, Phá, Thu, Bế.",
    ],
  },
  62: {
    no: 62,
    title: "Thừa Kế Tước Phong",
    summary: "Ngày nhận kế thừa chức tước, sự nghiệp hay tài sản của cha ông.",
    tables: [
      { days: { Giáp: ["Tý", "Thân"], Bính: ["Tý", "Dần"], Đinh: ["Mẹo", "Tị", "Dậu"], Mậu: ["Tý", "Dần", "Ngọ"], Kỷ: ["Hợi"], Canh: ["Tý", "Ngọ", "Thân"], Tân: ["Mẹo", "Hợi"], Nhâm: ["Tý", "Dần", "Ngọ"], Quý: ["Mẹo", "Tị"] } },
    ],
    notes: [
      "Nên có sao tốt: Thiên Đức, Thiên Xá, Nguyệt Đức, Thiên Hỷ, Vượng Nhật, Quan Nhật, Dân Nhật, Tướng Nhật, Thủ Nhật, Tuế Đức.",
      "Tránh trực: Bình, Phá, Thu, Bế.",
      "Tránh sao xấu: Hắc Đạo, Hoang Vu, Phục Đoạn, Diệt Một, Thọ Tử, Phá Bại, Thiên Hưu Phế.",
    ],
  },
  64: {
    no: 64,
    title: "Cho Vay Cho Mượn",
    summary: "Ngày đưa tiền hay đồ cho người khác vay mượn, mong tránh thất thoát.",
    tables: [
      { days: { Ất: ["Mẹo", "Dậu"], Đinh: ["Sửu"], Kỷ: ["Tị"], Canh: ["Thìn", "Ngọ"], Tân: ["Dậu", "Hợi"] } },
    ],
    notes: [
      "Nên chọn trực: Thành, Mãn.",
      "Tránh trực: Phá.",
    ],
  },
  65: {
    no: 65,
    title: "Thu Nợ",
    summary: "Ngày đi đòi nợ, thu lại tiền hoặc đồ đã cho vay.",
    tables: [
      { days: { Giáp: ["Dần"], Ất: ["Sửu", "Tị"], Bính: ["Dần", "Ngọ"], Canh: ["Tý", "Dần"], Tân: ["Dậu"], Nhâm: ["Ngọ"] } },
    ],
    notes: [
      "Nên chọn trực: Thành.",
      "Nên có sao tốt: Thiên Đức, Nguyệt Đức.",
    ],
  },
  66: {
    no: 66,
    title: "Làm Tương",
    summary: "Ngày ủ, gây tương.",
    tables: [
      { days: { Ất: ["Mùi"], Bính: ["Thìn", "Thân"], Đinh: ["Mẹo"], Mậu: ["Tý"] } },
    ],
    notes: [
      "Rất kị ngày Thủy Ngân.",
    ],
  },
  67: {
    no: 67,
    title: "Làm Rượu",
    summary: "Ngày nấu, ủ rượu.",
    tables: [
      { days: { Giáp: ["Ngọ"], Đinh: ["Mẹo"], Kỷ: ["Mùi"], Canh: ["Ngọ"], Quý: ["Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Thành, Khai.",
      "Tránh sao xấu: Diệt Một.",
    ],
  },
  69: {
    no: 69,
    title: "Nuôi Tằm",
    summary: "Ngày bắt đầu nuôi một lứa tằm.",
    tables: [
      { days: { Giáp: ["Tý"], Đinh: ["Mẹo"], Mậu: ["Ngọ"], Canh: ["Ngọ"], Nhâm: ["Ngọ"] } },
    ],
    notes: [
      "Rất kị ngày Phong Vương Sát, theo mùa: Xuân – Giáp Dần, Canh, Tân; Hạ – Thìn, Tuất; Thu – Mậu Thìn; Đông – Bính, Mậu.",
    ],
  },
  70: {
    no: 70,
    title: "Mua Lợn",
    summary: "Ngày mua lợn giống, bắt đầu nuôi lợn.",
    tables: [
      { days: { Giáp: ["Tý", "Thìn"], Ất: ["Sửu", "Mùi"], Bính: ["Thìn"], Nhâm: ["Tý", "Tuất"], Quý: ["Sửu", "Mùi"] } },
    ],
    notes: [],
  },
  71: {
    no: 71,
    title: "Làm Chuồng Lợn",
    summary: "Ngày làm chuồng nuôi lợn.",
    tables: [
      { days: { Giáp: ["Tý", "Thìn", "Ngọ", "Tuất"], Ất: ["Tị", "Mùi"], Mậu: ["Tý", "Thìn", "Thân"], Canh: ["Tý", "Thìn"], Tân: ["Mẹo", "Tị"], Nhâm: ["Tý", "Dần", "Thân"], Quý: ["Mẹo"] } },
    ],
    notes: [
      "Cửa chuồng theo thước cổ: cao 2 thước, rộng 1 thước 5 tấc.",
    ],
  },
  73: {
    no: 73,
    title: "Mua Ngựa",
    summary: "Ngày mua ngựa về nuôi.",
    tables: [
      { days: { Ất: ["Tị", "Dậu", "Hợi"], Mậu: ["Tý"], Kỷ: ["Mùi"], Nhâm: ["Tý", "Thìn"] } },
    ],
    notes: [],
  },
  74: {
    no: 74,
    title: "Làm Chuồng Ngựa",
    summary: "Ngày làm chuồng ngựa.",
    tables: [
      { days: { Giáp: ["Tý", "Thân"], Ất: ["Tị", "Hợi"], Đinh: ["Mẹo", "Dậu"], Mậu: ["Tuất"], Kỷ: ["Mẹo"], Canh: ["Tý"], Tân: ["Mẹo", "Mùi"], Nhâm: ["Tý", "Thìn"] } },
    ],
    notes: [],
  },
  75: {
    no: 75,
    title: "Mua Trâu",
    summary: "Ngày mua trâu về nuôi, làm sức kéo.",
    tables: [
      { days: { Giáp: ["Thân"], Bính: ["Dần"], Đinh: ["Sửu", "Mẹo", "Dậu"], Mậu: ["Ngọ", "Tuất"], Canh: ["Tý", "Ngọ", "Tuất"], Tân: ["Mẹo", "Hợi"], Nhâm: ["Tuất"], Quý: ["Mùi"] } },
    ],
    notes: [
      "Nên chọn trực: Thành, Thu, Bế.",
      "Tháng Giêng nên chọn ngày Dần, Ngọ, Tuất; tháng Sáu nên chọn ngày Hợi, Mẹo, Mùi.",
    ],
  },
  76: {
    no: 76,
    title: "Làm Chuồng Trâu",
    summary: "Ngày làm chuồng trâu.",
    tables: [
      { days: { Giáp: ["Tý", "Tuất"], Ất: ["Hợi"], Bính: ["Tý"], Kỷ: ["Tị"], Canh: ["Tý", "Dần", "Thìn", "Ngọ"], Nhâm: ["Ngọ"], Quý: ["Mùi"] } },
    ],
    notes: [
      "Theo Ngưu Huỳnh Kinh có bốn ngày tốt: Mậu Thìn, Mậu Ngọ, Kỷ Mùi, Tân Dậu.",
    ],
  },
  77: {
    no: 77,
    title: "Mua Gà, Ngỗng, Vịt",
    summary: "Ngày mua gà, ngỗng, vịt về nuôi.",
    tables: [
      { days: { Giáp: ["Tý", "Thìn", "Ngọ", "Tuất"], Ất: ["Sửu", "Tị"], Đinh: ["Mùi"], Nhâm: ["Ngọ", "Thân"], Quý: ["Mùi"] } },
    ],
    notes: [
      "Tránh sao xấu: Phá Quân.",
    ],
  },
  78: {
    no: 78,
    title: "Làm Chuồng Gà, Ngỗng, Vịt",
    summary: "Ngày làm chuồng trại cho gà, ngỗng, vịt.",
    tables: [
      { days: { Giáp: ["Thìn"], Ất: ["Sửu", "Tị", "Mùi"], Bính: ["Thìn"], Đinh: ["Tị", "Dậu"], Mậu: ["Thìn", "Ngọ"], Canh: ["Tý", "Dần"], Tân: ["Sửu", "Mẹo", "Tị"], Nhâm: ["Tý", "Thìn", "Ngọ", "Tuất"], Quý: ["Mùi", "Dậu"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn, Thành, Khai.",
      "Tránh sao xấu: Đao Chiêm, Đại Hao, Tiểu Hao, Tứ Phế.",
    ],
  },
  79: {
    no: 79,
    title: "Nạp Chó",
    summary: "Ngày đem chó (mua hoặc xin) về nuôi giữ nhà.",
    tables: [
      { days: { Giáp: ["Ngọ"], Ất: ["Mùi", "Dậu"], Bính: ["Thìn", "Ngọ"], Mậu: ["Ngọ"], Tân: ["Tị"], Nhâm: ["Thìn", "Ngọ"] } },
    ],
    notes: [
      "Nên chọn trực: Mãn, Thành, Khai.",
      "Tránh sao xấu: Đao Chiêm, Đại Hao, Tiểu Hao, Tứ Phế.",
    ],
  },
  80: {
    no: 80,
    title: "Nạp Mèo",
    summary: "Ngày đem mèo (mua hoặc xin) về nuôi.",
    tables: [
      { days: { Giáp: ["Tý"], Ất: ["Sửu"], Bính: ["Thìn", "Ngọ"], Canh: ["Tý", "Ngọ"], Nhâm: ["Tý", "Ngọ"] } },
    ],
    notes: [
      "Nên có sao tốt: Thiên Đức, Nguyệt Đức, Sinh Khí.",
      "Tránh sao xấu: Phi Liêm.",
    ],
  },
  82: {
    no: 82,
    title: "Hốt Thuốc",
    summary: "Ngày bốc, bào chế thuốc dùng lâu ngày, hoặc ngày thầy thuốc bắt đầu hành nghề.",
    tables: [
      { days: { Giáp: ["Thân"], Ất: ["Mùi", "Hợi"], Bính: ["Ngọ", "Tuất"], Mậu: ["Dần", "Thìn"], Kỷ: ["Tị", "Mùi"], Canh: ["Ngọ"], Tân: ["Mẹo", "Hợi"], Nhâm: ["Thân"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ, Phá, Khai.",
    ],
  },
  83: {
    no: 83,
    title: "Uống Thuốc",
    summary: "Ngày bắt đầu một đợt uống thuốc dài ngày; bệnh cấp thì không cần chờ chọn ngày.",
    tables: [
      { days: { Giáp: ["Ngọ", "Thân"], Ất: ["Sửu", "Hợi"], Bính: ["Tý", "Thân", "Tuất"], Đinh: ["Sửu", "Dậu"], Mậu: ["Thân", "Tuất"], Kỷ: ["Sửu", "Dậu", "Hợi"], Canh: ["Tý"], Tân: ["Sửu", "Dậu"], Nhâm: ["Thìn", "Thân"], Quý: ["Tị", "Dậu"] } },
    ],
    notes: [
      "Nên chọn trực: Trừ, Phá, Khai.",
      "Tránh trực: Mãn.",
      "Tránh ngày Mùi.",
      "Nam tránh trực Trừ, nữ tránh trực Thu.",
    ],
  },
};

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
    const [main] = muc.tables;
    for (const [stem, branches] of Object.entries(main?.days ?? {})) {
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
