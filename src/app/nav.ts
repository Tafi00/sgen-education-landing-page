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
    href: "/",
    children: [
      { label: "Tầm nhìn", href: "/#tam-nhin", description: "Định hướng dài hạn của SGEN" },
      { label: "Sứ mệnh", href: "/#su-menh", description: "Vì sao SGEN tồn tại" },
      { label: "Giá trị cốt lõi", href: "/#gia-tri-cot-loi", description: "Nguyên tắc làm nghề" },
      { label: "Liên hệ", href: "/#lien-he", description: "Kênh trao đổi trực tiếp" },
    ],
  },
  {
    label: "Tra cứu Thần số học",
    href: "/tra-cuu",
    children: [
      { label: "Tra cứu Thần số học", href: "/tra-cuu", description: "Tám chỉ số từ tên và ngày sinh" },
      { label: "Tra cứu DISC", href: "/tra-cuu/disc", description: "Bốn nhóm hành vi trong công việc" },
      { label: "Tra cứu MBTI", href: "/tra-cuu/mbti", description: "Bốn cặp xu hướng tính cách" },
    ],
  },
  {
    label: "Dịch vụ",
    href: "/dich-vu",
    children: [
      { label: "Mua Vip Thần số học", href: "/dich-vu/vip-than-so-hoc", description: "Mở khoá luận giải chuyên sâu và đồng hành 90 ngày" },
      { label: "Xem Thần số học trọn đời", href: "/dich-vu/than-so-hoc-tron-doi", description: "Bản đồ số học và công cụ sử dụng trọn đời" },
      { label: "Định hướng nghề nghiệp phù hợp", href: "/dich-vu/dinh-huong-nghe-nghiep", description: "Tư vấn chuyên sâu 1:1 cùng chuyên gia" },
    ],
  },
  {
    label: "Phong thủy sim số điện thoại",
    href: "/sim-phong-thuy/boi-sim",
    children: [
      { label: "Phần mềm bói sim phong thủy", href: "/sim-phong-thuy/boi-sim", description: "Bói sim Kinh Dịch, Bát Cực Linh Số & Bát Tự" },
    ],
  },
  {
    label: "Công cụ phong thủy",
    href: "/cong-cu-phong-thuy",
    children: [
      { label: "Gieo Quẻ Kinh Dịch", href: "/cong-cu-phong-thuy/gieo-que-kinh-dich", description: "Tung 3 đồng xu, lập quẻ chủ và quẻ biến" },
      { label: "Tứ Trụ Bát Tự", href: "/cong-cu-phong-thuy/tu-tru-bat-tu", description: "An bốn trụ theo tiết khí" },
      { label: "Xem ngày tốt xấu", href: "/cong-cu-phong-thuy/xem-ngay", description: "Chọn thời điểm theo trực, kiến trừ" },
    ],
  },
  {
    label: "Khóa học",
    href: "/khoa-hoc",
    children: [
      { label: "Thần số học", href: "/khoa-hoc/than-so-hoc-can-ban", description: "Hệ Pythagoras và tám chỉ số nền tảng" },
      { label: "Sinh trắc vân tay", href: "/khoa-hoc/sinh-trac-van-tay-ung-dung", description: "Đọc nhóm vân tay và ứng dụng đồng hành" },
      { label: "Gieo quẻ Kinh Dịch", href: "/khoa-hoc/gieo-que-kinh-dich", description: "Lập quẻ, hào động và phép đọc" },
      { label: "Tứ trụ Bát tự Tử Bình", href: "/khoa-hoc/tu-tru-bat-tu", description: "An bốn trụ, thập thần và đại vận" },
      { label: "Phong thủy Kinh dịch sim số", href: "/khoa-hoc/phong-thuy-kinh-dich-sim-so", description: "Luận dãy số theo bát quái" },
      { label: "Phong thủy Huyền không phi tinh", href: "/khoa-hoc/huyen-khong-phi-tinh", description: "An tinh bàn theo vận và hướng" },
      { label: "Phong thủy Huyền không đại quái", href: "/khoa-hoc/huyen-khong-dai-quai", description: "Huyền không theo quẻ" },
      { label: "Phong thủy tình duyên và hôn nhân", href: "/khoa-hoc/tinh-duyen-hon-nhan", description: "Đối chiếu hai bản đồ quan hệ" },
      { label: "Phong thủy trạch cát xem ngày tốt/xấu", href: "/khoa-hoc/phong-thuy-trach-cat-xem-ngay", description: "Chọn ngày tốt/xấu theo trực" },
      { label: "Phong thủy âm trạch Dương công cổ phái", href: "/khoa-hoc/phong-thuy-am-trach", description: "Địa thế và thủy cục âm trạch" },
      { label: "Phong thủy dương trạch Dương công cổ phái", href: "/khoa-hoc/phong-thuy-duong-trach", description: "Bố trí nhà ở theo dương trạch" },
    ],
  },
  {
    label: "Free tools",
    href: "/free-tools",
    children: [
      { label: "Tính nhanh chỉ số", href: "/free-tools#nhom-tinh-nhanh", description: "Tám chỉ số nền tảng tính tại chỗ" },
      { label: "Công cụ miễn phí khác", href: "/free-tools#nhom-cong-cu-khac", description: "Chỉ số theo thời gian và kết nối" },
      { label: "Công cụ phong thủy", href: "/free-tools#nhom-phong-thuy", description: "Gieo quẻ, Tứ trụ, xem ngày" },
      { label: "Ý nghĩa các con số", href: "/free-tools#y-nghia-cac-con-so", description: "Từ 1–9 và hai số bậc thầy" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    children: [
      { label: "Thư viện kiến thức", href: "/blog/kien-thuc", description: "Bài viết theo chuyên mục" },
      { label: "Kiến thức nền tảng", href: "/blog?category=kien-thuc", description: "Cách tính và ý nghĩa chỉ số" },
      { label: "Ứng dụng", href: "/blog?category=ung-dung", description: "Biến chỉ số thành hành động" },
      { label: "Mối quan hệ", href: "/blog?category=moi-quan-he", description: "Tương hợp và giao tiếp" },
      { label: "Phong thủy", href: "/blog?category=phong-thuy", description: "Chọn ngày, hướng và không gian" },
    ],
  },
];

export const FOOTER_NAV: NavItem[] = [
  ...PRIMARY_NAV,
  { label: "Liên hệ", href: "/#lien-he" },
];

export const AUTH_NAV: NavItem = { label: "Đăng nhập", href: "/dang-nhap" };
