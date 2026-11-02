/**
 * Nguồn phát của bài giảng dán link: YouTube / Vimeo / Bunny Stream chạy trong khung nhúng, file .mp4 / .webm phát trực
 * tiếp. Trả null nếu link không thuộc các loại này, để quản trị biết ngay lúc lưu thay vì học viên gặp khung trắng.
 *
 * Link YouTube có `start` / `end` (giây) chỉ phát một đoạn của video: buổi học dài 2 tiếng được chia thành nhiều bài ngắn
 * mà không phải tải video lên lại. Video vẫn là một file trên YouTube nên học viên kéo thanh tua được ra ngoài đoạn.
 */
export type LessonVideoSource = { type: "embed" | "video"; url: string };

/** Số giây trong tham số link; `t` của YouTube có thể viết "300" hoặc "300s". */
function secondsParam(value: string | null) {
  return value && /^\d+s?$/.test(value) ? Number.parseInt(value, 10) : 0;
}

export function lessonVideoFromUrl(raw: string): LessonVideoSource | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");

  const youtubeId =
    host === "youtu.be"
      ? url.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? (url.searchParams.get("v") ?? /^\/(?:embed|live|shorts)\/([^/]+)/.exec(url.pathname)?.[1] ?? "")
        : "";
  if (youtubeId && /^[\w-]{6,20}$/.test(youtubeId)) {
    const start = secondsParam(url.searchParams.get("start") ?? url.searchParams.get("t"));
    const end = secondsParam(url.searchParams.get("end"));
    const range = `${start ? `&start=${start}` : ""}${end > start ? `&end=${end}` : ""}`;
    return { type: "embed", url: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1${range}` };
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
