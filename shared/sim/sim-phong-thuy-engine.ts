import { Lunar } from "lunar-javascript";
import {
  getFourPillars,
  getLunarDate,
  getSolarTerm,
  getElementBalance,
  getBaziRelations,
  getNaYin,
  getNaYinByYear,
  isValidDateString,
  isValidTimeString,
} from "../menh-thu/metaphysics.js";

// ==========================================
// 1. TIÊN THIÊN & HẬU THIÊN BÁT QUÁI
// ==========================================

export interface TrigramInfo {
  number: number;      // 1 to 8 (Tiên Thiên)
  name: string;        // Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn
  alias: string;       // Thiên, Trạch, Hỏa, Lôi, Phong, Thủy, Sơn, Địa
  symbol: string;      // ☰, ☱, ☲, ☳, ☴, ☵, ☶, ☷
  binary: string;      // "111", "110", etc. (Dưới lên trên)
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  nature: string;
}

export const TIEN_THIEN_TRIGRAMS: Record<number, TrigramInfo> = {
  1: { number: 1, name: "Càn", alias: "Thiên", symbol: "☰", binary: "111", element: "Kim", nature: "Trời · Cương kiện" },
  2: { number: 2, name: "Đoài", alias: "Trạch", symbol: "☱", binary: "110", element: "Kim", nature: "Đầm · Hòa duyệt" },
  3: { number: 3, name: "Ly", alias: "Hỏa", symbol: "☲", binary: "101", element: "Hỏa", nature: "Lửa · Sáng tỏ" },
  4: { number: 4, name: "Chấn", alias: "Lôi", symbol: "☳", binary: "100", element: "Mộc", nature: "Sấm · Chấn động" },
  5: { number: 5, name: "Tốn", alias: "Phong", symbol: "☴", binary: "011", element: "Mộc", nature: "Gió · Thuận nhập" },
  6: { number: 6, name: "Khảm", alias: "Thủy", symbol: "☵", binary: "010", element: "Thủy", nature: "Nước · Hiểm trở" },
  7: { number: 7, name: "Cấn", alias: "Sơn", symbol: "☶", binary: "001", element: "Thổ", nature: "Núi · Ngưng chỉ" },
  8: { number: 8, name: "Khôn", alias: "Địa", symbol: "☷", binary: "000", element: "Thổ", nature: "Đất · Nhu thuận" },
};

export const TRI: Record<number, [string, string, "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ", string]> = {
  1: ["Càn", "Trời", "Kim", "☰"],
  2: ["Đoài", "Đầm", "Kim", "☱"],
  3: ["Ly", "Lửa", "Hỏa", "☲"],
  4: ["Chấn", "Sấm", "Mộc", "☳"],
  5: ["Tốn", "Gió", "Mộc", "☴"],
  6: ["Khảm", "Nước", "Thủy", "☵"],
  7: ["Cấn", "Núi", "Thổ", "☶"],
  8: ["Khôn", "Đất", "Thổ", "☷"],
};

export const TRI_BITS: Record<number, number[]> = {
  1: [1, 1, 1], // Càn ☰
  2: [1, 1, 0], // Đoài ☱
  3: [1, 0, 1], // Ly ☲
  4: [1, 0, 0], // Chấn ☳
  5: [0, 1, 1], // Tốn ☴
  6: [0, 1, 0], // Khảm ☵
  7: [0, 0, 1], // Cấn ☶
  8: [0, 0, 0], // Khôn ☷
};

export function triBits(quai: number): number[] {
  return (TRI_BITS[quai] || [0, 0, 0]).slice();
}

export function bitsToTri(bits: number[]): number {
  const b = bits.join("");
  if (b === "111") return 1;
  if (b === "110") return 2;
  if (b === "101") return 3;
  if (b === "100") return 4;
  if (b === "011") return 5;
  if (b === "010") return 6;
  if (b === "001") return 7;
  return 8; // "000"
}

export const CUU_TINH_LAC_THU: Record<number, { palace: string; element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ"; name: string }> = {
  1: { palace: "Khảm", element: "Thủy", name: "Nhất Bạch Thủy Tinh" },
  2: { palace: "Khôn", element: "Thổ", name: "Nhị Hắc Thổ Tinh" },
  3: { palace: "Chấn", element: "Mộc", name: "Tam Bích Mộc Tinh" },
  4: { palace: "Tốn", element: "Mộc", name: "Tứ Lục Mộc Tinh" },
  5: { palace: "Trung Cung", element: "Thổ", name: "Ngũ Hoàng Thổ Tinh" },
  6: { palace: "Càn", element: "Kim", name: "Lục Bạch Kim Tinh" },
  7: { palace: "Đoài", element: "Kim", name: "Thất Xích Kim Tinh" },
  8: { palace: "Cấn", element: "Thổ", name: "Bát Bạch Thổ Tinh" },
  9: { palace: "Ly", element: "Hỏa", name: "Cửu Tử Hỏa Tinh" },
};

// ==========================================
// 2. 64 QUẺ KINH DỊCH & DỮ LIỆU LỤC HÀO
// ==========================================

export const LOOKUP: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 10, 3: 13, 4: 25, 5: 44, 6: 6, 7: 33, 8: 12 },
  2: { 1: 43, 2: 58, 3: 49, 4: 17, 5: 28, 6: 47, 7: 31, 8: 45 },
  3: { 1: 14, 2: 38, 3: 30, 4: 21, 5: 50, 6: 64, 7: 56, 8: 35 },
  4: { 1: 34, 2: 54, 3: 55, 4: 51, 5: 32, 6: 40, 7: 62, 8: 16 },
  5: { 1: 9, 2: 61, 3: 37, 4: 42, 5: 57, 6: 59, 7: 53, 8: 20 },
  6: { 1: 5, 2: 60, 3: 63, 4: 3, 5: 48, 6: 29, 7: 39, 8: 8 },
  7: { 1: 26, 2: 41, 3: 22, 4: 27, 5: 18, 6: 4, 7: 52, 8: 23 },
  8: { 1: 11, 2: 19, 3: 36, 4: 24, 5: 46, 6: 7, 7: 15, 8: 2 },
};

export const QD_QUALITY: Record<number, Record<number, "tot" | "tb" | "hung">> = {
  1: { 1: "tot", 2: "tb", 3: "tb", 4: "tb", 5: "hung", 6: "hung", 7: "hung", 8: "hung" },
  2: { 1: "tb", 2: "tot", 3: "tb", 4: "tb", 5: "tb", 6: "hung", 7: "tb", 8: "tb" },
  3: { 1: "tot", 2: "hung", 3: "tb", 4: "tb", 5: "tb", 6: "hung", 7: "hung", 8: "tot" },
  4: { 1: "tot", 2: "hung", 3: "tot", 4: "tb", 5: "tb", 6: "tb", 7: "hung", 8: "tot" },
  5: { 1: "hung", 2: "tb", 3: "tb", 4: "tot", 5: "tb", 6: "hung", 7: "tot", 8: "tb" },
  6: { 1: "tb", 2: "hung", 3: "tot", 4: "hung", 5: "tb", 6: "hung", 7: "hung", 8: "tb" },
  7: { 1: "tot", 2: "hung", 3: "hung", 4: "tb", 5: "hung", 6: "hung", 7: "hung", 8: "hung" },
  8: { 1: "tb", 2: "tot", 3: "hung", 4: "tb", 5: "tot", 6: "hung", 7: "tb", 8: "tb" },
};

export const QD_INFO: Record<"tot" | "tb" | "hung", { d: number; l: "Cát" | "Bình" | "Hung"; c: string }> = {
  tot: { d: 100, l: "Cát", c: "#c62828" },
  tb: { d: 65, l: "Bình", c: "#1565c0" },
  hung: { d: 30, l: "Hung", c: "#333333" },
};

export function queChatLuong(hexNum: number): { d: number; l: string; c: string } {
  for (let u = 1; u <= 8; u++) {
    for (let l = 1; l <= 8; l++) {
      if (LOOKUP[u][l] === hexNum) {
        const q = QD_QUALITY[u]?.[l] || "tb";
        return QD_INFO[q];
      }
    }
  }
  return QD_INFO.tb;
}

export const HEXAGRAM_NAMES_BY_TRIGRAM: Record<number, Record<number, { number: number; name: string }>> = {
  1: {
    1: { number: 1, name: "Thuần Càn" }, 2: { number: 10, name: "Thiên Trạch Lý" }, 3: { number: 13, name: "Thiên Hỏa Đồng Nhân" },
    4: { number: 25, name: "Thiên Lôi Vô Vọng" }, 5: { number: 44, name: "Thiên Phong Cấu" }, 6: { number: 6, name: "Thiên Thủy Tụng" },
    7: { number: 33, name: "Thiên Sơn Độn" }, 8: { number: 12, name: "Thiên Địa Bỉ" },
  },
  2: {
    1: { number: 43, name: "Trạch Thiên Quải" }, 2: { number: 58, name: "Thuần Đoài" }, 3: { number: 49, name: "Trạch Hỏa Cách" },
    4: { number: 17, name: "Trạch Lôi Tùy" }, 5: { number: 28, name: "Trạch Phong Đại Quá" }, 6: { number: 47, name: "Trạch Thủy Khốn" },
    7: { number: 31, name: "Trạch Sơn Hàm" }, 8: { number: 45, name: "Trạch Địa Tụy" },
  },
  3: {
    1: { number: 14, name: "Hỏa Thiên Đại Hữu" }, 2: { number: 38, name: "Hỏa Trạch Khuê" }, 3: { number: 30, name: "Thuần Ly" },
    4: { number: 21, name: "Hỏa Lôi Phệ Hạp" }, 5: { number: 50, name: "Hỏa Phong Đỉnh" }, 6: { number: 64, name: "Hỏa Thủy Vị Tế" },
    7: { number: 56, name: "Hỏa Sơn Lữ" }, 8: { number: 35, name: "Hỏa Địa Tấn" },
  },
  4: {
    1: { number: 34, name: "Lôi Thiên Đại Tráng" }, 2: { number: 54, name: "Lôi Trạch Quy Muội" }, 3: { number: 55, name: "Lôi Hỏa Phong" },
    4: { number: 51, name: "Thuần Chấn" }, 5: { number: 32, name: "Lôi Phong Hằng" }, 6: { number: 40, name: "Lôi Thủy Giải" },
    7: { number: 62, name: "Lôi Sơn Tiểu Quá" }, 8: { number: 16, name: "Lôi Địa Dự" },
  },
  5: {
    1: { number: 9, name: "Phong Thiên Tiểu Súc" }, 2: { number: 61, name: "Phong Trạch Trung Phu" }, 3: { number: 37, name: "Phong Hỏa Gia Nhân" },
    4: { number: 42, name: "Phong Lôi Ích" }, 5: { number: 57, name: "Thuần Tốn" }, 6: { number: 59, name: "Phong Thủy Hoán" },
    7: { number: 53, name: "Phong Sơn Tiệm" }, 8: { number: 20, name: "Phong Địa Quán" },
  },
  6: {
    1: { number: 5, name: "Thủy Thiên Nhu" }, 2: { number: 60, name: "Thủy Trạch Tiết" }, 3: { number: 63, name: "Thủy Hỏa Ký Tế" },
    4: { number: 3, name: "Thủy Lôi Truân" }, 5: { number: 48, name: "Thủy Phong Tỉnh" }, 6: { number: 29, name: "Thuần Khảm" },
    7: { number: 39, name: "Thủy Sơn Kiển" }, 8: { number: 8, name: "Thủy Địa Tỷ" },
  },
  7: {
    1: { number: 26, name: "Sơn Thiên Đại Súc" }, 2: { number: 41, name: "Sơn Trạch Tổn" }, 3: { number: 22, name: "Sơn Hỏa Bí" },
    4: { number: 27, name: "Sơn Lôi Di" }, 5: { number: 18, name: "Sơn Phong Cổ" }, 6: { number: 4, name: "Sơn Thủy Mông" },
    7: { number: 52, name: "Thuần Cấn" }, 8: { number: 23, name: "Sơn Địa Bác" },
  },
  8: {
    1: { number: 11, name: "Địa Thiên Thái" }, 2: { number: 19, name: "Địa Trạch Lâm" }, 3: { number: 36, name: "Địa Hỏa Minh Di" },
    4: { number: 24, name: "Địa Lôi Phục" }, 5: { number: 46, name: "Địa Phong Thăng" }, 6: { number: 7, name: "Địa Thủy Sư" },
    7: { number: 15, name: "Địa Sơn Khiêm" }, 8: { number: 2, name: "Thuần Khôn" },
  },
};

