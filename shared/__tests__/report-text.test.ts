import { describe, expect, it } from "vitest";
import { structureParagraphs } from "../report-text";

describe("structureParagraphs", () => {
  it("tách tiêu đề in hoa dính đầu đoạn và bỏ tiền tố lặp", () => {
    expect(structureParagraphs(["1 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 1 = KHAO KHÁT CHINH PHỤC Bạn sinh ra để dẫn dắt."])).toEqual([
      { heading: "NỘI TÂM SỐ 1 = KHAO KHÁT CHINH PHỤC", text: "Bạn sinh ra để dẫn dắt." },
    ]);
  });

  it("chuyển tiêu đề dính cuối đoạn xuống đầu đoạn kế tiếp", () => {
    expect(
      structureParagraphs([
        "Thần số học dễ dàng tiếp cận với mọi người.LỊCH SỬ RA ĐỜI THẦN SỐ HỌC PYTHAGORAS",
        "Pythagoras là nhà triết học Hy Lạp.",
      ]),
    ).toEqual([
      { text: "Thần số học dễ dàng tiếp cận với mọi người." },
      { heading: "LỊCH SỬ RA ĐỜI THẦN SỐ HỌC PYTHAGORAS", text: "Pythagoras là nhà triết học Hy Lạp." },
    ]);
  });

  it("đoạn chỉ gồm tiêu đề trở thành tiêu đề của đoạn sau", () => {
    expect(structureParagraphs(["CHƯƠNG 3 ĐỊNH HƯỚNG SỰ NGHIỆP", "Nội dung chương."])).toEqual([
      { heading: "CHƯƠNG 3 ĐỊNH HƯỚNG SỰ NGHIỆP", text: "Nội dung chương." },
    ]);
  });

  it("không bắt nhầm từ viết tắt ngắn trong câu", () => {
    const paragraphs = ["SGEN tin rằng mỗi người đều có tiềm năng.", "Bài DISC mô tả hành vi."];
    expect(structureParagraphs(paragraphs)).toEqual(paragraphs.map((text) => ({ text })));
  });

  it("giữ nguyên đoạn văn bình thường", () => {
    expect(structureParagraphs(["Một đoạn văn bình thường. Câu thứ hai."])).toEqual([{ text: "Một đoạn văn bình thường. Câu thứ hai." }]);
  });
});
