import { Router } from "express";
import { z } from "zod";
import { LOOKUP_LABELS, type LookupResultPayload, type LookupType, type ResultBlock } from "../../../../shared/lookup-types.js";
import { calculateFullNumerologyReport } from "../../../../shared/numerology.js";
import { analyzeSim } from "../../../../shared/sim/index.js";
import { LookupReport } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { currentMember } from "../../middleware/auth.js";
import { lookupLimiter } from "../../middleware/rateLimit.js";
import { numerologyPayload, numerologyWebPayload, simPayload } from "../../services/lookupResult.js";
import { scoreQuiz, loadPublicQuizSet } from "../../services/quizService.js";
import { randomToken } from "../../services/crypto.js";
import { upsertCustomer } from "../../services/customers.js";
import { numerologyLookupSchema, numerologyLookupWithPhoneSchema, simLookupSchema } from "../schemas.js";

export const publicLookupRouter = Router();

/**
 * Kết quả trả qua link xem lại: báo cáo Thần số học dựng lại bản rút gọn từ thông tin đã nhập (bản lưu đầy đủ chỉ
 * dành cho quản trị); thiếu thông tin để dựng lại thì không trả lời luận.
 */
function publicLookupResult(report: { type: string; inputs?: unknown; result?: unknown; title?: string }): LookupResultPayload {
  const stored = (report.result ?? { headline: report.title ?? "", blocks: [] }) as LookupResultPayload;
  if (report.type !== "numerology") return stored;
  const inputs = (report.inputs ?? {}) as { name?: unknown; birthDate?: unknown; commonName?: unknown; referenceYear?: unknown };
  const parsed = numerologyLookupSchema.safeParse({
    name: inputs.name,
    birthDate: inputs.birthDate,
    commonName: typeof inputs.commonName === "string" && inputs.commonName ? inputs.commonName : undefined,
    referenceYear: typeof inputs.referenceYear === "number" ? inputs.referenceYear : undefined,
  });
  if (!parsed.success) return { headline: stored.headline, subhead: stored.subhead, blocks: [], disclaimer: stored.disclaimer };
  const { name, birthDate, referenceYear, commonName } = parsed.data;
  return numerologyWebPayload(calculateFullNumerologyReport(name, birthDate, referenceYear, commonName));
}

const clientComputedSchema = z.object({
  inputs: z.record(z.unknown()),
  summary: z.string().max(400).optional(),
  blocks: z.array(z.record(z.unknown())).max(40).optional(),
});

const bodySchema = z.object({
  inputs: z.record(z.unknown()).default({}),
  save: z.boolean().optional(),
  source: z.string().max(120).optional(),
  summary: z.string().max(600).optional(),
  blocks: z.array(z.record(z.unknown())).max(60).optional(),
});

const CLIENT_SIDE_TYPES: Record<string, true> = { batu: true, iching: true, "xem-ngay": true };

export const publicQuizRouter = Router();

publicQuizRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const key = req.params.key === "mbti" ? "mbti" : req.params.key === "disc" ? "disc" : null;
    if (!key) throw new AppError(404, "Bộ câu hỏi không tồn tại.", "not_found");
    res.json({ quiz: await loadPublicQuizSet(key) });
  }),
);

publicQuizRouter.post(
  "/:key/score",
  lookupLimiter,
  asyncHandler(async (req, res) => {
    const key = req.params.key === "mbti" ? "mbti" : req.params.key === "disc" ? "disc" : null;
    if (!key) throw new AppError(404, "Bộ câu hỏi không tồn tại.", "not_found");
    const parsed = bodySchema.parse(req.body);
    const answers = z.record(z.string().max(80)).parse(parsed.inputs.answers ?? parsed.inputs);
    const outcome = await scoreQuiz(key, answers);
    const member = currentMember(req);
    const report = await LookupReport.create({
      type: key,
      title: outcome.payload.headline,
      inputs: { answered: outcome.answered },
      result: outcome.payload,
      memberId: member?.id ?? null,
      source: parsed.source ?? `/${key}`,
    });
    res.json({ report: { id: String(report._id), type: key, ...outcome.payload } });
  }),
);

