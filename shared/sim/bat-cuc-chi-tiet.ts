/**
 * Bảng Bát Cực Linh Số của khách (trang 28–29 tài liệu SGEN, gửi qua Zalo 26/10/2026): 8 sao, mỗi sao 5 cột
 * Ý nghĩa · Tài chính · Sự nghiệp · Sức khỏe · Mối quan hệ, kèm điểm và các cặp số.
 *
 * - Thẻ cặp số ở trang Bói sim hiện cột "Ý nghĩa"; rê chuột / bấm vào thẻ hiện đủ 5 cột.
 * - Màu chữ tên sao theo khách: Sinh Khí, Thiên Y, Diên Niên đỏ; Phục Vị xanh; Tuyệt Mệnh, Ngũ Quỷ, Họa Hại, Lục Sát đen.
 * - Chép nguyên văn từ ảnh, chỉ sửa lỗi gõ hiển nhiên: "Qúy" → "Quý", "tỉ mĩ" → "tỉ mỉ", "tiêu sài" → "tiêu xài",
 *   "Qua bảo thủ" → "Quá bảo thủ", "cảm tình cầu người khác" → "cảm tình của người khác", "thẳng thắng" → "thẳng thắn",
 *   "thiên ý" → "Thiên Y", "thị thi" → "thị phi".
 * - `score` là điểm in trên bảng của khách để hiển thị; điểm chấm Bát Cực của công cụ vẫn tính theo `BCLS_SCORES`.
 */

export type BatCucTone = "cat" | "binh" | "hung";

export type BatCucDetail = {
  code: string;
  name: string;
  tone: BatCucTone;
  /** Điểm in trên bảng: "+4" … "-4". */
  score: string;
  /** Các cặp số của sao theo bảng của khách. */
  pairs: string[];
  meaning: string;
  finance: string;
  career: string;
  health: string;
  relationships: string;
};

export const BAT_CUC_COLUMNS = [
  { key: "meaning", label: "Ý nghĩa" },
  { key: "finance", label: "Tài chính" },
  { key: "career", label: "Sự nghiệp" },
  { key: "health", label: "Sức khỏe" },
  { key: "relationships", label: "Mối quan hệ" },
] as const;

const pairs = (list: string) => list.split("-").map((item) => item.trim());

