/**
 * Nguồn phát của bài giảng dán link: YouTube / Vimeo / Bunny Stream chạy trong khung nhúng, file .mp4 / .webm phát trực
 * tiếp. Trả null nếu link không thuộc các loại này, để quản trị biết ngay lúc lưu thay vì học viên gặp khung trắng.
 */
export type LessonVideoSource = { type: "embed" | "video"; url: string };

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
  if (youtubeId && /^[\w-]{6,20}$/.test(youtubeId)) return { type: "embed", url: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1` };

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
