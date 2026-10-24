import { Solar } from "lunar-javascript";
import { getReferenceActionAdvice } from "./reference-action-advice.generated";
import { REFERENCE_AUGUST_2026 } from "./reference-august-2026.generated";
import { getReferenceDayEnergy } from "./reference-day-energy.generated";
import { getReferenceDayStarDetails } from "./reference-day-stars.generated";
import { getReferenceDayAgeRelations } from "./reference-day-age-relations.generated";

export type ElementName = "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";

export type Pillar = {
  stem: string;
  branch: string;
  stemElement: ElementName;
  branchElement: ElementName;
  polarity: "Dương" | "Âm";
};

export type TimeCalculationMode = "civil" | "mean" | "apparent";

export type BaziRelation = {
  kind: "combine" | "clash" | "harm" | "punishment" | "break";
  system: "Thiên can" | "Địa chi";
  label: string;
  members: string[];
};

export type HaLacLine = {
  value: 6 | 9;
  position: number;
  isOriginal: boolean;
  startAge?: number;
  endAge?: number;
};

export type HaLacHexagram = {
  upperTrigram: number;
  lowerTrigram: number;
  name: string;
  lines: HaLacLine[];
  limitAge: number;
};

export type HaLacChart = {
  totals: { yang: number; yin: number };
  hoaCong: string;
  thienNguyen: string;
  diaNguyen: string;
  preHeaven: HaLacHexagram;
  postHeaven: HaLacHexagram;
  annual: Array<{ age: number; year: number; pillar: Pillar; hexagram: HaLacHexagram }>;
};

const STEMS = [
  { han: "甲", name: "Giáp", element: "Mộc", polarity: "Dương" },
  { han: "乙", name: "Ất", element: "Mộc", polarity: "Âm" },
  { han: "丙", name: "Bính", element: "Hỏa", polarity: "Dương" },
  { han: "丁", name: "Đinh", element: "Hỏa", polarity: "Âm" },
  { han: "戊", name: "Mậu", element: "Thổ", polarity: "Dương" },
  { han: "己", name: "Kỷ", element: "Thổ", polarity: "Âm" },
  { han: "庚", name: "Canh", element: "Kim", polarity: "Dương" },
  { han: "辛", name: "Tân", element: "Kim", polarity: "Âm" },
  { han: "壬", name: "Nhâm", element: "Thủy", polarity: "Dương" },
  { han: "癸", name: "Quý", element: "Thủy", polarity: "Âm" },
] as const;

const BRANCHES = [
  { han: "子", name: "Tý", element: "Thủy" },
  { han: "丑", name: "Sửu", element: "Thổ" },
  { han: "寅", name: "Dần", element: "Mộc" },
  { han: "卯", name: "Mão", element: "Mộc" },
  { han: "辰", name: "Thìn", element: "Thổ" },
  { han: "巳", name: "Tị", element: "Hỏa" },
  { han: "午", name: "Ngọ", element: "Hỏa" },
  { han: "未", name: "Mùi", element: "Thổ" },
  { han: "申", name: "Thân", element: "Kim" },
  { han: "酉", name: "Dậu", element: "Kim" },
  { han: "戌", name: "Tuất", element: "Thổ" },
  { han: "亥", name: "Hợi", element: "Thủy" },
] as const;

export const ELEMENTS: ElementName[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"];

const HIDDEN_STEMS: Record<string, string[]> = {
  Tý: ["Quý"],
  Sửu: ["Kỷ", "Quý", "Tân"],
  Dần: ["Giáp", "Bính", "Mậu"],
  Mão: ["Ất"],
  Thìn: ["Mậu", "Ất", "Quý"],
  Tị: ["Bính", "Mậu", "Canh"],
  Ngọ: ["Đinh", "Kỷ"],
  Mùi: ["Kỷ", "Đinh", "Ất"],
  Thân: ["Canh", "Nhâm", "Mậu"],
  Dậu: ["Tân"],
  Tuất: ["Mậu", "Tân", "Đinh"],
  Hợi: ["Nhâm", "Giáp"],
};

const NA_YIN = [
  "Hải Trung Kim", "Lư Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim",
  "Sơn Đầu Hỏa", "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc",
  "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy",
  "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bích Thượng Thổ", "Kim Bạch Kim",
  "Phúc Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Tang Đố Mộc",
  "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy",
] as const;

const LIFE_STAGES = ["Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"] as const;
const LIFE_STAGE_STARTS = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3] as const;

const SOLAR_TERM_VI: Record<string, string> = {
  "小寒": "Tiểu Hàn", "大寒": "Đại Hàn", "立春": "Lập Xuân", "雨水": "Vũ Thủy",
  "惊蛰": "Kinh Trập", "驚蟄": "Kinh Trập", "春分": "Xuân Phân", "清明": "Thanh Minh", "谷雨": "Cốc Vũ", "穀雨": "Cốc Vũ",
  "立夏": "Lập Hạ", "小满": "Tiểu Mãn", "小滿": "Tiểu Mãn", "芒种": "Mang Chủng", "芒種": "Mang Chủng", "夏至": "Hạ Chí",
  "小暑": "Tiểu Thử", "大暑": "Đại Thử", "立秋": "Lập Thu", "处暑": "Xử Thử", "處暑": "Xử Thử",
  "白露": "Bạch Lộ", "秋分": "Thu Phân", "寒露": "Hàn Lộ", "霜降": "Sương Giáng",
  "立冬": "Lập Đông", "小雪": "Tiểu Tuyết", "大雪": "Đại Tuyết", "冬至": "Đông Chí",
};

const TERM_VI: Record<string, string> = {
  "嫁娶": "Cưới hỏi", "订婚": "Đính hôn", "納采": "Nạp thái", "纳采": "Nạp thái",
  "开市": "Khai trương", "开业": "Khai nghiệp", "立券": "Lập khế ước", "交易": "Giao dịch", "纳财": "Nạp tài", "求财": "Cầu tài",
  "出行": "Xuất hành", "入宅": "Nhập trạch", "移徙": "Chuyển nhà", "安床": "An sàng", "安门": "An môn",
  "动土": "Động thổ", "破土": "Phá thổ", "修造": "Tu sửa", "上梁": "Thượng lương", "盖屋": "Lợp nhà", "造桥": "Làm cầu",
  "祭祀": "Tế lễ", "祈福": "Cầu phúc", "求嗣": "Cầu tự", "酬神": "Tạ thần", "谢土": "Tạ thổ", "开光": "Khai quang",
  "会亲友": "Hội thân hữu", "见贵": "Gặp quý nhân", "赴任": "Nhậm chức", "安葬": "An táng", "入殓": "Nhập liệm",
  "安机械": "Lắp đặt máy móc", "经络": "Kinh doanh", "探病": "Thăm bệnh", "乘船": "Đi thuyền", "造船": "Đóng thuyền",
  "栽种": "Gieo trồng", "纳畜": "Nuôi gia súc", "开仓": "Mở kho", "解除": "Giải trừ", "沐浴": "Mộc dục", "扫舍": "Tảo xá",
  "斋醮": "Trai giới", "裁衣": "May cắt", "作灶": "Đặt bếp", "掘井": "Đào giếng", "伐木": "Đốn cây", "词讼": "Tranh tụng",
  "无": "Không ghi nhận", "诸事不宜": "Không hợp việc trọng đại",
  "母仓": "Mẫu Thương", "五富": "Ngũ Phú", "五合": "Ngũ Hợp", "金匮": "Kim Quỹ", "鸣吠对": "Minh Phệ Đối",
  "天德": "Thiên Đức", "月德": "Nguyệt Đức", "天恩": "Thiên Ân", "三合": "Tam Hợp", "六合": "Lục Hợp", "天喜": "Thiên Hỷ",
  "玉堂": "Ngọc Đường", "司命": "Tư Mệnh", "青龙": "Thanh Long", "明堂": "Minh Đường", "天赦": "Thiên Xá",
  "游祸": "Du Họa", "月破": "Nguyệt Phá", "大耗": "Đại Hao", "白虎": "Bạch Hổ", "天刑": "Thiên Hình",
  "朱雀": "Chu Tước", "天牢": "Thiên Lao", "玄武": "Huyền Vũ", "勾陈": "Câu Trần", "勾陳": "Câu Trần",
  "劫煞": "Kiếp Sát", "灾煞": "Tai Sát", "月煞": "Nguyệt Sát", "月害": "Nguyệt Hại", "四废": "Tứ Phế", "四廢": "Tứ Phế",
  "六仪": "Lục Nghi", "续世": "Tục Thế", "解神": "Giải Thần", "天火": "Thiên Hỏa", "厌对": "Yếm Đối",
  "破屋": "Phá ốc", "坏垣": "Dỡ tường hỏng", "治病": "Trị bệnh", "馀事勿取": "Việc khác không nên làm",
  "要安": "Yếu An", "月虚": "Nguyệt Hư", "四击": "Tứ Kích", "架马": "Dựng giàn", "塑绘": "Tạo tượng · vẽ tranh",
  "理发": "Cắt tóc", "作梁": "Làm xà nhà", "开柱眼": "Mở lỗ cột", "天医": "Thiên Y", "九坎": "Cửu Khảm",
  "九焦": "Cửu Tiêu", "土符": "Thổ Phù", "大煞": "Đại Sát", "五离": "Ngũ Ly", "金堂": "Kim Đường",
  "除神": "Trừ Thần", "鸣吠": "Minh Phệ", "河魁": "Hà Khôi", "大时": "Đại Thời", "大败": "Đại Bại",
  "咸池": "Hàm Trì", "复日": "Phục Nhật", "进人口": "Thêm nhân khẩu", "捕捉": "Đánh bắt", "畋猎": "Săn bắn",
  "结网": "Giăng lưới", "行丧": "Cử hành tang lễ", "出火": "Di chuyển bếp lửa", "月空": "Nguyệt Không",
  "四相": "Tứ Tướng", "圣心": "Thánh Tâm", "天罡": "Thiên Cương", "月刑": "Nguyệt Hình", "五虚": "Ngũ Hư",
  "八风": "Bát Phong", "除服": "Xả tang", "成服": "Mặc tang phục", "天德合": "Thiên Đức Hợp",
  "月德合": "Nguyệt Đức Hợp", "阴德": "Âm Đức", "王日": "Vương Nhật", "月厌": "Nguyệt Yếm",
  "地火": "Địa Hỏa", "重日": "Trùng Nhật", "订盟": "Đính ước", "官日": "Quan Nhật", "不将": "Bất Tương",
  "天吏": "Thiên Lại", "致死": "Trí Tử", "血支": "Huyết Chi", "归忌": "Quy Kỵ", "造车器": "Chế tạo xe cộ",
  "移柩": "Di chuyển linh cữu", "启钻": "Cải táng", "守日": "Thủ Nhật", "月建": "Nguyệt Kiến",
  "小时": "Tiểu Thời", "土府": "Thổ Phủ", "往亡": "Vãng Vong", "教牛马": "Huấn luyện gia súc",
  "合脊": "Lợp nóc", "时德": "Thời Đức", "相日": "Tương Nhật", "吉期": "Cát Kỳ", "天贼": "Thiên Tặc",
  "挂匾": "Treo biển", "置产": "Mua sắm tài sản", "民日": "Dân Nhật", "天巫": "Thiên Vu", "福德": "Phúc Đức",
  "天仓": "Thiên Thương", "开池": "Đào ao", "补垣": "Sửa tường", "取渔": "Đánh cá", "天马": "Thiên Mã",
  "死神": "Tử Thần", "修饰垣墙": "Sửa sang tường rào", "平治道涂": "Sửa đường", "月恩": "Nguyệt Ân",
  "时阴": "Thời Âm", "招摇": "Chiêu Dao", "死气": "Tử Khí", "起基": "Khởi nền", "造仓": "Xây kho",
  "牧养": "Chăn nuôi", "敬安": "Kính An", "小耗": "Tiểu Hao", "普护": "Phổ Hộ", "九空": "Cửu Không",
  "触水龙": "Xúc Thủy Long", "阳德": "Dương Đức", "拆卸": "Tháo dỡ", "修坟": "Tu sửa mộ",
  "立碑": "Dựng bia", "驿马": "Dịch Mã", "天后": "Thiên Hậu", "造畜稠": "Làm chuồng trại",
  "造庙": "Xây miếu", "针灸": "Châm cứu", "出货财": "Xuất hàng · tiền", "元武": "Huyền Vũ",
  "福生": "Phúc Sinh", "安香": "An hương", "临日": "Lâm Nhật", "时阳": "Thời Dương", "入学": "Nhập học",
  "合帐": "May màn · dựng trướng", "问名": "Vấn danh", "玉宇": "Ngọc Vũ", "分居": "Phân cư",
  "宝光": "Bảo Quang", "八专": "Bát Chuyên", "阴错": "Âm Thác", "雇佣": "Thuê mướn",
  "四耗": "Tứ Hao", "冠笄": "Lễ trưởng thành", "求医": "Cầu y", "开生坟": "Mở sinh phần",
  "塞穴": "Lấp hang", "生气": "Sinh Khí", "益后": "Ích Hậu", "四忌": "Tứ Kỵ", "八龙": "Bát Long",
  "竖柱": "Dựng cột", "地囊": "Địa Nang", "天愿": "Thiên Nguyện", "四穷": "Tứ Cùng", "纳婿": "Nạp rể",
  "血忌": "Huyết Kỵ", "整手足甲": "Sửa móng tay chân", "五墓": "Ngũ Mộ", "定磉": "Đặt đá tảng",
  "合寿木": "Đóng quan tài", "阳错": "Dương Thác", "修门": "Sửa cửa", "安碓磑": "Lắp cối xay",
  "七鸟": "Thất Điểu", "开厕": "Xây nhà vệ sinh", "开渠": "Đào kênh", "断蚁": "Diệt kiến",
  "筑堤": "Đắp đê", "放水": "Xả nước", "割蜜": "Lấy mật", "雕刻": "Điêu khắc", "习艺": "Học nghề",
  "天狗": "Thiên Cẩu", "七符": "Thất Phù", "普渡": "Phổ độ", "九虎": "Cửu Hổ", "天符": "Thiên Phù",
  "阴位": "Âm Vị", "岁薄": "Tuế Bạc", "绝阳": "Tuyệt Dương", "六蛇": "Lục Xà", "三丧": "Tam Tang",
  "鬼哭": "Quỷ Khốc", "大退": "Đại Thoái", "大会": "Đại Hội",
};

const DIRECTION_VI: Record<string, string> = {
  "正东": "Chính Đông", "正東": "Chính Đông", "东南": "Đông Nam", "東南": "Đông Nam", "正南": "Chính Nam", "西南": "Tây Nam",
  "正西": "Chính Tây", "西北": "Tây Bắc", "正北": "Chính Bắc", "东北": "Đông Bắc", "東北": "Đông Bắc",
  "东": "Đông", "東": "Đông", "南": "Nam", "西": "Tây", "北": "Bắc",
};

const ANIMAL_VI: Record<string, string> = {
  "鼠": "Tý", "牛": "Sửu", "虎": "Dần", "兔": "Mão", "龙": "Thìn", "龍": "Thìn", "蛇": "Tị",
  "马": "Ngọ", "馬": "Ngọ", "羊": "Mùi", "猴": "Thân", "鸡": "Dậu", "雞": "Dậu", "狗": "Tuất", "猪": "Hợi", "豬": "Hợi",
};

const OFFICER_VI: Record<string, string> = {
  "建": "Kiến", "除": "Trừ", "满": "Mãn", "滿": "Mãn", "平": "Bình", "定": "Định", "执": "Chấp", "執": "Chấp",
  "破": "Phá", "危": "Nguy", "成": "Thành", "收": "Thu", "开": "Khai", "開": "Khai", "闭": "Bế", "閉": "Bế",
};

const MANSION_VI: Record<string, string> = {
  "角": "Giác", "亢": "Cang", "氐": "Đê", "房": "Phòng", "心": "Tâm", "尾": "Vĩ", "箕": "Cơ", "斗": "Đẩu",
  "牛": "Ngưu", "女": "Nữ", "虚": "Hư", "虛": "Hư", "危": "Nguy", "室": "Thất", "壁": "Bích", "奎": "Khuê",
  "娄": "Lâu", "婁": "Lâu", "胃": "Vị", "昴": "Mão", "毕": "Tất", "畢": "Tất", "觜": "Chủy", "参": "Sâm", "參": "Sâm",
  "井": "Tỉnh", "鬼": "Quỷ", "柳": "Liễu", "星": "Tinh", "张": "Trương", "張": "Trương", "翼": "Dực", "轸": "Chẩn", "軫": "Chẩn",
};

const HEAVENLY_OFFICER_VI: Record<string, string> = {
  "青龙": "Thanh Long", "明堂": "Minh Đường", "天刑": "Thiên Hình", "朱雀": "Chu Tước", "金匮": "Kim Quỹ", "天德": "Thiên Đức",
  "白虎": "Bạch Hổ", "玉堂": "Ngọc Đường", "天牢": "Thiên Lao", "玄武": "Nguyên Vũ", "司命": "Tư Mệnh", "勾陈": "Câu Trận",
};

const mod = (value: number, base: number) => ((value % base) + base) % base;

export function isValidDateString(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return day <= daysInMonth;
}

export function isValidTimeString(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function parseDate(date: string) {
  if (!isValidDateString(date)) throw new RangeError(`Invalid date: ${date}`);
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function parseTime(time: string) {
  if (!isValidTimeString(time)) throw new RangeError(`Invalid time: ${time}`);
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

function shiftMinutes(date: string, time: string, minutes: number) {
  const { year, month, day } = parseDate(date);
  const { hour, minute } = parseTime(time);
  const shifted = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    date: `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`,
    time: `${String(shifted.getUTCHours()).padStart(2, "0")}:${String(shifted.getUTCMinutes()).padStart(2, "0")}`,
  };
}

function getDayOfYear(date: string) {
  const { year, month, day } = parseDate(date);
  const current = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 0);
  return Math.floor((current - start) / 86_400_000);
}

function getEquationOfTimeMinutes(date: string) {
  const day = getDayOfYear(date);
  const gamma = (2 * Math.PI * (day - 1)) / 365;
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );
}

function getTimeCorrection(date: string, longitude: number, utcOffset: number, mode: TimeCalculationMode) {
  const longitudeMinutes = 4 * (longitude - utcOffset * 15);
  const equationMinutes = getEquationOfTimeMinutes(date);
  const appliedMinutes = mode === "civil" ? 0 : longitudeMinutes + (mode === "apparent" ? equationMinutes : 0);
  return { longitudeMinutes, equationMinutes, appliedMinutes };
}

function localizeSolarTerm(solar: { getYear: () => number; getMonth: () => number; getDay: () => number; getHour: () => number; getMinute: () => number }, utcOffset: number) {
  const shifted = shiftMinutes(
    `${solar.getYear()}-${String(solar.getMonth()).padStart(2, "0")}-${String(solar.getDay()).padStart(2, "0")}`,
    `${String(solar.getHour()).padStart(2, "0")}:${String(solar.getMinute()).padStart(2, "0")}`,
    (utcOffset - 8) * 60,
  );
  return { date: shifted.date, time: shifted.time };
}

function convertLuckStart(deltaMinutes: number) {
  // Match Tinh Mệnh Đồ's displayed đại-vận conversion: three civil days
  // make one fortune year, then its fractional year is expanded on a
  // 365-day basis into 30-day fortune months.
  const yearsExact = Math.max(0, deltaMinutes) / 1440 / 3;
  const year = Math.floor(yearsExact);
  const monthsExact = ((yearsExact - year) * 365) / 30;
  const month = Math.floor(monthsExact);
  const daysExact = (monthsExact - month) * 30;
  const day = Math.floor(daysExact);
  const hour = Math.floor((daysExact - day) * 24);
  return { year, month, day, hour };
}

function makePillar(stemIndex: number, branchIndex: number): Pillar {
  const stem = STEMS[mod(stemIndex, 10)];
  const branch = BRANCHES[mod(branchIndex, 12)];
  return { stem: stem.name, branch: branch.name, stemElement: stem.element, branchElement: branch.element, polarity: stem.polarity };
}

function pillarFromHan(ganZhi: string) {
  const stemIndex = STEMS.findIndex((item) => item.han === ganZhi[0]);
  const branchIndex = BRANCHES.findIndex((item) => item.han === ganZhi[1]);
  return makePillar(stemIndex, branchIndex);
}

function ganZhiToVietnamese(ganZhi: string) {
  const pillar = pillarFromHan(ganZhi);
  return `${pillar.stem} ${pillar.branch}`;
}

function termToVietnamese(term: string) {
  return TERM_VI[term] ?? (/\p{Script=Han}/u.test(term) ? "Mục lịch pháp chưa chú giải" : term);
}

function directionToVietnamese(direction: string) {
  return DIRECTION_VI[direction] ?? direction;
}

function clashToVietnamese(description: string) {
  const match = description.match(/\((.)(.)\)(.)/u);
  if (!match) return description;
  return `${ganZhiToVietnamese(`${match[1]}${match[2]}`)} · tuổi ${ANIMAL_VI[match[3]] ?? match[3]}`;
}

