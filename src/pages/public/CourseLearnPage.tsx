/**
 * Trang học video (`/khoa-hoc/<slug>/hoc`): học viên nhập mã khóa học SGEN cấp (hoặc mở đường dẫn có `?ma=`) rồi xem các
 * đoạn video ngay trên web. Tiến độ đã học lưu ở trình duyệt của học viên, mất cũng không ảnh hưởng tới quyền xem.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Circle, GraduationCap, KeyRound, Loader2, Lock, LogOut, MessagesSquare, PlayCircle } from "lucide-react";
import { api, ApiError, errorMessage } from "../../api/client";
import { TextField } from "../../components/form/Field";
import { Button, ButtonLink } from "../../components/ui/Button";
import { ExpertContactBar } from "../../components/ui/ExpertCallout";
import { PageHero } from "../../components/ui/Layout";
import { useToast } from "../../components/ui/Toast";
import { formatLessonDuration, type LessonVideoSource } from "../../../shared/course-video";
import "../../styles/course-learn.css";

export type LearnLesson = {
  _id: string;
  section: string;
  title: string;
  description: string;
  kind: "lecture" | "discussion";
  durationSeconds: number;
  isPreview: boolean;
  locked: boolean;
  source: LessonVideoSource | null;
};

export type LearnResponse = {
  course: { slug: string; title: string };
  access: { display: string; expiresAt: string | null } | null;
  lessons: LearnLesson[];
};

const progressKey = (slug: string) => `sgen-course-progress:${slug}`;

function loadProgress(slug: string): { watched: string[]; last: string } {
  try {
    const parsed = JSON.parse(localStorage.getItem(progressKey(slug)) ?? "null") as { watched?: unknown; last?: unknown } | null;
    return { watched: Array.isArray(parsed?.watched) ? (parsed.watched as string[]) : [], last: typeof parsed?.last === "string" ? parsed.last : "" };
  } catch {
    return { watched: [], last: "" };
  }
}

function saveProgress(slug: string, progress: { watched: string[]; last: string }) {
  try {
    localStorage.setItem(progressKey(slug), JSON.stringify(progress));
  } catch {
    /* Trình duyệt chặn lưu trữ: học vẫn bình thường, chỉ không nhớ tiến độ. */
  }
}

/** Gom các bài liên tiếp cùng phần thành một nhóm, giữ nguyên thứ tự quản trị đã sắp. */
function groupBySection(lessons: LearnLesson[]) {
  const groups: { section: string; items: { lesson: LearnLesson; index: number }[] }[] = [];
  lessons.forEach((lesson, index) => {
    const last = groups.at(-1);
    if (last && last.section === lesson.section) last.items.push({ lesson, index });
    else groups.push({ section: lesson.section, items: [{ lesson, index }] });
  });
  return groups;
}

