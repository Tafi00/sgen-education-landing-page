// @ts-nocheck
import type { HoroFullChart } from "./horo-adapter.ts";
import { buildTinhMenhDoAiMarkdown } from "../lib/tinhmenhdo/CSVTable.CbWvlZkS.js";
import {
  type Pillar,
  type TimeCalculationMode,
  getFourPillars,
  getBaziSupportProfile,
  getLuckCycles,
  getHaLacChart,
  getBaziTemperature,
  getBaziRelations,
  getElementBalance,
} from "../../../../shared/menh-thu/metaphysics";

export interface FourPillarsChart {
  pillars: Pillar[];
  dayMaster: { stem: string; stemElement: string; polarity: "Dương" | "Âm" };
  calculation: {
    appliedDate: string;
    appliedTime: string;
    solarTerm: string;
    equationOfTimeMinutes: number;
    correctionMinutes: number;
    appliedCorrectionMinutes: number;
    monthStartTerm: { name: string; date: string; time: string };
    monthEndTerm: { name: string; date: string; time: string };
  };
}

export interface BaziSupportProfile {
  status: string;
  strengthScore: number;
  explanation: string;
  rootCount: number;
  monthChiefElement: string;
  usefulElement: string;
  joyElement: string;
}

export interface LuckCycles {
  forward: boolean;
  start: { year: number; month: number; day: number };
  cycles: Array<{
    from: number;
    to: number;
    startYear: number;
    endYear: number;
    stem: string;
    branch: string;
    stemElement: string;
    branchElement: string;
  }>;
}

interface RawPalaceData {
  ci?: number;
  cn?: number;
  cno?: number[];
  zolk?: number[][];
}

interface RawHoroData {
  ars?: RawPalaceData[];
}
export type BaziChartStyle =
  | "Mặc định"
  | "Tứ Trụ"
  | "Lương Phái + Nam phái"
  | "Khâm Thiên + Nam phái"
  | "Nam phái"
  | "Lương Phái"
  | "Khâm Thiên"
  | "Trung Châu Phái"
  | "Trung Châu Phái + Khâm Thiên"
  | "Trung Châu Phái + Lương Phái";

export interface ChartAiMarkdownOptions {
  name: string;
  gender: "Nam" | "Nữ";
  date: string;
  time: string;
  viewDate: string;
  viewTime: string;
  viewYear: number;
  locationName: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  calculationMode: TimeCalculationMode;
  horoChart: HoroFullChart | null;
  baziChart: FourPillarsChart;
  baziSupport: BaziSupportProfile;
  luck: LuckCycles;
  haLac?: HaLacChart;
  isFourPillarsMode?: boolean;
  chartStyle?: BaziChartStyle;
  canHoaTable?: number;
  trungChauTable?: number;
}

const STEM_QUALITIES: Record<string, { nature: string; keywords: string; advice: string }> = {
  "Giáp": { nature: "Mộc đại thụ kiên cường, thẳng thắn, có chí tiến thủ cao và tính tự chủ mạnh.", keywords: "Lãnh đạo, chính trực, tiên phong", advice: "Nên tôi luyện đức khiêm tốn, lắng nghe ý kiến xung quanh để tránh cứng nhắc." },
  "Ất": { nature: "Mộc hoa cỏ uyển chuyển, mềm mỏng, thích nghi nhanh với mọi môi trường và giàu lòng nhân ái.", keywords: "Khéo léo, linh hoạt, hòa nhã", advice: "Nên kiên định với mục tiêu dài hạn, tránh phân vân dao động." },
  "Bính": { nature: "Hỏa thái dương quang minh lỗi lạc, nhiệt tình, nhiệt huyết, giàu sức sống và tinh thần phụng sự.", keywords: "Nhiệt huyết, tự tin, lan tỏa", advice: "Nên giữ bình tĩnh, tránh nóng vội trong các quyết định quan trọng." },
  "Đinh": { nature: "Hỏa ngọn đèn/hoa lửa ấm áp, tinh tế, giàu nội tâm, có óc quan sát sâu sắc và tư duy phân tích.", keywords: "Thấu hiểu, sâu sắc, chu toàn", advice: "Nên bộc lộ năng lượng ra bên ngoài, không nên suy nghĩ quá nhiều làm hao tổn tâm trí." },
  "Mậu": { nature: "Thổ đất đai vững chãi, bao dung, trọng chữ tín, có tinh thần trách nhiệm cao và khả năng gánh vác lớn.", keywords: "Uy tín, trầm ổn, kiên định", advice: "Nên mềm dẻo hơn trong cách ứng xử, chủ động đổi mới cách làm." },
  "Kỷ": { nature: "Thổ vườn ruộng màu mỡ, cần cù, nhẫn nại, giỏi vun vén và khéo léo kết nối mọi người.", keywords: "Nuôi dưỡng, cẩn trọng, tỉ mỉ", advice: "Nên quyết đoán nắm bắt thời cơ lớn, tự tin vào giá trị bản thân." },
  "Canh": { nature: "Kim gươm giáo quặng sắt sắc bén, quyết đoán, trọng nghĩa khí, không ngại thử thách gian nan.", keywords: "Cương nghị, quyết liệt, nghĩa hiệp", advice: "Cần mài giũa tính mềm mỏng để hóa giải xung đột trong quan hệ." },
  "Tân": { nature: "Kim châu báu tinh xảo, thanh lịch, có khiếu thẩm mỹ cao, tự trọng lớn và khát khao hoàn mỹ.", keywords: "Tinh tế, mẫn tiệp, tự trọng", advice: "Nên rộng lượng với khuyết điểm của người khác và chấp nhận sự chưa hoàn hảo." },
  "Nhâm": { nature: "Thủy đại dương bao la, trí tuệ phóng khoáng, tầm nhìn xa rộng và khả năng thích biến vô tận.", keywords: "Trí tuệ, khoáng đạt, biến hóa", advice: "Nên đặt ra kỷ luật và khuôn khổ để tập trung dòng chảy năng lượng vào mục tiêu then chốt." },
  "Quý": { nature: "Thủy mưa sương mộc mạc, tĩnh lặng, nhạy cảm, giàu trực giác và khả năng thấu cảm lòng người.", keywords: "Trực giác, nhu thuận, huyền bí", advice: "Nên xây dựng sự tự tin vững chắc, tránh để cảm xúc chi phối lý trí." },
};

const HOA_KHI_MAP: Record<string, string> = {
  "TỬ VI": "Tôn Quý",
  "THIÊN CƠ": "Thiện",
  "THÁI DƯƠNG": "Quý",
  "VŨ KHÚC": "Tài",
  "THIÊN ĐỒNG": "Phúc",
  "LIÊM TRINH": "Tù / Đào Hoa",
  "THIÊN PHỦ": "Lệnh",
  "THÁI ÂM": "Phú",
  "THAM LANG": "Đào Hoa",
  "CỰ MÔN": "Ám",
  "THIÊN TƯỚNG": "Ấn",
  "THIÊN LƯƠNG": "Ấm",
  "THẤT SÁT": "Quyền",
  "PHÁ QUÂN": "Hao",
};

interface SchoolAiMetadata {
  headerTitle: string;
  schoolName: string;
  philosophy: string;
  aiRole: string;
  specializedDirectives: string[];
  specializedQuestions: string[];
  includePhiCungInPalaces: boolean;
  includeLaiNhanCung: boolean;
  includeLocKiToanDo: boolean;
  include60TinhHe: boolean;
}

