import type { DefaultService } from "./types";

/**
 * Gói dịch vụ mặc định.
 *
 * Giá chỉ là số tạm để hệ thống vận hành được — cần khách hàng xác nhận trước khi
 * công bố. Mọi gói đều có `priceNote` nhắc rằng giá điều chỉnh được trong CMS.
 */
export const defaultServices: DefaultService[] = [
  {
    slug: "vip-than-so-hoc",
    name: "VIP Thần số học 90 ngày",
    tagline: "Đồng hành sát sao trong ba tháng để biến bản đồ số học thành hành động cụ thể.",
    price: 4900000,
    compareAtPrice: 6900000,
    priceNote: "Giá tham khảo, có thể chỉnh trong CMS",
    durationLabel: "90 ngày",
    description: "Gói đồng hành cá nhân dành cho người muốn đi sâu vào bản đồ số học của chính mình. Bạn được phân tích đầy đủ tám chỉ số, nhận lộ trình hành động theo chu kỳ hiện tại và trao đổi định kỳ với chuyên gia trong suốt ba tháng.",
    deliverables: [
      "Phân tích đầy đủ tám chỉ số nền tảng theo tên và ngày sinh",
      "Bản đồ số học cá nhân kèm phần diễn giải chi tiết",
      "Lộ trình hành động 90 ngày theo năm cá nhân hiện tại",
      "Sáu buổi trao đổi trực tuyến với chuyên gia",
      "Bộ tài liệu thực hành và bài tập tự rà soát hằng tháng",
      "Kênh hỗ trợ hỏi đáp trong suốt thời gian đồng hành",
    ],
    audience: [
      "Người đang cân nhắc chuyển hướng học tập hoặc nghề nghiệp",
      "Người muốn hiểu rõ nhu cầu và mô thức hành vi của bản thân",
      "Phụ huynh cần góc nhìn thêm về con trong giai đoạn chuyển cấp",
      "Người đã biết Thần số học nhưng chưa tự diễn giải được bản đồ của mình",
    ],
    coverImage: "/assets/programs/program-numerology-v2.webp",
    entitlementType: "vip-numerology",
    entitlementDays: 90,
    ctaLabel: "Đăng ký gói VIP",
    isFeatured: true,
    order: 1,
  },
  {
    slug: "than-so-hoc-tron-doi",
    name: "Thần số học trọn đời",
    tagline: "Sở hữu trọn bộ nội dung và công cụ Thần số học của SGEN, cập nhật không giới hạn thời gian.",
    price: 9900000,
    compareAtPrice: 14900000,
    priceNote: "Giá tham khảo, có thể chỉnh trong CMS",
    durationLabel: "Trọn đời",
    description: "Gói trọn đời dành cho người học nghiêm túc, muốn sử dụng lâu dài toàn bộ học liệu Thần số học của SGEN. Quyền truy cập không giới hạn thời gian, bao gồm các bản cập nhật nội dung và công cụ tra cứu trong tương lai.",
    deliverables: [
      "Quyền truy cập toàn bộ khóa học Thần số học hiện có",
      "Toàn bộ học liệu, bài tập và mẫu phân tích dạng số",
      "Công cụ tra cứu bản đồ cá nhân không giới hạn lượt",
      "Bản cập nhật nội dung mới trong suốt thời gian sử dụng",
      "Buổi phân tích tổng thể ban đầu cùng chuyên gia",
      "Ưu tiên tham gia các chuyên đề bổ trợ do SGEN tổ chức",
      "Kênh hỏi đáp học thuật dành riêng cho học viên trọn đời",
    ],
    audience: [
      "Người học nghiêm túc muốn đào sâu lâu dài",
      "Người làm nghề đồng hành, khai vấn cần học liệu thường xuyên",
      "Phụ huynh muốn tra cứu cho nhiều thành viên trong gia đình",
    ],
    coverImage: "/assets/illustrations/pythagoras-cosmic.webp",
    entitlementType: "lifetime",
    entitlementDays: 0,
    ctaLabel: "Sở hữu trọn đời",
    isFeatured: false,
    order: 2,
  },
  {
    slug: "dinh-huong-nghe-nghiep",
    name: "Định hướng nghề nghiệp",
    tagline: "Buổi tư vấn chuyên sâu giúp nối năng lực tự nhiên với môi trường làm việc phù hợp.",
    price: 2500000,
    compareAtPrice: 0,
    priceNote: "Giá tham khảo, có thể chỉnh trong CMS",
    durationLabel: "1 buổi 90 phút",
    description: "Dịch vụ tư vấn một buổi dành cho người cần một điểm tựa trước quyết định nghề nghiệp. Chuyên gia phân tích bản đồ số học kết hợp khung Ikigai và thông tin thị trường để cùng bạn xây danh sách hướng đi khả thi.",
    deliverables: [
      "Phân tích chỉ số liên quan đến năng lực và động lực làm việc",
      "Đối chiếu ba nhóm hướng nghề phù hợp với hồ sơ cá nhân",
      "Buổi trao đổi trực tuyến 90 phút cùng chuyên gia",
      "Bản tóm tắt định hướng và các bước chuẩn bị tiếp theo",
      "Gợi ý kỹ năng cần rèn trong 6 đến 12 tháng tới",
    ],
    audience: [
      "Học sinh, sinh viên chuẩn bị chọn ngành hoặc nghề",
      "Người đi làm muốn chuyển hướng sự nghiệp",
      "Người mới trở lại thị trường lao động sau thời gian gián đoạn",
      "Phụ huynh muốn đồng hành cùng con trong chọn nghề",
    ],
    coverImage: "/assets/methods/method-ikigai.webp",
    entitlementType: "",
    entitlementDays: 0,
    ctaLabel: "Đặt lịch tư vấn",
    isFeatured: false,
    order: 3,
  },
] satisfies DefaultService[];
