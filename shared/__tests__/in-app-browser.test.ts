import { describe, expect, it } from "vitest";
import { detectInAppBrowser, openInBrowserHref } from "../in-app-browser";
import { formatLessonDuration, lessonVideoFromUrl } from "../course-video";

const ZALO_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A536E; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile Safari/537.36 Zalo android/12110501 ZaloTheme/light ZaloLanguage/vi";
const ZALO_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/24.04.1 ZaloTheme/light";
const CHROME_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";
const SAFARI_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

describe("detectInAppBrowser", () => {
  it("nhận ra Zalo trên Android và iPhone", () => {
    expect(detectInAppBrowser(ZALO_ANDROID)).toEqual({ name: "Zalo", os: "android" });
    expect(detectInAppBrowser(ZALO_IOS)).toEqual({ name: "Zalo", os: "ios" });
  });

  it("không coi Chrome, Safari thật là trình duyệt nhúng", () => {
    expect(detectInAppBrowser(CHROME_ANDROID)).toBeNull();
    expect(detectInAppBrowser(SAFARI_IOS)).toBeNull();
  });

  it("nhận ra WebView Android của ứng dụng khác", () => {
    expect(detectInAppBrowser("Mozilla/5.0 (Linux; Android 12; Pixel 6; wv) AppleWebKit/537.36 Chrome/118.0 Mobile Safari/537.36")?.os).toBe("android");
  });
});

describe("openInBrowserHref", () => {
  const url = "https://thansohuongnghiep.com/ebook/tai/abc?x=1";

  it("Android mở bằng Chrome, iPhone mở bằng Safari", () => {
    expect(openInBrowserHref(url, "android")).toBe("intent://thansohuongnghiep.com/ebook/tai/abc?x=1#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;end");
    expect(openInBrowserHref(url, "ios")).toBe("x-safari-https://thansohuongnghiep.com/ebook/tai/abc?x=1");
    expect(openInBrowserHref(url, "other")).toBeNull();
  });
});

describe("lessonVideoFromUrl", () => {
  it("đổi mọi dạng link YouTube sang khung nhúng", () => {
    const embed = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1";
    for (const link of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=8-3dYSSDlU77CcpD", "https://youtu.be/dQw4w9WgXcQ", "https://m.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ"]) {
      expect(lessonVideoFromUrl(link)).toEqual({ type: "embed", url: embed });
    }
  });

  it("giữ đoạn cần phát của link YouTube, bỏ mốc kết thúc vô lý", () => {
    const base = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1";
    expect(lessonVideoFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=600&end=1380")?.url).toBe(`${base}&start=600&end=1380`);
    expect(lessonVideoFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&end=900")?.url).toBe(`${base}&end=900`);
    expect(lessonVideoFromUrl("https://youtu.be/dQw4w9WgXcQ?t=300s")?.url).toBe(`${base}&start=300`);
    expect(lessonVideoFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=900&end=600")?.url).toBe(`${base}&start=900`);
    expect(lessonVideoFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=abc")?.url).toBe(base);
  });

  it("nhận Vimeo (kể cả link riêng tư), Bunny và file mp4", () => {
    expect(lessonVideoFromUrl("https://vimeo.com/123456789")?.url).toBe("https://player.vimeo.com/video/123456789");
    expect(lessonVideoFromUrl("https://vimeo.com/123456789/abcdef1234")?.url).toBe("https://player.vimeo.com/video/123456789?h=abcdef1234");
    expect(lessonVideoFromUrl("https://iframe.mediadelivery.net/embed/1/abc")?.type).toBe("embed");
    expect(lessonVideoFromUrl("https://cdn.example.com/a/bai-1.mp4")).toEqual({ type: "video", url: "https://cdn.example.com/a/bai-1.mp4" });
  });

  it("từ chối link không phát được hoặc không phải https", () => {
    expect(lessonVideoFromUrl("https://example.com/trang")).toBeNull();
    expect(lessonVideoFromUrl("http://cdn.example.com/a.mp4")).toBeNull();
    expect(lessonVideoFromUrl("javascript:alert(1)")).toBeNull();
    expect(lessonVideoFromUrl("không phải link")).toBeNull();
  });
});

describe("formatLessonDuration", () => {
  it("hiển thị phút:giây, có giờ khi dài hơn một tiếng", () => {
    expect(formatLessonDuration(0)).toBe("");
    expect(formatLessonDuration(754)).toBe("12:34");
    expect(formatLessonDuration(3754)).toBe("1:02:34");
  });
});
