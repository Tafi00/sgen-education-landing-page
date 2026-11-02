import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import express, { Router } from "express";
import { z } from "zod";
import { lessonVideoFromUrl } from "../../../../shared/course-video.js";
import { env } from "../../env.js";
import { requireAdmin } from "../../middleware/auth.js";
import { asyncHandler, AppError, parseBody } from "../../middleware/errors.js";
import { AuditLog, Course, CourseLesson, type CourseLessonDoc } from "../../models/index.js";

/**
 * Quản trị bài giảng video của khóa học. File video tải lên theo từng phần nhỏ (8 MB) rồi ghép lại, để bài 10–15 phút
 * (vài trăm MB) không vướng giới hạn dung lượng một yêu cầu của proxy và mạng yếu không làm hỏng cả lượt tải.
 */
export const adminCourseLessonRouter = Router();

adminCourseLessonRouter.use(requireAdmin("admin"));

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UPLOAD_ID = /^[0-9a-f]{32}$/;
const MAX_VIDEO_BYTES = 4 * 1024 * 1024 * 1024;
const STALE_PART_MS = 24 * 60 * 60 * 1000;
const VIDEO_EXTENSIONS = new Set([".mp4", ".m4v", ".mov", ".webm"]);

const videoUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || lessonVideoFromUrl(value), "Chỉ nhận link https của YouTube, Vimeo, Bunny Stream hoặc file .mp4 / .webm.");

const lessonFields = {
  section: z.string().trim().max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  kind: z.enum(["lecture", "discussion"]).optional(),
  videoFile: z.string().regex(/^[0-9a-f]{32}\.(mp4|m4v|webm|mov)$/).or(z.literal("")).optional(),
  videoUrl: videoUrl.optional(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  isPreview: z.boolean().optional(),
  status: z.enum(["published", "draft"]).optional(),
};

const createSchema = z.object({ courseSlug: z.string().min(1).max(160), title: z.string().trim().min(2, "Vui lòng nhập tên bài.").max(200), ...lessonFields });
const updateSchema = z.object({ title: z.string().trim().min(2, "Vui lòng nhập tên bài.").max(200).optional(), ...lessonFields });
const reorderSchema = z.object({ ids: z.array(z.string().regex(ID_PATTERN)).min(1).max(500) });
const finishSchema = z.object({ filename: z.string().min(1).max(300) });

async function audit(req: { session: { adminId?: string; adminEmail?: string } }, action: string, documentId: string, diff: Record<string, unknown>) {
  await AuditLog.create({ actorId: req.session.adminId, actorEmail: req.session.adminEmail ?? "", action, collectionName: "course_lessons", documentId, diff });
}

async function removeVideoFile(name: string) {
  if (name) await fs.rm(path.join(env.courseVideoDir, path.basename(name)), { force: true });
}

const partPath = (uploadId: string) => path.join(env.courseVideoDir, `${uploadId}.part`);

function checkUploadId(id: string) {
  if (!UPLOAD_ID.test(id)) throw new AppError(400, "Mã lượt tải không hợp lệ.", "invalid_upload");
}

/** Dọn các lượt tải dở quá một ngày (tab bị đóng giữa chừng). */
async function sweepStaleParts() {
  const names = await fs.readdir(env.courseVideoDir).catch(() => [] as string[]);
  await Promise.all(
    names
      .filter((name) => name.endsWith(".part"))
      .map(async (name) => {
        const file = path.join(env.courseVideoDir, name);
        const stat = await fs.stat(file).catch(() => null);
        if (stat && Date.now() - stat.mtimeMs > STALE_PART_MS) await fs.rm(file, { force: true });
      }),
  );
}

/** Kiểm tra đầu file đúng là MP4/MOV (`ftyp` ở byte 4, hoặc `moov`/`mdat`/`wide` với MOV cũ) hoặc WebM (EBML). */
async function looksLikeVideo(file: string) {
  const handle = await fs.open(file, "r");
  try {
    const { buffer } = await handle.read(Buffer.alloc(12), 0, 12, 0);
    const box = buffer.toString("latin1", 4, 8);
    return ["ftyp", "moov", "mdat", "wide", "free", "skip"].includes(box) || buffer.readUInt32BE(0) === 0x1a45dfa3;
  } finally {
    await handle.close();
  }
}

adminCourseLessonRouter.post(
  "/uploads",
  asyncHandler(async (_req, res) => {
    await fs.mkdir(env.courseVideoDir, { recursive: true });
    await sweepStaleParts();
    const uploadId = crypto.randomBytes(16).toString("hex");
    await fs.writeFile(partPath(uploadId), "");
    res.status(201).json({ uploadId });
  }),
);

/** Nhận một phần tại vị trí `offset`; gửi lại phần đã nhận (mạng chập chờn) thì bỏ qua, không ghi trùng. */
adminCourseLessonRouter.post(
  "/uploads/:uploadId/chunk",
  express.raw({ type: "application/octet-stream", limit: "12mb" }),
  asyncHandler(async (req, res) => {
    checkUploadId(req.params.uploadId);
    const offset = Number(req.query.offset);
    if (!Number.isInteger(offset) || offset < 0 || !Buffer.isBuffer(req.body)) throw new AppError(422, "Dữ liệu tải lên không hợp lệ.", "invalid_chunk");
    const file = partPath(req.params.uploadId);
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) throw new AppError(404, "Lượt tải đã hết hạn, vui lòng tải lại file.", "upload_not_found");
    if (offset + req.body.length > MAX_VIDEO_BYTES) throw new AppError(413, "Video vượt quá 4 GB, vui lòng cắt nhỏ trước khi tải lên.", "video_too_large");
    if (offset === stat.size) await fs.appendFile(file, req.body);
    else if (offset + req.body.length !== stat.size) throw new AppError(409, "Lệch vị trí tải lên, vui lòng tải lại file.", "upload_offset");
    res.json({ received: Math.max(stat.size, offset + req.body.length) });
  }),
);

