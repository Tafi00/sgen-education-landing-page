import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ExternalLink, Info, KeyRound, Link2, Loader2, Pencil, Play, Scissors, Sparkles, Trash2, Upload, Video, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../api/client";
import { isDiscussionTitle, lessonTitleFromFilename, readVideoDuration, uploadCourseVideo } from "../../admin/courseVideoUpload";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import { formatChapterText, formatClock, formatLessonDuration, lessonVideoFromUrl, parseChapterText, parseClock, youtubeClip, type Chapter } from "../../../shared/course-video";

type Lesson = {
  _id: string;
  courseSlug: string;
  section: string;
  title: string;
  description: string;
  kind: "lecture" | "discussion";
  videoFile: string;
  videoUrl: string;
  durationSeconds: number;
  startSeconds?: number;
  endSeconds?: number;
  isPreview: boolean;
  order: number;
  status: "published" | "draft";
};

type SplitJob = { state: "running" | "done" | "error"; step: string; startedAt: string; finishedAt?: string; chapters?: Chapter[]; error?: string };
type SplitInfo = { job: SplitJob | null; range: { from: number; to: number }; transcriptDuration: number; hasTranscript: boolean };

/** Bài là file tải lên hoặc link YouTube thì chia được thành nhiều đoạn (mỗi đoạn phát một khoảng của cùng video). */
const canSplit = (lesson: Lesson) => Boolean(lesson.videoFile || youtubeClip(lesson.videoUrl));

/** Khoảng phát của bài, để ghi cạnh tên: "0:10:22 – 0:18:47". */
function clipLabel(lesson: Lesson) {
  const clip = lesson.videoFile ? { start: lesson.startSeconds ?? 0, end: lesson.endSeconds ?? 0 } : youtubeClip(lesson.videoUrl);
  if (!clip || (!clip.start && !clip.end)) return "";
  return `${formatClock(clip.start)} – ${clip.end ? formatClock(clip.end) : "hết"}`;
}

type UploadItem = { name: string; progress: number; state: "waiting" | "uploading" | "done" | "error"; error?: string };

/** Khóa mẫu khách chọn làm trước (17 video, lên trước 5 video phần cơ bản). */
const DEFAULT_COURSE = "than-so-hoc-can-ban";
const KIND_LABEL: Record<Lesson["kind"], string> = { lecture: "Bài giảng", discussion: "Thảo luận" };