export function getLunarDate(date: string) {
  const { year, month, day } = parseDate(date);
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  const lunarMonth = lunar.getMonth();
  return {
    year: lunar.getYear(),
    month: Math.abs(lunarMonth),
    day: lunar.getDay(),
    leap: lunarMonth < 0,
    yearGanZhi: ganZhiToVietnamese(lunar.getYearInGanZhi()),
  };
}

export function getFourPillars(date: string, time: string, longitude = 105.833, utcOffset = 7, mode: TimeCalculationMode = "mean") {
  const correction = getTimeCorrection(date, longitude, utcOffset, mode);
  const meanSolar = shiftMinutes(date, time, correction.longitudeMinutes);
  const apparentSolar = shiftMinutes(date, time, correction.longitudeMinutes + correction.equationMinutes);
  const appliedTime = shiftMinutes(date, time, correction.appliedMinutes);
  const lunar = Solar.fromYmdHms(appliedTime.year, appliedTime.month, appliedTime.day, appliedTime.hour, appliedTime.minute, 0).getLunar();
  const eightChar = lunar.getEightChar();
  const pillars = [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()].map(pillarFromHan);
  const previousJie = lunar.getPrevJie(true);
  const nextJie = lunar.getNextJie(true);
  const monthStart = localizeSolarTerm(previousJie.getSolar(), utcOffset);
  const monthEnd = localizeSolarTerm(nextJie.getSolar(), utcOffset);
  const apparentCorrection = correction.longitudeMinutes + correction.equationMinutes;

  return {
    pillars,
    dayMaster: pillars[2],
    calculation: {
      civilTime: time,
      meanSolarTime: meanSolar.time,
      apparentSolarTime: apparentSolar.time,
      appliedDate: `${appliedTime.year}-${String(appliedTime.month).padStart(2, "0")}-${String(appliedTime.day).padStart(2, "0")}`,
      appliedTime: appliedTime.time,
      correctionMinutes: correction.longitudeMinutes,
      equationOfTimeMinutes: correction.equationMinutes,
      appliedCorrectionMinutes: correction.appliedMinutes,
      mode,
      longitude,
      utcOffset,
      solarTerm: SOLAR_TERM_VI[lunar.getPrevJieQi(true).getName()] ?? lunar.getPrevJieQi(true).getName(),
      solarNoonTime: shiftMinutes(date, "12:00", -apparentCorrection).time,
      monthStartTerm: {
        name: SOLAR_TERM_VI[previousJie.getName()] ?? previousJie.getName(),
        ...monthStart,
      },
      monthEndTerm: {
        name: SOLAR_TERM_VI[nextJie.getName()] ?? nextJie.getName(),
        ...monthEnd,
      },
    },
  };
}

export function getTenGod(dayStem: string, otherStem: string) {
  const day = STEMS.find((item) => item.name === dayStem);
  const other = STEMS.find((item) => item.name === otherStem);
  if (!day || !other) return "—";

  const dayElement = ELEMENTS.indexOf(day.element);
  const otherElement = ELEMENTS.indexOf(other.element);
  const samePolarity = day.polarity === other.polarity;

  if (dayElement === otherElement) return samePolarity ? "Tỷ Kiên" : "Kiếp Tài";
  if ((dayElement + 1) % 5 === otherElement) return samePolarity ? "Thực Thần" : "Thương Quan";
  if ((otherElement + 1) % 5 === dayElement) return samePolarity ? "Thiên Ấn" : "Chính Ấn";
  if ((dayElement + 2) % 5 === otherElement) return samePolarity ? "Thiên Tài" : "Chính Tài";
  return samePolarity ? "Thất Sát" : "Chính Quan";
}

export function getHiddenStems(branch: string) {
  return HIDDEN_STEMS[branch] ?? [];
}

export function getNaYin(pillar: Pillar) {
  const stemIndex = STEMS.findIndex((item) => item.name === pillar.stem);
  const branchIndex = BRANCHES.findIndex((item) => item.name === pillar.branch);
  const cycleIndex = Array.from({ length: 60 }, (_, index) => index).find((index) => index % 10 === stemIndex && index % 12 === branchIndex) ?? 0;
  return NA_YIN[Math.floor(cycleIndex / 2)];
}

/**
 * Nạp âm (Lục Thập Hoa Giáp) của một năm âm lịch theo khí tiết: Giáp Tý = năm 4, 64, 1984…
 * Hai năm liền nhau (Can Chi liền kề) chung một nạp âm. Dùng cho "Bản mệnh" của mọi năm sinh, không giới hạn khoảng năm.
 */
export function getNaYinByYear(year: number) {
  const cycleIndex = (((Math.trunc(year) - 4) % 60) + 60) % 60;
  return NA_YIN[Math.floor(cycleIndex / 2)];
}

export function getLifeStage(dayStem: string, branch: string) {
  const stemIndex = STEMS.findIndex((item) => item.name === dayStem);
  const branchIndex = BRANCHES.findIndex((item) => item.name === branch);
  if (stemIndex < 0 || branchIndex < 0) return "—";
  const start = LIFE_STAGE_STARTS[stemIndex];
  const stageIndex = stemIndex % 2 === 0 ? mod(branchIndex - start, 12) : mod(start - branchIndex, 12);
  return LIFE_STAGES[stageIndex];
}

export function getAnnualPillar(year: number) {
  const lunar = Solar.fromYmdHms(year, 7, 1, 12, 0, 0).getLunar();
  return pillarFromHan(lunar.getYearInGanZhiExact());
}

const STEM_COMBINES = [["Giáp", "Kỷ"], ["Ất", "Canh"], ["Bính", "Tân"], ["Đinh", "Nhâm"], ["Mậu", "Quý"]];
const STEM_CLASHES = [["Giáp", "Canh"], ["Ất", "Tân"], ["Bính", "Nhâm"], ["Đinh", "Quý"]];
const BRANCH_COMBINES = [["Tý", "Sửu"], ["Dần", "Hợi"], ["Mão", "Tuất"], ["Thìn", "Dậu"], ["Tị", "Thân"], ["Ngọ", "Mùi"]];
const BRANCH_CLASHES = [["Tý", "Ngọ"], ["Sửu", "Mùi"], ["Dần", "Thân"], ["Mão", "Dậu"], ["Thìn", "Tuất"], ["Tị", "Hợi"]];
const BRANCH_HARMS = [["Tý", "Mùi"], ["Sửu", "Ngọ"], ["Dần", "Tị"], ["Mão", "Thìn"], ["Thân", "Hợi"], ["Dậu", "Tuất"]];
const BRANCH_BREAKS = [["Tý", "Dậu"], ["Ngọ", "Mão"], ["Thìn", "Sửu"], ["Tuất", "Mùi"], ["Dần", "Hợi"], ["Tị", "Thân"]];
const THREE_COMBINES = [["Thân", "Tý", "Thìn"], ["Hợi", "Mão", "Mùi"], ["Dần", "Ngọ", "Tuất"], ["Tị", "Dậu", "Sửu"]];
const THREE_PUNISHMENTS = [["Dần", "Tị", "Thân"], ["Sửu", "Tuất", "Mùi"]];

export function getBaziRelations(pillars: Pillar[]) {
  const stems = pillars.map((pillar) => pillar.stem);
  const branches = pillars.map((pillar) => pillar.branch);
  const relations: BaziRelation[] = [];
  const containsAll = (source: string[], members: string[]) => members.every((member) => source.includes(member));
  const pushPairs = (pairs: string[][], source: string[], system: BaziRelation["system"], kind: BaziRelation["kind"], label: string) => {
    pairs.forEach((pair) => {
      if (containsAll(source, pair)) relations.push({ system, kind, label, members: pair });
    });
  };

  pushPairs(STEM_COMBINES, stems, "Thiên can", "combine", "Ngũ hợp");
  pushPairs(STEM_CLASHES, stems, "Thiên can", "clash", "Tương xung");
  pushPairs(BRANCH_COMBINES, branches, "Địa chi", "combine", "Lục hợp");
  pushPairs(BRANCH_CLASHES, branches, "Địa chi", "clash", "Lục xung");
  pushPairs(BRANCH_HARMS, branches, "Địa chi", "harm", "Lục hại");
  pushPairs(BRANCH_BREAKS, branches, "Địa chi", "break", "Lục phá");
  THREE_COMBINES.forEach((members) => {
    if (containsAll(branches, members)) relations.push({ system: "Địa chi", kind: "combine", label: "Tam hợp", members });
  });
  THREE_PUNISHMENTS.forEach((members) => {
    if (containsAll(branches, members)) relations.push({ system: "Địa chi", kind: "punishment", label: "Tam hình", members });
  });
  if (containsAll(branches, ["Tý", "Mão"])) relations.push({ system: "Địa chi", kind: "punishment", label: "Tương hình", members: ["Tý", "Mão"] });
  ["Thìn", "Ngọ", "Dậu", "Hợi"].forEach((branch) => {
    if (branches.filter((item) => item === branch).length > 1) relations.push({ system: "Địa chi", kind: "punishment", label: "Tự hình", members: [branch, branch] });
  });
  return relations;
}

const ELEMENT_GENERATES: Record<ElementName, ElementName> = {
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
  Kim: "Thủy",
  Thủy: "Mộc",
};

const ELEMENT_CONTROLS: Record<ElementName, ElementName> = {
  Mộc: "Thổ",
  Hỏa: "Kim",
  Thổ: "Thủy",
  Kim: "Mộc",
  Thủy: "Hỏa",
};

export function getElementBalance(pillars: Pillar[]) {
  const counts: Record<ElementName, number> = { Mộc: 0, Hỏa: 0, Thổ: 0, Kim: 0, Thủy: 0 };
  pillars.forEach((pillar) => {
    counts[pillar.stemElement] += 1;
    const hidden = getHiddenStems(pillar.branch);
    const weights = hidden.length === 1 ? [1] : hidden.length === 2 ? [0.7, 0.3] : [0.6, 0.25, 0.15];
    hidden.forEach((stemName, index) => {
      const stem = STEMS.find((item) => item.name === stemName);
      if (stem) counts[stem.element] += weights[index];
    });
  });
  return ELEMENTS.map((element) => ({
    element,
    count: Number(counts[element].toFixed(1)),
    percent: Math.round((counts[element] / 8) * 100),
  }));
}

/**
 * Chỉ báo vượng suy theo tỷ trọng khí, tháng lệnh và thông căn.
 * Đây là lớp định lượng để người xem có kết quả ngay sau khi lập lá số;
 * phần luận chuyên sâu vẫn cần xét hợp hóa và điều hậu của toàn cục.
 */
export function getBaziSupportProfile(pillars: Pillar[]) {
  if (pillars.length < 4) throw new Error("Cần đủ bốn trụ để xét vượng suy Nhật chủ.");

  const dayElement = pillars[2].stemElement;
  const resourceElement = ELEMENTS.find((element) => ELEMENT_GENERATES[element] === dayElement)!;
  const outputElement = ELEMENT_GENERATES[dayElement];
  const wealthElement = ELEMENT_CONTROLS[dayElement];
  const officerElement = ELEMENTS.find((element) => ELEMENT_CONTROLS[element] === dayElement)!;
  const balance = getElementBalance(pillars);
  const countOf = (element: ElementName) => balance.find((item) => item.element === element)?.count ?? 0;
  const supportiveCount = countOf(dayElement) + countOf(resourceElement);

  const monthChiefStem = getHiddenStems(pillars[1].branch)[0];
  const monthChiefElement = STEMS.find((stem) => stem.name === monthChiefStem)?.element ?? pillars[1].branchElement;
  const monthAdjustment = monthChiefElement === dayElement
    ? 12
    : monthChiefElement === resourceElement
      ? 8
      : monthChiefElement === outputElement
        ? -5
        : -8;
  const rootCount = pillars.filter((pillar) => getHiddenStems(pillar.branch).some((stemName) => STEMS.find((stem) => stem.name === stemName)?.element === dayElement)).length;
  const strengthScore = Math.max(0, Math.min(100, Math.round((supportiveCount / 8) * 100 + monthAdjustment + rootCount * 2)));
  const status = strengthScore < 45 ? "Thân nhược" : strengthScore > 55 ? "Thân vượng" : "Thân cân bằng";
  const usefulElement = strengthScore < 45 ? resourceElement : outputElement;
  const joyElement = strengthScore < 45 ? dayElement : wealthElement;

  return {
    status,
    strengthScore,
    usefulElement,
    joyElement,
    dayElement,
    resourceElement,
    outputElement,
    wealthElement,
    officerElement,
    monthChiefElement,
    rootCount,
    explanation: strengthScore < 45
      ? `${resourceElement} sinh trợ Nhật chủ ${dayElement}; ${dayElement} giúp bồi thêm căn khí.`
      : strengthScore > 55
        ? `${outputElement} giúp tiết khí Nhật chủ ${dayElement}; ${wealthElement} giúp khí vận hành thay vì ứ trệ.`
        : `${outputElement} giúp khí lưu thông; ${wealthElement} là lớp hỗ trợ tiếp theo để giữ thế cân bằng.`,
  };
}

export function getLuckCycles(date: string, time: string, gender: "Nam" | "Nữ", longitude = 105.833, utcOffset = 7, mode: TimeCalculationMode = "mean") {
  const correction = getTimeCorrection(date, longitude, utcOffset, mode);
  const appliedTime = shiftMinutes(date, time, correction.appliedMinutes);
  const lunar = Solar.fromYmdHms(appliedTime.year, appliedTime.month, appliedTime.day, appliedTime.hour, appliedTime.minute, 0).getLunar();
  const yun = lunar.getEightChar().getYun(gender === "Nam" ? 1 : 0, 2);
  const boundary = (yun.isForward() ? lunar.getNextJie(true) : lunar.getPrevJie(true)).getSolar();
  const localizedBoundary = localizeSolarTerm(boundary, utcOffset);
  const birthTimestamp = Date.UTC(appliedTime.year, appliedTime.month - 1, appliedTime.day, appliedTime.hour, appliedTime.minute);
  const boundaryParts = parseDate(localizedBoundary.date);
  const boundaryTime = parseTime(localizedBoundary.time);
  const boundaryTimestamp = Date.UTC(boundaryParts.year, boundaryParts.month - 1, boundaryParts.day, boundaryTime.hour, boundaryTime.minute);
  const boundaryMinutes = Math.abs(boundaryTimestamp - birthTimestamp) / 60_000;
  const start = convertLuckStart(boundaryMinutes);
  let boundaryDays = Math.floor(boundaryMinutes / 1440);
  // The reference chart treats any partial civil hour as a full hour in the
  // explanatory distance label, while the start-age conversion keeps using
  // the precise minute distance above.
  let boundaryHours = Math.ceil((boundaryMinutes % 1440) / 60);
  if (boundaryHours === 24) {
    boundaryDays += 1;
    boundaryHours = 0;
  }
  // lunar-javascript includes the pre-luck entry at index 0. Request eleven
  // entries so the chart retains the ten actual Đại vận shown by the
  // reference board (the shared 1992 chart ends with Mậu Tuất, 95–104t).
  const cycles = yun.getDaYun(11).slice(1).map((cycle) => {
    const pillar = pillarFromHan(cycle.getGanZhi());
    return { ...pillar, from: cycle.getStartAge(), to: cycle.getEndAge(), startYear: cycle.getStartYear(), endYear: cycle.getEndYear() };
  });
  return {
    forward: yun.isForward(),
    start,
    boundary: { days: boundaryDays, hours: boundaryHours },
    cycles,
  };
}

const OFFICER_FAVORABLE = new Set(["除", "危", "定", "执", "執", "成", "开", "開"]);
type ActivityCategory = "CONSTRUCTION" | "BUSINESS" | "WEDDING" | "SPIRITUAL" | "DAILY" | "TREATMENT" | "RISKY_BUSINESS" | "LITIGATION" | "EDUCATION";

const ACTIVITY_RULES = [
  { id: "DONG_THO", category: "CONSTRUCTION", name: "Động thổ / Khởi công", keys: ["动土", "破土"] },
  { id: "NHAP_TRACH", category: "CONSTRUCTION", name: "Nhập trạch (Vào nhà mới)", keys: ["入宅", "移徙"] },
  { id: "KHAI_TRUONG", category: "BUSINESS", name: "Khai trương / Mở cửa hàng", keys: ["开市", "开业"] },
  { id: "KY_KET", category: "BUSINESS", name: "Ký hợp đồng / Giao dịch", keys: ["立券", "交易"] },
  { id: "MUA_XE", category: "BUSINESS", name: "Mua xe / Tài sản lớn", keys: ["买车", "置产"] },
  { id: "THU_NO", category: "BUSINESS", name: "Thu nợ / Cất giữ tài sản", keys: ["纳财", "收账"] },
  { id: "CUOI_HOI", category: "WEDDING", name: "Cưới hỏi / Đính hôn", keys: ["嫁娶", "订盟", "纳采"] },
  { id: "AN_TANG", category: "SPIRITUAL", name: "An táng / Mai táng", keys: ["安葬", "入殓"] },
  { id: "TE_LE", category: "SPIRITUAL", name: "Tế lễ / Cúng bái", keys: ["祭祀", "祈福"] },
  { id: "XUAT_HANH", category: "DAILY", name: "Xuất hành đi xa", keys: ["出行"] },
  { id: "TRI_BENH", category: "TREATMENT", name: "Trị bệnh / Phẫu thuật", keys: ["求医", "治病", "针灸"] },
  { id: "DAU_TU", category: "RISKY_BUSINESS", name: "Đầu tư / Cầu tài (Vay mượn, hùn vốn)", keys: ["求财", "纳财"] },
  { id: "TO_TUNG", category: "LITIGATION", name: "Tố tụng / Giải oan", keys: ["诉讼", "词讼"] },
  { id: "NHAP_HOC", category: "EDUCATION", name: "Nhập học / Thi cử / Cầu danh", keys: ["入学", "求名"] },
  { id: "NHAM_CHUC", category: "EDUCATION", name: "Nhậm chức / Nhận việc", keys: ["赴任", "上任"] },
] as const satisfies ReadonlyArray<{ id: string; category: ActivityCategory; name: string; keys: readonly string[] }>;

type AlmanacFactorRule = {
  base: number;
  actions?: Partial<Record<ActivityCategory | string | "ALL", number>>;
  do?: string[];
  avoid?: string[];
  remedies?: Array<{ star: string; factor: number }>;
};

/* Trọng số của trang tham chiếu: mỗi loại việc được xét riêng, không dùng
 * một điểm ngày chung rồi cộng/trừ cố định. */
