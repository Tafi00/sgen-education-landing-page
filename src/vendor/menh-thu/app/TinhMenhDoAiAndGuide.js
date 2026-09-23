import React from "react";
import CSVTable from "../lib/tinhmenhdo/CSVTable.CbWvlZkS.js";

const e = React.createElement;

export default function TinhMenhDoAiAndGuide({ horoMap }) {
  const ls = horoMap;
  const geo = {
    name: "Hanoi",
    lat: ls?.lat ?? 21.0285,
    lon: ls?.lon ?? 105.8333,
  };

  return e(
    "div",
    { className: "w-full space-y-10 my-10" },
    // 1. Chế Độ AI Tư Vấn
    e(
      "section",
      {
        className: "relative w-full overflow-hidden rounded-xl border-4 border-double border-amber-900/20 bg-[#FCFBF8] p-4 sm:p-6 lg:p-8",
        style: { minHeight: "300px" },
      },
      e(
        "h2",
        {
          className: "mb-6 flex items-center justify-center gap-3 border-b-2 border-dotted border-amber-900/20 pb-4 text-center font-serif text-2xl font-bold text-amber-900 md:text-3xl",
        },
        "Chế Độ AI Tư Vấn"
      ),
      e(
        "div",
        { className: "w-full" },
        e(
          "div",
          {
            className: "mx-auto mb-8 max-w-5xl text-justify font-serif text-sm leading-relaxed text-stone-700 italic md:text-center md:text-[15px]",
          },
          "AI phân tích dựa trên dữ liệu sao bạn cung cấp. ",
          e(
            "strong",
            null,
            "Lưu ý rằng đây chỉ là góc nhìn tham khảo, không thể thay thế sự đánh giá của các chuyên gia phong thủy hay tử vi chuyên sâu."
          ),
          " Khi đi vào phân tích chi tiết, có thể có sai số nhất định do cách diễn giải hoặc phương pháp tính toán khác biệt. Bạn có thể tiếp tục đặt câu hỏi để phân tích sâu hơn về từng cung hoặc từng bộ sao cụ thể."
        ),
        e(
          "div",
          {
            className: "mx-auto mb-8 max-w-5xl font-serif text-sm leading-relaxed text-stone-800 md:text-[15px]",
          },
          e(
            "p",
            { className: "mb-4" },
            "Để có thể dùng ",
            e("b", { className: "text-amber-900" }, "App Tinh Mệnh Đồ trên Gemini"),
            " (hoặc chính Gemini nếu app bị lỗi), quý vị cần có tài khoản ",
            e("strong", null, "Google đăng nhập sẵn"),
            ". Sau đó copy text lá số bằng cách click vào ",
            e("strong", { className: "text-red-700" }, "nút Copy"),
            " hoặc click nút mở ",
            e("strong", { className: "text-amber-900" }, "Tinh Mệnh Đồ - Tử Vi & Bát Tự"),
            " ở phía dưới."
          ),
          e(
            "div",
            { className: "rounded-lg border border-amber-900/10 bg-white/50 p-4" },
            e(
              "p",
              { className: "mb-2" },
              "Mặc định khi copy vào dán dữ liệu dưới vào AI sẽ chỉ phân tích tổng quát"
            ),
            e(
              "p",
              { className: "mb-2 font-bold text-amber-900" },
              "Gợi ý cách đặt câu hỏi cho AI:"
            ),
            e(
              "ul",
              { className: "list-inside list-disc space-y-1.5 pl-2 text-stone-700 italic" },
              e("li", null, '"Phân tích chi tiết hơn về lá số này"'),
              e("li", null, '"Phân tích các đại vận quan trọng"'),
              e("li", null, '"Luận giải về công danh, sự nghiệp, tài chính..."')
            )
          )
        ),
        e(
          "div",
          { className: "mb-8 w-full overflow-x-auto rounded-lg shadow-sm" },
          e(
            React.Suspense,
            {
              fallback: e("div", {
                className: "min-h-[180px] w-full animate-pulse rounded-lg border border-stone-100 bg-stone-50",
              }),
            },
            e(CSVTable, { ls: horoMap, geo })
          )
        ),
        e(
          "div",
          {
            className: "mx-auto flex max-w-5xl flex-col items-center justify-center border-t border-dashed border-amber-900/20 pt-4",
          },
          e(
            "p",
            { className: "mb-4 font-serif text-base font-bold text-stone-800" },
            "Link mở ứng dụng:"
          ),
          e(
            "a",
            {
              href: "https://gemini.google.com/gems/u/0/create?q=Tinh+M%E1%BB%87nh+%C4%90%E1%BB%93+-+T%E1%BB%AD+Vi+%26+B%C3%A1t+T%E1%BB%B1",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center justify-center gap-2 rounded-md bg-amber-800 px-8 py-3.5 text-center font-serif text-sm font-bold text-white shadow-md transition-all hover:bg-amber-900 hover:shadow-lg sm:text-base no-underline",
            },
            "Mở Tinh Mệnh Đồ trên Gemini"
          )
        )
      )
    ),
    // 2. Hướng Dẫn Luận Giải
    e(
      "div",
      {
        className: "relative overflow-hidden border-4 border-double border-amber-900/20 bg-[#FCFBF8] p-6 lg:p-10 rounded-xl",
      },
      e(
        "h2",
        {
          className: "mb-8 flex items-center justify-center gap-3 border-b-2 border-dotted border-amber-900/20 pb-4 text-center font-serif text-2xl font-bold text-amber-900 md:text-3xl",
        },
        "Hướng Dẫn Luận Giải"
      ),
      e(
        "div",
        { className: "mx-auto max-w-5xl space-y-8 font-serif text-sm leading-relaxed text-stone-800 sm:text-[15px]" },
        e(
          "div",
          null,
          e(
            "h3",
            { className: "mb-3 flex items-center gap-2 text-lg font-bold text-amber-900 md:text-xl" },
            e(
              "span",
              {
                className: "flex h-8 w-8 items-center justify-center rounded-full border border-red-700/30 text-sm text-red-700",
              },
              "1"
            ),
            "Nhập chính xác tọa độ & thời gian sinh"
          ),
          e(
            "p",
            { className: "pl-10" },
            "Thời khắc giáng sinh là yếu tố tiên quyết trong thuật số phương Đông. Quý vị cần ",
            e("strong", null, "cẩn trọng rà soát ngày giờ sinh"),
            ". Hệ thống ứng dụng thuật toán thiên văn tiên tiến để tự động quy đổi và ",
            e("strong", null, "tinh chỉnh Giờ Mặt Trời (Chính ngọ)"),
            " theo tọa độ địa lý, đảm bảo độ chuẩn xác cao nhất cho lá số Tử Vi & Bát tự."
          )
        ),
        e(
          "div",
          null,
          e(
            "h3",
            { className: "mb-3 flex items-center gap-2 text-lg font-bold text-amber-900 md:text-xl" },
            e(
              "span",
              {
                className: "flex h-8 w-8 items-center justify-center rounded-full border border-red-700/30 text-sm text-red-700",
              },
              "2"
            ),
            "Khảo cứu bình chú & AI tư vấn"
          ),
          e(
            "p",
            { className: "pl-10" },
            "Sau khi an sao lập số, hệ thống cung cấp góc nhìn tổng quan qua công cụ AI luận đoán. Quý vị hãy sử dụng tính năng ",
            e("strong", null, "[Dùng cho AI - Nhấn sao chép]"),
            " để trích xuất thông tin mã hóa, rồi mở phiên bản AI (Gemini hoặc ChatGPT) để tham vấn sâu hơn về lá số đại vận, hoặc tìm dụng thần Bát tự thông qua cách chat với AI."
          )
        ),
        e(
          "div",
          null,
          e(
            "h3",
            { className: "mb-3 flex items-center gap-2 text-lg font-bold text-amber-900 md:text-xl" },
            e(
              "span",
              {
                className: "flex h-8 w-8 items-center justify-center rounded-full border border-red-700/30 text-sm text-red-700",
              },
              "3"
            ),
            "Chuyên tu & tham học điển tịch"
          ),
          e(
            "p",
            { className: "pl-10" },
            "Mệnh lý học là một biển học bao la. Để đắc kỳ chân tủy, quý vị nên tìm đọc các trước tác kinh điển về huyền học kết hợp với sự suy ngẫm thực chứng. Hệ thống công cụ tự học huyền học trên Mệnh Thư luôn sẵn sàng hỗ trợ quý vị trên con đường tham ngộ chân lý vũ trụ."
          )
        )
      )
    )
  );
}
