/**
 * Nguồn phát của bài giảng dán link: YouTube / Vimeo / Bunny Stream chạy trong khung nhúng, file .mp4 / .webm phát trực
 * tiếp. Trả null nếu link không thuộc các loại này, để quản trị biết ngay lúc lưu thay vì học viên gặp khung trắng.
 *
 * Link YouTube có `start` / `end` (giây) chỉ phát một đoạn của video: buổi học dài 2 tiếng được chia thành nhiều bài ngắn
 * mà không phải tải video lên lại. Video vẫn là một file trên YouTube nên học viên kéo thanh tua được ra ngoài đoạn.
 */
export type LessonVideoSource = {
  type: "embed" | "video";
  url: string;
  /** File tải lên chỉ phát một đoạn (giây): trình phát tua tới `start` và dừng ở `end` (0 = tới hết video). */
  start?: number;
  end?: number;
};

/** Số giây trong tham số link; `t` của YouTube có thể viết "300" hoặc "300s". */
function secondsParam(value: string | null) {
  return value && /^\d+s?$/.test(value) ? Number.parseInt(value, 10) : 0;
}

function parseHttps(raw: string) {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** Mã video và khoảng phát (giây) của một link YouTube; `end` = 0 nghĩa là phát tới hết video. */
export function youtubeClip(raw: string): { id: string; start: number; end: number } | null {
  const url = parseHttps(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const id =
    host === "youtu.be"
      ? url.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? (url.searchParams.get("v") ?? /^\/(?:embed|live|shorts)\/([^/]+)/.exec(url.pathname)?.[1] ?? "")
        : "";
  if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
  const start = secondsParam(url.searchParams.get("start") ?? url.searchParams.get("t"));
  const end = secondsParam(url.searchParams.get("end"));
  return { id, start, end: end > start ? end : 0 };
}

/** Link YouTube phát đoạn [start, end) của video `id`, cùng dạng với link quản trị dán vào. */
export function youtubeClipUrl(id: string, start: number, end: number) {
  return `https://www.youtube.com/watch?v=${id}${start > 0 ? `&start=${Math.round(start)}` : ""}${end > start ? `&end=${Math.round(end)}` : ""}`;
}

export function lessonVideoFromUrl(raw: string): LessonVideoSource | null {
  const url = parseHttps(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");

  const youtube = youtubeClip(raw);
  if (youtube) {
    const range = `${youtube.start ? `&start=${youtube.start}` : ""}${youtube.end ? `&end=${youtube.end}` : ""}`;
    return { type: "embed", url: `https://www.youtube-nocookie.com/embed/${youtube.id}?rel=0&modestbranding=1${range}` };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = /(\d{6,})(?:\/([0-9a-f]{6,}))?/.exec(url.pathname);
    if (match) return { type: "embed", url: `https://player.vimeo.com/video/${match[1]}${match[2] ? `?h=${match[2]}` : url.searchParams.get("h") ? `?h=${url.searchParams.get("h")}` : ""}` };
  }

  if (host === "iframe.mediadelivery.net") return { type: "embed", url: url.href };
  if (/\.(mp4|m4v|webm)$/i.test(url.pathname)) return { type: "video", url: url.href };
  return null;
}

/** 754 giây → "12:34"; 3754 giây → "1:02:34". 0 = chưa rõ thời lượng. */
export function formatLessonDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/** 754 giây → "0:12:34": mốc thời gian luôn đủ giờ để cột thẳng hàng trong ô nhập mốc. */
export function formatClock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 3600)}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** "1:02:03", "12:34", "754" → giây; sai dạng trả null. */
export function parseClock(text: string): number | null {
  const match = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})(?:\.\d+)?\s*$/.exec(text) ?? null;
  if (match) return Number(match[1] ?? 0) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  return /^\s*\d+\s*$/.test(text) ? Number(text) : null;
}

export type ChapterKind = "lecture" | "discussion";
export type Chapter = { start: number; title: string; kind: ChapterKind };

/** Tên file video có các chữ này thì là phần thảo luận tương tác (học viên hỏi, chia sẻ). */
export function isDiscussionTitle(title: string) {
  return /thảo luận|hỏi đáp|tương tác/i.test(title);
}

/**
 * Trong ô mốc chia đoạn, đoạn thảo luận là đoạn có tên BẮT ĐẦU bằng "Thảo luận" / "Hỏi đáp" — chặt hơn tên file vì bài giảng
 * cũng có thể nhắc chữ "tương tác" (VD "Mở cam tương tác, đúng sai do góc nhìn").
 */
export function isDiscussionChapter(title: string) {
  return /^\s*(thảo luận|hỏi đáp)/i.test(title);
}

/** Mỗi dòng "0:12:40 | Tên đoạn", cùng dạng file mốc của scripts/cut_course_video.py. */
export function formatChapterText(chapters: Chapter[]) {
  return chapters.map((chapter) => `${formatClock(chapter.start)} | ${chapter.title}`).join("\n");
}

/**
 * Đọc ô nhập mốc chia đoạn: mỗi dòng một đoạn "thời điểm bắt đầu | tên đoạn", dòng trống và dòng bắt đầu bằng # bỏ qua.
 * Đoạn có tên bắt đầu bằng "Thảo luận" là phần thảo luận. Thời điểm phải tăng dần và nằm trong [from, to) của bài đang chia (to = 0 là
 * chưa rõ độ dài video).
 */
export function parseChapterText(text: string, range: { from: number; to: number } = { from: 0, to: 0 }) {
  const chapters: Chapter[] = [];
  const errors: string[] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const separator = line.indexOf("|");
    if (separator === -1) return errors.push(`Dòng ${index + 1}: thiếu dấu | giữa thời điểm và tên đoạn.`);
    const start = parseClock(line.slice(0, separator));
    const title = line.slice(separator + 1).trim().replace(/\s+/g, " ");
    if (start === null) return errors.push(`Dòng ${index + 1}: thời điểm phải có dạng 0:12:40.`);
    if (title.length < 2) return errors.push(`Dòng ${index + 1}: thiếu tên đoạn.`);
    if (title.length > 200) return errors.push(`Dòng ${index + 1}: tên đoạn dài quá 200 ký tự.`);
    if (start < range.from || (range.to > 0 && start >= range.to)) {
      return errors.push(`Dòng ${index + 1}: ${formatClock(start)} nằm ngoài video (${formatClock(range.from)} – ${range.to ? formatClock(range.to) : "hết"}).`);
    }
    const previous = chapters.at(-1);
    if (previous && start <= previous.start) return errors.push(`Dòng ${index + 1}: thời điểm phải sau dòng trước.`);
    chapters.push({ start, title, kind: isDiscussionChapter(title) ? "discussion" : "lecture" });
  });
  return { chapters, errors };
}