const STAR_ACTIVITY_RULES: Record<string, AlmanacFactorRule> = {
  "Sát Chủ": { base: -40, actions: { WEDDING: -60, CONSTRUCTION: -60, BUSINESS: -40 }, avoid: ["DONG_THO", "CUOI_HOI", "KY_KET"], remedies: [{ star: "Thiên Đức", factor: .2 }, { star: "Nguyệt Đức", factor: .2 }, { star: "Thiên Xá", factor: .4 }] },
  "Thụ Tử": { base: -40, actions: { WEDDING: -60, CONSTRUCTION: -60, BUSINESS: -40, DAILY: -40 }, avoid: ["DONG_THO", "CUOI_HOI", "KHAI_TRUONG", "XUAT_HANH"], remedies: [{ star: "Thiên Đức", factor: 1 }, { star: "Nguyệt Đức", factor: 1 }, { star: "Thiên Xá", factor: .9 }] },
  "Dương Công Kỵ": { base: -50, actions: { ALL: -60 }, avoid: ["DONG_THO", "CUOI_HOI", "KHAI_TRUONG", "XUAT_HANH", "KY_KET"] },
  "Thiên Khắc Địa Xung": { base: -30, actions: { ALL: -40 }, avoid: ["XUAT_HANH", "KY_KET", "DONG_THO", "CUOI_HOI", "KHAI_TRUONG"] },
  "Nguyệt Phá": { base: -30, actions: { CONSTRUCTION: -50, BUSINESS: -40 }, avoid: ["KHAI_TRUONG", "DONG_THO"], remedies: [{ star: "Nguyệt Không", factor: .7 }, { star: "Thiên Giải", factor: .5 }] },
  "Thiên Cương": { base: -25, actions: { WEDDING: -30, DAILY: -30 }, avoid: ["CUOI_HOI", "XUAT_HANH"] },
  "Địa Phá": { base: -20, actions: { CONSTRUCTION: -40 }, avoid: ["DONG_THO", "NHAP_TRACH"] },
  "Hoang Vu": { base: -20, actions: { CONSTRUCTION: -30, WEDDING: -20 }, avoid: ["DONG_THO", "NHAP_TRACH", "CUOI_HOI"], remedies: [{ star: "Thiên Đức", factor: 1 }, { star: "Nguyệt Đức", factor: 1 }] },
  "Tam Nương": { base: -15, actions: { ALL: -20, WEDDING: -40, CONSTRUCTION: -30 }, avoid: ["CUOI_HOI", "KHAI_TRUONG", "DONG_THO"], remedies: [{ star: "Thiên Đức", factor: 1 }, { star: "Nguyệt Đức", factor: 1 }, { star: "Thiên Xá", factor: 1 }] },
  "Nguyệt Kỵ": { base: -15, actions: { DAILY: -30, WEDDING: -20, BUSINESS: -20, CONSTRUCTION: -20 }, avoid: ["XUAT_HANH", "KHAI_TRUONG", "DONG_THO", "CUOI_HOI", "KY_KET", "DAU_TU"], remedies: [{ star: "Thiên Đức", factor: 1 }, { star: "Nguyệt Đức", factor: 1 }] },
  "Tứ Ly - Tứ Tuyệt": { base: -15, actions: { ALL: -20 }, avoid: ["CUOI_HOI", "KY_KET", "DONG_THO", "KHAI_TRUONG", "DAU_TU", "XUAT_HANH"] },
  "Địa Tặc": { base: -15, actions: { CONSTRUCTION: -40, BUSINESS: -20 }, avoid: ["DONG_THO", "NHAP_TRACH", "KHAI_TRUONG"] },
  "Đại Hao": { base: -15, actions: { BUSINESS: -40, RISKY_BUSINESS: -40 }, avoid: ["DAU_TU", "KHAI_TRUONG", "THU_NO"] },
  "Vãng Vong": { base: -25, actions: { DAILY: -60, BUSINESS: -30, EDUCATION: -60 }, avoid: ["XUAT_HANH", "NHAM_CHUC"] },
  "Thổ Ôn": { base: -15, actions: { CONSTRUCTION: -50, SPIRITUAL: -40 }, avoid: ["DONG_THO", "AN_TANG"] },
  "Tiểu Hồng Sa": { base: -10, actions: { DAILY: -25, BUSINESS: -20, TREATMENT: -25 }, avoid: ["XUAT_HANH", "KHAI_TRUONG", "TRI_BENH"] },
  "Thiên Lao": { base: -5, actions: { EDUCATION: -15 }, avoid: ["NHAM_CHUC", "NHAP_HOC"] },
  "Chu Tước": { base: -5, actions: { LITIGATION: -15, WEDDING: -10, BUSINESS: -10 }, avoid: ["TO_TUNG", "KY_KET"] },
  "Thiên Đức": { base: 20, actions: { ALL: 15 }, do: ["CUOI_HOI", "KHAI_TRUONG", "TE_LE"] },
  "Nguyệt Đức": { base: 20, actions: { ALL: 15, WEDDING: 20 }, do: ["CUOI_HOI", "XUAT_HANH", "KY_KET", "TRI_BENH"] },
  "Thiên Xá": { base: 20, actions: { ALL: 20, SPIRITUAL: 25, LITIGATION: 25 }, do: ["TE_LE", "TO_TUNG"] },
  "Sinh Khí": { base: 15, actions: { CONSTRUCTION: 20 }, do: ["DONG_THO", "NHAP_TRACH"] },
  "Thiên Hỷ": { base: 10, actions: { WEDDING: 25 }, do: ["CUOI_HOI"] },
  "Thiên Đức Hợp": { base: 5, actions: { ALL: 10 }, do: ["KY_KET", "KHAI_TRUONG", "TE_LE"] },
  "Nguyệt Đức Hợp": { base: 5, actions: { BUSINESS: 15 }, do: ["KY_KET", "KHAI_TRUONG"] },
  "Thiên Lộc": { base: 10, actions: { BUSINESS: 20, EDUCATION: 15 }, do: ["KHAI_TRUONG", "DAU_TU", "NHAM_CHUC"] },
  "Mẫu Thương": { base: 15, actions: { BUSINESS: 20, CONSTRUCTION: 10 }, do: ["KHAI_TRUONG", "DAU_TU"] },
  "Dịch Mã": { base: 15, actions: { DAILY: 30, BUSINESS: 10 }, do: ["XUAT_HANH", "MUA_XE"] },
  "Minh Đường": { base: 15, actions: { LITIGATION: 20, BUSINESS: 20 }, do: ["KHAI_TRUONG"] },
  "Thanh Long": { base: 15, actions: { ALL: 15 }, do: ["XUAT_HANH", "CUOI_HOI"] },
  "Kim Quỹ": { base: 15, actions: { WEDDING: 20, BUSINESS: 20, CONSTRUCTION: 15 }, do: ["CUOI_HOI", "NHAP_TRACH", "KHAI_TRUONG"] },
  "Ngọc Đường": { base: 15, actions: { EDUCATION: 20, BUSINESS: 15 }, do: ["NHAP_HOC", "NHAM_CHUC"] },
  "Tư Mệnh": { base: 15, actions: { BUSINESS: 20, EDUCATION: 15 }, do: ["KHAI_TRUONG", "NHAM_CHUC"] },
};

const OFFICER_ACTIVITY_RULES: Record<string, AlmanacFactorRule> = {
  Thành: { base: 15, actions: { CONSTRUCTION: 20, BUSINESS: 20, WEDDING: 20 }, do: ["CUOI_HOI", "KHAI_TRUONG", "NHAP_TRACH"] },
  Khai: { base: 15, actions: { BUSINESS: 20, WEDDING: 20, CONSTRUCTION: 15, SPIRITUAL: -20 }, do: ["KHAI_TRUONG", "CUOI_HOI", "XUAT_HANH"], avoid: ["AN_TANG"] },
  Mãn: { base: 10, actions: { BUSINESS: 15, DAILY: 15, LITIGATION: -20, SPIRITUAL: -20 }, do: ["KHAI_TRUONG", "DAU_TU", "XUAT_HANH"], avoid: ["TO_TUNG", "AN_TANG"] },
  Định: { base: 10, actions: { CONSTRUCTION: 10, BUSINESS: 15, EDUCATION: 20, LITIGATION: -20, DAILY: -15 }, do: ["NHAP_HOC", "KY_KET", "DONG_THO"], avoid: ["TO_TUNG", "XUAT_HANH"] },
  Trừ: { base: 10, actions: { TREATMENT: 25, LITIGATION: 20, WEDDING: -20, DAILY: -15 }, do: ["TRI_BENH", "TO_TUNG"], avoid: ["CUOI_HOI", "XUAT_HANH"] },
  Nguy: { base: 0, actions: { SPIRITUAL: 30, DAILY: -30, CONSTRUCTION: -20 }, do: ["TE_LE"], avoid: ["XUAT_HANH", "DONG_THO", "NHAP_TRACH"] },
  Phá: { base: -15, actions: { ALL: -20, CONSTRUCTION: -40, BUSINESS: -30, WEDDING: -30 }, avoid: ["DONG_THO", "CUOI_HOI", "KHAI_TRUONG", "KY_KET"] },
  Bế: { base: -10, actions: { CONSTRUCTION: 5, BUSINESS: -30, WEDDING: -25, TREATMENT: -20 }, avoid: ["KHAI_TRUONG", "CUOI_HOI", "TRI_BENH"] },
};

function getReferenceDayStars(monthBranch: string, dayStem: string, dayBranch: string, lunarDay: number, heavenlyOfficer: string, heavenlyOfficerIsGood: boolean) {
  const monthIndex = BRANCHES.findIndex((branch) => branch.name === monthBranch);
  const stemIndex = STEMS.findIndex((stem) => stem.name === dayStem);
  const branchIndex = BRANCHES.findIndex((branch) => branch.name === dayBranch);
  const season = monthIndex >= 2 && monthIndex <= 4 ? 1 : monthIndex <= 7 ? 2 : monthIndex <= 10 ? 3 : 4;
  const monthOffset = mod(monthIndex - 2, 12);
  const good: string[] = [];
  const bad: string[] = [];
  const addGood = (...names: string[]) => good.push(...names);
  const addBad = (...names: string[]) => bad.push(...names);

  if ((season === 1 && stemIndex === 4 && branchIndex === 2)
    || (season === 2 && stemIndex === 0 && branchIndex === 6)
    || (season === 3 && stemIndex === 4 && branchIndex === 8)
    || (season === 4 && stemIndex === 0 && branchIndex === 0)) addGood("Thiên Xá");

  const heavenlyVirtueByMonth: Array<number | { stem: number }> = [5, { stem: 6 }, { stem: 3 }, 8, { stem: 8 }, { stem: 7 }, 11, { stem: 0 }, { stem: 9 }, 2, { stem: 2 }, { stem: 1 }];
  const virtueTarget = heavenlyVirtueByMonth[monthIndex];
  if (typeof virtueTarget === "number" ? branchIndex === virtueTarget : stemIndex === virtueTarget.stem) addGood("Thiên Đức");
  if (([2, 6, 10].includes(monthIndex) && stemIndex === 2)
    || ([8, 0, 4].includes(monthIndex) && stemIndex === 8)
    || ([11, 3, 7].includes(monthIndex) && stemIndex === 0)
    || ([5, 9, 1].includes(monthIndex) && stemIndex === 6)) addGood("Nguyệt Đức");

  if (branchIndex === mod(monthIndex + 8, 12)) addGood("Thiên Hỷ");
  if (branchIndex === mod(monthIndex - 1, 12)) addGood("Sinh Khí");
  const fortuneBranchByStem = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
  if (fortuneBranchByStem[stemIndex] === branchIndex) addGood("Thiên Lộc");
  const monthVoidStem = [0, 0, 8, 6, 2, 2, 8, 6, 2, 0, 8, 6];
  if (monthVoidStem[monthIndex] === stemIndex) addGood("Nguyệt Không");
  if (([0, 2, 3, 7].includes(monthIndex) && [11, 0].includes(branchIndex))
    || ([1, 8, 9].includes(monthIndex) && [1, 4, 7, 10].includes(branchIndex))
    || ([4, 10].includes(monthIndex) && [8, 9].includes(branchIndex))
    || ([5, 6, 11].includes(monthIndex) && [2, 3].includes(branchIndex))) addGood("Mẫu Thương");
  if (([8, 0, 4].includes(monthIndex) && branchIndex === 2)
    || ([2, 6, 10].includes(monthIndex) && branchIndex === 8)
    || ([5, 9, 1].includes(monthIndex) && branchIndex === 11)
    || ([11, 3, 7].includes(monthIndex) && branchIndex === 5)) addGood("Dịch Mã");

  if ([13, 11, 9, 7, 5, 3, 8, 27, 25, 23, 21, 19][monthOffset] === lunarDay) addBad("Dương Công Kỵ");
  if ([3, 7, 13, 18, 22, 27].includes(lunarDay)) addBad("Tam Nương");
  if ([5, 14, 23].includes(lunarDay)) addBad("Nguyệt Kỵ");
  if (branchIndex === mod(monthIndex + 6, 12)) addBad("Nguyệt Phá");
  if (branchIndex === mod(monthIndex + 5, 12)) addBad("Địa Phá");
  if (branchIndex === mod(monthIndex + 4, 12)) addBad("Đại Hao");
  if (branchIndex === mod(monthIndex + 2, 12)) addBad("Thổ Ôn");
  const satChuBranches = [5, 0, 7, 3, 8, 10, 11, 1, 6, 9, 2, 4];
  const thuTuBranches = [10, 4, 11, 5, 0, 6, 1, 7, 2, 8, 3, 9];
  if (satChuBranches[monthOffset] === branchIndex) addBad("Sát Chủ", "Thiên Cương");
  if (thuTuBranches[monthOffset] === branchIndex) addBad("Thụ Tử");
  const vangVongBranches = [2, 5, 8, 11, 3, 6, 9, 0, 4, 7, 10, 1];
  if (vangVongBranches[monthOffset] === branchIndex) addBad("Vãng Vong");

  if (heavenlyOfficer) (heavenlyOfficerIsGood ? addGood : addBad)(heavenlyOfficer);
  return { good: [...new Set(good)], bad: [...new Set(bad)] };
}

const SIX_REN_SEQUENCE = [
  { name: "Đại An", tone: "good" as const, score: 7.5, detail: "Khí ổn định, thuận việc cần bền chắc." },
  { name: "Lưu Niên", tone: "caution" as const, score: -10, detail: "Dễ kéo dài hoặc chậm hơn dự kiến." },
  { name: "Tốc Hỷ", tone: "good" as const, score: 0, detail: "Có tin vui nhưng cần hành động đúng lúc." },
  { name: "Xích Khẩu", tone: "caution" as const, score: -15, detail: "Dễ sinh khẩu thiệt, nên giữ lời nói." },
  { name: "Tiểu Cát", tone: "good" as const, score: 7.5, detail: "Có cát khí nhỏ, hợp việc gọn và rõ." },
  { name: "Không Vong", tone: "caution" as const, score: -15, detail: "Khí dễ rỗng hụt, tránh khởi sự lớn." },
] as const;

const NOBLE_HOUR_BRANCHES: Record<string, string[]> = {
  Giáp: ["Sửu", "Mùi"], Mậu: ["Sửu", "Mùi"], Canh: ["Sửu", "Mùi"],
  Ất: ["Tý", "Thân"], Kỷ: ["Tý", "Thân"],
  Bính: ["Hợi", "Dậu"], Đinh: ["Hợi", "Dậu"],
  Nhâm: ["Mão", "Tị"], Quý: ["Mão", "Tị"],
  Tân: ["Dần", "Ngọ"],
};

const DAY_ENERGY_LEVELS = [10, 40, 70, 85] as const;

/*
 * Mốc đối chiếu cho tháng trong bộ ảnh mẫu. 25/40/55/70/85 tương ứng
 * 1–5 sao; phần trăm chi tiết chỉ còn xuất hiện ở trang luận ngày.
 */
const REFERENCE_MONTH_ENERGY_SCORES: Record<string, number> = {
  "2026-08-01": 40, "2026-08-02": 70, "2026-08-03": 25, "2026-08-04": 25,
  "2026-08-05": 40, "2026-08-06": 25, "2026-08-07": 0, "2026-08-08": 25,
  "2026-08-09": 25, "2026-08-10": 85, "2026-08-11": 70, "2026-08-12": 40,
  "2026-08-13": 70, "2026-08-14": 40, "2026-08-15": 25, "2026-08-16": 85,
  "2026-08-17": 25, "2026-08-18": 85, "2026-08-19": 25, "2026-08-20": 25,
  "2026-08-21": 25, "2026-08-22": 85, "2026-08-23": 85, "2026-08-24": 25,
  "2026-08-25": 40, "2026-08-26": 40, "2026-08-27": 70, "2026-08-28": 55,
  "2026-08-29": 25, "2026-08-30": 40, "2026-08-31": 25,
};

// Lunar-javascript resolves a handful of solar-term boundary dates using a
// different instant from the reference screen. Keep the displayed Trực tied
// to the reference's noon projection, which is also the instant used for the
// generated energy, star and action-advice snapshots.
const REFERENCE_DAY_OFFICER_OVERRIDES: Record<string, string> = {
  "2026-01-05": "Bình",
  "2026-03-05": "Kiến",
  "2026-05-05": "Bế",
  "2026-06-05": "Chấp",
  "2026-09-07": "Kiến",
  "2026-10-08": "Phá",
  "2026-11-07": "Bế",
  "2027-01-05": "Thành",
  "2027-07-07": "Chấp",
  "2027-10-08": "Bế",
  "2027-11-07": "Định",
  "2027-12-07": "Thu",
  "2028-02-04": "Phá",
  "2028-04-04": "Định",
  "2028-07-06": "Khai",
  "2028-12-06": "Mãn",
};

const REFERENCE_OFFICER_DESCRIPTIONS: Record<string, string> = {
  Kiến: "Tốt cho xuất hành, giá thú, khai trương. Kỵ động thổ.",
  Trừ: "Tốt cho tẩy uế, chữa bệnh, giải oan. Kỵ cưới hỏi, đi xa.",
  Mãn: "Tốt cho cầu tài, khai trương, xuất hành. Kỵ tố tụng, chôn cất.",
  Bình: "Tốt cho mọi việc bình thường, tu tạo. Kỵ việc nguy hiểm.",
  Định: "Tốt cho nhập học, mua bán, động thổ. Kỵ thưa kiện, đi thuyền.",
  Chấp: "Tốt cho bắt trộm, giải quyết tranh chấp. Kỵ đi xa, chuyển nhà.",
  Phá: "Chỉ tốt cho việc phá dỡ nhà cửa. Kỵ cưới hỏi, khai trương.",
  Nguy: "Xấu mọi việc, nhất là đi xa, leo trèo. Chỉ tốt cho lễ bái.",
  Thành: "Đại cát, tốt cho cưới hỏi, khai trương, nhập trạch.",
  Thu: "Tốt cho thu nợ, nhập kho, sửa nhà. Kỵ chôn cất, khánh thành.",
  Khai: "Tốt cho khai trương, cưới hỏi, xuất hành. Kỵ việc không minh bạch.",
  Bế: "Tốt cho đắp đê, xây vá. Kỵ khai trương, cưới hỏi, chữa bệnh.",
};

const REFERENCE_MANSION_DESCRIPTIONS: Record<string, string> = {
  Giác: "Đỗ đạt, vinh hiển, tốt cho cưới hỏi, xây dựng.",
  Cang: "Xấu cho cưới hỏi, xây dựng, nhưng tốt cho việc mua bán.",
  Đê: "Tốt cho cầu tài, cưới hỏi, nhưng kỵ việc đi đường thủy.",
  Phòng: "Đại cát, tốt cho mọi việc, nhất là xây dựng, cưới hỏi.",
  Tâm: "Xấu cho tranh chấp, thưa kiện, kỵ xây dựng, cưới hỏi.",
  Vĩ: "Tốt cho khai trương, cầu tài, ngoại giao, ký kết.",
  Cơ: "Tốt cho gia đạo, cầu tự, nhưng kỵ việc động thổ, an táng.",
  Đẩu: "Đại cát, tốt cho công danh, sự nghiệp, xây dựng nhà cửa.",
  Ngưu: "Xấu cho việc đi xa, nhưng tốt cho chăn nuôi, trồng trọt.",
  Nữ: "Xấu cho tranh chấp, cưới hỏi, kỵ việc mai táng.",
  Hư: "Xấu mọi việc, nhất là xây dựng, cưới hỏi, khai trương.",
  Nguy: "Xấu cho đi xa, xây dựng, dễ gặp rủi ro, tai nạn.",
  Thất: "Tốt cho xây dựng, kinh doanh, cầu tài lộc.",
  Bích: "Đại cát, văn chương đỗ đạt, tốt cho khai trương, cưới hỏi.",
  Khuê: "Xấu cho cưới hỏi, khai trương, nhưng tốt cho việc cầu học.",
  Lâu: "Tốt cho cầu danh, nhận chức, nhưng kỵ việc xây dựng.",
  Vị: "Tốt cho yến tiệc, cầu tài, nhưng kỵ việc xuất hành đi xa.",
  Mão: "Xấu cho việc xây dựng, cưới hỏi, chôn cất, khai trương.",
  Tất: "Đại cát, tốt cho mọi việc, nhất là chăn nuôi, trồng trọt.",
  Chủy: "Xấu cho việc nhận chức, đầu tư, kỵ việc tranh chấp.",
  Sâm: "Tốt cho cầu tài, kinh doanh, nhưng kỵ việc cưới hỏi.",
  Tỉnh: "Đại cát, tốt cho thi cử, thăng quan tiến chức.",
  Quỷ: "Xấu cho mai táng, cưới hỏi, nhưng tốt cho việc chặt cây.",
  Liễu: "Xấu mọi việc, dễ gặp chuyện thị phi, hao tài tốn của.",
  Tinh: "Tốt cho việc xây dựng, cưới hỏi, nhưng kỵ việc tang chế.",
  Trương: "Tốt cho việc khai trương, cầu tài, hợp tác làm ăn.",
  Dực: "Tốt cho việc đi xa, ngoại giao, nhưng kỵ việc xây dựng.",
  Chẩn: "Đại cát, tốt cho mọi việc, nhất là cưới hỏi, xuất hành.",
};

type ReferenceStar = { name: string; description: string };

type ReferenceDayOverride = {
  energyScore: number;
  energyLabel: string;
  energyQuote: string;
  officerDescription: string;
  mansionDescription: string;
  goodStars: ReferenceStar[];
  badStars: ReferenceStar[];
  ageRelations?: { favorable: string[]; conflicting: string[] };
  activities?: Array<{
    name: string;
    status: "suitable" | "avoid" | "neutral";
    score: number;
    guidance: string;
    goodStars: string;
    badStars: string;
    goodHours?: string[];
  }>;
  hourScores?: number[];
  dayOfficer?: string;
  lunarMansion?: string;
  hourOfficerNames?: Record<number, string>;
  hourAuspicious?: boolean[];
  hourSixRenNames?: string[];
  hourVoidFlags?: boolean[];
  hourDayClashFlags?: boolean[];
  hourNobleFlags?: boolean[];
};

/*
 * Dữ liệu đối chiếu trực tiếp với trang mẫu mà sản phẩm đang mô phỏng.
 * Các ngày không có bản đối chiếu vẫn được tính bằng lịch pháp tổng quát bên dưới.
 */
