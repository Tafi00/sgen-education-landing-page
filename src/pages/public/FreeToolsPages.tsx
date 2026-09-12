import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  Coins,
  Heart,
  HeartHandshake,
  LayoutGrid,
  Mountain,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { SelectField, TextField } from "../../components/form/Field";
import { calculateNumerologyReport, type NumerologyMetricKey, type NumerologyReport } from "../../../shared/numerology";
import { RESULTS_DISCLAIMER } from "../../../shared/lookup-types";

type FreeToolMetric = { value: string; label: string; note: string };

type FreeToolOutcome = { subject: string; core: string; metrics: FreeToolMetric[] };

type FreeToolInput = { name: string; birthDate: string; referenceYear: number; month: number };

type FreeToolDef = {
  slug: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  /** Bắt buộc nhập họ tên khai sinh (các chỉ số suy ra từ tên). */
  needsName: boolean;
  /** Hiển thị thêm ô chọn tháng tham chiếu. */
  needsMonth?: boolean;
  method: { title: string; text: string }[];
  compute: (input: FreeToolInput) => FreeToolOutcome;
};

const CURRENT_YEAR = new Date().getFullYear();

/** Header của site là `position: fixed` cao 98px, nên section đầu trang công cụ cần chừa thêm khoảng đệm. */
const FIRST_SECTION_STYLE: CSSProperties = { paddingTop: 140 };

