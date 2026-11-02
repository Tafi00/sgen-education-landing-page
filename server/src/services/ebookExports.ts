import crypto from "node:crypto";
import { EBOOK_EDITION_LABEL, EBOOK_LINK_DAYS, type EbookEdition } from "../../../shared/ebook.js";
import { calculateFullNumerologyReport } from "../../../shared/numerology.js";
import { EbookExport, type EbookExportDoc } from "../models/index.js";
import { buildEbookPdf } from "./ebookPdf.js";

/**
 * Lượt xuất ebook không lưu file: PDF luôn dựng lại từ mẫu theo họ tên, ngày sinh, số điện thoại đã lưu trong lịch sử xuất.
 * Nhờ vậy khách tải lại, hoặc quản trị lấy lại file gửi cho khách, đều không trừ thêm lượt của mã.
 */

export function newDownloadLink() {
  return {
    downloadToken: crypto.randomBytes(24).toString("base64url"),
    downloadExpiresAt: new Date(Date.now() + EBOOK_LINK_DAYS * 24 * 60 * 60 * 1000),
  };
}

export function downloadLinkActive(doc: Pick<EbookExportDoc, "downloadToken" | "downloadExpiresAt">) {
  return Boolean(doc.downloadToken && doc.downloadExpiresAt && new Date(doc.downloadExpiresAt).getTime() > Date.now());
}

/** Tên file không dấu, vì tên có dấu dễ lỗi trên trình duyệt trong ứng dụng và trình quản lý tệp của điện thoại. */
export function ebookFilename(edition: EbookEdition, name: string) {
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ket-qua";
  return `ebook-than-so-hoc-${edition === "demo" ? "demo-3-chi-so" : "day-du"}-${slug}.pdf`;
}

/** Dựng lại đúng file đã xuất; "Năm cá nhân" theo năm của lần xuất để file không đổi khi tải lại sang năm sau. */
export async function rebuildExportPdf(doc: EbookExportDoc) {
  const report = calculateFullNumerologyReport(doc.customerName, doc.birthDate, new Date(doc.createdAt).getFullYear());
  return buildEbookPdf(doc.edition, report, { phone: doc.customerPhone });
}

/** Thông tin một lượt xuất trả cho người tải (không có số điện thoại, IP). */
export function publicExportInfo(doc: EbookExportDoc) {
  return {
    token: doc.downloadToken,
    filename: ebookFilename(doc.edition, doc.customerName),
    customerName: doc.customerName,
    birthDate: doc.birthDate,
    edition: doc.edition,
    editionLabel: EBOOK_EDITION_LABEL[doc.edition] ?? doc.edition,
    createdAt: doc.createdAt,
    expiresAt: doc.downloadExpiresAt,
  };
}

/** Link còn hạn thì giữ nguyên (link đã gửi cho khách vẫn dùng được); lượt xuất cũ hoặc link hết hạn thì cấp link mới. */
export async function ensureDownloadLink(id: string) {
  const doc = await EbookExport.findById(id).lean<EbookExportDoc>();
  if (!doc) return null;
  if (downloadLinkActive(doc)) return doc;
  const link = newDownloadLink();
  await EbookExport.updateOne({ _id: id }, link);
  return { ...doc, ...link };
}