export const HEX: Record<string, { n: string; t: number; h: number; yn: string; th?: string; tg?: string }> = {
  "1": { n: "Thuần Càn", t: 1, h: 1, yn: "Cương kiện, khởi đầu, lãnh đạo mạnh mẽ." },
  "2": { n: "Thuần Khôn", t: 8, h: 8, yn: "Nhu thuận, bao dung, tích lũy đức độ." },
  "3": { n: "Thủy Lôi Truân", t: 6, h: 4, yn: "Gian nan ban đầu, cần kiên trì gầy dựng." },
  "4": { n: "Sơn Thủy Mông", t: 7, h: 6, yn: "Chưa sáng tỏ, cần học hỏi và được dẫn dắt." },
  "5": { n: "Thủy Thiên Nhu", t: 6, h: 1, yn: "Chờ thời cơ, dưỡng sức chờ cơ hội lớn." },
  "6": { n: "Thiên Thủy Tụng", t: 1, h: 6, yn: "Tranh chấp, cẩn thận kiện tụng và bất hòa." },
  "7": { n: "Địa Thủy Sư", t: 8, h: 6, yn: "Tập hợp lực lượng, có kỷ luật và tướng tài." },
  "8": { n: "Thủy Địa Tỷ", t: 6, h: 8, yn: "Gắn kết, tương trợ, tìm kiếm đồng minh." },
  "9": { n: "Phong Thiên Tiểu Súc", t: 5, h: 1, yn: "Tích lũy nhỏ, chờ đủ gió mới bay cao." },
  "10": { n: "Thiên Trạch Lý", t: 1, h: 2, yn: "Thận trọng từng bước, giữ lễ nghi phép tắc." },
  "11": { n: "Địa Thiên Thái", t: 8, h: 1, yn: "Hanh thông, vạn vật giao hòa, đại cát." },
  "12": { n: "Thiên Địa Bỉ", t: 1, h: 8, yn: "Bế tắc, tiểu nhân lấn át, nên giữ mình." },
  "13": { n: "Thiên Hỏa Đồng Nhân", t: 1, h: 3, yn: "Đồng tâm hiệp lực, kết giao bằng hữu tốt." },
  "14": { n: "Hỏa Thiên Đại Hữu", t: 3, h: 1, yn: "Sở hữu lớn, tài lộc dồi dào, tỏa sáng." },
  "15": { n: "Địa Sơn Khiêm", t: 8, h: 7, yn: "Khiêm tốn, nhún nhường thì ắt gặp may lành." },
  "16": { n: "Lôi Địa Dự", t: 4, h: 8, yn: "Vui vẻ phấn khởi, chuẩn bị hành động lớn." },
  "17": { n: "Trạch Lôi Tùy", t: 2, h: 4, yn: "Thuận theo hoàn cảnh, tùy thời ứng biến." },
  "18": { n: "Sơn Phong Cổ", t: 7, h: 5, yn: "Sửa đổi việc cũ, chấn chỉnh sai lầm." },
  "19": { n: "Địa Trạch Lâm", t: 8, h: 2, yn: "Đến gần, giám sát, mở rộng tầm ảnh hưởng." },
  "20": { n: "Phong Địa Quán", t: 5, h: 8, yn: "Quan sát sâu sắc, làm gương cho người khác." },
  "21": { n: "Hỏa Lôi Phệ Hạp", t: 3, h: 4, yn: "Trừ bỏ trở ngại, thi hành kỷ luật nghiêm." },
  "22": { n: "Sơn Hỏa Bí", t: 7, h: 3, yn: "Trang trí, văn vẻ, chú trọng nét thanh lịch." },
  "23": { n: "Sơn Địa Bác", t: 7, h: 8, yn: "Bào mòn, suy giảm, nên án binh bất động." },
  "24": { n: "Địa Lôi Phục", t: 8, h: 4, yn: "Hồi sinh, chu kỳ mới bắt đầu trở lại." },
  "25": { n: "Thiên Lôi Vô Vọng", t: 1, h: 4, yn: "Thuận tự nhiên, không toan tính vụ lợi." },
  "26": { n: "Sơn Thiên Đại Súc", t: 7, h: 1, yn: "Tích tụ tài năng và của cải quy mô lớn." },
  "27": { n: "Sơn Lôi Di", t: 7, h: 4, yn: "Nuôi dưỡng thân tâm, cẩn trọng lời ăn tiếng nói." },
  "28": { n: "Trạch Phong Đại Quá", t: 2, h: 5, yn: "Gánh nặng quá mức, cần giải tỏa áp lực." },
  "29": { n: "Thuần Khảm", t: 6, h: 6, yn: "Hiểm trở trùng trùng, giữ vững tâm can." },
  "30": { n: "Thuần Ly", t: 3, h: 3, yn: "Sáng rực, nhiệt huyết, cần điểm tựa vững bền." },
  "31": { n: "Trạch Sơn Hàm", t: 2, h: 7, yn: "Cảm ứng, giao duyên, nhân duyên tốt đẹp." },
  "32": { n: "Lôi Phong Hằng", t: 4, h: 5, yn: "Bền lâu, kiên định với con đường đã chọn." },
  "33": { n: "Thiên Sơn Độn", t: 1, h: 7, yn: "Rút lui chiến lược, bảo toàn sinh lực." },
  "34": { n: "Lôi Thiên Đại Tráng", t: 4, h: 1, yn: "Khí thế mạnh mẽ, tránh bốc đồng liều lĩnh." },
  "35": { n: "Hỏa Địa Tấn", t: 3, h: 8, yn: "Tiến lên vững bước, được cấp trên nâng đỡ." },
  "36": { n: "Địa Hỏa Minh Di", t: 8, h: 3, yn: "Ánh sáng bị che khuất, giấu tài giữ mình." },
  "37": { n: "Phong Hỏa Gia Nhân", t: 5, h: 3, yn: "Gia đạo thuận hòa, ổn định nội bộ." },
  "38": { n: "Hỏa Trạch Khuê", t: 3, h: 2, yn: "Bất đồng ý kiến, cần dung hòa sự khác biệt." },
  "39": { n: "Thủy Sơn Kiển", t: 6, h: 7, yn: "Gian khó phía trước, nên tìm bậc minh triết." },
  "40": { n: "Lôi Thủy Giải", t: 4, h: 6, yn: "Giải tỏa căng thẳng, tháo gỡ nút thắt." },
  "41": { n: "Sơn Trạch Tổn", t: 7, h: 2, yn: "Bớt cái thừa, chịu thiệt nhỏ để lợi lớn." },
  "42": { n: "Phong Lôi Ích", t: 5, h: 4, yn: "Tăng cường, gia tăng lợi ích và phát triển." },
  "43": { n: "Trạch Thiên Quải", t: 2, h: 1, yn: "Quyết đoán dứt khoát, loại trừ tiêu cực." },
  "44": { n: "Thiên Phong Cấu", t: 1, h: 5, yn: "Gặp gỡ bất ngờ, cẩn trọng cám dỗ." },
  "45": { n: "Trạch Địa Tụy", t: 2, h: 8, yn: "Tụ họp đông đúc, tinh hoa hội tụ." },
  "46": { n: "Địa Phong Thăng", t: 8, h: 5, yn: "Thăng tiến từ từ, tương lai rộng mở." },
  "47": { n: "Trạch Thủy Khốn", t: 2, h: 6, yn: "Khốn khó hạn chế, tôi luyện ý chí." },
  "48": { n: "Thủy Phong Tỉnh", t: 6, h: 5, yn: "Giếng nước nuôi dưỡng, cội nguồn tri thức." },
  "49": { n: "Trạch Hỏa Cách", t: 2, h: 3, yn: "Đổi mới cải cách, thay đổi toàn diện." },
  "50": { n: "Hỏa Phong Đỉnh", t: 3, h: 5, yn: "Vững vàng như đỉnh, rèn luyện thành tài." },
  "51": { n: "Thuần Chấn", t: 4, h: 4, yn: "Sấm chớp kinh sợ, thức tỉnh và sửa mình." },
  "52": { n: "Thuần Cấn", t: 7, h: 7, yn: "Dừng lại tĩnh tâm, an phận giữ chỗ." },
  "53": { n: "Phong Sơn Tiệm", t: 5, h: 7, yn: "Tiến bước tuần tự, phát triển bền vững." },
  "54": { n: "Lôi Trạch Quy Muội", t: 4, h: 2, yn: "Sai vị trí, khởi đầu có phần lệch lạc." },
  "55": { n: "Lôi Hỏa Phong", t: 4, h: 3, yn: "Thịnh vượng dồi dào, đỉnh cao danh vọng." },
  "56": { n: "Hỏa Sơn Lữ", t: 3, h: 7, yn: "Đi xa lữ hành, thích nghi với môi trường mới." },
  "57": { n: "Thuần Tốn", t: 5, h: 5, yn: "Nhu mì thấu suốt, khéo léo len lỏi." },
  "58": { n: "Thuần Đoài", t: 2, h: 2, yn: "Vui vẻ hòa nhã, giao tiếp thuyết phục." },
  "59": { n: "Phong Thủy Hoán", t: 5, h: 6, yn: "Giải tỏa phân tán, khơi thông bế tắc." },
  "60": { n: "Thủy Trạch Tiết", t: 6, h: 2, yn: "Tiết chế có chừng mực, giữ gìn kỷ cương." },
  "61": { n: "Phong Trạch Trung Phu", t: 5, h: 2, yn: "Chân thành tín nghĩa, cảm hóa lòng người." },
  "62": { n: "Lôi Sơn Tiểu Quá", t: 4, h: 7, yn: "Vượt quá một chút, chỉ nên làm việc nhỏ." },
  "63": { n: "Thủy Hỏa Ký Tế", t: 6, h: 3, yn: "Đã hoàn thành, giữ gìn thành quả trọn vẹn." },
  "64": { n: "Hỏa Thủy Vị Tế", t: 3, h: 6, yn: "Chưa xong, còn cơ hội phát triển phía trước." },
};

// ==========================================
// 3. BÁT CỰC LINH SỐ (64 CẶP SAO)
// ==========================================

export const BCLS = {
  stars: {
    SK: { n: "Sinh Khí", t: "cat", p: 4, e: "Mộc", desc: "Quý nhân phù trợ, may mắn, quan hệ rộng mở." },
    TY: { n: "Thiên Y", t: "cat", p: 3, e: "Thổ", desc: "Tài vận dồi dào, sức khỏe, trí tuệ thông minh." },
    DN: { n: "Diên Niên", t: "cat", p: 2, e: "Kim", desc: "Sự nghiệp vững chắc, lãnh đạo, tài chính bền." },
    PV: { n: "Phục Vị", t: "cat", p: 1, e: "Mộc", desc: "Ổn định, kiên nhẫn, chờ đợi thời cơ." },
    TM: { n: "Tuyệt Mệnh", t: "hung", p: -4, e: "Kim", desc: "Hao tài, sức khỏe suy giảm, tranh chấp tai tiếng." },
    NQ: { n: "Ngũ Quỷ", t: "hung", p: -2, e: "Hỏa", desc: "Biến cố bất ngờ, tiểu nhân quấy phá, bất an." },
    LS: { n: "Lục Sát", t: "hung", p: -1, e: "Thủy", desc: "Tình cảm rắc rối, đào hoa xấu, tâm lý bất ổn." },
    HH: { n: "Họa Hại", t: "hung", p: -3, e: "Thổ", desc: "Thị phi khẩu thiệt, cản trở công việc, hao tổn." },
  },
  pairs: {
    // SINH KHÍ (生氣) — Đại Cát
    "14": "SK", "41": "SK", "67": "SK", "76": "SK", "39": "SK", "93": "SK", "28": "SK", "82": "SK",
    "08": "SK", "80": "SK", "58": "SK", "85": "SK",
    // THIÊN Y (天醫) — Cát
    "13": "TY", "31": "TY", "68": "TY", "86": "TY", "49": "TY", "94": "TY", "27": "TY", "72": "TY",
    "07": "TY", "70": "TY", "57": "TY", "75": "TY",
    // DIÊN NIÊN (延年) — Cát
    "19": "DN", "91": "DN", "78": "DN", "87": "DN", "34": "DN", "43": "DN", "26": "DN", "62": "DN",
    "06": "DN", "60": "DN", "56": "DN", "65": "DN",
    // PHỤC VỊ (伏位) — Bình
    "11": "PV", "22": "PV", "33": "PV", "44": "PV", "55": "PV", "66": "PV", "77": "PV", "88": "PV", "99": "PV",
    "00": "PV", "05": "PV", "50": "PV", "02": "PV", "20": "PV", "25": "PV", "52": "PV",
    // HỌA HẠI (禍害) — Hung
    "17": "HH", "71": "HH", "89": "HH", "98": "HH", "46": "HH", "64": "HH", "23": "HH", "32": "HH",
    "03": "HH", "30": "HH", "53": "HH", "35": "HH",
    // LỤC SÁT (六煞) — Hung
    "16": "LS", "61": "LS", "47": "LS", "74": "LS", "38": "LS", "83": "LS", "29": "LS", "92": "LS",
    "09": "LS", "90": "LS", "59": "LS", "95": "LS",
    // NGŨ QUỶ (五鬼) — Hung
    "18": "NQ", "81": "NQ", "79": "NQ", "97": "NQ", "36": "NQ", "63": "NQ", "24": "NQ", "42": "NQ",
    "04": "NQ", "40": "NQ", "54": "NQ", "45": "NQ",
    // TUYỆT MỆNH (絕命) — Đại Hung
    "12": "TM", "21": "TM", "69": "TM", "96": "TM", "48": "TM", "84": "TM", "37": "TM", "73": "TM",
    "01": "TM", "10": "TM", "51": "TM", "15": "TM",
  } as Record<string, "SK" | "TY" | "DN" | "PV" | "TM" | "NQ" | "LS" | "HH">,
};

/**
 * Điểm từng sao theo bảng Bát Cực Linh Số của khách (trang 28–29 tài liệu SGEN, 26/10/2026):
 * Sinh Khí +4, Thiên Y +3, Diên Niên +2, Phục Vị +1, Lục Sát −1, Ngũ Quỷ −2, Họa Hại −3, Tuyệt Mệnh −4.
 */
export const BCLS_SCORES: Record<string, number> = {
  SK: 4, TY: 3, DN: 2, PV: 1,
  LS: -1, NQ: -2, HH: -3, TM: -4,
};

/** Điểm tuyệt đối lớn nhất của một cặp — mốc quy đổi điểm nền Bát Cực về thang 0–100. */
const BCLS_MAX_POINTS = Math.max(...Object.values(BCLS_SCORES).map(Math.abs));

export function pairsByCode(code: string): string[] {
  return Object.keys(BCLS.pairs).filter((k) => BCLS.pairs[k] === code);
}