export function CourseLessonsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pickedCourse, setCourse] = useState(DEFAULT_COURSE);
  const [section, setSection] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [splitting, setSplitting] = useState<Lesson | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Lesson | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const coursesQuery = useQuery({
    queryKey: ["admin", "courses", "options"],
    queryFn: () => api.get<{ items: { slug: string; title: string }[] }>("/api/admin/courses", { query: { pageSize: 100, sort: "order", dir: "asc" } }),
  });
  // Quản trị có thể đổi đường dẫn khóa: khóa đang chọn không còn trong danh sách thì dùng khóa đầu tiên, khớp với ô chọn.
  const courseOptions = coursesQuery.data?.items ?? [];
  const course = courseOptions.length && !courseOptions.some((item) => item.slug === pickedCourse) ? courseOptions[0].slug : pickedCourse;
  const lessonsQuery = useQuery({
    queryKey: ["admin", "course-lessons", course],
    queryFn: () => api.get<{ items: Lesson[] }>("/api/admin/course-lessons", { query: { course } }),
  });
  const lessons = lessonsQuery.data?.items ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "course-lessons", course] });

  const patchUpload = (index: number, patch: Partial<UploadItem>) => setUploads((current) => current.map((item, position) => (position === index ? { ...item, ...patch } : item)));

  const onPickFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    // Sắp theo tên để các đoạn đánh số 01, 02… vào đúng thứ tự, kể cả khi hệ điều hành trả về lộn xộn.
    const files = [...(event.target.files ?? [])].sort((left, right) => left.name.localeCompare(right.name, "vi", { numeric: true }));
    event.target.value = "";
    if (!files.length) return;
    setUploads(files.map((file) => ({ name: file.name, progress: 0, state: "waiting" })));
    setUploading(true);
    let done = 0;
    for (const [index, file] of files.entries()) {
      patchUpload(index, { state: "uploading" });
      try {
        const durationSeconds = await readVideoDuration(file);
        const { videoFile } = await uploadCourseVideo(file, (progress) => patchUpload(index, { progress }));
        const title = lessonTitleFromFilename(file.name);
        await api.post("/api/admin/course-lessons", { courseSlug: course, title: title.slice(0, 200), section: section.trim(), kind: isDiscussionTitle(title) ? "discussion" : "lecture", videoFile, durationSeconds });
        patchUpload(index, { state: "done", progress: 1 });
        done += 1;
        await refresh();
      } catch (error) {
        patchUpload(index, { state: "error", error: errorMessage(error) });
      }
    }
    setUploading(false);
    if (done === files.length) toast.success("Đã tải lên", `${done} bài giảng đã có trên trang học.`);
    else toast.error("Có file chưa tải được", `Đã tải ${done}/${files.length} file. Xem lỗi ở từng dòng rồi tải lại file đó.`);
  };

  const addLink = useMutation({
    mutationFn: () => api.post("/api/admin/course-lessons", { courseSlug: course, title: linkTitle.trim(), section: section.trim(), kind: isDiscussionTitle(linkTitle) ? "discussion" : "lecture", videoUrl: linkUrl.trim() }),
    onSuccess: async () => {
      setLinkTitle("");
      setLinkUrl("");
      setLinkError("");
      toast.success("Đã thêm bài giảng", "Bài giảng đã có trên trang học.");
      await refresh();
    },
    onError: (error) => setLinkError(errorMessage(error)),
  });

  const submitLink = (event: FormEvent) => {
    event.preventDefault();
    if (linkTitle.trim().length < 2) return setLinkError("Vui lòng nhập tên bài.");
    if (!lessonVideoFromUrl(linkUrl)) return setLinkError("Chỉ nhận link https của YouTube, Vimeo, Bunny Stream hoặc file .mp4 / .webm.");
    setLinkError("");
    addLink.mutate();
  };

  const reorder = useMutation({
    mutationFn: (ids: string[]) => api.post("/api/admin/course-lessons/reorder", { ids }),
    onSuccess: refresh,
    onError: (error) => toast.error("Không đổi được thứ tự", errorMessage(error)),
  });

  const move = (index: number, delta: number) => {
    const ids = lessons.map((lesson) => lesson._id);
    const [picked] = ids.splice(index, 1);
    ids.splice(index + delta, 0, picked);
    reorder.mutate(ids);
  };

  const remove = useMutation({
    mutationFn: (lesson: Lesson) => api.del(`/api/admin/course-lessons/${lesson._id}`),
    onSuccess: async () => {
      setPendingDelete(null);
      toast.success("Đã xoá bài giảng", "Bài giảng và file video đã được xoá.");
      await refresh();
    },
    onError: (error) => {
      setPendingDelete(null);
      toast.error("Không xoá được", errorMessage(error));
    },
  });

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Bài giảng video</h1>
          <p>Mỗi khóa gồm các đoạn video ngắn 10–15 phút theo từng nội dung; phần thảo luận tách thành bài riêng. Học viên nhập mã khóa học để xem tại nhà.</p>
        </div>
        <div className="admin-page__actions">
          <Link className="btn btn--secondary" to="/admin/ma-ebook">
            <KeyRound aria-hidden="true" /> Cấp mã khóa học
          </Link>
          <a className="btn btn--secondary" href={`/khoa-hoc/${encodeURIComponent(course)}/hoc`} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" /> Xem trang học
          </a>
        </div>
      </header>

      <div className="admin-banner admin-banner--info">
        <Info aria-hidden="true" />
        Chọn được nhiều file cùng lúc; tên bài lấy theo tên file, thứ tự theo số đầu tên file (VD: “03 - Bốn nhóm số.mp4”). Nên dùng MP4 (H.264). File tải lên không public: chỉ phát cho người đã nhập đúng mã khóa học.
        Tải cả buổi học dài lên cũng được: bấm nút kéo cắt <Scissors aria-hidden="true" style={{ width: 14, height: 14, verticalAlign: "-2px" }} /> ở bài đó để tự tách thành các đoạn 10–15 phút theo nội dung.
      </div>

      <div className="admin-card">
        <div className="admin-form__grid">
          <div className="field">
            <label className="field__label" htmlFor="lesson-course">Khóa học</label>
            <span className="field__control">
              <select id="lesson-course" value={course} disabled={uploading} onChange={(event) => setCourse(event.target.value)}>
                {(courseOptions.length ? courseOptions : [{ slug: DEFAULT_COURSE, title: "Thần số học" }]).map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="lesson-section">Thuộc phần (không bắt buộc)</label>
            <span className="field__control">
              <input id="lesson-section" value={section} maxLength={160} placeholder="Ví dụ: Video 1 — Tổng quan Thần số học" onChange={(event) => setSection(event.target.value)} />
            </span>
            <p className="field__hint">Áp dụng cho các bài sắp thêm; các bài cùng phần hiện thành một nhóm.</p>
          </div>
        </div>

        <div className="lesson-add">
          <div>
            <h2>Tải file video lên</h2>
            <input ref={fileInput} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.m4v,.mov,.webm" multiple hidden onChange={(event) => void onPickFiles(event)} />
            <button type="button" className="btn btn--primary" disabled={uploading} onClick={() => fileInput.current?.click()}>
              {uploading ? <Loader2 className="spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
              {uploading ? "Đang tải lên, giữ nguyên trang này…" : "Chọn file video"}
            </button>
            {uploads.length ? (
              <ul className="lesson-uploads">
                {uploads.map((item) => (
                  <li key={item.name} className={`is-${item.state}`}>
                    <span>{item.name}</span>
                    {item.state === "error" ? (
                      <small role="alert">{item.error}</small>
                    ) : (
                      <small>{item.state === "done" ? "Xong" : item.state === "waiting" ? "Đang chờ" : `${Math.round(item.progress * 100)}%`}</small>
                    )}
                    <i aria-hidden="true">
                      <b style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </i>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <form onSubmit={submitLink} noValidate>
            <h2>Hoặc dán link video</h2>
            <div className="field">
              <label className="field__label" htmlFor="lesson-link-title">Tên bài</label>
              <span className="field__control">
                <input id="lesson-link-title" value={linkTitle} maxLength={200} onChange={(event) => setLinkTitle(event.target.value)} />
              </span>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lesson-link-url">Link YouTube, Vimeo, Bunny Stream hoặc file .mp4</label>
              <span className="field__control">
                <input id="lesson-link-url" value={linkUrl} maxLength={500} placeholder="https://…" onChange={(event) => setLinkUrl(event.target.value)} />
              </span>
              <p className="field__hint">Chỉ phát một đoạn của video YouTube: thêm số giây vào cuối link, VD <code>&amp;start=600&amp;end=1380</code>.</p>
            </div>
            {linkError ? (
              <p className="admin-error" role="alert">
                <AlertTriangle aria-hidden="true" /> {linkError}
              </p>
            ) : null}
            <button type="submit" className="btn btn--secondary" disabled={addLink.isPending}>
              <Link2 aria-hidden="true" /> Thêm bài từ link
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <h2>Danh sách bài ({lessons.length})</h2>
        {lessonsQuery.isLoading ? (
          <p className="muted">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải…
          </p>
        ) : lessonsQuery.isError ? (
          <p className="admin-error">
            <AlertTriangle aria-hidden="true" /> {errorMessage(lessonsQuery.error)}
          </p>
        ) : lessons.length === 0 ? (
          <p className="muted">
            <Video aria-hidden="true" style={{ width: 16, height: 16, verticalAlign: "-3px" }} /> Khóa này chưa có bài giảng nào. Trang khóa học chỉ hiện nút “Vào học online” khi đã có bài.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên bài</th>
                  <th>Loại</th>
                  <th>Thời lượng</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, index) => (
                  <tr key={lesson._id}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="relation-cell">
                        <span className="relation-cell__label">{lesson.title}</span>
                        <span className="relation-cell__sub">{[lesson.section, lesson.videoFile ? "File tải lên" : "Link ngoài", clipLabel(lesson)].filter(Boolean).join(" · ")}</span>
                      </span>
                    </td>
                    <td>{KIND_LABEL[lesson.kind]}</td>
                    <td>{formatLessonDuration(lesson.durationSeconds) || "—"}</td>
                    <td>
                      <span className={`status-badge status-badge--${lesson.status === "published" ? "active" : "pending"}`}>{lesson.status === "published" ? "Đang hiện" : "Bản nháp"}</span>
                      {lesson.isPreview ? <small className="muted"> · Học thử</small> : null}
                    </td>
                    <td className="data-table__actions">
                      <div className="data-table__actions-inner">
                        <button type="button" className="table-action" title="Đưa lên" aria-label="Đưa lên" disabled={index === 0 || reorder.isPending} onClick={() => move(index, -1)}>
                          <ArrowUp aria-hidden="true" />
                        </button>
                        <button type="button" className="table-action" title="Đưa xuống" aria-label="Đưa xuống" disabled={index === lessons.length - 1 || reorder.isPending} onClick={() => move(index, 1)}>
                          <ArrowDown aria-hidden="true" />
                        </button>
                        {lesson.videoFile ? (
                          <a
                            className="table-action"
                            href={`/api/khoa-hoc/video/${lesson._id}${lesson.startSeconds || lesson.endSeconds ? `#t=${lesson.startSeconds ?? 0}${lesson.endSeconds ? `,${lesson.endSeconds}` : ""}` : ""}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Xem thử video"
                            aria-label="Xem thử video"
                          >
                            <Play aria-hidden="true" />
                          </a>
                        ) : null}
                        {canSplit(lesson) ? (
                          <button type="button" className="table-action" title="Tách thành nhiều đoạn" aria-label="Tách thành nhiều đoạn" onClick={() => setSplitting(lesson)}>
                            <Scissors aria-hidden="true" />
                          </button>
                        ) : null}
                        <button type="button" className="table-action" title="Sửa" aria-label="Sửa" onClick={() => setEditing(lesson)}>
                          <Pencil aria-hidden="true" />
                        </button>
                        <button type="button" className="table-action" title="Xoá" aria-label="Xoá" onClick={() => setPendingDelete(lesson)}>
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing ? <LessonDialog key={editing._id} lesson={editing} onClose={() => setEditing(null)} onSaved={refresh} /> : null}
      {splitting ? <SplitDialog key={splitting._id} lesson={splitting} onClose={() => setSplitting(null)} onSplit={refresh} /> : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xoá bài giảng này?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” sẽ biến mất khỏi trang học${
                !pendingDelete.videoFile
                  ? ""
                  : lessons.some((lesson) => lesson._id !== pendingDelete._id && lesson.videoFile === pendingDelete.videoFile)
                    ? " (file video giữ lại vì các đoạn khác của buổi học vẫn dùng)"
                    : " và file video bị xoá khỏi máy chủ"
              }.`
            : ""
        }
        confirmLabel="Xoá bài"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await remove.mutateAsync(pendingDelete);
        }}
      />
    </section>
  );
}

function LessonDialog({ lesson, onClose, onSaved }: { lesson: Lesson; onClose: () => void; onSaved: () => Promise<unknown> }) {
  const toast = useToast();
  const [title, setTitle] = useState(lesson.title);
  const [section, setSection] = useState(lesson.section);
  const [description, setDescription] = useState(lesson.description);
  const [kind, setKind] = useState(lesson.kind);
  const [status, setStatus] = useState(lesson.status);
  const [isPreview, setIsPreview] = useState(lesson.isPreview);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl);
  const [startText, setStartText] = useState(formatClock(lesson.startSeconds ?? 0));
  const [endText, setEndText] = useState(lesson.endSeconds ? formatClock(lesson.endSeconds) : "");
  const [error, setError] = useState("");

  /** File tải lên: khoảng phát chỉnh được; thời lượng tính lại khi có điểm dừng. */
  const clip = () => {
    if (!lesson.videoFile) return {};
    const startSeconds = parseClock(startText || "0");
    const endSeconds = endText.trim() ? parseClock(endText) : 0;
    if (startSeconds === null || endSeconds === null) throw new Error("Thời điểm phải có dạng 0:12:40.");
    if (endSeconds && endSeconds <= startSeconds) throw new Error("Điểm dừng phải sau điểm bắt đầu.");
    const fileEnd = lesson.endSeconds ? 0 : (lesson.startSeconds ?? 0) + lesson.durationSeconds;
    const stop = endSeconds || fileEnd;
    return { startSeconds, endSeconds, ...(stop > startSeconds ? { durationSeconds: stop - startSeconds } : {}) };
  };

  const save = useMutation({
    mutationFn: () => api.patch(`/api/admin/course-lessons/${lesson._id}`, { title: title.trim(), section: section.trim(), description: description.trim(), kind, status, isPreview, videoUrl: videoUrl.trim(), ...clip() }),
    onSuccess: async () => {
      toast.success("Đã lưu", title.trim());
      await onSaved();
      onClose();
    },
    onError: (caught) => setError(errorMessage(caught)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 2) return setError("Vui lòng nhập tên bài.");
    try {
      clip();
    } catch (caught) {
      return setError(errorMessage(caught));
    }
    setError("");
    save.mutate();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Sửa bài ${lesson.title}`} onClick={onClose}>
      <form className="confirm-dialog ebook-detail" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <header>
          <Video aria-hidden="true" />
          <div>
            <h2>Sửa bài giảng</h2>
            <p>{lesson.videoFile ? "Video là file đã tải lên." : "Video là link ngoài."}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="admin-form__grid">
          <div className="field field--wide admin-form__cell--wide">
            <label className="field__label" htmlFor="lesson-title">Tên bài</label>
            <span className="field__control">
              <input id="lesson-title" value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
            </span>
          </div>
          <div className="field field--wide admin-form__cell--wide">
            <label className="field__label" htmlFor="lesson-edit-section">Thuộc phần</label>
            <span className="field__control">
              <input id="lesson-edit-section" value={section} maxLength={160} onChange={(event) => setSection(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="lesson-kind">Loại</label>
            <span className="field__control">
              <select id="lesson-kind" value={kind} onChange={(event) => setKind(event.target.value as Lesson["kind"])}>
                <option value="lecture">Bài giảng</option>
                <option value="discussion">Thảo luận tương tác</option>
              </select>
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="lesson-status">Trạng thái</label>
            <span className="field__control">
              <select id="lesson-status" value={status} onChange={(event) => setStatus(event.target.value as Lesson["status"])}>
                <option value="published">Đang hiện</option>
                <option value="draft">Bản nháp (ẩn)</option>
              </select>
            </span>
          </div>
          {lesson.videoFile ? (
            <>
              <div className="field">
                <label className="field__label" htmlFor="lesson-start">Phát từ</label>
                <span className="field__control">
                  <input id="lesson-start" value={startText} maxLength={10} placeholder="0:00:00" onChange={(event) => setStartText(event.target.value)} />
                </span>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="lesson-end">Dừng ở</label>
                <span className="field__control">
                  <input id="lesson-end" value={endText} maxLength={10} placeholder="Hết video" onChange={(event) => setEndText(event.target.value)} />
                </span>
              </div>
            </>
          ) : (
            <div className="field field--wide admin-form__cell--wide">
              <label className="field__label" htmlFor="lesson-url">Link video</label>
              <span className="field__control">
                <input id="lesson-url" value={videoUrl} maxLength={500} onChange={(event) => setVideoUrl(event.target.value)} />
              </span>
            </div>
          )}
          <div className="field field--wide admin-form__cell--wide">
            <label className="field__label" htmlFor="lesson-description">Mô tả ngắn</label>
            <span className="field__control field__control--textarea">
              <textarea id="lesson-description" rows={3} value={description} maxLength={2000} onChange={(event) => setDescription(event.target.value)} />
            </span>
          </div>
          <label className="field__checkbox admin-form__cell--wide">
            <input type="checkbox" checked={isPreview} onChange={(event) => setIsPreview(event.target.checked)} />
            <span>Cho học thử: ai cũng xem được bài này, không cần mã.</span>
          </label>
        </div>
        {error ? (
          <p className="admin-error" role="alert">
            <AlertTriangle aria-hidden="true" /> {error}
          </p>
        ) : null}
        <footer>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Đóng
          </button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="spin" aria-hidden="true" /> : null}
            Lưu thay đổi
          </button>
        </footer>
      </form>
    </div>
  );
}

const SPLIT_PLACEHOLDER = `0:00:00 | Làm quen lớp, giới thiệu nội dung buổi học
0:12:40 | Cách tính chỉ số đường đời và ví dụ
0:25:10 | Thảo luận: học viên đối chiếu lá số của mình`;

/**
 * Chia một bài (cả buổi học) thành nhiều đoạn. AI gợi ý mốc + tên đoạn vào ô bên dưới; quản trị sửa lại tuỳ ý (hoặc tự gõ mốc)
 * rồi mới áp dụng. Áp dụng không cắt file: mỗi đoạn phát một khoảng của cùng video.
 */
function SplitDialog({ lesson, onClose, onSplit }: { lesson: Lesson; onClose: () => void; onSplit: () => Promise<unknown> }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(lesson.section || lesson.title);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const filledFrom = useRef("");
  const infoKey = ["admin", "course-lessons", "auto-split", lesson._id];

  const info = useQuery({
    queryKey: infoKey,
    queryFn: () => api.get<SplitInfo>(`/api/admin/course-lessons/${lesson._id}/auto-split`),
    refetchInterval: (query) => (query.state.data?.job?.state === "running" ? 3000 : false),
  });
  const job = info.data?.job ?? null;
  const range = { from: info.data?.range.from ?? 0, to: info.data?.range.to || info.data?.transcriptDuration || 0 };
  const suggestion = job?.state === "done" && job.chapters?.length ? job.chapters : null;

  // Gợi ý xong (kể cả khi quản trị đóng hộp thoại rồi mở lại): điền vào ô mốc nếu ô đang trống.
  useEffect(() => {
    if (!suggestion || !job?.finishedAt || filledFrom.current === job.finishedAt) return;
    filledFrom.current = job.finishedAt;
    setText((current) => (current.trim() ? current : formatChapterText(suggestion)));
  }, [suggestion, job?.finishedAt]);

  const start = useMutation({
    mutationFn: () => api.post<{ job: SplitJob }>(`/api/admin/course-lessons/${lesson._id}/auto-split`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: infoKey }),
    onError: (caught) => toast.error("Chưa tự tách được", errorMessage(caught)),
  });

  const parsed = parseChapterText(text, range);
  const apply = useMutation({
    mutationFn: () => api.post(`/api/admin/course-lessons/${lesson._id}/split`, { section: section.trim(), chapters: parsed.chapters }),
    onSuccess: async () => {
      toast.success("Đã chia bài", `“${lesson.title}” đã thành ${parsed.chapters.length} đoạn trên trang học.`);
      await onSplit();
      onClose();
    },
    onError: (caught) => setError(errorMessage(caught)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (parsed.errors.length) return setError(parsed.errors[0]);
    if (parsed.chapters.length < 2) return setError("Cần ít nhất 2 dòng mốc để chia bài.");
    setError("");
    apply.mutate();
  };

  const running = job?.state === "running" || start.isPending;
  const length = range.to ? formatLessonDuration(range.to - range.from) : "";

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Tách bài ${lesson.title}`} onClick={onClose}>
      <form className="confirm-dialog ebook-detail lesson-split" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <header>
          <Scissors aria-hidden="true" />
          <div>
            <h2>Tách thành nhiều đoạn</h2>
            <p>
              {lesson.title}
              {length ? ` · ${length}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>

        <section className="lesson-split__auto">
          <div>
            <strong>Tự tách bằng AI</strong>
            <p>AI nghe lời giảng, chia đoạn 10–15 phút ở chỗ chuyển nội dung, đặt tên và tách riêng phần thảo luận. Mất khoảng 3–6 phút; đóng cửa sổ này cũng không sao, mở lại sẽ thấy kết quả.</p>
          </div>
          <button type="button" className="btn btn--primary btn--sm" disabled={running} onClick={() => start.mutate()}>
            {running ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {running ? "Đang tách…" : suggestion ? "Tách lại" : "Tự tách đoạn"}
          </button>
          {job?.state === "running" ? (
            <p className="lesson-split__status" role="status">
              <Loader2 className="spin" aria-hidden="true" /> {job.step}
            </p>
          ) : job?.state === "error" ? (
            <p className="admin-error lesson-split__status" role="alert">
              <AlertTriangle aria-hidden="true" /> {job.error}
            </p>
          ) : suggestion ? (
            <p className="lesson-split__status lesson-split__status--done" role="status">
              <CheckCircle2 aria-hidden="true" /> AI gợi ý {suggestion.length} đoạn.
              {text.trim() && text.trim() !== formatChapterText(suggestion) ? (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setText(formatChapterText(suggestion))}>
                  Dùng gợi ý này
                </button>
              ) : null}
            </p>
          ) : null}
        </section>

        <div className="field">
          <label className="field__label" htmlFor="split-text">Mốc chia đoạn — mỗi dòng: thời điểm bắt đầu | tên đoạn</label>
          <span className="field__control field__control--textarea">
            <textarea id="split-text" rows={10} value={text} placeholder={SPLIT_PLACEHOLDER} spellCheck={false} onChange={(event) => setText(event.target.value)} />
          </span>
          <p className="field__hint">Sửa tên, thêm hay bớt dòng tuỳ ý trước khi áp dụng. Tên bắt đầu bằng “Thảo luận” được đánh dấu là phần thảo luận. Có thể tự gõ mốc mà không dùng AI.</p>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="split-section">Thuộc phần</label>
          <span className="field__control">
            <input id="split-section" value={section} maxLength={160} onChange={(event) => setSection(event.target.value)} />
          </span>
          <p className="field__hint">Các đoạn mới hiện thành một nhóm dưới tên này (VD: “Ngày 1”).</p>
        </div>

        {parsed.chapters.length ? (
          <div className="admin-table-wrap lesson-split__preview">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bắt đầu</th>
                  <th>Dài</th>
                  <th>Tên đoạn</th>
                  <th>Loại</th>
                </tr>
              </thead>
              <tbody>
                {parsed.chapters.map((chapter, index) => {
                  const next = parsed.chapters[index + 1]?.start ?? range.to;
                  return (
                    <tr key={`${chapter.start}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{formatClock(chapter.start)}</td>
                      <td>{next > chapter.start ? formatLessonDuration(next - chapter.start) : "—"}</td>
                      <td>{chapter.title}</td>
                      <td>{KIND_LABEL[chapter.kind]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {error || parsed.errors.length ? (
          <p className="admin-error" role="alert">
            <AlertTriangle aria-hidden="true" /> {error || parsed.errors[0]}
          </p>
        ) : null}
        <footer>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Đóng
          </button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={apply.isPending || running || parsed.chapters.length < 2 || parsed.errors.length > 0}>
            {apply.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Scissors aria-hidden="true" />}
            {parsed.chapters.length >= 2 ? `Thay bài này bằng ${parsed.chapters.length} đoạn` : "Chia bài"}
          </button>
        </footer>
      </form>
    </div>
  );
}
