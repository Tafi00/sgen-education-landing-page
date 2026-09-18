import { DISC_LABELS, type DiscResult } from "../../../shared/quiz/types.js";
import { MBTI_DIMENSIONS, type MbtiResult } from "../../../shared/quiz/mbti-types.js";
import type { NumerologyFullReport } from "../../../shared/numerology.js";
import type { SimReport } from "../../../shared/sim/types.js";
import { RESULTS_DISCLAIMER, type LookupResultPayload, type ResultBlock } from "../../../shared/lookup-types.js";
import {
  BIRTH_NAME_CHART_PAGES,
  CAREER_INTRO,
  CONCLUSION_CONTENT,
  IKIGAI_INTRO,
  NUMEROLOGY_CONTENT,
  OPENING_CONTENT,
  PINNACLE_CONTENT,
  type MetricContent,
} from "./numerologyContent.js";

type QuizTemplate = {
  title?: string;
  summary?: string;
  strengths?: string[];
  cautions?: string[];
  careers?: string[];
  growth?: string[];
  relationships?: string[];
  teaming?: string[];
};

/** Ghép luận giải cho một chỉ số: file theo tử số ("13/4" → "13"), thiếu thì dùng căn số. */
function metricParagraphs(value: string, content: MetricContent | undefined): string[] {
  if (!content) return [];
  const numerator = value.split("/")[0];
  const root = value.split("/").at(-1) ?? numerator;
  return content.byValue[numerator] ?? content.byValue[root] ?? [];
}

/** Một mục luận giải: chỉ số đơn trị hoặc nhiều trị (lặp, bài học, nợ nghiệp, đam mê). */
function detailItem(label: string, value: string, values: string[] | undefined, content: MetricContent | undefined) {
  const paragraphs = values?.length
    ? values.flatMap((item) => metricParagraphs(item, content))
    : metricParagraphs(value, content);
  const intro = paragraphs.length ? [] : (content?.intro ?? []);
  const merged = [...intro, ...paragraphs];
  if (!merged.length) return null;
  return { label, value: value || "—", paragraphs: merged };
}