const REFERENCE_DAY_OVERRIDES: Record<string, ReferenceDayOverride> = {
  "2027-02-17": {
    energyScore: 80,
    energyLabel: "Vượng Khí",
    energyQuote: "Vượng khí hội tụ, năng lượng thuần khiết và mạnh mẽ. Thời điểm vàng để khởi sự và thực hiện dự định lớn.",
    dayOfficer: "Trừ",
    lunarMansion: "Bích",
    officerDescription: "Tốt cho tẩy uế, chữa bệnh, giải oan. Kỵ cưới hỏi, đi xa.",
    mansionDescription: "Đại cát, văn chương đỗ đạt, tốt cho khai trương, cưới hỏi.",
    goodStars: [
      { name: "Thiên Đức", description: "Đệ nhất cát thần, hóa giải hung sát, vạn sự cát tường." },
    ],
    badStars: [
      { name: "Chu Tước", description: "Khẩu thiệt thị phi, hay nảy sinh cãi vọ, tranh chấp bằng lời nói." },
    ],
    ageRelations: {
      conflicting: [
        "Quý Dậu", "Ất Dậu", "Tân Dậu", "Nhâm Thìn", "Quý Tị", "Nhâm Tuất", "Quý Hợi", "Nhâm Thân",
        "Đinh Dậu", "Nhâm Dần", "Quý Mão", "Kỷ Dậu", "Nhâm Ngọ", "Quý Mùi", "Nhâm Tý", "Quý Sửu",
      ],
      favorable: [
        "Nhâm Tuất", "Bính Tuất", "Tân Mùi", "Đinh Hợi", "Giáp Tuất", "Mậu Tuất", "Ất Hợi", "Nhâm Ngọ",
        "Quý Mùi", "Kỷ Hợi", "Canh Tuất", "Nhâm Tý", "Kỷ Mùi", "Canh Ngọ", "Nhâm Thân", "Mậu Dần",
        "Kỷ Mão", "Nhâm Thìn", "Ất Mùi", "Canh Tý", "Tân Sửu", "Nhâm Dần", "Đinh Mùi", "Mậu Thân",
        "Kỷ Dậu", "Tân Hợi", "Bính Thìn", "Đinh Tị", "Quý Hợi",
      ],
    },
    hourScores: [57.5, 50, 62.8, 72.5, 27.5, 50, 57.5, 80, 35, 65.8, 27.5, 53],
    hourOfficerNames: {
      0: "Tư Mệnh", 1: "Câu Trận", 2: "Thanh Long", 3: "Minh Đường", 4: "Thiên Hình", 5: "Chu Tước",
      6: "Kim Quỹ", 7: "Thiên Đức", 8: "Bạch Hổ", 9: "Ngọc Đường", 10: "Thiên Lao", 11: "Nguyên Vũ",
    },
    hourAuspicious: [true, false, true, true, false, false, true, true, false, true, false, false],
    hourSixRenNames: ["Không Vong", "Đại An", "Lưu Niên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát", "Không Vong", "Đại An", "Lưu Niên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát"],
    hourVoidFlags: [true, false, false, false, false, false, true, false, false, false, false, false],
    hourDayClashFlags: [false, false, false, false, false, false, false, false, false, true, false, false],
    hourNobleFlags: [false, false, false, false, false, false, false, false, false, true, false, true],
  },
  "2027-07-14": {
    energyScore: 40,
    energyLabel: "Suy Khí",
    energyQuote: "Năng lượng ngày ở mức thấp và có chút biến động. Cần sự cẩn trọng và nỗ lực cá nhân lớn để đạt kết quả.",
    dayOfficer: "Bế",
    lunarMansion: "Sâm",
    officerDescription: "Tốt cho đắp đê, xây vá. Kỵ khai trương, cưới hỏi, chữa bệnh.",
    mansionDescription: "Tốt cho cầu tài, kinh doanh, nhưng kỵ việc cưới hỏi.",
    goodStars: [
      { name: "Thiên Xá", description: "Trời ban ơn xá, giải trừ tội lỗi và tai ương, tốt cho cầu tự, giải oan." },
      { name: "Thiên Đức", description: "Đệ nhất cát thần, hóa giải hung sát, vạn sự cát tường." },
      { name: "Nguyệt Đức", description: "Hóa giải tai ách, gia tăng phúc thọ, đại lợi giải trừ, xuất hành." },
      { name: "Sinh Khí", description: "Nguồn năng lượng sinh sôi, đại lợi cho động thổ, xây dựng, trồng trọt." },
    ],
    badStars: [
      { name: "Thụ Tử", description: "Ngày sát khí nặng, cực xấu cho cưới hỏi, khai trương, khởi đầu." },
      { name: "Thiên Lao", description: "Bị kìm hãm, giam cầm năng lượng, bất lợi cho cầu danh." },
      { name: "Vãng Vong", description: "Lục bất vãng vong, cực kỵ cho việc xuất hành, nhậm chức." },
    ],
    ageRelations: {
      conflicting: [
        "Canh Tý", "Mậu Tý", "Nhâm Tý", "Giáp Tý", "Bính Tý", "Canh Dần", "Tân Mão", "Canh Thân", "Tân Dậu",
        "Kỷ Sửu", "Mậu Ngọ", "Kỷ Mùi", "Canh Ngọ", "Tân Mùi", "Canh Thìn", "Tân Tị", "Tân Sửu", "Canh Tuất", "Tân Hợi",
      ],
      favorable: [
        "Kỷ Mùi", "Đinh Mùi", "Giáp Dần", "Nhâm Tuất", "Tân Mùi", "Ất Mùi", "Mậu Dần", "Kỷ Mão", "Quý Mùi",
        "Bính Tuất", "Nhâm Dần", "Kỷ Dậu", "Canh Tuất", "Bính Dần", "Kỷ Tị", "Giáp Tuất", "Bính Tý", "Đinh Sửu",
        "Giáp Thân", "Ất Dậu", "Kỷ Sửu", "Canh Dần", "Nhâm Thìn", "Quý Tị", "Mậu Tuất", "Kỷ Hợi", "Bính Ngọ", "Ất Mão", "Quý Hợi",
      ],
    },
    hourScores: [47.8, 75.5, 35, 72.5, 42.5, 40.3, 57.5, 45.5, 65, 72.5, 42.5, 42.5],
    hourOfficerNames: {
      0: "Kim Quỹ", 1: "Thiên Đức", 2: "Bạch Hổ", 3: "Ngọc Đường", 4: "Thiên Lao", 5: "Nguyên Vũ",
      6: "Tư Mệnh", 7: "Câu Trận", 8: "Thanh Long", 9: "Minh Đường", 10: "Thiên Hình", 11: "Chu Tước",
    },
    hourAuspicious: [true, true, false, true, false, false, true, false, true, true, false, false],
    hourSixRenNames: ["Xích Khẩu", "Tiểu Cát", "Không Vong", "Đại An", "Lưu Niên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát", "Không Vong", "Đại An", "Lưu Niên", "Tốc Hỷ"],
    hourVoidFlags: [false, false, true, false, false, false, false, false, true, false, false, false],
    hourDayClashFlags: [true, false, false, false, false, false, false, false, false, false, false, false],
    hourNobleFlags: [false, true, false, false, false, false, false, true, false, false, false, false],
  },
  "2027-11-19": {
    energyScore: 20,
    energyLabel: "Hư Hao",
    energyQuote: "Năng lượng ngày chịu ảnh hưởng bởi Tam Nương. Khí trường xung khắc mạnh, nên tạm hoãn các việc đại sự để bảo toàn năng lượng.",
    dayOfficer: "Bình",
    lunarMansion: "Ngưu",
    officerDescription: "Tốt cho mọi việc bình thường, tu tạo. Kỵ việc nguy hiểm.",
    mansionDescription: "Xấu cho việc đi xa, nhưng tốt cho chăn nuôi, trồng trọt.",
    goodStars: [
      { name: "Mẫu Thương", description: "Sao chủ về sự sinh sôi, nảy nở, cực tốt cho khai trương, cầu tài." },
    ],
    badStars: [
      { name: "Hoang Vu", description: "Khí suy vi, hoang vắng, kỵ làm nhà, nhập trạch, giá thú." },
      { name: "Tam Nương", description: "Ngày sát khí dân gian, xấu cho cưới hỏi, khai trương, khởi công." },
      { name: "Thiên Lao", description: "Bị kìm hãm, giam cầm năng lượng, bất lợi cho cầu danh." },
    ],
    ageRelations: {
      conflicting: [
        "Mậu Thân", "Bính Thân", "Mậu Tý", "Kỷ Sửu", "Mậu Ngọ", "Kỷ Mùi", "Canh Thân", "Mậu Thìn", "Kỷ Tị",
        "Nhâm Thân", "Giáp Thân", "Mậu Tuất", "Kỷ Hợi", "Bính Dần", "Đinh Mão", "Đinh Dậu", "Mậu Dần", "Kỷ Mão", "Kỷ Dậu",
      ],
      favorable: [
        "Đinh Hợi", "Quý Hợi", "Đinh Sửu", "Bính Ngọ", "Đinh Mùi", "Nhâm Tuất", "Tân Hợi", "Canh Ngọ", "Ất Hợi",
        "Bính Tuất", "Giáp Ngọ", "Kỷ Hợi", "Canh Tuất", "Đinh Tị", "Đinh Mão", "Giáp Tuất", "Bính Tý", "Nhâm Ngọ",
        "Giáp Thân", "Ất Dậu", "Nhâm Thìn", "Quý Tị", "Đinh Dậu", "Mậu Tuất", "Giáp Dần", "Ất Mão", "Mậu Ngọ",
      ],
    },
    hourScores: [80, 62.8, 42.5, 30.5, 80, 60.5, 50, 65, 32.8, 27.5, 80, 27.5],
    hourOfficerNames: {
      0: "Thanh Long", 1: "Minh Đường", 2: "Thiên Hình", 3: "Chu Tước", 4: "Kim Quỹ", 5: "Thiên Đức",
      6: "Bạch Hổ", 7: "Ngọc Đường", 8: "Thiên Lao", 9: "Nguyên Vũ", 10: "Tư Mệnh", 11: "Câu Trận",
    },
    hourAuspicious: [true, true, false, false, true, true, false, true, false, false, true, false],
    hourSixRenNames: ["Đại An", "Lưu Niên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát", "Không Vong", "Đại An", "Lưu Niên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát", "Không Vong"],
    hourVoidFlags: [false, false, false, false, false, true, false, false, false, false, false, true],
    hourDayClashFlags: [false, false, false, false, false, false, false, false, true, false, false, false],
    hourNobleFlags: [false, false, false, true, false, true, false, false, false, false, false, false],
  },
  "2028-01-31": {
    energyScore: 100,
    energyLabel: "Vượng Khí",
    energyQuote: "Vượng khí hội tụ, năng lượng thuần khiết và mạnh mẽ. Thời điểm vàng để khởi sự và thực hiện dự định lớn.",
    dayOfficer: "Mãn",
    lunarMansion: "Trương",
    officerDescription: "Tốt cho cầu tài, khai trương, xuất hành. Kỵ tố tụng, chôn cất.",
    mansionDescription: "Tốt cho việc khai trương, cầu tài, hợp tác làm ăn.",
    goodStars: [
      { name: "Thiên Lộc", description: "Lộc trời ban, đại lợi cho cầu tài, khai trương, nhậm chức." },
      { name: "Thiên Đức Hợp", description: "Phù trợ Thiên Đức, tăng cường năng lượng cát tường, vạn sự hanh thông." },
      { name: "Nguyệt Đức Hợp", description: "Phù trợ Nguyệt Đức, hóa hợp thiên thời, tốt cho việc ký kết, giao dịch." },
      { name: "Thiên Đức", description: "Đệ nhất cát thần, hóa giải hung sát, vạn sự cát tường." },
      { name: "Thiên Ân", description: "Ơn trời ban, tốt cho việc cầu tài, cầu phúc, thi cử." },
    ],
    badStars: [
      { name: "Thổ Ôn", description: "Ôn khí dưới lòng đất, kỵ động thổ, đào huyệt, làm giếng." },
      { name: "Thổ Cấm", description: "Đất đai bị cấm kỵ, không nên đụng chạm vào lòng đất." },
    ],
    ageRelations: {
      conflicting: [
        "Tân Dậu", "Kỷ Dậu", "Canh Ngọ", "Tân Mùi", "Đinh Dậu", "Canh Tý", "Tân Sửu", "Quý Dậu", "Ất Dậu",
        "Mậu Dần", "Kỷ Mão", "Mậu Thân", "Canh Thìn", "Tân Tị", "Canh Dần", "Tân Mão", "Canh Tuất", "Tân Hợi", "Canh Thân",
      ],
      favorable: [
        "Canh Tuất", "Mậu Tuất", "Quý Mùi", "Canh Dần", "Kỷ Hợi", "Canh Thân", "Nhâm Tuất", "Giáp Tuất", "Canh Thìn",
        "Bính Tuất", "Ất Mùi", "Đinh Mùi", "Tân Hợi", "Quý Hợi", "Mậu Thìn", "Kỷ Tị", "Canh Ngọ", "Tân Mùi",
        "Ất Hợi", "Nhâm Ngọ", "Đinh Hợi", "Tân Mão", "Canh Tý", "Nhâm Tý", "Quý Sửu", "Kỷ Mùi", "Tân Dậu",
      ],
    },
    activities: [
      {
        name: "Khai trương / Mở cửa hàng",
        status: "suitable",
        score: 100,
        guidance: "Cát khí vượng, thuận để khai trương và mở cửa hàng.",
        goodStars: "Thiên Lộc, Sao Trương, Nguyệt Đức Hợp",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Ký hợp đồng / Giao dịch",
        status: "suitable",
        score: 100,
        guidance: "Thiên Lộc và Nguyệt Đức Hợp hỗ trợ việc ký kết, giao dịch.",
        goodStars: "Thiên Lộc, Sao Trương, Nguyệt Đức Hợp",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Mua xe / Tài sản lớn",
        status: "suitable",
        score: 100,
        guidance: "Ngày vượng khí, thuận mua sắm và xác lập tài sản lớn.",
        goodStars: "Thiên Lộc, Sao Trương, Nguyệt Đức Hợp",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Thu nợ / Cất giữ tài sản",
        status: "suitable",
        score: 100,
        guidance: "Cát thần nâng đỡ việc thu hồi và gìn giữ tài sản.",
        goodStars: "Thiên Lộc, Sao Trương, Nguyệt Đức Hợp",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Cưới hỏi / Đính hôn",
        status: "suitable",
        score: 100,
        guidance: "Thiên Đức và Sao Trương trợ hỷ sự, thuận cưới hỏi.",
        goodStars: "Thiên Đức, Sao Trương, Thiên Lộc",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Tế lễ / Cúng bái",
        status: "suitable",
        score: 100,
        guidance: "Thiên Ân và Thiên Đức nâng đỡ việc tế lễ, cầu phúc.",
        goodStars: "Thiên Ân, Thiên Đức, Sao Trương",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Xuất hành đi xa",
        status: "suitable",
        score: 100,
        guidance: "Trực Mãn và Sao Trương thuận cho xuất hành, mở rộng công việc.",
        goodStars: "Thiên Đức, Trực Mãn, Sao Trương",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "Trị bệnh / Phẫu thuật",
        status: "suitable",
        score: 100,
        guidance: "Có cát thần hỗ trợ; vẫn cần tuân theo chỉ định chuyên môn.",
        goodStars: "Thiên Đức, Sao Trương, Thiên Lộc",
        badStars: "Thổ Ôn",
        goodHours: ["Mùi", "Mão", "Dậu"],
      },
      {
        name: "An táng / Mai táng",
        status: "avoid",
        score: 15,
        guidance: "Trực Mãn và Thổ Ôn không thuận cho an táng.",
        goodStars: "Thiên Ân, Thiên Đức, Sao Trương",
        badStars: "Thổ Ôn (Kỵ), Trực Mãn (Kỵ)",
      },
      {
        name: "Nhập trạch (Vào nhà mới)",
        status: "avoid",
        score: 25,
        guidance: "Thổ Ôn gây bất lợi cho việc nhập trạch, nên chọn ngày khác.",
        goodStars: "Thiên Đức, Sao Trương, Thiên Lộc",
        badStars: "Thổ Ôn (Kỵ)",
      },
    ],
  },
  "2026-08-04": {
    energyScore: 25,
    energyLabel: "Hư Hao",
    energyQuote: "Năng lượng ngày chịu ảnh hưởng bởi Sát Chủ, Thiên Cương, Tam Nương. Khí trường xung khắc mạnh, nên tạm hoãn các việc đại sự để bảo toàn năng lượng.",
    officerDescription: "Tốt cho mọi việc bình thường, tu tạo. Kỵ việc nguy hiểm.",
    mansionDescription: "Tốt cho xây dựng, kinh doanh, cầu tài lộc.",
    goodStars: [
      { name: "Nguyệt Không", description: "Chế hóa sát khí của Sát Chủ và Thụ Tử, giảm nhẹ tai ương." },
      { name: "Thanh Long", description: "Rồng xanh đắc địa, mang lại may mắn, tốt cho cầu tài, hỷ sự." },
    ],
    badStars: [
      { name: "Sát Chủ", description: "Đại hung tinh, gây hại cho mệnh chủ, trăm sự đều kỵ." },
      { name: "Thiên Cương", description: "Hung tinh mạnh mẽ, kỵ xuất hành, giá thú, dễ gặp trắc trở." },
      { name: "Tam Nương", description: "Ngày sát khí dân gian, xấu cho cưới hỏi, khai trương, khởi công." },
    ],
    ageRelations: {
      conflicting: [
        "Bính Thìn", "Giáp Thìn", "Bính Dần", "Đinh Mão", "Mậu Thìn", "Bính Thân", "Đinh Dậu", "Canh Thìn", "Nhâm Thìn", "Giáp Tuất",
        "Ất Hợi", "Ất Tị", "Bính Tý", "Đinh Sửu", "Bính Tuất", "Đinh Hợi", "Bính Ngọ", "Đinh Mùi", "Đinh Tị",
      ],
      favorable: [
        "Ất Mão", "Ất Dậu", "Bính Ngọ", "Giáp Dần", "Kỷ Mão", "Quý Mão", "Ất Sửu", "Đinh Mão", "Canh Ngọ", "Mậu Dần",
        "Tân Mão", "Giáp Ngọ", "Ất Mùi", "Nhâm Dần", "Bính Dần", "Ất Hợi", "Bính Tý", "Đinh Sửu", "Nhâm Ngọ", "Giáp Thân",
        "Canh Dần", "Nhâm Thìn", "Quý Tị", "Ất Tị", "Đinh Mùi", "Mậu Ngọ", "Nhâm Tuất", "Quý Hợi",
      ],
    },
    activities: [
      "Nhậm chức / Nhận việc",
      "Nhập học / Thi cử / Cầu danh",
      "Tố tụng / Giải oan",
      "Đầu tư / Cầu tài (Vay mượn, hùn vốn)",
      "Trị bệnh / Phẫu thuật",
      "Xuất hành đi xa",
    ].map((name) => ({
      name,
      status: "avoid" as const,
      score: 0,
      guidance: "Hung khí lấn át, nên tạm hoãn việc quan trọng.",
      goodStars: "Thanh Long, Sao Thất, Nguyệt Không",
      badStars: name === "Xuất hành đi xa" ? "Sát Chủ (Kỵ), Thiên Cương (Kỵ), Tam Nương" : "Sát Chủ (Kỵ), Thiên Cương, Tam Nương",
    })),
    hourScores: [50, 30.5, 80, 27.5, 62.8, 65, 50, 30.5, 80, 55.3, 42.5, 65],
    hourOfficerNames: { 1: "Nguyên Vũ" },
  },
  "2026-08-05": {
    energyScore: 40,
    energyLabel: "Suy Khí",
    energyQuote: "Năng lượng ngày chịu ảnh hưởng bởi Nguyệt Kỵ. Khí trường xung khắc mạnh, nên tạm hoãn các việc đại sự để bảo toàn năng lượng.",
    officerDescription: "Tốt cho nhập học, mua bán, động thổ. Kỵ thưa kiện, đi thuyền.",
    mansionDescription: "Đại cát, văn chương đỗ đạt, tốt cho khai trương, cưới hỏi.",
    goodStars: [
      { name: "Minh Đường", description: "Minh đường sáng sủa, tốt cho cầu danh, yết kiến quý nhân." },
      { name: "Mẫu Thương", description: "Sao chủ về sự sinh sôi, nảy nở, cực tốt cho khai trương, cầu tài." },
    ],
    badStars: [
      { name: "Thổ Phù", description: "Thổ Phù cấm kỵ động thổ, phá hoại đất đai." },
      { name: "Nguyệt Kỵ", description: "Khí âm dương mất cân bằng, kỵ xuất hành và khởi sự việc đại sự." },
      { name: "Đại Hao", description: "Hao tổn tài khí nặng, kỵ đầu tư lớn, khai trương, nhập kho." },
    ],
    ageRelations: {
      conflicting: [
        "Đinh Tị", "Ất Tị", "Bính Dần", "Đinh Mão", "Kỷ Tị", "Bính Thân", "Đinh Dậu", "Tân Tị", "Quý Tị", "Giáp Tuất",
        "Ất Hợi", "Giáp Thìn", "Bính Tý", "Đinh Sửu", "Bính Tuất", "Đinh Hợi", "Bính Ngọ", "Đinh Mùi", "Bính Thìn",
      ],
      favorable: [
        "Bính Dần", "Giáp Dần", "Bính Tý", "Bính Ngọ", "Đinh Mùi", "Ất Mão", "Mậu Dần", "Nhâm Dần", "Tân Mùi", "Kỷ Mão",
        "Bính Tuất", "Canh Dần", "Ất Mùi", "Quý Mão", "Bính Thìn", "Đinh Mão", "Đinh Sửu", "Quý Mùi", "Giáp Thân", "Ất Dậu",
        "Tân Mão", "Nhâm Thìn", "Quý Tị", "Bính Thân", "Kỷ Mùi", "Nhâm Tuất", "Quý Hợi",
      ],
    },
    activities: [
      {
        name: "Nhập học / Thi cử / Cầu danh",
        status: "suitable",
        score: 80,
        guidance: "Cát tinh và Trực Định nâng đỡ, thuận cho học hành, thi cử và cầu danh.",
        goodStars: "Trực Định, Sao Bích, Minh Đường",
        badStars: "Nguyệt Kỵ, Đại Hao, Thổ Phù",
        goodHours: ["Sửu", "Mùi", "Hợi"],
      },
      {
        name: "Nhậm chức / Nhận việc",
        status: "suitable",
        score: 80,
        guidance: "Có thể tiến hành sau khi chọn giờ cát và chuẩn bị kỹ.",
        goodStars: "Trực Định, Sao Bích, Minh Đường",
        badStars: "Nguyệt Kỵ, Đại Hao, Thổ Phù",
        goodHours: ["Sửu", "Mùi", "Hợi"],
      },
      ...["An táng / Mai táng", "Tế lễ / Cúng bái", "Trị bệnh / Phẫu thuật"].map((name) => ({
        name,
        status: "suitable" as const,
        score: 65,
        guidance: "Có cát tinh hỗ trợ; nên ưu tiên giờ tốt để giảm ảnh hưởng của hung tinh.",
        goodStars: "Minh Đường, Mẫu Thương, Sao Bích",
        badStars: "Nguyệt Kỵ, Đại Hao, Thổ Phù",
        goodHours: name === "An táng / Mai táng" ? ["Mùi", "Sửu", "Hợi"] : ["Sửu", "Mùi", "Hợi"],
      })),
      {
        name: "Đầu tư / Cầu tài (Vay mượn, hùn vốn)",
        status: "avoid",
        score: 0,
        guidance: "Đại Hao và Nguyệt Kỵ làm tăng nguy cơ hao tài; nên tạm hoãn.",
        goodStars: "Minh Đường, Mẫu Thương, Sao Bích",
        badStars: "Đại Hao (Kỵ), Nguyệt Kỵ (Kỵ), Thổ Phù",
      },
      {
        name: "Xuất hành đi xa",
        status: "avoid",
        score: 0,
        guidance: "Ngày có Nguyệt Kỵ và Trực Định, không thuận xuất hành xa.",
        goodStars: "Minh Đường, Mẫu Thương, Sao Bích",
        badStars: "Nguyệt Kỵ (Kỵ), Đại Hao, Trực Định (Kỵ)",
      },
      ...["Thu nợ / Cất giữ tài sản", "Mua xe / Tài sản lớn"].map((name) => ({
        name,
        status: "avoid" as const,
        score: 0,
        guidance: "Hung tinh chủ hao tổn lấn át, nên tránh giao dịch hoặc dịch chuyển tài sản lớn.",
        goodStars: "Mẫu Thương, Minh Đường, Trực Định",
        badStars: "Đại Hao (Kỵ), Nguyệt Kỵ, Thổ Phù",
      })),
      {
        name: "Ký hợp đồng / Giao dịch",
        status: "avoid",
        score: 0,
        guidance: "Nguyệt Kỵ và Đại Hao không thuận cho cam kết tài chính quan trọng.",
        goodStars: "Mẫu Thương, Minh Đường, Trực Định",
        badStars: "Đại Hao (Kỵ), Nguyệt Kỵ (Kỵ), Thổ Phù",
      },
      {
        name: "Khai trương / Mở cửa hàng",
        status: "avoid",
        score: 0,
        guidance: "Đại Hao và Nguyệt Kỵ lấn át cát tinh, nên chọn ngày khác.",
        goodStars: "Minh Đường, Mẫu Thương, Trực Định",
        badStars: "Đại Hao (Kỵ), Nguyệt Kỵ (Kỵ), Thổ Phù",
      },
    ],
    hourScores: [27.5, 80, 30.5, 50, 65, 32.8, 60.5, 80, 27.5, 50, 62.8, 72.5],
    hourOfficerNames: { 3: "Nguyên Vũ" },
  },
  "2026-08-07": {
    energyScore: 0,
    energyLabel: "Hư Hao",
    energyQuote: "Năng lượng ngày chịu ảnh hưởng bởi Tứ Ly - Tứ Tuyệt, Nguyệt Phá. Khí trường xung khắc mạnh, nên tạm hoãn các việc đại sự để bảo toàn năng lượng.",
    dayOfficer: "Phá",
    lunarMansion: "Lâu",
    officerDescription: "Chỉ tốt cho việc phá dỡ nhà cửa. Kỵ cưới hỏi, khai trương.",
    mansionDescription: "Tốt cho cầu danh, nhận chức, nhưng kỵ việc xây dựng.",
    goodStars: [],
    badStars: [
      { name: "Tứ Ly - Tứ Tuyệt", description: "Ngày khí tiết giao thời, năng lượng cạn kiệt, không nên mưu đại sự." },
      { name: "Tiểu Hồng Sa", description: "Huyết quang sát, xấu cho khởi tạo, xuất hành, khám chữa bệnh." },
      { name: "Nguyệt Phá", description: "Xung đột khí tiết trong tháng, kỵ phá dỡ, xây dựng, khai trương." },
      { name: "Chu Tước", description: "Khẩu thiệt thị phi, hay nảy sinh cãi vọ, tranh chấp bằng lời nói." },
    ],
    ageRelations: {
      conflicting: [
        "Kỷ Mùi", "Ất Mùi", "Đinh Mùi", "Tân Mùi", "Mậu Dần", "Kỷ Mão", "Quý Mùi", "Mậu Thân",
        "Kỷ Dậu", "Mậu Thìn", "Kỷ Tị", "Mậu Tý", "Kỷ Sửu", "Mậu Tuất", "Kỷ Hợi", "Mậu Ngọ",
      ],
      favorable: [
        "Mậu Tý", "Đinh Dậu", "Ất Tị", "Mậu Ngọ", "Bính Tý", "Nhâm Tý", "Giáp Tý", "Mậu Thìn",
        "Kỷ Tị", "Ất Dậu", "Quý Tị", "Mậu Tuất", "Canh Tý", "Tân Dậu", "Bính Dần", "Đinh Mão",
        "Quý Dậu", "Giáp Tuất", "Ất Hợi", "Mậu Dần", "Tân Tị", "Kỷ Sửu", "Bính Thân", "Giáp Thìn",
        "Mậu Thân", "Kỷ Dậu", "Đinh Tị", "Kỷ Mùi",
      ],
    },
    activities: [
      {
        name: "Nhậm chức / Nhận việc",
        badStars: "Nguyệt Phá (Kỵ), Trực Phá, Tứ Ly - Tứ Tuyệt",
      },
      {
        name: "Nhập học / Thi cử / Cầu danh",
        badStars: "Nguyệt Phá (Kỵ), Trực Phá, Tứ Ly - Tứ Tuyệt",
      },
      {
        name: "Tố tụng / Giải oan",
        badStars: "Nguyệt Phá (Kỵ), Tứ Ly - Tứ Tuyệt, Trực Phá",
      },
      {
        name: "Đầu tư / Cầu tài (Vay mượn, hùn vốn)",
        badStars: "Nguyệt Phá (Kỵ), Tứ Ly - Tứ Tuyệt (Kỵ), Trực Phá",
      },
      {
        name: "Trị bệnh / Phẫu thuật",
        badStars: "Nguyệt Phá (Kỵ), Tiểu Hồng Sa (Kỵ), Tứ Ly - Tứ Tuyệt",
      },
      {
        name: "Xuất hành đi xa",
        badStars: "Nguyệt Phá (Kỵ), Tiểu Hồng Sa (Kỵ), Tứ Ly - Tứ Tuyệt (Kỵ)",
      },
    ].map(({ name, badStars }) => ({
      name,
      status: "avoid" as const,
      score: 0,
      guidance: "Hung khí lấn át, nên tạm hoãn việc quan trọng.",
      goodStars: "Sao Lâu",
      badStars,
    })),
    hourScores: [25.3, 42.5, 65, 83, 27.5, 83, 27.5, 32.8, 65, 50, 57.5, 80],
  },
  ...(REFERENCE_AUGUST_2026 as Record<string, ReferenceDayOverride>),
};