export const BAT_CUC_DETAILS: Record<string, BatCucDetail> = {
  SK: {
    code: "SK",
    name: "Sinh Khí",
    tone: "cat",
    score: "+4",
    pairs: pairs("14 - 41 - 67 - 76 - 39 - 93 - 28 - 82"),
    meaning: "Nhiều Quý Nhân, gặp dữ hóa lành, chuyển nguy thành an. PHÁT TÀI",
    finance: "Quý Nhân mang Tài đến và có tiền ngoài ý muốn.",
    career:
      "Nhiều Quý Nhân trợ giúp, gặp dữ hóa lành, không hao tổn nhiều tâm trí. Thích hợp làm công tác xã hội, PR. Từ trường quá mạnh sẽ không có chủ kiến và không có lòng cầu tiến.",
    health: "Chú ý bệnh dạ dày, tai mắt mũi.",
    relationships: "Không cưỡng cầu, tùy duyên, không so đo, quan hệ hài hòa, hôn nhân ngọt ngào.",
  },
  TY: {
    code: "TY",
    name: "Thiên Y",
    tone: "cat",
    score: "+3",
    pairs: pairs("13 - 31 - 68 - 86 - 49 - 94 - 27 - 72"),
    meaning: "Thông Minh, Thiện Lương, hào phóng, thích trợ giúp người. TÀI PHÚ",
    finance: "Tài vận không cần lo sẽ có Bát Phương Tài. Có thể mang đến Tài Phú và Công Trạng.",
    career:
      "Có thể thành đại sự, trở thành Ông chủ hoặc cánh tay đắc lực của ông chủ, công trạng tốt, thích tìm hiểu về con người, giác quan thứ 6 mạnh.",
    health: "Chú ý huyết áp, tuần hoàn máu và tai mắt mũi.",
    relationships: "Dễ gặp đối tượng lý tưởng, tình cảm ân ái ngọt ngào. Luôn có thể mang đến Tài vận tốt cho người khác.",
  },
  DN: {
    code: "DN",
    name: "Diên Niên",
    tone: "cat",
    score: "+2",
    pairs: pairs("19 - 91 - 78 - 87 - 34 - 43 - 26 - 62"),
    meaning:
      "Thiện lương, trách nhiệm xử lý công việc theo chính đạo. Cái tôi lớn, thích sĩ diện, tâm tính lão đại, lòng từ bi. SỰ NGHIỆP & GIA ĐẠO ổn định",
    finance: "Rất cẩn thận trong việc tiền bạc, không bao giờ lãng phí, tính toán tỉ mỉ. Giữ tiền rất giỏi, không dễ tiêu xài.",
    career: "Có năng lực chuyên nghiệp, làm lãnh đạo và kỹ thuật, mọi thứ tự thân, lao lực, áp lực lớn, một mình gánh vác một phương.",
    health: "Chú ý cổ vai gáy, eo. Ngủ đúng giờ giấc và thiền định để tinh thần thoải mái.",
    relationships: "Chân thành, chung thủy một lòng. Yêu cầu về mối quan hệ cũng rất cao, thà thiếu không ẩu.",
  },
  PV: {
    code: "PV",
    name: "Phục Vị",
    tone: "binh",
    score: "+1",
    pairs: pairs("11 - 22 - 33 - 44 - 66 - 77 - 88 - 99"),
    meaning: "Kiên Nhẫn và nghị lực nhưng cứng nhắc, bảo thủ, cố chấp, sợ mạo hiểm, sợ bị tổn thương. CHỊU ĐỰNG & CHỜ ĐỢI.",
    finance: "Kiếm tiền hạnh khổ, thích cầm tiền lương ổn định, thu nhập ổn định.",
    career:
      "Thích làm việc có tính ổn định cao, gò bó theo khuôn phép không thay đổi. Kiên nhẫn chờ đợi thời cơ và bảo thủ nên dễ mất đi nhiều cơ hội.",
    health: "Lo nghĩ nhiều. Chú ý tim và não.",
    relationships: "Quá bảo thủ trong mối quan hệ, tình cảm và có thể kiên nhẫn chờ đợi.",
  },
  LS: {
    code: "LS",
    name: "Lục Sát",
    tone: "hung",
    score: "-1",
    pairs: pairs("16 - 61 - 47 - 74 - 38 - 83 - 29 - 92"),
    meaning: "Thông minh, khéo léo, giỏi về giao tế. Tình cảm phong phú. ĐÀO HOA",
    finance: "Dựa vào mối quan hệ để kiếm tiền nhưng không giữ được tiền.",
    career:
      "Không chịu được áp lực, đụng chút áp lực sẽ lựa chọn tránh đi. Xử lý công việc bằng tình cảm và rất giỏi chiếm được cảm tình của người khác.",
    health: "Dễ nóng nảy. Chú ý dạ dày, da và bệnh tự kỷ.",
    relationships: "Tình cảm phong phú, có duyên với người khác phái mạnh, Đào Hoa nhưng không dễ nở hoa kết trái.",
  },
  NQ: {
    code: "NQ",
    name: "Ngũ Quỷ",
    tone: "hung",
    score: "-2",
    pairs: pairs("18 - 81 - 79 - 97 - 36 - 63 - 24 - 42"),
    meaning:
      "Thông minh, phản ứng nhanh, nhiều ý đồ xấu, thay đổi thất thường, hay nghi ngờ, không dễ tin người, cảm giác không an toàn. BIẾN ĐỘNG",
    finance: "Quản lý tài sản và tiền tài không được tốt.",
    career: "Thường xuyên biến động, không an phận, làm các việc như buôn bán, đi lại nhiều.",
    health: "Chú ý bệnh về Tim, tuần hoàn máu. Ngũ Quỷ cao kết hợp Tuyệt Mệnh dễ bị ung thư.",
    relationships: "Tình cảm hay thay đổi, không an phận, dễ có quan hệ tay ba, ngoại tình, ly hôn.",
  },
  HH: {
    code: "HH",
    name: "Họa Hại",
    tone: "hung",
    score: "-3",
    pairs: pairs("17 - 71 - 89 - 98 - 46 - 64 - 23 - 32"),
    meaning: "Biết ăn nói, thẳng thắn, mạnh miệng, thích sĩ diện, nóng tính hay phàn nàn. Dễ bị TIỂU NHÂN quấy phá",
    finance: "Mở miệng được Tài (kết hợp với Thiên Y mới có) nhưng khó giữ được tiền. Dễ vì cãi vã mà Phá tài.",
    career:
      "Làm các công việc liên quan đến giao tiếp, nói nhiều làm ít, thích chỉ huy người khác làm việc. Dễ cãi vã thị phi, hay oán trách.",
    health: "Sức đề kháng yếu, dễ bị tai nạn xe cộ, các bệnh liên quan đến khoang miệng, khí quản, yết hầu.",
    relationships: "Đầu tiên thì ngon ngọt sau đó hai bên dễ cãi vã thị phi, có thể dẫn đến Ly Hôn.",
  },
  TM: {
    code: "TM",
    name: "Tuyệt Mệnh",
    tone: "hung",
    score: "-4",
    pairs: pairs("12 - 21 - 69 - 96 - 48 - 84 - 37 - 73"),
    meaning: "Phản ứng nhanh, có khả năng phán đoán. Lòng háo thắng mạnh, ít khi chịu thua. Mạo hiểm, thích cờ bạc. PHÁ TÀI",
    finance: "Kiếm tiền nhanh nhưng giữ tiền không tốt. Nên nhờ người khác thủ tài.",
    career:
      "Thích làm về đầu tư, tài chính, cổ phiếu, hoặc tự mình lập nghiệp. Rất liều lĩnh, mạo hiểm và quyết định cảm tính. EQ kém, phải ở trạng thái ổn định cảm xúc mới phát huy năng lực tốt.",
    health: "Chú ý Gan, Thận, Bệnh Tiểu Đường. Thậm chí bị tai nạn xe cộ, chết ngoài ý muốn, bệnh ung thư.",
    relationships:
      "Tình cảm không dễ có kết quả, sau khi cưới năng lực cân đối gia đình cũng không giỏi, không dễ chia sẻ với người bạn đời, hay cực đoan, hay tự cho mình là đúng, dễ ly hôn.",
  },
};