publicLookupRouter.post(
  "/:type",
  lookupLimiter,
  asyncHandler(async (req, res) => {
    const type = req.params.type as LookupType;
    if (!LOOKUP_LABELS[type]) throw new AppError(404, "Loại tra cứu không tồn tại.", "not_found");
    const body = bodySchema.parse(req.body);
    const member = currentMember(req);
    let payload: LookupResultPayload;
    /** Bản trả về trình duyệt khi khác bản lưu (Thần số học: chỉ 8 chỉ số chủ đạo, phần còn lại dẫn về Tải PDF). */
    let publicPayload: LookupResultPayload | null = null;
    let storedInputs: Record<string, unknown> = body.inputs;
    let customerId: string | null = null;

    if (type === "numerology") {
      const input = numerologyLookupWithPhoneSchema.parse(body.inputs);
      const report = calculateFullNumerologyReport(input.name, input.birthDate, input.referenceYear, input.commonName);
      // Lưu báo cáo đầy đủ cho quản trị; trang công khai chỉ nhận bản rút gọn.
      payload = numerologyPayload(report);
      publicPayload = numerologyWebPayload(report);
      // Số điện thoại lưu riêng ở hồ sơ khách hàng (không vào `inputs`, không dùng để tính chỉ số, không lộ qua link chia sẻ).
      if (input.phone) {
        const customer = await upsertCustomer({ name: report.displayName, birthDate: input.birthDate, phone: input.phone, source: "lookup" });
        customerId = customer._id;
      }
      storedInputs = {
        name: input.name,
        birthDate: input.birthDate,
        commonName: input.commonName ?? "",
        referenceYear: input.referenceYear ?? new Date().getFullYear(),
      };
    } else if (type === "sim") {
      const input = simLookupSchema.parse(body.inputs);
      const report = analyzeSim({
        phone: input.phone,
        birthDate: input.birthDate || undefined,
        birthTime: input.birthTime || undefined,
        gender: input.gender,
      });
      payload = simPayload(report);
      storedInputs = { phone: report.phone, birthDate: input.birthDate ?? "", gender: input.gender ?? "" };
    } else if (type === "disc" || type === "mbti") {
      const answers = z.record(z.string().max(80)).parse(body.inputs.answers ?? body.inputs);
      const outcome = await scoreQuiz(type, answers);
      payload = outcome.payload;
      storedInputs = { answered: outcome.answered };
    } else if (CLIENT_SIDE_TYPES[type]) {
      const parsed = clientComputedSchema.parse({ inputs: body.inputs, summary: body.summary, blocks: body.blocks });
      payload = {
        headline: parsed.summary || LOOKUP_LABELS[type],
        blocks: (parsed.blocks ?? []) as ResultBlock[],
      };
      storedInputs = parsed.inputs;
    } else {
      throw new AppError(422, "Loại tra cứu chưa được hỗ trợ.", "unsupported_lookup");
    }

    const shareToken = body.save ? randomToken() : "";
    const report = await LookupReport.create({
      type,
      title: payload.headline,
      inputs: storedInputs,
      result: payload,
      memberId: member?.id ?? null,
      customerId,
      source: body.source ?? "",
      shareToken,
      shareExpiresAt: shareToken ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : null,
    });

    res.json({
      report: {
        id: String(report._id),
        type,
        shareToken: shareToken || undefined,
        ...(publicPayload ?? payload),
      },
    });
  }),
);

publicLookupRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const token = String(req.query.token ?? "");
    const report = await LookupReport.findById(req.params.id).lean();
    if (!report) throw new AppError(404, "Không tìm thấy kết quả tra cứu.", "not_found");
    const member = currentMember(req);
    const isOwner = member && report.memberId && String(report.memberId) === member.id;
    const shareValid = report.shareToken && report.shareToken === token && report.shareExpiresAt && report.shareExpiresAt > new Date();
    if (!isOwner && !shareValid) throw new AppError(403, "Bạn không có quyền xem kết quả này.", "forbidden");
    // Hồ sơ khách hàng (kèm số điện thoại) chỉ dành cho quản trị, không trả qua link công khai.
    const { customerId: _customerId, ...publicReport } = report;
    void _customerId;
    res.json({ report: { ...publicReport, result: publicLookupResult(report) } });
  }),
);