export function numerologyPayload(report: NumerologyFullReport): LookupResultPayload {
  const blocks: ResultBlock[] = [];
  blocks.push({
    kind: "metrics",
    heading: "Tám chỉ số chủ đạo",
    items: report.metrics.map((metric) => ({ label: metric.label, value: String(metric.value), note: metric.note })),
  });

  const openingParagraphs = [
    ...OPENING_CONTENT.letter,
    ...OPENING_CONTENT.pythagoras,
    ...OPENING_CONTENT.history,
    ...OPENING_CONTENT.purpose,
  ];
  if (openingParagraphs.length) {
    blocks.push({ kind: "text", heading: "Thư ngỏ — Thần số học Pythagoras", paragraphs: openingParagraphs });
  }

  for (const section of report.sections) {
    blocks.push({ kind: "section", id: section.id, title: section.title });
    if (section.id === "dinh-huong-su-nghiep" && CAREER_INTRO.length) {
      blocks.push({ kind: "text", paragraphs: CAREER_INTRO });
    }
    blocks.push({
      kind: "metrics",
      items: section.metrics.map((item) => ({ label: item.label, value: item.value || "—", note: item.note })),
    });
    const details = section.metrics
      .map((item) => detailItem(item.label, item.value, item.values, NUMEROLOGY_CONTENT[item.key]))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (details.length) {
      blocks.push({ kind: "metricDetail", items: details });
    }
  }

  if (report.commonNameMetrics?.length) {
    blocks.push({ kind: "section", id: "ten-thuong-dung", title: "Chỉ số theo tên thường dùng" });
    blocks.push({
      kind: "metrics",
      items: report.commonNameMetrics.map((item) => ({ label: item.label, value: item.value || "—", note: item.note })),
    });
  }

  blocks.push({ kind: "section", id: "bieu-do", title: "Biểu đồ năng lượng" });
  blocks.push({
    kind: "pinnacles",
    heading: "Biểu đồ chặng đường đời",
    bases: [
      { label: "Ngày", value: report.lifePathChart.day },
      { label: "Ngày sinh", value: report.lifePathChart.birthNumber },
      { label: "Tháng", value: report.lifePathChart.month },
      { label: "Năm", value: report.lifePathChart.year },
    ],
    pinnacles: report.lifePathChart.pinnacles,
  });
  const pinnacleDetails = report.lifePathChart.pinnacles
    .map((pinnacle, index) => {
      const content = PINNACLE_CONTENT[`dinh${index + 1}` as "dinh1"];
      const paragraphs = metricParagraphs(pinnacle.value, { byValue: content });
      if (!paragraphs.length) return null;
      return { label: `Đỉnh ${index + 1}${pinnacle.range ? ` · ${pinnacle.range} tuổi` : ""}`, value: pinnacle.value, paragraphs };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (PINNACLE_CONTENT.intro.length || pinnacleDetails.length) {
    blocks.push({ kind: "metricDetail", intro: PINNACLE_CONTENT.intro, items: pinnacleDetails });
  }
  blocks.push({
    kind: "ikigai",
    heading: "Biểu đồ Ikigai",
    passion: report.ikigai.passion,
    mission: report.ikigai.mission,
    expertise: report.ikigai.expertise,
    career: report.ikigai.career,
  });
  if (IKIGAI_INTRO.length) {
    blocks.push({ kind: "text", heading: "Cách đọc biểu đồ Ikigai", paragraphs: IKIGAI_INTRO });
  }
  blocks.push({
    kind: "chart3x3",
    heading: "Biểu đồ ngày sinh",
    counts: Object.fromEntries(Object.entries(report.birthChart).map(([key, value]) => [key, value])),
    note: "Mỗi con số trong ngày, tháng, năm sinh xuất hiện bao nhiêu lần — ô trống là năng lượng còn thiếu.",
  });
  blocks.push({
    kind: "chart3x3",
    heading: "Biểu đồ họ tên",
    counts: Object.fromEntries(Object.entries(report.nameChart).map(([key, value]) => [key, value])),
    note: "Tần suất các giá trị chữ cái trong họ tên khai sinh theo bảng Pythagoras.",
  });
  const chartPages = BIRTH_NAME_CHART_PAGES.flat();
  if (chartPages.length) {
    blocks.push({ kind: "text", heading: "Luận giải biểu đồ ngày sinh và họ tên", paragraphs: chartPages });
  }
  if (CONCLUSION_CONTENT.length) {
    blocks.push({ kind: "section", id: "ket-luan", title: "Kết luận" });
    blocks.push({ kind: "text", paragraphs: CONCLUSION_CONTENT });
  }

  return {
    headline: report.displayName,
    subhead: `Ngày sinh ${report.birthDateLabel}`,
    blocks,
    disclaimer: RESULTS_DISCLAIMER,
  };
}

export function simPayload(report: SimReport): LookupResultPayload {
  const blocks: ResultBlock[] = [
    {
      kind: "score",
      heading: "Điểm tổng hợp theo 5 lớp phân tích",
      items: report.methods.map((method) => ({ label: method.name, value: method.score, max: 100, tone: method.tone, note: method.summary })),
    },
    {
      kind: "metrics",
      heading: "Thông tin dãy số",
      items: [
        { label: "Nhà mạng", value: report.carrier },
        { label: "Quẻ chủ", value: report.hexagram.primary },
        { label: "Quẻ hỗ", value: report.hexagram.mutual },
        { label: "Quẻ biến", value: report.hexagram.changing },
        { label: "Hành vượng", value: report.elements.dominant },
        { label: "Hành khuyết", value: report.elements.missing.length ? report.elements.missing.join(", ") : "Không khuyết" },
        { label: "Âm dương", value: `${report.yinYang.yang} dương / ${report.yinYang.yin} âm` },
      ],
    },
    ...report.methods.map<ResultBlock>((method) => ({ kind: "text", heading: method.name, paragraphs: [method.summary], bullets: method.bullets })),
  ];
  if (report.personalFit) {
    blocks.push({
      kind: "score",
      heading: "Đối chiếu bản mệnh",
      items: [{ label: "Mức độ hài hoà với ngày giờ sinh", value: report.personalFit.matchScore, max: 100, tone: report.personalFit.tone, note: report.personalFit.note }],
    });
  }
  return {
    headline: `Sim ${report.phone}`,
    subhead: report.overallSummary,
    blocks,
    disclaimer: `${RESULTS_DISCLAIMER} ${report.notes.join(" ")}`.trim(),
  };
}

export function discPayload(result: DiscResult, template: QuizTemplate | null): LookupResultPayload {
  const blocks: ResultBlock[] = [
    {
      kind: "score",
      heading: "Mức độ thể hiện bốn nhóm hành vi",
      items: result.scores.map((score) => ({ label: DISC_LABELS[score.key], value: score.score, max: 100, tone: score.key === result.primary ? "good" : "neutral" })),
    },
    {
      kind: "text",
      heading: template?.title ?? `Nhóm hành vi ${result.code}`,
      paragraphs: [template?.summary ?? `Bạn nghiêng về nhóm ${result.primary} kết hợp ${result.secondary}.`],
    },
  ];
  if (template?.strengths?.length) blocks.push({ kind: "text", heading: "Điểm mạnh nổi bật", paragraphs: [], bullets: template.strengths });
  if (template?.cautions?.length) blocks.push({ kind: "text", heading: "Điều cần lưu ý", paragraphs: [], bullets: template.cautions });
  if (template?.careers?.length) blocks.push({ kind: "text", heading: "Nhóm nghề phù hợp", paragraphs: [], bullets: template.careers });
  if (template?.growth?.length) blocks.push({ kind: "text", heading: "Hướng phát triển", paragraphs: [], bullets: template.growth });
  if (template?.teaming?.length) blocks.push({ kind: "text", heading: "Khi làm việc nhóm", paragraphs: [], bullets: template.teaming });
  return {
    headline: `Kết quả DISC: ${result.code}`,
    subhead: `Đã hoàn thành ${result.answeredGroups} nhóm câu hỏi. Kết quả tham chiếu khung DISC, không phải công cụ chẩn đoán.`,
    blocks,
    disclaimer: RESULTS_DISCLAIMER,
  };
}

export function mbtiPayload(result: MbtiResult, template: QuizTemplate | null): LookupResultPayload {
  const blocks: ResultBlock[] = [
    {
      kind: "score",
      heading: "Bốn cặp xu hướng",
      items: result.dimensions.map((dimension) => ({
        label: MBTI_DIMENSIONS.find((item) => item.dimension === dimension.dimension)?.label ?? dimension.dimension,
        value: dimension.firstPercent,
        max: 100,
        tone: "neutral",
        note: `${dimension.first} ${dimension.firstCount} – ${dimension.secondCount} ${dimension.second} · độ mạnh ${dimension.strength}%`,
      })),
    },
    {
      kind: "text",
      heading: template?.title ?? `Nhóm xu hướng ${result.code}`,
      paragraphs: [template?.summary ?? `Bạn có xu hướng thuộc nhóm ${result.code}.`],
    },
  ];
  if (template?.strengths?.length) blocks.push({ kind: "text", heading: "Điểm mạnh", paragraphs: [], bullets: template.strengths });
  if (template?.cautions?.length) blocks.push({ kind: "text", heading: "Điều cần lưu ý", paragraphs: [], bullets: template.cautions });
  if (template?.careers?.length) blocks.push({ kind: "text", heading: "Môi trường và ngành phù hợp", paragraphs: [], bullets: template.careers });
  if (template?.growth?.length) blocks.push({ kind: "text", heading: "Hướng phát triển", paragraphs: [], bullets: template.growth });
  if (template?.relationships?.length) blocks.push({ kind: "text", heading: "Trong quan hệ", paragraphs: [], bullets: template.relationships });
  return {
    headline: `Kết quả MBTI: ${result.code}`,
    subhead: `Đã trả lời ${result.answered} câu. Kết quả tham chiếu khung 4 cặp xu hướng, không phải trắc nghiệm tâm lý chuẩn hoá.`,
    blocks,
    disclaimer: RESULTS_DISCLAIMER,
  };
}