export function analyzeBCLS(phone: string) {
  const digits = normalizeVietnamesePhone(phone);
  const items: Array<{ pair: string; code: string; name: string; type: "cat" | "hung"; points: number; desc: string }> = [];
  const counts: Record<string, number> = { SK: 0, TY: 0, DN: 0, PV: 0, TM: 0, NQ: 0, LS: 0, HH: 0 };
  let rawScore = 0;

  for (let i = 0; i < digits.length - 1; i++) {
    const pair = digits.slice(i, i + 2);
    const code = BCLS.pairs[pair] || (pair[0] === pair[1] ? "PV" : null);
    if (code) {
      const star = BCLS.stars[code];
      const pts = BCLS_SCORES[code] || 0;
      counts[code] = (counts[code] || 0) + 1;
      rawScore += pts;
      items.push({ pair, code, name: star.n, type: star.t as "cat" | "hung", points: pts, desc: star.desc });
    }
  }

  const numPairs = Math.max(1, digits.length - 1);
  const baseScore = Math.max(0, Math.min(100, Math.round(50 + (50 * rawScore) / (BCLS_MAX_POINTS * numPairs))));

  // Bát Cực không chỉ xét số lượng cặp cát/hung. Một chuỗi trường khí liên tục
  // và vị trí lặp ở đuôi SIM có sức ảnh hưởng rõ hơn các cặp rời rạc. Giữ
  // baseScore để người xem đối chiếu tổng cát/hung, sau đó cộng/trừ phần cấu trúc.
  const longestRun = (type: "cat" | "hung") => {
    let longest = 0;
    let current = 0;
    for (const item of items) {
      if (item.type === type) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    return longest;
  };
  const longestCatRun = longestRun("cat");
  const longestHungRun = longestRun("hung");
  let longestCatStart = 0;
  let currentCatStart = 0;
  let currentCatRun = 0;
  let recordedCatRun = 0;
  items.forEach((item, index) => {
    if (item.type === "cat") {
      if (currentCatRun === 0) currentCatStart = index;
      currentCatRun += 1;
      if (currentCatRun > recordedCatRun) {
        recordedCatRun = currentCatRun;
        longestCatStart = currentCatStart;
      }
    } else {
      currentCatRun = 0;
    }
  });
  let trailingCatRun = 0;
  for (let i = items.length - 1; i >= 0 && items[i].type === "cat"; i--) trailingCatRun += 1;
  let tailRepeat = 1;
  for (let i = digits.length - 2; i >= 0 && digits[i] === digits[digits.length - 1]; i--) {
    tailRepeat += 1;
  }
  const hasReciprocalCatFlow = items.some((item, index) => {
    const next = items[index + 1];
    return Boolean(next && item.type === "cat" && next.type === "cat" && item.pair === next.pair.split("").reverse().join(""));
  });

  let catRunBonus = longestCatRun >= 4 ? 18 : longestCatRun === 3 ? 16 : longestCatRun === 2 ? 4 : 0;
  // Chuỗi cát ở nửa sau/đuôi phản ánh vận đang dùng mạnh hơn chuỗi chỉ nằm
  // ở đầu số. Giảm một nửa phần thưởng nếu chuỗi mạnh chỉ xuất hiện sớm.
  if (trailingCatRun < longestCatRun && longestCatStart < Math.floor(items.length / 2)) {
    catRunBonus = Math.round(catRunBonus / 2);
  }
  const hungRunPenalty = longestHungRun >= 3 ? 15 : longestHungRun === 2 ? 4 : 0;
  const tailRepeatBonus = tailRepeat >= 4 ? 10 : tailRepeat === 3 ? 7 : 0;
  const reciprocalBonus = hasReciprocalCatFlow ? 5 : 0;
  const sequenceAdjustment = catRunBonus + tailRepeatBonus + reciprocalBonus - hungRunPenalty;
  const normalizedScore = Math.max(0, Math.min(100, baseScore + sequenceAdjustment));

  return {
    items,
    pairs: items,
    counts,
    rawScore,
    baseScore,
    score: normalizedScore,
    sequenceAdjustment,
    longestCatRun,
    longestHungRun,
    tailRepeat,
    summary: longestHungRun >= 3
      ? "Có chuỗi hung tinh liên tiếp, cần ưu tiên kiểm soát rủi ro."
      : longestCatRun >= 3
        ? "Trường khí cát nối tiếp tạo lực nâng ổn định cho dãy số."
        : "Cát và hung đan xen; cần đọc cùng quẻ và mệnh cục.",
    total: digits.length - 1,
  };
}

// ==========================================
// 4. MAI HOA DỊCH SỐ CHO SIM
// ==========================================

export interface QueCalculation {
  sumUpper: number;
  sumLower: number;
  sumAll: number;
  upperQuai: number;
  lowerQuai: number;
  haoDong: number;
  hexNum: number;
  hoNum: number;
  bienNum: number;
  allLines: number[];
  hoLines: number[];
  bienLines: number[];
}

export function calcQue(phone: string): QueCalculation {
  const digits = normalizeVietnamesePhone(phone);
  const len = digits.length;
  const half = Math.ceil(len / 2);
  const topStr = digits.slice(0, half);
  const bottomStr = digits.slice(half);

  const sumUpper = topStr.split("").reduce((acc, c) => acc + (parseInt(c, 10) || 0), 0);
  const sumLower = bottomStr.split("").reduce((acc, c) => acc + (parseInt(c, 10) || 0), 0);
  const sumAll = sumUpper + sumLower;

  let upperQuai = sumUpper % 8;
  if (upperQuai === 0) upperQuai = 8;
  let lowerQuai = sumLower % 8;
  if (lowerQuai === 0) lowerQuai = 8;

  let haoDong = sumAll % 6;
  if (haoDong === 0) haoDong = 6;

  const hexNum = LOOKUP[upperQuai]?.[lowerQuai] || 1;

  const lowerBits = triBits(lowerQuai);
  const upperBits = triBits(upperQuai);
  const allLines = [...lowerBits, ...upperBits];

  const hoLowerQuai = bitsToTri([allLines[1], allLines[2], allLines[3]]);
  const hoUpperQuai = bitsToTri([allLines[2], allLines[3], allLines[4]]);
  const hoNum = LOOKUP[hoUpperQuai]?.[hoLowerQuai] || 1;
  const hoLines = [...triBits(hoLowerQuai), ...triBits(hoUpperQuai)];

  const bienLines = allLines.slice();
  const dIdx = haoDong - 1;
  bienLines[dIdx] = bienLines[dIdx] === 1 ? 0 : 1;
  const bienLowerQuai = bitsToTri(bienLines.slice(0, 3));
  const bienUpperQuai = bitsToTri(bienLines.slice(3, 6));
  const bienNum = LOOKUP[bienUpperQuai]?.[bienLowerQuai] || 1;

  return {
    sumUpper,
    sumLower,
    sumAll,
    upperQuai,
    lowerQuai,
    haoDong,
    hexNum,
    hoNum,
    bienNum,
    allLines,
    hoLines,
    bienLines,
  };
}

/** Một quẻ vận (Tiền/Trung/Hậu) lập từ một đoạn số của dãy sim. */
export interface SimFortuneHexagram {
  /** Đoạn số được xét, ví dụ "0902". */
  digits: string;
  /** Các chữ số cộng ra Quái Thượng / Quái Hạ. */
  upperDigits: string;
  lowerDigits: string;
  upperQuai: number;
  lowerQuai: number;
  hexNum: number;
}

export interface SimLifeHexagrams {
  primary: number;
  changed: number;
  movingLine: number;
  /** Null khi dãy số không đủ dài để có quẻ vận đó (ví dụ dãy 4–8 số không có Trung Vận). */
  tienVan: SimFortuneHexagram | null;
  trungVan: SimFortuneHexagram | null;
  hauVan: SimFortuneHexagram | null;
}

/**
 * Độ dài đoạn Tiền / Trung / Hậu vận theo độ dài dãy số
 * (mục “Công thức tính toán sim số” trong tài liệu nội dung SGEN 22/09/2026). 0 = không có.
 */
const FORTUNE_SEGMENTS: Record<number, [number, number, number]> = {
  4: [2, 0, 2], 5: [3, 0, 2], 6: [3, 0, 3], 7: [4, 0, 3], 8: [4, 0, 4],
  9: [3, 3, 3], 10: [4, 3, 3], 11: [4, 4, 3], 12: [4, 4, 4],
  13: [5, 4, 4], 14: [5, 5, 4], 15: [5, 5, 5],
  // 16–20 số: tài liệu chưa nêu, kéo dài đúng quy luật chia ba đoạn đều (đoạn đầu dài nhất).
  16: [6, 5, 5], 17: [6, 6, 5], 18: [6, 6, 6], 19: [7, 6, 6], 20: [7, 7, 6],
};

const quaiFromSum = (digits: string) => {
  const quai = digits.split("").reduce((acc, c) => acc + (parseInt(c, 10) || 0), 0) % 8;
  return quai === 0 ? 8 : quai;
};

/**
 * Đoạn 2 số: 1 số đầu / 1 số cuối; 3 số: 2 số đầu / 1 số cuối;
 * 4 và 5 số: 2 số đầu / 2 số cuối (tài liệu ghi như vậy cho cả đoạn 5 số).
 */
function calcFortuneHexagram(segment: string): SimFortuneHexagram {
  const head = segment.length <= 2 ? 1 : 2;
  const tail = segment.length <= 3 ? 1 : 2;
  const upperDigits = segment.slice(0, head);
  const lowerDigits = segment.slice(-tail);
  const upperQuai = quaiFromSum(upperDigits);
  const lowerQuai = quaiFromSum(lowerDigits);
  return { digits: segment, upperDigits, lowerDigits, upperQuai, lowerQuai, hexNum: LOOKUP[upperQuai][lowerQuai] };
}

/** Năm quẻ luận sim: Quẻ Chủ, Quẻ Biến, Tiền Vận, Trung Vận, Hậu Vận. */
export function calcSimLifeHexagrams(phone: string): SimLifeHexagrams {
  const digits = normalizeVietnamesePhone(phone);
  const que = calcQue(digits);
  const segments = FORTUNE_SEGMENTS[digits.length];
  let tienVan: SimFortuneHexagram | null = null;
  let trungVan: SimFortuneHexagram | null = null;
  let hauVan: SimFortuneHexagram | null = null;
  if (segments) {
    const [tienLen, trungLen, hauLen] = segments;
    tienVan = calcFortuneHexagram(digits.slice(0, tienLen));
    if (trungLen) trungVan = calcFortuneHexagram(digits.slice(tienLen, tienLen + trungLen));
    hauVan = calcFortuneHexagram(digits.slice(-hauLen));
  }
  return { primary: que.hexNum, changed: que.bienNum, movingLine: que.haoDong, tienVan, trungVan, hauVan };
}

// ==========================================
// 5. CUNG PHI, BẢN MỆNH & ĐỐI CHIẾU
// ==========================================

export const CUNG_PHI_NAM: Record<number, string> = {
  1: "Khảm", 2: "Ly", 3: "Cấn", 4: "Đoài", 5: "Càn",
  6: "Khôn", 7: "Tốn", 8: "Chấn", 9: "Khôn", 0: "Khôn",
};

export const CUNG_PHI_NU: Record<number, string> = {
  1: "Cấn", 2: "Càn", 3: "Đoài", 4: "Cấn", 5: "Ly",
  6: "Khảm", 7: "Khôn", 8: "Chấn", 9: "Tốn", 0: "Tốn",
};

export const LAP_XUAN_MAPPING: Record<number, string> = {
  1984: "02-04", 1985: "02-04", 1986: "02-04", 1987: "02-04", 1988: "02-04",
  1989: "02-04", 1990: "02-04", 1991: "02-04", 1992: "02-04", 1993: "02-04",
  1994: "02-04", 1995: "02-04", 1996: "02-04", 1997: "02-04", 1998: "02-04",
  1999: "02-04", 2000: "02-04", 2001: "02-04", 2002: "02-04", 2003: "02-04",
  2004: "02-04", 2005: "02-04", 2006: "02-04", 2007: "02-04", 2008: "02-04",
  2009: "02-04", 2010: "02-04", 2011: "02-04", 2012: "02-04", 2013: "02-04",
  2014: "02-04", 2015: "02-04", 2016: "02-04", 2017: "02-04", 2018: "02-04",
  2019: "02-04", 2020: "02-04", 2021: "02-03", 2022: "02-04", 2023: "02-04",
  2024: "02-04", 2025: "02-03", 2026: "02-04",
};

export const LAP_DONG_MAPPING: Record<number, string> = {
  1984: "11-07", 1985: "11-07", 1986: "11-07", 1987: "11-08", 1988: "11-07",
  1989: "11-07", 1990: "11-07", 1991: "11-08", 1992: "11-07", 1993: "11-07",
  1994: "11-07", 1995: "11-08", 1996: "11-07", 1997: "11-07", 1998: "11-07",
  1999: "11-08", 2000: "11-07", 2001: "11-07", 2002: "11-07", 2003: "11-08",
  2004: "11-07", 2005: "11-07", 2006: "11-07", 2007: "11-08", 2008: "11-07",
  2009: "11-07", 2010: "11-07", 2011: "11-08", 2012: "11-07", 2013: "11-07",
  2014: "11-07", 2015: "11-08", 2016: "11-07", 2017: "11-07", 2018: "11-07",
  2019: "11-08", 2020: "11-07", 2021: "11-07", 2022: "11-07", 2023: "11-08",
  2024: "11-07", 2025: "11-07", 2026: "11-07",
};

export const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export interface PersonAstro {
  birthDate: string;
  gender: "Nam" | "Nữ";
  calYear: number;
  astroYear: number;
  canChi: string;
  menh: string;
  menhElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  quaiSo: number;
  cungPhi: string;
  cungPhiElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  hienThi: string;
  nhom: "Đông" | "Tây";
  lapDong: boolean;
}

export function buildPersonFromBirth(birthDateStr: string, gender: "Nam" | "Nữ"): PersonAstro {
  const parts = birthDateStr.split("-").map(Number);
  const year = parts[0] || 1990;
  const month = parts[1] || 1;
  const day = parts[2] || 1;

  const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const lx = LAP_XUAN_MAPPING[year] || "02-04";
  const ld = LAP_DONG_MAPPING[year] || "11-07";

  let astroYear = year;
  if (mmdd < lx) {
    astroYear = year - 1;
  }

  let isLapDong = false;
  if (mmdd >= ld) {
    isLapDong = true;
  }

  const canIdx = (astroYear - 4) % 10;
  const chiIdx = (astroYear - 4) % 12;
  const canChi = `${CAN_NAMES[(canIdx + 10) % 10]} ${CHI_NAMES[(chiIdx + 12) % 12]}`;

  // Bản mệnh = nạp âm của năm khí tiết, tính từ chu kỳ Lục Thập Hoa Giáp nên đúng với mọi năm sinh.
  const menh = getNaYinByYear(astroYear);
  const menhElement = napAmHanh(menh);

  // Quái số dùng năm khí tiết (đổi năm tại Lập Xuân), không tự tăng năm ở
  // Lập Đông. Ví dụ nam 1996: tổng 1+9+9+6 = 25 -> dư 7;
  // 11 - 7 = 4, tức cung Tốn.
  const yearDigitSum = String(astroYear).split("").reduce((sum, digit) => sum + Number(digit), 0);
  let reducedYear = yearDigitSum % 9;
  if (reducedYear === 0) reducedYear = 9;
  let quaiSo = gender === "Nam" ? (11 - reducedYear) % 9 : (4 + reducedYear) % 9;
  if (quaiSo === 0) quaiSo = 9;
  if (quaiSo === 5) quaiSo = gender === "Nam" ? 2 : 8;

  const CUNG_PHI_BY_QUAI: Record<number, { name: string; element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ" }> = {
    1: { name: "Khảm", element: "Thủy" },
    2: { name: "Khôn", element: "Thổ" },
    3: { name: "Chấn", element: "Mộc" },
    4: { name: "Tốn", element: "Mộc" },
    6: { name: "Càn", element: "Kim" },
    7: { name: "Đoài", element: "Kim" },
    8: { name: "Cấn", element: "Thổ" },
    9: { name: "Ly", element: "Hỏa" },
  };
  const cungInfo = CUNG_PHI_BY_QUAI[quaiSo] || CUNG_PHI_BY_QUAI[8];
  const cungPhi = cungInfo.name;

  const DONG_TU = ["Khảm", "Ly", "Chấn", "Tốn"];
  const nhom: "Đông" | "Tây" = DONG_TU.includes(cungPhi) ? "Đông" : "Tây";

  return {
    birthDate: birthDateStr,
    gender,
    calYear: year,
    astroYear,
    canChi,
    menh,
    menhElement,
    quaiSo,
    cungPhi,
    cungPhiElement: cungInfo.element,
    hienThi: `${cungPhi} (${nhom} Tứ Trạch)`,
    nhom,
    lapDong: isLapDong,
  };
}

export const NH_SINH: Record<string, string> = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
export const NH_KHAC: Record<string, string> = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };
export const NH_COLOR: Record<string, string> = { "Kim": "#997A15", "Mộc": "#2E7D32", "Thủy": "#1565C0", "Hỏa": "#C62828", "Thổ": "#6D4C41" };

export const DIGIT_NGUHANH: Record<string, "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ"> = {
  "1": "Thủy", "6": "Thủy",
  "2": "Hỏa", "7": "Hỏa",
  "3": "Mộc", "8": "Mộc",
  "4": "Kim", "9": "Kim",
  "5": "Thổ", "0": "Thổ",
};

