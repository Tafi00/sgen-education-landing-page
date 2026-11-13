import { describe, expect, it } from "vitest";
import { lessonRange, normalizeChapters, parseYoutubeCaptions } from "../services/courseAutoSplit";

describe("chuẩn hoá gợi ý chia đoạn", () => {
  it("đoạn đầu bắt đầu ở đầu bài, bỏ mốc sát nhau / cuối video, thêm tiền tố Thảo luận", () => {
    const chapters = normalizeChapters(
      [
        { start: 700, title: "Học viên hỏi về số 7", kind: "discussion" },
        { start: 12, title: "  Mở đầu   buổi học ", kind: "lecture" },
        { start: 740, title: "Trùng gần mốc trước", kind: "lecture" },
        { start: 1500, title: "Thảo luận: cảm nhận cuối buổi", kind: "lecture" },
        { start: 5390, title: "Sát cuối video", kind: "lecture" },
      ],
      { from: 0, to: 5400 },
    );
    expect(chapters).toEqual([
      { start: 0, title: "Mở đầu buổi học", kind: "lecture" },
      { start: 700, title: "Thảo luận: học viên hỏi về số 7", kind: "discussion" },
      { start: 1500, title: "Thảo luận: cảm nhận cuối buổi", kind: "discussion" },
    ]);
  });

  it("khoảng phát của bài: file đã chia, file nguyên và link YouTube", () => {
    expect(lessonRange({ videoFile: "a.mp4", videoUrl: "", startSeconds: 600, endSeconds: 1380, durationSeconds: 780 })).toEqual({ from: 600, to: 1380 });
    expect(lessonRange({ videoFile: "a.mp4", videoUrl: "", startSeconds: 0, endSeconds: 0, durationSeconds: 5514 })).toEqual({ from: 0, to: 5514 });
    expect(lessonRange({ videoFile: "", videoUrl: "https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=622&end=1127", startSeconds: 0, endSeconds: 0, durationSeconds: 505 })).toEqual({ from: 622, to: 1127 });
    expect(lessonRange({ videoFile: "", videoUrl: "https://www.youtube.com/watch?v=Dfhxrk_PpRM", startSeconds: 0, endSeconds: 0, durationSeconds: 0 })).toEqual({ from: 0, to: 0 });
  });
});

describe("phụ đề YouTube", () => {
  it("đọc json3, srv3 và srv1", () => {
    const json3 = JSON.stringify({ events: [{ tStartMs: 1200, dDurationMs: 3000, segs: [{ utf8: "xin " }, { utf8: "chào" }] }, { tStartMs: 5000 }] });
    expect(parseYoutubeCaptions(json3)).toEqual([{ start: 1.2, end: 4.2, text: "xin chào" }]);
    const srv3 = '<timedtext format="3"><body><p t="62000" d="2500"><s>thần</s><s t="400"> số</s><s> học</s></p><p t="70000" d="10"></p></body></timedtext>';
    expect(parseYoutubeCaptions(srv3)).toEqual([{ start: 62, end: 64.5, text: "thần số học" }]);
    const srv1 = '<transcript><text start="3.5" dur="2">Pythagoras &amp;amp; số 7</text></transcript>';
    expect(parseYoutubeCaptions(srv1)).toEqual([{ start: 3.5, end: 5.5, text: "Pythagoras & số 7" }]);
  });
});