adminCourseLessonRouter.post(
  "/uploads/:uploadId/finish",
  asyncHandler(async (req, res) => {
    checkUploadId(req.params.uploadId);
    const { filename } = parseBody(finishSchema, req.body);
    const extension = path.extname(filename).toLowerCase();
    const file = partPath(req.params.uploadId);
    const fail = async (message: string) => {
      await fs.rm(file, { force: true });
      throw new AppError(422, message, "unsupported_video");
    };
    if (!VIDEO_EXTENSIONS.has(extension)) await fail("Chỉ nhận video MP4, M4V, MOV hoặc WebM.");
    const stat = await fs.stat(file).catch(() => null);
    if (!stat?.size) throw new AppError(404, "Lượt tải đã hết hạn, vui lòng tải lại file.", "upload_not_found");
    if (!(await looksLikeVideo(file))) await fail("File này không phải video hợp lệ.");
    const videoFile = `${req.params.uploadId}${extension}`;
    await fs.rename(file, path.join(env.courseVideoDir, videoFile));
    res.json({ videoFile, size: stat.size });
  }),
);

/** Huỷ lượt tải dở, hoặc xoá file vừa tải nhưng chưa gắn được vào bài. */
adminCourseLessonRouter.delete(
  "/uploads/:uploadId",
  asyncHandler(async (req, res) => {
    checkUploadId(req.params.uploadId);
    await fs.rm(partPath(req.params.uploadId), { force: true });
    res.json({ ok: true });
  }),
);

adminCourseLessonRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const course = String(req.query.course ?? "");
    if (!course) throw new AppError(422, "Vui lòng chọn khóa học.", "course_required");
    const items = await CourseLesson.find({ courseSlug: course }).sort({ order: 1, createdAt: 1 }).limit(1000).lean();
    res.json({ items });
  }),
);

adminCourseLessonRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = parseBody(createSchema, req.body);
    if (!input.videoFile && !input.videoUrl) throw new AppError(422, "Bài giảng cần có file video hoặc link video.", "video_required");
    if (!(await Course.findOne({ slug: input.courseSlug }))) throw new AppError(422, "Không tìm thấy khóa học.", "course_required");
    const last = await CourseLesson.findOne({ courseSlug: input.courseSlug }, { sort: { order: -1 } }).lean<CourseLessonDoc>();
    const doc = await CourseLesson.create({ ...input, order: (last?.order ?? 0) + 1 });
    await audit(req, "lesson.create", String(doc._id), { course: input.courseSlug, title: input.title });
    res.status(201).json({ item: doc.toObject() });
  }),
);

adminCourseLessonRouter.post(
  "/reorder",
  asyncHandler(async (req, res) => {
    const { ids } = parseBody(reorderSchema, req.body);
    await Promise.all(ids.map((id, index) => CourseLesson.updateOne({ _id: id }, { order: index + 1 })));
    res.json({ ok: true });
  }),
);

adminCourseLessonRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
    const input = parseBody(updateSchema, req.body);
    const doc = await CourseLesson.findById(req.params.id).lean<CourseLessonDoc>();
    if (!doc) throw new AppError(404, "Không tìm thấy bài giảng.", "not_found");
    const nextFile = input.videoFile ?? doc.videoFile;
    const nextUrl = input.videoUrl ?? doc.videoUrl;
    if (!nextFile && !nextUrl) throw new AppError(422, "Bài giảng cần có file video hoặc link video.", "video_required");
    await CourseLesson.updateOne({ _id: req.params.id }, input);
    if (input.videoFile !== undefined && input.videoFile !== doc.videoFile) await removeVideoFile(doc.videoFile);
    await audit(req, "lesson.update", req.params.id, input);
    res.json({ item: { ...doc, ...input } });
  }),
);

adminCourseLessonRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
    const doc = await CourseLesson.findByIdAndDelete(req.params.id);
    if (!doc) throw new AppError(404, "Không tìm thấy bài giảng.", "not_found");
    await removeVideoFile(doc.videoFile);
    await audit(req, "lesson.delete", req.params.id, { course: doc.courseSlug, title: doc.title });
    res.json({ ok: true });
  }),
);