export const DIGIT_POS: {
  tai: Record<string, { lbl: string; element: string; icon: string; desc: string; trait: string }>;
  su: Record<string, { lbl: string; element: string; icon: string; desc: string; trait: string }>;
} = {
  tai: {
    "1": { lbl: "Thủy Tinh", element: "Thủy", icon: "💧", desc: "Tài vận linh hoạt, mềm mỏng, dễ thích nghi.", trait: "Linh hoạt" },
    "2": { lbl: "Hỏa Tinh", element: "Hỏa", icon: "🔥", desc: "Năng động, nhiệt huyết, chi tiêu nhanh.", trait: "Sôi nổi" },
    "3": { lbl: "Mộc Tinh", element: "Mộc", icon: "🌱", desc: "Sinh sôi, bền bỉ, tích lũy dần theo thời gian.", trait: "Phát triển" },
    "4": { lbl: "Kim Tinh", element: "Kim", icon: "⚔️", desc: "Cương quyết, sắc bén trong đầu tư.", trait: "Quyết đoán" },
    "5": { lbl: "Thổ Tinh", element: "Thổ", icon: "⛰️", desc: "Vững chắc, ổn định, tích sản an toàn.", trait: "Ổn định" },
    "6": { lbl: "Thủy Tinh", element: "Thủy", icon: "🌊", desc: "Dòng tiền lưu thông, đa dạng nguồn thu.", trait: "Đa luồng" },
    "7": { lbl: "Hỏa Tinh", element: "Hỏa", icon: "⚡", desc: "Nhiệt tình, sáng tạo, phát triển nhanh.", trait: "Đột phá" },
    "8": { lbl: "Mộc Tinh", element: "Mộc", icon: "🌳", desc: "Đại thụ vững chãi, tài sản tích lũy lớn.", trait: "Bền vững" },
    "9": { lbl: "Kim Tinh", element: "Kim", icon: "👑", desc: "Đỉnh cao tài lộc, lãnh đạo tài chính.", trait: "Quyền uy" },
    "0": { lbl: "Thổ Tinh", element: "Thổ", icon: "🌍", desc: "Bao dung, trầm ổn, tích tụ nội lực.", trait: "Trầm lắng" },
  },
  su: {
    "1": { lbl: "Thủy Vận", element: "Thủy", icon: "⛵", desc: "Công danh trôi chảy, giỏi ngoại giao kết nối.", trait: "Ngoại giao" },
    "2": { lbl: "Hỏa Vận", element: "Hỏa", icon: "🚀", desc: "Thăng tiến nhanh, tiên phong hành động.", trait: "Tiên phong" },
    "3": { lbl: "Mộc Vận", element: "Mộc", icon: "🌿", desc: "Gầy dựng từng bước, công danh rộng mở.", trait: "Tiến triển" },
    "4": { lbl: "Kim Vận", element: "Kim", icon: "🏛️", desc: "Kỷ luật thép, điều hành mạch lạc.", trait: "Kỷ luật" },
    "5": { lbl: "Thổ Vận", element: "Thổ", icon: "🏰", desc: "Nền tảng vững như bàn thạch, trụ cột tập thể.", trait: "Vững vàng" },
    "6": { lbl: "Thủy Vận", element: "Thủy", icon: "🌐", desc: "Mở rộng quy mô, linh hoạt thích ứng thị trường.", trait: "Mở rộng" },
    "7": { lbl: "Hỏa Vận", element: "Hỏa", icon: "💡", desc: "Sáng kiến đổi mới, truyền cảm hứng mạnh mẽ.", trait: "Cảm hứng" },
    "8": { lbl: "Mộc Vận", element: "Mộc", icon: "🏆", desc: "Vươn tới tầm cao, sự nghiệp vẻ vang.", trait: "Vẻ vang" },
    "9": { lbl: "Kim Vận", element: "Kim", icon: "🌟", desc: "Quyền lực tối cao, dẫn dắt đội ngũ lớn.", trait: "Dẫn đầu" },
    "0": { lbl: "Thổ Vận", element: "Thổ", icon: "🛡️", desc: "Hậu phương kiên cố, chuẩn bị cho bước nhảy.", trait: "Củng cố" },
  },
};

export const NUT_YN: Record<number, string> = {
  1: "Khởi đầu, thủ lĩnh, độc lập.",
  2: "Hài hòa, hợp tác, kết nối.",
  3: "Sáng tạo, nhiệt huyết, tài năng.",
  4: "Nền tảng, kỷ luật, bền vững.",
  5: "Tự do, biến chuyển, đột phá.",
  6: "Trách nhiệm, chăm sóc, gia đạo.",
  7: "Trí tuệ, chiêm nghiệm, khai sáng.",
  8: "Quyền lực, thịnh vượng, kinh doanh.",
  9: "Viên mãn, đỉnh cao, nhân ái.",
};

export function napAmHanh(napAm: string): "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ" {
  if (napAm.includes("Kim")) return "Kim";
  if (napAm.includes("Mộc")) return "Mộc";
  if (napAm.includes("Thủy")) return "Thủy";
  if (napAm.includes("Hỏa")) return "Hỏa";
  return "Thổ";
}

export function soNguHanh(digits: string): "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ" {
  const counts: Record<string, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const ch of digits) {
    const h = DIGIT_NGUHANH[ch];
    if (h) counts[h]++;
  }
  let best: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ" = "Kim";
  let max = -1;
  const order: Array<"Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ"> = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];
  for (const k of order) {
    if (counts[k] > max) {
      max = counts[k];
      best = k;
    }
  }
  return best;
}

export function amDuongPhan(digits: string): { chan: number; le: number; score: number; verdict: string } {
  let chan = 0, le = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[i], 10);
    if (!isNaN(d)) {
      if (d % 2 === 0) chan++;
      else le++;
    }
  }
  const n = digits.length || 1;
  const dv = Math.abs(chan - le) / n;
  const score = Math.round(100 * (1 - dv));
  const verdict = dv <= 0.2 ? "Cân bằng tốt" : dv <= 0.45 ? "Khá cân bằng" : (chan > le ? "Thiên Âm (nhiều số chẵn)" : "Thiên Dương (nhiều số lẻ)");
  return { chan, le, score, verdict };
}

export function nguHanhQuanHe(menh: string, so: string): { label: string; score: number; txt: string } | null {
  if (!menh || !so) return null;
  if (menh === so) return { label: "Tương Hòa", score: 85, txt: "Ngũ hành của số cùng hành với bản mệnh, hòa hợp và cộng hưởng năng lượng." };
  if (NH_SINH[so] === menh) return { label: "Số Sinh Mệnh", score: 100, txt: "Ngũ hành của số SINH cho bản mệnh, được nuôi dưỡng, đây là mức cát lợi bậc nhất." };
  if (NH_KHAC[so] === menh) return { label: "Số Khắc Mệnh", score: 22, txt: "Ngũ hành của số KHẮC bản mệnh, bị chế ngự và hao tổn, nên cân nhắc hoặc hóa giải." };
  if (NH_SINH[menh] === so) return { label: "Mệnh Sinh Số", score: 48, txt: "Bản mệnh phải SINH cho số nên bị tiết khí hao lực, chỉ ở mức bình." };
  if (NH_KHAC[menh] === so) return { label: "Mệnh Khắc Số", score: 70, txt: "Bản mệnh KHẮC được số nên mình làm chủ và dùng tốt, ở mức khá." };
  return { label: "Tương Hòa", score: 80, txt: "" };
}

export function tongNut(digits: string): { sum: number; root: number; meaning: string } {
  const s = digits.split("").reduce((a, c) => a + (parseInt(c, 10) || 0), 0);
  let root = s;
  while (root > 9) {
    root = String(root).split("").reduce((a, c) => a + parseInt(c, 10), 0);
  }
  if (root === 0) root = 9;
  return {
    sum: s,
    root,
    meaning: NUT_YN[root] || "Hài hòa",
  };
}

export interface HexagramAssessmentItem {
  number: number;
  name: string;
  score: number;
  label: string;
  explanation: string;
}

export interface HexagramAssessment {
  primary: HexagramAssessmentItem;
  changed: HexagramAssessmentItem;
  mutual: HexagramAssessmentItem;
  score: number;
  summary: string;
}

export function assessHexagramJourney(r: QueCalculation): HexagramAssessment {
  const makeItem = (number: number): HexagramAssessmentItem => {
    const hex = HEX[String(number)] || { n: "Kinh Dịch", yn: "Cần đối chiếu thêm hào động." };
    const quality = queChatLuong(number);
    return { number, name: hex.n, score: quality.d, label: quality.l, explanation: hex.yn };
  };
  const primary = makeItem(r.hexNum);
  const changed = makeItem(r.bienNum);
  const mutual = makeItem(r.hoNum);

  let score = Math.round(primary.score * 0.65 + changed.score * 0.25 + mutual.score * 0.10);
  let summary = "Quẻ chủ là nền hiện tại; quẻ biến cho biết xu hướng sau khi hào động phát huy.";
  if (primary.score <= 30 && changed.score <= 30) {
    score = 15;
    summary = "Quẻ chủ và quẻ biến đều thuộc nhóm Hung, báo hiệu nền hiện tại lẫn chiều chuyển hóa đều cần thận trọng.";
  } else if (primary.score >= 100) {
    score = changed.score >= 100 ? 100 : 94;
    summary = changed.score >= 100
      ? "Quẻ chủ Cát và quẻ biến tiếp tục Cát, trường khí thuận từ hiện tại đến xu hướng phát triển."
      : "Quẻ chủ Cát giữ vai trò chính; quẻ biến nhắc cần quản trị tốt giai đoạn chuyển tiếp.";
  } else if (primary.score >= 65 && changed.score >= 100) {
    score = mutual.score >= 100 ? 100 : 92;
    summary = mutual.score >= 100
      ? "Quẻ chủ ổn định, quẻ hỗ và quẻ biến cùng Cát: nội lực tốt và xu hướng đi lên rõ."
      : "Quẻ chủ ở mức Bình nhưng quẻ biến Cát, cho thấy dư địa chuyển biến tích cực.";
  }

  return { primary, changed, mutual, score, summary };
}

export interface DestinyAxisAssessment {
  key: "napAm" | "cungPhi" | "nhatChu";
  label: string;
  ownerElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  simElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  relation: string;
  score: number;
}

export interface DestinyAssessment {
  score: number;
  simElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  axes: DestinyAxisAssessment[];
  summary: string;
}

function assessElementAxis(
  key: DestinyAxisAssessment["key"],
  label: string,
  ownerElement: DestinyAxisAssessment["ownerElement"],
  simElement: DestinyAxisAssessment["simElement"],
): DestinyAxisAssessment {
  if (ownerElement === simElement) return { key, label, ownerElement, simElement, relation: "Tương hòa", score: 95 };
  if (NH_SINH[simElement] === ownerElement) return { key, label, ownerElement, simElement, relation: "SIM sinh chủ", score: 100 };
  if (NH_KHAC[ownerElement] === simElement) return { key, label, ownerElement, simElement, relation: "Chủ khắc SIM", score: 80 };
  if (NH_SINH[ownerElement] === simElement) return { key, label, ownerElement, simElement, relation: "Chủ sinh SIM", score: 70 };
  return { key, label, ownerElement, simElement, relation: "SIM khắc chủ", score: 25 };
}

export function assessDestinyCompatibility(
  person: PersonAstro | null,
  digits: string,
  dayMasterElement?: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ",
): DestinyAssessment | null {
  if (!person) return null;
  const simElement = soNguHanh(digits);
  const axes = [
    assessElementAxis("napAm", "Nạp âm bản mệnh", person.menhElement, simElement),
    assessElementAxis("cungPhi", `Cung phi ${person.cungPhi}`, person.cungPhiElement, simElement),
  ];
  if (dayMasterElement) axes.push(assessElementAxis("nhatChu", "Nhật chủ", dayMasterElement, simElement));

  // Một trục xung không nên xóa sạch hai trục tương hợp. Lấy hai trục hỗ trợ
  // mạnh nhất, đồng thời vẫn hiển thị đầy đủ trục còn lại để người xem cân nhắc.
  const strongestAxes = [...axes].sort((a, b) => b.score - a.score).slice(0, Math.min(2, axes.length));
  const score = Math.round(strongestAxes.reduce((sum, axis) => sum + axis.score, 0) / strongestAxes.length);
  const summary = `${strongestAxes.map((axis) => `${axis.label}: ${axis.relation}`).join("; ")}.`;
  return { score, simElement, axes, summary };
}

export interface ScoreCriterion {
  key: "kinhDich" | "batCucLinhSo" | "menhCuc" | "amDuong";
  label: string;
  score: number | null;
  weight: number;
  points: number;
  explanation: string;
}

export interface ScoreMeta {
  s1: number;
  s2: number;
  s3: number | null;
  s4: number;
  total: number;
  band: { l: string; c: string };
  ad: { chan: number; le: number; score: number; verdict: string };
  bc: ReturnType<typeof analyzeBCLS>;
  qd: { d: number; l: string; c: string };
  rel: { label: string; score: number; txt: string } | null;
  hexagrams: HexagramAssessment;
  destiny: DestinyAssessment | null;
  criteria: ScoreCriterion[];
}

export function computeTong(
  r: QueCalculation,
  bc: ReturnType<typeof analyzeBCLS>,
  ad: { chan: number; le: number; score: number; verdict: string },
  person: PersonAstro | null,
  digits: string,
  dayMasterElement?: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ",
): ScoreMeta {
  const qd = queChatLuong(r.hexNum);
  const hexagrams = assessHexagramJourney(r);
  const s4 = hexagrams.score;
  const s1 = bc.score;
  const s2 = ad.score;

  let s3: number | null = null;
  let relObj: { label: string; score: number; txt: string } | null = null;
  const destiny = assessDestinyCompatibility(person, digits, dayMasterElement);

  if (person) {
    const menhH = napAmHanh(person.menh);
    const soH = soNguHanh(digits);
    relObj = nguHanhQuanHe(menhH, soH);
    s3 = destiny?.score ?? relObj?.score ?? null;
  }

  const weights = s3 !== null
    ? { kinhDich: 45, batCucLinhSo: 25, menhCuc: 20, amDuong: 10 }
    : { kinhDich: 55, batCucLinhSo: 30, menhCuc: 0, amDuong: 15 };
  const criterion = (
    key: ScoreCriterion["key"],
    label: string,
    score: number | null,
    weight: number,
    explanation: string,
  ): ScoreCriterion => ({
    key,
    label,
    score,
    weight,
    points: score === null ? 0 : Math.round((score * weight) / 10) / 10,
    explanation,
  });
  const criteria: ScoreCriterion[] = [
    criterion("kinhDich", "Quẻ Kinh Dịch", s4, weights.kinhDich, hexagrams.summary),
    criterion("batCucLinhSo", "Bát Cực Linh Số", s1, weights.batCucLinhSo, bc.summary),
    criterion("menhCuc", "Hợp Mệnh Cục", s3, weights.menhCuc, destiny?.summary || "Chưa có ngày sinh để đối chiếu mệnh cục."),
    criterion("amDuong", "Âm Dương", s2, weights.amDuong, `${ad.chan} số chẵn · ${ad.le} số lẻ — ${ad.verdict}.`),
  ];
  const total = Math.max(0, Math.min(100, Math.round(criteria.reduce((sum, item) => sum + item.points, 0))));

  const band = total >= 85 ? { l: "Đại Cát", c: "#1a7a3a" } : total >= 70 ? { l: "Cát", c: "#1565c0" } : total >= 55 ? { l: "Bình Hòa", c: "#8a6d1f" } : total >= 40 ? { l: "Tiểu Hung", c: "#e65100" } : { l: "Hung", c: "#c62828" };

  return {
    s1,
    s2,
    s3,
    s4,
    total,
    band,
    ad,
    bc,
    qd,
    rel: relObj,
    hexagrams,
    destiny,
    criteria,
  };
}

// ==========================================
// 6. SMART SEGMENTATION & SỐ ĐẶC BIỆT
// ==========================================

export interface Segment {
  digits: string;
  type: "five" | "four" | "three";
  fetchTrio: string;
  tier?: string;
  combo_name?: string;
  connector?: string;
  leftPair?: string;
  innerPair?: string;
  rightPair?: string;
  modifier?: string;
  beforePair?: string;
  afterPair?: string;
}

export function buildSegments(phone: string): Segment[] {
  const digits = normalizeVietnamesePhone(phone);
  const segments: Segment[] = [];

  for (let i = 0; i <= digits.length - 3; ) {
    const trio = digits.slice(i, i + 3);
    if (trio.length === 3 && (trio[2] === "5" || trio[2] === "0") && digits.length - i >= 4) {
      const segStr = digits.slice(i, i + 4);
      segments.push({
        digits: segStr,
        type: "four",
        fetchTrio: digits.slice(i + 1, i + 4),
        modifier: trio[2],
        beforePair: segStr.slice(0, 2),
        afterPair: segStr.slice(2, 4),
      });
      i += 4;
      continue;
    }

    if (digits.length - i >= 5) {
      const mid = digits[i + 2];
      if (mid === "5" || mid === "0") {
        const segStr = digits.slice(i, i + 5);
        segments.push({
          digits: segStr,
          type: "five",
          fetchTrio: segStr[0] + mid + segStr[4],
          connector: mid,
          leftPair: segStr.slice(0, 2),
          innerPair: segStr[1] + segStr[3],
          rightPair: segStr.slice(3, 5),
        });
        i += 5;
        continue;
      }
    }

    segments.push({
      digits: trio,
      type: "three",
      fetchTrio: trio,
    });
    i += 3;
  }

  return segments;
}