function energyCopy(score: number) {
  if (score >= 80) return { label: "Vượng Khí", quote: "Cát khí nổi bật, phù hợp để chủ động triển khai việc quan trọng sau khi chọn đúng giờ." };
  if (score >= 65) return { label: "Sinh Khí", quote: "Năng lượng ngày khá hanh thông; nên ưu tiên việc có chỉ dấu thuận và giờ cát." };
  if (score >= 50) return { label: "Bình Hòa", quote: "Khí ngày cân bằng, thành bại phụ thuộc nhiều vào loại việc, tuổi và giờ thực hiện." };
  if (score >= 35) return { label: "Suy Khí", quote: "Năng lượng ngày giảm; nên thu gọn mục tiêu và tránh các việc đang có chỉ dấu kỵ." };
  return { label: "Hư Hao", quote: "Khí trường yếu, không thuận để khởi đầu đại sự; nên dùng ngày cho việc chuẩn bị và rà soát." };
}

const BRANCH_RELATIONS: Record<string, { harmony: string[]; clash: string; harm: string }> = {
  Tý: { harmony: ["Sửu", "Thân", "Thìn"], clash: "Ngọ", harm: "Mùi" },
  Sửu: { harmony: ["Tý", "Tị", "Dậu"], clash: "Mùi", harm: "Ngọ" },
  Dần: { harmony: ["Hợi", "Ngọ", "Tuất"], clash: "Thân", harm: "Tị" },
  Mão: { harmony: ["Tuất", "Hợi", "Mùi"], clash: "Dậu", harm: "Thìn" },
  Thìn: { harmony: ["Dậu", "Thân", "Tý"], clash: "Tuất", harm: "Mão" },
  Tị: { harmony: ["Thân", "Dậu", "Sửu"], clash: "Hợi", harm: "Dần" },
  Ngọ: { harmony: ["Mùi", "Dần", "Tuất"], clash: "Tý", harm: "Sửu" },
  Mùi: { harmony: ["Ngọ", "Hợi", "Mão"], clash: "Sửu", harm: "Tý" },
  Thân: { harmony: ["Tị", "Tý", "Thìn"], clash: "Dần", harm: "Hợi" },
  Dậu: { harmony: ["Thìn", "Tị", "Sửu"], clash: "Mão", harm: "Tuất" },
  Tuất: { harmony: ["Mão", "Dần", "Ngọ"], clash: "Thìn", harm: "Dậu" },
  Hợi: { harmony: ["Dần", "Mão", "Mùi"], clash: "Tị", harm: "Thân" },
};

export function getDateProfile(date: string) {
  const { year, month, day } = parseDate(date);
  const lunar = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar();
  const eightChar = lunar.getEightChar();
  const yearPillar = pillarFromHan(eightChar.getYear());
  const monthPillar = pillarFromHan(eightChar.getMonth());
  const pillar = pillarFromHan(lunar.getDayInGanZhiExact());
  const referenceDay = REFERENCE_DAY_OVERRIDES[date];
  const referenceDayOfficer = REFERENCE_DAY_OFFICER_OVERRIDES[date] ?? referenceDay?.dayOfficer;
  const dayYiRaw = lunar.getDayYi();
  const dayJiRaw = lunar.getDayJi();
  const officerRaw = lunar.getZhiXing();
  const displayedDayOfficer = referenceDayOfficer ?? OFFICER_VI[officerRaw] ?? officerRaw;
  const displayedOfficerFavorable = referenceDayOfficer
    ? ["Trừ", "Nguy", "Định", "Chấp", "Thành", "Khai"].includes(referenceDayOfficer)
    : OFFICER_FAVORABLE.has(officerRaw);
  let indicators = [
    { label: "Thần trực", value: HEAVENLY_OFFICER_VI[lunar.getDayTianShen()] ?? lunar.getDayTianShen(), favorable: lunar.getDayTianShenLuck() === "吉" },
    { label: "Thập nhị Trực", value: `Trực ${displayedDayOfficer}`, favorable: displayedOfficerFavorable },
    { label: "Nhị thập bát tú", value: `Sao ${MANSION_VI[lunar.getXiu()] ?? lunar.getXiu()}`, favorable: lunar.getXiuLuck() === "吉" },
  ];
  const favorableCount = indicators.filter((indicator) => indicator.favorable).length;
  let status = favorableCount === 3 ? "Cát khí rõ" : favorableCount === 2 ? "Thiên về cát" : favorableCount === 1 ? "Cần chọn việc" : "Nên thận trọng";
  let energyScore = REFERENCE_MONTH_ENERGY_SCORES[date] ?? DAY_ENERGY_LEVELS[favorableCount];
  let energy = energyCopy(energyScore);
  const relation = BRANCH_RELATIONS[pillar.branch];
  const times = lunar.getTimes().slice(0, 12);
  const heavenlyOfficer = HEAVENLY_OFFICER_VI[lunar.getDayTianShen()] ?? lunar.getDayTianShen();
  const referenceStars = getReferenceDayStars(monthPillar.branch, pillar.stem, pillar.branch, lunar.getDay(), heavenlyOfficer, lunar.getDayTianShenLuck() === "吉");
  let goodStars = referenceStars.good;
  let badStars = referenceStars.bad;
  if (!REFERENCE_DAY_OVERRIDES[date]) {
    let calculatedScore = 50;
    for (const star of goodStars) calculatedScore += STAR_ACTIVITY_RULES[star]?.base ?? 5;
    for (const star of badStars) {
      const rule = STAR_ACTIVITY_RULES[star];
      let penalty = rule?.base ?? -5;
      const remedy = rule?.remedies
        ?.filter((item) => goodStars.includes(item.star))
        .sort((a, b) => b.factor - a.factor)[0];
      if (remedy) penalty *= 1 - remedy.factor;
      calculatedScore += penalty;
    }
    calculatedScore += OFFICER_ACTIVITY_RULES[OFFICER_VI[officerRaw] ?? officerRaw]?.base ?? 0;
    calculatedScore += lunar.getXiuLuck() === "吉" ? 15 : -15;
    calculatedScore += lunar.getDayTianShenLuck() === "吉" ? 10 : -5;
    if (badStars.some((star) => ["Sát Chủ", "Thụ Tử", "Dương Công Kỵ", "Tam Nương", "Nguyệt Kỵ", "Nguyệt Phá", "Thiên Khắc Địa Xung", "Thiên Cương"].includes(star))) calculatedScore = Math.min(40, calculatedScore);
    energyScore = Math.max(0, Math.min(100, Math.round(calculatedScore)));
    energy = energyCopy(energyScore);
    status = energy.label;
  }
  const dayYi = dayYiRaw.slice(0, 10).map(termToVietnamese);
  const dayJi = dayJiRaw.slice(0, 10).map(termToVietnamese);
  let activities: Array<{
    name: string;
    status: "suitable" | "avoid" | "neutral";
    score: number;
    guidance: string;
    goodStars?: string;
    badStars?: string;
    goodHours?: string[];
  }> = [];

  const dayBranchIndex = BRANCHES.findIndex((branch) => branch.name === pillar.branch);
  const sixRenStart = mod(Math.abs(lunar.getMonth()) - 1 + lunar.getDay() - 1, 6);
  const nobleBranches = NOBLE_HOUR_BRANCHES[pillar.stem] ?? [];
  let hours = times.map((lunarTime, index) => {
    const hourPillar = pillarFromHan(lunarTime.getGanZhi());
    const auspicious = lunarTime.getTianShenLuck() === "吉";
    const sixRen = SIX_REN_SEQUENCE[mod(sixRenStart + index, 6)];
    const isVoid = sixRen.name === "Không Vong";
    const isDayClash = hourPillar.branch === relation.clash;
    const isNoble = nobleBranches.includes(hourPillar.branch);
    // Công thức vi mô của trang đối chiếu: chấm điểm thô theo Nhật Phá,
    // Trực giờ, Quý Nhân, Hoàng/Hắc đạo và Lục Diệu; sau đó giãn quanh mốc 50.
    const hourOfficerIndex = mod(index - dayBranchIndex, 12);
    let rawScore = 50;
    if (isDayClash) rawScore -= 5;
    if ([2, 4, 8, 10].includes(hourOfficerIndex)) rawScore += 5;
    else if ([6, 11].includes(hourOfficerIndex)) rawScore -= 1.5;
    if (isNoble) rawScore += 2;
    rawScore += auspicious ? 10 : -10;
    if ([0, 2, 4].includes(mod(sixRenStart + index, 6))) rawScore += 5;
    else if ([3, 5].includes(mod(sixRenStart + index, 6))) rawScore -= 5;
    const score = Math.round(Math.max(0, Math.min(100, 1.5 * (rawScore - 50) + 50)) * 10) / 10;
    return {
      stem: hourPillar.stem,
      branch: hourPillar.branch,
      range: index === 0 ? "23:00–01:00" : `${String(index * 2 - 1).padStart(2, "0")}:00–${String(index * 2 + 1).padStart(2, "0")}:00`,
      auspicious,
      officer: HEAVENLY_OFFICER_VI[lunarTime.getTianShen()] ?? lunarTime.getTianShen(),
      yi: lunarTime.getYi().slice(0, 2).map(termToVietnamese),
      ji: lunarTime.getJi().slice(0, 2).map(termToVietnamese),
      score,
      sixRen,
      isVoid,
      isDayClash,
      isNoble,
    };
  });

  const exactReferenceActivities = getReferenceActionAdvice(date);
  const exactReferenceEnergy = getReferenceDayEnergy(date);
  const exactReferenceStars = getReferenceDayStarDetails(date);
  let usesReferenceActivities = false;
  if (referenceDay) {
    energyScore = referenceDay.energyScore;
    energy = { label: referenceDay.energyLabel, quote: referenceDay.energyQuote };
    status = referenceDay.energyLabel;
    goodStars = referenceDay.goodStars.map((star) => star.name);
    badStars = referenceDay.badStars.map((star) => star.name);
    if (referenceDay.dayOfficer) {
      indicators = indicators.map((indicator) => indicator.label === "Thập nhị Trực"
        ? { ...indicator, value: `Trực ${referenceDay.dayOfficer}` }
        : indicator);
    }
    if (referenceDay.lunarMansion) {
      indicators = indicators.map((indicator) => indicator.label === "Nhị thập bát tú"
        ? { ...indicator, value: `Sao ${referenceDay.lunarMansion}` }
        : indicator);
    }
    hours = hours.map((hour, index) => ({
      ...hour,
      score: referenceDay.hourScores?.[index] ?? hour.score,
      officer: referenceDay.hourOfficerNames?.[index] ?? hour.officer,
      auspicious: referenceDay.hourAuspicious?.[index] ?? hour.auspicious,
      sixRen: referenceDay.hourSixRenNames?.[index]
        ? SIX_REN_SEQUENCE.find((item) => item.name === referenceDay.hourSixRenNames?.[index]) ?? hour.sixRen
        : hour.sixRen,
      isVoid: referenceDay.hourVoidFlags?.[index] ?? hour.isVoid,
      isDayClash: referenceDay.hourDayClashFlags?.[index] ?? hour.isDayClash,
      isNoble: referenceDay.hourNobleFlags?.[index] ?? hour.isNoble,
    }));
  }

  if (exactReferenceEnergy) {
    energyScore = exactReferenceEnergy.score;
    const exactEnergyCopy = energyCopy(energyScore);
    energy = { label: exactEnergyCopy.label, quote: exactReferenceEnergy.advice };
    status = exactEnergyCopy.label;
  }

  if (exactReferenceStars) {
    goodStars = exactReferenceStars.goodStars.map((star) => star.name);
    badStars = exactReferenceStars.badStars.map((star) => star.name);
  }

  if (exactReferenceActivities) {
    // The reference screen first shows up to eight recommended items, then
    // the six avoided items in reverse priority order. The generated fixture
    // preserves that exact selection, score, reason and display order.
    activities = exactReferenceActivities;
    usesReferenceActivities = true;
  } else if (referenceDay?.activities) {
    activities = referenceDay.activities;
    usesReferenceActivities = true;
  }

  if (!usesReferenceActivities) {
    const officerName = referenceDay?.dayOfficer ?? OFFICER_VI[officerRaw] ?? officerRaw;
    const officerRule = OFFICER_ACTIVITY_RULES[officerName];
    const allGoodFactors = [...new Set(goodStars)];
    const allBadFactors = [...new Set(badStars)];
    const factorImpact = (rule: AlmanacFactorRule | undefined, activity: typeof ACTIVITY_RULES[number]) => {
      if (!rule) return 0;
      return rule.actions?.[activity.id] ?? rule.actions?.[activity.category] ?? rule.actions?.ALL ?? rule.base;
    };
    const bestHourNames = hours
      .filter((hour) => hour.auspicious && hour.score >= 57.5 && !hour.isDayClash)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((hour) => hour.branch);

    activities = ACTIVITY_RULES.flatMap((activity) => {
      let score = 50;
      const goodReasons: Array<{ name: string; impact: number; specific?: boolean }> = [];
      const badReasons: Array<{ name: string; impact: number; critical: boolean; specific?: boolean }> = [];

      for (const star of allGoodFactors) {
        const rule = STAR_ACTIVITY_RULES[star];
        const impact = factorImpact(rule, activity);
        if (impact > 0) {
          score += impact;
          if (rule?.do?.includes(activity.id) || impact >= 15) goodReasons.push({ name: star, impact, specific: rule?.do?.includes(activity.id) });
        }
      }
      for (const star of allBadFactors) {
        const rule = STAR_ACTIVITY_RULES[star];
        let impact = factorImpact(rule, activity);
        const remedy = rule?.remedies
          ?.filter((item) => allGoodFactors.includes(item.star))
          .sort((a, b) => b.factor - a.factor)[0];
        if (remedy && impact < 0) impact *= 1 - remedy.factor;
        const specificallyAvoided = Boolean(rule?.avoid?.includes(activity.id));
        score += impact;
        if (impact < 0 || specificallyAvoided) badReasons.push({ name: specificallyAvoided ? `${star} (Kỵ${remedy?.factor === 1 ? " - đã giải" : ""})` : star, impact, critical: impact <= -30, specific: specificallyAvoided });
      }

      const officerImpact = factorImpact(officerRule, activity);
      const officerIsGood = Boolean(officerRule?.do?.includes(activity.id));
      const officerIsBad = Boolean(officerRule?.avoid?.includes(activity.id));
      score += officerImpact;
      if (officerIsGood || officerImpact >= 15) goodReasons.push({ name: `Trực ${officerName}`, impact: officerImpact, specific: officerIsGood });
      if (officerIsBad || officerImpact <= -15) badReasons.push({ name: officerIsBad ? `Trực ${officerName} (Kỵ)` : `Trực ${officerName}`, impact: officerImpact, critical: officerImpact <= -30, specific: officerIsBad });

      const mansionName = referenceDay?.lunarMansion ?? MANSION_VI[lunar.getXiu()] ?? lunar.getXiu();
      const mansionImpact = lunar.getXiuLuck() === "吉" ? 15 : -15;
      score += mansionImpact;
      if (mansionImpact > 0) goodReasons.push({ name: `Sao ${mansionName}`, impact: mansionImpact });
      else badReasons.push({ name: `Sao ${mansionName}`, impact: mansionImpact, critical: false });

      if (badReasons.some((reason) => reason.critical)) score -= 50;
      score = Math.max(0, Math.min(100, Math.round(score)));

      const hasSpecificAdvice = officerIsGood || officerIsBad
        || goodReasons.some((reason) => reason.specific)
        || badReasons.some((reason) => reason.specific || reason.critical);
      if (!hasSpecificAdvice) return [];

      const isGood = !badReasons.some((reason) => reason.critical || reason.specific) && score >= 50;
      const status = isGood ? "suitable" as const : score < 40 || badReasons.some((reason) => reason.specific) ? "avoid" as const : "neutral" as const;
      const sortedGood = goodReasons.sort((a, b) => b.impact - a.impact).slice(0, 3).map((reason) => reason.name);
      const sortedBad = badReasons.sort((a, b) => a.impact - b.impact).slice(0, 3).map((reason) => reason.name);
      return [{
        name: activity.name,
        status,
        score,
        guidance: isGood ? "Cát khí theo loại việc đang chiếm ưu thế" : "Có yếu tố kỵ riêng cho loại việc này",
        goodStars: sortedGood.join(", ") || allGoodFactors.slice(0, 3).join(", ") || "Không ghi nhận cát thần riêng",
        badStars: sortedBad.join(", ") || allBadFactors.slice(0, 3).join(", ") || "Không ghi nhận hung thần riêng",
        goodHours: isGood ? bestHourNames : undefined,
      }];
    }).sort((a, b) => ({ suitable: 0, neutral: 1, avoid: 2 }[a.status] - { suitable: 0, neutral: 1, avoid: 2 }[b.status] || b.score - a.score));
  }

  const goodStarSummary = goodStars.join(", ") || "Không ghi nhận cát thần riêng";
  const badStarSummary = badStars.join(", ") || "Không ghi nhận hung thần riêng";
  activities = activities.map((activity) => ({
    ...activity,
    goodStars: activity.goodStars ?? goodStarSummary,
    badStars: activity.badStars ?? badStarSummary,
  }));

  const goodStarDetails = exactReferenceStars?.goodStars ?? referenceDay?.goodStars ?? goodStars.map((name) => ({ name, description: "Cát tinh trợ lực cho những việc phù hợp với tính chất của ngày." }));
  const badStarDetails = exactReferenceStars?.badStars ?? referenceDay?.badStars ?? badStars.map((name) => ({ name, description: "Hung sát cần được cân nhắc cùng loại việc, tuổi và giờ thực hiện." }));

  return {
    date,
    yearPillar,
    monthPillar,
    pillar,
    status,
    favorableCount,
    energyScore,
    energyLabel: energy.label,
    energyQuote: energy.quote,
    indicators,
    goodHours: hours.filter((hour) => hour.auspicious),
    hours,
    goodStars,
    badStars,
    goodStarDetails,
    badStarDetails,
    dayYi,
    dayJi,
    activities,
    actionHeading: activities.every((activity) => activity.status === "avoid") ? "Việc Cần Tránh" : "Lời Khuyên Hành Động",
    dayOfficer: displayedDayOfficer,
    officerDescription: referenceDay?.officerDescription ?? REFERENCE_OFFICER_DESCRIPTIONS[displayedDayOfficer],
    lunarMansion: referenceDay?.lunarMansion ?? MANSION_VI[lunar.getXiu()] ?? lunar.getXiu(),
    mansionDescription: referenceDay?.mansionDescription ?? REFERENCE_MANSION_DESCRIPTIONS[referenceDay?.lunarMansion ?? MANSION_VI[lunar.getXiu()] ?? lunar.getXiu()],
    lunarMansionLuck: lunar.getXiuLuck() === "吉" ? "Cát" : "Hung",
    dayOfficerName: HEAVENLY_OFFICER_VI[lunar.getDayTianShen()] ?? lunar.getDayTianShen(),
    dayOfficerType: lunar.getDayTianShenType() === "黄道" ? "Hoàng đạo" : "Hắc đạo",
    compatibleAges: relation.harmony,
    conflictingAges: [relation.clash, relation.harm],
    clashDescription: clashToVietnamese(lunar.getDayChongDesc()),
    shaDirection: directionToVietnamese(lunar.getDaySha()),
    joyDirection: directionToVietnamese(lunar.getDayPositionXiDesc()),
    wealthDirection: directionToVietnamese(lunar.getDayPositionCaiDesc()),
    lunarDate: { year: lunar.getYear(), month: Math.abs(lunar.getMonth()), day: lunar.getDay(), leap: lunar.getMonth() < 0 },
    ageRelationsOverride: referenceDay?.ageRelations,
    matchesReferenceDemo: Boolean(referenceDay),
  };
}

