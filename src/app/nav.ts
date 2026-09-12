export type NavChild = { label: string; href: string; description?: string };

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

/** Cấu trúc 9 menu cấp 1 theo feedback khách hàng. */
export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Giới thiệu",
    href: "/gioi-thieu",
    children: [
      { label: "Tầm nhìn", href: "/gioi-thieu/tam-nhin", description: "Định hướng dài hạn của SGEN" },
      { label: "Sứ mệnh", href: "/gioi-thieu/su-menh", description: "Vì sao SGEN tồn tại" },
      { label: "Giá trị cốt lõi", href: "/gioi-thieu/gia-tri-cot-loi", description: "Nguyên tắc làm nghề" },
      { label: "Liên hệ", href: "/lien-he", description: "Kênh trao đổi trực tiếp" },
    ],
  },
  {
    label: "Tra cứu Thần số học",
    href: "/tra-cuu",
    children: [
      { label: "Tra cứu Thần số học", href: "/tra-cuu/than-so-hoc", description: "Tám chỉ số từ tên và ngày sinh" },
      { label: "Trắc nghiệm DISC", href: "/tra-cuu/disc", description: "Bốn nhóm hành vi trong công việc" },
      { label: "Trắc nghiệm MBTI", href: "/tra-cuu/mbti", description: "Bốn cặp xu hướng tính cách" },
    ],
  },
  {
    label: "Dịch vụ",
    href: "/dich-vu",
    children: [
      { label: "Mua VIP Thần số học", href: "/dich-vu/vip-than-so-hoc", description: "Mở khoá luận giải chuyên sâu" },
      { label: "Xem Thần số học trọn đời", href: "/dich-vu/than-so-hoc-tron-doi", description: "Bản đồ số học dùng trọn đời" },
      { label: "Định hướng nghề nghiệp", href: "/dich-vu/dinh-huong-nghe-nghiep", description: "Tư vấn chọn hướng phù hợp" },
    ],
  },
  {
    label: "Phong thủy sim số điện thoại",
    href: "/sim-phong-thuy",
    children: [{ label: "Phần mềm bói sim phong thủy", href: "/sim-phong-thuy/boi-sim", description: "Luận quẻ, ngũ hành, âm dương" }],
  },
  {
    label: "Công cụ phong thủy",
    href: "/cong-cu-phong-thuy",
    children: [
      { label: "Gieo quẻ Kinh Dịch", href: "/cong-cu-phong-thuy/gieo-que-kinh-dich", description: "Lập quẻ theo ba đồng xu" },
      { label: "Phân tích Tứ Trụ Bát Tự", href: "/cong-cu-phong-thuy/tu-tru-bat-tu", description: "Lá số bốn trụ và vận hạn" },
      { label: "Xem ngày", href: "/cong-cu-phong-thuy/xem-ngay", description: "Ngày tốt xấu theo lịch pháp Việt Nam" },
    ],
  },
  { label: "Khóa học", href: "/khoa-hoc" },
  { label: "Free tools", href: "/free-tools" },
  { label: "Blog", href: "/blog" },
];

export const FOOTER_NAV: NavItem[] = [
  ...PRIMARY_NAV,
  { label: "Liên hệ", href: "/lien-he" },
];

export const AUTH_NAV: NavItem = { label: "Đăng nhập", href: "/dang-nhap" };