export interface SpecialNumResult {
  name: string;
  desc: string;
  found: string;
}

export function getSpecials(phone: string): SpecialNumResult[] {
  const digits = normalizeVietnamesePhone(phone);
  const found: SpecialNumResult[] = [];

  const check = (regex: RegExp, name: string, desc: string) => {
    const match = digits.match(regex);
    if (match) {
      found.push({ name, desc, found: match[0] });
    }
  };

  check(/(73|37|84|48)/, "Diễm Vương Tự Đến", "Dãy số chứa cặp Tuyệt Mệnh cực mạnh (73, 37, 84, 48), cần lưu ý giữ gìn tài vận và hóa giải.");
  check(/(168|681|816)/, "Nhất Lục Bát Đại Phát", "Bộ ba số sinh tài đại lộc 168 (Nhất Lục Bát), kích hoạt trường khí may mắn mở lối kinh doanh.");
  check(/(888)/, "Tam Bát Vượng Tài", "Bộ ba số 888 vượng khí phát đạt, tượng trưng cho sự thịnh vượng và tiền tài bền vững.");
  check(/(.)\1{3,}/, "Tứ Quý / Ngũ Quý", "Thế số đồng nhất cực mạnh, gia tăng trường khí tập trung.");
  check(/(.)\1{2}/, "Tam Hoa", "Bộ ba số giống nhau, tạo điểm nhấn năng lượng hài hòa.");
  check(/(0123|1234|2345|3456|4567|5678|6789)/, "Sảnh Tiến", "Tiến bước vững chắc, công danh sự nghiệp hanh thông.");
  check(/(6868|8686|6886|8668)/, "Lộc Phát Kép", "Thu hút tài lộc mạnh mẽ, mở lối kinh doanh phát đạt.");
  check(/(3979|7939)/, "Thần Tài Lớn - Nhỏ", "Quý nhân tài lộc tương trợ, tiền của tụ về.");
  check(/(3878|7838)/, "Ông Địa Lớn - Nhỏ", "Đất đai bền vững, tài sản gia tăng, gia đạo yên bình.");

  return found;
}

export function getVerdictText(meta: ScoreMeta, phone: string): { l1: string; l2: string; l3: string; icon: string } {
  const tot = meta.total;
  let l1 = "";
  let icon = "⚖️";

  if (tot >= 75) {
    l1 = "<strong>Số này NÊN GIỮ.</strong> Năng lượng tổng thể thuộc nhóm Cát, đang trợ lực cho chủ nhân.";
    icon = "✅";
  } else if (tot >= 55) {
    l1 = "<strong>Số này DÙNG ĐƯỢC nhưng chưa trợ lực.</strong> Ở mức Bình Hòa — không phá nhưng cũng không đẩy vận lên.";
    icon = "⚖️";
  } else {
    l1 = "<strong>Số này ĐANG KÌM VẬN của chủ nhân.</strong> Điểm tổng rơi vào nhóm Hung.";
    icon = "⚠️";
  }

  let l2 = "";
  if (meta.rel && meta.rel.score <= 45) {
    l2 = `Điểm cần lưu ý nhất: ngũ hành của số <strong>${meta.rel.label.toLowerCase()}</strong> chủ nhân.`;
  } else if (meta.qd.d <= 30) {
    const primaryHexagram = HEX[String(calcQue(phone).hexNum)];
    l2 = `Điểm cần lưu ý nhất: quẻ chủ <strong>${primaryHexagram?.n || "Kinh Dịch"}</strong> thuộc nhóm Hung.`;
  } else if (meta.bc.counts.TM > 0 || meta.bc.counts.NQ > 0) {
    l2 = `Điểm cần lưu ý nhất: dãy số chứa năng lượng Tuyệt Mệnh / Ngũ Quỷ.`;
  } else {
    l2 = `Trường khí tổng thể cân bằng, các chỉ số hài hòa.`;
  }

  let l3 = "";
  if (tot >= 75) {
    l3 = "Không cần đổi số. Lưu kết quả vào Hồ Sơ để đối chiếu khi xem cho người thân hoặc chọn số thứ hai.";
  } else {
    l3 = "Nên cân nhắc đổi sang số hợp mệnh, hoặc tối thiểu hóa giải phần hung — xem phần gợi ý cuối trang.";
  }

  return { l1, l2, l3, icon };
}

// ==========================================
// 7. DỮ LIỆU BÁT CUNG & LỤC HÀO THỰC THỂ
// ==========================================

const NA_GIAP_TRIGRAM_LOWER: Record<number, Array<{ can: string; chi: string; isYang: boolean }>> = {
  1: [{ can: "Giáp", chi: "Tý", isYang: true }, { can: "Giáp", chi: "Dần", isYang: true }, { can: "Giáp", chi: "Thìn", isYang: true }],
  2: [{ can: "Đinh", chi: "Tị", isYang: true }, { can: "Đinh", chi: "Mão", isYang: true }, { can: "Đinh", chi: "Sửu", isYang: false }],
  3: [{ can: "Kỷ", chi: "Mão", isYang: true }, { can: "Kỷ", chi: "Sửu", isYang: false }, { can: "Kỷ", chi: "Hợi", isYang: true }],
  4: [{ can: "Canh", chi: "Tý", isYang: true }, { can: "Canh", chi: "Dần", isYang: true }, { can: "Canh", chi: "Thìn", isYang: true }],
  5: [{ can: "Tân", chi: "Sửu", isYang: false }, { can: "Tân", chi: "Hợi", isYang: true }, { can: "Tân", chi: "Dậu", isYang: true }],
  6: [{ can: "Mậu", chi: "Dần", isYang: false }, { can: "Mậu", chi: "Thìn", isYang: true }, { can: "Mậu", chi: "Ngọ", isYang: false }],
  7: [{ can: "Bính", chi: "Thìn", isYang: false }, { can: "Bính", chi: "Ngọ", isYang: false }, { can: "Bính", chi: "Thân", isYang: true }],
  8: [{ can: "Ất", chi: "Mùi", isYang: false }, { can: "Ất", chi: "Tị", isYang: false }, { can: "Ất", chi: "Mão", isYang: false }],
};

const NA_GIAP_TRIGRAM_UPPER: Record<number, Array<{ can: string; chi: string; isYang: boolean }>> = {
  1: [{ can: "Nhâm", chi: "Ngọ", isYang: true }, { can: "Nhâm", chi: "Thân", isYang: true }, { can: "Nhâm", chi: "Tuất", isYang: true }],
  2: [{ can: "Đinh", chi: "Hợi", isYang: true }, { can: "Đinh", chi: "Dậu", isYang: true }, { can: "Đinh", chi: "Mùi", isYang: false }],
  3: [{ can: "Kỷ", chi: "Dậu", isYang: true }, { can: "Kỷ", chi: "Mùi", isYang: false }, { can: "Kỷ", chi: "Tị", isYang: true }],
  4: [{ can: "Canh", chi: "Ngọ", isYang: true }, { can: "Canh", chi: "Thân", isYang: true }, { can: "Canh", chi: "Tuất", isYang: true }],
  5: [{ can: "Tân", chi: "Mùi", isYang: false }, { can: "Tân", chi: "Tị", isYang: true }, { can: "Tân", chi: "Mão", isYang: true }],
  6: [{ can: "Mậu", chi: "Thân", isYang: false }, { can: "Mậu", chi: "Tuất", isYang: true }, { can: "Mậu", chi: "Tý", isYang: false }],
  7: [{ can: "Bính", chi: "Tuất", isYang: false }, { can: "Bính", chi: "Tý", isYang: false }, { can: "Bính", chi: "Dần", isYang: true }],
  8: [{ can: "Quý", chi: "Sửu", isYang: false }, { can: "Quý", chi: "Hợi", isYang: false }, { can: "Quý", chi: "Dậu", isYang: false }],
};

const BRANCH_ELEMENTS: Record<string, "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ"> = {
  "Tý": "Thủy", "Sửu": "Thổ", "Dần": "Mộc", "Mão": "Mộc", "Thìn": "Thổ", "Tị": "Hỏa",
  "Ngọ": "Hỏa", "Mùi": "Thổ", "Thân": "Kim", "Dậu": "Kim", "Tuất": "Thổ", "Hợi": "Thủy",
};

export const BAT_CUNG_64: Record<string, { palace: string; element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ"; the: number; ung: number }> = {
  "1_1": { palace: "Càn", element: "Kim", the: 6, ung: 3 },
  "1_5": { palace: "Càn", element: "Kim", the: 1, ung: 4 },
  "1_7": { palace: "Càn", element: "Kim", the: 2, ung: 5 },
  "1_8": { palace: "Càn", element: "Kim", the: 3, ung: 6 },
  "5_8": { palace: "Càn", element: "Kim", the: 4, ung: 1 },
  "7_8": { palace: "Càn", element: "Kim", the: 5, ung: 2 },
  "3_8": { palace: "Càn", element: "Kim", the: 4, ung: 1 },
  "3_1": { palace: "Càn", element: "Kim", the: 3, ung: 6 },

  "6_6": { palace: "Khảm", element: "Thủy", the: 6, ung: 3 },
  "6_2": { palace: "Khảm", element: "Thủy", the: 1, ung: 4 },
  "6_4": { palace: "Khảm", element: "Thủy", the: 2, ung: 5 },
  "6_3": { palace: "Khảm", element: "Thủy", the: 3, ung: 6 },
  "2_3": { palace: "Khảm", element: "Thủy", the: 4, ung: 1 },
  "4_3": { palace: "Khảm", element: "Thủy", the: 5, ung: 2 },
  "8_3": { palace: "Khảm", element: "Thủy", the: 4, ung: 1 },
  "8_6": { palace: "Khảm", element: "Thủy", the: 3, ung: 6 },

  "7_7": { palace: "Cấn", element: "Thổ", the: 6, ung: 3 },
  "7_3": { palace: "Cấn", element: "Thổ", the: 1, ung: 4 },
  "7_1": { palace: "Cấn", element: "Thổ", the: 2, ung: 5 },
  "7_2": { palace: "Cấn", element: "Thổ", the: 3, ung: 6 },
  "3_2": { palace: "Cấn", element: "Thổ", the: 4, ung: 1 },
  "1_2": { palace: "Cấn", element: "Thổ", the: 5, ung: 2 },
  "5_2": { palace: "Cấn", element: "Thổ", the: 4, ung: 1 },
  "5_7": { palace: "Cấn", element: "Thổ", the: 3, ung: 6 },

  "4_4": { palace: "Chấn", element: "Mộc", the: 6, ung: 3 },
  "4_8": { palace: "Chấn", element: "Mộc", the: 1, ung: 4 },
  "4_6": { palace: "Chấn", element: "Mộc", the: 2, ung: 5 },
  "4_5": { palace: "Chấn", element: "Mộc", the: 3, ung: 6 },
  "8_5": { palace: "Chấn", element: "Mộc", the: 4, ung: 1 },
  "6_5": { palace: "Chấn", element: "Mộc", the: 5, ung: 2 },
  "2_5": { palace: "Chấn", element: "Mộc", the: 4, ung: 1 },
  "2_4": { palace: "Chấn", element: "Mộc", the: 3, ung: 6 },

  "5_5": { palace: "Tốn", element: "Mộc", the: 6, ung: 3 },
  "5_1": { palace: "Tốn", element: "Mộc", the: 1, ung: 4 },
  "5_3": { palace: "Tốn", element: "Mộc", the: 2, ung: 5 },
  "5_4": { palace: "Tốn", element: "Mộc", the: 3, ung: 6 },
  "1_4": { palace: "Tốn", element: "Mộc", the: 4, ung: 1 },
  "3_4": { palace: "Tốn", element: "Mộc", the: 5, ung: 2 },
  "7_4": { palace: "Tốn", element: "Mộc", the: 4, ung: 1 },
  "7_5": { palace: "Tốn", element: "Mộc", the: 3, ung: 6 },

  "3_3": { palace: "Ly", element: "Hỏa", the: 6, ung: 3 },
  "3_7": { palace: "Ly", element: "Hỏa", the: 1, ung: 4 },
  "3_5": { palace: "Ly", element: "Hỏa", the: 2, ung: 5 },
  "3_6": { palace: "Ly", element: "Hỏa", the: 3, ung: 6 },
  "7_6": { palace: "Ly", element: "Hỏa", the: 4, ung: 1 },
  "5_6": { palace: "Ly", element: "Hỏa", the: 5, ung: 2 },
  "1_6": { palace: "Ly", element: "Hỏa", the: 4, ung: 1 },
  "1_3": { palace: "Ly", element: "Hỏa", the: 3, ung: 6 },

  "8_8": { palace: "Khôn", element: "Thổ", the: 6, ung: 3 },
  "8_4": { palace: "Khôn", element: "Thổ", the: 1, ung: 4 },
  "8_2": { palace: "Khôn", element: "Thổ", the: 2, ung: 5 },
  "8_1": { palace: "Khôn", element: "Thổ", the: 3, ung: 6 },
  "4_1": { palace: "Khôn", element: "Thổ", the: 4, ung: 1 },
  "2_1": { palace: "Khôn", element: "Thổ", the: 5, ung: 2 },
  "6_1": { palace: "Khôn", element: "Thổ", the: 4, ung: 1 },
  "6_8": { palace: "Khôn", element: "Thổ", the: 3, ung: 6 },

  "2_2": { palace: "Đoài", element: "Kim", the: 6, ung: 3 },
  "2_6": { palace: "Đoài", element: "Kim", the: 1, ung: 4 },
  "2_8": { palace: "Đoài", element: "Kim", the: 2, ung: 5 },
  "2_7": { palace: "Đoài", element: "Kim", the: 3, ung: 6 },
  "6_7": { palace: "Đoài", element: "Kim", the: 4, ung: 1 },
  "8_7": { palace: "Đoài", element: "Kim", the: 5, ung: 2 },
  "4_7": { palace: "Đoài", element: "Kim", the: 4, ung: 1 },
  "4_2": { palace: "Đoài", element: "Kim", the: 3, ung: 6 },
};

export function getHexagramPalaceAndTheUng(upper: number, lower: number) {
  const key = `${upper}_${lower}`;
  return BAT_CUNG_64[key] || { palace: "Càn", element: "Kim" as const, the: 6, ung: 3 };
}

export function getLucThuByDayStem(dayStem: string): string[] {
  switch (dayStem) {
    case "Giáp": case "Ất":
      return ["Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ"];
    case "Bính": case "Đinh":
      return ["Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long"];
    case "Mậu":
      return ["Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước"];
    case "Kỷ":
      return ["Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần"];
    case "Canh": case "Tân":
      return ["Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà"];
    case "Nhâm": case "Quý":
    default:
      return ["Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ"];
  }
}

export function getTuanKhong(dayStem: string, dayBranch: string): string[] {
  const stems = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const branches = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const sIdx = stems.indexOf(dayStem);
  const bIdx = branches.indexOf(dayBranch);
  if (sIdx === -1 || bIdx === -1) return ["Tuất", "Hợi"];
  const diff = (bIdx - sIdx + 12) % 12;
  const k1 = branches[(diff + 10) % 12];
  const k2 = branches[(diff + 11) % 12];
  return [k1, k2];
}

