import { describe, expect, it } from "vitest";
import { formatChapterText, formatClock, parseChapterText, parseClock, youtubeClip, youtubeClipUrl } from "../course-video";
import { withCourseLinks, type NavItem } from "../../src/app/nav";

describe("mốc chia đoạn", () => {
  it("đọc và ghi lại đúng dạng 0:12:40 | Tên đoạn", () => {
    expect(formatClock(754)).toBe("0:12:34");
    expect(formatClock(3754)).toBe("1:02:34");
    expect(parseClock("1:02:34")).toBe(3754);
    expect(parseClock("12:34")).toBe(754);
    expect(parseClock("90")).toBe(90);
    expect(parseClock("1h2m")).toBeNull();

    const text = "0:00:00 | Mở đầu buổi học\n\n# ghi chú\n0:12:40 | Thảo luận: học viên hỏi về số 7\n0:25:00 | Mở cam tương tác, đúng sai do góc nhìn";
    const { chapters, errors } = parseChapterText(text);
    expect(errors).toEqual([]);
    expect(chapters).toEqual([
      { start: 0, title: "Mở đầu buổi học", kind: "lecture" },
      { start: 760, title: "Thảo luận: học viên hỏi về số 7", kind: "discussion" },
      // Bài giảng có chữ "tương tác" ở giữa tên vẫn là bài giảng.
      { start: 1500, title: "Mở cam tương tác, đúng sai do góc nhìn", kind: "lecture" },
    ]);
    expect(parseChapterText(formatChapterText(chapters)).chapters).toEqual(chapters);
  });

  it("báo lỗi dòng sai, mốc lùi và mốc ngoài video", () => {
    const { chapters, errors } = parseChapterText("0:00 | Mở đầu\nkhông có dấu gạch\n0:10:00 | Đoạn hai\n0:05:00 | Lùi lại\n2:00:00 | Quá dài", { from: 0, to: 5400 });
    expect(chapters.map((chapter) => chapter.start)).toEqual([0, 600]);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toContain("Dòng 2");
    expect(errors[1]).toContain("Dòng 4");
    expect(errors[2]).toContain("ngoài video");
  });
});

describe("khoảng phát YouTube", () => {
  it("đọc mã video và start/end, ghi lại link cùng dạng quản trị dán", () => {
    expect(youtubeClip("https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=622&end=1127")).toEqual({ id: "Dfhxrk_PpRM", start: 622, end: 1127 });
    expect(youtubeClip("https://youtu.be/Dfhxrk_PpRM?t=300s")).toEqual({ id: "Dfhxrk_PpRM", start: 300, end: 0 });
    expect(youtubeClip("https://vimeo.com/123456789")).toBeNull();
    expect(youtubeClipUrl("Dfhxrk_PpRM", 0, 622)).toBe("https://www.youtube.com/watch?v=Dfhxrk_PpRM&end=622");
    expect(youtubeClipUrl("Dfhxrk_PpRM", 5986, 0)).toBe("https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=5986");
  });
});

describe("menu Khóa học theo CMS", () => {
  const nav: NavItem[] = [
    { label: "Dịch vụ", href: "/dich-vu", children: [{ label: "Cũ", href: "/dich-vu/cu" }] },
    { label: "Khóa học", href: "/khoa-hoc", children: [{ label: "Cũ", href: "/khoa-hoc/cu" }] },
  ];

  it("lấy đúng thứ tự quản trị đã sắp và câu đầu phần tóm tắt", () => {
    const merged = withCourseLinks(nav, [
      { slug: "than-so-hoc-nang-cao", title: "Thần Số Học Nâng Cao ", summary: "Luận chuyên sâu. Có bài tập.", order: 2 },
      { slug: "than-so-hoc-can-ban", title: "Thần Số Học Cơ Bản", summary: "", order: 1 },
    ]);
    expect(merged[0]).toBe(nav[0]);
    expect(merged[1].children).toEqual([
      { label: "Thần Số Học Cơ Bản", href: "/khoa-hoc/than-so-hoc-can-ban", description: undefined },
      { label: "Thần Số Học Nâng Cao", href: "/khoa-hoc/than-so-hoc-nang-cao", description: "Luận chuyên sâu." },
    ]);
  });

  it("chưa có dữ liệu thì giữ menu mặc định", () => {
    expect(withCourseLinks(nav, [])).toBe(nav);
  });
});
