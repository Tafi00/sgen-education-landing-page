import { Router, type Request } from "express";
import { z } from "zod";
import { ebookCodeState, formatEbookCode, isCoursePlan } from "../../../../shared/ebook.js";
import { lessonVideoFromUrl } from "../../../../shared/course-video.js";
import { env } from "../../env.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { Course, CourseLesson, type CourseLessonDoc, type EbookCodeDoc } from "../../models/index.js";
import { findEbookCode, loadEbookCode, recordStudentCodeUse } from "../../services/ebookCodes.js";

/**
 * Học video theo mã (`/khoa-hoc/<slug>/hoc`): quản trị cấp mã khóa học (tiền tố KH), học viên nhập mã một lần là xem được
 * các bài của đúng khóa đó. Nguồn video chỉ trả cho người có quyền; bài "học thử" xem được không cần mã. File tải lên nằm
 * ngoài thư mục public và kiểm tra quyền ở mỗi lần phát, nên khoá mã hoặc mã hết hạn là mất quyền ngay.
 */
export const publicCourseLearnRouter = Router();

const redeemSchema = z.object({ code: z.string().trim().min(1, "Vui lòng nhập mã khóa học.").max(60) });
const VIDEO_FILE = /^[0-9a-f]{32}\.(mp4|m4v|webm|mov)$/;

function publicAccess(doc: EbookCodeDoc) {
  return { display: formatEbookCode(doc.code, doc.suffix), expiresAt: doc.expiresAt };
}

/** Mã còn hiệu lực trong phiên mở khóa này; mã đã bị khoá / hết hạn thì tự rời khỏi phiên. */
async function courseAccess(req: Request, slug: string) {
  const ids = req.session?.courseCodeIds ?? [];
  if (!ids.length) return null;
  const docs = await Promise.all(ids.map((id) => loadEbookCode(id)));
  const usable = docs.filter((doc): doc is EbookCodeDoc => Boolean(doc && isCoursePlan(doc.plan) && ebookCodeState(doc) === "active"));
  if (usable.length !== ids.length) req.session.courseCodeIds = usable.map((doc) => doc._id as string);
  return usable.find((doc) => doc.courseSlug === slug) ?? null;
}

function lessonSource(lesson: CourseLessonDoc) {
  if (lesson.videoFile) return { type: "video" as const, url: `/api/khoa-hoc/video/${lesson._id}` };
  return lesson.videoUrl ? lessonVideoFromUrl(lesson.videoUrl) : null;
}

async function loadCourse(slug: string) {
  const course = await Course.findOne({ slug, status: "published" }).lean<{ slug: string; title: string }>();
  if (!course) throw new AppError(404, "Không tìm thấy khóa học.", "not_found");
  return course;
}

publicCourseLearnRouter.get(
  "/:slug/hoc",
  asyncHandler(async (req, res) => {
    const course = await loadCourse(req.params.slug);
    const access = await courseAccess(req, course.slug);
    const lessons = await CourseLesson.find({ courseSlug: course.slug, status: "published" }).sort({ order: 1, createdAt: 1 }).lean<CourseLessonDoc[]>();
    res.json({
      course: { slug: course.slug, title: course.title },
      access: access ? publicAccess(access) : null,
      lessons: lessons.map((lesson) => {
        const open = Boolean(access) || lesson.isPreview;
        return {
          _id: lesson._id,
          section: lesson.section,
          title: lesson.title,
          description: lesson.description,
          kind: lesson.kind,
          durationSeconds: lesson.durationSeconds,
          isPreview: lesson.isPreview,
          locked: !open,
          source: open ? lessonSource(lesson) : null,
        };
      }),
    });
  }),
);

publicCourseLearnRouter.post(
  "/:slug/redeem",
  authLimiter,
  asyncHandler(async (req, res) => {
    const course = await loadCourse(req.params.slug);
    const { code } = redeemSchema.parse(req.body);
    const doc = await findEbookCode(code);
    if (!doc) throw new AppError(404, "Mã không đúng. Vui lòng kiểm tra lại từng ký tự.", "code_not_found");
    if (!isCoursePlan(doc.plan)) throw new AppError(422, "Đây không phải mã khóa học. Vui lòng nhập mã bắt đầu bằng KH mà SGEN đã cấp.", "not_course_code");
    if (doc.courseSlug !== course.slug) throw new AppError(422, "Mã này dành cho khóa học khác. Vui lòng kiểm tra lại khóa bạn đăng ký.", "other_course");
    const state = ebookCodeState(doc);
    if (state === "disabled") throw new AppError(403, "Mã này đã bị khoá. Vui lòng liên hệ SGEN để được hỗ trợ.", "code_disabled");
    if (state === "expired") throw new AppError(403, "Mã này đã hết hạn. Vui lòng liên hệ SGEN để được gia hạn.", "code_expired");
    const id = doc._id as string;
    req.session.courseCodeIds = [...new Set([...(req.session.courseCodeIds ?? []), id])];
    await recordStudentCodeUse(id);
    res.json({ access: publicAccess(doc) });
  }),
);

publicCourseLearnRouter.post(
  "/:slug/logout",
  asyncHandler(async (req, res) => {
    const access = await courseAccess(req, req.params.slug);
    if (access) req.session.courseCodeIds = (req.session.courseCodeIds ?? []).filter((id) => id !== access._id);
    res.json({ ok: true });
  }),
);

/** Phát file video (có Range để tua); kiểm tra quyền ở mỗi yêu cầu. Quản trị đang đăng nhập xem được để kiểm tra. */
publicCourseLearnRouter.get(
  "/video/:id",
  asyncHandler(async (req, res) => {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw new AppError(404, "Không tìm thấy bài giảng.", "not_found");
    const lesson = await CourseLesson.findById(req.params.id).lean<CourseLessonDoc>();
    const isAdmin = Boolean(req.session?.adminId);
    if (!lesson || !VIDEO_FILE.test(lesson.videoFile) || (lesson.status !== "published" && !isAdmin)) throw new AppError(404, "Không tìm thấy bài giảng.", "not_found");
    if (!isAdmin && !lesson.isPreview && !(await courseAccess(req, lesson.courseSlug))) {
      throw new AppError(403, "Bài giảng này dành cho học viên đã nhập mã khóa học.", "course_code_required");
    }
    res.sendFile(lesson.videoFile, { root: env.courseVideoDir, headers: { "Cache-Control": "private, no-transform", "X-Robots-Tag": "noindex" } }, (error) => {
      if (error && !res.headersSent) res.status(404).json({ error: { code: "not_found", message: "Không tìm thấy file video." } });
    });
  }),
);