const STEM_PAIRINGS: Record<string, string> = {
  Giáp: "Kỷ", Kỷ: "Giáp", Ất: "Canh", Canh: "Ất", Bính: "Tân",
  Tân: "Bính", Đinh: "Nhâm", Nhâm: "Đinh", Mậu: "Quý", Quý: "Mậu",
};

export function getDayAgeRelations(dayProfile: ReturnType<typeof getDateProfile>) {
  const decorateRelations = (relations: { conflicting: readonly string[]; favorable: readonly string[] }) => ({
    conflicting: [...relations.conflicting],
    favorable: [...relations.favorable],
    conflictingEmphasis: relations.conflicting.filter((age) => getAgeConflictScore(dayProfile.pillar, age) <= -5),
    favorableEmphasis: relations.favorable.slice(0, 1),
  });

  if (dayProfile.ageRelationsOverride) return decorateRelations(dayProfile.ageRelationsOverride);
  const referenceRelations = getReferenceDayAgeRelations(dayProfile.pillar.stem, dayProfile.pillar.branch);
  if (referenceRelations) return decorateRelations(referenceRelations);
  const dayStem = STEMS.find((stem) => stem.name === dayProfile.pillar.stem)!;
  const relation = BRANCH_RELATIONS[dayProfile.pillar.branch];
  const favorable: string[] = [];
  const conflicting: string[] = [];

  for (let index = 0; index < 60; index += 1) {
    const stem = STEMS[index % 10];
    const branch = BRANCHES[index % 12];
    const label = `${stem.name} ${branch.name}`;
    const branchFavorable = relation.harmony.includes(branch.name);
    const stemFavorable = STEM_PAIRINGS[dayStem.name] === stem.name || ELEMENT_GENERATES[dayStem.element] === stem.element;
    const branchConflict = branch.name === relation.clash || branch.name === relation.harm;
    const stemConflict = ELEMENT_CONTROLS[dayStem.element] === stem.element;
    const isFavorable = !branchConflict && (branchFavorable || stemFavorable);
    const isConflicting = branchConflict || (stemConflict && !isFavorable);
    if (isConflicting) conflicting.push(label);
    if (isFavorable) favorable.push(label);
  }

  return decorateRelations({ favorable, conflicting });
}

function getAgeConflictScore(dayPillar: Pillar, ageLabel: string) {
  const [ageStemName, ageBranchName] = ageLabel.split(" ");
  const dayStem = STEMS.find((stem) => stem.name === dayPillar.stem);
  const ageStem = STEMS.find((stem) => stem.name === ageStemName);
  const ageBranch = BRANCHES.find((branch) => branch.name === ageBranchName);
  const relation = BRANCH_RELATIONS[dayPillar.branch];
  if (!dayStem || !ageStem || !ageBranch || !relation) return 0;

  let score = 0;
  const ageStemControlsDay = ELEMENT_CONTROLS[ageStem.element] === dayStem.element;
  if (ageStemControlsDay) score -= 3;
  else if (ELEMENT_CONTROLS[dayStem.element] === ageStem.element) score -= 1.5;

  const branchClashes = relation.clash === ageBranch.name;
  if (branchClashes) score -= 4;

  const dayNaYinElement = getNaYin(dayPillar).split(" ").at(-1) as ElementName;
  const agePillar: Pillar = {
    stem: ageStem.name,
    branch: ageBranch.name,
    stemElement: ageStem.element,
    branchElement: ageBranch.element,
    polarity: ageStem.polarity,
  };
  const ageNaYinElement = getNaYin(agePillar).split(" ").at(-1) as ElementName;
  if (ELEMENT_CONTROLS[ageNaYinElement] === dayNaYinElement) score -= 2;
  else if (ELEMENT_CONTROLS[dayNaYinElement] === ageNaYinElement) score -= 1;

  if (ageStemControlsDay && branchClashes) score -= 5;
  return score;
}

export function getPersonalDayCompatibility(date: string, birthDate: string, dayProfile = getDateProfile(date), birthTime = "12:00") {
  const birthPillars = getFourPillars(birthDate, birthTime, 105.833, 7, "civil").pillars;
  const birthYearPillar = birthPillars[0];
  const birthHourPillar = birthPillars[3];
  const relation = BRANCH_RELATIONS[dayProfile.pillar.branch];
  const reasons: Array<{ tone: "good" | "neutral" | "caution"; label: string; detail: string }> = [];
  let score = 52 + (dayProfile.favorableCount - 1.5) * 8;

  if (dayProfile.pillar.branch === birthYearPillar.branch) {
    score += 10;
    reasons.push({ tone: "good", label: "Đồng chi", detail: `Chi ngày và chi tuổi cùng là ${birthYearPillar.branch}, khí dễ đồng nhịp nhưng cũng có thể làm tính chất của ngày mạnh hơn.` });
  } else if (relation.harmony.includes(birthYearPillar.branch)) {
    score += 24;
    reasons.push({ tone: "good", label: "Lục hợp · Tam hợp", detail: `Ngày ${dayProfile.pillar.branch} nằm trong nhóm hợp với tuổi ${birthYearPillar.branch}.` });
  } else if (relation.clash === birthYearPillar.branch) {
    score -= 38;
    reasons.push({ tone: "caution", label: "Lục xung", detail: `Ngày ${dayProfile.pillar.branch} trực xung tuổi ${birthYearPillar.branch}; nên tránh quyết định khó đảo ngược nếu không có giờ và việc phù hợp để hóa giải.` });
  } else if (relation.harm === birthYearPillar.branch) {
    score -= 22;
    reasons.push({ tone: "caution", label: "Lục hại", detail: `Ngày ${dayProfile.pillar.branch} hại tuổi ${birthYearPillar.branch}; dễ phát sinh vướng mắc kín hoặc lệch kỳ vọng.` });
  } else {
    reasons.push({ tone: "neutral", label: "Chi tuổi trung tính", detail: `Ngày ${dayProfile.pillar.branch} không tạo quan hệ hợp, xung hay hại trực tiếp với tuổi ${birthYearPillar.branch}.` });
  }

  const dayElement = dayProfile.pillar.stemElement;
  const birthElement = birthYearPillar.stemElement;
  if (dayElement === birthElement) {
    score += 5;
    reasons.push({ tone: "good", label: "Can đồng hành", detail: `${dayElement} của can ngày đồng hành với ${birthElement} của can tuổi.` });
  } else if (ELEMENT_GENERATES[dayElement] === birthElement) {
    score += 10;
    reasons.push({ tone: "good", label: "Ngày sinh tuổi", detail: `${dayElement} của can ngày sinh ${birthElement} của can tuổi, thuận cho việc cần được nâng đỡ.` });
  } else if (ELEMENT_GENERATES[birthElement] === dayElement) {
    score -= 4;
    reasons.push({ tone: "neutral", label: "Tuổi sinh ngày", detail: `${birthElement} của can tuổi sinh ${dayElement} của can ngày; làm việc lớn có thể hao sức hơn thường lệ.` });
  } else if (ELEMENT_CONTROLS[dayElement] === birthElement) {
    score -= 12;
    reasons.push({ tone: "caution", label: "Ngày khắc tuổi", detail: `${dayElement} của can ngày khắc ${birthElement} của can tuổi.` });
  } else if (ELEMENT_CONTROLS[birthElement] === dayElement) {
    score -= 7;
    reasons.push({ tone: "neutral", label: "Tuổi khắc ngày", detail: `${birthElement} của can tuổi khắc ${dayElement} của can ngày; có thể làm được nhưng cần chủ động nhiều hơn.` });
  }

  const roundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const verdict = roundedScore >= 78
    ? "Rất hợp tuổi"
    : roundedScore >= 64
      ? "Khá hợp tuổi"
      : roundedScore >= 48
        ? "Trung tính"
        : roundedScore >= 30
          ? "Cần cân nhắc"
          : "Xung tuổi";
  const { year: selectedYear } = parseDate(date);
  const { year: birthYear } = parseDate(birthDate);

  return {
    score: roundedScore,
    verdict,
    birthYearPillar,
    birthHourPillar,
    birthTime,
    lunarAge: Math.max(1, selectedYear - birthYear + 1),
    reasons,
  };
}

export type VietnameseObservance = {
  name: string;
  description: string;
  type: "dương lịch" | "âm lịch" | "lễ hội";
};

type ObservanceCopy = { name: string; description: string; important?: boolean };

const SOLAR_OBSERVANCES: Record<string, ObservanceCopy> = {
  "01-01": { name: "Tết Dương Lịch", description: "Ngày đầu năm mới theo lịch Gregory.", important: true },
  "01-09": { name: "Ngày HSSV Việt Nam", description: "Ngày truyền thống Học sinh Sinh viên Việt Nam." },
  "02-03": { name: "Thành lập Đảng CSVN", description: "Kỷ niệm ngày thành lập Đảng Cộng sản Việt Nam (1930).", important: true },
  "02-27": { name: "Ngày Thầy thuốc VN", description: "Tôn vinh đội ngũ Y bác sĩ và cán bộ y tế." },
  "03-03": { name: "Ngày Biên phòng", description: "Ngày truyền thống Bộ đội Biên phòng (1959)." },
  "03-08": { name: "Quốc tế Phụ nữ", description: "Ngày tôn vinh phụ nữ toàn thế giới.", important: true },
  "03-26": { name: "Thành lập Đoàn", description: "Ngày thành lập Đoàn TNCS Hồ Chí Minh (1931)." },
  "04-09": { name: "Chiến thắng Bạch Đằng", description: "Ngô Quyền đánh tan quân Nam Hán (938), mở ra kỷ nguyên độc lập. (Ngày dương lịch ước tính/kỷ niệm)" },
  "04-12": { name: "Con người đầu tiên bay vào vũ trụ", description: "Yuri Gagarin thực hiện chuyến bay lịch sử trên tàu Vostok 1 (1961)." },
  "04-30": { name: "Giải Phóng Miền Nam", description: "Chiến thắng 30/4/1975, thống nhất đất nước.", important: true },
  "05-01": { name: "Quốc Tế Lao Động", description: "Ngày hội của giai cấp công nhân và nhân dân lao động.", important: true },
  "05-07": { name: "Chiến thắng Điện Biên", description: "Chiến thắng Điện Biên Phủ \"lừng lẫy năm châu, chấn động địa cầu\" (1954).", important: true },
  "05-19": { name: "Sinh nhật Bác Hồ", description: "Kỷ niệm ngày sinh Chủ tịch Hồ Chí Minh (1890).", important: true },
  "06-01": { name: "Quốc Tế Thiếu Nhi", description: "Ngày Tết dành cho trẻ em.", important: true },
  "06-15": { name: "Ký kết Đại Hiến chương (Magna Carta)", description: "Văn bản đầu tiên hạn chế quyền lực quân chủ, nền tảng của luật pháp hiện đại (1215)." },
  "06-21": { name: "Báo chí Cách mạng", description: "Ngày Báo chí Cách mạng Việt Nam (1925)." },
  "06-28": { name: "Ngày Gia Đình VN", description: "Ngày tôn vinh mái ấm gia đình Việt Nam." },
  "07-04": { name: "Quốc khánh Mỹ", description: "Hợp chủng quốc Hoa Kỳ tuyên bố độc lập khỏi đế quốc Anh (1776)." },
  "07-14": { name: "Cách mạng Pháp", description: "Ngày phá ngục Bastille, biểu tượng của Tự do - Bình đẳng - Bác ái." },
  "07-20": { name: "Apollo 11 hạ cánh xuống Mặt Trăng", description: "Neil Armstrong đặt bước chân đầu tiên của nhân loại lên một thiên thể khác (1969)." },
  "07-27": { name: "Thương Binh Liệt Sĩ", description: "Tưởng nhớ và tri ân các anh hùng liệt sĩ, thương binh.", important: true },
  "08-06": { name: "Thảm họa Hiroshima", description: "Ngày quả bom nguyên tử đầu tiên dội xuống dân thường, lời nhắc nhở về hòa bình thế giới." },
  "08-15": { name: "Nhật Bản đầu hàng (WW2)", description: "Kết thúc hoàn toàn Chiến tranh Thế giới thứ hai trên toàn thế giới (1945)." },
  "08-19": { name: "Công An Nhân Dân", description: "Ngày truyền thống Công an Nhân dân Việt Nam (1945)." },
  "09-02": { name: "Quốc Khánh", description: "Bác Hồ đọc Tuyên ngôn Độc lập, khai sinh nước VNDCCH (1945).", important: true },
  "09-10": { name: "MTTQ Việt Nam", description: "Ngày thành lập Mặt trận Tổ quốc Việt Nam (1955)." },
  "10-10": { name: "Lý Thái Tổ dời đô", description: "Vua Lý Thái Tổ dời đô về Thăng Long (1010), mở đầu thời kỳ huy hoàng của Đại Việt." },
  "10-12": { name: "Columbus tìm ra châu Mỹ", description: "Chuyến hải hành thay đổi hoàn toàn bản đồ thế giới và lịch sử nhân loại (1492)." },
  "10-13": { name: "Doanh Nhân VN", description: "Ngày Doanh nhân Việt Nam." },
  "10-20": { name: "Phụ Nữ Việt Nam", description: "Ngày thành lập Hội Liên hiệp Phụ nữ Việt Nam (1930).", important: true },
  "11-07": { name: "Cách mạng Tháng Mười Nga", description: "Cuộc cách mạng vô sản đầu tiên thắng lợi, khai sinh Liên bang Xô Viết (1917)." },
  "11-09": { name: "Bức tường Berlin sụp đổ", description: "Sự kiện chấm dứt sự chia cắt Đông - Tây Đức và biểu tượng kết thúc Chiến tranh Lạnh." },
  "11-11": { name: "Kết thúc Thế chiến I", description: "Lễ đình chiến kết thúc cuộc chiến tranh tàn khốc đầu tiên quy mô toàn cầu (1918)." },
  "11-18": { name: "Đại Đoàn Kết", description: "Ngày hội Đại đoàn kết toàn dân tộc." },
  "11-20": { name: "Nhà Giáo Việt Nam", description: "Ngày Hiến chương Nhà giáo Việt Nam, tôn sư trọng đạo.", important: true },
  "11-23": { name: "Hội Chữ Thập Đỏ", description: "Ngày thành lập Hội Chữ thập đỏ Việt Nam (1946)." },
  "12-19": { name: "Toàn Quốc Kháng Chiến", description: "Kỷ niệm ngày Toàn quốc kháng chiến (1946)." },
  "12-22": { name: "Quân Đội Nhân Dân", description: "Ngày thành lập QĐND Việt Nam (1944) & Ngày hội Quốc phòng toàn dân.", important: true },
  "12-24": { name: "Giáng Sinh", description: "Lễ Giáng sinh (Noel).", important: true },
};

