import { DISC_LABELS, type DiscResult } from "../../../shared/quiz/types.js";
import { MBTI_DIMENSIONS, type MbtiResult } from "../../../shared/quiz/mbti-types.js";
import type { NumerologyFullReport } from "../../../shared/numerology.js";
import type { SimReport } from "../../../shared/sim/types.js";
import { RESULTS_DISCLAIMER, type LookupResultPayload, type ResultBlock } from "../../../shared/lookup-types.js";

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

export function numerologyPayload(report: NumerologyFullReport): LookupResultPayload {
  const blocks: ResultBlock[] = [];
  blocks.push({
    kind: "metrics",
    heading: "Tám chỉ số chủ đạo",
    items: report.metrics.map((metric) => ({ label: metric.label, value: String(metric.value), note: metric.note })),
  });

  for (const section of report.sections) {
    blocks.push({ kind: "section", id: section.id, title: section.title });
    blocks.push({
      kind: "metrics",
      items: section.metrics.map((item) => ({ label: item.label, value: item.value || "—", note: item.note })),
    });
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
  blocks.push({
    kind: "ikigai",
    heading: "Biểu đồ Ikigai",
    passion: report.ikigai.passion,
    mission: report.ikigai.mission,
    expertise: report.ikigai.expertise,
    career: report.ikigai.career,
  });
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