function getSchoolAiMetadata(chartStyle: BaziChartStyle | undefined, viewYear: number): SchoolAiMetadata {
  const style = chartStyle || "Mặc định";

  switch (style) {
    case "Nam phái":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · NAM PHÁI (TAM HỢP PHÁI)",
        schoolName: "Tử Vi Nam Phái (Tam Hợp Phái)",
        philosophy: "Lấy Tam Phương Tứ Chính, Tinh Diệu Miếu Hãm, Cát Tinh - Sát Tinh tương chế, Vòng Thái Tuế, Vòng Bác Sĩ và Vòng Tràng Sinh làm gốc rễ. Nam Phái tập trung vào định tính cách cục, miếu hãm ngũ hành và không áp dụng phi cung tứ hóa can cung.",
        aiRole: "Bạn là bậc thầy Tử Vi Đẩu Số chuyên sâu về Nam Phái (Tam Hợp Phái truyền thống).",
        specializedDirectives: [
          "**Luận giải Cách Cục Toàn Bàn & Miếu Hãm Chính Tinh**: Nhận định cách cục chủ đạo của Mệnh - Thân (Tử Phủ Vũ Tướng, Sát Phá Tham, Cơ Nguyệt Đồng Lương, Cự Nhật...). Đánh giá độ miếu vượng đắc hãm của 14 chính tinh và ngũ hành sinh khắc giữa bản mệnh và cung tọa.",
          "**Phân tích Tam Phương Tứ Chính (Mệnh - Tài - Quan - Di)**: Đánh giá sự hội tụ của Lục Cát Tinh (Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt) cùng Lục Sát Tinh (Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp). Chỉ rõ cát tinh phò tá hay sát tinh phá cách.",
          "**Đánh giá Vị Thế qua 3 Vòng Sao Căn Bản**: Vòng Thái Tuế (xác định vị thế nhân cách: đắc Thái Tuế, Tuế Phá hay Tang Môn), Vòng Lộc Tồn - Bác Sĩ (phúc lộc, tài năng) và Vòng Tràng Sinh (sinh khí, độ bền bỉ thịnh suy).",
          `**Luận giải Vận Hạn Nam Phái**: Phân tích Đại Hạn 10 năm theo chiều thuận/nghịch và Tiểu Hạn 1 năm (theo tam hợp chi) kết hợp Lưu Thái Tuế cùng hệ thống sao lưu hàng năm trong năm ${viewYear}.`,
          "**Lời khuyên Tu Dưỡng & Xu Cát Tị Hung**: Đưa ra định hướng nghề nghiệp, thời cơ hành động và phương pháp chế hóa hung sát tinh bằng tu tâm dưỡng tính.",
        ],
        specializedQuestions: [
          "Đánh giá chi tiết cách cục Mệnh - Thân của lá số Nam Phái này: Thuộc chính cách hay phá cách, độ sáng tinh đẩu ra sao?",
          "Phân tích vị thế đương số qua Vòng Thái Tuế và tương quan cát tinh - sát tinh trong Tam Phương Tứ Chính.",
          `Luận giải Đại Hạn 10 năm hiện tại và Tiểu Hạn Lưu Niên ${viewYear} theo phép xem hạn Nam Phái.`,
          "Các cung lục thân (Phụ mẫu, Huynh đệ, Phu thê, Tử tức) có những ưu khuyết điểm gì nổi bật?",
        ],
        includePhiCungInPalaces: false,
        includeLaiNhanCung: false,
        includeLocKiToanDo: false,
        include60TinhHe: false,
      };

    case "Khâm Thiên":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · KHÂM THIÊN MÔN TỨ HÓA",
        schoolName: "Khâm Thiên Môn Tứ Hóa",
        philosophy: "Khâm Thiên Môn lấy 'Nhất Tượng Nhất Tinh', 18 Phi Tinh, Lai Nhân Cung (nguồn gốc tiền định nhân quả), Sinh Niên Tứ Hóa (A-B-C-D), hiện tượng Tự Hóa (Ly Tâm) và Hướng Tâm Tứ Hóa, phân định ranh giới Thể - Dụng và Khí Số Vị làm hạt nhân.",
        aiRole: "Bạn là đại tôn sư Tử Vi Đẩu Số chuyên sâu về Khâm Thiên Môn Tứ Hóa.",
        specializedDirectives: [
          "**Khảo cứu Căn Duyên Tiền Định từ Lai Nhân Cung**: Phân tích ý nghĩa Lai Nhân Cung (cung mang Thiên Can năm sinh) - điểm khởi sinh mọi nghiệp lực, trách nhiệm và thành bại của kiếp này.",
          "**Phân bổ Sinh Niên Tứ Hóa (A - B - C - D)**: Luận giải 4 Tượng Tiên Thiên: Hóa Lộc (A - duyên khởi), Hóa Quyền (B - thành tựu/chấp chưởng), Hóa Khoa (C - danh dự/cứu giải), Hóa Kị (D - quy tàng/nợ nần). Xác định tọa tại cung Thể hay cung Dụng.",
          "**Giải mã Tự Hóa (Ly Tâm) & Hướng Tâm Tứ Hóa**: Chỉ rõ các cung có Tự Hóa (phân tán, thoát khí, biến chất) và Hướng Tâm (đối cung nhập, cơ hội chuyển hóa). Đặc biệt lưu ý Tự Hóa Kị và cung bị Hóa Kị xung chiếu.",
          "**Trục Thể - Dụng & Cung Khí Số**: Đánh giá cung Khí Số vị của Mệnh (Quan Lộc), của Quan (Tài Bạch), của Tật (Điền Trạch). Cân bằng cặp bài trùng Lộc - Kị và Quyền - Khoa.",
          `**Luận giải Vận Hạn Khâm Thiên & Ứng Kỳ**: Đối chiếu Tứ Hóa Tiên Thiên với Đại Vận Tứ Hóa và Lưu Niên Tứ Hóa năm ${viewYear}, xác định cung vị phát động và thời điểm ứng kỳ.`,
        ],
        specializedQuestions: [
          "Phân tích ý nghĩa căn duyên tiền định từ Lai Nhân Cung và sự phân bố Sinh Niên Tứ Hóa (A, B, C, D) trên lá số.",
          "Chỉ ra các cung có Tự Hóa Ly Tâm và Hướng Tâm Tứ Hóa: Đâu là nơi thoát khí, đâu là nơi đón nhận cơ hội?",
          `Luận giải hạn năm ${viewYear} theo phép Khâm Thiên: Tứ Hóa lưu niên kích động những cung vị nào, ứng kỳ vào thời điểm nào?`,
          "Phân tích trục Thể - Dụng và tương quan Lộc - Kị để tìm hướng hóa giải nghiệp lực.",
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: true,
        includeLocKiToanDo: false,
        include60TinhHe: false,
      };

    case "Khâm Thiên + Nam phái":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · KHÂM THIÊN TỨ HÓA KẾT HỢP NAM PHÁI",
        schoolName: "Khâm Thiên Tứ Hóa kết hợp Nam Phái",
        philosophy: "Dung hợp tinh hoa giữa Nam Phái (Hình Thể - Tinh đẩu miếu hãm, tam hợp cách cục, cát sát tinh) và Khâm Thiên (Khí Vận - Lai Nhân Cung, Sinh Niên Tứ Hóa, Tự Hóa, Hướng Tâm, Thể Dụng). Lấy Nam Phái định tư chất năng lực, lấy Khâm Thiên định thời vận nhân quả và thời điểm ứng kỳ.",
        aiRole: "Bạn là bậc thầy Tử Vi Đẩu Số tinh thông kết hợp giữa Khâm Thiên Tứ Hóa và Nam Phái Tam Hợp.",
        specializedDirectives: [
          "**Luận giải Cách Cục & Tinh Đẩu (Nam Phái)**: Đánh giá độ sáng miếu hãm của 14 chính tinh, vị thế Mệnh - Thân và sự hội tụ của cát/sát tinh trong Tam Phương Tứ Chính.",
          "**Khảo cứu Lai Nhân Cung & Sinh Niên Tứ Hóa (Khâm Thiên)**: Xác định Lai Nhân Cung và tọa vị của Lộc (A), Quyền (B), Khoa (C), Kị (D).",
          "**Phân tích Tự Hóa Ly Tâm & Hướng Tâm**: Chỉ ra các cung phát sinh Tự Hóa và Hướng Tâm làm biến đổi tính chất gốc của tinh đẩu.",
          `**Kết hợp Vận Hạn Hai Phái**: Đối chiếu Đại Hạn 10 năm và Lưu Niên ${viewYear} giữa phép an sao lưu Nam Phái và cơ chế Tứ Hóa trùng điệp Khâm Thiên.`,
          "**Chiến lược Ứng Xử Toàn Diện**: Định hướng phát huy sở trường tinh đẩu, thuận theo thời vận Tứ Hóa.",
        ],
        specializedQuestions: [
          "Kết hợp cách cục Nam Phái và Lai Nhân Cung Khâm Thiên: Phân tích tư chất và sứ mệnh cuộc đời.",
          "Đánh giá sự tương tác giữa chính tinh miếu hãm với các hiện tượng Tự Hóa / Hướng Tâm tại các cung trọng điểm.",
          `Luận giải vận hạn năm ${viewYear} đồng thời theo sao lưu Nam Phái và Tứ Hóa trùng điệp Khâm Thiên.`,
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: true,
        includeLocKiToanDo: false,
        include60TinhHe: false,
      };

    case "Lương Phái":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · PHI TINH LƯƠNG PHÁI",
        schoolName: "Phi Tinh Lương Phái (Lương Nhược Du)",
        philosophy: "Vận dụng Thập Can Bộ Cung Phi Tinh, mạng lưới Lộc Kị Toàn Đồ, chuỗi Kị chuyển Lộc và Lộc chuyển Kị, các thế đặc thù (Nghịch Thủy Kị, Phản Cung Kị, Tuyệt Mệnh Kị, Kị Xuất / Kị Nhập) và Cung Vị Tam Biến.",
        aiRole: "Bạn là đại sư Tử Vi Đẩu Số chuyên sâu về Phi Tinh Lương Phái (Lương Nhược Du).",
        specializedDirectives: [
          "**Phân tích Lộc Kị Toàn Đồ**: Nhận diện cung vị tụ Lộc dồi dào nhất (điểm sinh tài đắc lợi) và cung vị tụ Kị nặng nề nhất (điểm tắc nghẽn, áp lực, nợ nần lớn nhất).",
          "**Truy vết Chuỗi Phi Tinh (Kị chuyển Lộc & Lộc chuyển Kị)**: Lần theo đường dẫn can cung phát động, nhận diện nguyên nhân sâu xa dẫn đến thành bại tài chính và quan trường.",
          "**Kiểm tra các Cách Cục Đặc Thù Lương Phái**: Xem xét có Nghịch Thủy Kị (bước ngoặt đại phát), Phản Cung Kị (đại phá), Tuyệt Mệnh Kị (tổn hại nguyên khí), hay Kị Xuất / Kị Nhập.",
          `**Ứng dụng Cung Vị Tam Biến Luận Vận Hạn**: Xem xét sự trùng điệp giữa Bản Cung, Đại Vận Cung và Lưu Niên Cung trong năm ${viewYear}.`,
          "**Chiến lược Hành Động**: Phương pháp mở cung nhận Lộc và giải tỏa các cung tụ Kị để chuyển nguy thành an.",
        ],
        specializedQuestions: [
          "Phân tích Lộc Kị Toàn Đồ: Chỉ rõ cung tụ Lộc và cung tụ Kị nhất trên lá số Lương Phái này.",
          "Truy vết chuỗi Kị chuyển Lộc và Lộc chuyển Kị: Đâu là nguyên nhân gốc rễ dẫn đến thăng trầm tài lộc và sự nghiệp?",
          `Kiểm tra xem lá số có cách cục Nghịch Thủy Kị, Phản Cung Kị hay Tuyệt Mệnh Kị nào phát động trong Đại Vận và năm ${viewYear} không?`,
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: false,
        includeLocKiToanDo: true,
        include60TinhHe: false,
      };

    case "Lương Phái + Nam phái":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · PHI TINH LƯƠNG PHÁI KẾT HỢP NAM PHÁI",
        schoolName: "Phi Tinh Lương Phái kết hợp Nam Phái",
        philosophy: "Lấy Tam Phương Tứ Chính, Cát Sát tinh của Nam Phái làm nền tảng định tính; lấy Lộc Kị Toàn Đồ và chuỗi phi tinh chuyển Lộc/Kị của Lương Phái làm động lực dòng chảy tài quan và biến cố.",
        aiRole: "Bạn là bậc thầy Tử Vi Đẩu Số tinh thông kết hợp giữa Phi Tinh Lương Phái và Nam Phái Tam Hợp.",
        specializedDirectives: [
          "**Đánh giá Cấu Trúc Nam Phái**: Miếu hãm của 14 chính tinh, tương quan cung Mệnh - Thân và các bộ cát/sát tinh hội chiếu.",
          "**Phân tích Mạng Lưới Lộc Kị Toàn Đồ (Lương Phái)**: Cung vị tụ Lộc và tụ Kị, tương quan tài lộc thực tế.",
          "**Theo dõi Chuỗi Chuyển Lộc & Chuyển Kị**: Nhận diện đường dẫn nhân quả phi tinh kích hoạt cung vị nào.",
          `**Luận Vận Hạn Kết Hợp**: Đối chiếu Tiểu Hạn sao lưu Nam Phái và Cung Vị Tam Biến Lương Phái trong năm ${viewYear}.`,
          "**Định hướng Thực Tế**: Lời khuyên hành xử kết hợp đạo đức Nam Phái và sách lược khai mở cung vị Lương Phái.",
        ],
        specializedQuestions: [
          "Phân tích sự tương hỗ giữa cách cục chính tinh Nam Phái và dòng chảy Lộc Kị Toàn Đồ Lương Phái.",
          "Chỉ ra các điểm nghẽn chuyển Kị và cơ hội chuyển Lộc trong công danh sự nghiệp.",
          `Dự báo vận hạn năm ${viewYear} bằng sự kết hợp giữa sao lưu Nam Phái và phi tinh Lương Phái.`,
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: false,
        includeLocKiToanDo: true,
        include60TinhHe: false,
      };

    case "Trung Châu Phái":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · TRUNG CHÂU PHÁI (60 TINH HỆ)",
        schoolName: "Trung Châu Phái (Vương Đình Chi - 60 Tinh Hệ)",
        philosophy: "Lấy giáo trình 60 Tinh Hệ hoàn chỉnh làm hạt nhân, chú trọng lý thuyết 'Tinh Diệu Hóa Khí', phép phân định Thiên Bàn / Địa Bàn / Nhân Bàn, Bảng Tứ Hóa Trung Châu Phái (Can Canh Âm Đồng La Vũ...) và tính chất phò tá giáp cung.",
        aiRole: "Bạn là đại tôn sư Tử Vi Đẩu Số chuyên sâu về Trung Châu Phái (truyền thừa Lục Bân Triệu - Vương Đình Chi).",
        specializedDirectives: [
          "**Luận giải 60 Tinh Hệ Chủ Đạo**: Phân tích toàn diện tổ hợp tinh hệ tại cung Mệnh, Thân, Tài, Quan theo quy chuẩn 60 Tinh Hệ Trung Châu (không luận sao đơn lẻ).",
          "**Bản Tính Hóa Khí & Tác Động Tứ Hóa Trung Châu**: Đánh giá trạng thái Hóa Khí của các tinh diệu khi tương tác với Bảng Tứ Hóa Trung Châu.",
          "**Các Cặp Phụ Tinh Phò Tá & Phép Giáp Cung**: Đánh giá Phụ Bật giáp cung, Xương Khúc, Khôi Việt, Lộc Mã, sát tinh tứ hung.",
          `**Thấu Biến Tinh Hệ Vận Hạn**: Luận giải Đại Hạn 10 năm và Lưu Niên ${viewYear} theo phép Thấu Cung thấu biến tinh hệ của Trung Châu Phái.`,
          "**Định hướng Tu Dưỡng & Ứng Nhân Xử Thế**: Khai mở năng lượng thiện lành của tinh hệ và hóa giải ám khí.",
        ],
        specializedQuestions: [
          "Luận giải chi tiết tổ hợp 60 Tinh Hệ tại cung Mệnh và Tam Phương Tứ Chính theo giáo lý Trung Châu Phái.",
          "Phân tích sự biến đổi Hóa Khí của tinh hệ chủ đạo khi gặp Tứ Hóa Trung Châu Phái.",
          "Đánh giá sự hội hợp của các cặp phụ tinh phò tá (Tả Hữu, Xương Khúc, Khôi Việt) và phép giáp cung trên lá số.",
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: false,
        includeLocKiToanDo: false,
        include60TinhHe: true,
      };

    case "Trung Châu Phái + Khâm Thiên":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · TRUNG CHÂU PHÁI KẾT HỢP KHÂM THIÊN",
        schoolName: "Trung Châu Phái kết hợp Khâm Thiên Tứ Hóa",
        philosophy: "Lấy 60 Tinh Hệ Hóa Khí của Trung Châu Phái làm Bản Thể Tinh Diệu, phối hợp Lai Nhân Cung và Hướng Tâm / Ly Tâm Tứ Hóa của Khâm Thiên để định thời điểm kích hoạt nhân quả.",
        aiRole: "Bạn là bậc thầy Tử Vi Đẩu Số tinh thông kết hợp giữa 60 Tinh Hệ Trung Châu Phái và Khâm Thiên Môn Tứ Hóa.",
        specializedDirectives: [
          "**Luận giải 60 Tinh Hệ Chủ Đạo**: Tổ hợp tinh hệ tại Mệnh - Thân và Tam Phương Tứ Chính.",
          "**Lai Nhân Cung & Tứ Hóa Tiên Thiên**: Điểm khởi duyên và sự điều động khí vận của 4 Tượng A, B, C, D.",
          "**Tự Hóa Ly Tâm & Hướng Tâm**: Phân tích sự chuyển biến năng lượng giữa các cung vị đối xứng.",
          `**Thấu Biến Vận Hạn Kết Hợp**: Luận giải Đại Hạn và Lưu Niên ${viewYear} theo tiến trình thấu biến tinh hệ và Tứ Hóa trùng điệp.`,
          "**Lời khuyên Chuyển Hóa Nghiệp Lực**: Định hướng hành động thuận thời hợp vị.",
        ],
        specializedQuestions: [
          "Phân tích sự phối hợp giữa 60 Tinh Hệ Trung Châu và Lai Nhân Cung Khâm Thiên trên lá số này.",
          "Chỉ ra những biến động do Tự Hóa và Hướng Tâm tác động lên tinh hệ chủ tọa tại các cung trọng điểm.",
          `Dự báo thời vận năm ${viewYear} theo phép phối hợp Trung Châu và Khâm Thiên.`,
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: true,
        includeLocKiToanDo: false,
        include60TinhHe: true,
      };

    case "Trung Châu Phái + Lương Phái":
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ · TRUNG CHÂU PHÁI KẾT HỢP LƯƠNG PHÁI",
        schoolName: "Trung Châu Phái kết hợp Phi Tinh Lương Phái",
        philosophy: "Lấy 60 Tinh Hệ Trung Châu Phái làm cấu trúc tinh bàn, kết hợp dòng chảy Lộc Kị Toàn Đồ và chuỗi chuyển Lộc chuyển Kị của Lương Phái.",
        aiRole: "Bạn là bậc thầy Tử Vi Đẩu Số tinh thông kết hợp giữa 60 Tinh Hệ Trung Châu Phái và Phi Tinh Lương Phái.",
        specializedDirectives: [
          "**Cấu Trúc Tinh Hệ Trung Châu**: Phân tích tổ hợp tinh hệ tại Mệnh, Thân, Tài, Quan và trạng thái Hóa Khí.",
          "**Mạng Lưới Lộc Kị Toàn Đồ**: Đánh giá cung tụ Lộc và cung tụ Kị của lá số.",
          "**Chuỗi Phi Tinh Chuyển Lộc / Chuyển Kị**: Nhận diện con đường dẫn khí và mắt xích nhân duyên.",
          `**Vận Hạn Tam Biến & Thấu Cung**: Luận giải Đại Hạn và Lưu Niên ${viewYear} kết hợp hai trường phái.`,
          "**Sách Lược Hành Động**: Phương pháp mở cung nạp tài và giải trừ xung sát.",
        ],
        specializedQuestions: [
          "Phân tích sự tương tác giữa 60 Tinh Hệ Trung Châu và mạng lưới Lộc Kị Toàn Đồ Lương Phái.",
          "Chỉ ra các mắt xích chuyển Kị quan trọng tác động đến công danh và sự nghiệp.",
          `Dự báo cơ hội và thách thức trong năm ${viewYear} theo phép phối hợp Trung Châu và Lương Phái.`,
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: false,
        includeLocKiToanDo: true,
        include60TinhHe: true,
      };

    default: // "Mặc định"
      return {
        headerTitle: "LÁ SỐ TỬ VI ĐẨU SỐ",
        schoolName: "Tử Vi Đẩu Số Tổng Hợp Toàn Cầu",
        philosophy: "Tích hợp đa chiều giữa Tam Phương Tứ Chính Nam Phái, Tứ Hóa Tiên Thiên Khâm Thiên, mạng lưới Lộc Kị Lương Phái và 60 Tinh Hệ Trung Châu Phái, mang đến góc nhìn đa diện và chuẩn xác.",
        aiRole: "Bạn là bậc thầy Mệnh Lý học phương Đông tinh thông toàn diện các môn phái Tử Vi Đẩu Số (Nam Phái, Khâm Thiên, Lương Phái, Trung Châu Phái).",
        specializedDirectives: [
          "**Luận giải Bản Mệnh & Cách Cục**: Phân tích tính cách, sở trường, sở đoản, các cách cục quý hoặc hung cách cần chú ý phòng tránh.",
          "**Luận giải Tam Phương Tứ Chính (Công Danh & Tài Lộc)**: Định hướng lĩnh vực ngành nghề phát huy năng lực tối đa, thời cơ bứt phá tài chính và phương pháp quản trị rủi ro.",
          "**Luận giải Phu Thê, Phúc Đức & Gia Đạo**: Phân tích nhân duyên, hòa hợp vợ chồng, sức khỏe và đời sống tinh thần.",
          `**Luận giải Vận Hạn Đại Hạn 10 Năm & Lưu Niên ${viewYear}**: Phân tích các cung phát động, lưu Tứ Hóa, cơ hội và các mốc thời gian quan trọng trong năm.`,
          "**Lời khuyên Tu Dưỡng & Cải Mệnh**: Đưa ra định hướng ứng xử và chiến lược xu cát tị hung thực tế.",
        ],
        specializedQuestions: [
          "Phân tích chi tiết hơn về các cách cục đặc biệt của lá số Tử Vi này.",
          "Phân tích các đại vận quan trọng trong cuộc đời và các mốc chuyển biến lớn.",
          "Các vấn đề nổi bật cần lưu ý của lá số ví dụ: sức khỏe, tình duyên, sự nghiệp, tài chính...",
        ],
        includePhiCungInPalaces: true,
        includeLaiNhanCung: true,
        includeLocKiToanDo: true,
        include60TinhHe: true,
      };
  }
}