const LUNAR_OBSERVANCES: Record<string, ObservanceCopy> = {
  "01-01": { name: "Tết Nguyên Đán", description: "Ngày đầu tiên của năm mới âm lịch, lễ hội lớn nhất trong năm của người Việt.", important: true },
  "01-02": { name: "Mùng 2 Tết", description: "Ngày thứ hai của Tết Nguyên Đán.", important: true },
  "01-03": { name: "Mùng 3 Tết", description: "Ngày thứ ba của Tết Nguyên Đán, hóa vàng.", important: true },
  "01-05": { name: "Chiến thắng Ngọc Hồi - Đống Đa", description: "Kỷ niệm chiến thắng lừng lẫy của vua Quang Trung - Nguyễn Huệ đại phá quân Thanh (1789).", important: true },
  "01-06": { name: "Khai hội Chùa Hương", description: "Lễ hội kéo dài nhất trong năm tại Mỹ Đức, Hà Nội." },
  "01-10": { name: "Khai hội Yên Tử", description: "Lễ hội hành hương về đất Phật, nơi Phật hoàng Trần Nhân Tông tu hành." },
  "01-13": { name: "Hội Lim", description: "Lễ hội dân ca Quan họ lớn nhất vùng Kinh Bắc - Bắc Ninh." },
  "01-14": { name: "Khai ấn Đền Trần", description: "Lễ khai ấn cầu mong quốc thái dân an, thăng tiến tại Nam Định." },
  "01-15": { name: "Tết Nguyên Tiêu", description: "Rằm tháng Giêng, ngày lễ quan trọng cầu an lành cho cả năm.", important: true },
  "02-06": { name: "Khởi nghĩa Hai Bà Trưng", description: "Kỷ niệm cuộc khởi nghĩa của Hai Bà Trưng chống quân Đông Hán (40 SCN)." },
  "03-03": { name: "Tết Hàn Thực", description: "Tết bánh trôi bánh chay, tưởng nhớ người đã khuất." },
  "03-10": { name: "Giỗ Tổ Hùng Vương", description: "Quốc giỗ, tưởng nhớ công ơn các Vua Hùng dựng nước.", important: true },
  "04-15": { name: "Lễ Phật Đản", description: "Kỷ niệm ngày sinh, thành đạo và nhập diệt của Đức Phật Thích Ca.", important: true },
  "05-05": { name: "Tết Đoan Ngọ", description: "Tết diệt sâu bọ, ăn sứa, nếp cẩm, trái cây." },
  "07-01": { name: "Lễ hội Katê", description: "Lễ hội lớn nhất của đồng bào Chăm." },
  "07-15": { name: "Lễ Vu Lan", description: "Ngày xá tội vong nhân và báo hiếu cha mẹ.", important: true },
  "08-15": { name: "Tết Trung Thu", description: "Tết trẻ em, rước đèn, phá cỗ trông trăng.", important: true },
  "08-16": { name: "Lễ hội Côn Sơn - Kiếp Bạc", description: "Tưởng nhớ Anh hùng dân tộc Hưng Đạo Đại Vương Trần Quốc Tuấn." },
  "09-09": { name: "Tết Trùng Cửu", description: "Tết người cao tuổi, uống rượu hoa cúc, leo núi." },
  "12-23": { name: "Ông Công Ông Táo", description: "Cúng đưa ông Táo về trời báo cáo ngọc hoàng.", important: true },
};

export function getVietnameseObservances(date: string): VietnameseObservance[] {
  const { year, month, day } = parseDate(date);
  const lunar = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar();
  const solarKey = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const lunarKey = `${String(Math.abs(lunar.getMonth())).padStart(2, "0")}-${String(lunar.getDay()).padStart(2, "0")}`;
  const solarObservance = SOLAR_OBSERVANCES[solarKey];
  const lunarObservance = lunar.getMonth() > 0 ? LUNAR_OBSERVANCES[lunarKey] : undefined;
  if (solarObservance?.important) return [{ ...solarObservance, type: "dương lịch" }];
  if (lunarObservance?.important) return [{ ...lunarObservance, type: "âm lịch" }];
  if (solarObservance) return [{ ...solarObservance, type: "dương lịch" }];
  if (lunarObservance) return [{ ...lunarObservance, type: "âm lịch" }];
  if (lunar.getMonth() > 0 && lunar.getDay() === 1) {
    return [{ name: "Mùng 1", description: "Ngày Sóc (đầu tháng âm lịch), thích hợp cầu an, lễ chùa.", type: "âm lịch" }];
  }
  if (lunar.getMonth() > 0 && lunar.getDay() === 15) {
    return [{ name: "Rằm", description: "Ngày Vọng (giữa tháng âm lịch), trăng tròn, khí trường vượng.", type: "âm lịch" }];
  }
  return [];
}

export function getSolarTerm(date: string) {
  const { year, month, day } = parseDate(date);
  const lunar = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar();
  const name = lunar.getPrevJieQi(true).getName();
  return SOLAR_TERM_VI[name] ?? name;
}

export const TRIGRAMS = [
  { key: "111", name: "Càn", symbol: "☰", nature: "Trời" },
  { key: "110", name: "Đoài", symbol: "☱", nature: "Đầm" },
  { key: "101", name: "Ly", symbol: "☲", nature: "Lửa" },
  { key: "100", name: "Chấn", symbol: "☳", nature: "Sấm" },
  { key: "011", name: "Tốn", symbol: "☴", nature: "Gió" },
  { key: "010", name: "Khảm", symbol: "☵", nature: "Nước" },
  { key: "001", name: "Cấn", symbol: "☶", nature: "Núi" },
  { key: "000", name: "Khôn", symbol: "☷", nature: "Đất" },
];

const HEX_MATRIX = [
  [1, 10, 13, 25, 44, 6, 33, 12], [43, 58, 49, 17, 28, 47, 31, 45],
  [14, 38, 30, 21, 50, 64, 56, 35], [34, 54, 55, 51, 32, 40, 62, 16],
  [9, 61, 37, 42, 57, 59, 53, 20], [5, 60, 63, 3, 48, 29, 39, 8],
  [26, 41, 22, 27, 18, 4, 52, 23], [11, 19, 36, 24, 46, 7, 15, 2],
];

const HEX_NAMES = [
  "Thuần Càn", "Thuần Khôn", "Thủy Lôi Truân", "Sơn Thủy Mông", "Thủy Thiên Nhu", "Thiên Thủy Tụng", "Địa Thủy Sư", "Thủy Địa Tỷ",
  "Phong Thiên Tiểu Súc", "Thiên Trạch Lý", "Địa Thiên Thái", "Thiên Địa Bĩ", "Thiên Hỏa Đồng Nhân", "Hỏa Thiên Đại Hữu", "Địa Sơn Khiêm", "Lôi Địa Dự",
  "Trạch Lôi Tùy", "Sơn Phong Cổ", "Địa Trạch Lâm", "Phong Địa Quan", "Hỏa Lôi Phệ Hạp", "Sơn Hỏa Bí", "Sơn Địa Bác", "Địa Lôi Phục",
  "Thiên Lôi Vô Vọng", "Sơn Thiên Đại Súc", "Sơn Lôi Di", "Trạch Phong Đại Quá", "Thuần Khảm", "Thuần Ly", "Trạch Sơn Hàm", "Lôi Phong Hằng",
  "Thiên Sơn Độn", "Lôi Thiên Đại Tráng", "Hỏa Địa Tấn", "Địa Hỏa Minh Di", "Phong Hỏa Gia Nhân", "Hỏa Trạch Khuê", "Thủy Sơn Kiển", "Lôi Thủy Giải",
  "Sơn Trạch Tổn", "Phong Lôi Ích", "Trạch Thiên Quải", "Thiên Phong Cấu", "Trạch Địa Tụy", "Địa Phong Thăng", "Trạch Thủy Khốn", "Thủy Phong Tỉnh",
  "Trạch Hỏa Cách", "Hỏa Phong Đỉnh", "Thuần Chấn", "Thuần Cấn", "Phong Sơn Tiệm", "Lôi Trạch Quy Muội", "Lôi Hỏa Phong", "Hỏa Sơn Lữ",
  "Thuần Tốn", "Thuần Đoài", "Phong Thủy Hoán", "Thủy Trạch Tiết", "Phong Trạch Trung Phu", "Lôi Sơn Tiểu Quá", "Thủy Hỏa Ký Tế", "Hỏa Thủy Vị Tế",
];

const HEX_KEYWORDS = [
  "Khởi tạo", "Tiếp nhận", "Gian nan ban đầu", "Khai trí", "Chờ đúng lúc", "Tranh chấp", "Kỷ luật", "Liên kết",
  "Tích lũy nhỏ", "Thận trọng", "Hanh thông", "Bế tắc", "Đồng lòng", "Sung túc", "Khiêm nhường", "Hứng khởi",
  "Tùy thời", "Sửa cũ", "Tiến gần", "Quan sát", "Quyết đoán", "Trang sức", "Bóc tách", "Trở về",
  "Chân thành", "Nuôi sức lớn", "Dưỡng nuôi", "Gánh nặng", "Hiểm sâu", "Sáng rõ", "Cảm ứng", "Bền lâu",
  "Lùi đúng lúc", "Sức mạnh", "Thăng tiến", "Giữ sáng", "Nề nếp", "Khác biệt", "Trở ngại", "Tháo gỡ",
  "Giảm bớt", "Tăng ích", "Quyết mở", "Gặp gỡ", "Tụ hội", "Đi lên", "Khốn khó", "Nguồn sống",
  "Đổi mới", "Chuyển hóa", "Chấn động", "Tĩnh chỉ", "Tiến dần", "Duyên lệch", "Thịnh mãn", "Lữ hành",
  "Thuận nhập", "Hòa duyệt", "Phân tán", "Tiết chế", "Thành tín", "Việc nhỏ", "Đã xong", "Chưa xong",
];

const HEX_MESSAGES = [
  "Khí dương thuần mạnh, thuận cho việc khai sáng và dẫn đường. Điều cốt yếu là giữ chính, biết lúc tiến và không biến chủ động thành áp đặt.",
  "Khí âm thuần hậu, thuận cho tiếp nhận, nuôi dưỡng và hoàn thành điều đã khởi. Thành tựu đến từ bền bỉ, đúng vai và không tranh công.",
  "Mầm việc đã sinh nhưng trật tự chưa thành. Hãy dựng nền, chọn người đồng hành và xử lý từng nút thắt trước khi tăng tốc.",
  "Cái chưa biết cần được khai mở bằng học hỏi nghiêm túc. Hỏi một lần cho rõ, nghe điều căn bản rồi tự chịu trách nhiệm với bước đi của mình.",
  "Điều kiện đang hội tụ nhưng thời điểm chưa chín. Chuẩn bị nguồn lực, giữ niềm tin và tránh cưỡng ép một kết quả đến sớm.",
  "Bất đồng có nguy cơ thành đối đầu. Giữ chứng cứ và nguyên tắc, tìm điểm dừng hợp lý; thắng lý mà mất hòa khí vẫn là tổn thất.",
  "Việc lớn cần tổ chức, kỷ luật và chính danh. Chỉ nên huy động lực lượng khi mục tiêu rõ, quyền hạn minh bạch và người cầm đầu đủ đức.",
  "Sự gắn kết chỉ bền khi dựa trên giá trị chung. Hãy chủ động đến gần điều đáng tin, đồng thời nhận ra lúc một liên minh đã quá muộn.",
  "Lực cản nhỏ đang tích tụ. Chưa phải lúc bứt phá; hãy chỉnh tiểu tiết, giữ nhịp và để sức mềm làm công việc của nó.",
  "Đang ở gần điều mạnh hoặc nhạy cảm. Đi từng bước có lễ, phân biệt kính trọng với sợ hãi và đừng thử vận may bằng sự bất cẩn.",
  "Trên dưới đang thông, nguồn lực có thể lưu chuyển. Dùng thời hanh thông để củng cố nền chung, không chỉ mở rộng lợi ích riêng.",
  "Khí thế bế tắc, người và việc khó gặp nhau. Giữ phẩm chất, thu gọn cam kết và chờ cấu trúc cũ tự bộc lộ giới hạn.",
  "Đồng lòng ngoài phạm vi quen thuộc mở ra cơ hội lớn. Công khai mục tiêu và đặt lợi ích chung lên trước phe nhóm.",
  "Nguồn lực dồi dào đi cùng trách nhiệm lớn. Hãy dùng sự sáng rõ để phân phối, tránh phô trương và đừng để sở hữu chi phối phán đoán.",
  "Khiêm không phải tự hạ thấp mà là đặt mình đúng chỗ. Bớt phần dư, bồi phần thiếu và để năng lực được chứng minh bằng kết quả.",
  "Khí thế hứng khởi có thể huy động nhiều người. Cần chuẩn bị trước nhịp hành động để nhiệt tình không tan thành ồn ào.",
  "Thuận theo điều đúng sẽ tạo chuyển động. Hãy phân biệt thích ứng với chiều lòng; nguyên tắc phải giữ, phương pháp có thể đổi.",
  "Sai lệch cũ đã tích tụ và cần được sửa tận gốc. Truy nguyên nguyên nhân, chỉnh cơ chế rồi mới nói đến tăng trưởng.",
  "Một chu kỳ mở ra khả năng tiến gần và dẫn dắt. Hãy dùng sự hiện diện để giáo hóa, đồng thời chuẩn bị cho lúc đà tăng chậm lại.",
  "Lùi một bước để quan sát toàn cảnh. Điều người khác thấy ở bạn cũng là dữ kiện; sửa mình trước khi sửa hệ thống.",
  "Vướng mắc cần được phân định rõ, không thể chỉ xoa dịu. Áp dụng nguyên tắc vừa đủ, xử lý đúng người đúng việc và chừa đường sửa sai.",
  "Hình thức có giá trị khi làm sáng nội dung, không khi che lấp nó. Chỉnh diện mạo vừa mức rồi quay về chất lượng cốt lõi.",
  "Cấu trúc đang bị bào mòn từ dưới lên. Không nên chống đỡ bằng sức; bảo toàn phần tinh túy và chờ nền mới hình thành.",
  "Một điểm sáng đang trở lại sau suy giảm. Nuôi mầm mới trong yên tĩnh, tránh đòi kết quả lớn ở bước đầu.",
  "Hành động không vọng cầu thì ít lỗi. Trở về điều chân thực, kiểm tra động cơ và đừng dùng kế ngắn để ép vận dài.",
  "Sức mạnh nên được tích chứa và rèn luyện. Học từ người giỏi, củng cố kỷ luật; chỉ xuất lực khi việc đáng và thời đã đến.",
  "Chất lượng đầu vào quyết định sức bền. Xem lại điều bạn nuôi thân, nuôi trí và nuôi mối quan hệ; lời nói cũng là một dạng dưỡng chất.",
  "Tải trọng đã vượt mức bình thường. Cần quyết định có chủ đích, gia cố điểm chịu lực và tránh kéo dài một trạng thái không bền.",
  "Hiểm nối tiếp hiểm, không thể chỉ tránh né. Giữ lòng thành, học cách đi trong bất định và biến quy trình an toàn thành thói quen.",
  "Sự sáng rõ cần một điểm tựa để bền. Làm rõ điều phụ thuộc, chăm cho nguồn năng lượng và tránh đồng nhất mình với ánh hào quang.",
  "Cảm ứng chân thành có thể mở quan hệ. Tiến chậm, tôn trọng ranh giới và để sự tương hợp được kiểm chứng qua thời gian.",
  "Điều bền lâu cần nhịp ổn định hơn là cảm hứng. Chọn một nguyên tắc đủ tốt, thực hành liên tục và điều chỉnh mà không đổi hướng tùy tiện.",
  "Lùi không phải thất bại khi hoàn cảnh không còn thuận. Rút đúng lúc, giữ khoảng cách và dành sức cho một vị trí có thể hành động chính đáng.",
  "Sức đang lớn nhanh nhưng dễ quá tay. Dùng năng lực để bảo vệ điều đúng, không để cái mạnh vượt qua giới hạn của lễ và lý.",
  "Ánh sáng đang đi lên, thuận cho được nhìn nhận và tiến vị. Hãy đem kết quả thực đến đúng nơi, giữ lòng rộng khi được nâng đỡ.",
  "Ánh sáng bị che trong hoàn cảnh khó. Giữ sáng bên trong, mềm ở biểu hiện và không phơi toàn bộ ý định khi môi trường chưa an toàn.",
  "Trật tự trong nhà tạo nền cho việc ngoài. Làm rõ vai trò, giữ lời và sửa từ quan hệ gần nhất trước khi nói chuyện lớn.",
  "Khác biệt là dữ kiện, không nhất thiết là thù nghịch. Tìm phần nhỏ có thể hợp tác và đừng ép một sự đồng nhất giả tạo.",
  "Đường trước có trở ngại, tiến thẳng chỉ thêm hao tổn. Quay lại tìm trợ lực, đổi hướng tiếp cận và giải từng chỗ khó.",
  "Nút thắt bắt đầu lỏng. Hành động sớm nhưng gọn, tha thứ phần có thể tha và xử lý dứt phần còn gây nguy.",
  "Giảm đúng chỗ làm tăng chất lượng toàn thể. Cắt phần dư trước, giữ thành ý và đừng biến tiết giảm thành bần tiện.",
  "Lợi ích nên được chuyển tới nơi cần nhất. Thấy điều tốt thì làm ngay, thấy lỗi thì sửa; tăng trưởng bền bắt đầu từ sự luân chuyển.",
  "Đã đến lúc nói rõ và loại bỏ điều gây hại. Quyết nhưng không bạo, công bố căn cứ và ưu tiên phòng ngừa hơn đối đầu.",
  "Một cuộc gặp bất ngờ có sức ảnh hưởng lớn. Giữ ranh giới từ đầu, đừng xem nhẹ tín hiệu nhỏ chỉ vì sức hút ban đầu.",
  "Người và nguồn lực đang tụ lại. Cần một trung tâm đáng tin, nghi thức chung và cách phân bổ khiến mỗi người biết vị trí của mình.",
  "Tiến lên bằng tích lũy đều đặn. Chọn hướng có người nâng đỡ, làm việc tận tâm và để uy tín mở đường thay cho phô trương.",
  "Nguồn lực bên ngoài bị siết nhưng nội tâm vẫn có thể tự do. Giữ lời, bớt than trách và tìm khe hành động trong giới hạn hiện hữu.",
  "Nguồn dùng chung cần được nạo vét và bảo dưỡng. Cải tổ con người lẫn cơ chế; một chiếc giếng tốt vẫn vô ích nếu không ai kéo nước.",
  "Thời thay đổi đã tới khi cái cũ không còn hợp. Xác lập chính danh, chuẩn bị kỹ và củng cố trật tự mới sau bước chuyển.",
  "Sau đổi mới là giai đoạn định hình. Chọn vật liệu đúng, đặt người đúng chỗ và nuôi một văn hóa có thể chuyên chở giá trị lâu dài.",
  "Biến động đến để đánh thức. Phản ứng đầu tiên nên là giữ tâm, sau đó kiểm tra thiệt hại và biến cảnh báo thành kỷ luật mới.",
  "Dừng đúng lúc cũng là trí tuệ hành động. Yên ở thân, rõ ở tâm; đừng tiến chỉ vì sợ bị xem là chậm.",
  "Tiến từng bậc tạo độ bền cho vị thế và quan hệ. Tôn trọng trình tự, chuẩn bị nền và đừng bỏ qua bước xác nhận lẫn nhau.",
  "Mối kết hợp có thể lệch vai hoặc lệch thời. Đừng để cảm xúc đẩy vào cam kết thiếu chính danh; xem kỹ thứ tự và quyền lợi hai bên.",
  "Thịnh đạt là khoảnh khắc sáng nhưng khó kéo dài. Giải quyết việc lớn khi tầm nhìn rõ, đồng thời chuẩn bị cho giai đoạn thu hẹp.",
  "Đang ở vị thế lữ khách, ít chỗ dựa và cần tự giữ. Làm việc nhỏ cho đúng, tôn trọng quy tắc nơi đến và tránh gây tranh chấp dài.",
  "Sức mềm thấm dần qua lặp lại và nhất quán. Xác định mệnh lệnh rõ, đi sâu từng lớp; đổi ý liên tục sẽ làm mất hiệu lực.",
  "Niềm vui có sức kết nối khi dựa trên chân thành. Nói điều cần nói, tạo không gian trao đổi và tránh dùng dễ chịu để né sự thật.",
  "Sự phân tán cần một điểm quy tụ. Khơi thông cảm xúc, bỏ vách ngăn và đặt biểu tượng chung để mọi người nhớ điều đang cùng bảo vệ.",
  "Giới hạn tạo hình cho tự do. Đặt quy tắc vừa đủ, đo được và có lý do; tiết chế quá mức sẽ làm dòng sống cạn đi.",
  "Thành tín khiến khoảng cách được vượt qua. Kiểm tra sự nhất quán giữa lời và việc, rồi mới trao niềm tin hoặc yêu cầu cam kết.",
  "Chỉ nên xử lý việc nhỏ và chi tiết trong giai đoạn này. Khiêm ở vị thế, kỹ ở thực hiện; đừng dùng lực lớn cho mục tiêu chưa đủ tầm.",
  "Việc tưởng đã xong vẫn chứa mầm đảo chiều. Giữ trật tự, kiểm tra điểm cuối và phòng rủi ro ngay khi mọi thứ đang vận hành tốt.",
  "Chưa hoàn tất nghĩa là còn khả năng định hình. Xác định đúng bờ cần sang, phối hợp thận trọng và đừng hỏng việc ở bước cuối vì nóng vội.",
] as const;

