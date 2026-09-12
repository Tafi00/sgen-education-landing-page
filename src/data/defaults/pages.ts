import type { DefaultPage } from "./types";

/**
 * Trang nội dung mặc định.
 *
 * Năm trang phục vụ nhóm giới thiệu và liên hệ. Trang `gioi-thieu` đóng vai trò
 * hub dẫn tới ba trang con về tầm nhìn, sứ mệnh và giá trị cốt lõi.
 */
export const defaultPages: DefaultPage[] = [
  {
    slug: "gioi-thieu",
    title: "Giới thiệu",
    eyebrow: "Về SGEN Education",
    accent: "trí tuệ, sống chủ đích",
    description: "SGEN kết nối tri thức phương Tây và tinh hoa phương Đông thành những hệ thống học tập dễ hiểu, có chiều sâu và áp dụng được vào đời sống.",
    blocks: [
      {
        type: "richText",
        order: 1,
        props: {
          heading: "Một hệ thống định hướng lấy con người làm trung tâm",
          paragraphs: [
            "SGEN Education ra đời với mong muốn biến những hệ thống kiến thức phức tạp thành bản đồ rõ ràng, để mỗi người nhận ra tiềm năng, hiểu bối cảnh và tự tin chọn hướng phát triển phù hợp.",
            "Chúng tôi không đưa ra một lời kết luận về số phận. SGEN cung cấp góc nhìn, công cụ và phương pháp để người học chủ động kiến tạo lựa chọn của mình.",
          ],
          bullets: [
            "Kiến thức được hệ thống hóa theo nguyên lý, không dựa vào phán đoán cảm tính",
            "Mỗi nội dung đều hướng đến một lựa chọn rõ ràng hơn trong học tập và công việc",
            "Tôn trọng khác biệt cá nhân và quyền tự quyết của người học",
          ],
        },
      },
      {
        type: "cards",
        order: 2,
        props: {
          heading: "Ba hệ phương pháp cốt lõi",
          items: [
            { title: "Pythagoras", text: "Hệ chỉ số từ tên và ngày sinh, dùng để quan sát xu hướng tính cách và động lực cá nhân." },
            { title: "Ikigai", text: "Khung tìm giao điểm giữa năng lực, đam mê, nhu cầu thị trường và giá trị đóng góp." },
            { title: "Tiến trình cuộc đời", text: "Cách đọc chu kỳ phát triển để đặt ưu tiên theo từng giai đoạn thay vì dàn trải nguồn lực." },
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        props: {
          heading: "Bắt đầu từ một lộ trình phù hợp",
          text: "Bạn có thể học để hiểu chính mình, hoặc đào sâu một chuyên đề ứng dụng cụ thể. Cả hai hướng đều bắt đầu bằng việc làm rõ mục tiêu.",
          primaryLabel: "Xem lộ trình học",
          primaryHref: "/khoa-hoc",
          secondaryLabel: "Liên hệ SGEN",
          secondaryHref: "/lien-he",
        },
      },
    ],
  },
  {
    slug: "gioi-thieu/tam-nhin",
    title: "Tầm nhìn",
    eyebrow: "Giới thiệu SGEN",
    accent: "tầm nhìn giáo dục",
    description: "Trở thành đơn vị giáo dục giúp người Việt dùng công cụ khám phá bản thân một cách có phương pháp, tỉnh táo và có trách nhiệm.",
    blocks: [
      {
        type: "richText",
        order: 1,
        props: {
          heading: "Giáo dục để hiểu, không phải để tin",
          paragraphs: [
            "Tầm nhìn của SGEN là đưa các hệ thống khám phá bản thân vào đúng vị trí của chúng: những công cụ hỗ trợ tư duy, có quy tắc rõ ràng, có thể kiểm chứng và luôn đặt dưới quyền tự quyết của người học.",
            "Chúng tôi hình dung một thế hệ người học biết đặt câu hỏi đúng, biết phân biệt dữ liệu với suy đoán, và biết dùng kết quả phân tích như điểm khởi đầu cho hành động thay vì lời giải thích cho mọi việc đã xảy ra.",
          ],
        },
      },
      {
        type: "cards",
        order: 2,
        props: {
          heading: "Ba trụ cột của định hướng",
          items: [
            { title: "Chuẩn phương pháp", text: "Mọi bộ chỉ số đều có quy tắc tính và nguồn gốc rõ ràng, học viên kiểm tra lại được." },
            { title: "Ứng dụng thực tiễn", text: "Kiến thức chỉ có giá trị khi chuyển thành một quyết định cụ thể trong học tập, nghề nghiệp hoặc đời sống." },
            { title: "Đạo đức hành nghề", text: "Không hứa hẹn kết quả, không khai thác nỗi sợ và không biến công cụ thành công cụ phán xét con người." },
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        props: {
          heading: "Cùng xây một cách học tỉnh táo",
          text: "Tìm hiểu thêm về sứ mệnh và những giá trị SGEN giữ vững trên từng lớp học.",
          primaryLabel: "Sứ mệnh của SGEN",
          primaryHref: "/gioi-thieu/su-menh",
          secondaryLabel: "Giá trị cốt lõi",
          secondaryHref: "/gioi-thieu/gia-tri-cot-loi",
        },
      },
    ],
  },
  {
    slug: "gioi-thieu/su-menh",
    title: "Sứ mệnh",
    eyebrow: "Giới thiệu SGEN",
    accent: "sứ mệnh đồng hành",
    description: "Biến kiến thức phức tạp thành lộ trình học tập dễ hiểu, có thực hành và có cộng đồng đồng hành lâu dài.",
    blocks: [
      {
        type: "richText",
        order: 1,
        props: {
          heading: "Đồng hành từ hiểu đến hành",
          paragraphs: [
            "SGEN tồn tại để rút ngắn khoảng cách giữa kiến thức và hành động. Mỗi khóa học đều kết thúc bằng một sản phẩm cụ thể: một bản đồ cá nhân đã đọc xong, một mặt bằng đã phân tích, một kế hoạch đã có bước đi đầu tiên.",
            "Chúng tôi chọn cách dạy chậm nhưng chắc: hiểu nguyên lý trước, thực hành có hướng dẫn sau, và kiểm chứng bằng trải nghiệm thật của chính người học.",
          ],
        },
      },
      {
        type: "timeline",
        order: 2,
        props: {
          heading: "Con đường học tập tại SGEN",
          items: [
            { title: "01 — Hiểu nền tảng", text: "Nắm quy tắc tính, thuật ngữ và giới hạn của từng hệ thống trước khi diễn giải." },
            { title: "02 — Thực hành có hướng dẫn", text: "Làm bài tập trên mẫu thực tế và nhận phản hồi từ giảng viên cùng nhóm học." },
            { title: "03 — Ứng dụng cho chính mình", text: "Chuyển kết quả phân tích thành một lựa chọn cụ thể trong đời sống hoặc công việc." },
            { title: "04 — Đồng hành dài hạn", text: "Tham gia cộng đồng học viên để cập nhật phương pháp và trao đổi tình huống mới." },
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        props: {
          heading: "Bắt đầu hành trình của bạn",
          text: "Chọn một lộ trình phù hợp với nhu cầu hiện tại, hoặc trao đổi trực tiếp với đội ngũ SGEN.",
          primaryLabel: "Xem khóa học",
          primaryHref: "/khoa-hoc",
          secondaryLabel: "Liên hệ tư vấn",
          secondaryHref: "/lien-he",
        },
      },
    ],
  },
  {
    slug: "gioi-thieu/gia-tri-cot-loi",
    title: "Giá trị cốt lõi",
    eyebrow: "Giới thiệu SGEN",
    accent: "giá trị giữ vững",
    description: "Những nguyên tắc định hình cách SGEN thiết kế chương trình, giảng dạy và tư vấn cho từng học viên.",
    blocks: [
      {
        type: "values",
        order: 1,
        props: {
          heading: "Điều SGEN luôn giữ vững",
          items: [
            { title: "Hiểu đúng bản chất", text: "Kiến thức được hệ thống hóa để người học hiểu nguyên lý, không phụ thuộc vào phán đoán cảm tính." },
            { title: "Ứng dụng thực tiễn", text: "Mỗi nội dung đều hướng đến một lựa chọn rõ ràng hơn trong học tập, sự nghiệp và đời sống." },
            { title: "Đồng hành tử tế", text: "Tôn trọng khác biệt cá nhân, bảo mật thông tin và trao quyền tự quyết cho mỗi học viên." },
            { title: "Nói rõ giới hạn", text: "Không hứa hẹn kết quả, không khẳng định điều chưa kiểm chứng và luôn nêu rõ phạm vi kết luận." },
          ],
        },
      },
      {
        type: "richText",
        order: 2,
        props: {
          heading: "Giá trị chỉ có nghĩa khi được thực hành",
          paragraphs: [
            "Những nguyên tắc trên không chỉ nằm trong tuyên bố. Chúng xuất hiện trong cách SGEN đặt bài tập, cách giảng viên phản hồi và cách các công cụ miễn phí trình bày kết quả kèm phần giải thích phương pháp.",
            "Người học được khuyến khích đối chiếu mọi nhận định với trải nghiệm cá nhân, và được hướng dẫn cách từ chối những kết luận vượt quá dữ liệu đang có.",
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        props: {
          heading: "Học cùng một cộng đồng có nguyên tắc",
          text: "Khám phá các chương trình được thiết kế theo đúng những giá trị này.",
          primaryLabel: "Xem khóa học",
          primaryHref: "/khoa-hoc",
          secondaryLabel: "Đọc blog SGEN",
          secondaryHref: "/blog",
        },
      },
    ],
  },
  {
    slug: "lien-he",
    title: "Liên hệ",
    eyebrow: "Kết nối với SGEN",
    accent: "đồng hành cùng bạn",
    description: "Gửi câu hỏi về khóa học, dịch vụ tư vấn hoặc hợp tác đào tạo. Đội ngũ SGEN phản hồi trong giờ làm việc.",
    blocks: [
      {
        type: "contactInfo",
        order: 1,
        props: {
          heading: "Thông tin liên hệ",
          items: [
            { label: "Hotline tư vấn", value: "0903 891 839", href: "tel:0903891839" },
            { label: "Email", value: "sgen.vn@gmail.com", href: "mailto:sgen.vn@gmail.com" },
            { label: "Địa chỉ", value: "57/27 Đình Tân Khai, P. Bình Trị Đông, Q. Bình Tân, TP.HCM" },
            { label: "Văn phòng", value: "700/2N Tỉnh Lộ 10, P. Bình Trị Đông, Q. Bình Tân, TP.HCM" },
            { label: "Giờ làm việc", value: "Thứ Hai – Thứ Bảy, 08:30 – 20:00" },
          ],
          note: "SGEN chỉ sử dụng thông tin bạn cung cấp cho mục đích tư vấn và không chia sẻ cho bên thứ ba.",
        },
      },
      {
        type: "map",
        order: 2,
        props: {
          heading: "Văn phòng SGEN Education",
          embed: "",
          address: "700/2N Tỉnh Lộ 10, P. Bình Trị Đông, Q. Bình Tân, TP.HCM",
          note: "Bản đồ sẽ được cập nhật khi khách hàng cung cấp liên kết nhúng chính thức.",
        },
      },
      {
        type: "faq",
        order: 3,
        props: {
          heading: "Câu hỏi thường gặp",
          items: [
            { question: "Tôi cần làm gì trước khi đặt lịch tư vấn?", answer: "Bạn chỉ cần chuẩn bị mục tiêu muốn làm rõ và thông tin cơ bản như họ tên, ngày sinh. Đội ngũ SGEN sẽ hướng dẫn phần còn lại trong buổi trao đổi." },
            { question: "SGEN có tư vấn trực tuyến không?", answer: "Có. Phần lớn khóa học và buổi tư vấn được thực hiện trực tuyến, phù hợp với học viên ở các tỉnh thành khác." },
            { question: "Thông tin cá nhân của tôi được xử lý thế nào?", answer: "Dữ liệu chỉ dùng cho phiên tra cứu và tư vấn, không công khai và không bán cho bên thứ ba. Bạn có thể yêu cầu xoá dữ liệu sau khi hoàn tất dịch vụ." },
          ],
        },
      },
    ],
  },
] satisfies DefaultPage[];