function LessonPlayer({ lesson, onEnded, onUnlock }: { lesson: LearnLesson; onEnded: () => void; onUnlock: () => void }) {
  const [failed, setFailed] = useState(false);

  if (lesson.locked || !lesson.source) {
    return (
      <div className="learn-player learn-player--locked">
        <Lock aria-hidden="true" />
        <strong>{lesson.locked ? "Nhập mã khóa học để xem bài này" : "Bài này chưa có video"}</strong>
        {lesson.locked ? (
          <Button variant="primary" onClick={onUnlock}>
            <KeyRound aria-hidden="true" /> Nhập mã khóa học
          </Button>
        ) : null}
      </div>
    );
  }
  if (lesson.source.type === "embed") {
    return (
      <div className="learn-player">
        <iframe
          key={lesson._id}
          src={lesson.source.url}
          title={lesson.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  return (
    <div className="learn-player">
      <video
        key={lesson._id}
        src={lesson.source.url}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        onContextMenu={(event) => event.preventDefault()}
        onEnded={onEnded}
        onError={() => setFailed(true)}
      />
      {failed ? (
        <p className="learn-player__error" role="alert">
          <AlertTriangle aria-hidden="true" /> Không phát được video. Vui lòng kiểm tra mạng rồi tải lại trang; nếu vẫn lỗi, liên hệ SGEN.
        </p>
      ) : null}
    </div>
  );
}

export function CourseLearnPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const queryKey = useMemo(() => ["course-learn", slug], [slug]);
  const query = useQuery({ queryKey, queryFn: () => api.get<LearnResponse>(`/api/khoa-hoc/${slug}/hoc`), retry: 0 });
  const data = query.data;
  const lessons = useMemo(() => data?.lessons ?? [], [data]);

  const [progress, setProgress] = useState(() => loadProgress(slug));
  const [currentId, setCurrentId] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const codeInputWrap = useRef<HTMLFormElement>(null);
  const playerTop = useRef<HTMLDivElement>(null);

  const redeem = async (raw: string) => {
    setRedeeming(true);
    setCodeError("");
    try {
      await api.post(`/api/khoa-hoc/${slug}/redeem`, { code: raw });
      setCode("");
      await queryClient.invalidateQueries({ queryKey });
      toast.success("Đã mở khóa học", "Chúc bạn học tốt.");
    } catch (error) {
      setCodeError(errorMessage(error));
    } finally {
      setRedeeming(false);
    }
  };

  // Đường dẫn có mã (?ma=...) quản trị gửi qua Zalo: tự nhập mã rồi bỏ mã khỏi thanh địa chỉ; StrictMode gọi hai lần vẫn chỉ nhập một lần.
  const linkCode = params.get("ma");
  const redeemedLink = useRef<string | null>(null);
  useEffect(() => {
    if (!linkCode || redeemedLink.current === linkCode) return;
    redeemedLink.current = linkCode;
    const next = new URLSearchParams(params);
    next.delete("ma");
    setParams(next, { replace: true });
    void redeem(linkCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkCode]);

  const leave = async () => {
    await api.post(`/api/khoa-hoc/${slug}/logout`).catch(() => undefined);
    await queryClient.invalidateQueries({ queryKey });
  };

  const current = lessons.find((lesson) => lesson._id === currentId) ?? lessons.find((lesson) => lesson._id === progress.last) ?? lessons.find((lesson) => !lesson.locked) ?? lessons[0];
  const currentIndex = current ? lessons.indexOf(current) : -1;
  const groups = useMemo(() => groupBySection(lessons), [lessons]);
  const watched = useMemo(() => new Set(progress.watched), [progress.watched]);
  const watchedCount = lessons.filter((lesson) => watched.has(lesson._id)).length;

  const updateProgress = (next: { watched: string[]; last: string }) => {
    setProgress(next);
    saveProgress(slug, next);
  };

  const open = (lesson: LearnLesson, scroll = true) => {
    setCurrentId(lesson._id);
    if (!lesson.locked) updateProgress({ ...progress, last: lesson._id });
    if (scroll) playerTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setWatched = (id: string, value: boolean) => {
    const others = progress.watched.filter((item) => item !== id);
    updateProgress({ ...progress, watched: value ? [...others, id] : others });
  };

  const focusCode = () => {
    codeInputWrap.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    codeInputWrap.current?.querySelector("input")?.focus({ preventScroll: true });
  };

  const submitCode = (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      setCodeError("Vui lòng nhập mã khóa học.");
      return;
    }
    void redeem(code);
  };

  if (query.isLoading) {
    return (
      <section className="page-light-section">
        <div className="container">
          <p className="state-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải bài giảng…
          </p>
        </div>
      </section>
    );
  }

  if (!data) {
    const missing = query.error instanceof ApiError && query.error.status === 404;
    return (
      <section className="page-light-section">
        <div className="container empty-search">
          <AlertTriangle aria-hidden="true" />
          <h2>{missing ? "Không tìm thấy khóa học" : "Chưa tải được bài giảng"}</h2>
          <p>{missing ? "Đường dẫn có thể đã thay đổi. Bạn xem lại danh sách khóa học nhé." : errorMessage(query.error)}</p>
          <ButtonLink variant="primary" to="/khoa-hoc">
            <ArrowLeft aria-hidden="true" /> Về danh sách khóa học
          </ButtonLink>
        </div>
      </section>
    );
  }

  const hasAccess = Boolean(data.access);

  return (
    <>
      {hasAccess ? null : <ExpertContactBar title="Liên hệ SGEN để đăng ký và được cấp mã khóa học" altFirst />}
      <PageHero
        eyebrow="Học video tại nhà"
        eyebrowIcon={GraduationCap}
        title={data.course.title}
        description={lessons.length ? `${lessons.length} bài học, mỗi bài là một đoạn ngắn theo từng nội dung. Xem lại bao nhiêu lần tùy thích.` : "Video của khóa học đang được SGEN cập nhật."}
        before={
          <Link className="article-back" to={`/khoa-hoc/${data.course.slug}`}>
            <ArrowLeft aria-hidden="true" /> Giới thiệu khóa học
          </Link>
        }
      />

      <section className="page-light-section learn" style={{ "--page-light-bg": "none" } as CSSProperties}>
        <div className="container">
          {hasAccess ? (
            <p className="learn-access">
              <CheckCircle2 aria-hidden="true" />
              <span>
                Đã mở bằng mã <strong>{data.access?.display}</strong>
                {lessons.length ? ` · đã học ${watchedCount}/${lessons.length} bài` : ""}
              </span>
              <button type="button" onClick={() => void leave()}>
                <LogOut aria-hidden="true" /> Dùng mã khác
              </button>
            </p>
          ) : (
            <form ref={codeInputWrap} className="panel learn-code" onSubmit={submitCode} noValidate>
              <TextField
                label="Mã khóa học"
                required
                wide
                value={code}
                error={codeError || undefined}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                icon={<KeyRound aria-hidden="true" />}
                placeholder="KH-XXXX-XXXX"
                onChange={(event) => {
                  setCode(event.target.value);
                  if (codeError) setCodeError("");
                }}
              />
              <Button variant="primary" type="submit" disabled={redeeming}>
                {redeeming ? <Loader2 className="spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />} Vào học
              </Button>
            </form>
          )}

          {current ? (
            <div className="learn-grid">
              <div ref={playerTop} className="learn-main">
                <LessonPlayer key={`${current._id}-${current.locked}`} lesson={current} onEnded={() => setWatched(current._id, true)} onUnlock={focusCode} />
                <h2>{current.title}</h2>
                {current.section ? <p className="learn-main__section">{current.section}</p> : null}
                {current.description ? <p className="learn-main__desc">{current.description}</p> : null}
                <div className="learn-main__nav">
                  <Button variant="secondary" disabled={currentIndex <= 0} onClick={() => open(lessons[currentIndex - 1])}>
                    <ArrowLeft aria-hidden="true" /> Bài trước
                  </Button>
                  {current.locked ? null : (
                    <Button variant="secondary" onClick={() => setWatched(current._id, !watched.has(current._id))}>
                      {watched.has(current._id) ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}
                      {watched.has(current._id) ? "Đã học xong" : "Đánh dấu đã học"}
                    </Button>
                  )}
                  <Button variant="primary" disabled={currentIndex >= lessons.length - 1} onClick={() => open(lessons[currentIndex + 1])}>
                    Bài tiếp theo <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <aside className="learn-list" aria-label="Danh sách bài học">
                {groups.map((group, groupIndex) => (
                  <div key={`${group.section}-${groupIndex}`}>
                    {group.section ? <h3>{group.section}</h3> : null}
                    <ol>
                      {group.items.map(({ lesson, index }) => {
                        const duration = formatLessonDuration(lesson.durationSeconds);
                        return (
                          <li key={lesson._id}>
                            <button type="button" className={lesson._id === current._id ? "is-current" : ""} aria-current={lesson._id === current._id ? "true" : undefined} onClick={() => open(lesson)}>
                              {lesson.locked ? <Lock aria-hidden="true" /> : watched.has(lesson._id) ? <CheckCircle2 aria-hidden="true" className="is-done" /> : lesson.kind === "discussion" ? <MessagesSquare aria-hidden="true" /> : <PlayCircle aria-hidden="true" />}
                              <span>
                                <strong>
                                  {index + 1}. {lesson.title}
                                </strong>
                                <small>{[lesson.kind === "discussion" ? "Thảo luận" : "", duration, lesson.isPreview && !hasAccess ? "Học thử" : ""].filter(Boolean).join(" · ")}</small>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </aside>
            </div>
          ) : (
            <div className="empty-search">
              <PlayCircle aria-hidden="true" />
              <h2>Video đang được cập nhật</h2>
              <p>SGEN đang đưa bài giảng của khóa này lên. Bạn quay lại sau hoặc liên hệ để được thông báo khi khóa sẵn sàng.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