export function getVuongTuong(lineElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ", monthBranch: string): "Vượng" | "Tướng" | "Hưu" | "Tù" | "Tử" {
  let monthElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ" = "Mộc";
  if (["Dần", "Mão"].includes(monthBranch)) monthElement = "Mộc";
  else if (["Tị", "Ngọ"].includes(monthBranch)) monthElement = "Hỏa";
  else if (["Thân", "Dậu"].includes(monthBranch)) monthElement = "Kim";
  else if (["Hợi", "Tý"].includes(monthBranch)) monthElement = "Thủy";
  else monthElement = "Thổ";

  if (lineElement === monthElement) return "Vượng";
  if (NH_SINH[monthElement] === lineElement) return "Tướng";
  if (NH_SINH[lineElement] === monthElement) return "Hưu";
  if (NH_KHAC[monthElement] === lineElement) return "Tử";
  return "Tù";
}

export function getTruongSinh(lineElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ", targetBranch: string): string {
  const TS_TABLE: Record<string, string[]> = {
    Mộc: ["Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất"],
    Hỏa: ["Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"],
    Thổ: ["Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"],
    Kim: ["Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn"],
    Thủy: ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi"],
  };
  const STAGES = ["Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
  const list = TS_TABLE[lineElement] || TS_TABLE.Mộc;
  const idx = list.indexOf(targetBranch);
  return idx !== -1 ? STAGES[idx] : "—";
}

export function getQuyThan(dayStem: string, lineBranch: string): string {
  const QUY_NHAN: Record<string, string[]> = {
    Giáp: ["Sửu", "Mùi"], Mậu: ["Sửu", "Mùi"], Canh: ["Sửu", "Mùi"],
    Ất: ["Tý", "Thân"], Kỷ: ["Tý", "Thân"],
    Bính: ["Hợi", "Dậu"], Đinh: ["Hợi", "Dậu"],
    Nhâm: ["Mão", "Tị"], Quý: ["Mão", "Tị"],
    Tân: ["Ngọ", "Dần"],
  };
  const target = QUY_NHAN[dayStem] || [];
  return target.includes(lineBranch) ? "Quý Nhân" : "—";
}

export function getPalaceTrait(hexName: string, upper: number, lower: number): string {
  return `Cung ${TRI[upper][0]} phối ${TRI[lower][0]}`;
}

export const TUONG_QUE_64: Record<string, string> = {
  "Thuần Càn": "Cương kiện trung chính, hanh thông quang đại.",
  "Thuần Khôn": "Địa thế khôn, quân tử dĩ hậu đức tải vật.",
  "Thủy Lôi Truân": "Truân như thảo mộc sơ sinh, vạn sự khởi đầu nan.",
  "Sơn Thủy Mông": "Mông dĩ dưỡng chính, thánh công dã.",
  "Thủy Thiên Nhu": "Nhu dĩ đãi thời, thuận tự nhiên vi thượng.",
  "Thiên Thủy Tụng": "Tụng tắc hữu hại, dĩ hòa vi quý.",
  "Địa Thủy Sư": "Sư xuất dĩ luật, trinh trượng nhân cát.",
  "Thủy Địa Tỷ": "Tỷ tắc cát thiện, nguyên phệ nguyên vĩnh trinh.",
  "Phong Thiên Tiểu Súc": "Mật vân bất vũ, tu trì nội lực.",
  "Thiên Trạch Lý": "Lý hổ vĩ bất xước nhân, hanh.",
  "Địa Thiên Thái": "Thái tắc tiểu vãng đại lai, cát hanh.",
  "Thiên Địa Bỉ": "Bỉ chi phỉ nhân, bất lợi quân tử trinh.",
  "Thiên Hỏa Đồng Nhân": "Đồng nhân vu dã, hanh, lợi thiệp đại xuyên.",
  "Hỏa Thiên Đại Hữu": "Đại hữu nguyên hanh, thuận thiên y thời.",
  "Địa Sơn Khiêm": "Khiêm tôn tự hạ, đức quang đại dã.",
  "Lôi Địa Dự": "Dự thuận dĩ động, thiên địa thuận chi.",
  "Trạch Lôi Tùy": "Tùy thời biến hóa, đại hanh trinh vô cữu.",
  "Sơn Phong Cổ": "Cổ giả sự dã, tiên giáp tam nhật hậu giáp tam nhật.",
  "Địa Trạch Lâm": "Lâm giả đại dã, hanh lợi trinh.",
  "Phong Địa Quán": "Quán giả quán dã, hữu phu dực nhiên.",
  "Hỏa Lôi Phệ Hạp": "Phệ hạp hanh, lợi dụng ngục.",
  "Sơn Hỏa Bí": "Bí hanh, tiểu lợi hữu du vãng.",
  "Sơn Địa Bác": "Bác lạc dã, bất lợi hữu du vãng.",
  "Địa Lôi Phục": "Phục hanh, xuất nhập vô tật, bằng lai vô cữu.",
  "Thiên Lôi Vô Vọng": "Vô vọng nguyên hanh lợi trinh.",
  "Sơn Thiên Đại Súc": "Đại súc lợi trinh, bất gia thực cát.",
  "Sơn Lôi Di": "Di trinh cát, quan di tự cầu khẩu thực.",
  "Trạch Phong Đại Quá": "Đại quá đống nạo, lợi hữu du vãng hanh.",
  "Thuần Khảm": "Tập khảm, hữu phu duy tâm hanh.",
  "Thuần Ly": "Ly lợi trinh hanh, súc tẫn ngưu cát.",
  "Trạch Sơn Hàm": "Hàm hanh lợi trinh, thủ nữ cát.",
  "Lôi Phong Hằng": "Hằng hanh vô cữu, lợi trinh.",
  "Thiên Sơn Độn": "Độn hanh, tiểu lợi trinh.",
  "Lôi Thiên Đại Tráng": "Đại tráng lợi trinh, cương dĩ động dã.",
  "Hỏa Địa Tấn": "Tấn, khang hầu dụng tứ mã phiên thứ.",
  "Địa Hỏa Minh Di": "Minh di lợi gian trinh, minh nhập địa trung.",
  "Phong Hỏa Gia Nhân": "Gia nhân lợi nữ trinh, gia đạo chính dã.",
  "Hỏa Trạch Khuê": "Khuê tiểu sự cát, nhị nữ đồng cư chí bất đồng.",
  "Thủy Sơn Kiển": "Kiển lợi tây nam, bất lợi đông bắc, kiến đại nhân.",
  "Lôi Thủy Giải": "Giải lợi tây nam, vô sở vãng, lai phục cát.",
  "Sơn Trạch Tổn": "Tổn hữu phu, nguyên cát vô cữu khả trinh.",
  "Phong Lôi Ích": "Ích lợi hữu du vãng, lợi thiệp đại xuyên.",
  "Trạch Thiên Quải": "Quải dương vu vương đình, phu hào hữu lệ.",
  "Thiên Phong Cấu": "Cấu nữ tráng, vật dụng thủ nữ.",
  "Trạch Địa Tụy": "Tụy hanh, vương cách hữu miếu, kiến đại nhân.",
  "Địa Phong Thăng": "Thăng nguyên hanh, dụng kiến đại nhân vật tuất.",
  "Trạch Thủy Khốn": "Khốn hanh trinh, đại nhân cát vô cữu, hữu ngôn bất tín.",
  "Thủy Phong Tỉnh": "Tỉnh cải ấp bất cải tỉnh, vô táng vô đắc.",
  "Trạch Hỏa Cách": "Cách dĩ nhật nãi phu, nguyên hanh lợi trinh hối vong.",
  "Hỏa Phong Đỉnh": "Đỉnh nguyên cát hanh, chính vị ngưng mệnh.",
  "Thuần Chấn": "Chấn lai khích khích, tiếu ngôn ách ách.",
  "Thuần Cấn": "Cấn kỳ bối, bất hoạch kỳ thân, hành kỳ đình bất kiến kỳ nhân.",
  "Phong Sơn Tiệm": "Tiệm nữ quy cát, lợi trinh, tiến dĩ chính dã.",
  "Lôi Trạch Quy Muội": "Quy muội chinh hung, vô du lợi.",
  "Lôi Hỏa Phong": "Phong hanh, vương cách chi, vật ưu nghi nhật trung.",
  "Hỏa Sơn Lữ": "Lữ tiểu hanh, lữ trinh cát.",
  "Thuần Tốn": "Tốn tiểu hanh, lợi hữu du vãng, kiến đại nhân.",
  "Thuần Đoài": "Đoài hanh lợi trinh, bằng hữu giảng tập.",
  "Phong Thủy Hoán": "Hoán hanh, vương cách hữu miếu, lợi thiệp đại xuyên.",
  "Thủy Trạch Tiết": "Tiết hanh, khổ tiết bất khả trinh.",
  "Phong Trạch Trung Phu": "Trung phu đồn ngư cát, lợi thiệp đại xuyên lợi trinh.",
  "Lôi Sơn Tiểu Quá": "Tiểu quá hanh lợi trinh, khả tiểu sự bất khả đại sự.",
  "Thủy Hỏa Ký Tế": "Ký tế hanh tiểu, lợi trinh, sơ cát chung loạn.",
  "Hỏa Thủy Vị Tế": "Vị tế hanh, tiểu hồ ngật tế, nhu kỳ vĩ, vô du lợi.",
};

// ==========================================
// 8. CHUẨN HÓA INPUT & VALIDATION
// ==========================================

export interface SimAnalysisInput {
  phone: string;
  birthDate?: string;
  birthTime?: string;
  gender?: "Nam" | "Nữ";
  calendarType?: "solar" | "lunar";
  lunarLeapMonth?: boolean;
}

/** Độ dài dãy số được phép phân tích (không chỉ số điện thoại 10 số: sim, biển số, dãy số bất kỳ). */
export const SIM_MIN_DIGITS = 4;
export const SIM_MAX_DIGITS = 20;

export function normalizeVietnamesePhone(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9+]/g, "");
  if (clean.startsWith("+84")) {
    clean = "0" + clean.slice(3);
  } else if (clean.startsWith("84") && clean.length === 11) {
    // 84 + 9 số = số điện thoại di động quốc tế; dãy khác độ dài giữ nguyên để không làm sai dãy 4–20 số.
    clean = "0" + clean.slice(2);
  }
  return clean;
}

/** Dãy số hợp lệ để phân tích: chỉ chữ số, dài 4–20. */
export function isValidSimDigits(digits: string): boolean {
  return /^\d+$/.test(digits) && digits.length >= SIM_MIN_DIGITS && digits.length <= SIM_MAX_DIGITS;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateSimPhongThuyInput(input: SimAnalysisInput): ValidationResult {
  const digits = normalizeVietnamesePhone(input?.phone || "");
  if (!isValidSimDigits(digits)) {
    return { isValid: false, error: `Vui lòng nhập dãy số hợp lệ gồm ${SIM_MIN_DIGITS} đến ${SIM_MAX_DIGITS} chữ số.` };
  }
  if (input?.birthDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
      return { isValid: false, error: "Ngày sinh không hợp lệ." };
    }
    if (input.calendarType !== "lunar" && !isValidDateString(input.birthDate)) {
      return { isValid: false, error: "Ngày dương lịch không tồn tại." };
    }
    if (input.calendarType === "lunar") {
      const [, month, day] = input.birthDate.split("-").map(Number);
      if (month < 1 || month > 12 || day < 1 || day > 30) {
        return { isValid: false, error: "Ngày âm lịch không hợp lệ." };
      }
    }
  }
  if (input?.birthTime && !isValidTimeString(input.birthTime)) {
    return { isValid: false, error: "Giờ sinh không hợp lệ." };
  }
  return { isValid: true };
}

