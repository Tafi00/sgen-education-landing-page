const blogArrows = "/assets/blog/blog-numerology-arrows.webp";
const blogCalculation = "/assets/blog/blog-pythagoras-calculation.webp";
const blogName = "/assets/blog/blog-name-numerology.webp";
const blogPyramid = "/assets/blog/blog-life-pyramid.webp";
export type BlogPost = {
  slug: string;
  image: string;
  title: string;
  category: "Thần số học" | "Ứng dụng" | "Mối quan hệ" | "Phong thủy";
  date: string;
  readTime: string;
  excerpt: string;
  content: { heading?: string; paragraphs: string[]; bullets?: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "than-so-hoc-la-gi",
    image: blogCalculation,
    title: "Thần số học là gì? Ứng dụng trong cuộc sống hiện đại",
    category: "Thần số học",
    date: "15.08.2026",
    readTime: "3 phút đọc",
    excerpt: "Hiểu đúng vai trò của con số như một hệ thống quan sát bản thân, không phải công cụ đóng khung số phận.",
    content: [
      { paragraphs: ["Thần số học Pythagoras sử dụng tên và ngày sinh để tạo nên một bộ chỉ số mô tả xu hướng tính cách, động lực và cách một người tương tác với môi trường.", "Giá trị của công cụ không nằm ở việc dự đoán tương lai, mà ở khả năng đặt ra những câu hỏi đúng về năng lượng, môi trường phát triển và thói quen cần điều chỉnh."] },
      { heading: "Một bản đồ, không phải một nhãn dán", paragraphs: ["Một bản đọc tốt luôn cần được đối chiếu với trải nghiệm thật. Hai người có cùng chỉ số vẫn có thể biểu hiện rất khác nhau vì môi trường sống, giáo dục và lựa chọn cá nhân."], bullets: ["Dùng kết quả để mở rộng góc nhìn", "Kiểm chứng bằng trải nghiệm thực tế", "Không dùng chỉ số để giới hạn bản thân hoặc người khác"] },
      { heading: "Ứng dụng thế nào cho đúng?", paragraphs: ["Hãy bắt đầu từ một câu hỏi cụ thể như lựa chọn nghề nghiệp, phong cách học tập hoặc cách giao tiếp. Sau đó chọn nhóm chỉ số liên quan và chuyển nhận định thành một hành động nhỏ có thể kiểm chứng."] },
    ],
  },
  {
    slug: "bang-chu-cai-than-so-hoc",
    image: blogName,
    title: "Giải mã bảng chữ cái Thần số học theo tên",
    category: "Thần số học",
    date: "13.08.2026",
    readTime: "3 phút đọc",
    excerpt: "Tên khai sinh được chuyển đổi thành con số như thế nào và vì sao mỗi nhóm chữ lại mang một lớp ý nghĩa khác nhau?",
    content: [
      { paragraphs: ["Trong hệ Pythagoras, các chữ cái được quy đổi tuần tự từ 1 đến 9. Tổng giá trị của họ tên tạo nên các chỉ số liên quan đến năng lực biểu đạt, động lực nội tâm và cách bạn xuất hiện trước môi trường."] },
      { heading: "Ba lớp thông tin từ họ tên", paragraphs: ["Không nên chỉ cộng toàn bộ tên rồi dừng lại ở một con số. Nguyên âm, phụ âm và tổng thể tên trả lời ba nhóm câu hỏi khác nhau."], bullets: ["Nguyên âm: động lực và nhu cầu sâu bên trong", "Phụ âm: cách bạn thể hiện và tạo ấn tượng", "Toàn bộ họ tên: năng lực và hướng đóng góp"] },
      { heading: "Lưu ý khi tính tên tiếng Việt", paragraphs: ["Cần chuẩn hóa dấu tiếng Việt nhưng vẫn giữ nguyên chữ Đ thành D, sử dụng đầy đủ họ tên khai sinh và áp dụng nhất quán một bảng quy đổi."] },
    ],
  },
  {
    slug: "nam-ca-nhan-lap-ke-hoach",
    image: blogPyramid,
    title: "Năm cá nhân và cách lập kế hoạch 12 tháng",
    category: "Ứng dụng",
    date: "08.08.2026",
    readTime: "3 phút đọc",
    excerpt: "Biến chu kỳ năm thành một khung phản tư và ưu tiên hành động phù hợp với nguồn lực thực tế.",
    content: [
      { paragraphs: ["Năm cá nhân là một chu kỳ tham khảo được tính từ ngày, tháng sinh và năm hiện tại. Mỗi chu kỳ gợi ý một chủ đề phát triển khác nhau."] },
      { heading: "Từ con số đến kế hoạch", paragraphs: ["Bạn có thể dùng chủ đề của năm để rà soát mục tiêu thay vì cố ép mọi quyết định theo một lời dự đoán."], bullets: ["Việc nào cần khởi động", "Việc nào cần củng cố", "Điều gì nên hoàn tất trước khi mở vòng mới"] },
      { heading: "Giữ kế hoạch trong thực tế", paragraphs: ["Chu kỳ không thay thế nguồn lực, thời gian và hoàn cảnh. Hãy đặt mục tiêu theo quý, kiểm tra mỗi tháng và điều chỉnh khi dữ liệu thực tế thay đổi."] },
    ],
  },
  {
    slug: "can-so-tinh-cam",
    image: blogArrows,
    title: "Cân số tình cảm: khi hai người khác nhịp",
    category: "Mối quan hệ",
    date: "05.08.2026",
    readTime: "3 phút đọc",
    excerpt: "Khác biệt không nhất thiết là xung khắc nếu hai người hiểu nhu cầu cốt lõi và thống nhất cách giao tiếp.",
    content: [
      { paragraphs: ["Trong một mối quan hệ, khác nhịp thường xuất hiện ở tốc độ ra quyết định, nhu cầu giao tiếp và cách mỗi người phục hồi năng lượng."] },
      { heading: "Không tìm một kết luận hợp hay không hợp", paragraphs: ["Bản đồ cá nhân hữu ích nhất khi nó giúp hai người gọi tên khác biệt và thống nhất cách trao đổi lúc căng thẳng."], bullets: ["Nói rõ nhu cầu thay vì chờ đối phương đoán", "Phân biệt thời gian riêng với sự xa cách", "Thống nhất cách dừng và quay lại cuộc trò chuyện"] },
      { heading: "Yếu tố quyết định vẫn là hành vi", paragraphs: ["Khả năng lắng nghe, tôn trọng ranh giới và cùng xây thói quen kết nối luôn quan trọng hơn mức độ tương hợp của bất kỳ cặp chỉ số nào."] },
    ],
  },
  {
    slug: "ba-nguyen-tac-chon-ngay",
    image: blogPyramid,
    title: "Ba nguyên tắc chọn ngày cho việc quan trọng",
    category: "Phong thủy",
    date: "28.07.2026",
    readTime: "3 phút đọc",
    excerpt: "Ngày tốt cần phù hợp loại việc, người thực hiện và điều kiện chuẩn bị thực tế.",
    content: [
      { paragraphs: ["Không có một ngày tốt tuyệt đối cho tất cả mọi người và mọi hoạt động. Trước tiên cần xác định rõ loại việc: ký kết, khởi công, di chuyển hay gặp gỡ."] },
      { heading: "Ba lớp cần đối chiếu", paragraphs: ["Một lựa chọn có trách nhiệm cần xem đồng thời tính chất ngày, người chủ sự và hoàn cảnh triển khai."], bullets: ["Đúng loại việc", "Hạn chế xung khắc rõ ràng", "Kế hoạch và nguồn lực đã sẵn sàng"] },
      { heading: "Lịch pháp không thay thế chuẩn bị", paragraphs: ["Một ngày phù hợp chỉ phát huy giá trị khi con người, tài liệu và phương án dự phòng đã được chuẩn bị đầy đủ."] },
    ],
  },
  {
    slug: "chi-so-truong-thanh",
    image: blogCalculation,
    title: "Chỉ số trưởng thành nói gì về chặng đường dài?",
    category: "Ứng dụng",
    date: "22.07.2026",
    readTime: "3 phút đọc",
    excerpt: "Cách năng lượng Đường đời và Sứ mệnh hội tụ khi bạn tích lũy đủ trải nghiệm.",
    content: [
      { paragraphs: ["Chỉ số trưởng thành được tính từ Đường đời và Sứ mệnh. Nó mô tả một hướng năng lượng có xu hướng rõ hơn khi bạn đã trải qua đủ va chạm và hiểu cách dùng thế mạnh của mình."] },
      { heading: "Không phải đợi đến một độ tuổi cố định", paragraphs: ["Năng lượng trưởng thành có thể xuất hiện sớm hay muộn tùy vào môi trường, trách nhiệm và mức độ chủ động học từ trải nghiệm."], bullets: ["Quan sát điều lặp lại trong lựa chọn", "Nhận diện năng lực ngày càng tự nhiên", "Kết nối thành tựu cá nhân với giá trị đóng góp"] },
      { heading: "Dùng chỉ số như một câu hỏi dài hạn", paragraphs: ["Thay vì hỏi khi nào mình sẽ thành công, hãy hỏi mình đang cần rèn năng lực nào để tiến gần hơn tới phiên bản trưởng thành đó."] },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