/**
 * Tạo Markdown chuyên biệt cho LÁ SỐ TỬ VI ĐẨU SỐ theo từng trường phái
 */
export function buildZiweiMarkdownForAi(opts: ChartAiMarkdownOptions): string {
  // Nếu là chế độ Tứ Trụ, tự động ủy quyền sang hàm Bát Tự Tứ Trụ chuyên sâu
  if (opts.chartStyle === "Tứ Trụ" || opts.isFourPillarsMode) {
    return buildBaziMarkdownForAi(opts);
  }

  const {
    name,
    gender,
    date,
    time,
    viewYear,
    locationName,
    latitude,
    longitude,
    utcOffset,
    horoChart,
    baziChart,
    chartStyle,
  } = opts;

  const schoolMeta = getSchoolAiMetadata(chartStyle, viewYear);

  const info = horoChart?.info;
  const solarDateStr = `${date.split("-").reverse().join("/")} ${time}`;
  const lunarDateStr = info?.lunarBirthStr || `Năm ${baziChart.pillars[0].stem} ${baziChart.pillars[0].branch}`;
  const solarTermText = info?.solarTermText || baziChart.calculation.solarTerm;
  const appliedTimeText = baziChart.calculation.appliedTime;

  const fateNaYin = info?.fateNaYin || baziChart.pillars[0].stemElement;
  const fateElement = info?.fateElement || baziChart.dayMaster.stemElement;
  const bureauName = info?.bureauName || "Chưa xác định";
  const bureauElement = info?.bureauElement || "";
  const fateBureauRelation = info?.fateBureauRelation || "";
  const polarity = info?.yinYangPolarity || (gender === "Nam" ? "Dương Nam" : "Âm Nữ");
  const soulMaster = info?.soulMaster || "";
  const bodyMaster = info?.bodyMaster || "";
  const bodyPalaceBranch = info?.bodyPalaceBranch || "";
  const bodyPalaceTitle = info?.bodyPalaceTitle || "";
  const tuanText = horoChart?.tuanBranches ? horoChart.tuanBranches.join(", ") : "";
  const trietText = horoChart?.trietBranches ? horoChart.trietBranches.join(", ") : "";
  const age = info?.age || Math.max(1, viewYear - Number(date.split("-")[0]) + 1);

  // 12 Cung Tử Vi
  const palaces = horoChart?.palaces || [];
  const rawHoro = horoChart?.rawHoro;
  const menhPalace = palaces.find((p) => p.title.includes("MỆNH") || p.title === "MỆNH");
  const thanPalace = palaces.find((p) => p.isBodyPalace);
  const quanPalace = palaces.find((p) => p.title.includes("QUAN"));
  const taiPalace = palaces.find((p) => p.title.includes("TÀI"));
  const phucPalace = palaces.find((p) => p.title.includes("PHÚC"));
  const phuThePalace = palaces.find((p) => p.title.includes("PHỐI") || p.title.includes("PHU") || p.title.includes("THÊ"));

  // Dữ liệu học thuật đặc thù
  const yearStem = baziChart.pillars[0].stem;
  const laiNhanMatches = palaces.filter((p) => p.stem === yearStem);
  const laiNhanPalace = laiNhanMatches.find((p) => !["Tý", "Sửu"].includes(p.branch)) || laiNhanMatches[0];

  // Sinh Niên Tứ Hóa
  const sinhNienList: string[] = [];
  palaces.forEach((p) => {
    p.minorStars.forEach((star) => {
      if (star.startsWith("Hóa ")) {
        const major = p.majorStars[0]?.name || "";
        sinhNienList.push(`${star} -> ${major ? `${major} ` : ""}(cung ${p.title} - ${p.branch})`);
      }
    });
    p.majorStars.forEach((s) => {
      if (s.mutagen) {
        sinhNienList.push(`Hóa ${s.mutagen} -> ${s.name} (cung ${p.title} - ${p.branch})`);
      }
    });
  });

  // Tự Hóa & Hướng Tâm
  const tuHoaList: string[] = [];
  const huongTamList: string[] = [];
  const hoaLabels = ["Lộc (A)", "Quyền (B)", "Khoa (C)", "Kỵ (D)"];
  palaces.forEach((p, sIdx) => {
    const rawChart = rawHoro as RawHoroData | null | undefined;
    const palaceRaw = rawChart?.ars?.[sIdx];
    if (!palaceRaw || !Array.isArray(palaceRaw.cno)) return;
    hoaLabels.forEach((hoa, t) => {
      const dest = palaceRaw.cno?.[t];
      if (dest === sIdx) {
        tuHoaList.push(`Cung ${p.title} (${p.branch}) Tự Hóa ${hoa}`);
      } else if (typeof dest === "number" && Math.abs(dest - sIdx) === 6 && palaces[dest]) {
        huongTamList.push(`Cung ${p.title} (${p.branch}) Hướng Tâm ${hoa} sang ${palaces[dest].title} (${palaces[dest].branch})`);
      }
    });
  });

  // Lộc Kị Toàn Đồ
  const locKiCounts: Array<{ title: string; branch: string; loc: number; ki: number }> = [];
  palaces.forEach((p, idx) => {
    const rawChart = rawHoro as RawHoroData | null | undefined;
    const palaceRaw = rawChart?.ars?.[idx];
    const loc = palaceRaw?.zolk?.[0]?.[0] || 0;
    const ki = palaceRaw?.zolk?.[3]?.[0] || 0;
    if (loc > 0 || ki > 0) {
      locKiCounts.push({ title: p.title, branch: p.branch, loc, ki });
    }
  });

  // 60 Tinh Hệ
  const tinhHeList: Array<{ title: string; branch: string; stars: string; hoaKhi: string }> = palaces.map((p) => {
    const names = p.majorStars.map((s) => s.name);
    const starStr = names.length > 0 ? names.join(" - ") : "Vô Chính Diệu";
    const hoaKhi = names.map((s) => `${s} (Hóa Khí: ${HOA_KHI_MAP[s.toUpperCase()] || "Cát"})`).join(", ");
    return { title: p.title, branch: p.branch, stars: starStr, hoaKhi: hoaKhi || "Mượn ánh sáng cung đối" };
  });

  // Xây dựng phần diễn giải theo trường phái
  const schoolSections: string[] = [];

  if (schoolMeta.includeLaiNhanCung && laiNhanPalace) {
    schoolSections.push(
      `### Căn Duyên Tiền Định & Tứ Hóa Khâm Thiên:`,
      `- **Lai Nhân Cung**: Cung **${laiNhanPalace.title}** tại **${laiNhanPalace.branch}** (Thiên Can: ${laiNhanPalace.stem}). Đại diện cho căn nguyên nghiệp duyên, điểm phát khởi sứ mệnh cuộc đời và cội nguồn của mọi trách nhiệm.`,
      sinhNienList.length > 0 ? `- **Sinh Niên Tứ Hóa Tiên Thiên**: ${sinhNienList.join(" | ")}.` : "",
      tuHoaList.length > 0 ? `- **Tự Hóa (Ly Tâm)**: ${tuHoaList.join("; ")}.` : "- **Tự Hóa**: Không có cung tự hóa ly tâm.",
      huongTamList.length > 0 ? `- **Hướng Tâm Tứ Hóa**: ${huongTamList.join("; ")}.` : "- **Hướng Tâm**: Không có hướng tâm đối xung.",
      "",
    );
  }

  if (schoolMeta.includeLocKiToanDo && locKiCounts.length > 0) {
    const locTops = locKiCounts.filter((item) => item.loc > 0).map((item) => `${item.title} (${item.branch}: ${item.loc} Lộc)`).join(", ");
    const kiTops = locKiCounts.filter((item) => item.ki > 0).map((item) => `${item.title} (${item.branch}: ${item.ki} Kị)`).join(", ");
    schoolSections.push(
      `### Mạng Lưới Lộc Kị Toàn Đồ (Lương Phái):`,
      locTops ? `- **Cung vị Tụ Lộc (Điểm tụ tài - duyên may)**: ${locTops}.` : "",
      kiTops ? `- **Cung vị Tụ Kị (Điểm tắc nghẽn - nợ nghiệp)**: ${kiTops}.` : "",
      "",
    );
  }

  if (schoolMeta.include60TinhHe) {
    const keyPalaces = tinhHeList.filter((item) => ["MỆNH", "THÂN", "QUAN", "TÀI", "DI", "PHỐI"].some((k) => item.title.includes(k)));
    schoolSections.push(
      `### Cấu Trúc 60 Tinh Hệ & Hóa Khí (Trung Châu Phái):`,
      keyPalaces.map((item) => `- **Cung ${item.title}** (${item.branch}): Tổ hợp **${item.stars}** · ${item.hoaKhi}`).join("\n"),
      "",
    );
  }

  const palacesMarkdown = palaces.map((p, pIdx) => {
    const isBody = p.isBodyPalace ? " [THÂN CƯ]" : "";
    const majorText = p.majorStars.length > 0
      ? p.majorStars.map((m) => {
          const mut = m.mutagen ? ` [Hóa ${m.mutagen}]` : "";
          const dig = m.dignity ? ` (${m.dignity})` : "";
          return `**${m.name}**${dig}${mut}`;
        }).join(", ")
      : "Vô chính diệu (Không có chính tinh)";

    const minorText = p.minorStars.length > 0 ? p.minorStars.join(", ") : "Không có phụ tinh";
    const tuHoaText = p.tuHoaBadges?.length > 0 ? p.tuHoaBadges.map((b) => b.text).join(", ") : "";
    const decRange = p.decadeRange ? `${p.decadeRange[0]} - ${p.decadeRange[1]} tuổi` : `${p.decadeAge}`;

    const palaceRaw = (rawHoro as RawHoroData | null | undefined)?.ars?.[pIdx];
    const cno = palaceRaw?.cno;
    const phiCungStr = schoolMeta.includePhiCungInPalaces && Array.isArray(cno) && cno.length >= 4
      ? ["Lộc", "Quyền", "Khoa", "Kỵ"].map((h, t) => {
          const destIdx = cno[t];
          const destTitle = typeof destIdx === "number" ? palaces[destIdx]?.title : undefined;
          return destTitle ? `Phi ${h} -> ${destTitle}` : "";
        }).filter(Boolean).join(" | ")
      : "";

    const locCount = palaceRaw?.zolk?.[0]?.[0] || 0;
    const kiCount = palaceRaw?.zolk?.[3]?.[0] || 0;
    const toanDoStr = schoolMeta.includeLocKiToanDo && (locCount > 0 || kiCount > 0)
      ? [locCount > 0 ? `${locCount} Lộc (A)` : "", kiCount > 0 ? `${kiCount} Kỵ (D)` : ""].filter(Boolean).join(", ")
      : "";

    return [
      `### Cung ${p.title} tại ${p.branch}${isBody}`,
      `- **Can Chi Cung**: ${p.stem} ${p.branch} (Nạp âm: ${p.naYin})`,
      `- **Đại Hạn**: ${decRange} | **Tiểu Hạn**: Cung ${p.smallYearBranch} | **Vòng Tràng Sinh**: ${p.lifeStage}`,
      `- **Chính tinh**: ${majorText}`,
      `- **Phụ tinh, Cát/Sát tinh**: ${minorText}`,
      phiCungStr ? `- **Phi Cung Tứ Hóa**: ${phiCungStr}` : "",
      schoolMeta.includePhiCungInPalaces && tuHoaText ? `- **Tự Hóa / Hướng Tâm**: ${tuHoaText}` : "",
      toanDoStr ? `- **Phương Viên Lộc Kị**: ${toanDoStr}` : "",
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const directivesText = schoolMeta.specializedDirectives.map((d, i) => `${i + 1}. ${d}`).join("\n");
  const questionsText = schoolMeta.specializedQuestions.map((q) => `- "${q}"`).join("\n");

  const rawHoroObj = opts.horoChart?.rawHoro;
  let tinhMenhDoBlock = "";
  if (rawHoroObj) {
    try {
      tinhMenhDoBlock = buildTinhMenhDoAiMarkdown(rawHoroObj, {
        name: locationName,
        lat: latitude,
        lon: longitude,
      });
    } catch {
      tinhMenhDoBlock = "";
    }
  }

  return [
    "Phân tích lá số sau:\n",
    `# ${schoolMeta.headerTitle} · ${name.toUpperCase()}`,
    "",
    `> **Trường phái thiết lập**: ${schoolMeta.schoolName}`,
    `> **Tôn chỉ phương pháp**: ${schoolMeta.philosophy}`,
    "",
    `---`,
    "",
    tinhMenhDoBlock
      ? tinhMenhDoBlock
      : [
          `## 1. THÔNG TIN BẢN MỆNH & LẬP LÁ SỐ`,
          `- **Họ và tên**: ${name}`,
          `- **Giới tính**: ${gender} (${polarity})`,
          `- **Ngày giờ sinh Dương lịch**: ${solarDateStr}`,
          `- **Ngày giờ sinh Âm lịch**: ${lunarDateStr}`,
          `- **Tiết khí**: ${solarTermText}`,
          `- **Nơi sinh**: ${locationName} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E) · Múi giờ: UTC+${utcOffset}`,
          `- **Chân giờ tính toán**: ${appliedTimeText}`,
          `- **Bản Mệnh (Nạp Âm)**: ${fateNaYin} (${fateElement})`,
          `- **Cục**: ${bureauName} (${bureauElement}) — ${fateBureauRelation}`,
          soulMaster ? `- **Mệnh Chủ**: ${soulMaster} | **Thân Chủ**: ${bodyMaster}` : "",
          bodyPalaceBranch ? `- **Thân Cư**: Cung ${bodyPalaceTitle} (tại ${bodyPalaceBranch})` : "",
          tuanText ? `- **Tuần Không**: ${tuanText} | **Triệt Không**: ${trietText}` : "",
          `- **Năm xem hạn / Lưu niên**: Năm ${viewYear} — Tuổi âm: ${age} tuổi`,
        ].filter(Boolean).join("\n"),
    "",
    `---`,
    "",
    `## 2. DIỄN GIẢI CỐT LÕI CÁC CUNG TRỌNG ĐIỂM`,
    `### Cung Mệnh & Thân:`,
    `- **Cung Mệnh** (tại ${menhPalace?.branch || "Mệnh"}): ${menhPalace?.majorStars.map((s) => s.name).join(", ") || "Vô chính diệu"}. Đại diện cho bản tính tiên thiên, tư chất, nghị lực và cốt cách sống.`,
    thanPalace ? `- **Cung Thân** (Cư tại ${thanPalace.title} - ${thanPalace.branch}): Đại diện cho hậu vận, hành động thực tế và xu hướng lựa chọn sau tuổi 30.` : "",
    `- **Tương quan Mệnh - Cục**: Bản mệnh ${fateNaYin} (${fateElement}) kết hợp ${bureauName} (${bureauElement}) tạo nên thế ${fateBureauRelation}, phản ánh mức độ thuận lợi trong việc dung hòa với thời cuộc.`,
    "",
    `### Tam Phương Tứ Chính (Mệnh - Tài - Quan - Di):`,
    `- **Cung Quan Lộc** (tại ${quanPalace?.branch || "Quan"}): ${quanPalace?.majorStars.map((s) => s.name).join(", ") || "Vô chính diệu"}. Thể hiện năng lực điều hành, ngành nghề phát huy năng khiếu và con đường phát triển sự nghiệp.`,
    `- **Cung Tài Bạch** (tại ${taiPalace?.branch || "Tài"}): ${taiPalace?.majorStars.map((s) => s.name).join(", ") || "Vô chính diệu"}. Thể hiện tư duy tiền bạc, khả năng quản trị tài chính và cách tích lũy của cải.`,
    `- **Cung Phúc Đức & Phu Thê**:`,
    `  + **Phúc Đức** (tại ${phucPalace?.branch || "Phúc"}): Nền tảng tâm linh, đời sống tinh thần, phúc ấm tổ tiên và độ an lạc nội tâm.`,
    `  + **Phu Thê** (tại ${phuThePalace?.branch || "Phối"}): Tương quan tình duyên, tính cách người phối ngẫu và chìa khóa giữ gìn hạnh phúc gia đạo.`,
    "",
    ...schoolSections,
    `---`,
    "",
    `## 3. CHI TIẾT 12 CUNG TRÊN TINH BÀN TỬ VI`,
    palacesMarkdown,
    "",
    `---`,
    "",
    `## 4. YÊU CẦU DÀNH CHO AI LUẬN GIẢI TỬ VI CHUYÊN SÂU`,
    `${schoolMeta.aiRole} Dựa trên hệ thống lý thuyết của ${schoolMeta.schoolName} và dữ liệu lá số Tử Vi ở trên:`,
    directivesText,
    "",
    `---`,
    "",
    `## GỢI Ý CÂU HỎI CHO AI (${schoolMeta.schoolName.toUpperCase()}):`,
    questionsText,
  ].filter(Boolean).join("\n");
}

/**
 * Tạo Markdown chuyên biệt cho LÁ SỐ TỨ TRỤ BÁT TỰ (TỬ BÌNH)
 */
export function buildBaziMarkdownForAi(opts: ChartAiMarkdownOptions): string {
  const {
    name,
    gender,
    date,
    time,
    viewYear,
    locationName,
    latitude,
    longitude,
    utcOffset,
    horoChart,
    baziChart,
    baziSupport,
    luck,
  } = opts;

  const info = horoChart?.info;
  const solarDateStr = `${date.split("-").reverse().join("/")} ${time}`;
  const lunarDateStr = info?.lunarBirthStr || `Năm ${baziChart.pillars[0].stem} ${baziChart.pillars[0].branch}`;
  const solarTermText = info?.solarTermText || baziChart.calculation.solarTerm;
  const appliedTimeText = baziChart.calculation.appliedTime;
  const age = info?.age || Math.max(1, viewYear - Number(date.split("-")[0]) + 1);

  const pYear = baziChart.pillars[0];
  const pMonth = baziChart.pillars[1];
  const pDay = baziChart.pillars[2];
  const pHour = baziChart.pillars[3];

  const horoPillars = horoChart?.pillars;
  const yearHidden = horoPillars?.[0]?.hiddenStems?.map((h) => `${h.stem} (${h.tenGod})`).join(", ") || "";
  const monthHidden = horoPillars?.[1]?.hiddenStems?.map((h) => `${h.stem} (${h.tenGod})`).join(", ") || "";
  const dayHidden = horoPillars?.[2]?.hiddenStems?.map((h) => `${h.stem} (${h.tenGod})`).join(", ") || "";
  const hourHidden = horoPillars?.[3]?.hiddenStems?.map((h) => `${h.stem} (${h.tenGod})`).join(", ") || "";

  const baziTableMarkdown = [
    `| Trụ | Can Chi | Nạp Âm | Thập Thần | Tàng Can & Thập Thần | Vòng Tràng Sinh |`,
    `| :--- | :--- | :--- | :--- | :--- | :--- |`,
    `| **Năm** | ${pYear.stem} ${pYear.branch} | ${horoPillars?.[0]?.naYin || ""} | ${horoPillars?.[0]?.tenGod || ""} | ${yearHidden} | ${horoPillars?.[0]?.lifeStage || ""} |`,
    `| **Tháng** | ${pMonth.stem} ${pMonth.branch} | ${horoPillars?.[1]?.naYin || ""} | ${horoPillars?.[1]?.tenGod || ""} | ${monthHidden} | ${horoPillars?.[1]?.lifeStage || ""} |`,
    `| **Ngày (Nhật Chủ)** | ${pDay.stem} ${pDay.branch} | ${horoPillars?.[2]?.naYin || ""} | Tọa: ${horoPillars?.[2]?.tenGod || "Nhật Nguyên"} | ${dayHidden} | ${horoPillars?.[2]?.lifeStage || ""} |`,
    `| **Giờ** | ${pHour.stem} ${pHour.branch} | ${horoPillars?.[3]?.naYin || ""} | ${horoPillars?.[3]?.tenGod || ""} | ${hourHidden} | ${horoPillars?.[3]?.lifeStage || ""} |`,
  ].join("\n");

  const dayStemQuality = STEM_QUALITIES[pDay.stem] || { nature: "Khí chất quân bình", keywords: "Hài hòa", advice: "Nắm bắt cơ hội" };
  const temperature = getBaziTemperature(baziChart.pillars, baziChart.calculation.solarTerm);
  const relations = getBaziRelations(baziChart.pillars);
  const balance = getElementBalance(baziChart.pillars);

  const balanceText = balance.map((b) => `${b.element}: ${b.percent}% (${b.count} điểm)`).join(" | ");

  const relationsText = relations.length > 0
    ? relations.map((r) => `- **${r.label}** (${r.system}): ${r.members.join(" · ")}`).join("\n")
    : "- Nguyên cục không có xung khắc trực diện nghiêm trọng.";

  // Các bước Đại Vận 10 năm
  const luckCyclesText = (luck.cycles || []).slice(0, 10).map((c, i) => {
    return `- **Đại vận ${i + 1} (${c.from} - ${c.to} tuổi / năm ${c.startYear} - ${c.endYear})**: Can Chi: **${c.stem} ${c.branch}** (${c.stemElement} · ${c.branchElement})`;
  }).join("\n");

  return [
    "Phân tích lá số sau:\n",
    `# LÁ SỐ TỨ TRỤ BÁT TỰ · ${name.toUpperCase()}`,
    "",
    `> **Trường phái thiết lập**: Bát Tự Tử Bình (Kết hợp Manh Phái & Tử Bình Truyền Thống)`,
    `> **Tôn chỉ phương pháp**: Lấy Nhật Chủ làm trung tâm, phân tích Can Chi ngũ hành vượng suy theo Nguyệt Lệnh, thông căn thấu can, định cách cục, điều hòa độ ấm lạnh (Điều Hầu), tìm Dụng Thần - Hỷ Thần và đánh giá sự sinh khắc chế hóa của Thập Thần.`,
    "",
    `---`,
    "",
    `## 1. THÔNG TIN BẢN MỆNH & GIỜ SINH`,
    `- **Họ và tên**: ${name}`,
    `- **Giới tính**: ${gender} (${gender === "Nam" ? "Dương Nam" : "Âm Nữ"})`,
    `- **Ngày sinh Dương lịch**: ${solarDateStr}`,
    `- **Ngày sinh Âm lịch**: ${lunarDateStr}`,
    `- **Tiết khí**: ${solarTermText}`,
    `- **Nơi sinh**: ${locationName} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E) · Múi giờ: UTC+${utcOffset}`,
    `- **Chân giờ tính toán**: ${appliedTimeText}`,
    `- **Năm xem hạn / Lưu niên**: Năm ${viewYear} — Tuổi âm: ${age} tuổi`,
    "",
    `---`,
    "",
    `## 2. BẢNG BÁT TỰ TỨ TRỤ`,
    baziTableMarkdown,
    "",
    `---`,
    "",
    `## 3. DIỄN GIẢI CẤU TRÚC VƯỢNG SUY & MỆNH CỤC`,
    `### Nhật Chủ (Thân Mạng):`,
    `- **Can Ngày**: **${pDay.stem} (${pDay.stemElement} ${pDay.polarity})**`,
    `- **Bản chất khí**: ${dayStemQuality.nature}`,
    `- **Đặc trưng**: ${dayStemQuality.keywords}. Lời khuyên: ${dayStemQuality.advice}`,
    "",
    `### Vượng Suy & Nguyệt Lệnh:`,
    `- **Tháng lệnh**: Chi **${pMonth.branch}** (Khí lệnh chính: ${baziSupport.monthChiefElement})`,
    `- **Đánh giá Vượng Suy**: **${baziSupport.status}** (${baziSupport.strengthScore}/100)`,
    `- **Diễn giải cấu trúc**: ${baziSupport.explanation} (Xét ${baziSupport.rootCount} chi thông căn)`,
    `- **Phân bố Ngũ Hành nguyên cục**: ${balanceText}`,
    `- **Độ ấm lạnh (Điều Hậu Bát Tự)**: **${temperature.label}**`,
    "",
    `### Dụng Thần & Hỷ Thần:`,
    `- **Dụng Thần tham khảo**: **${baziSupport.usefulElement}** (Yếu tố cốt lõi giúp cân bằng sinh khí và mở đường công danh)`,
    `- **Hỷ Thần**: **${baziSupport.joyElement}** (Yếu tố tương sinh trợ lực cho Dụng Thần)`,
    "",
    `### Can Chi Tương Tác Nội Cục:`,
    relationsText,
    "",
    `---`,
    "",
    `## 4. TIẾN TRÌNH ĐẠI VẬN 10 NĂM`,
    `- **Khởi Đại Vận**: ${luck.start.year} năm ${luck.start.month} tháng (${luck.forward ? "Thuận hành" : "Nghịch hành"})`,
    luckCyclesText,
    "",
    `---`,
    "",
    `## 5. YÊU CẦU DÀNH CHO AI LUẬN GIẢI BÁT TỰ TỨ TRỤ`,
    `Bạn là chuyên gia Mệnh Lý học Bát Tự Tử Bình cao cấp. Dựa trên dữ liệu 4 trụ và cấu trúc vượng suy ở trên:`,
    `1. **Phân tích Nhật Chủ & Cách Cục**: Xác định rõ Thân Vượng hay Thân Nhược, cách cục chính, Dụng thần, Hỷ thần, Kỵ thần và sự thông quan điều hậu.`,
    `2. **Luận giải Công Danh & Tài Vận**: Định hướng ngành nghề phù hợp (Quan Sát, Ấn Tinh, Tài Tinh, Thực Thương), thời cơ kinh doanh và khả năng tụ tài.`,
    `3. **Luận giải Tình Duyên & Gia Đạo**: Tương quan cung Thê/Phu (chi ngày), thời điểm thuận lợi và lời khuyên hòa hợp.`,
    `4. **Dự báo Vận Hạn Đại Vận & Lưu Niên ${viewYear}**: Phân tích cơ hội, rủi ro của đại vận hiện tại cùng lưu niên năm ${viewYear}.`,
    `5. **Phương pháp Cải Mệnh theo Dụng Thần**: Hướng dẫn ứng dụng màu sắc, phương hướng, nghề nghiệp, phong thủy để cân bằng sinh khí.`,
    "",
    `---`,
    "",
    `## GỢI Ý CÂU HỎI CHO AI (BÁT TỰ TỨ TRỤ):`,
    `- "Phân tích chi tiết hơn về cấu trúc Bát Tự, Dụng Thần và Hỷ Thần."`,
    `- "Phân tích chi tiết Bát Tự mạnh yếu và tìm Dụng Thần hợp lý nhất."`,
    `- "Phân tích vận trình các đại vận 10 năm và lưu niên năm ${viewYear}."`,
    `- "Các vấn đề nổi bật cần lưu ý của lá số về: sức khỏe, tình duyên, sự nghiệp, tài chính..."`,
  ].join("\n");
}

/**
 * Tạo Markdown chuyên biệt cho LÁ SỐ HÀ LẠC BÁT QUÁI
 */
export function buildHaLacMarkdownForAi(opts: ChartAiMarkdownOptions): string {
  const {
    name,
    gender,
    date,
    time,
    viewYear,
    locationName,
    latitude,
    longitude,
    utcOffset,
    haLac,
    baziChart,
  } = opts;

  if (!haLac) {
    return `# LÁ SỐ HÀ LẠC BÁT QUÁI · ${name.toUpperCase()}\n\nChưa có đủ dữ liệu tính toán quẻ Hà Lạc.`;
  }

  const solarDateStr = `${date.split("-").reverse().join("/")} ${time}`;
  const appliedTimeText = baziChart?.calculation.appliedTime || time;

  return [
    `# LÁ SỐ HÀ LẠC BÁT QUÁI · ${name.toUpperCase()}`,
    "",
    `> **Trường phái thiết lập**: Bát Tự Hà Lạc (Hà Đồ Lạc Thư Mệnh Lý)`,
    `> **Tôn chỉ phương pháp**: Hóa giải can chi Bát Tự thành số Tiên Thiên Hà Đồ và Hậu Thiên Lạc Thư, phối thành Quẻ Tiền Thiên (gốc rễ nửa đời đầu) và Quẻ Hậu Thiên (kết quả nửa đời sau), định hào Nguyên Khí và quỹ đạo hành xử.`,
    "",
    `---`,
    "",
    `## 1. THÔNG TIN BẢN MỆNH & KHÍ SỐ HÀ LẠC`,
    `- **Họ và tên**: ${name}`,
    `- **Giới tính**: ${gender}`,
    `- **Ngày sinh Dương lịch**: ${solarDateStr} (Chân giờ: ${appliedTimeText})`,
    `- **Tọa độ & Nơi sinh**: ${locationName} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E) · UTC+${utcOffset}`,
    `- **Tổng số Dương**: ${haLac.totals.yang} | **Tổng số Âm**: ${haLac.totals.yin}`,
    `- **Hóa Công**: ${haLac.hoaCong} | **Thiên Nguyên Khí**: ${haLac.thienNguyen} | **Địa Nguyên Khí**: ${haLac.diaNguyen}`,
    `- **Năm xem / Lưu niên**: Năm ${viewYear}`,
    "",
    `---`,
    "",
    `## 2. QUẺ TIỀN THIÊN (TIỀN VẬN NỬA ĐẦU ĐỜI · CĂN BẢN)`,
    `- **Quẻ Tiền Thiên**: **${haLac.preHeaven.name}**`,
    `- **Ý nghĩa Tiền Thiên**: Đại diện cho tư chất bẩm sinh, gia thế cội nguồn, tính cách thời niên thiếu và nền móng phát triển ban đầu.`,
    `- **Cấu trúc 6 Hào Tiền Thiên**:`,
    haLac.preHeaven.lines.map((l) => `  + Hào ${l.position}: ${l.isOriginal ? "Hào Nguyên Khí" : "Hào Phối"} ${l.startAge ? `(Vận từ ${l.startAge} - ${l.endAge} tuổi)` : ""}`).join("\n"),
    "",
    `---`,
    "",
    `## 3. QUẺ HẬU THIÊN (HẬU VẬN NỬA SAU ĐỜI · KẾT QUẢ)`,
    `- **Quẻ Hậu Thiên**: **${haLac.postHeaven.name}**`,
    `- **Ý nghĩa Hậu Thiên**: Đại diện cho sự chuyển hóa của vận mệnh từ tuổi trung niên về già, kết quả của sự tu dưỡng và thành tựu chung cuộc.`,
    `- **Cấu trúc 6 Hào Hậu Thiên**:`,
    haLac.postHeaven.lines.map((l) => `  + Hào ${l.position}: ${l.isOriginal ? "Hào Nguyên Khí" : "Hào Phối"} ${l.startAge ? `(Vận từ ${l.startAge} - ${l.endAge} tuổi)` : ""}`).join("\n"),
    "",
    `---`,
    "",
    `## 4. YÊU CẦU DÀNH CHO AI LUẬN GIẢI HÀ LẠC`,
    `Bạn là chuyên gia Dịch học và Hà Lạc Mệnh Lý cao cấp. Dựa trên số Âm Dương và 2 quẻ Tiền Thiên / Hậu Thiên ở trên:`,
    `1. Luận giải ý nghĩa quẻ Tiền Thiên đối với tư chất, thời niên thiếu và nền tảng gia đình của thân chủ.`,
    `2. Luận giải sự biến hóa sang quẻ Hậu Thiên đối với công danh, sự nghiệp, tài lộc và hậu vận.`,
    `3. Phân tích hào Nguyên Khí và đưa ra lời khuyên hành xử đắc thời đắc vị theo đạo Kinh Dịch.`,
    "",
    `---`,
    "",
    `## GỢI Ý CÂU HỎI CHO AI (HÀ LẠC BÁT QUÁI):`,
    `- "Phân tích ý nghĩa quẻ Tiền Thiên và hào Nguyên Khí đối với bản mệnh."`,
    `- "Sự chuyển hóa từ quẻ Tiền Thiên sang quẻ Hậu Thiên mang lại những cơ hội và thách thức gì?"`,
    `- "Hào vận nào trong quẻ Tiền Thiên/Hậu Thiên đang chi phối giai đoạn cuộc đời hiện tại?"`,
  ].join("\n");
}

/**
 * Tạo Markdown Tổng Hợp (Tử Vi & Tứ Trụ)
 */
export function buildCombinedChartMarkdownForAi(opts: ChartAiMarkdownOptions): string {
  const ziweiPart = buildZiweiMarkdownForAi(opts);
  const baziPart = buildBaziMarkdownForAi(opts);

  return [
    `# BÁO CÁO MỆNH LÝ TỔNG HỢP (TỬ VI & TỨ TRỤ) · ${opts.name.toUpperCase()}`,
    "",
    `> Bản tổng hợp kết hợp đa chiều giữa Tinh Bàn Tử Vi Đẩu Số (${opts.chartStyle || "Toàn Cục"}) và Bát Tự Tứ Trụ (Nhật Chủ, Dụng Thần, Vượng Suy).`,
    "",
    `---`,
    "",
    ziweiPart,
    "",
    `---`,
    "",
    baziPart,
  ].join("\n");
}

/**
 * Hàm điều phối chính: Chọn đúng loại Markdown cho AI theo loại lá số và trường phái thiết lập
 */
export function buildChartMarkdownForAi(
  opts: ChartAiMarkdownOptions,
  chartType: "ziwei" | "bazi" | "halac" | "combined" = opts.chartStyle === "Tứ Trụ" || opts.isFourPillarsMode ? "bazi" : "ziwei",
): string {
  // Nếu kiểu lá số là Tứ Trụ mà chartType là ziwei, tự động chuyển hướng sang Bát Tự
  if (opts.chartStyle === "Tứ Trụ" && chartType === "ziwei") {
    return buildBaziMarkdownForAi(opts);
  }

  switch (chartType) {
    case "ziwei":
      return buildZiweiMarkdownForAi(opts);
    case "bazi":
      return buildBaziMarkdownForAi(opts);
    case "halac":
      return buildHaLacMarkdownForAi(opts);
    case "combined":
      return buildCombinedChartMarkdownForAi(opts);
    default:
      return opts.chartStyle === "Tứ Trụ" || opts.isFourPillarsMode ? buildBaziMarkdownForAi(opts) : buildZiweiMarkdownForAi(opts);
  }
}