function resolveSimBirth(input: SimAnalysisInput) {
  const birthTime = input.birthTime && isValidTimeString(input.birthTime) ? input.birthTime : "12:00";
  if (!input.birthDate) {
    return { solarDate: "1992-08-18", birthTime, hasOwner: false };
  }
  if (input.calendarType !== "lunar") {
    return { solarDate: input.birthDate, birthTime, hasOwner: true };
  }

  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  try {
    const lunar = Lunar.fromYmdHms(year, input.lunarLeapMonth ? -month : month, day, hour, minute, 0);
    const solar = lunar.getSolar();
    const solarDate = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, "0")}-${String(solar.getDay()).padStart(2, "0")}`;
    return { solarDate, birthTime, hasOwner: true };
  } catch {
    throw new RangeError("Ngày âm lịch không tồn tại hoặc tháng nhuận chưa đúng.");
  }
}

export const HAO_VITRI: Record<number, [string, string]> = {
  1: ["Sơ hào", "Giai đoạn bắt đầu, nền tảng cơ sở. Cần thận trọng chuẩn bị kỹ lưỡng."],
  2: ["Nhị hào", "Giai đoạn phát triển nội bộ, đắc trung đắc chính. Thuận lợi tiến bước."],
  3: ["Tam hào", "Giai đoạn chuyển tiếp, thử thách bản lĩnh. Tránh nôn nóng bốc đồng."],
  4: ["Tứ hào", "Giai đoạn tiệm cận đỉnh cao, phò tá lãnh đạo. Giữ đức khiêm nhường."],
  5: ["Ngũ hào", "Giai đoạn chí tôn, đắc vị lãnh đạo cao nhất. Đại cát hanh thông."],
  6: ["Thượng hào", "Giai đoạn cực thịnh chuyển suy, cần biết điểm dừng và thoái lui."],
};

// ==========================================
// 9. BỘ PHÂN TÍCH TỔNG HỢP (ANALYZE SIM)
// ==========================================

export interface SimAnalysisResult {
  phone: string;
  formattedPhone: string;
  r: QueCalculation;
  meta: ScoreMeta;
  scoreCriteria: ScoreCriterion[];
  hexagramAssessment: HexagramAssessment;
  overview: {
    totalScore: number;
    bandLabel: string;
    hexPrimaryName: string;
    hexHoName: string;
    hexBienName: string;
    haoDongText: string;
    dominantElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
    sumDigits: number;
    rootDigit: number;
    rootMeaning: string;
    elementDistribution: Array<{ element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ"; points: number }>;
  };
  person: PersonAstro | null;
  segments: Segment[];
  specials: SpecialNumResult[];
  verdict: { l1: string; l2: string; l3: string; icon: string };

  totalScore: number;
  finalClassification: "ĐẠI CÁT" | "CÁT" | "BÌNH" | "HUNG" | "TIỂU HUNG";
  scoreBreakdown: {
    kinhDich: number;
    batTinh: number;
    amDuong: number;
    hopMenh: number | null;
    linhSo81: number;
    nguHanhBanMenh: number;
  };
  primaryHexagram: {
    number: number;
    name: string;
    trieu: string;
    explanation: string;
    generalReading: string;
  };
  changedHexagram: {
    number: number;
    name: string;
    explanation: string;
    score: number;
    classification: string;
  };
  hexagramScore8: number;
  movingLine: number;
  lucHaoData: {
    meta: {
      solarDateTime: string;
      lunarDateTime: string;
      fourPillarsText: string;
      solarTerm: string;
      nhatThan: string;
      nguyetLenh: string;
    };
    primary: {
      number: number;
      name: string;
      hanzi: string;
      palace: string;
      palaceElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
      palaceLabel: string;
      theLine: number;
      ungLine: number;
      trieu: string;
      explanation: string;
      lines: Array<{
        position: number;
        isYang: boolean;
        isMoving: boolean;
        symbol?: string;
        can: string;
        chi: string;
        element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
        relative: string;
        lucThan?: string;
        canChi?: string;
        phucThan?: string;
        tuanKhong?: string;
        canChiFull: string;
        lucThu: string;
        theUng: string;
        vuongTuong: string;
        quyThan: string;
        tsNgay: string;
        tsThang: string;
      }>;
    };
    changed: {
      number: number;
      name: string;
      hanzi: string;
      palace: string;
      palaceElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
      palaceLabel: string;
      lines: Array<{
        position: number;
        isYang: boolean;
        isTransformed: boolean;
        symbol?: string;
        can: string;
        chi: string;
        element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
        relative: string;
        lucThan?: string;
        canChi?: string;
        phucThan?: string;
        tuanKhong?: string;
        lucThu?: string;
        canChiFull: string;
        vuongTuong: string;
        tsNgay: string;
        tsThang: string;
      }>;
    };
  };
  ownerAstro: {
    solarDate: string;
    lunarDate: string;
    solarTerm: string;
    gender: "Nam" | "Nữ";
    cungMenh: string;
    cungPhi: string;
    quaiSo: number;
    banMenhNguHanh: string;
    banMenhElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
    dayMasterElement: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
    canChi: string;
    elementPoints: Record<string, number>;
    elementPercent: Record<string, number>;
    destinyScore: number | null;
    destinyAxes: DestinyAxisAssessment[];
    baziPillars: Record<string, { stem: string; branch: string; element: string; napAm: string; stemMeta?: string; branchMeta?: string }>;
    canChiRelations: { canHops: string[]; good: string[]; caution: string[] };
  };
  simElement: {
    element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
    name: string;
    relationWithOwner: string;
    isGood: boolean;
  };
  yinYang: {
    evenCount: number;
    oddCount: number;
    evenPercent: number;
    oddPercent: number;
    score: number;
    text: string;
  };
  linhSo4Last: {
    last4: string;
    meaning: string;
    scoreType: string;
  };
  scores5Aspects: {
    theVan: { scorePercent: number; text: string; tag: string };
    taiLoc: { scorePercent: number; text: string; tag: string; diaChi: string; nguHanh: string; strongPoints: string[]; weakPoints: string[] };
    congDanh: { scorePercent: number; text: string; tag: string; diaChi: string; nguHanh: string; nguyenThanChi: string; nguyenThanHanh: string; strongPoints: string[]; weakPoints: string[] };
    tinhCam: { scorePercent: number; text: string; tag: string; diaChiDoiTuong: string; nguHanhDoiTuong: string; quanHeDiaChi: string; strongPoints: string[]; weakPoints: string[] };
    giaDao: { scorePercent: number; text: string; tag: string };
    prominentAspects: string[];
  };
  patterns: string[];
  decisionText: {
    summary: string;
    advice: string;
    recommendation: string;
  };
  referenceDetails?: {
    sourceUrl: string;
    hexagramImageUrl?: string;
    hasLast4Reading: boolean;
    meaningParagraphs: string[];
    generalReadingParagraphs: string[];
    fitMethodParagraphs?: string[];
    aspectDetails?: Partial<Record<"theVan" | "taiLoc" | "congDanh" | "tinhCam" | "giaDao", { contextParagraphs: string[] }>>;
  };
}

/** Dữ liệu lá quẻ Lục Hào (Lục Thân, Can Chi, Lục Thú, Thế/Ứng, Vượng Suy, Trường Sinh…). */
export type SimLucHaoData = SimAnalysisResult["lucHaoData"];

export interface LucHaoSheetInput {
  /** Sáu hào của quẻ chủ từ dưới lên: 1 = dương, 0 = âm. */
  lines: number[];
  /** Các hào động (1–6); quẻ biến đổi âm dương đúng các hào này. */
  movingLines: number[];
  /** Ngày dương lịch YYYY-MM-DD và giờ HH:mm lập quẻ, dùng an Lục Thú, Vượng Suy, Quý Thần, Trường Sinh. */
  solarDate: string;
  time: string;
}

/** An lá quẻ Lục Hào cho quẻ chủ và quẻ biến. Dùng cho bói sim và Gieo quẻ. */
export function buildLucHaoSheet({ lines, movingLines, solarDate, time }: LucHaoSheetInput): SimLucHaoData {
  const solarDateStr = solarDate;
  const birthTimeStr = time;
  const fourPillars = getFourPillars(solarDateStr, birthTimeStr, 105.833, 7, "civil");
  const lunarDate = getLunarDate(solarDateStr);
  const allLines = lines.slice(0, 6);
  const bienLines = allLines.map((value, index) => (movingLines.includes(index + 1) ? (value === 1 ? 0 : 1) : value));
  const r = {
    upperQuai: bitsToTri(allLines.slice(3, 6)),
    lowerQuai: bitsToTri(allLines.slice(0, 3)),
    allLines,
    bienLines,
    hexNum: 0,
    bienNum: 0,
  };
  r.hexNum = LOOKUP[r.upperQuai]?.[r.lowerQuai] || 1;
  r.bienNum = LOOKUP[bitsToTri(bienLines.slice(3, 6))]?.[bitsToTri(bienLines.slice(0, 3))] || 1;
  const hexP = HEX[String(r.hexNum)] || { n: "Thuần Càn", t: 1, h: 1, yn: "Cát lành" };
  const hexB = HEX[String(r.bienNum)] || { n: "Thuần Càn", t: 1, h: 1, yn: "Cát lành" };
  const trieu = TUONG_QUE_64[hexP.n] || "Hanh thông cát tường.";

  const dayStem = fourPillars.pillars[2]?.stem || "Bính";
  const dayBranch = fourPillars.pillars[2]?.branch || "Dần";
  const monthBranch = fourPillars.pillars[1]?.branch || "Thân";
  const lucThuList = getLucThuByDayStem(dayStem);

  const pPalace = getHexagramPalaceAndTheUng(r.upperQuai, r.lowerQuai);
  const bUpperQuai = bitsToTri(r.bienLines.slice(3, 6));
  const bLowerQuai = bitsToTri(r.bienLines.slice(0, 3));
  const bPalace = getHexagramPalaceAndTheUng(bUpperQuai, bLowerQuai);

  const pLowerNaGiap = NA_GIAP_TRIGRAM_LOWER[r.lowerQuai] || NA_GIAP_TRIGRAM_LOWER[1];
  const pUpperNaGiap = NA_GIAP_TRIGRAM_UPPER[r.upperQuai] || NA_GIAP_TRIGRAM_UPPER[1];
  const pLinesNaGiap = [...pLowerNaGiap, ...pUpperNaGiap];

  const bLowerNaGiap = NA_GIAP_TRIGRAM_LOWER[bLowerQuai] || NA_GIAP_TRIGRAM_LOWER[1];
  const bUpperNaGiap = NA_GIAP_TRIGRAM_UPPER[bUpperQuai] || NA_GIAP_TRIGRAM_UPPER[1];
  const bLinesNaGiap = [...bLowerNaGiap, ...bUpperNaGiap];

  const LUC_THAN: Record<string, Record<string, string>> = {
    Kim: { Kim: "Huynh Đệ", Thủy: "Tử Tôn", Mộc: "Thê Tài", Hỏa: "Quan Quỷ", Thổ: "Phụ Mẫu" },
    Mộc: { Mộc: "Huynh Đệ", Hỏa: "Tử Tôn", Thổ: "Thê Tài", Kim: "Quan Quỷ", Thủy: "Phụ Mẫu" },
    Thủy: { Thủy: "Huynh Đệ", Mộc: "Tử Tôn", Hỏa: "Thê Tài", Thổ: "Quan Quỷ", Kim: "Phụ Mẫu" },
    Hỏa: { Hỏa: "Huynh Đệ", Thổ: "Tử Tôn", Kim: "Thê Tài", Thủy: "Quan Quỷ", Mộc: "Phụ Mẫu" },
    Thổ: { Thổ: "Huynh Đệ", Kim: "Tử Tôn", Thủy: "Thê Tài", Mộc: "Quan Quỷ", Hỏa: "Phụ Mẫu" },
  };

  const primaryLines = r.allLines.map((val, idx) => {
    const pos = idx + 1;
    const isYang = val === 1;
    const isMoving = movingLines.includes(pos);
    const ng = pLinesNaGiap[idx] || { can: "Giáp", chi: "Tý" };
    const el = BRANCH_ELEMENTS[ng.chi] || "Thủy";
    const rel = LUC_THAN[pPalace.element]?.[el] || "Huynh Đệ";
    const canChiFull = `${rel} ${ng.can} ${ng.chi} (${el})`;
    const theUng = pos === pPalace.the ? "Thế" : pos === pPalace.ung ? "Ứng" : "";
    const vt = getVuongTuong(el, monthBranch);
    const qt = getQuyThan(dayStem, ng.chi);
    const tsN = getTruongSinh(el, dayBranch);
    const tsT = getTruongSinh(el, monthBranch);

    return {
      position: pos,
      isYang,
      isMoving,
      symbol: isYang ? "—" : "- -",
      can: ng.can,
      chi: ng.chi,
      element: el,
      relative: rel,
      lucThan: rel,
      canChi: `${ng.can} ${ng.chi} (${el})`,
      phucThan: "—",
      tuanKhong: "—",
      canChiFull,
      lucThu: lucThuList[idx] || "Thanh Long",
      theUng,
      vuongTuong: vt,
      quyThan: qt,
      tsNgay: tsN,
      tsThang: tsT,
    };
  });

  const changedLines = r.bienLines.map((val, idx) => {
    const pos = idx + 1;
    const isYang = val === 1;
    const isTransformed = movingLines.includes(pos);
    const ng = bLinesNaGiap[idx] || { can: "Giáp", chi: "Tý" };
    const el = BRANCH_ELEMENTS[ng.chi] || "Thủy";
    const rel = LUC_THAN[bPalace.element]?.[el] || "Huynh Đệ";
    const canChiFull = `${rel} ${ng.can} ${ng.chi} (${el})`;
    const vt = getVuongTuong(el, monthBranch);
    const tsN = getTruongSinh(el, dayBranch);
    const tsT = getTruongSinh(el, monthBranch);

    return {
      position: pos,
      isYang,
      isTransformed,
      symbol: isYang ? "—" : "- -",
      can: ng.can,
      chi: ng.chi,
      element: el,
      relative: rel,
      lucThan: rel,
      canChi: `${ng.can} ${ng.chi} (${el})`,
      phucThan: "—",
      tuanKhong: "—",
      lucThu: lucThuList[idx] || "Thanh Long",
      canChiFull,
      vuongTuong: vt,
      tsNgay: tsN,
      tsThang: tsT,
    };
  });

  return {
    meta: {
      solarDateTime: `${solarDateStr} ${birthTimeStr}`,
      lunarDateTime: `${lunarDate.day}/${lunarDate.month}/${lunarDate.year}${lunarDate.leap ? " (nhuận)" : ""}`,
      fourPillarsText: `${fourPillars.pillars[0]?.stem} ${fourPillars.pillars[0]?.branch} · ${fourPillars.pillars[1]?.stem} ${fourPillars.pillars[1]?.branch} · ${fourPillars.pillars[2]?.stem} ${fourPillars.pillars[2]?.branch} · ${fourPillars.pillars[3]?.stem} ${fourPillars.pillars[3]?.branch}`,
      solarTerm: getSolarTerm(solarDateStr),
      nhatThan: `${dayStem} ${dayBranch}`,
      nguyetLenh: `${fourPillars.pillars[1]?.stem} ${monthBranch}`,
    },
    primary: {
      number: r.hexNum,
      name: hexP.n,
      hanzi: "易",
      palace: pPalace.palace,
      palaceElement: pPalace.element,
      palaceLabel: `Cung ${pPalace.palace} · Hành ${pPalace.element}`,
      theLine: pPalace.the,
      ungLine: pPalace.ung,
      trieu,
      explanation: hexP.yn,
      lines: primaryLines,
    },
    changed: {
      number: r.bienNum,
      name: hexB.n,
      hanzi: "變",
      palace: bPalace.palace,
      palaceElement: bPalace.element,
      palaceLabel: `Cung ${bPalace.palace} · Hành ${bPalace.element}`,
      lines: changedLines,
    },
  };
}

export function analyzeSimPhongThuy(input: SimAnalysisInput): SimAnalysisResult {
  const digits = normalizeVietnamesePhone(input.phone);
  if (!isValidSimDigits(digits)) {
    throw new RangeError(`Vui lòng nhập dãy số hợp lệ gồm ${SIM_MIN_DIGITS} đến ${SIM_MAX_DIGITS} chữ số.`);
  }

  // 1. Quẻ Kinh Dịch
  const r = calcQue(digits);
  const hexP = HEX[String(r.hexNum)] || { n: "Thuần Càn", t: 1, h: 1, yn: "Cát lành" };
  const hexH = HEX[String(r.hoNum)] || { n: "Thuần Càn", t: 1, h: 1, yn: "Cát lành" };
  const hexB = HEX[String(r.bienNum)] || { n: "Thuần Càn", t: 1, h: 1, yn: "Cát lành" };

  // 2. Bát Cực Linh Số
  const bc = analyzeBCLS(digits);

  // 3. Âm Dương & Nút
  const adObj = amDuongPhan(digits);
  const nut = tongNut(digits);

  const resolvedBirth = resolveSimBirth(input);
  const solarDateStr = resolvedBirth.solarDate;
  const birthTimeStr = resolvedBirth.birthTime;
  const fourPillars = getFourPillars(solarDateStr, birthTimeStr, 105.833, 7, "civil");
  const dayMasterElement = fourPillars.pillars[2]?.stemElement;

  // 4. Mệnh Chủ Nhân (nếu có)
  let person: PersonAstro | null = null;
  if (resolvedBirth.hasOwner) {
    person = buildPersonFromBirth(solarDateStr, input.gender || "Nam");
  }

  // 5. Điểm Tổng Hợp
  const meta = computeTong(r, bc, adObj, person, digits, dayMasterElement);

  // 6. Cụm Số & Số Đặc Biệt
  const segments = buildSegments(digits);
  const specials = getSpecials(digits);
  const verdict = getVerdictText(meta, digits);

  // 7. Ngũ Hành Phân Phối
  const dominantElement = soNguHanh(digits);
  const elemDist: Record<"Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ", number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const ch of digits) {
    const el = DIGIT_NGUHANH[ch];
    if (el) elemDist[el] = (elemDist[el] || 0) + 1;
  }
  const elementDistribution = (["Thủy", "Mộc", "Hỏa", "Thổ", "Kim"] as const).map((el) => ({
    element: el,
    points: elemDist[el],
  }));

  // 8. Lá quẻ Lục Hào (dùng chung với công cụ Gieo quẻ)
  const dayBranch = fourPillars.pillars[2]?.branch || "Dần";
  const lucHaoData = buildLucHaoSheet({ lines: r.allLines, movingLines: [r.haoDong], solarDate: solarDateStr, time: birthTimeStr });

  const lunarDate = getLunarDate(solarDateStr);
  const baziBalance = getElementBalance(fourPillars.pillars);
  const baziElementPoints = Object.fromEntries(baziBalance.map((item) => [item.element, item.count]));
  const baziElementPercent = Object.fromEntries(baziBalance.map((item) => [item.element, item.percent]));
  const baziRelations = getBaziRelations(fourPillars.pillars);
  const canHops = baziRelations
    .filter((relation) => relation.system === "Thiên can" && relation.kind === "combine")
    .map((relation) => `${relation.label}: ${relation.members.join(" – ")}`);
  const goodRelations = baziRelations
    .filter((relation) => relation.kind === "combine")
    .map((relation) => `${relation.system} ${relation.label}: ${relation.members.join(" – ")}`);
  const cautionRelations = baziRelations
    .filter((relation) => relation.kind !== "combine")
    .map((relation) => `${relation.system} ${relation.label}: ${relation.members.join(" – ")}`);
  if (goodRelations.length === 0) goodRelations.push("Không có hợp cục nổi bật; mệnh cục thiên về tự lực và cân bằng.");
  if (cautionRelations.length === 0) cautionRelations.push("Không thấy xung, hình, hại trực diện nổi bật trong bốn trụ.");

  const yearPillar = fourPillars.pillars[0];
  const monthPillar = fourPillars.pillars[1];
  const dayPillar = fourPillars.pillars[2];
  const hourPillar = fourPillars.pillars[3];
  const destinyScore = meta.s3 ?? 60;
  const taiLocLine = lucHaoData.primary.lines.find((line) => line.relative === "Thê Tài");
  const congDanhLine = lucHaoData.primary.lines.find((line) => line.relative === "Quan Quỷ");
  const nguyenThanLine = lucHaoData.primary.lines.find((line) => line.relative === "Phụ Mẫu");
  const partnerLine = (input.gender || "Nam") === "Nữ" ? congDanhLine : taiLocLine;
  const aspectTag = (score: number) => score >= 80 ? "Điểm mạnh" : score < 50 ? "Điểm yếu" : "Trung hòa";
  const taiLocScore = Math.round(meta.s1 * 0.65 + destinyScore * 0.35);
  const congDanhScore = Math.round(meta.s4 * 0.70 + destinyScore * 0.30);
  const tinhCamScore = Math.round(meta.s2 * 0.60 + meta.hexagrams.changed.score * 0.40);
  const giaDaoScore = Math.round(meta.hexagrams.changed.score * 0.40 + meta.s2 * 0.30 + destinyScore * 0.30);
  const aspectScores = [
    ["Tài lộc", taiLocScore],
    ["Công danh", congDanhScore],
    ["Tình cảm", tinhCamScore],
    ["Gia đạo", giaDaoScore],
  ] as const;
  const prominentAspects: string[] = aspectScores
    .filter(([, score]) => score >= 75)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
  if (prominentAspects.length === 0) prominentAspects.push("Cần ưu tiên ổn định và quản trị rủi ro");

  let finalClass: "ĐẠI CÁT" | "CÁT" | "BÌNH" | "HUNG" | "TIỂU HUNG" = "BÌNH";
  if (meta.total >= 85) finalClass = "ĐẠI CÁT";
  else if (meta.total >= 70) finalClass = "CÁT";
  else if (meta.total >= 50) finalClass = "BÌNH";
  else if (meta.total >= 35) finalClass = "TIỂU HUNG";
  else finalClass = "HUNG";

  // 10 số: 0932 601 616; 11 số: 0912 345 6789; các độ dài khác: mỗi nhóm 4 số từ trái sang.
  const formattedPhone =
    digits.length === 10
      ? digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
      : digits.length === 11
        ? digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
        : digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  const trieu = TUONG_QUE_64[hexP.n] || "Hanh thông cát tường.";
  const last4 = digits.length >= 4 ? digits.slice(-4) : digits;

  return {
    phone: digits,
    formattedPhone,
    r,
    meta,
    scoreCriteria: meta.criteria,
    hexagramAssessment: meta.hexagrams,
    overview: {
      totalScore: meta.total,
      bandLabel: meta.band.l,
      hexPrimaryName: hexP.n,
      hexHoName: hexH.n,
      hexBienName: hexB.n,
      haoDongText: `Hào ${r.haoDong} Động (${HAO_VITRI[r.haoDong]?.[0] || "Động hào"})`,
      dominantElement,
      sumDigits: nut.sum,
      rootDigit: nut.root,
      rootMeaning: nut.meaning,
      elementDistribution,
    },
    person,
    segments,
    specials,
    verdict,

    // Giao diện gốc
    totalScore: meta.total,
    finalClassification: finalClass,
    scoreBreakdown: {
      kinhDich: meta.s4,
      batTinh: meta.s1,
      amDuong: meta.s2,
      hopMenh: meta.s3,
      linhSo81: Math.round(meta.total * 0.1),
      nguHanhBanMenh: meta.s3 !== null ? Math.round(meta.s3 * 0.1) : 5,
    },
    primaryHexagram: {
      number: r.hexNum,
      name: hexP.n,
      trieu,
      explanation: hexP.yn,
      generalReading: `Quẻ ${hexP.n} biểu trưng cho ${hexP.yn.toLowerCase()}`,
    },
    changedHexagram: {
      number: r.bienNum,
      name: hexB.n,
      explanation: hexB.yn,
      score: meta.hexagrams.changed.score,
      classification: meta.hexagrams.changed.label,
    },
    hexagramScore8: Math.round((meta.s4 / 100) * 80) / 10,
    movingLine: r.haoDong,
    lucHaoData,
    ownerAstro: {
      solarDate: `${solarDateStr} · ${birthTimeStr}`,
      lunarDate: `${lunarDate.day}/${lunarDate.month}/${lunarDate.year}${lunarDate.leap ? " (nhuận)" : ""}`,
      solarTerm: getSolarTerm(solarDateStr),
      gender: input.gender || "Nam",
      cungMenh: person ? person.hienThi : "Đông Tứ Mệnh",
      cungPhi: person ? person.cungPhi : "Khảm",
      quaiSo: person ? person.quaiSo : 1,
      banMenhNguHanh: person ? person.menh : "Lộ Bàng Thổ",
      banMenhElement: person ? person.menhElement : "Thổ",
      dayMasterElement: dayPillar?.stemElement || "Thổ",
      canChi: person ? person.canChi : "Canh Ngọ",
      elementPoints: baziElementPoints,
      elementPercent: baziElementPercent,
      destinyScore: meta.s3,
      destinyAxes: meta.destiny?.axes || [],
      baziPillars: {
        hour: { stem: hourPillar?.stem || "Nhâm", branch: hourPillar?.branch || "Thìn", element: `${hourPillar?.stemElement || "Thủy"} · ${hourPillar?.branchElement || "Thổ"}`, napAm: hourPillar ? getNaYin(hourPillar) : "—" },
        day: { stem: dayPillar?.stem || "Bính", branch: dayPillar?.branch || "Dần", element: `${dayPillar?.stemElement || "Hỏa"} · ${dayPillar?.branchElement || "Mộc"}`, napAm: dayPillar ? getNaYin(dayPillar) : "—" },
        month: { stem: monthPillar?.stem || "Mậu", branch: monthPillar?.branch || "Thân", element: `${monthPillar?.stemElement || "Thổ"} · ${monthPillar?.branchElement || "Kim"}`, napAm: monthPillar ? getNaYin(monthPillar) : "—" },
        year: { stem: yearPillar?.stem || "Nhâm", branch: yearPillar?.branch || "Thân", element: `${yearPillar?.stemElement || "Thủy"} · ${yearPillar?.branchElement || "Kim"}`, napAm: yearPillar ? getNaYin(yearPillar) : "—" },
      },
      canChiRelations: {
        canHops,
        good: goodRelations,
        caution: cautionRelations,
      },
    },
    simElement: {
      element: dominantElement,
      name: `${dominantElement} Tinh`,
      relationWithOwner: meta.destiny?.summary || meta.rel?.label || "Bình hòa",
      isGood: (meta.s3 ?? 60) >= 50,
    },
    yinYang: {
      evenCount: adObj.chan,
      oddCount: adObj.le,
      evenPercent: Math.round((adObj.chan / digits.length) * 100),
      oddPercent: Math.round((adObj.le / digits.length) * 100),
      score: adObj.score,
      text: adObj.verdict,
    },
    linhSo4Last: {
      last4,
      meaning: `4 số cuối mang trường khí ${BCLS.pairs[last4.slice(0, 2)] ? BCLS.stars[BCLS.pairs[last4.slice(0, 2)]].n : "Bình Hòa"} kết hợp ${BCLS.pairs[last4.slice(2, 4)] ? BCLS.stars[BCLS.pairs[last4.slice(2, 4)]].n : "Bình Hòa"}.`,
      scoreType: meta.band.l,
    },
    scores5Aspects: {
      theVan: { scorePercent: meta.total, text: meta.hexagrams.summary, tag: aspectTag(meta.total) },
      taiLoc: { scorePercent: taiLocScore, text: `Tài lộc xét từ Bát Cực (${meta.s1}/100) và độ hợp mệnh (${destinyScore}/100).`, tag: aspectTag(taiLocScore), diaChi: taiLocLine?.chi || "Không hiện", nguHanh: taiLocLine?.element || "Khuyết", strongPoints: taiLocScore >= 70 ? ["Bát Cực và mệnh cục tạo lực nâng cho dòng tài."] : [], weakPoints: taiLocScore < 70 ? ["Cần kiểm soát các chuỗi hung tinh và ưu tiên tích lũy an toàn."] : [] },
      congDanh: { scorePercent: congDanhScore, text: `Công danh phối điểm quẻ ${meta.s4}/100 với mệnh cục ${destinyScore}/100.`, tag: aspectTag(congDanhScore), diaChi: congDanhLine?.chi || "Không hiện", nguHanh: congDanhLine?.element || "Khuyết", nguyenThanChi: nguyenThanLine?.chi || "Không hiện", nguyenThanHanh: nguyenThanLine?.element || "Khuyết", strongPoints: congDanhScore >= 70 ? ["Quẻ và mệnh cục hỗ trợ khả năng triển khai công việc."] : [], weakPoints: congDanhScore < 70 ? ["Nên tránh quyết định lớn khi quẻ biến chưa thuận."] : [] },
      tinhCam: { scorePercent: tinhCamScore, text: `Tình cảm xét âm dương ${meta.s2}/100 và xu hướng quẻ biến ${meta.hexagrams.changed.score}/100.`, tag: aspectTag(tinhCamScore), diaChiDoiTuong: partnerLine?.chi || "Không hiện", nguHanhDoiTuong: partnerLine?.element || "Khuyết", quanHeDiaChi: `${dayBranch} – ${partnerLine?.chi || "Không hiện"}`, strongPoints: tinhCamScore >= 70 ? ["Âm dương và quẻ biến hỗ trợ sự hòa hợp."] : [], weakPoints: tinhCamScore < 70 ? ["Cần chủ động cân bằng cảm xúc và giao tiếp."] : [] },
      giaDao: { scorePercent: giaDaoScore, text: "Gia đạo được tổng hợp từ quẻ biến, âm dương và độ hợp mệnh.", tag: aspectTag(giaDaoScore) },
      prominentAspects,
    },
    patterns: specials.map((s) => s.name),
    decisionText: {
      summary: verdict.l1.replace(/<[^>]+>/g, ""),
      advice: verdict.l2.replace(/<[^>]+>/g, "") + " " + verdict.l3.replace(/<[^>]+>/g, ""),
      recommendation: meta.total >= 70 ? "NÊN SỬ DỤNG" : meta.total >= 50 ? "DÙNG ĐƯỢC" : "NÊN THAY ĐỔI",
    },
  };
}

export function buildSimPhongThuyMarkdownForAi(result: SimAnalysisResult): string {
  const r = result.r;
  const p = result.person;
  const m = result.meta;
  const bc = m.bc;

  return `# BÁO CÁO LUẬN GIẢI SIM PHONG THỦY — SỐ ${result.formattedPhone}

