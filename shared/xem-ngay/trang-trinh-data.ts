/**
 * Bát Thập Tam Mục (83 mục việc) theo giáo trình của khách ("Giáo trình Trạch Cát Trạng Trình và Đổng Công").
 * File sinh tự động bằng scripts/extract_trach_cat.py — không sửa tay.
 *
 * Mỗi mục giữ đúng thứ tự nội dung trong giáo trình: đoạn văn (`text`), bảng Can → Chi ngày tốt (`days`) và các
 * bảng khác giữ nguyên ô (`grid`). Ô rỗng của bảng là chuỗi rỗng; xuống dòng trong ô là "\n".
 */

export type TrangTrinhBlock =
  | { kind: "text"; lines: string[] }
  | { kind: "days"; days: Record<string, string[]> }
  | { kind: "grid"; rows: string[][] };

export type TrangTrinhContent = { title: string; blocks: TrangTrinhBlock[] };

export const TRANG_TRINH_CONTENT: Record<number, TrangTrinhContent> = {
  1: {
    title: "Đại Minh Nhật",
    blocks: [
      {"kind": "text", "lines": ["Phàm muốn tạo ra 1 vật, xây dựng 1 công trình, khởi công bất cứ việc gì.", "Nên chọn trong 21 ngày được xem là Đại Minh sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Thân"], "Ất": ["Tị", "Mùi"], "Bính": ["Thìn", "Ngọ"], "Đinh": ["Sửu", "Hợi"], "Kỷ": ["Mẹo", "Mùi", "Dậu"], "Canh": ["Thân", "Tuất"], "Tân": ["Mùi", "Dậu", "Hợi"], "Nhâm": ["Dần", "Thìn", "Ngọ", "Thân"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["Đại Minh là cái sáng rộng lớn lúc Trời Đất khai thông, Thái Dương chiếu đến. Vậy nên trăm việc dùng ngày Đại Minh tất được sự tốt đến."]},
    ],
  },
  2: {
    title: "Khởi Tạo",
    blocks: [
      {"kind": "text", "lines": ["Phàm khởi đầu, chế tạo, xây đắp hay dựng nên 1 sự vật gì như cất nhà hay đóng thuyền chẳng hạn.", "Muốn thành công và thuận lợi trong mai sau thì nên chọn trong 10 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tuất"], "Ất": ["Mẹo", "Dậu", "Hợi"], "Kỷ": ["Tị", "Mùi", "Dậu"], "Tân": ["Mùi"], "Nhâm": ["Tý", "Thân"]}},
      {"kind": "text", "lines": ["Nên chọn ngày có Trực Thành, Khai rất tốt."]},
    ],
  },
  3: {
    title: "Tu Tạo",
    blocks: [
      {"kind": "text", "lines": ["Tu là sửa sang, sửa đổi thêm bớt. Tạo là làm ra. Có 8 ngày Đại Du Tu. Những ngày này các Hung Thần đều về chầu Thượng Đế nhân đó mình nên trộm tu tạo việc chi cũng không bị trở ngại. 8 ngày đó là:"]},
      {"kind": "days", "days": {"Bính": ["Thìn"], "Đinh": ["Tị"], "Mậu": ["Ngọ"], "Kỷ": ["Mùi"], "Canh": ["Thân"], "Tân": ["Dậu"], "Nhâm": ["Tý"], "Quý": ["Sửu"]}},
      {"kind": "text", "lines": ["Tám ngày trên đây có 2 ngày kế tiếp nhau và 6 ngày kế tiếp nhau. Vậy tu tạo việc chi phải làm cho xong 2 ngày liên tiếp (hay 6 ngày liên tiếp đó) không nên để trễ qua ngày khác. Vì 8 ngày này chính là sửa chữa hơn tạo ra. Ý nghĩa Du Tu là trộm sửa chữa. Nếu ta làm lấn qua ngày khác thì Hung Thần đã xuống trần e không tốt vậy."]},
    ],
  },
  4: {
    title: "Lợp Nhà, Che Mái, Làm Nóc",
    blocks: [
      {"kind": "text", "lines": ["Lợp nhà che hiên che mái làm mui ghe, lợp mui ghe làm, các loại nóc để che mưa che nắng. Nên chọn trong 23 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thìn", "Thân"], "Ất": ["Tị", "Mùi", "Dậu"], "Mậu": ["Tý", "Dần", "Thìn", "Thân"], "Kỷ": ["Sửu", "Mẹo", "Dậu", "Hợi"], "Canh": ["Dần"], "Tân": ["Sửu", "Hợi"], "Nhâm": ["Tý"], "Quý": ["Mẹo", "Tị", "Mùi", "Dậu"]}},
    ],
  },
  5: {
    title: "Động Thổ Ban Nền",
    blocks: [
      {"kind": "text", "lines": ["Trước khi cất nhà hay xây dựng 1 công trình nào phải dọn 1 chỗ tất có sự động đất.", "Động đất là như cuốc đào xới đất khiến cho bằng phẳng để làm nền xây dựng.", "Vậy nên chọn trong 15 ngày tốt khởi công:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn", "Ngọ", "Thân"], "Bính": ["Thân", "Tuất"], "Mậu": ["Dần", "Tuất"], "Kỷ": ["Mẹo", "Hợi"], "Canh": ["Tý", "Thìn"], "Tân": ["Tị"], "Quý": ["Sửu", "Dậu"]}},
      {"kind": "text", "lines": ["Nên chọn ngày có Trực Trừ, Định, Chấp, Thành, Khai.", "Nên chọn ngày có Kiết Tinh Thiên Đức, Nguyệt Đức, Thiên Ân, Hoàng Đạo, Nguyệt Không.", "Kị các ngày có Trực Kiên, Phá, Bình, Thâu.", "Kị các ngày có Hung tinh Thổ ôn, Thổ Cấm, Thổ Phủ, Thổ Kị, Thiên Tặc, Cửu Thổ Quỷ, Thiên Địa Chuyển Sát."]},
      {"kind": "text", "lines": ["Ngày Quý Mùi, Ất Mùi, Mậu Ngọ Đại Kị Động Thổ."]},
    ],
  },
  6: {
    title: "Xây Đắp Nền Tường",
    blocks: [
      {"kind": "text", "lines": ["Xây đắp nền nhà, dinh thự, chùa chiền. Hoặc xây đắp tường vách.", "Nên chọn trong 20 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thân"], "Ất": ["Sửu", "Mẹo", "Mùi"], "Bính": ["Ngọ"], "Đinh": ["Mẹo", "Mùi", "Dậu"], "Mậu": ["Thìn"], "Kỷ": ["Mẹo", "Hợi"], "Canh": ["Ngọ", "Thân"], "Tân": ["Tị", "Mùi", "Dậu"], "Nhâm": ["Tý"], "Quý": ["Sửu"]}},
      {"kind": "text", "lines": ["Nên chọn ngày có Trực Trừu, Định, Chấp, Thành, Khai.", "Nên chọn ngày có Kiết Tinh Thiên Đức, Nguyệt Đức, Thiên Ân, Hoàng Đạo, Nguyệt Không.", "Kị các ngày có Trực Kiên, Phá, Bình, Thâu.", "Kị các ngày có Hung tinh Thổ ôn, Thổ Cấm, Thổ Phủ, Thổ Kị, Thiên Tặc, Cửu Thổ Quỷ, Thiên Địa Chuyển Sát."]},
      {"kind": "text", "lines": ["Riêng Mục Xây Đắp Tường Vách nên gặp Trực Bế.", "Đại Kị 3 ngày Ất Mùi, Mậu Ngọ, Quý Mùi."]},
    ],
  },
  7: {
    title: "Khởi Công Làm Giàn Gác",
    blocks: [
      {"kind": "text", "lines": ["Trong mục cất nhà thường có làm gác.", "Giàn là như giản trò, giàn bếp, cất giàn để xây dựng cao ốc. Gác là sàn gác, gác lửng, lầu…", "Khởi công làm giàn gác nên chọn trong 23 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thân", "Tuất"], "Ất": ["Mẹo", "Mùi", "Dậu", "Hợi"], "Bính": ["Ngọ"], "Mậu": ["Tý", "Dần", "Thân"], "Kỷ": ["Mẹo", "Tị", "Mùi", "Dậu", "Hợi"], "Canh": ["Dần", "Thân"], "Tân": ["Mùi", "Dậu"], "Nhâm": ["Tý", "Dần", "Ngọ"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Nên chọn ngày có Sao Thiên Đức, Nguyệt Không.", "Kị các ngày có Hung Tinh Thiên Tặc, Địa Tặc, Hỏa Tinh, Nguyệt Phá, Tứ Tuyệt, Xích Khẩu, Đại Không Vong, Tiểu Không Vong, Phủ Đầu Sát, Mộc Mã Sát, Đao Châm Sát, Phá Bại Nhật, Chính Tứ Phế, Thiên Địa Chuyển Sát, Hoang Vô."]},
    ],
  },
  8: {
    title: "Đặt Táng",
    blocks: [
      {"kind": "text", "lines": ["Ngày đặt táng để dựng cột hoặc gắn cửa kê gác…nên chọn trong 39 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thân", "Tuất"], "Ất": ["Sửu", "Mẹo", "Mùi", "Hợi"], "Bính": ["Dần", "Thìn", "Ngọ"], "Đinh": ["Tị", "Dậu", "Hợi"], "Mậu": ["Tý", "Dần", "Thìn", "Thân", "Tuất"], "Kỷ": ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu", "Hợi"], "Canh": ["Tý", "Dần", "Ngọ", "Thân"], "Tân": ["Tị", "Mùi", "Dậu"], "Nhâm": ["Tý", "Dần", "Ngọ"], "Quý": ["Sửu", "Mẹo", "Tị", "Mùi"]}},
      {"kind": "text", "lines": ["Nên gặp các Trực Mãn, Bình, Thành, Khai.", "Nên chọn các ngày có sao Thiên Đức, Nguyệt Đức, Thiên Đức Hợp, Nguyệt Đức Hợp, Thiên Phúc, Thiên Phú, Thiên Ân, Nguyệt Ân.", "Kị các ngày có Hung tinh: Chánh Tứ Phế, Thiên Tặc, Địa Tặc, Thiên Hỏa, Địa Hỏa."]},
    ],
  },
  9: {
    title: "Dựng Cột",
    blocks: [
      {"kind": "text", "lines": ["Dựng cột nên chọn trong 4 ngày Dần Thân Tị Hợi vì 4 ngày này gọi là Tứ Trụ."]},
      {"kind": "days", "days": {"Bính": ["Dần"], "Mậu": ["Thân"], "Kỷ": ["Hợi"], "Tân": ["Tị"]}},
      {"kind": "text", "lines": ["Nhưng chọn được 4 ngày trên đây thì tốt hơn những ngày Dần Thân Tị Hợi khác."]},
    ],
  },
  10: {
    title: "Gác Đòn Đông",
    blocks: [
      {"kind": "text", "lines": ["Trước tiên nên nói rõ cái tên của nó. Thực ra ngày xưa người ta làm nhà là Tọa Nam - Hướng Bắc. Nên trục ngang của nhà là trục Đông Tây thành thử chính xác phải gọi nó là Đòn Đông chứ không phải Đòn Dông như hiện nay. Có lẽ thời gian mà thành chữ \"Dông\" vậy.", "Trong các mục thuộc về cất nhà thì gác Đòn Đông hệ trọng nhất. Vì nó là nơi cao thượng hơn hết của cái nhà. Muốn nhà ở được yên ổn và thịnh tiến nên chọn trong 36 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Ngọ", "Thân", "Tuất"], "Ất": ["Sửu", "Mẹo", "Tị"], "Bính": ["Tý", "Thân", "Tuất"], "Đinh": ["Mẹo", "Tị", "Mùi", "Dậu"], "Mậu": ["Tý", "Dần", "Thìn", "Tuất"], "Kỷ": ["Tị", "Mùi", "Dậu", "Hợi"], "Canh": ["Tý", "Dần", "Thìn", "Ngọ"], "Tân": ["Sửu", "Mùi", "Dậu", "Hợi"], "Nhâm": ["Dần", "Ngọ", "Thân"], "Quý": ["Hợi", "Sửu", "Mẹo"]}},
      {"kind": "text", "lines": ["Nên chọn các Trực Mãn, Bình, Thành, Khai.", "Nên chọn các sao Thiên Đức, Thiên Đức, Thiên Đức Hợp, Nguyệt Đức Hợp, Thiên Phúc, Thiên Phú, Thiên Ân, Nguyệt Ân.", "Kị các ngày có Hung tinh: Chánh Tứ Phế, Thiên Tặc, Địa Tặc, Thiên Hỏa, Địa Hỏa.", "Chú Ý: Trong ngày dựng cột nếu kịp lúc Gác Đòn Đông thì gác luôn khỏi chọn ngày Gác Đòn Đông vẫn tốt như thường."]},
    ],
  },
  11: {
    title: "Làm Cửa",
    blocks: [
      {"kind": "text", "lines": ["Làm cửa, trổ cửa, gắn cửa nên chọn có số ngày trong tháng sau:"]},
      {"kind": "grid", "rows": [["Tiểu Nguyệt\n(Tháng Thiếu)", "Đại Nguyệt\n(Tháng Đủ)"], ["1, 2, 6, 7, 11, 12, 13, 17, 18, 19, 23, 24, 28, 29.", "1, 2, 3, 7, 8, 12, 13, 14, 18, 19, 20, 24, 25, 29, 30"]]},
      {"kind": "text", "lines": ["Chú Ý: Ngày Canh Dần chẳng nên làm cửa lớn."]},
    ],
  },
  12: {
    title: "Làm Kho Lẫm",
    blocks: [
      {"kind": "text", "lines": ["Làm nhà kho để tàng trữ hàng hóa vật phẩm phải chọn ngày tốt tùy theo mùa."]},
      {"kind": "grid", "rows": [["Mùa Xuân", "Mùa Hạ", "Mùa Thu", "Mùa Đông"], ["Đinh Tị\nĐinh Mùi\nKỷ Tị", "Giáp Ngọ\nKỷ Tị", "Nhâm Ngọ\nẤt Hợi", "Ất Mùi\nẤt Hợi\nBính Thìn\nCanh Dần\nTân Mùi\nNhâm Thìn"]]},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành, Khai rất tốt cho việc làm kho vựa."]},
    ],
  },
  13: {
    title: "Sửa Chữa Kho Lẫm",
    blocks: [
      {"kind": "text", "lines": ["Kho vựa chứa hàng hóa có chỗ hư yếu nay muốn tu bổ lại cho đáo bền chắc.", "Nên chọn trong 7 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Ngọ"], "Ất": ["Sửu", "Mùi"], "Bính": ["Dần"], "Đinh": ["Mẹo"], "Nhâm": ["Ngọ"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Mãn"]},
    ],
  },
  14: {
    title: "Đem Ngũ Cốc Vào Kho",
    blocks: [
      {"kind": "text", "lines": ["Ngũ cốc là 5 thứ gạo thực ra là ý chỉ chung các loại hàng nông sản vậy.", "Muốn mang nó vào kho lẫm cất cho yên ổn khỏi bị khuấy phá hư hao nên chọn trong 9 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Ất": ["Dậu"], "Kỷ": ["Sửu", "Mẹo"], "Canh": ["Dần", "Ngọ"], "Tân": ["Tị"], "Nhâm": ["Ngọ"], "Quý": ["Mùi", "Mẹo"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Mãn, Bình, Thu.", "Nên chọn các ngày có Kiết Tinh: Thiên Đức, Nguyệt Đức."]},
    ],
  },
  15: {
    title: "Về Nhà Mới, Chuyển Chỗ Ở",
    blocks: [
      {"kind": "text", "lines": ["Muốn dọn vào nhà mới cất xong hoặc chuyển về chỗ ở mới (mới mua mới sang mới mướn…)", "Rất cần chọn trong 21 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn"], "Ất": ["Sửu", "Mùi", "Dậu"], "Bính": ["Dần", "Thìn", "Ngọ"], "Đinh": ["Sửu", "Tị"], "Mậu": ["Dần", "Thìn"], "Canh": ["Dần", "Ngọ"], "Tân": ["Hợi"], "Nhâm": ["Dần", "Thìn", "Tuất"], "Quý": ["Sửu", "Mẹo", "Tị"]}},
    ],
  },
  16: {
    title: "Làm Nhà Bếp Hay Sửa Chữa Nhà Bếp",
    blocks: [
      {"kind": "text", "lines": ["Muốn xây dựng nhà Bếp hay sửa chữa nhà Bếp nên chọn trong 12 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Ất": ["Mẹo", "Dậu"], "Bính": ["Dần"], "Mậu": ["Dần"], "Kỷ": ["Mẹo", "Tị", "Mùi"], "Canh": ["Thân"], "Tân": ["Mùi"], "Nhâm": ["Tý"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Định, Thành, Khai"]},
      {"kind": "text", "lines": ["Chú ý: Chớ lầm xây nhà Bếp với xây Bếp 2 ngày này khác nhau."]},
    ],
  },
  17: {
    title: "Xây Bếp",
    blocks: [
      {"kind": "text", "lines": ["Xây Bếp là xây cái Bếp. Ngày xưa người ta không dùng Bếp giống hiện nay mà phải xây 1 cái bệ để đặt cà ràng lên nấu. Làm cái khuôn Bếp đặt lò hay cà ràng lên nấu ăn. Bếp là chỗ nấu ăn rất quan trọng vì ăn để bổ dưỡng, với ăn để sinh bệnh khác nhau.", "Vậy nên chọn trong 18 ngày tốt dưới đây để xây Bếp, đặt Bếp:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thân", "Tuất"], "Ất": ["Sửu", "Mẹo", "Mùi", "Hợi"], "Kỷ": ["Tị", "Mùi"], "Canh": ["Ngọ", "Thân"], "Tân": ["Mùi", "Hợi"], "Nhâm": ["Thìn"], "Quý": ["Sửu", "Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Hoặc nên chọn ngày tốt tùy có tháng như sau:"]},
      {"kind": "grid", "rows": [["Tháng", "01, 02", "03, 04", "05, 06", "07, 08", "09, 10", "11, 12"], ["Chi", "Tuất\nSửu", "Tý\nMẹo", "Dần\nTị", "Thìn\nMùi", "Ngọ\nDậu", "Thân\nHợi"]]},
      {"kind": "text", "lines": ["Đây chỉ là các ngày căn bản thông thường. Thực ra yếu quyết về chọn ngày làm Bếp phải căn cứ tuổi và hoàn cảnh Nữ Trạch Chủ."]},
    ],
  },
  18: {
    title: "Thờ Phụng Táo Thần",
    blocks: [
      {"kind": "text", "lines": ["Tế lễ ông Táo lập trang thờ ông Táo nên chọn trong 21 ngày sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Thân", "Tuất"], "Ất": ["Dậu", "Mẹo", "Hợi"], "Bính": ["Ngọ"], "Đinh": ["Mẹo", "Dậu", "Hợi"], "Kỷ": ["Mẹo", "Dậu", "Hợi"], "Canh": ["Thìn"], "Tân": ["Dậu", "Hợi"], "Nhâm": ["Thân"], "Quý": ["Sửu", "Mẹo", "Dậu", "Hợi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Trừ, Thành, Khai."]},
    ],
  },
  19: {
    title: "Tạ Lễ Đất Đai",
    blocks: [
      {"kind": "text", "lines": ["Tạ thổ làm lễ cúng đất đai nên chọn trong 8 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Đinh": ["Sửu", "Mùi"], "Canh": ["Tý", "Ngọ"], "Quý": ["Tị", "Hợi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Trừ, Thành, Khai."]},
    ],
  },
  20: {
    title: "Lót Giường",
    blocks: [
      {"kind": "text", "lines": ["Việc ngủ nghỉ rất quan hệ đến sức khỏe và tính mệnh.", "Vậy lót giường tức là đặt cái giường tại nơi nào đó trong nhà cũng rất quan hệ như việc đóng ráp giường."]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thìn", "Tuất"], "Ất": ["Sửu", "Mẹo", "Tị", "Dậu"], "Bính": ["Tý", "Dần", "Thìn", "Ngọ", "Tuất"], "Đinh": ["Sửu", "Mẹo", "Tị", "Dậu", "Hợi"], "Mậu": ["Tý", "Ngọ", "Tuất"], "Kỷ": ["Tị", "Mùi", "Hợi"], "Canh": ["Tý", "Thìn", "Ngọ"], "Tân": ["Tị", "Mùi", "Dậu"], "Nhâm": ["Dần", "Tuất"], "Quý": ["Mẹo", "Tị"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Khai, Nguy.", "Nên kị các ngày có Trực: Kiên, Phá, Bình, Thâu."]},
      {"kind": "text", "lines": ["Đại Kị ngày có 8 Tinh Tú sau:", "Tâm, Vỹ, Cơ, Nguy, Khuê, Lâu, Mão, Sâm.", "Nếu phạm sẽ tai hại cho hài nhi 10 đưa hư 9 (nếu lót giường để sinh đẻ)."]},
    ],
  },
  21: {
    title: "Nạp Lễ Cầu Thân",
    blocks: [
      {"kind": "text", "lines": ["Hai họ nạp lễ để định làm thân làm xuôi gia với nhau hầu tính việc hôn nhân cho con cái mình cũng nên chọn ngày tốt để được thuận hợp trong mọi việc về sau. Có tất cả 18 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần"], "Ất": ["Mẹo"], "Bính": ["Dần", "Ngọ", "Tuất"], "Đinh": ["Mẹo", "Tị", "Mùi"], "Mậu": ["Tý", "Dần", "Ngọ"], "Kỷ": ["Mẹo", "Mùi"], "Nhâm": ["Tý", "Dần", "Thìn"], "Quý": ["Mẹo", "Tị"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Định, Thành.", "Nên chọn các ngày có Kiết Tinh: Huỳnh Đạo, Tam Hợp.", "", "Nên kị các ngày có Trực: Kiên, Phá.", "Nên kị các ngày có Hung Tinh: Hà Khôi, Câu Giảo."]},
    ],
  },
  22: {
    title: "Làm Lễ Cưới Hỏi, Lễ Đưa Rước Dâu Rễ",
    blocks: [
      {"kind": "text", "lines": ["Trong cuộc hôn nhân trước chọn ngày làm đám hỏi rồi mới chọn ngày cưới gả và chọn ngày đưa rước dâu rể. Thường thường ngày nay người ta làm chung trong 1 ngày: vừa cưới gả vừa đưa rước dâu rể.", "Các mục này đều nên chọn trong 11 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Ất": ["Tị"], "Bính": ["Tý", "Dần", "Tuất"], "Đinh": ["Mẹo"], "Mậu": ["Tý", "Dần"], "Kỷ": ["Mẹo"], "Canh": ["Dần"], "Nhâm": ["Dần"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành.", "Nên chọn các ngày có Kiết Tinh:", "Hoàng Đạo, Thiên Hỷ, Tục Thế, Ngũ Hợp, Thiên Thành, Ích Hậu, Thiên Phúc,Thiên Quan, Cát Khánh, Thiên Nguyệt Đức Hợp, và nhất là gặp ngày Bất Tương."]},
    ],
  },
  23: {
    title: "Ngày Bất Tương Nên Cưới Gả",
    blocks: [
      {"kind": "text", "lines": ["Cưới gả, nếu chọn được 1 ngày tốt có mục 22 mà ngày này lại trúng nhằm ngày Bất Tương nữa thì thật là may mắn. Như không chọn được ngày tốt trong mục 22 thì có thể chọn ngày tốt Bất Tương cũng rất tốt vậy. Ngày Bất Tương chiếu có Tiết Khí như sau:"]},
      {"kind": "text", "lines": ["Lập Xuân và Vũ Thủy"]},
      {"kind": "days", "days": {"Bính": ["Tý", "Dần"], "Đinh": ["Mẹo"], "Mậu": ["Tý"], "Kỷ": ["Mẹo"], "Canh": ["Dần"], "Tân": ["Mẹo"]}},
      {"kind": "text", "lines": ["Thanh Minh và Cốc Vũ"]},
      {"kind": "days", "days": {"Ất": ["Sửu"], "Đinh": ["Sửu", "Dậu"], "Kỷ": ["Sửu", "Dậu"]}},
      {"kind": "text", "lines": ["Lập Hạ và Tiểu Mãn"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân", "Tuất"], "Ất": ["Dậu"], "Bính": ["Tý", "Thân", "Tuất"], "Đinh": ["Dậu"], "Mậu": ["Tý", "Tuất"]}},
      {"kind": "text", "lines": ["Mang Chủng và Hạ Chí"]},
      {"kind": "days", "days": {"Giáp": ["Thân", "Tuất"], "Ất": ["Mùi", "Dậu"], "Bính": ["Thân", "Tuất"], "Mậu": ["Tuất"], "Kỷ": ["Mùi"], "Quý": ["Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Tiểu Thử và Đại Thử"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ", "Thân", "Tuất"], "Ất": ["Mùi", "Dậu"], "Mậu": ["Tuất"], "Kỷ": ["Mùi"], "Nhâm": ["Ngọ", "Thân", "Tuất"], "Quý": ["Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Lập Thu và Xử Thử"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ", "Thân"], "Ất": ["Tị", "Mùi", "Dậu"], "Mậu": ["Ngọ"], "Kỷ": ["Tị", "Mùi"], "Nhâm": ["Ngọ", "Thân"], "Quý": ["Tị", "Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Bạch Lộ và Thu Phân"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Ngọ", "Thân"], "Mậu": ["Thìn", "Ngọ"], "Kỷ": ["Tị"], "Tân": ["Tị", "Mùi"], "Nhâm": ["Thìn", "Ngọ"], "Quý": ["Tị", "Mùi"]}},
      {"kind": "text", "lines": ["Hàn Lộ và Sương Giáng"]},
      {"kind": "days", "days": {"Ất": ["Mẹo"], "Mậu": ["Ngọ"], "Kỷ": ["Tị", "Mùi"], "Canh": ["Ngọ"], "Tân": ["Tị", "Mùi"], "Nhâm": ["Ngọ"], "Quý": ["Mẹo", "Tị", "Mùi"]}},
      {"kind": "text", "lines": ["Lập Đông và Tiểu Tuyết"]},
      {"kind": "days", "days": {"Mậu": ["Dần", "Thìn", "Ngọ"], "Kỷ": ["Mẹo"], "Canh": ["Dần", "Thìn", "Ngọ"], "Tân": ["Mẹo"], "Nhâm": ["Dần", "Thìn", "Ngọ"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Đại Tuyết và Đông Chí"]},
      {"kind": "days", "days": {"Đinh": ["Sửu", "Mẹo", "Tị"], "Mậu": ["Thìn"], "Kỷ": ["Mẹo", "Tị"], "Canh": ["Thìn"], "Tân": ["Sửu", "Tị"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Tiểu Hàn và Đại Hàn"]},
      {"kind": "days", "days": {"Ất": ["Sửu"], "Bính": ["Dần", "Thìn"], "Đinh": ["Sửu", "Mẹo"], "Mậu": ["Dần", "Thìn"], "Kỷ": ["Mẹo"], "Canh": ["Dần", "Thìn"], "Tân": ["Sửu", "Mẹo"]}},
    ],
  },
  24: {
    title: "Những Tháng Lợi Hại Cưới Gả",
    blocks: [
      {"kind": "text", "lines": ["Tháng cưới gả có lợi có hại, nhưng thời nay nhiều người không xem trọng lắm, nhưng cũng xin ghi ra đây để tham khảo. Rất nhiều sách cho rằng đây là xét tuổi cô dâu để chọn tháng, thật ra là năm đám cưới để chọn tháng vậy. Cách tính như sau:"]},
      {"kind": "grid", "rows": [["Năm", "Tháng"], ["Mẹo, Dậu", "01 - 07", "06 - 12", "05 - 11", "04 - 10", "03 - 09", "02 - 08"], ["Dần, Thân", "02 - 08", "03 - 09", "04 - 10", "05 - 11", "06 - 12", "01 - 07"], ["Tị, Hợi", "03 - 09", "02 - 08", "01 - 07", "06 - 12", "05 - 11", "04 - 10"], ["Thìn, Tuất", "04 - 10", "05 - 11", "06 - 12", "01 - 07", "02 - 08", "03 - 09"], ["Sửu, Mùi", "05 - 11", "04 - 10", "03 - 09", "02 - 08", "01 - 07", "06 - 12"], ["Tý, Ngọ", "06 - 12", "01 - 07", "02 - 08", "03 - 09", "04 - 10", "05 - 11"], ["Ảnh\nHưởng", "ĐẠI\nLỢI", "TIỂU\nLỢI", "ÔNG\nCha Mẹ Chồng", "CÔ\nCha Mẹ Vợ", "PHU\nChú Rể", "THÊ\nCô Dâu"]]},
    ],
  },
  25: {
    title: "Tháng Sinh Nam Nữ Kị Cưới Nhau",
    blocks: [
      {"kind": "grid", "rows": [["Trai Sinh Tháng", "Kị Cưới Gái Sinh Tháng"], ["1, 7", "4, 10"], ["2, 8", "5, 11"], ["3, 9", "6, 12"], ["4, 10", "1, 7"], ["5, 11", "2, 8"], ["6, 12", "3, 9"]]},
    ],
  },
  26: {
    title: "Tuổi Con Trai Kị Năm Cưới Vợ",
    blocks: [
      {"kind": "grid", "rows": [["Tuổi\nNam", "Kị Năm\nCưới Vợ", "Tuổi\nNam", "Kị Năm\nCưới Vợ", "Tuổi\nNam", "Kị Năm\nCưới Vợ"], ["Tý", "Mùi", "Sửu", "Thân", "Dần", "Dậu"], ["Mẹo", "Tuất", "Thìn", "Hợi", "Tị", "Tý"], ["Ngọ", "Sửu", "Mùi", "Dần", "Thân", "Mẹo"], ["Dậu", "Thìn", "Tuất", "Tị", "Hợi", "Ngọ"]]},
    ],
  },
  27: {
    title: "Tuổi Con Gái Kị Năm Lấy Chồng",
    blocks: [
      {"kind": "grid", "rows": [["Tuổi\nNam", "Kị Năm\n\nCưới Vợ", "Tuổi\nNam", "Kị Năm\n\nCưới Vợ", "Tuổi\nNam", "Kị Năm\n\nCưới Vợ"], ["Tý", "Mẹo", "Sửu", "Dần", "Dần", "Sửu"], ["Mẹo", "Tý", "Thìn", "Hợi", "Tị", "Tuất"], ["Ngọ", "Dậu", "Mùi", "Thân", "Thân", "Mùi"], ["Dậu", "Ngọ", "Tuất", "Tị", "Hợi", "Thìn"]]},
      {"kind": "text", "lines": ["Ngưu Lang Chức Nữ", "", "Mùa Xuân nghe tiếng kim Kê", "Mùa Hè Thỏ chạy biệt tăm băng ngàn", "Thu Hầu, Đông Hổ lâm sàn", "Ngưu Lang Chức Nữ về đàn sao nên.", "", "Mùa Xuân kị ngày Dậu, Mùa Hè kị ngày Mão,", "Mùa Thu kị ngày Thân, Mùa Đông kị ngày Dần."]},
      {"kind": "text", "lines": ["Không Sàng", "", "Mùa Xuân, Rồng dậy non đoài", "Mùa Hạ, Dê chạy cho ai bồi hồi", "Mùa Thu, Chó sủa lôi thôi", "Màu Đông, Trâu lại cứ lôi kéo cày.", "", "Mùa Xuân kị ngày Thìn,", "Mùa Hè kị ngày Mùi,", "Mùa Thu kị ngày Tuất,", "Mùa Đông kị ngày Sửu."]},
      {"kind": "text", "lines": ["Không Phòng", "", "Xuân: Long, Xà, Thử thị Không Phòng", "", "Hạ: Khuyển, Trư, Dương nhơn tử vong", "", "Thu: Thố, Mã, Hổ phùng đại kị", "", "Đông: Kê, Ngưu, Hầu thị tán không", "", "Nam đáo nữ phòng, nam tắc tử", "", "Nữ đáo, nam phòng nữ tắc vong.", "", "Mùa Xuân kị các ngày Thìn, Tị, Tý", "", "Mùa Hạ kị các ngày Tuất, Hợi, Mùi", "", "Mùa Thu kị các ngày Mão, Ngọ, Dần", "", "Mùa Đông kị các ngày Dậu, Sửu, Thân."]},
      {"kind": "text", "lines": ["Cô Hư Sát", "", "Đây là tháng Kị cưới gả tính có tuổi nam nữ, nam kị ngày CÔ, nữ kị ngày Hư.", "", "- Các tuổi thuộc \"Tuần Giáp Tý\" (tức ngày Giáp Tý đến Quý Dậu):", "Nam Kị tháng 9, 10 là CÔ, Nữ Kị tháng 3, 4 là HƯ.", "", "- Các Tuổi thuộc \"Tuần Giáp Tuất\" (tức từ Giáp Tuất đến Quý Mùi):", "Nam Kị tháng 7, 8 là CÔ, Nữ Kị tháng 1, 2 là HƯ.", "", "- Các Tuổi thuộc \"Tuần Giáp Thân\" (tức từ Giáp Thân đến Quý Tị):", "Nam Kị tháng 5, 6 là CÔ, Nữ Kị tháng 11, 12 là HƯ.", "", "- Các Tuổi thuộc \"Tuần Giáp Ngọ\" (tức từ Giáp Ngọ đến Quý Mão):", "Nam Kị tháng 3, 4 là CÔ, Nữ Kị tháng 9, 10 là HƯ.", "", "- Các Tuổi thuộc \"Tuần Giáp Thìn\" (tức từ Giáp Thìn đến Quý Sửu):", "Nam Kị tháng 1, 2 là CÔ, Nữ Kị tháng 7, 8 là HƯ.", "", "- Các Tuổi thuộc \"Tuần Giáp Dần\" (tức từ Giáp Dần đến Quý Hợi):", "Nam Kị tháng 11, 12 là CÔ, Nữ Kị tháng 5, 6 là HƯ."]},
    ],
  },
  28: {
    title: "Chôn Cất",
    blocks: [
      {"kind": "text", "lines": ["Người chết có nhiều quan hệ đến con cháu thứ nhất trong mục chôn cất.", "Vậy nên chọn trong 12 ngày chôn cất rất tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Dậu"], "Bính": ["Ngọ", "Thân"], "Đinh": ["Dậu"], "Kỷ": ["Dậu"], "Canh": ["Thân"], "Tân": ["Dậu"], "Nhâm": ["Thân", "Ngọ", "Dần"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["Hoặc Chọn Trong 7 Ngày Chôn Cất Khá Tốt Sau Đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thìn"], "Ất": ["Tị"], "Bính": ["Thìn"], "Canh": ["Ngọ"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Cũng còn nhiều ngày tốt chôn cất để con cháu phát đạt. Nhưng phải tùy có từng tháng sau đây"]},
      {"kind": "text", "lines": ["Tháng Giêng"]},
      {"kind": "days", "days": {"Ất": ["Dậu"], "Bính": ["Dần", "Ngọ"], "Đinh": ["Dậu"], "Kỷ": ["Dậu"], "Tân": ["Dậu"], "Nhâm": ["Ngọ", "Dần"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["(3 ngày trước tốt hơn 6 ngày sau)"]},
      {"kind": "text", "lines": ["Tháng Hai"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Bính": ["Dần", "Thân"], "Kỷ": ["Mùi"], "Canh": ["Dần", "Thân"], "Nhâm": ["Dần", "Thân"]}},
      {"kind": "text", "lines": ["Tháng Ba"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Dậu"], "Bính": ["Ngọ", "Thân"], "Đinh": ["Dậu"], "Canh": ["Thân"], "Tân": ["Dậu"], "Nhâm": ["Ngọ", "Thân"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["Tháng Tư"]},
      {"kind": "days", "days": {"Ất": ["Dậu"], "Đinh": ["Dậu"], "Kỷ": ["Dậu"], "Tân": ["Dậu"], "Nhâm": ["Ngọ"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["Tháng Năm"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Bính": ["Thân"], "Canh": ["Dần", "Thân"], "Nhâm": ["Dần", "Thân"]}},
      {"kind": "text", "lines": ["(Ngày Dần kị Khai Kim Tĩnh)"]},
      {"kind": "text", "lines": ["Tháng Sáu"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Ất": ["Dậu"], "Bính": ["Thân"], "Canh": ["Dần", "Thân"], "Tân": ["Dậu"], "Nhâm": ["Dần", "Thân"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["Tháng Bảy"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Dậu"], "Bính": ["Tý", "Thìn", "Thân"], "Đinh": ["Dậu"], "Kỷ": ["Dậu"], "Nhâm": ["Tý", "Thìn", "Thân"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["(4 ngày Dậu tốt hơn 6 ngày kia)"]},
      {"kind": "text", "lines": ["Tháng Tám"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Tị"], "Bính": ["Thìn", "Thân"], "Đinh": ["Tị"], "Canh": ["Dần", "Thân"], "Nhâm": ["Dần", "Thìn", "Thân"]}},
      {"kind": "text", "lines": ["Tháng Chín"]},
      {"kind": "days", "days": {"Bính": ["Dần", "Ngọ"], "Canh": ["Dần"], "Nhâm": ["Dần", "Ngọ"]}},
      {"kind": "text", "lines": ["Tháng Mười"]},
      {"kind": "days", "days": {"Giáp": ["Thìn"], "Bính": ["Tý", "Thìn", "Ngọ"], "Canh": ["Ngọ"]}},
      {"kind": "text", "lines": ["Tháng Mười Một"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thìn", "Thân"], "Bính": ["Thân"], "Canh": ["Dần", "Thân"], "Nhâm": ["Tý", "Dần", "Thân"]}},
      {"kind": "text", "lines": ["(4 ngày Thân kị Khai Kim Tĩnh)"]},
      {"kind": "text", "lines": ["Tháng Chạp"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Ất": ["Dậu"], "Bính": ["Thân"], "Canh": ["Thân"], "Nhâm": ["Dần", "Thân"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["(4 ngày Thân kị Khai Kim Tĩnh)"]},
      {"kind": "text", "lines": ["Nên chọn các ngày có Kiết tinh: Thiên Quý, Thiên Phú, Thiên Tài, Nguyệt Tài, Địa Tài, Lộc Khố.", "Kị các ngày có Hung Tinh: Thiên Tặc, Địa Tặc, Phục Đoạn, Diệt Một."]},
    ],
  },
  29: {
    title: "Xả Tang",
    blocks: [
      {"kind": "text", "lines": ["Thọ chế là để tang người chết nay đủ năm rồi.", "Muốn xả tang không thờ bài vị nữa nên chọn trong 14 ngày lành tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Mẹo"], "Bính": ["Tý", "Thân"], "Mậu": ["Ngọ"], "Kỷ": ["Mùi", "Dậu"], "Canh": ["Tý", "Thân"], "Tân": ["Mẹo", "Hợi"], "Nhâm": ["Tý", "Thân"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Trừ."]},
    ],
  },
  30: {
    title: "Ngày Thần Trùng",
    blocks: [
      {"kind": "text", "lines": ["Cách này ở nhiều sách hay lầm lẫn với các ngày Trùng Tang, Trùng Trục.", "Thần Trùng là trong gia quyến thân chủ có người chết nhằm ngày đó nếu không trấn ếm thì sẽ bị tai họa chết trùng người ta gọi là Trùng Tang Liên Táng trong thân tộc sẽ có người chết theo.", "Những ngày đã nói ở trên không bị chết mà chỉ kị những việc an táng, tẩn liệm, mặc đồ tang, chôn cất, xả tang,... Còn nhứ chết nhằm ngày Thần Trùng mới đáng sợ. Sau đây là ngày Thần Trùng:"]},
      {"kind": "grid", "rows": [["Tháng", "Ngày Chết\nTheo Can Chi", "Ý Nghĩa"], ["1, 2, 6, 9, 12", "Canh Dần,\nCanh Thân", "Phạm Thần Trùng \"Lục Canh Thiên Hình\""], ["3", "Tân Tị,\nTân Hợi", "Phạm Thần Trùng \"Lục Tân Thiên Đình\""], ["4", "Nhâm Dần,\nNhâm Thân", "Phạm Thần Trùng \"Lục Nhâm Thiên Lao\""], ["5", "Quý Tị,\nQuý Hợi", "Phạm Thần Trùng \"Lục Quý Thiên Ngục\""], ["7", "Giáp Dần,\nGiáp Thân", "Phạm Thần Trùng \"Lục Giáp Thiên Phúc\""], ["8", "Ất Tị,\nẤt Hợi", "Phạm Thần Trùng \"Lục Ất Thiên Đức\""], ["10", "Bính Dần,\nBính Thân", "Phạm Thần Trùng \"Lục Bính Thiên Uy\""], ["11", "Đinh Tị,\nĐinh Hợi", "Phạm Thần Trùng \"Lục Đinh Thiên Âm"]]},
      {"kind": "text", "lines": ["Nếu thêm mấy năm tháng cũng vậy là càng nặng."]},
    ],
  },
  31: {
    title: "Xuất Hành",
    blocks: [
      {"kind": "text", "lines": ["Xuất hành là ra đi nhưng không phải là ra đi thường xuyên hàng ngày mà lâu lâu đi xa 1 lần hoặc ra đi để mưu tính việc quan trọng hay có phần nguy hiểm hoặc ra đi xa xôi, ra đi làm ăn lần đầu tiên, ra đi tới chỗ mình chưa từng đi. Trong mục xuất hành có 7 bài sau:"]},
      {"kind": "text", "lines": ["1. Xuất Hành Thông Dụng Ngày Tốt"]},
      {"kind": "text", "lines": ["Có 26 ngày tốt rất được thông dụng trong mục chọn ngày ra đi:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Ngọ", "Tuất"], "Ất": ["Sửu", "Mẹo", "Hợi"], "Bính": ["Dần", "Ngọ", "Tuất"], "Đinh": ["Sửu", "Mẹo", "Mùi"], "Kỷ": ["Mẹo", "Dậu"], "Canh": ["Tý", "Dần", "Ngọ", "Thân"], "Tân": ["Sửu", "Mẹo", "Mùi"], "Nhâm": ["Dần"], "Quý": ["Sửu", "Mẹo"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Mãn, Thành, Khai.", "Nên chọn các ngày có Kiết Tinh: Hoàng Đạo."]},
      {"kind": "text", "lines": ["2. Xuất Hành Quyết Pháp"]},
      {"kind": "text", "lines": ["Có bài này phương pháp yếu quyết chọn ngày tốt xuất hành phải tùy có từng tháng và dùng Địa Chỉ chớ không dùng Thiên Can như sau:"]},
      {"kind": "grid", "rows": [["Tháng", "Địa Chi Tháng", "Tháng", "Đại Chi Tháng"], ["Tháng Giêng", "Tý, Ngọ", "Tháng Bảy", "Ngọ, Thân"], ["Tháng Hai", "Sửu, Thìn, Mùi, Thân", "Tháng Tám", "Mùi, Thân, Dậu, Hợi"], ["Tháng Ba", "Dần", "Tháng Chín", "Tý, Ngọ"], ["Tháng Tư", "Mẹo", "Tháng Mười", "Tý, Dậu, Hợi"], ["Tháng Năm", "Dần, Ngọ, Thân", "Tháng Mười Một", "Tý, Dần"], ["Tháng Sáu", "Mùi", "Tháng Chạp", "Hợi"]]},
      {"kind": "text", "lines": ["3. Chọn Phương Hướng Xuất Hành Trong 12 Giờ"]},
      {"kind": "text", "lines": ["Có bài này phương pháp yếu quyết chọn ngày tốt xuất hành phải tùy có từng tháng và dùng Địa Chi chớ không dùng Thiên Can như sau:"]},
      {"kind": "grid", "rows": [["Giờ", "Phương Hướng", "Giờ", "Phương Hướng"], ["Tý", "Tây Nam Tốt.\nĐông Bắc Xấu.", "Ngọ", "Bắc Tốt.\nCòn lại Xấu."], ["Sửu", "Tây Bắc Đông Nam", "Mùi", "Tây Bắc Tốt.\nĐông Nam Xấu."], ["Dần", "Tây Tốt", "Thân", "Bắc Xấu.\nCòn lại Tốt"], ["Mẹo", "Nam Tốt.\nCòn lại Xấu.", "Dậu", "Chính Tây Tốt."], ["Thìn", "Bắc Tốt.\nCòn lại Xấu.", "Tuất", "Tây Bắc Tốt.\nTây Nam Xấu."], ["Tị", "Tây Nam Tốt.\nĐông Bắc Xấu.", "Hợi", "Phương Chính Tây Tốt"]]},
      {"kind": "text", "lines": ["4. Số Ngày Kị Phương Hướng Xuất Hành"]},
      {"kind": "text", "lines": ["Bài này lại không nói tên ngày mà nói số ngày:"]},
      {"kind": "grid", "rows": [["Ngày", "Phương Hướng", "Ngày", "Phương Hướng"], ["Mùng 1", "Kị Phương Chính Tây", "Ngày Rằm (15)", "Kị Phương Chính Đông"], ["Mùng 8", "Kị Phương Chính Nam", "Ngày Hối (Ngày cuối tháng)", "Kị Phương Chính Bắc"]]},
      {"kind": "text", "lines": ["5. Bốn Ngày Thuận Nên Xuất Hành"]},
      {"kind": "text", "lines": ["Bài này lại không nói tên ngày mà nói số ngày:"]},
      {"kind": "grid", "rows": [["Ngày", "Nên", "Ngày", "Nên"], ["Kiên", "Đi (Hành)", "Dần", "Qua (Vãng)"], ["Thành", "Rời (Ly)", "Mẹo", "Về (Quy)"]]},
      {"kind": "text", "lines": ["6. Bốn Ngày Nghịch Kị Xuất Hành"]},
      {"kind": "text", "lines": ["Bài này lại không nói tên ngày mà nói số ngày:"]},
      {"kind": "grid", "rows": [["Ngày", "Kị", "Ngày", "Kị"], ["Thân", "Đi (Hành)", "Mùng 7", "Qua (Vãng)"], ["Dậu", "Rời (Ly)", "Mùng 8", "Về (Quy)"]]},
      {"kind": "text", "lines": ["7. Giờ Thiên Phiên Địa Phúc"]},
      {"kind": "text", "lines": ["Có ý nghĩa như lúc Trời Đất lật úp lại rất kị xuất hành mà cũng rất kị xuất quân và kị sửa chữa thuyền ghe.", "Mỗi tháng có 2 giờ Thiên Phiên Địa Phúc:"]},
      {"kind": "grid", "rows": [["Tháng", "Giờ Theo Địa Chi", "Tháng", "Giờ Theo Địa Chi"], ["Tháng Giêng", "Tị, Hợi", "Tháng Bảy", "Dậu, Hợi"], ["Tháng Hai", "Thìn, Tuất", "Tháng Tám", "Thìn, Tuất"], ["Tháng Ba", "Thân, Dậu", "Tháng Chín", "Mẹo, Dậu"], ["Tháng Tư", "Tị, Thân", "Tháng Mười", "Thìn, Ngọ"], ["Tháng Năm", "Sửu, Mẹo", "Tháng Mười Một", "Dần, Mùi"], ["Tháng Sáu", "Tý, Ngọ", "Tháng Chạp", "Mẹo, Tị"]]},
      {"kind": "text", "lines": ["Khi có việc cần kíp phải Xuất Hành đi xa hay đi vào chỗ nguy hiểm.", "Nếu không kịp chọn ngày thì hãy làm như sau:", "Bước ra cửa mặt hướng về trước thu liễm tinh thần (tập trung tư tưởng chuyên nhất) tay bắt ấn (có nhớ lúc nhỏ mình làm súng bằng tay không ? chĩa 2 ngón tay trỏ và giữa ra trước ngón cái co vào đè trên 2 ngón áp út và út làm y vậy đấy) vạch xuống đất: 4 vạch dọc 5 vạch ngang (cắt với 4 vạch dọc đó) và đọc bài chú sau đây:", "Sắc Tứ tung Ngũ hoành", "Ngô câu xuất hành", "Võ Vương vệ đạo", "Xi Vưu tị binh đao", "Tặc bất đắc khởi lỗ lang bất đắc", "Lâm hành viễn quy cố hương", "Đương ngô dã tử bối ngô dã dong", "Cấp cấp như Cửu Thiên Huyền Nữ luật lệnh !", "Sau đó xuất phát nhớ không được ngoái đầu nhìn lại !", "Bảo đảm xuất hành an nhiên đi đến nơi về đến chốn an toàn !"]},
    ],
  },
  32: {
    title: "Ngày Tốt Đi Thuyền",
    blocks: [
      {"kind": "text", "lines": ["Đi sông biển bất luận thiền ghe xuồng Nôm … đều dễ có sự nguy hiểm.", "Vậy nên chọn trong 22 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Ngọ"], "Ất": ["Mùi", "Dậu"], "Bính": ["Dần", "Thìn"], "Đinh": ["Mẹo"], "Mậu": ["Tý", "Dần", "Thìn", "Ngọ"], "Kỷ": ["Tị", "Mùi"], "Canh": ["Tý"], "Tân": ["Sửu", "Mẹo", "Mùi", "Dậu"], "Nhâm": ["Dần", "Ngọ"], "Quý": ["Mẹo", "Tị"]}},
    ],
  },
  33: {
    title: "Ngày Kị Đi Thuyền",
    blocks: [
      {"kind": "text", "lines": ["Có 5 loại ngày Kị đi thuyền"]},
      {"kind": "text", "lines": ["Ngày Diệt Một"]},
      {"kind": "grid", "rows": [["Ngày", "Gặp Sao", "Ngày", "Gặp Sao"], ["Ngày Sóc (mùng 1)", "Sao Giác", "Ngày Vọng (15)", "Sao Cang"], ["Ngày Huyền (7, 8, 22, 23)", "Sao Hư", "Ngày Hư (16)", "Sao Quỷ"], ["Ngày Doanh (14)", "Sao Ngưu", "Ngày Hối (29 hoặc 30)", "Sao Lâu"]]},
      {"kind": "text", "lines": ["Ngày Thủy Ngân"]},
      {"kind": "grid", "rows": [["Tháng Đủ", "Mùng 1, mùng 7, ngày 11, ngày 17, ngày 23, ngày 30"], ["Tháng Thiếu", "Mùng 3, mùng 7, ngày 12, ngày 26"]]},
      {"kind": "text", "lines": ["Ngày Xúc Thủy Long"]},
      {"kind": "text", "lines": ["Nói nôm na là ngày Rồng nước húc vào thuyền. Đó là 3 ngày:"]},
      {"kind": "days", "days": {"Bính": ["Tý"], "Quý": ["Sửu", "Mùi"]}},
      {"kind": "text", "lines": ["Ngày Long Thần Triệu Hội"]},
      {"kind": "grid", "rows": [["Tháng", "Giờ Theo Địa Chi", "Tháng", "Giờ Theo Địa Chi"], ["Tháng Giêng", "3, 8, 11, 25, ngày cuối tháng", "Tháng Sáu", "9, 27"], ["Tháng Hai", "3, 9, 12", "Tháng Bảy", "7, 9, 15, 27"], ["Tháng Ba", "3, 7, 27", "Tháng Tám", "3, 8, 27"], ["Tháng Tư", "8, 12, 17, 19", "Tháng Chín", "8, 15, 17"], ["Tháng Năm", "5, 13, 29 (30)", "Tháng Mười", "8, 15, 27"]]},
      {"kind": "text", "lines": ["Ngày có Trực Phá."]},
    ],
  },
  34: {
    title: "Đóng Thuyền Hay Sửa Chữa Thuyền",
    blocks: [
      {"kind": "text", "lines": ["Khởi công đóng thuyền ghe hoặc sửa chữa cần chọn trong 10 ngày tốt:"]},
      {"kind": "days", "days": {"Giáp": ["Tuất"], "Ất": ["Mẹo", "Dậu", "Hợi"], "Kỷ": ["Tị", "Dậu", "Mùi"], "Canh": ["Thân"], "Tân": ["Mùi"], "Nhâm": ["Tý"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Bình, Định, Thành.", "Nên chọn các ngày có Kiết Tinh: Phòng, Ngưu, Thất, Sâm, Tỉnh, Thiên Ân, Nguyệt Ân, Thiên Đức Hợp, Nguyệt Đức Hợp, Yếu An, Nguyệt Tài.", "", "Kị các ngày có Trực: Kiên, Phá, Bình, Thâu.", "Kị các ngày có Hung Tinh: Đê, Vĩ, Cơ, Đẩu, Nguy, Lâu, Vị, Mão, Trương, Chẩn (nhất là Sao Trương ), Bạch Ba, Hàm Trì, Thủy Ngân, Xúc Thủy Long, Bát Phong.", "Tránh giờ Đại ác giờ Thiên Phiên Địa Phúc."]},
      {"kind": "text", "lines": ["Tháng Phong Ba:", "Năm nào tháng mấy. (Vd: năm Tý tháng Tý )"]},
      {"kind": "text", "lines": ["Tháng Hà Bá", "Cách Tính:"]},
      {"kind": "grid", "rows": [["Năm", "Hà Bá Tại Tháng", "Năm", "Hà Bá Tại Tháng", "Năm", "Hà Bá Tại Tháng"], ["Tý", "10", "Thìn", "2", "Thân", "6"], ["Sửu", "11", "Tị", "3", "Dậu", "7"], ["Dần", "12", "Ngọ", "4", "Tuất", "8"], ["Mẹo", "1", "Mùi", "5", "Hợi", "9"]]},
      {"kind": "text", "lines": ["Ngày Bát Phong", "Là nói 8 ngọn gió làm xiêu bạt thuyền bè:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thìn", "Thân", "Tuất"], "Đinh": ["Sửu", "Mùi"], "Kỷ": ["Sửu"], "Tân": ["Mùi"]}},
      {"kind": "text", "lines": ["Giờ Đại Ác:", "Tháng nào giờ nấy. Tháng Giêng là tháng Dần thì giờ Dần là giờ Đại Ác..."]},
    ],
  },
  35: {
    title: "Làm Mui Ghe Thuyền",
    blocks: [
      {"kind": "text", "lines": ["Đóng mui ghe thuyền lợp mui ghe cỏ ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thìn", "Thân"], "Ất": ["Tị", "Mùi", "Dậu"], "Mậu": ["Tý", "Dần", "Thìn", "Thân"], "Kỷ": ["Sửu", "Mẹo", "Dậu", "Hợi"], "Canh": ["Dần"], "Tân": ["Sửu", "Hợi"], "Nhâm": ["Tý"], "Quý": ["Mẹo", "Tị", "Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Kị các ngày có Trực: Phá.", "Kị các ngày có Hung Tinh: Thiên Hỏa, Thiên Tặc, Địa Tặc, Bát Phong."]},
    ],
  },
  36: {
    title: "Hạ Thủy Thuyền Mới",
    blocks: [
      {"kind": "text", "lines": ["Thuyền mới đóng xong hay mới sửa chữa xong nay.", "Muốn đẩy xuống nước nên chọn trong 26 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Ngọ", "Thân", "Tuất"], "Ất": ["Sửu", "Mẹo", "Hợi"], "Bính": ["Dần", "Ngọ", "Tuất"], "Đinh": ["Sửu", "Mẹo", "Mùi"], "Kỷ": ["Mẹo", "Dậu"], "Canh": ["Tý", "Dần", "Ngọ", "Thân"], "Tân": ["Sửu", "Mẹo", "Mùi"], "Nhâm": ["Dần"], "Quý": ["Sửu", "Mẹo"]}},
      {"kind": "text", "lines": ["Các Thần Sát và Trực của mục 31 đều được dùng y trong mục này.", "Vì đây cũng xem như Xuất hành rồi vậy.", "Thuyền mới đem xuống nước kị chở đồ vật ra đi ngày Thân."]},
    ],
  },
  37: {
    title: "Khai Trương, Mở Nhập Kho, Cất Vật Quý",
    blocks: [
      {"kind": "text", "lines": ["Khai Trương là mở cửa hàng quán để buôn bán.", "Mở kho nhập kho là để đem hóa vật ra hay mang hóa vật vào.", "Lấy hay cất vật quý là như vàng bạc châu ngọc…", "Muốn đem cất giấu hoặc nay muốn lấy ra.", "Cả ba việc trên đều dùng chung trong 25 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Tuất", "Thân"], "Ất": ["Sửu", "Mẹo", "Mùi", "Hợi"], "Bính": ["Tý", "Dần", "Ngọ"], "Đinh": ["Sửu"], "Kỷ": ["Mùi", "Hợi"], "Canh": ["Tý", "Dần", "Ngọ", "Thân"], "Tân": ["Mẹo", "Mùi", "Dậu"], "Nhâm": ["Tý", "Ngọ"], "Quý": ["Mẹo", "Mùi"]}},
    ],
  },
  38: {
    title: "Mua Hàng, Bán Hàng",
    blocks: [
      {"kind": "text", "lines": ["Để khởi đầu mục mua bán hàng.", "Nên chọn trong 6 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần"], "Bính": ["Tuất"], "Đinh": ["Mùi"], "Kỷ": ["Mẹo", "Dậu"], "Nhâm": ["Dần"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Mãn, Thành."]},
    ],
  },
  39: {
    title: "Lập Khế Ước Giao Dịch",
    blocks: [
      {"kind": "text", "lines": ["Làm tờ giao kèo để trao đổi mua bán với nhau nên chọn trong 18 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Ất": ["Mẹo", "Mùi"], "Bính": ["Tý"], "Đinh": ["Sửu", "Mùi"], "Mậu": ["Thân"], "Kỷ": ["Mùi"], "Canh": ["Tý"], "Tân": ["Mẹo", "Mùi", "Dậu"], "Nhâm": ["Tý", "Thìn", "Ngọ"], "Quý": ["Mẹo", "Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Chấp, Thành.", "Nên chọn các ngày có Kiết Tinh: Thiên Đức, Nguyệt Đức."]},
      {"kind": "text", "lines": ["Rất kị ngày Trường Đoản Tinh:", "Tháng Giêng: mùng 7, 21. Tháng 2: mùng 4, 19. Tháng 3: mùng 1, 16.", "Tháng 4: mùng 9, 25. Tháng 5: ngày 15, 25. Tháng 6: ngày 10, 20.", "Tháng 7: mùng 8, 22. Tháng 8: mùng 4, 5, 18, 19. Tháng 9: mùng 3, 4, 16, 17.", "Tháng 10: mùng 1, 14. Tháng 11: ngày 12, 22. Tháng 12: mùng 9, 25."]},
      {"kind": "grid", "rows": [["Tháng", "Ngày", "Tháng", "Ngày"], ["Tháng Giêng", "7, 21", "Tháng Bảy", "8, 22"], ["Tháng Hai", "4, 19", "Tháng Tám", "4, 5, 18, 19"], ["Tháng Ba", "1, 16", "Tháng Chín", "3, 4, 16, 17"], ["Tháng Tư", "9, 25", "Tháng Mười", "1, 14"], ["Tháng Năm", "15, 25", "Tháng Mười Một", "12, 22"], ["Tháng Sáu", "10, 20", "Tháng Chạp", "9, 25"]]},
    ],
  },
  40: {
    title: "Đặt Yên Máy Dệt",
    blocks: [
      {"kind": "text", "lines": ["Khung cửi máy dệt là vật tạo cho con người sự văn minh và ấm áp.", "Vậy muốn đặt yên 1 nơi nào cũng nên chọn trong các ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"], "Ất": ["Sửu", "Tị"], "Bính": ["Thìn", "Thân"], "Đinh": ["Sửu", "Mẹo", "Dậu", "Hợi"], "Mậu": ["Tý", "Tuất"], "Kỷ": ["Sửu", "Mẹo", "Hợi"], "Tân": ["Tị", "Hợi"], "Nhâm": ["Tý", "Dần", "Thìn", "Thân"], "Quý": ["Sửu", "Dậu", "Tị", "Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Bình, Định, Mãn, Thành, Khai."]},
      {"kind": "text", "lines": ["Lời nói riêng:", "Cũng có thể chọn trong 29 ngày nói trên để đặt yên cho các loại máy khác như:", "Máy in chữ, Máy sản xuất lương thực, Máy ép…"]},
    ],
  },
  41: {
    title: "Đặt Yên Cối Xay",
    blocks: [
      {"kind": "text", "lines": ["Cối xay hoặc cối nào cũng vậy muốn đặt yên 1 nơi nào cho chính xác và thuận lợi.", "Nên chọn trong 7 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tuất"], "Ất": ["Hợi"], "Canh": ["Tý", "Dần", "Ngọ", "Thân"], "Tân": ["Dậu"]}},
    ],
  },
  42: {
    title: "Chia Nhận Gia Tài Sản Nghiệp",
    blocks: [
      {"kind": "text", "lines": ["Trong cuộc phân chia nên chọn ngày lành để nhận gia sản hầu sau khởi bất hòa và nhất là với của đó sẽ làm ăn thịnh vượng."]},
      {"kind": "text", "lines": ["Tháng Giêng"]},
      {"kind": "days", "days": {"Bính": ["Ngọ"], "Kỷ": ["Mẹo"], "Nhâm": ["Ngọ"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Hai"]},
      {"kind": "days", "days": {"Ất": ["Mùi"], "Kỷ": ["Tị", "Mùi", "Hợi"], "Tân": ["Mùi"], "Quý": ["Mùi"]}},
      {"kind": "text", "lines": ["Tháng Ba"]},
      {"kind": "days", "days": {"Bính": ["Tý"], "Kỷ": ["Mẹo"], "Canh": ["Tý"], "Tân": ["Mẹo"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Tư"]},
      {"kind": "days", "days": {"Ất": ["Sửu"], "Kỷ": ["Mẹo"], "Canh": ["Ngọ"], "Tân": ["Hợi"], "Nhâm": ["Ngọ"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Năm"]},
      {"kind": "days", "days": {"Giáp": ["Thìn"], "Bính": ["Thìn"], "Mậu": ["Thìn"], "Kỷ": ["Mùi"], "Tân": ["Mùi"]}},
      {"kind": "text", "lines": ["Tháng Sáu"]},
      {"kind": "days", "days": {"Ất": ["Hợi"], "Kỷ": ["Mẹo", "Hợi"], "Tân": ["Mẹo"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Bảy"]},
      {"kind": "days", "days": {"Bính": ["Thìn"], "Mậu": ["Thìn"], "Canh": ["Thìn"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Tháng Tám"]},
      {"kind": "days", "days": {"Giáp": ["Tuất"], "Ất": ["Sửu", "Tị", "Hợi"], "Kỷ": ["Hợi"], "Canh": ["Thân"]}},
      {"kind": "text", "lines": ["Tháng Chín"]},
      {"kind": "days", "days": {"Bính": ["Ngọ"], "Canh": ["Ngọ"], "Tân": ["Dậu"], "Nhâm": ["Ngọ"]}},
      {"kind": "text", "lines": ["Tháng Mười"]},
      {"kind": "days", "days": {"Giáp": ["Tý"], "Bính": ["Tý"], "Mậu": ["Tý"], "Canh": ["Tý"]}},
      {"kind": "text", "lines": ["Tháng Mười Một"]},
      {"kind": "days", "days": {"Ất": ["Sửu", "Hợi"], "Đinh": ["Sửu"], "Kỷ": ["Sửu"], "Quý": ["Sửu"]}},
      {"kind": "text", "lines": ["Tháng Chạp"]},
      {"kind": "days", "days": {"Ất": ["Mẹo"], "Canh": ["Thân"], "Tân": ["Mẹo"], "Nhâm": ["Thân"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Kiết Tinh: Thiên Quý, Thiên Phú, Thiên Tài, Nguyệt Tài, Địa Tài, Lộc Khố."]},
      {"kind": "text", "lines": ["Kị các ngày có Hung Tinh: Thiên Tặc, Phục Đoạn, Diệt Một"]},
      {"kind": "text", "lines": ["Ngày Phục Đoạn"]},
      {"kind": "grid", "rows": [["Ngày Tý gặp sao Hư\nNgày Mẹo gặp sao Nữ\nNgày Ngọ gặp sao Giác\nNgày Dậu gặp sao Chủy", "Ngày Tuất gặp sao Vị\nNgày Mùi gặp sao Trương\nNgày Thìn gặp sao Cơ\nNgày Sửu gặp sao Đẩu", "Ngày Dần gặp sao Thất\nNgày Tị gặp sao Phòng\nNgày Thân gặp sao Quỷ\nNgày Hợi gặp sao Bích"]]},
    ],
  },
  43: {
    title: "Mua Ruộng Đất, Phòng Nhà, Sản Vật",
    blocks: [
      {"kind": "text", "lines": ["Mua vườn tược ruộng đất phòng nhà sản vật quan trọng…", "Nên chọn trong 18 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Ất": ["Mẹo", "Mùi"], "Bính": ["Tý"], "Đinh": ["Sửu", "Mùi"], "Mậu": ["Thân"], "Kỷ": ["Mùi"], "Canh": ["Tý"], "Tân": ["Mẹo", "Mùi", "Dậu"], "Nhâm": ["Tý", "Thìn", "Ngọ"], "Quý": ["Mẹo", "Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Định, Thành."]},
    ],
  },
  44: {
    title: "Cày Ruộng, Gieo Giống",
    blocks: [
      {"kind": "text", "lines": ["Cày ruộng gieo giống rất quan hệ đến việc sinh sống con người.", "Vậy nên chọn trong 41 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thìn", "Ngọ", "Thân"], "Ất": ["Sửu", "Mùi", "Dậu", "Hợi"], "Bính": ["Tý", "Thìn", "Ngọ", "Thân", "Tuất"], "Đinh": ["Sửu", "Mẹo", "Tị"], "Mậu": ["Dần", "Ngọ", "Thân", "Tuất"], "Kỷ": ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu", "Hợi"], "Canh": ["Tý", "Ngọ", "Thân"], "Tân": ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu"], "Nhâm": ["Dần", "Thìn", "Ngọ"], "Quý": ["Sửu", "Mẹo", "Tị", "Mùi", "Dậu", "Hợi"]}},
    ],
  },
  45: {
    title: "Ngâm Thóc",
    blocks: [
      {"kind": "text", "lines": ["Nên chọn trong 6 ngày tốt sau đây ngâm thóc để khi ương mạ sẽ lên được mạ tốt:"]},
      {"kind": "days", "days": {"Giáp": ["Tuất"], "Ất": ["Mẹo", "Dậu", "Hợi"], "Nhâm": ["Thìn", "Ngọ"]}},
    ],
  },
  46: {
    title: "Ương Mạ",
    blocks: [
      {"kind": "text", "lines": ["Ương mạ hay gieo mạ hoặc ương gieo nhưng cây hột khác cũng rất cần chọn trong các ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Ngọ"], "Ất": ["Mẹo", "Tị"], "Bính": ["Ngọ"], "Đinh": ["Mùi"], "Mậu": ["Thân"], "Kỷ": ["Dậu"], "Canh": ["Dần"], "Tân": ["Mùi", "Dậu"], "Nhâm": ["Ngọ"], "Quý": ["Dậu"]}},
    ],
  },
  47: {
    title: "Trồng Lúa",
    blocks: [
      {"kind": "text", "lines": ["Trồng lúa tức là cấy mạ xuống ruộng có 11 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Ngọ"], "Kỷ": ["Mẹo", "Dậu"], "Canh": ["Ngọ"], "Tân": ["Tị"], "Nhâm": ["Ngọ", "Thân"], "Quý": ["Mẹo", "Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Khai, Thâu."]},
    ],
  },
  48: {
    title: "Gặt Lúa",
    blocks: [
      {"kind": "text", "lines": ["Nên chọn trong 10 ngày tốt sau đây để khởi đầu gặt lúa:"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Ngọ"], "Kỷ": ["Mẹo", "Dậu"], "Tân": ["Tị"], "Nhâm": ["Ngọ", "Thân"], "Quý": ["Mẹo", "Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Khai, Thâu, Thành."]},
    ],
  },
  49: {
    title: "Đào Giếng",
    blocks: [
      {"kind": "text", "lines": ["Nên chọn trong 10 ngày tốt sau đây để khởi công đào giếng:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Ngọ"], "Ất": ["Sửu", "Tị"], "Canh": ["Tý"], "Tân": ["Sửu", "Dậu", "Hợi"], "Nhâm": ["Dần"], "Quý": ["Dậu"]}},
    ],
  },
  50: {
    title: "Sửa Giếng",
    blocks: [
      {"kind": "text", "lines": ["Có giếng rồi nay muốn sửa lại như vết giếng đắp bờ thêm đào sâu thêm hay đào ruộng ra…", "Nên chọn trong 7 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Tị"], "Đinh": ["Tị"], "Canh": ["Tý"], "Tân": ["Sửu", "Hợi"], "Quý": ["Sửu"]}},
    ],
  },
  51: {
    title: "Đào Hồ Ao",
    blocks: [
      {"kind": "text", "lines": ["Đào ao hồ để trữ nước hay nuôi cá nuôi thủy sản..vv..", "Nên chọn trong 14 ngày tốt sau đây khởi công:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân"], "Ất": ["Sửu", "Tị"], "Đinh": ["Tị"], "Mậu": ["Tuất"], "Canh": ["Tý"], "Tân": ["Sửu", "Dậu", "Hợi"], "Nhâm": ["Ngọ"], "Quý": ["Sửu", "Dậu", "Hợi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành, Khai."]},
      {"kind": "text", "lines": ["Như ao hồ có nuôi cá hay Thủy sản thì nên chọn gặp ngày Thiên Cẩu Thủ Đường tức như có chó thần giữ ao các loại rái cá chim rắn.. không dám tới. Nên tránh những Hung Sát: Hà Khôi, Thiên Cương, Tử Khí, Thổ Ôn, Thiên Bách Không (5, 7, 13, 16, 17, 19, 21, 27, 29)"]},
    ],
  },
  52: {
    title: "Khai Thông Hào Rãnh",
    blocks: [
      {"kind": "text", "lines": ["Đào hào mương rãnh cho nước vào ra thông thương nên chọn trong 7 ngày tốt sau đây khởi công."]},
      {"kind": "days", "days": {"Giáp": ["Tý"], "Ất": ["Sửu"], "Bính": ["Tuất"], "Mậu": ["Thân"], "Kỷ": ["Mẹo"], "Canh": ["Thìn"], "Tân": ["Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Khai."]},
    ],
  },
  53: {
    title: "Làm Cầu Tiêu",
    blocks: [
      {"kind": "text", "lines": ["Làm cầu tiên có 18 ngày tiện lợi để khởi công như sau:"]},
      {"kind": "days", "days": {"Ất": ["Sửu", "Mùi"], "Bính": ["Tý", "Dần", "Thìn", "Thân"], "Đinh": ["Mẹo", "Dậu"], "Mậu": ["Thìn"], "Kỷ": ["Mẹo", "Hợi"], "Canh": ["Tý"], "Tân": ["Sửu", "Tị", "Dậu", "Hợi"], "Nhâm": ["Tý"], "Quý": ["Sửu"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Bế.", "Kị các ngày có Hung Tinh: Phục Đoạn."]},
      {"kind": "text", "lines": ["Chọn được ngày Bính Thìn gọi là Thiên Lung Nhật ngày Tân Dậu gọi là Địa Á Nhật", "Rất tốt."]},
    ],
  },
  54: {
    title: "Chặt Cỏ Phá Đất",
    blocks: [
      {"kind": "text", "lines": ["Làm cỏ cuộc đất nên chọn ngày tốt tùy có mỗi tháng như sau:"]},
      {"kind": "text", "lines": ["Tháng Giêng"]},
      {"kind": "days", "days": {"Đinh": ["Mẹo"], "Canh": ["Ngọ"], "Nhâm": ["Ngọ"]}},
      {"kind": "text", "lines": ["Tháng Hai"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ"], "Bính": ["Ngọ"], "Canh": ["Ngọ"], "Nhâm": ["Ngọ"]}},
      {"kind": "text", "lines": ["Tháng Ba"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Nhâm": ["Thân"]}},
      {"kind": "text", "lines": ["Tháng Tư"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn"], "Ất": ["Sửu"], "Đinh": ["Mẹo"], "Canh": ["Tý", "Thìn", "Ngọ"], "Tân": ["Mẹo"], "Nhâm": ["Tý", "Thìn"], "Quý": ["Mẹo", "Sửu"]}},
      {"kind": "text", "lines": ["Tháng Năm"]},
      {"kind": "days", "days": {"Giáp": ["Dần"], "Nhâm": ["Dần"], "Quý": ["Sửu"]}},
      {"kind": "text", "lines": ["Tháng Sáu"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Mẹo"], "Bính": ["Thân"], "Đinh": ["Mẹo"], "Tân": ["Mẹo"], "Nhâm": ["Thân"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Bảy"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn"], "Ất": ["Mẹo"], "Bính": ["Ngọ"], "Đinh": ["Mẹo"], "Kỷ": ["Mẹo"], "Tân": ["Mẹo"], "Nhâm": ["Thìn", "Ngọ"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Tám"]},
      {"kind": "days", "days": {"Giáp": ["Thìn"], "Ất": ["Sửu"], "Nhâm": ["Thìn"], "Quý": ["Sửu"]}},
      {"kind": "text", "lines": ["Tháng Chín"]},
      {"kind": "days", "days": {"Ất": ["Mẹo"], "Bính": ["Ngọ"], "Đinh": ["Mẹo"], "Canh": ["Ngọ"], "Tân": ["Mẹo"], "Nhâm": ["Ngọ"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Mười"]},
      {"kind": "days", "days": {"Giáp": ["Tý"], "Bính": ["Ngọ"], "Đinh": ["Mẹo"], "Canh": ["Ngọ"], "Tân": ["Mùi"]}},
      {"kind": "text", "lines": ["Tháng Mười Một"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Mùi"], "Bính": ["Thân"], "Mậu": ["Thìn"], "Kỷ": ["Tị"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Tháng Chạp"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thân"], "Bính": ["Thân"], "Canh": ["Thân"], "Nhâm": ["Dần", "Thân"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Bế.", "Nên chọn các ngày có Sao: Phòng, Vỹ, Đẩu, Thất, Bích, Vị, Tất, Quỷ, Trương, Chẩn.", "Kị các ngày có Hung Tinh: Thiên Ôn, Thổ Ôn, Trùng Tang, Trùng Phục, Thiên Tặc, Âm Thác, Dương Sai."]},
    ],
  },
  55: {
    title: "Vào Núi Đốn Cây",
    blocks: [
      {"kind": "text", "lines": ["Muốn yên lành trong cuộc hành trình không phạm", "Thần Thánh thì nên chọn trong các ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Ngọ", "Thân", "Tuất"], "Ất": ["Mẹo", "Mùi", "Dậu", "Hợi"], "Bính": ["Ngọ", "Thân"], "Đinh": ["Mùi"], "Mậu": ["Tý", "Dần", "Thân"], "Kỷ": ["Mẹo", "Tị", "Mùi", "Dậu"], "Canh": ["Ngọ", "Thân"], "Tân": ["Mùi", "Dậu"], "Nhâm": ["Dần", "Ngọ", "Thân"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành, Định, Khai.", "Nên chọn các ngày có Kiết Tinh: Hoàng Đạo, Minh Tinh, Thiên Đức, Nguyệt Đức.", "Kị các ngày có Hung Tinh: Thiên Tặc, Hỏa Tinh, Chánh Tứ Phế, Xích Khẩu."]},
      {"kind": "text", "lines": ["Đốn Cây Tùng Các Loại Tre Trúc Tầm Vông:", "Muốn đốn cây Tùng nên chọn ngày Thìn trong tháng 7 lúc trời quang tạnh lột vỏ rồi đem ngâm dưới nước.", "Nhiều ngày sau dùng nó mới được lâu bền và không bị mối mọt.", "Muốn đốn các lại tre trúc tầm vông nên chọn ngày Phục Đoạn, Phục Ương, Trùng Phục trong tháng Chạp.", "Nhằm lúc giữa trưa nắng đốn như vậy cây sẽ không bị mối mọt.", "Phục Ương trong tháng Chạp là ngày Tý Trùng Phục trong tháng Chạp là ngày Mậu."]},
    ],
  },
  56: {
    title: "Nạp Nô Tỳ",
    blocks: [
      {"kind": "text", "lines": ["Muốn mướn người giúp việc rất cần chọn 1 trong các ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Ngọ", "Thân"], "Ất": ["Sửu", "Mẹo", "Mùi", "Hợi"], "Bính": ["Dần", "Ngọ", "Tuất"], "Đinh": ["Mùi"], "Mậu": ["Dần", "Thìn"], "Kỷ": ["Mùi", "Hợi"], "Canh": ["Tý"], "Tân": ["Mẹo", "Dậu", "Hợi"], "Nhâm": ["Tý", "Thìn", "Thân"], "Quý": ["Mẹo", "Tị"]}},
      {"kind": "text", "lines": ["Nên chọn ngày có Trực: Thành, Mãn."]},
    ],
  },
  57: {
    title: "Kết Màn May Áo",
    blocks: [
      {"kind": "text", "lines": ["Kết màn may màn giăng màn cắt áo may áo rất hợp với 33 ngày sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Dần", "Thìn", "Ngọ", "Tuất"], "Ất": ["Sửu", "Mẹo", "Tị", "Mùi", "Hợi"], "Bính": ["Tý", "Thìn", "Thân", "Tuất"], "Đinh": ["Sửu", "Hợi"], "Mậu": ["Tý", "Thìn", "Tuất"], "Kỷ": ["Sửu", "Mẹo", "Tị"], "Canh": ["Tý", "Dần", "Thân"], "Tân": ["Sửu", "Dậu"], "Nhâm": ["Thìn", "Tuất"], "Quý": ["Sửu", "Mẹo", "Tị", "Dậu"]}},
      {"kind": "text", "lines": ["Nên chọn ngày Thủy có Trực Bế có sao Nữ, Thành, Khai.", "Kị các ngày có Hung Tinh: Thiên Tặc, Hỏa Tinh, Trường Đoản Tinh."]},
    ],
  },
  58: {
    title: "Vẽ Tượng, Họa Chân Dung",
    blocks: [
      {"kind": "text", "lines": ["Vẽ hình tượng hay họa chân dung người họa sĩ hay người thuê vẽ hoặc lâu lâu đến tiệm chụp ảnh...", "Đều nên chọn trong 22 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân"], "Ất": ["Sửu", "Tị"], "Bính": ["Dần"], "Đinh": ["Mẹo", "Tị"], "Mậu": ["Thìn"], "Kỷ": ["Tị", "Hợi"], "Canh": ["Tý", "Dần", "Thân"], "Tân": ["Sửu", "Mẹo", "Tị"], "Nhâm": ["Dần", "Thìn", "Ngọ"], "Quý": ["Mẹo", "Tị", "Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Kiết Tinh: Phúc Sinh, Phúc Hậu, Yếu An, Thánh Tâm, Sinh Khí, Âm Đức, Ích Hậu, Tục Thế.", "Kị các ngày có Hung Tinh: Thiên Ôn, Thọ Tử, Tứ Phế, Câu Giảo, Thần Cách.", "Kị các ngày có Trực: Kiên, Phá."]},
    ],
  },
  59: {
    title: "Cạo Tóc Tiểu Nhi",
    blocks: [
      {"kind": "text", "lines": ["Đứa trẻ mới sinh ra đời được 1 vài tháng nay muốn cạo tóc cho nó cần chọn ngày tốt tính có số ngày Âm lịch như sau:"]},
      {"kind": "grid", "rows": [["Ngày", "Ý Nghĩa", "Ngày", "Ý Nghĩa", "Ngày", "Ý Nghĩa"], ["2", "Tính nó vui", "10", "Có lương lộc, chức tước", "19", "Vui mừng"], ["4", "Phú Qúy", "11", "Thông minh", "22", "Rất tốt"], ["5", "Ăn uống đầy đủ", "13", "Rất tốt", "23", "Rất tốt"], ["7", "Rất tốt", "14", "Có tiền", "25", "Có tiền, có Phước"], ["8", "Sống lâu", "15", "Rất tốt", "26", "Điềm lành"], ["9", "Tốt", "16", "Thêm lợi", "29", "Tốt lành"]]},
      {"kind": "text", "lines": ["Chỉ nói về đứa con đầu lòng:", "Nếu cạo tóc nó nhằm ngày Đinh hoặc nhằm mùng 5 thì da nó hắc ám.", "Bằng cạo nhằm ngày 30 tất nó yếu.", "Lưu ý:", "Nếu có như trên nói thì tất cả tiểu nhi cao tóc nhằm mùng 4 đều được giàu sang hết sao ?! Phải biết cái may mắn đó vẫn thế nhưng nó đến với đứa trẻ vô phước thì khác, đến với đứa trẻ có nhiều phước đức thì khác.", "Như người đang có dư 500$ mình đem cho thêm 100$ thì người đó càng có dư hơn. Gặp người đang thiếu nợ 500$ ta cho 100$ thì chỉ đỡ túng bấn hơn thôi, nhưng cũng vẫn mắc nợ sao có thể so như người kia được.", "Tất cả các mục trong chương này phải hiểu có nghĩa này mới được. Xin hãy nhớ lấy !"]},
    ],
  },
  60: {
    title: "Nhập Học",
    blocks: [
      {"kind": "text", "lines": ["Việc học hành quý nhất cho con người.", "Vậy ngày đầu tiên nhập học hoặc đã học rồi,", "Nay muốn vào học 1 trường mới khác", "Nên chọn trong 22 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Dần", "Thìn", "Thân", "Tuất"], "Ất": ["Mẹo", "Tị", "Mùi", "Hợi"], "Bính": ["Tý", "Thìn", "Ngọ", "Thân"], "Đinh": ["Mùi", "Hợi"], "Mậu": ["Dần", "Thân"], "Tân": ["Mẹo", "Dậu"], "Nhâm": ["Thìn"], "Quý": ["Mẹo", "Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Định, Thành, Khai.", "Nên chọn các ngày có Kiết Tinh: Phúc Sinh, Phúc Hậu, Yếu An, Thánh Tâm, Sinh khí, Âm Đức, Ích Hậu, Tục Thế.", "Kị các ngày có Trực: Bế, Phá."]},
      {"kind": "text", "lines": ["Rất kị:", "Ngày Tứ Phế và ngày Tiền Hiền tử táng", "(là chỉ ông Thương Hiệt tổ sư đặt ra Văn tự Nôm Tử táng là ngày chết và ngày chôn. Ông Thương Hiệt chết ngày Bính Dần và chôn ông ngày Tân Sửu cho nên 2 ngày kị Nhập Học và Cầu Sư)."]},
    ],
  },
  61: {
    title: "Lên Quan Nhậm Chức",
    blocks: [
      {"kind": "text", "lines": ["Đi phó nhâm hay lên quan nhận nhiệm sở là điều quang trọng có thể rất may rủi.", "Nên chọn trong 26 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân"], "Ất": ["Dậu", "Hợi"], "Bính": ["Tý", "Dần", "Ngọ", "Tuất"], "Đinh": ["Mẹo"], "Mậu": ["Tý", "Thìn", "Thân"], "Kỷ": ["Mẹo", "Tị", "Hợi"], "Canh": ["Tý", "Ngọ", "Thân", "Tuất"], "Tân": ["Dậu", "Hợi"], "Nhâm": ["Tý", "Dần", "Ngọ"], "Quý": ["Sửu", "Tị"]}},
      {"kind": "text", "lines": ["Kị các ngày có Trực: Kiên, Mãn, Bình, Phá, Thâu, Bế."]},
    ],
  },
  62: {
    title: "Thừa Kế Tước Phong",
    blocks: [
      {"kind": "text", "lines": ["Phàm tập tước thọ phong để nối nghiệp ông cha hoặc mọi mục thừa kế nên chọn 1 trong 21 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân"], "Bính": ["Tý", "Dần"], "Đinh": ["Mẹo", "Tị", "Dậu"], "Mậu": ["Tý", "Dần", "Ngọ"], "Kỷ": ["Hợi"], "Canh": ["Tý", "Ngọ", "Thân"], "Tân": ["Mẹo", "Hợi"], "Nhâm": ["Tý", "Dần", "Ngọ"], "Quý": ["Mẹo", "Tị"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Kiết Tinh: Thiên Đức, Thiên Xá, Nguyệt Đức, Thiên Hỷ, Vượng Nhật, Quan Nhật, Dân Nhật, Tướng Nhật, Thủ Nhật, Tuế Đức.", "Kị các ngày có Trực: Bình, Phá, Thâu, Bế.", "Kị các ngày có Hung Tinh: Hắc Đạo, Hoang Vu, Phục Đoạn, Diệt Một, Thọ Tử, Phá Bại, Thiên Hưu Phế."]},
    ],
  },
  63: {
    title: "Đi Thi, Ra Ứng Cử",
    blocks: [
      {"kind": "text", "lines": ["Chọn ngày tốt khởi hành đi thi hoặc ra ứng cử phải tùy có mỗi tháng như sau đây:"]},
      {"kind": "text", "lines": ["Tháng Giêng"]},
      {"kind": "days", "days": {"Ất": ["Sửu", "Mùi"], "Đinh": ["Dậu"], "Tân": ["Mùi"]}},
      {"kind": "text", "lines": ["Tháng Hai"]},
      {"kind": "days", "days": {"Bính": ["Dần", "Thân"], "Đinh": ["Tị"], "Kỷ": ["Mẹo"], "Tân": ["Mẹo"], "Nhâm": ["Dần"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Tháng Ba"]},
      {"kind": "days", "days": {"Đinh": ["Dậu"], "Kỷ": ["Dậu"], "Canh": ["Thìn"], "Quý": ["Dậu"]}},
      {"kind": "text", "lines": ["Tháng Tư"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn"], "Canh": ["Tý", "Thìn"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Tháng Năm"]},
      {"kind": "days", "days": {"Giáp": ["Thìn", "Thân"], "Ất": ["Hợi"], "Đinh": ["Hợi"], "Canh": ["Thìn"]}},
      {"kind": "text", "lines": ["Tháng Sáu"]},
      {"kind": "days", "days": {"Giáp": ["Dần"], "Bính": ["Dần"], "Canh": ["Dần"]}},
      {"kind": "text", "lines": ["Tháng Bảy"]},
      {"kind": "days", "days": {"Ất": ["Mùi"], "Tân": ["Mùi"]}},
      {"kind": "text", "lines": ["Tháng Tám"]},
      {"kind": "days", "days": {"Ất": ["Tị"], "Bính": ["Dần"], "Đinh": ["Tị"], "Canh": ["Dần"], "Quý": ["Tị"]}},
      {"kind": "text", "lines": ["Tháng Chín"]},
      {"kind": "days", "days": {"Đinh": ["Dậu"], "Kỷ": ["Tị", "Mẹo"], "Quý": ["Tị"]}},
      {"kind": "text", "lines": ["Tháng Mười"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ"], "Canh": ["Thìn", "Ngọ"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Tháng Mười Một"]},
      {"kind": "days", "days": {"Giáp": ["Tý"], "Ất": ["Tị"], "Canh": ["Tý"]}},
      {"kind": "text", "lines": ["Tháng Chạp"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân"], "Bính": ["Thân"], "Canh": ["Tý", "Ngọ"], "Tân": ["Mẹo"], "Quý": ["Mẹo"]}},
    ],
  },
  64: {
    title: "Cho Vay Mượn",
    blocks: [
      {"kind": "text", "lines": ["Cho vậy mượn cho e có sự thất thoát vậy nên chọn 8 ngày tốt:"]},
      {"kind": "days", "days": {"Ất": ["Mẹo", "Dậu"], "Đinh": ["Sửu"], "Kỷ": ["Tị"], "Canh": ["Thìn", "Ngọ"], "Tân": ["Dậu", "Hợi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành, Mãn.", "Kị các ngày có Trực: Phá."]},
    ],
  },
  65: {
    title: "Thu Nợ",
    blocks: [
      {"kind": "text", "lines": ["Có 9 ngày tốt để đi thu nợ đòi tiền vật:"]},
      {"kind": "days", "days": {"Giáp": ["Dần"], "Ất": ["Sửu", "Tị"], "Bính": ["Dần", "Ngọ"], "Canh": ["Tý", "Dần"], "Tân": ["Dậu"], "Nhâm": ["Ngọ"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành.", "Nên chọn các ngày có Kiết Tinh: Thiên Đức, Nguyệt Đức."]},
    ],
  },
  66: {
    title: "Làm Tương",
    blocks: [
      {"kind": "text", "lines": ["Có 5 ngày rất hợp làm tương:"]},
      {"kind": "days", "days": {"Ất": ["Mùi"], "Bính": ["Thìn", "Thân"], "Đinh": ["Mẹo"], "Mậu": ["Tý"]}},
      {"kind": "text", "lines": ["Gầy tương rất kị gặp ngày Thủy Ngân (Thủy Ngân làm ngộ độc chăng?!)"]},
    ],
  },
  67: {
    title: "Làm Rượu",
    blocks: [
      {"kind": "text", "lines": ["Có 5 ngày tốt để làm rượu:"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ"], "Đinh": ["Mẹo"], "Kỷ": ["Mùi"], "Canh": ["Ngọ"], "Quý": ["Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành, Khai.", "Kị các ngày có Hung Tinh: Diệt Một."]},
    ],
  },
  68: {
    title: "Săn Thú, Lưới Cá",
    blocks: [
      {"kind": "text", "lines": ["Hai ngày Nhâm Dần và Quý Mẹo gọi là Giang Hà Hợp nên đi đánh cá", "Ngày kế sau khí Sương Giang ngày kế trước tiết Lập Xuân và những ngày có Trực Chấp Nguy Thâu đều đặng thuận lợi trong việc đi săn thú.", "Ngày kế sau khí Vũ Thủy ngày kế trước tiết Lập Hạ và những ngày có Trực Chấp Nguy Thâu đều đặng thuận lợi trong việc đánh bắt cá."]},
    ],
  },
  69: {
    title: "Nuôi Tằm",
    blocks: [
      {"kind": "text", "lines": ["Khởi đầu nuôi tằm nên chọn trong 5 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý"], "Đinh": ["Mẹo"], "Mậu": ["Ngọ"], "Canh": ["Ngọ"], "Nhâm": ["Ngọ"]}},
      {"kind": "text", "lines": ["Rất kị ngày Phong Vương Sát:", "Mùa Xuân: là ngày Giáp Dần ngày Canh Tân", "Mùa Hạ: là ngày Thìn Tuất", "Mùa Thu: là ngày Mậu Thìn", "Mùa Đông: là ngày Bính Mậu"]},
    ],
  },
  70: {
    title: "Mua Lợn",
    blocks: [
      {"kind": "text", "lines": ["Khởi đầu nuôi lợn nên chọn trong 9 ngày lợi ích sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn"], "Ất": ["Sửu", "Mùi"], "Bính": ["Thìn"], "Nhâm": ["Tý", "Tuất"], "Quý": ["Sửu", "Mùi"]}},
    ],
  },
  71: {
    title: "Làm Chuồng Lợn",
    blocks: [
      {"kind": "text", "lines": ["Khởi đầu nuôi lợn nên chọn trong 9 ngày lợi ích sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn", "Ngọ", "Tuất"], "Ất": ["Tị", "Mùi"], "Mậu": ["Tý", "Thìn", "Thân"], "Canh": ["Tý", "Thìn"], "Tân": ["Mẹo", "Tị"], "Nhâm": ["Tý", "Dần", "Thân"], "Quý": ["Mẹo"]}},
      {"kind": "text", "lines": ["Cửa chuồng nên làm bề cao 2 thước bề ngang 1 thước 5 tấc (Thước lỗ Ban)."]},
    ],
  },
  72: {
    title: "Sửa Chuồng Lợn",
    blocks: [
      {"kind": "text", "lines": ["Có 3 ngày tốt để sửa chuồng lợn là: Thân Tý Thìn"]},
      {"kind": "text", "lines": ["Rất kị các ngày có: Chánh Tứ Phế, Phi Liêm, Đao Chiêm, Thiên Tặc, Địa Tặc, Thọ Tử."]},
    ],
  },
  73: {
    title: "Mua Ngựa",
    blocks: [
      {"kind": "text", "lines": ["Mua ngựa nên chọn trong 7 ngày thuận lợi sau:"]},
      {"kind": "days", "days": {"Ất": ["Tị", "Dậu", "Hợi"], "Mậu": ["Tý"], "Kỷ": ["Mùi"], "Nhâm": ["Tý", "Thìn"]}},
    ],
  },
  74: {
    title: "Làm Chuồng Ngựa",
    blocks: [
      {"kind": "text", "lines": ["Làm Nôm ngựa nên chọn trong 13 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thân"], "Ất": ["Tị", "Hợi"], "Đinh": ["Mẹo", "Dậu"], "Mậu": ["Tuất"], "Kỷ": ["Mẹo"], "Canh": ["Tý"], "Tân": ["Mẹo", "Mùi"], "Nhâm": ["Tý", "Thìn"]}},
    ],
  },
  75: {
    title: "Mua Trâu",
    blocks: [
      {"kind": "text", "lines": ["Mua trâu nên chọn trong 14 ngày thuận lợi sau:"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Bính": ["Dần"], "Đinh": ["Sửu", "Mẹo", "Dậu"], "Mậu": ["Ngọ", "Tuất"], "Canh": ["Tý", "Ngọ", "Tuất"], "Tân": ["Mẹo", "Hợi"], "Nhâm": ["Tuất"], "Quý": ["Mùi"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Thành, Thâu, Bế."]},
      {"kind": "text", "lines": ["Trong tháng Giêng rất nên chọn ngày Dần Ngọ Tuất", "Trong tháng 6 rất nên chọn ngày Hợi Mẹo Mùi."]},
    ],
  },
  76: {
    title: "Làm Chuồng Trâu",
    blocks: [
      {"kind": "text", "lines": ["Làm chuồng trâu nên chọn trong 11 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Tuất"], "Ất": ["Hợi"], "Bính": ["Tý"], "Kỷ": ["Tị"], "Canh": ["Tý", "Dần", "Thìn", "Ngọ"], "Nhâm": ["Ngọ"], "Quý": ["Mùi"]}},
      {"kind": "text", "lines": ["Có Ngưu Huỳnh Kinh là 4 ngày tốt: Mậu Thìn, Mậu Ngọ, Kỷ Mùi, Tân Dậu."]},
    ],
  },
  77: {
    title: "Mua Gà, Ngỗng, Vịt",
    blocks: [
      {"kind": "text", "lines": ["Mua gà ngỗng vịt nên chọn trong 10 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý", "Thìn", "Ngọ", "Tuất"], "Ất": ["Sửu", "Tị"], "Đinh": ["Mùi"], "Nhâm": ["Ngọ", "Thân"], "Quý": ["Mùi"]}},
      {"kind": "text", "lines": ["Kị các ngày có Hung Tinh: Phá Quân."]},
    ],
  },
  78: {
    title: "Làm Chuồng Gà, Ngỗng, Vịt",
    blocks: [
      {"kind": "text", "lines": ["Làm chuồng gà ngỗng vịt nên chọn trong 20 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thìn"], "Ất": ["Sửu", "Tị", "Mùi"], "Bính": ["Thìn"], "Đinh": ["Tị", "Dậu"], "Mậu": ["Thìn", "Ngọ"], "Canh": ["Tý", "Dần"], "Tân": ["Sửu", "Mẹo", "Tị"], "Nhâm": ["Tý", "Thìn", "Ngọ", "Tuất"], "Quý": ["Mùi", "Dậu"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Mãn, Thành, Khai.", "Kị các ngày có Hung Tinh: Đao Chiêm, Đại Hao, Tiểu Hao, Tứ Phế."]},
    ],
  },
  79: {
    title: "Nạp Chó",
    blocks: [
      {"kind": "text", "lines": ["Chó giữ nhà hoặc mua hoặc xin nay muốn đem về nhà nuôi cho lợi chủ nên chọn trong 9 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ"], "Ất": ["Mùi", "Dậu"], "Bính": ["Thìn", "Ngọ"], "Mậu": ["Ngọ"], "Tân": ["Tị"], "Nhâm": ["Thìn", "Ngọ"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Mãn, Thành, Khai.", "Kị các ngày có Hung Tinh: Đao Chiêm, Đại Hao, Tiểu Hao, Tứ Phế."]},
      {"kind": "text", "lines": ["Người ta thường nói ăn thịt chó bớt Phước ăn nhiều lần ắt vận suy là vì sao ? Trong chũ Hán chữ Ngục có chữ Khuyển. Vả lại có ngữ thường loài chó có tới 4 Đức. Nghĩa Lễ Trí Tín. Nó chỉ thiếu Đức Nhân mà thôi vì vậy nuôi chó thì chỉ có hên chớ không có xui không nên bỏ nó bị ghẻ bị đói. Ngoại trừ trường hợp chó mới xin về cứ tru mãi thì nên đem cho đi có cho cũng nên cho người nuôi không cho người ăn thịt."]},
    ],
  },
  80: {
    title: "Nạp Mèo",
    blocks: [
      {"kind": "text", "lines": ["Mua hoặc xin mèo đem về nuôi nên chọn trong 8 ngày tốt sau:"]},
      {"kind": "days", "days": {"Giáp": ["Tý"], "Ất": ["Sửu"], "Bính": ["Thìn", "Ngọ"], "Canh": ["Tý", "Ngọ"], "Nhâm": ["Tý", "Ngọ"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Kiết Tinh: Thiên Đức, Nguyệt Đức, Sinh Khí.", "Kị các ngày có Hung Tinh: Phi Liêm."]},
      {"kind": "text", "lines": ["Tướng Mèo:", "Thân Mình ngắn là tốt nhất.", "Hoặc mắt như bạc như vàng đuôi dài mặt oai như hổ tiếng kêu chấn động như hét lên."]},
    ],
  },
  81: {
    title: "Cầu Thầy Trị Bệnh",
    blocks: [
      {"kind": "text", "lines": ["Có bệnh tất phải rước thầy thước trị bệnh ngày nhưng nếu may mắn vừa tới ngày:"]},
      {"kind": "days", "days": {"Bính": ["Thìn"], "Kỷ": ["Dậu"], "Nhâm": ["Thìn"]}},
      {"kind": "text", "lines": ["Chớ có trì hoãn qua ngày khác vì 3 ngày này rất tốt trong việc trị bệnh trị mau lành.", "Nên chọn các ngày có Kiết Tinh: Thiên Y, Sinh Khí, Phỏ Hộ, Yếu An, Thần Tài.", "Nên chọn các ngày có Trực: Chấp, Trừ, Thành, Khai."]},
    ],
  },
  82: {
    title: "Bốc Thuốc",
    blocks: [
      {"kind": "text", "lines": ["Như muốn hiệp lại nhiều vị thuốc để bào chế thành 1 khối thuốc to hoặc như là 1 tể thuốc uống nhiều ngày ... thì nên chọn ngày tốt. Hoặc làm thầy khi ra nghề ngày đầu tiên bốc thuốc cho bệnh nhân nên chọn trong 13 ngày tốt sau đây:"]},
      {"kind": "days", "days": {"Giáp": ["Thân"], "Ất": ["Mùi", "Hợi"], "Bính": ["Ngọ", "Tuất"], "Mậu": ["Dần", "Thìn"], "Kỷ": ["Tị", "Mùi"], "Canh": ["Ngọ"], "Tân": ["Mẹo", "Hợi"], "Nhâm": ["Thân"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Trừ, Phá, Khai."]},
    ],
  },
  83: {
    title: "Uống Thuốc",
    blocks: [
      {"kind": "text", "lines": ["Bệnh ngặt gấp không luận nhưng hưỡn cũng nên chọn ngày đầu tiên dùng thuốc hoặc như mới làm xong 1 tể thuốc hay ngâm xong 1 hũ rượu thuốc tất nhiên là phải uống trường kỳ vậy nên chọn trong 21 ngày tốt sau đây để khởi đầu uống:"]},
      {"kind": "days", "days": {"Giáp": ["Ngọ", "Thân"], "Ất": ["Sửu", "Hợi"], "Bính": ["Tý", "Thân", "Tuất"], "Đinh": ["Sửu", "Dậu"], "Mậu": ["Thân", "Tuất"], "Kỷ": ["Sửu", "Dậu", "Hợi"], "Canh": ["Tý"], "Tân": ["Sửu", "Dậu"], "Nhâm": ["Thìn", "Thân"], "Quý": ["Tị", "Dậu"]}},
      {"kind": "text", "lines": ["Nên chọn các ngày có Trực: Trừ, Phá, Khai.", "Kị các ngày có Trực: Mãn.", "Kị các ngày: Mùi"]},
      {"kind": "text", "lines": ["Nam kị trực Trừ nữ kị trực Thâu", "Có 3 hạng Sao: Kiết Tú là sao tốt nhiều hoặc trọn tốt. Bình Tú là Sao có tốt có xấu, là Sao trung bình.", "Hung Tú là Sao Hung bại nhiều hoặc trọn Hung. Tên của mỗi Sao thường đi kèm với 1 trong Thất Tinh (Kim, Mộc, Thủy, Hỏa, Thổ, Nhật, Nguyệt) và 1 con thú nào đó.", "Thứ tự và tên chữ đầu của 24 Sao là: Giác, Cang, Đê, Phòng, Tâm, Vỹ, Cơ, Đẩu, Ngưu, Nữ, Hư, Nguy, Thất, Bích, Khuê, Lâu, Vị, Mẹo, Tất, Chủy, Sâm, Tĩnh, Quỷ, Liễu, Tinh, Trương, Dực, Chẩn.", "Sau đây là sự phân định tốt xấu cho các Sao, sẽ thấy rõ nó khác với các sách xem ngày giờ bày bán trên thị trường, bởi có thêm phần Ngoại lệ mà các người viết sách kia có lẽ cố tình dấu nhẹm đi vậy."]},
    ],
  },
};