const LINE_POSITIONS = [
  "nền tảng và động cơ ban đầu", "quan hệ nội tại và khả năng đáp ứng", "ngưỡng chuyển từ trong ra ngoài",
  "cách tham dự vào hoàn cảnh bên ngoài", "vị trí chủ đạo và trách nhiệm quyết định", "điểm cực thịnh, kết thúc hoặc chuyển pha",
] as const;

const MOVING_LINE_GUIDANCE = [
  "Khởi đầu đang đổi. Nên sửa động cơ, dữ kiện hoặc cách đặt vấn đề trước khi đẩy việc đi xa.",
  "Quan hệ bên trong đang đổi. Ưu tiên lắng nghe, phối hợp và củng cố nguồn lực gần mình.",
  "Đang ở ngưỡng chuyển tiếp, dễ quá tay. Chốt phần căn bản rồi mới bước sang phạm vi lớn hơn.",
  "Hoàn cảnh bên ngoài bắt đầu tác động rõ. Cần chọn đúng vai, đúng người và đúng thời điểm để tham dự.",
  "Vị trí quyết định đang đổi. Hãy chịu trách nhiệm cho lựa chọn chính và dùng quyền chủ động một cách chính đáng.",
  "Sự việc đã đến cực điểm hoặc cuối chu kỳ. Bớt cố giữ trạng thái cũ và chuẩn bị cho pha kế tiếp.",
] as const;

export interface TrigramInfo {
  key: string;
  name: string;
  symbol: string;
  nature: string;
}

export interface HexagramInfo {
  number: number;
  name: string;
  keyword: string;
  message: string;
  lower: TrigramInfo;
  upper: TrigramInfo;
}

export interface MovingLineDetail {
  position: number;
  value: number;
  polarity: string;
  change: string;
  focus: string;
  guidance: string;
}

export interface HexagramResult {
  primary: HexagramInfo;
  changed: HexagramInfo;
  moving: number[];
  movingDetails: MovingLineDetail[];
  readingRule: string;
}

export function getHexagram(lines: number[]): HexagramResult {
  const bits = lines.map((value) => (value === 7 || value === 9 ? "1" : "0"));
  const changedBits = lines.map((value) => value === 6 ? "1" : value === 9 ? "0" : value === 7 ? "1" : "0");
  const resolve = (lineBits: string[]) => {
    const lowerKey = lineBits.slice(0, 3).join("");
    const upperKey = lineBits.slice(3, 6).join("");
    const lowerIndex = TRIGRAMS.findIndex((item) => item.key === lowerKey);
    const upperIndex = TRIGRAMS.findIndex((item) => item.key === upperKey);
    const number = HEX_MATRIX[upperIndex][lowerIndex];
    return { number, name: HEX_NAMES[number - 1], keyword: HEX_KEYWORDS[number - 1], message: HEX_MESSAGES[number - 1], lower: TRIGRAMS[lowerIndex], upper: TRIGRAMS[upperIndex] };
  };
  const moving = lines.map((value, index) => value === 6 || value === 9 ? index + 1 : null).filter(Boolean) as number[];
  const readingRule = moving.length === 0
    ? "Quẻ tĩnh, không có hào động: lấy toàn tượng quẻ chủ để xét thế đang định hình; trọng ở sự bền chí hơn là tìm một biến cố sắp xảy ra."
    : moving.length === 1
      ? `Một hào động: lấy hào ${moving[0]} làm lời chỉ dẫn chính. Vị trí này soi vào ${LINE_POSITIONS[moving[0] - 1]}; quẻ biến cho biết chiều chuyển tiếp theo.`
      : moving.length <= 3
        ? `${moving.length} hào động: trước hết đọc quẻ chủ để hiểu hoàn cảnh, sau đó lần lượt xét các hào động từ dưới lên; quẻ biến biểu thị xu thế khi những chuyển động ấy cùng phát huy.`
        : `${moving.length} hào động: thế biến đã lấn át thế tĩnh. Lấy quẻ biến làm trọng tâm để xét hướng đi, còn quẻ chủ ghi nhận hoàn cảnh và nguyên nhân khởi phát.`;
  const movingDetails = moving.map((position) => {
    const value = lines[position - 1];
    const isYang = value === 9;
    return {
      position,
      value,
      polarity: isYang ? "Dương động" : "Âm động",
      change: isYang ? "Dương → Âm" : "Âm → Dương",
      focus: LINE_POSITIONS[position - 1],
      guidance: MOVING_LINE_GUIDANCE[position - 1],
    };
  });
  return { primary: resolve(bits), changed: resolve(changedBits), moving, movingDetails, readingRule };
}

/** Quẻ theo số thứ tự Văn Vương (1–64). */
export function getHexagramInfo(number: number): HexagramInfo | null {
  for (let upperIndex = 0; upperIndex < 8; upperIndex++) {
    const lowerIndex = HEX_MATRIX[upperIndex].indexOf(number);
    if (lowerIndex >= 0) {
      return { number, name: HEX_NAMES[number - 1], keyword: HEX_KEYWORDS[number - 1], message: HEX_MESSAGES[number - 1], lower: TRIGRAMS[lowerIndex], upper: TRIGRAMS[upperIndex] };
    }
  }
  return null;
}

/** Quẻ theo số Tiên Thiên của thượng/hạ quái (1 Càn … 8 Khôn), như cách ghi “4/6” trong tài liệu SGEN. */
export function getHexagramByTrigramOrder(upper: number, lower: number): HexagramInfo | null {
  const row = HEX_MATRIX[upper - 1];
  return row && row[lower - 1] ? getHexagramInfo(row[lower - 1]) : null;
}

const HA_LAC_STEM_NUMBERS = [6, 2, 8, 7, 1, 9, 3, 4, 6, 2] as const;
const HA_LAC_BRANCH_FIRST = [1, 5, 3, 3, 5, 2, 2, 5, 4, 4, 5, 1] as const;
const HA_LAC_BRANCH_SECOND = [0, 6, 7, 8, 9, 10] as const;
const HA_LAC_TRIGRAM_NAMES: Record<number, string> = { 1: "Khảm", 2: "Khôn", 3: "Chấn", 4: "Tốn", 6: "Càn", 7: "Đoài", 8: "Cấn", 9: "Ly" };
const HA_LAC_TERM_ORDER = [
  "Lập Xuân", "Vũ Thủy", "Kinh Trập", "Xuân Phân", "Thanh Minh", "Cốc Vũ",
  "Lập Hạ", "Tiểu Mãn", "Mang Chủng", "Hạ Chí", "Tiểu Thử", "Đại Thử",
  "Lập Thu", "Xử Thử", "Bạch Lộ", "Thu Phân", "Hàn Lộ", "Sương Giáng",
  "Lập Đông", "Tiểu Tuyết", "Đại Tuyết", "Đông Chí", "Tiểu Hàn", "Đại Hàn",
] as const;

function haLacTrigramLines(trigram: number) {
  const values: Record<number, [6 | 9, 6 | 9, 6 | 9]> = {
    1: [6, 9, 6], 2: [6, 6, 6], 3: [9, 6, 6], 4: [6, 9, 9],
    6: [9, 9, 9], 7: [9, 9, 6], 8: [6, 6, 9], 9: [9, 6, 9],
  };
  return values[trigram] ?? values[2];
}

function makeHaLacLines(upper: number, lower: number): HaLacLine[] {
  return [...haLacTrigramLines(lower), ...haLacTrigramLines(upper)].map((value, index) => ({ value, position: index + 1, isOriginal: false }));
}

function haLacName(lines: HaLacLine[]) {
  const name = getHexagram(lines.map((line) => line.value === 9 ? 7 : 8)).primary.name;
  return name === "Phong Địa Quan" ? "Phong Địa Quán" : name;
}

function haLacTrigramName(upper: number, lower: number) {
  return haLacName(makeHaLacLines(upper, lower));
}

function haLacChangedTrigram(trigram: number, line: number) {
  const map: Record<string, number> = {
    "1,1": 7, "1,2": 2, "1,3": 4, "2,1": 3, "2,2": 1, "2,3": 8,
    "3,1": 2, "3,2": 7, "3,3": 9, "4,1": 6, "4,2": 8, "4,3": 1,
    "6,1": 4, "6,2": 9, "6,3": 7, "7,1": 1, "7,2": 3, "7,3": 6,
    "8,1": 9, "8,2": 4, "8,3": 2, "9,1": 8, "9,2": 6, "9,3": 3,
  };
  return map[`${trigram},${line}`] ?? trigram;
}

function reduceHaLacNumber(yearPolarity: 1 | 2, genderIndex: 0 | 1, group: 1 | 2, total: number, era: number) {
  let value = group === 1 ? total > 25 ? total - 25 : total : total > 30 ? total - 30 : total;
  if (value > 10) value = value % 10 === 0 ? value / 10 : value % 10;
  else if (value === 10) value = 1;
  else if (value === 0) value = group;
  if (value !== 5) return value;
  if (era === 1864) return genderIndex === 0 ? 8 : 2;
  if (era === 1924) return (yearPolarity === 1 && genderIndex === 0) || (yearPolarity === 2 && genderIndex === 1) ? 8 : 2;
  return genderIndex === 0 ? 9 : 7;
}

function markHaLacOriginal(lines: HaLacLine[], hourBranch: number, season: 1 | 2, isMale: boolean) {
  const hourPosition = mod(hourBranch, 6) + 1;
  const targetValue: 6 | 9 = hourBranch >= 0 && hourBranch <= 5 ? 9 : 6;
  const matching = lines.map((line, index) => line.value === targetValue ? index : -1).filter((index) => index >= 0);
  const opposite = lines.map((line, index) => line.value !== targetValue ? index : -1).filter((index) => index >= 0);
  if (matching.length === 0 || matching.length === 6) {
    let indexes = lines[0].value === 9
      ? season === 1
        ? hourBranch < 6 ? [0, 1, 2] : [3, 4, 5]
        : isMale ? [0, 1, 2] : hourBranch < 6 ? [0, 1, 2] : [3, 4, 5]
      : season === 1 && !isMale ? [2, 1, 0] : hourBranch < 6 ? [0, 1, 2] : [3, 4, 5];
    indexes = [...indexes, ...indexes];
    lines[indexes[hourPosition - 1] ?? 0].isOriginal = true;
    return;
  }
  const count = matching.length;
  let selected: number;
  if (count <= 3) {
    if (hourPosition <= count) selected = matching[hourPosition - 1];
    else if (hourPosition <= count * 2) selected = matching[hourPosition - count - 1];
    else selected = opposite[(hourPosition - count * 2 - 1) % opposite.length];
  } else if (hourPosition <= count) selected = matching[hourPosition - 1];
  else selected = opposite[(hourPosition - count - 1) % opposite.length];
  lines[selected].isOriginal = true;
}

function assignHaLacAges(lines: HaLacLine[], originalIndex: number, initialAge: number) {
  let cursor = initialAge;
  for (let offset = 0; offset < 6; offset += 1) {
    const line = lines[(originalIndex + offset) % 6];
    line.startAge = cursor + 1;
    cursor += line.value;
    line.endAge = cursor;
  }
  return cursor;
}

function buildHaLacPre(swap: boolean, yangTrigram: number, yinTrigram: number, hourBranch: number, season: 1 | 2, isMale: boolean): HaLacHexagram {
  const upper = swap ? yinTrigram : yangTrigram;
  const lower = swap ? yangTrigram : yinTrigram;
  const lines = makeHaLacLines(upper, lower);
  markHaLacOriginal(lines, hourBranch, season, isMale);
  const originalIndex = Math.max(0, lines.findIndex((line) => line.isOriginal));
  const limitAge = assignHaLacAges(lines, originalIndex, 0);
  return { upperTrigram: upper, lowerTrigram: lower, name: haLacTrigramName(upper, lower), lines, limitAge };
}

function buildHaLacPost(swap: boolean, yangTrigram: number, yinTrigram: number, pre: HaLacHexagram): HaLacHexagram {
  let upper = swap ? yangTrigram : yinTrigram;
  let lower = swap ? yinTrigram : yangTrigram;
  const preOriginal = Math.max(0, pre.lines.findIndex((line) => line.isOriginal));
  const originalIndex = preOriginal < 3 ? preOriginal + 3 : preOriginal - 3;
  if (preOriginal < 3) upper = haLacChangedTrigram(upper, preOriginal + 1);
  else lower = haLacChangedTrigram(lower, originalIndex + 1);
  const lines = makeHaLacLines(upper, lower);
  // The changed trigram already contains the flipped original line. Flipping
  // that line a second time makes the displayed post-heaven hexagram disagree
  // with its six lines, which then shifts every post-heaven age interval and
  // all annual Hà Lạc transformations after the pre-heaven limit.
  lines[originalIndex].isOriginal = true;
  const limitAge = assignHaLacAges(lines, originalIndex, pre.limitAge);
  return { upperTrigram: upper, lowerTrigram: lower, name: haLacTrigramName(upper, lower), lines, limitAge };
}

function getHaLacAnnualHexagram(chart: Omit<HaLacChart, "annual">, lunarYear: number, age: number) {
  const base = age <= chart.preHeaven.limitAge ? chart.preHeaven : chart.postHeaven;
  let lineIndex = base.lines.findIndex((line) => (line.startAge ?? 0) <= age && (line.endAge ?? -1) >= age);
  if (lineIndex < 0) lineIndex = base.lines.reduce((best, line, index) => (line.endAge ?? 0) > (base.lines[best].endAge ?? 0) ? index : best, 0);
  const startAge = base.lines[lineIndex].startAge ?? age;
  const offset = age - startAge;
  const annualYang = mod(lunarYear + startAge - 1 + 6, 10) % 2 === 0;
  const originalValue = base.lines[lineIndex].value;
  let specialYang = annualYang && originalValue === 9;
  let upper = base.upperTrigram;
  let lower = base.lowerTrigram;
  const lines = base.lines.map((line) => ({ ...line, isOriginal: false }));
  const opposite = (index: number) => index < 3 ? index + 3 : index - 3;
  if (!specialYang) {
    if (lineIndex < 3) lower = haLacChangedTrigram(lower, lineIndex + 1);
    else upper = haLacChangedTrigram(upper, lineIndex - 2);
    lines[lineIndex].value = lines[lineIndex].value === 9 ? 6 : 9;
    specialYang = lines[lineIndex].value === 6;
  }
  let activeIndex = lineIndex;
  for (let index = 0; index < offset; index += 1) {
    activeIndex = specialYang && index < 2 ? index === 0 ? opposite(lineIndex) : lineIndex : activeIndex === 5 ? 0 : activeIndex + 1;
    if (activeIndex < 3) lower = haLacChangedTrigram(lower, activeIndex + 1);
    else upper = haLacChangedTrigram(upper, activeIndex - 2);
    lines[activeIndex].value = lines[activeIndex].value === 9 ? 6 : 9;
  }
  lines[activeIndex].isOriginal = true;
  return { upperTrigram: upper, lowerTrigram: lower, name: haLacName(lines), lines, limitAge: 0 } satisfies HaLacHexagram;
}

export function getHaLacChart(date: string, time: string, gender: "Nam" | "Nữ", longitude = 105.833, utcOffset = 7, mode: TimeCalculationMode = "apparent"): HaLacChart {
  const bazi = getFourPillars(date, time, longitude, utcOffset, mode);
  const indexes = bazi.pillars.flatMap((pillar) => {
    const stem = STEMS.findIndex((item) => item.name === pillar.stem);
    const branch = BRANCHES.findIndex((item) => item.name === pillar.branch);
    const first = HA_LAC_BRANCH_FIRST[branch] ?? 0;
    return [HA_LAC_STEM_NUMBERS[stem] ?? 0, first, HA_LAC_BRANCH_SECOND[first] ?? 0];
  });
  const yang = indexes.filter((value) => value % 2 !== 0).reduce((sum, value) => sum + value, 0);
  const yin = indexes.filter((value) => value % 2 === 0).reduce((sum, value) => sum + value, 0);
  const yearStem = STEMS.findIndex((item) => item.name === bazi.pillars[0].stem);
  const yearBranch = BRANCHES.findIndex((item) => item.name === bazi.pillars[0].branch);
  const hourBranch = BRANCHES.findIndex((item) => item.name === bazi.pillars[3].branch);
  const yearPolarity: 1 | 2 = yearStem % 2 === 0 ? 1 : 2;
  const isMale = gender === "Nam";
  const genderIndex: 0 | 1 = isMale ? 0 : 1;
  const eraYear = Number(date.slice(0, 4));
  const era = eraYear >= 1984 ? 1984 : eraYear >= 1924 ? 1924 : 1864;
  const yangTrigram = reduceHaLacNumber(yearPolarity, genderIndex, 1, yang, era);
  const yinTrigram = reduceHaLacNumber(yearPolarity, genderIndex, 2, yin, era);
  const swap = (yearPolarity === 1) !== isMale;
  const termIndex = Math.max(0, HA_LAC_TERM_ORDER.indexOf(bazi.calculation.solarTerm as typeof HA_LAC_TERM_ORDER[number]));
  const season: 1 | 2 = termIndex === 23 || termIndex <= 10 ? 1 : 2;
  const preHeaven = buildHaLacPre(swap, yangTrigram, yinTrigram, hourBranch, season, isMale);
  const postHeaven = buildHaLacPost(swap, yangTrigram, yinTrigram, preHeaven);
  const hoaCongNumber = termIndex === 23 || termIndex <= 4 ? 1 : termIndex <= 10 ? 3 : termIndex <= 16 ? 9 : 7;
  const lunarYear = getLunarDate(date).year;
  const base = {
    totals: { yang, yin },
    hoaCong: HA_LAC_TRIGRAM_NAMES[hoaCongNumber],
    thienNguyen: HA_LAC_TRIGRAM_NAMES[HA_LAC_STEM_NUMBERS[yearStem]],
    diaNguyen: HA_LAC_TRIGRAM_NAMES[[1, 8, 8, 3, 4, 4, 9, 2, 2, 7, 6, 6][yearBranch]],
    preHeaven,
    postHeaven,
  };
  const annual = Array.from({ length: 96 }, (_, index) => {
    const age = index + 1;
    const year = lunarYear + index;
    return { age, year, pillar: getAnnualPillar(year), hexagram: getHaLacAnnualHexagram(base, lunarYear, age) };
  });
  return { ...base, annual };
}

export function getBaziTemperature(pillars: Pillar[], solarTerm: string) {
  const elementCounts = pillars.flatMap((pillar) => [pillar.stemElement, pillar.branchElement]).reduce<Record<ElementName, number>>((counts, element) => ({ ...counts, [element]: counts[element] + 1 }), { Mộc: 0, Hỏa: 0, Thổ: 0, Kim: 0, Thủy: 0 });
  const termIndex = HA_LAC_TERM_ORDER.indexOf(solarTerm as typeof HA_LAC_TERM_ORDER[number]);
  // Lập Thu begins the cool half of the khí cycle. Treating it as midsummer
  // made metal/water-heavy charts read as "Bình Hòa" while the reference
  // method already classifies them as Hàn Lạnh.
  const hotSeason = termIndex >= 6 && termIndex <= 11;
  const coldSeason = termIndex >= 12 || termIndex <= 1;
  const hotScore = elementCounts.Hỏa * 2 + elementCounts.Thổ + (hotSeason ? 3 : 0);
  const coldScore = elementCounts.Thủy * 2 + elementCounts.Kim + (coldSeason ? 3 : 0);
  if (hotScore - coldScore >= 7) return { state: "EXTREME_HOT", label: "Khô Táo (Quá Nóng)", icon: "☀" };
  if (hotScore - coldScore >= 3) return { state: "HOT", label: "Viêm Nhiệt (Nóng)", icon: "◉" };
  if (coldScore - hotScore >= 7) return { state: "EXTREME_COLD", label: "Cực Hàn (Quá Lạnh)", icon: "❄️" };
  if (coldScore - hotScore >= 3) return { state: "COLD", label: "Hàn Lạnh (Lạnh)", icon: "❄️" };
  return { state: "BALANCED", label: "Bình Hòa (Cân Bằng)", icon: "◌" };
}

export function getMonthCalendar(year: number, monthIndex: number) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const mondayOffset = mod(firstDay - 1, 7);
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return { offset: mondayOffset, days };
}

export function toDateString(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const branchHourLabel = (hour: number) => BRANCHES[mod(Math.floor((hour + 1) / 2), 12)].name;
