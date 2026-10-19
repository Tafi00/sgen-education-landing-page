import crypto from "node:crypto";
import {
  EBOOK_CODE_ALPHABET,
  EBOOK_EDITION_LABEL,
  EBOOK_PLANS,
  ebookCodeState,
  formatEbookCode,
  normalizeEbookCode,
  type EbookPlanKey,
} from "../../../shared/ebook.js";
import { query } from "../db/pool.js";
import { EbookCode, type EbookCodeDoc } from "../models/index.js";

/** Phần ngẫu nhiên 8 ký tự (~40 bit) lấy từ nguồn ngẫu nhiên mật mã. */
function randomBody() {
  let body = "";
  for (let i = 0; i < 8; i += 1) body += EBOOK_CODE_ALPHABET[crypto.randomInt(EBOOK_CODE_ALPHABET.length)];
  return body;
}

export type GenerateInput = {
  plan: EbookPlanKey;
  count: number;
  holderName?: string;
  holderContact?: string;
  note?: string;
  /** Số ngày hiệu lực kể từ lúc tạo; bỏ trống = không hết hạn. */
  expiresInDays?: number;
  createdBy?: string | null;
};

/** Tạo `count` mã cùng gói; trả về các bản ghi vừa tạo theo thứ tự. */
export async function generateEbookCodes(input: GenerateInput): Promise<EbookCodeDoc[]> {
  const plan = EBOOK_PLANS[input.plan];
  const batchId = crypto.randomBytes(5).toString("hex");
  const expiresAt = input.expiresInDays && input.expiresInDays > 0 ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000) : null;
  const created: EbookCodeDoc[] = [];

  for (let index = 0; index < input.count; index += 1) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = `${plan.prefix}${randomBody()}`;
      try {
        const doc = await EbookCode.create({
          code,
          plan: plan.key,
          edition: plan.edition,
          quota: plan.quota,
          used: 0,
          status: "active",
          holderName: input.holderName ?? "",
          holderContact: input.holderContact ?? "",
          note: input.note ?? "",
          batchId,
          expiresAt,
          createdBy: input.createdBy ?? null,
        });
        created.push(doc.toObject() as EbookCodeDoc);
        break;
      } catch (error) {
        const pgCode = typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "";
        if (pgCode !== "23505" || attempt === 5) throw error;
      }
    }
  }
  return created;
}

/** Tìm mã theo chuỗi người dùng nhập (không phân biệt hoa thường, dấu gạch, khoảng trắng). */
export async function findEbookCode(raw: string) {
  const code = normalizeEbookCode(raw);
  if (code.length < 10) return null;
  return EbookCode.findOne({ code }).lean<EbookCodeDoc>();
}

export async function loadEbookCode(id: string) {
  return EbookCode.findById(id).lean<EbookCodeDoc>();
}

/** Thông tin an toàn trả cho người dùng cuối (không lộ ghi chú nội bộ, tên người nhận). */
export function publicEbookInfo(doc: EbookCodeDoc) {
  const plan = EBOOK_PLANS[doc.plan as EbookPlanKey];
  const state = ebookCodeState(doc);
  return {
    code: doc.code,
    display: formatEbookCode(doc.code),
    plan: doc.plan,
    planLabel: plan?.label ?? doc.plan,
    edition: doc.edition,
    editionLabel: EBOOK_EDITION_LABEL[doc.edition] ?? doc.edition,
    quota: doc.quota,
    used: doc.used,
    remaining: Math.max(0, doc.quota - doc.used),
    state,
    expiresAt: doc.expiresAt,
  };
}

/** Trừ 1 lượt một cách nguyên tử; trả null nếu mã đã hết lượt / hết hạn / bị khoá. */
export async function consumeEbookCredit(id: string): Promise<EbookCodeDoc | null> {
  const result = await query<EbookCodeDoc>(
    `UPDATE "ebook_codes"
        SET "used" = "used" + 1, "lastUsedAt" = now(), "updatedAt" = now()
      WHERE "_id" = $1
        AND "status" = 'active'
        AND "used" < "quota"
        AND ("expiresAt" IS NULL OR "expiresAt" > now())
      RETURNING *`,
    [id],
  );
  return result.rows[0] ?? null;
}

/** Hoàn lại 1 lượt khi tạo file thất bại (người dùng không bị mất lượt oan). */
export async function refundEbookCredit(id: string) {
  await query(`UPDATE "ebook_codes" SET "used" = GREATEST("used" - 1, 0), "updatedAt" = now() WHERE "_id" = $1`, [id]);
}