## 1. TỔNG QUAN ĐIỂM SỐ & PHÁN QUYẾT
- **Số điện thoại:** ${result.phone}
- **Điểm tổng phong thủy:** ${m.total}/100 (${m.band.l})

| Hạng mục | Điểm tiêu chí | Trọng số | Điểm quy đổi |
|---|---:|---:|---:|
${result.scoreCriteria.filter((item) => item.weight > 0).map((item) => `| ${item.label} | ${item.score ?? "—"}/100 | ${item.weight}% | ${item.points}/${item.weight} |`).join("\n")}
| **Tổng** |  | **100%** | **${m.total}/100** |

- **Quẻ chủ:** Quẻ thứ ${r.hexNum} - ${result.overview.hexPrimaryName} (${result.hexagramAssessment.primary.label}, ${result.hexagramAssessment.primary.score}/100) — ${result.hexagramAssessment.primary.explanation}
- **Hào động:** Hào ${r.haoDong} Động (${HAO_VITRI[r.haoDong]?.[0] || ""})
- **Quẻ biến:** ${result.overview.hexBienName} (${result.hexagramAssessment.changed.label}, ${result.hexagramAssessment.changed.score}/100) — ${result.hexagramAssessment.changed.explanation}
- **Điểm hành trình quẻ:** ${result.hexagramAssessment.score}/100 — ${result.hexagramAssessment.summary}
- **Quẻ Hỗ:** ${result.overview.hexHoName}
- **Âm Dương:** ${m.ad.chan} chẵn · ${m.ad.le} lẻ (${m.ad.verdict})
- **Tổng nút dãy số:** ${result.overview.sumDigits} → Nút ${result.overview.rootDigit} (${result.overview.rootMeaning})

## 2. ĐỐI CHIẾU BẢN MỆNH CHỦ NHÂN
${p ? `- **Chủ nhân:** ${p.gender}, Can Chi: ${p.canChi}
- **Bản mệnh:** ${p.menh}
- **Cung Phi Bát Quái:** ${p.hienThi}, Quái số ${p.quaiSo}
- **Điểm hợp Mệnh cục:** ${m.s3}/100
${m.destiny?.axes.map((axis) => `- **${axis.label}:** ${axis.ownerElement} ↔ SIM ${axis.simElement} — ${axis.relation} (${axis.score}/100)`).join("\n") || ""}` : "*(Không nhập ngày sinh - Phân tích dựa trên trường khí tự thân của số)*"}

## 3. THẦN SỐ BÁT CỰC LINH SỐ (BCLS)
- **Điểm Bát Cực Linh Số:** ${m.s1}/100 (điểm nền ${bc.baseScore}, điều chỉnh cấu trúc ${bc.sequenceAdjustment >= 0 ? "+" : ""}${bc.sequenceAdjustment})
- **Nhận định:** ${bc.summary}
- **Số cặp sao cát (Sinh Khí, Thiên Y, Diên Niên, Phục Vị):** Sinh Khí (${bc.counts.SK || 0}), Thiên Y (${bc.counts.TY || 0}), Diên Niên (${bc.counts.DN || 0}), Phục Vị (${bc.counts.PV || 0})
- **Số cặp sao hung (Tuyệt Mệnh, Ngũ Quỷ, Lục Sát, Họa Hại):** Tuyệt Mệnh (${bc.counts.TM || 0}), Ngũ Quỷ (${bc.counts.NQ || 0}), Lục Sát (${bc.counts.LS || 0}), Họa Hại (${bc.counts.HH || 0})
- **4 số cuối:** ${result.phone.slice(-4)} (${result.linhSo4Last.meaning})

## 4. KẾT LUẬN & CHỈ DẪN HÀNH ĐỘNG
- ${result.verdict.l1.replace(/<[^>]+>/g, "")}
- ${result.verdict.l2.replace(/<[^>]+>/g, "")}
- ${result.verdict.l3.replace(/<[^>]+>/g, "")}
`;
}