/** Quy tắc rút gọn giống engine số học: giữ nguyên các số đặc biệt 11/22. */
function reduceMaster(value: number) {
  let current = value;
  while (current > 9 && current !== 11 && current !== 22) {
    current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

/** Con số ngày sinh theo cách rút gọn của engine (giữ 11, 13, 14, 16, 19, 22). */
const DAY_SPECIALS: Record<number, string> = { 11: "11/2", 22: "22/4", 13: "13/4", 14: "14/5", 16: "16/7", 19: "19/1" };

function birthdayNumber(day: number) {
  return DAY_SPECIALS[day] ?? String(day % 9 || 9);
}

function metricOf(report: NumerologyReport, key: NumerologyMetricKey): FreeToolMetric {
  const metric = report.metrics.find((item) => item.key === key);
  if (!metric) throw new Error(`Không tìm thấy chỉ số ${key}.`);
  return { value: metric.value, label: metric.label, note: metric.note };
}

function reportSubject(report: NumerologyReport) {
  return report.displayName ? `${report.displayName} · ${report.birthDateLabel}` : `Ngày sinh ${report.birthDateLabel}`;
}

function singleMetricOutcome(report: NumerologyReport, key: NumerologyMetricKey): FreeToolOutcome {
  const metric = metricOf(report, key);
  return { subject: reportSubject(report), core: metric.value, metrics: [metric] };
}

/** Danh mục mười hai công cụ số học miễn phí, dùng chung cho trang hub và trang chi tiết. */
const FREE_TOOLS: FreeToolDef[] = [
  {
    slug: "chi-so-duong-doi",
    title: "Chỉ số Đường đời",
    summary: "Tổng hợp ngày, tháng, năm sinh thành con số chủ đạo mô tả hướng đi và bài học lớn của cuộc đời.",
    icon: UserRound,
    needsName: false,
    method: [
      { title: "Nguồn dữ liệu", text: "Chỉ cần ngày sinh dương lịch; họ tên không ảnh hưởng tới chỉ số này." },
      { title: "Cách tính", text: "Rút gọn ngày, tháng, năm sinh rồi cộng lại theo hệ Pythagoras, giữ nguyên các số đặc biệt 11 và 22." },
      { title: "Cách đọc", text: "Đường đời cho biết nhịp phát triển tự nhiên; hãy đọc kèm chỉ số Sứ mệnh và Nội tâm để có bức tranh đầy đủ." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "lifePath"),
  },
  {
    slug: "chi-so-su-menh",
    title: "Chỉ số Sứ mệnh",
    summary: "Suy ra từ toàn bộ họ tên khai sinh, mô tả năng lực và hướng đóng góp mà bạn dễ phát huy nhất.",
    icon: Target,
    needsName: true,
    method: [
      { title: "Nguồn dữ liệu", text: "Họ tên khai sinh đầy đủ và ngày sinh dương lịch." },
      { title: "Cách tính", text: "Quy từng chữ cái về giá trị số theo bảng Pythagoras, cộng theo từng từ rồi rút gọn về căn số." },
      { title: "Cách đọc", text: "Sứ mệnh nói về năng lực bộc lộ ra bên ngoài; đối chiếu thêm với chỉ số Nội tâm để thấy điều bạn thật sự mong muốn." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "destiny"),
  },
  {
    slug: "chi-so-noi-tam",
    title: "Chỉ số Nội tâm",
    summary: "Tính từ các nguyên âm trong họ tên, phản ánh động lực sâu bên trong và điều khiến bạn cảm thấy đủ đầy.",
    icon: Heart,
    needsName: true,
    method: [
      { title: "Nguồn dữ liệu", text: "Họ tên khai sinh đầy đủ và ngày sinh dương lịch." },
      { title: "Cách tính", text: "Chỉ lấy các nguyên âm trong họ tên, cộng giá trị theo bảng Pythagoras rồi rút gọn." },
      { title: "Cách đọc", text: "Nội tâm là nhu cầu bên trong, có thể khác với hình ảnh bạn thể hiện ra ngoài ở chỉ số Tương tác." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "soul"),
  },
  {
    slug: "chi-so-thai-do",
    title: "Chỉ số Thái độ",
    summary: "Kết hợp ngày và tháng sinh, cho biết cách bạn phản ứng và tạo ấn tượng trong những tiếp xúc đầu tiên.",
    icon: Smile,
    needsName: false,
    method: [
      { title: "Nguồn dữ liệu", text: "Chỉ cần ngày và tháng sinh dương lịch." },
      { title: "Cách tính", text: "Rút gọn ngày sinh và tháng sinh rồi cộng lại thành căn số thái độ." },
      { title: "Cách đọc", text: "Đây là lớp biểu hiện nhanh khi gặp người mới, không phải toàn bộ tính cách của bạn." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "attitude"),
  },
  {
    slug: "nam-ca-nhan",
    title: "Năm cá nhân",
    summary: "Tính cho năm dương lịch đang chọn, cho biết năng lượng chủ đạo để bạn chọn nhịp phát triển phù hợp.",
    icon: CalendarDays,
    needsName: false,
    method: [
      { title: "Nguồn dữ liệu", text: "Ngày sinh và năm dương lịch cần xem (mặc định là năm hiện tại)." },
      { title: "Cách tính", text: "Cộng ngày sinh, tháng sinh với năm cần xem rồi rút gọn thành căn số 1–9." },
      { title: "Cách đọc", text: "Năm cá nhân là chu kỳ chín năm; nên xem cùng bảng Chu kỳ phát triển để thấy vị trí của năm hiện tại." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "personalYear"),
  },
  {
    slug: "giai-doan-dinh-cao",
    title: "Giai đoạn đỉnh cao",
    summary: "Bốn con số ứng với bốn chặng phát triển, mỗi chặng mô tả nguồn năng lượng nổi bật của giai đoạn đó.",
    icon: Mountain,
    needsName: false,
    method: [
      { title: "Nguồn dữ liệu", text: "Ngày, tháng và năm sinh dương lịch." },
      { title: "Cách tính", text: "Kết hợp ngày — tháng, ngày — năm, hai đỉnh đầu và tháng — năm để tạo bốn con số đỉnh cao." },
      { title: "Cách đọc", text: "Mỗi đỉnh cao là một chặng năng lượng; hãy dùng như gợi ý chuẩn bị thay vì mốc thời gian chính xác." },
    ],
    compute: ({ name, birthDate, referenceYear }) => {
      const report = calculateNumerologyReport(name, birthDate, referenceYear);
      const peaks = metricOf(report, "peaks");
      const metrics = peaks.value.split(" · ").map((value, index) => ({
        value,
        label: `Đỉnh cao ${index + 1}`,
        note: `Nguồn năng lượng nổi bật của chặng thứ ${index + 1} trong chu kỳ phát triển.`,
      }));
      return { subject: reportSubject(report), core: metrics[0]?.value ?? peaks.value, metrics };
    },
  },
  {
    slug: "chi-so-tuong-tac",
    title: "Chỉ số Tương tác",
    summary: "Tính từ các phụ âm trong họ tên, mô tả cách bạn biểu hiện ra bên ngoài và kết nối với môi trường xung quanh.",
    icon: UsersRound,
    needsName: true,
    method: [
      { title: "Nguồn dữ liệu", text: "Họ tên khai sinh đầy đủ và ngày sinh dương lịch." },
      { title: "Cách tính", text: "Lấy các phụ âm trong họ tên, cộng giá trị theo bảng Pythagoras rồi rút gọn." },
      { title: "Cách đọc", text: "Tương tác là hình ảnh bạn tạo ra cho người khác; so với Nội tâm để biết mình có đang sống đúng nhu cầu không." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "interaction"),
  },
  {
    slug: "chi-so-truong-thanh",
    title: "Chỉ số Trưởng thành",
    summary: "Hợp nhất Đường đời và Sứ mệnh, cho biết năng lượng hội tụ khi bạn phát huy được cả hai lớp chỉ số này.",
    icon: ChartNoAxesCombined,
    needsName: true,
    method: [
      { title: "Nguồn dữ liệu", text: "Họ tên khai sinh và ngày sinh dương lịch." },
      { title: "Cách tính", text: "Cộng căn số của Đường đời với căn số của Sứ mệnh rồi rút gọn về căn số trưởng thành." },
      { title: "Cách đọc", text: "Đây là lớp năng lượng chín muồi; nhiều người cảm nhận rõ hơn sau khi đã trải qua các cột mốc lớn." },
    ],
    compute: ({ name, birthDate, referenceYear }) => singleMetricOutcome(calculateNumerologyReport(name, birthDate, referenceYear), "maturity"),
  },
  {
    slug: "con-so-ngay-sinh",
    title: "Con số ngày sinh",
    summary: "Căn số của riêng ngày bạn sinh ra, thường được xem như tài năng đặc trưng bộc lộ sớm.",
    icon: Star,
    needsName: false,
    method: [
      { title: "Nguồn dữ liệu", text: "Chỉ cần ngày sinh dương lịch." },
      { title: "Cách tính", text: "Quy ngày sinh về căn số 1–9 theo cùng quy tắc rút gọn của SGEN; giữ nguyên các số đặc biệt 11, 13, 14, 16, 19, 22." },
      { title: "Cách đọc", text: "Đây là lớp chỉ số hẹp nhất trong bản đồ, nên đọc kèm Đường đời và Sứ mệnh." },
    ],
    compute: ({ name, birthDate, referenceYear }) => {
      const report = calculateNumerologyReport(name, birthDate, referenceYear);
      const day = Number(birthDate.split("-")[2]);
      const value = birthdayNumber(day);
      return {
        subject: reportSubject(report),
        core: value,
        metrics: [
          {
            value,
            label: "Con số ngày sinh",
            note: "Ngày sinh quy về căn số theo quy tắc rút gọn của SGEN, giữ nguyên các số đặc biệt.",
          },
          { value: metricOf(report, "lifePath").value, label: "Đường đời để đối chiếu", note: metricOf(report, "lifePath").note },
        ],
      };
    },
  },
  {
    slug: "nang-luong-thang",
    title: "Năng lượng tháng",
    summary: "Chỉ số tháng cá nhân cho biết năng lượng ngắn hạn trong tháng bạn chọn, tính từ năm cá nhân.",
    icon: CalendarCheck,
    needsName: false,
    needsMonth: true,
    method: [
      { title: "Nguồn dữ liệu", text: "Ngày sinh, năm và tháng dương lịch cần xem." },
      { title: "Cách tính", text: "Lấy căn số của năm cá nhân cộng với tháng dương lịch rồi rút gọn thành căn số 1–9 (giữ 11 và 22)." },
      { title: "Cách đọc", text: "Năng lượng tháng là lớp ngắn hạn; hãy đọc trong bối cảnh năm cá nhân và chu kỳ chín năm." },
    ],
    compute: ({ name, birthDate, referenceYear, month }) => {
      const report = calculateNumerologyReport(name, birthDate, referenceYear);
      const personalYear = metricOf(report, "personalYear");
      // Căn số của năm cá nhân: giá trị "11/2" lấy phần sau dấu gạch chéo.
      const value = reduceMaster(Number(personalYear.value.split("/").at(-1)) + month);
      return {
        subject: `Tháng ${String(month).padStart(2, "0")}/${referenceYear} · ${report.birthDateLabel}`,
        core: String(value),
        metrics: [
          {
            value: String(value),
            label: `Năng lượng tháng ${month}/${referenceYear}`,
            note: "Chỉ số tháng cá nhân = căn số của (năm cá nhân + tháng dương lịch).",
          },
          personalYear,
        ],
      };
    },
  },
  {
    slug: "chu-ky-phat-trien",
    title: "Chu kỳ phát triển",
    summary: "Bảng năm cá nhân trong chín năm quanh năm hiện tại, giúp bạn thấy mình đang ở đâu trong chu kỳ.",
    icon: TrendingUp,
    needsName: false,
    method: [
      { title: "Nguồn dữ liệu", text: "Ngày sinh dương lịch và năm mốc cần xem (mặc định là năm hiện tại)." },
      { title: "Cách tính", text: "Mỗi năm trong bảng được tính bằng công thức năm cá nhân của chính năm đó, từ hai năm trước tới sáu năm sau." },
      { title: "Cách đọc", text: "Chu kỳ lặp lại theo chín năm; nên xem cả dãy để nhận ra nhịp tăng — chững thay vì chỉ một năm đơn lẻ." },
    ],
    compute: ({ name, birthDate, referenceYear }) => {
      const metrics = Array.from({ length: 9 }, (_, index) => referenceYear - 2 + index).map((year) => {
        const metric = metricOf(calculateNumerologyReport(name, birthDate, year), "personalYear");
        return { value: metric.value, label: `Năm ${year}`, note: `Năng lượng chủ đạo của năm ${year}.` };
      });
      const current = metrics[2] ?? metrics[0];
      return { subject: metrics[0]?.label ? `Chu kỳ ${referenceYear - 2}–${referenceYear + 6}` : "", core: current?.value ?? "", metrics };
    },
  },
  {
    slug: "kha-nang-ket-noi",
    title: "Khả năng kết nối",
    summary: "Đọc song song chỉ số Tương tác và Nội tâm để hiểu cách bạn kết nối bên ngoài và nhu cầu kết nối bên trong.",
    icon: HeartHandshake,
    needsName: true,
    method: [
      { title: "Nguồn dữ liệu", text: "Họ tên khai sinh và ngày sinh dương lịch." },
      { title: "Cách tính", text: "Hai chỉ số được tính độc lập từ họ tên: Tương tác lấy phụ âm, Nội tâm lấy nguyên âm." },
      { title: "Cách đọc", text: "Khi hai chỉ số lệch nhau, bạn có thể muốn kết nối theo cách khác với hình ảnh mình thể hiện ra bên ngoài." },
    ],
    compute: ({ name, birthDate, referenceYear }) => {
      const report = calculateNumerologyReport(name, birthDate, referenceYear);
      const interaction = metricOf(report, "interaction");
      const soul = metricOf(report, "soul");
      return {
        subject: reportSubject(report),
        core: interaction.value,
        metrics: [
          { ...interaction, label: "Tương tác — cách bạn kết nối ra bên ngoài" },
          { ...soul, label: "Nội tâm — nhu cầu kết nối bên trong" },
        ],
      };
    },
  },
];

/* ---------------------------------------------------------------------------
   Hub Free tools: dữ liệu cho ba nhóm công cụ và khối "Ý nghĩa các con số".
   --------------------------------------------------------------------------- */

type HubTool = { href: string; title: string; summary: string; icon: LucideIcon };

/** Các ô nhập có thể xuất hiện trong form nhỏ của một mục accordion. */
type QuickField = "date" | "name" | "month" | "year";

type HubQuickItem = {
  key: string;
  /** Công cụ gốc trong `FREE_TOOLS`, dùng chung cách tính với trang chi tiết. */
  tool: FreeToolDef;
  /** Ghi đè tên hiển thị, dùng cho hai mục tra nhanh thuần theo tên. */
  title?: string;
  fields: QuickField[];
};

function toolBySlug(slug: string): FreeToolDef {
  const tool = FREE_TOOLS.find((item) => item.slug === slug);
  if (!tool) throw new Error(`Không tìm thấy công cụ ${slug}.`);
  return tool;
}

/**
 * Mốc ngày sinh trung tính cho hai mục tra nhanh thuần theo tên.
 * `calculateNumerologyReport` cần một ngày hợp lệ để dựng báo cáo, nhưng chỉ số
 * Sứ mệnh và Nội tâm chỉ suy ra từ họ tên nên giá trị không phụ thuộc ngày này.
 */
const NAME_ONLY_REFERENCE_DATE = "1990-01-01";

/** Nhóm 1 — tám chỉ số nền tảng, kèm hai mục tra nhanh riêng theo tên. */
const QUICK_ITEMS: HubQuickItem[] = [
  { key: "duong-doi", tool: toolBySlug("chi-so-duong-doi"), fields: ["date"] },
  { key: "su-menh", tool: toolBySlug("chi-so-su-menh"), fields: ["name", "date"] },
  { key: "noi-tam", tool: toolBySlug("chi-so-noi-tam"), fields: ["name", "date"] },
  { key: "thai-do", tool: toolBySlug("chi-so-thai-do"), fields: ["date"] },
  { key: "nam-ca-nhan", tool: toolBySlug("nam-ca-nhan"), fields: ["date", "year"] },
  { key: "giai-doan-dinh-cao", tool: toolBySlug("giai-doan-dinh-cao"), fields: ["date"] },
  { key: "tuong-tac", tool: toolBySlug("chi-so-tuong-tac"), fields: ["name", "date"] },
  { key: "truong-thanh", tool: toolBySlug("chi-so-truong-thanh"), fields: ["name", "date"] },
  { key: "su-menh-theo-ten", tool: toolBySlug("chi-so-su-menh"), title: "Sứ mệnh theo tên", fields: ["name"] },
  { key: "noi-tam-theo-ten", tool: toolBySlug("chi-so-noi-tam"), title: "Nội tâm theo tên", fields: ["name"] },
];

/** Nhóm 2 — bốn công cụ theo thời gian và mức độ kết nối. */
const EXTRA_ITEMS: HubQuickItem[] = [
  { key: "con-so-ngay-sinh", tool: toolBySlug("con-so-ngay-sinh"), fields: ["date"] },
  { key: "nang-luong-thang", tool: toolBySlug("nang-luong-thang"), fields: ["date", "month"] },
  { key: "chu-ky-phat-trien", tool: toolBySlug("chu-ky-phat-trien"), fields: ["date", "year"] },
  { key: "kha-nang-ket-noi", tool: toolBySlug("kha-nang-ket-noi"), fields: ["name", "date"] },
];

const FENG_SHUI_LINKS = [
  {
    href: "/cong-cu-phong-thuy/gieo-que-kinh-dich",
    title: "Gieo quẻ Kinh Dịch",
    text: "Lập quẻ chủ, hào động và quẻ biến từ sáu lần gieo ba đồng xu.",
    icon: Coins,
  },
  {
    href: "/cong-cu-phong-thuy/tu-tru-bat-tu",
    title: "Phân tích Tứ Trụ Bát Tự",
    text: "An bốn trụ theo tiết khí, đọc ngũ hành, Thập thần và Đại vận.",
    icon: LayoutGrid,
  },
  {
    href: "/cong-cu-phong-thuy/xem-ngay",
    title: "Xem ngày tốt — xấu",
    text: "Tra Thập nhị Trực, Nhị thập bát tú và bảng mười hai giờ trong ngày.",
    icon: CalendarCheck,
  },
];

/** Nhóm 3 — công cụ phong thủy dùng hệ Can Chi, chỉ dẫn sang trang riêng. */
const FENG_SHUI_TOOLS: HubTool[] = FENG_SHUI_LINKS.map((item) => ({
  href: item.href,
  title: item.title,
  summary: item.text,
  icon: item.icon,
}));

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `Tháng ${index + 1}` }));

/** Diễn giải một câu cho mỗi con số 1–9 cùng hai số bậc thầy 11 và 22. */
const NUMBER_MEANINGS: { number: string; text: string }[] = [
  { number: "1", text: "Chủ động, độc lập và có năng lượng tiên phong." },
  { number: "2", text: "Tinh tế, giàu khả năng kết nối và hợp tác." },
  { number: "3", text: "Sáng tạo, lạc quan và có thế mạnh biểu đạt." },
  { number: "4", text: "Thực tế, kỷ luật và bền bỉ xây nền tảng." },
  { number: "5", text: "Linh hoạt, yêu tự do và học tốt qua trải nghiệm." },
  { number: "6", text: "Tận tâm, trách nhiệm và hướng về cộng đồng." },
  { number: "7", text: "Sâu sắc, quan sát tốt và luôn tìm kiếm sự thật." },
  { number: "8", text: "Có tư duy quản trị, bản lĩnh và hướng tới thành tựu." },
  { number: "9", text: "Nhân ái, bao dung và mong muốn tạo giá trị chung." },
  { number: "11", text: "Trực giác mạnh, nhạy cảm và có khả năng truyền cảm hứng." },
  { number: "22", text: "Kết hợp tầm nhìn lớn với năng lực kiến tạo thực tế." },
];

/** Bỏ dấu tiếng Việt để gõ từ khoá kiểu "duong doi" vẫn tìm ra "Đường đời". */
function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/** Danh sách link của nhóm phong thủy: giữ dạng thẻ dẫn sang trang công cụ riêng. */
function ToolList({ tools }: { tools: HubTool[] }) {
  return (
    <div className="tools-hub__list">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link className="tools-hub__item" to={tool.href} key={tool.href}>
            <Icon aria-hidden="true" />
            <span>
              <b>{tool.title}</b>
              <small>{tool.summary}</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Một mục accordion của hub: mở ra là form nhỏ tính ngay tại chỗ.
 * Form chỉ hiện những ô mà chỉ số đó thực sự cần, và luôn dùng chung cách tính
 * với trang chi tiết (`FREE_TOOLS[].compute`) nên kết quả luôn khớp.
 */
function QuickToolItem({ item, defaultOpen, forceOpen }: { item: HubQuickItem; defaultOpen: boolean; forceOpen: boolean }) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [referenceYear, setReferenceYear] = useState(CURRENT_YEAR);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<FreeToolOutcome | null>(null);

  const needsName = item.fields.includes("name");
  const needsDate = item.fields.includes("date");
  const title = item.title ?? item.tool.title;
  const Icon = item.tool.icon;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (needsName && name.trim().length < 2) {
      setOutcome(null);
      setError("Vui lòng nhập họ tên khai sinh (ít nhất 2 ký tự).");
      return;
    }
    if (needsDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setOutcome(null);
      setError("Vui lòng chọn ngày sinh dương lịch.");
      return;
    }
    try {
      setOutcome(
        item.tool.compute({
          name: needsName ? name.trim() : "",
          birthDate: needsDate ? birthDate : NAME_ONLY_REFERENCE_DATE,
          referenceYear,
          month,
        }),
      );
      setError("");
    } catch {
      setOutcome(null);
      setError("Không thể tính chỉ số từ dữ liệu này. Vui lòng kiểm tra lại.");
    }
  };

  return (
    <details className="ref-acc" open={forceOpen || defaultOpen ? true : undefined}>
      <summary>
        <span className="ref-acc__icon">
          <Icon aria-hidden="true" />
        </span>
        <span className="ref-acc__head">
          <b>{title}</b>
          <small>{item.tool.summary}</small>
        </span>
        <ChevronDown className="ref-acc__caret" aria-hidden="true" />
      </summary>

      <form className="ref-acc__form" onSubmit={handleSubmit} noValidate>
        {needsName ? (
          <TextField
            label="Họ và tên khai sinh"
            required
            icon={<UserRound aria-hidden="true" />}
            placeholder="Nguyễn Văn A"
            value={name}
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
          />
        ) : null}
        {needsDate ? (
          <TextField
            label="Ngày sinh dương lịch"
            type="date"
            required
            icon={<CalendarDays aria-hidden="true" />}
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
        ) : null}
        {item.fields.includes("month") ? (
          <SelectField label="Tháng cần xem" options={MONTH_OPTIONS} value={String(month)} onChange={(event) => setMonth(Number(event.target.value))} />
        ) : null}
        {item.fields.includes("year") ? (
          <TextField
            label="Năm tham chiếu"
            type="number"
            min={1990}
            max={2100}
            icon={<CalendarCheck aria-hidden="true" />}
            value={String(referenceYear)}
            onChange={(event) => {
              const value = Number(event.target.value);
              setReferenceYear(Number.isFinite(value) && value > 0 ? value : CURRENT_YEAR);
            }}
          />
        ) : null}

        <button type="submit" className="button button--primary">
          <Sparkles aria-hidden="true" /> Tính ngay
        </button>

        {error ? (
          <p className="ref-acc__error" role="alert">
            <ShieldCheck aria-hidden="true" /> {error}
          </p>
        ) : null}

        {outcome ? (
          <div className="ref-acc__result">
            <span className="ref-acc__value">{outcome.core}</span>
            <div className="ref-acc__readout">
              <strong>{outcome.metrics[0]?.label ?? title}</strong>
              {needsDate ? <small className="ref-acc__subject">{outcome.subject}</small> : null}
              <p>{outcome.metrics[0]?.note}</p>
              {outcome.metrics.length > 1 ? (
                <ul className="ref-acc__metrics">
                  {outcome.metrics.slice(1, 5).map((metric) => (
                    <li key={`${metric.label}-${metric.value}`}>
                      <b>{metric.value}</b>
                      <span>{metric.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link to={`/free-tools/${item.tool.slug}`}>
                Xem chi tiết <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}
      </form>
    </details>
  );
}

/** Trang hub Free tools: mục lục dẫn nhóm, accordion có form tính ngay và khối ý nghĩa con số. */
export function FreeToolsPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeText(query);
  const match = (text: string) => !normalizedQuery || normalizeText(text).includes(normalizedQuery);
  const matchItem = (item: HubQuickItem) => match(item.title ?? item.tool.title) || match(item.tool.summary);
  const search = normalizedQuery.length > 0;

  const quickItems = QUICK_ITEMS.filter(matchItem);
  const extraItems = EXTRA_ITEMS.filter(matchItem);
  const fengShuiTools = FENG_SHUI_TOOLS.filter((tool) => match(tool.title) || match(tool.summary));
  const matchCount = quickItems.length + extraItems.length + fengShuiTools.length;

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Calculator aria-hidden="true" /> Kho công cụ SGEN
            </span>
            <h1>
              Công cụ tra cứu <em>miễn phí, không cần tài khoản</em>
            </h1>
            <p>
              Mười hai công cụ Thần số học và ba công cụ phong thủy chạy trực tiếp trên trình duyệt. Mỗi mục mở ra là một form nhỏ tính ngay tại chỗ,
              kèm giải thích cách tính để bạn kiểm chứng lại kết quả.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="page-primary" to="/free-tools/chi-so-duong-doi">
                <Sparkles aria-hidden="true" /> Tính chỉ số Đường đời
              </Link>
              <Link className="action-button action-button--outline" to="/tra-cuu/than-so-hoc">
                Tra cứu tám chỉ số <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-light-section ux-free-tools" id="tinh-nhanh-chi-so">
        <div className="container">
          <nav className="ref-toc" aria-label="Mục lục công cụ">
            <a href="#nhom-tinh-nhanh">
              <Calculator aria-hidden="true" /> Tính nhanh chỉ số
            </a>
            <a href="#nhom-cong-cu-khac">
              <Star aria-hidden="true" /> Công cụ khác
            </a>
            <a href="#nhom-phong-thuy">
              <Coins aria-hidden="true" /> Phong thủy
            </a>
            <a href="#y-nghia-cac-con-so">
              <BookOpen aria-hidden="true" /> Ý nghĩa con số
            </a>
          </nav>

          <div className="page-section-heading page-section-heading--light">
            <span>Kho công cụ</span>
            <h2>Chọn công cụ theo nhu cầu</h2>
            <p>Mở từng mục để tính ngay tại chỗ, hoặc gõ tên công cụ để lọc nhanh danh sách bên dưới.</p>
          </div>

          <label className="tools-hub__search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Tìm công cụ theo tên…"
              aria-label="Tìm công cụ theo tên"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button type="button" aria-label="Xoá từ khoá tìm kiếm" onClick={() => setQuery("")}>
                <X aria-hidden="true" />
              </button>
            ) : null}
          </label>

          {matchCount === 0 ? (
            <div className="tools-hub__empty">
              <Search aria-hidden="true" />
              <p>Không tìm thấy công cụ nào khớp với &ldquo;{query}&rdquo;.</p>
              <button type="button" className="action-button action-button--outline" onClick={() => setQuery("")}>
                Xoá từ khoá
              </button>
            </div>
          ) : (
            <div className="ref-groups">
              <section className="ref-group" id="nhom-tinh-nhanh" aria-labelledby="ref-group-tinh-nhanh">
                <header className="ref-group__head">
                  <h3 id="ref-group-tinh-nhanh">Tính nhanh chỉ số</h3>
                  <p>
                    Tám chỉ số nền tảng tính từ ngày sinh và họ tên, cùng hai chỉ số tra nhanh riêng theo tên. Mở một mục để tính ngay tại chỗ.
                  </p>
                </header>
                {quickItems.length ? (
                  <div className="ref-acc-list">
                    {quickItems.map((item, index) => (
                      <QuickToolItem key={item.key} item={item} defaultOpen={index === 0 && !search} forceOpen={search} />
                    ))}
                  </div>
                ) : (
                  <p className="ref-group__empty">Không có mục nào khớp từ khoá hiện tại.</p>
                )}
              </section>

              <section className="ref-group" id="nhom-cong-cu-khac" aria-labelledby="ref-group-cong-cu-khac">
                <header className="ref-group__head">
                  <h3 id="ref-group-cong-cu-khac">Công cụ miễn phí khác</h3>
                  <p>Các lớp chỉ số theo thời gian và cách đọc mức độ kết nối — mỗi mục cũng tính ngay tại chỗ.</p>
                </header>
                {extraItems.length ? (
                  <div className="ref-acc-list">
                    {extraItems.map((item) => (
                      <QuickToolItem key={item.key} item={item} defaultOpen={false} forceOpen={search} />
                    ))}
                  </div>
                ) : (
                  <p className="ref-group__empty">Không có mục nào khớp từ khoá hiện tại.</p>
                )}
              </section>

              <section className="ref-group" id="nhom-phong-thuy" aria-labelledby="ref-group-phong-thuy">
                <header className="ref-group__head">
                  <h3 id="ref-group-phong-thuy">Công cụ phong thủy</h3>
                  <p>Dùng hệ Can Chi và lịch pháp thay vì số học Pythagoras; mở công cụ để nhập dữ liệu ở trang riêng.</p>
                </header>
                {fengShuiTools.length ? <ToolList tools={fengShuiTools} /> : <p className="ref-group__empty">Không có mục nào khớp từ khoá hiện tại.</p>}
              </section>
            </div>
          )}
        </div>
      </section>

      <section className="page-light-section ux-free-numbers" id="y-nghia-cac-con-so">
        <div className="container">
          <div className="page-section-heading page-section-heading--light">
            <span>Ý nghĩa các con số</span>
            <h2>Ý nghĩa các con số trong Thần số học Pythagoras</h2>
            <p>Từ 1 đến 9 cùng hai số bậc thầy 11 và 22 — mỗi con số là một nhóm năng lượng riêng trong bản đồ số học.</p>
          </div>
          <div className="ref-number-grid">
            {NUMBER_MEANINGS.map((entry) => (
              <Link className="ref-number" to="/#y-nghia-con-so" key={entry.number}>
                <b>{entry.number}</b>
                <span>{entry.text}</span>
                <small>
                  Xem chi tiết <ArrowRight aria-hidden="true" />
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <div className="privacy-banner">
            <ShieldCheck aria-hidden="true" />
            <div>
              <strong>Nguyên tắc sử dụng công cụ</strong>
              <span>
                {RESULTS_DISCLAIMER} Các phép tính số học và phong thủy được thực hiện trên máy của bạn; SGEN không lưu dữ liệu khi bạn chưa bấm gửi.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ToolNotFound() {
  return (
    <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
      <div className="container">
        <div className="empty-search">
          <Search aria-hidden="true" />
          <h3>Không tìm thấy công cụ này</h3>
          <p>Đường dẫn có thể đã thay đổi. Bạn hãy chọn lại công cụ trong danh mục Free tools của SGEN.</p>
          <Link className="page-primary" to="/free-tools">
            Về trang Free tools <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Trang chi tiết một công cụ số học: form theo loại chỉ số, kết quả tính tại trình duyệt và phần phương pháp. */
export function FreeToolDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const tool = useMemo(() => FREE_TOOLS.find((item) => item.slug === slug), [slug]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [referenceYear, setReferenceYear] = useState(CURRENT_YEAR);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; birthDate?: string }>({});
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<(FreeToolOutcome & { title: string }) | null>(null);

  if (!tool) return <ToolNotFound />;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: { name?: string; birthDate?: string } = {};
    if (tool.needsName && name.trim().length < 2) errors.name = "Vui lòng nhập họ tên khai sinh (ít nhất 2 ký tự).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) errors.birthDate = "Vui lòng chọn ngày sinh dương lịch.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      const result = tool.compute({ name: name.trim(), birthDate, referenceYear, month });
      setOutcome({ ...result, title: tool.title });
      setError("");
    } catch {
      setOutcome(null);
      setError("Không thể tính chỉ số từ dữ liệu này. Vui lòng kiểm tra lại ngày sinh.");
    }
  };

  return (
    <>
      <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
        <div className="container lookup-workspace">
          <header>
            <span className="page-kicker">
              <tool.icon aria-hidden="true" /> Free tool
            </span>
            <h1>{tool.title}</h1>
            <p>{tool.summary}</p>
          </header>

          <div className="lookup-workspace__grid">
            <form className="page-form-card" onSubmit={handleSubmit} noValidate>
              <div>
                <small>Thông tin cần nhập</small>
                <h2>Dữ liệu cho công cụ</h2>
              </div>
              {tool.needsName ? (
                <TextField
                  label="Họ và tên khai sinh"
                  required
                  icon={<UserRound aria-hidden="true" />}
                  placeholder="Nguyễn Văn A"
                  value={name}
                  error={fieldErrors.name}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                />
              ) : null}
              <TextField
                label="Ngày sinh dương lịch"
                type="date"
                required
                icon={<CalendarDays aria-hidden="true" />}
                value={birthDate}
                error={fieldErrors.birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
              {tool.needsMonth ? (
                <label>
                  <span>Tháng cần xem</span>
                  <div>
                    <CalendarCheck aria-hidden="true" />
                    <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                        <option value={value} key={value}>
                          Tháng {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              ) : null}
              {tool.slug === "nam-ca-nhan" || tool.slug === "chu-ky-phat-trien" || tool.slug === "nang-luong-thang" ? (
                <label>
                  <span>Năm tham chiếu</span>
                  <div>
                    <CalendarDays aria-hidden="true" />
                    <input
                      type="number"
                      min={1990}
                      max={2100}
                      value={referenceYear}
                      onChange={(event) => setReferenceYear(Number(event.target.value))}
                    />
                  </div>
                </label>
              ) : null}

              <button type="submit" className="button button--primary">
                <Sparkles aria-hidden="true" /> Tính chỉ số
              </button>

              {error ? (
                <div className="privacy-banner" role="alert">
                  <ShieldCheck aria-hidden="true" />
                  <div>
                    <strong>Không thể tính chỉ số</strong>
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}

              <p>
                <ShieldCheck aria-hidden="true" />
                Toàn bộ phép tính chạy trong trình duyệt của bạn. SGEN không gửi và không lưu họ tên hay ngày sinh ở công cụ này.
              </p>
            </form>

            <div>
              {outcome ? (
                <div className="result-preview section--dark">
                  <header>
                    <div>
                      <small>{outcome.title}</small>
                      <h2>{outcome.subject}</h2>
                      <p>Kết quả được tính theo hệ Pythagoras mà SGEN đang áp dụng.</p>
                    </div>
                    <strong>{outcome.core}</strong>
                  </header>
                  <div className="report-grid">
                    {outcome.metrics.map((metric) => (
                      <article key={`${metric.label}-${metric.value}`}>
                        <span className={metric.value.length > 3 ? "is-wide-value" : undefined}>{metric.value}</span>
                        <div>
                          <strong>{metric.label}</strong>
                          <small>{metric.note}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="privacy-banner">
                    <ShieldCheck aria-hidden="true" />
                    <div>
                      <strong>Lưu ý quan trọng</strong>
                      <span>{RESULTS_DISCLAIMER}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="result-preview section--dark">
                  <div className="result-preview__empty result-preview__empty--compact">
                    <tool.icon aria-hidden="true" />
                    <h2>Kết quả sẽ hiển thị tại đây</h2>
                    <p>Điền thông tin rồi bấm tính để xem con số chính.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <div className="page-section-heading">
            <span>Phương pháp luận giải</span>
            <h2>Cách công cụ tính chỉ số này</h2>
          </div>
          <div className="value-grid">
            {tool.method.map((item) => (
              <article key={item.title}>
                <BookOpen aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-light-section">
        <div className="container">
          <div className="page-section-heading page-section-heading--light">
            <span>Đọc tiếp</span>
            <h2>Kết hợp thêm công cụ khác</h2>
          </div>
          <div className="service-grid">
            <article>
              <h3>Tra cứu đầy đủ tám chỉ số</h3>
              <p>Nhập họ tên và ngày sinh một lần để xem toàn bộ bản đồ số học kèm phần luận giải chi tiết.</p>
              <Link to="/tra-cuu/than-so-hoc">
                Tra cứu ngay <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Danh mục Free tools</h3>
              <p>Xem lại toàn bộ mười hai công cụ số học và ba công cụ phong thủy đang có trên SGEN.</p>
              <Link to="/free-tools">
                Về trang Free tools <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Học để tự luận giải</h3>
              <p>Khóa học Thần số học căn bản hướng dẫn cách tính và đọc các chỉ số theo trình tự có hệ thống.</p>
              <Link to="/khoa-hoc">
                Xem khóa học <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
