/**
 * Nội dung luận giải trích từ bộ template PDF gốc của SGEN
 * (`Bản sao sgennumerology` — pdf_full/ + pdfteamplate/).
 * Mỗi chỉ số có `intro` (trang mở đầu) và `byValue` (luận giải theo con số).
 * File được sinh tự động — không sửa tay.
 */

export type MetricContent = { intro?: string[]; byValue: Record<string, string[]> };

export const NUMEROLOGY_CONTENT: Record<string, MetricContent> = {
  "soul": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 1 = KHAO KHÁT CHINH PHỤC & DẪN ĐẦU Nội Tâm Số 1 là người tiên phong trong mọi tình huống, năng lượng bên trong của bạn luôn sẵn sàng để được giải phóng bất cứ lúc nào. Trong công việc hay cuộc sống, bạn luôn sáng tạo theo cách riêng của mình để tạo ra sự khác biệt và độc đáo. Trong các mối quan hệ bạn có xu hướng tự bảo vệ mình khi thấy dấu hiệu không an toàn bằng cách “Tôi sẽ làm tổn thương bạn trước khi bạn có thể làm tổn thương tôi” . Nhưng trong sâu thẳm, bạn là một người lãng mạn trong vô vọng, nên đôi khi vì tình cảm mà bạn có thể đánh mất đi lý trí của mình. Sự quyến rũ của bạn sẽ hấp dẫn người khác phái và giúp bạn dễ dàng tiến xa hơn trong các mối quan hệ, nhưng bạn mong đợi sẽ tìm thấy điểm tương đồng ở người bạn đời của mình và muốn người khác cũng thông minh và độc lập như bạn. Bạn luôn truyền cảm hứng cho sự đổi mới, bạn là thỏi nam châm tích cực nên đôi khi dễ bị thu hút tham gia vào những điều đặc biệt khác lạ vì muốn khám phá và chinh phục những điều mới nhưng bạn cần rèn luyện tính kiên nhẫn."
      ],
      "11": [
        "11/2 NỘI TÂM SỐ 11/2 = KHAO KHÁT ĐƯỢC CHỮA LÀNH & TRUYỀN CẢM HỨNG Bạn sinh ra là để hoàn thành sứ mệnh làm cho thế giới trở nên tốt đẹp hơn và sẽ không thể nghỉ ngơi cho đến khi bản thân đã cống hiến cả cuộc đời mình cho mục đích vô giá. Bạn là một nhà hòa giải bẩm sinh, bạn có thể chữa lành tổn thương cho mọi người và có tầm nhìn xa trông rộng, lĩnh vực giỏi nhất của bạn là tâm linh và triết học.",
        "Bạn có một trí tuệ vượt trội giúp bản thân lĩnh hội những điều mà người bình thường khó có thể học được, trí não của bạn linh hoạt như một dòng điện giúp bạn có thể phát minh và tìm giải pháp cho các vấn đề đến với bạn một cách suôn sẻ đầy bất ngờ. Tuy nhiên bạn hay phải làm việc ở cường độ cao nên có thể gây căng thẳng cho thần kinh. Thiền là giải pháp tốt nhất cho bạn. Là người duy tâm và nhạy cảm lại có chút cầu toàn nên đôi khi hành xử của bạn tạo nên khoảng cách vô hình với người bạn đời lâu dần sẽ tạo nên sự cách biệt và khó hòa hợp. CHỈ SỐ NỘI TÂM"
      ],
      "13": [
        "4 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 4 = KHAO KHÁT SỰ THỰC TẾ & ỔN ĐỊNH Nội Tâm số 4 là người có tính cách cẩn trọng nên đôi khi tỏ ra lạnh lùng hoặc xa cách. Bạn luôn tiếp cận mọi thứ một cách thực tế, kể cả tình yêu, sự lãng mạn đối với bạn thật xa xỉ. Nếu bạn tạo ra sự lãng mạn, thì những hành động hoặc bữa tối lãng mạn đó sẽ được lên kế hoạch và thực hiện một cách hoàn hảo để đảm bảo sự thành công chắc chắn.",
        "Bạn là người sống kỷ luật rõ ràng, yêu ghét phân minh , ái tình dứt khoát, cho và nhận những món quà thiết thực hơn là những món quà phù phiếm. Phẩm chất tốt nhất của bạn là đáng tin cậy nên bạn sẽ xây dựng một cuộc sống có trật tự, hỗ trợ mạnh mẽ cho bạn đời của mình. Bạn tìm kiếm một tình yêu ổn định với người mà bạn cảm thấy tin tưởng để cùng xây dựng những ước mơ của mình. Nhưng đôi khi bạn hay thường xuyên bày tỏ chính kiến và bảo vệ quan điểm của mình, điều này làm cho bạn phí thời gian tranh luận với những người xung quanh."
      ],
      "14": [
        "5 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 5 = KHAO KHÁT SỰ TỰ DO & PHIÊU LƯU Nội Tâm số 5 là người đam mê du lịch và thích phiêu lưu mạo hiểm, bạn luôn luôn tìm cách đổi mới cuộc sống và không thích cảm giác bị gò bó, hoặc bị giới hạn trong các mối quan hệ . Bạn khó giữ lời hứa và cũng như không thể tuân thủ tốt các yêu cầu hoặc mệnh lệnh. Bạn nên là người tự làm chủ chính mình.",
        "Bạn thích tham gia vào nhiều dự án cùng một lúc. Bạn gặp khó khăn trong việc kiên trì thực hiện một dự án nhất định nào đó và hoàn thiện nó. Bạn nên rèn luyện tính kỷ luật và sự kiên trì của mình. Bạn thích hưởng thụ và vui chơi, bộ não của bạn cần được kích thích liên tục bởi những điều mới mẻ và hấp dẫn. Bạn có xu hướng tìm đến các trò tiêu khiển một cách nhanh chóng và cả thèm chóng chán. Bạn nên cẩn thận vì tình yêu với sự mới lạ có thể dẫn bạn đến việc nổi loạn, nghiện rượu, tình dục không lành mạnh và thậm chí ma túy. Kiểm soát cảm xúc là điều bạn cần luyện tập."
      ],
      "16": [
        "7 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 7 = KHAO KHÁT SỰ GIÁC NGỘ TÂM TINH Nội Tâm số 7 là người thông minh, kín đáo, tinh tế và quyến rũ. Bạn luôn bao phủ mình bằng một bức màn bí mật, tạo cho người khác ấn tượng rằng bạn là một người bí ẩn một cách thú vị và làm cho họ phải tò mò về bạn. Bạn là người tâm linh, việc cảm thấy trở thành nhà sư hoặc thầy tu là một ý tưởng hấp dẫn. Nên bạn có thể chọn một cuộc sống cô độc, ưu tiên việc của bản thân và ít xen vào chuyện người khác.",
        "Bạn có trực giác khá tốt nên cách tiếp cận khách quan của bạn đối với các mối quan hệ lãng mạn có thể gây ra sự ngờ vực, vì người kia có thể cảm thấy rằng bạn đang từ chối họ. Yêu và kết hôn là chuyện khó khăn nhất trong cuộc đời của bạn, nếu bạn chọn kết hôn, thì đó là lúc bạn thật sự trưởng thành và đối phương phải tạo cho bạn được cảm giác riêng tư và an toàn."
      ],
      "19": [
        "1 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 1 = KHAO KHÁT CHINH PHỤC & DẪN ĐẦU Nội Tâm Số 1 là người tiên phong trong mọi tình huống, năng lượng bên trong của bạn luôn sẵn sàng để được giải phóng bất cứ lúc nào. Trong công việc hay cuộc sống, bạn luôn sáng tạo theo cách riêng của mình để tạo ra sự khác biệt và độc đáo. Trong các mối quan hệ bạn có xu hướng tự bảo vệ mình khi thấy dấu hiệu không an toàn bằng cách “Tôi sẽ làm tổn thương bạn trước khi bạn có thể làm tổn thương tôi” . Nhưng trong sâu thẳm, bạn là một người lãng mạn trong vô vọng, nên đôi khi vì tình cảm mà bạn có thể đánh mất đi lý trí của mình. Sự quyến rũ của bạn sẽ hấp dẫn người khác phái và giúp bạn dễ dàng tiến xa hơn trong các mối quan hệ, nhưng bạn mong đợi sẽ tìm thấy điểm tương đồng ở người bạn đời của mình và muốn người khác cũng thông minh và độc lập như bạn. Bạn luôn truyền cảm hứng cho sự đổi mới, bạn là thỏi nam châm tích cực nên đôi khi dễ bị thu hút tham gia vào những điều đặc biệt khác lạ vì muốn khám phá và chinh phục những điều mới nhưng bạn cần rèn luyện tính kiên nhẫn."
      ],
      "2": [
        "2 Nội Tâm Số 2 là người không thích sống cô đơn, bạn sẽ cảm thấy tốt hơn khi ở cùng người khác, việc sống độc thân quá lâu sẽ khiến bạn buồn chán. Bạn là một người nhạy cảm nên bạn luôn chọn bạn đời dựa trên cảm xúc và có sự ưu tiên về tính cách. Những người có hành vi ứng xử tốt sẽ ghi điểm với bạn. Bạn có năng lực thấu hiểu người khác và hay đặt mình vào vị trí của họ. Bạn cũng là người tận tâm, cống hiến và điều quan trọng nhất là bạn cần thấy được sự tôn trọng từ mọi người. Bạn cực kỳ nhạy cảm bởi những lời chỉ trích có thể gây tổn hại sâu sắc đến mình. Bạn có thể làm bất cứ điều gì cần thiết để giữ hòa khí. Bạn là người khéo léo và tốt bụng, bạn có đầu óc phân tích tốt nên có thể nhìn thấy cả hai mặt của tình huống và bạn thích là người hỗ trợ trong mối quan hệ hơn là người dẫn dắt hay kiểm soát và lãnh đạo. Thật may mắn cho ai là bạn bè hay đồng đội của bạn, vì bạn dễ tiếp thu, luôn giữ hoà khí và đặc biệt là rất kiên nhẫn. CHỈ SỐ NỘI TÂM"
      ],
      "22": [
        "NỘI TÂM SỐ 22/4 = KHAO KHÁT ĐƯỢC KIẾN TẠO & NẮM GIỮ QUYỀN LỰC Nội Tâm con số Vua 22/4 bạn là người có lý tưởng vĩ đại, bạn luôn muốn tạo ra một phát minh hay tìm ra một định luật có tầm ảnh hưởng lâu dài đến thế giới. Cho dù đó là một phong trào chính trị, kinh doanh hay triết học, bạn đều có động lực mạnh mẽ để thực hiện chúng. Bạn có thể là một nhà lãnh đạo tuyệt vời, truyền cảm hứng và có tầm nhìn xa trông rộng.",
        "Bạn có khả năng sáng tạo của con số 22 và tính thực tế của con số 4. Sự kết hợp này có thể mang lại cho bạn khả năng để hiện thực hóa nguyện vọng của mình. Nhưng bạn nên nhớ rằng “càng cao danh vọng thì càng dày gian nan”, để thực hiện những hoài bão to lớn thì bạn phải tự cam kết và đặt ra kỷ luật với bản thân vì hầu hết con đường bạn chọn đi đều không dễ dàng. Một khi bạn bắt đầu sử dụng tài năng thực sự, thách thức của bạn phải đối mặt là khiêm tốn với những thành tựu của mình, vì việc thành công với bạn là đến sớm hay muộn mà thôi. Bạn là bậc thầy về xây dựng mối quan hệ và có khả năng kiểm soát đối phương mà vẫn tạo được cho họ cảm giác tự do, thao túng tâm lý là sở trường của bạn. 22/4 CHỈ SỐ NỘI TÂM"
      ],
      "3": [
        "3 CHỈ SỐ NỘI TÂM",
        "Nội Tâm số 3 là người có khả năng kết nối, mang đến tiếng cười cho nhân loại, sự sáng tạo của bạn giúp cho thế giới vui vẻ hơn và đặc biệt bạn là người rất dễ gần. Bạn có trường năng lượng mạnh mang lại sự may mắn cho người khác. Bạn có khả năng mê hoặc và quyến rũ người khác bằng tính hài hước của mình, khiến người khác bật cười và cảm thấy bạn có cá tính đặc biệt thú vị. Bạn có xu hướng chạy theo những cuộc vui và đấu tranh với tâm lý “ cỏ bên kia đồi luôn xanh hơn” , điều này có thể khiến bạn trở nên thiếu độ tin cậy trong các mối quan hệ và khó giữ được lập trường của mình. Bạn có thể che giấu cảm xúc thật của mình bằng sự hài hước và nói liên tục. Nhưng nếu không thể che giấu và để người khác biết được bạn không vui thì điều này sẽ làm cho bạn cảm thấy tổn thương gấp nhiều lần."
      ],
      "4": [
        "4 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 4 = KHAO KHÁT SỰ THỰC TẾ & ỔN ĐỊNH Nội Tâm số 4 là người có tính cách cẩn trọng nên đôi khi tỏ ra lạnh lùng hoặc xa cách. Bạn luôn tiếp cận mọi thứ một cách thực tế, kể cả tình yêu, sự lãng mạn đối với bạn thật xa xỉ. Nếu bạn tạo ra sự lãng mạn, thì những hành động hoặc bữa tối lãng mạn đó sẽ được lên kế hoạch và thực hiện một cách hoàn hảo để đảm bảo sự thành công chắc chắn.",
        "Bạn là người sống kỷ luật rõ ràng, yêu ghét phân minh , ái tình dứt khoát, cho và nhận những món quà thiết thực hơn là những món quà phù phiếm. Phẩm chất tốt nhất của bạn là đáng tin cậy nên bạn sẽ xây dựng một cuộc sống có trật tự, hỗ trợ mạnh mẽ cho bạn đời của mình. Bạn tìm kiếm một tình yêu ổn định với người mà bạn cảm thấy tin tưởng để cùng xây dựng những ước mơ của mình. Nhưng đôi khi bạn hay thường xuyên bày tỏ chính kiến và bảo vệ quan điểm của mình, điều này làm cho bạn phí thời gian tranh luận với những người xung quanh."
      ],
      "5": [
        "5 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 5 = KHAO KHÁT SỰ TỰ DO & PHIÊU LƯU Nội Tâm số 5 là người đam mê du lịch và thích phiêu lưu mạo hiểm, bạn luôn luôn tìm cách đổi mới cuộc sống và không thích cảm giác bị gò bó, hoặc bị giới hạn trong các mối quan hệ . Bạn khó giữ lời hứa và cũng như không thể tuân thủ tốt các yêu cầu hoặc mệnh lệnh. Bạn nên là người tự làm chủ chính mình.",
        "Bạn thích tham gia vào nhiều dự án cùng một lúc. Bạn gặp khó khăn trong việc kiên trì thực hiện một dự án nhất định nào đó và hoàn thiện nó. Bạn nên rèn luyện tính kỷ luật và sự kiên trì của mình. Bạn thích hưởng thụ và vui chơi, bộ não của bạn cần được kích thích liên tục bởi những điều mới mẻ và hấp dẫn. Bạn có xu hướng tìm đến các trò tiêu khiển một cách nhanh chóng và cả thèm chóng chán. Bạn nên cẩn thận vì tình yêu với sự mới lạ có thể dẫn bạn đến việc nổi loạn, nghiện rượu, tình dục không lành mạnh và thậm chí ma túy. Kiểm soát cảm xúc là điều bạn cần luyện tập."
      ],
      "6": [
        "6 NỘI TÂM SỐ 6 = KHAO KHÁT THẤU HIỂU & YÊU THƯƠNG Nội Tâm số 6 là người giàu lòng trắc ẩn, đa cảm, từ bi và thấu hiểu người khác, từ sâu thẳm bên trong bạn luôn muốn giúp đỡ tất cả mọi người đang gặp hoàn cảnh khó khăn. Bạn là một anh hùng ngoài đời thật, bạn có xu hướng ra tay bảo vệ kẻ yếu thế hơn, bạn thường ôm tất cả mọi việc vào người như thể không có bạn thì công việc sẽ không thể hoàn thành tốt nhất, sự lo lắng thái quá đôi khi làm cho bạn mệt mỏi và bị quá tải.",
        "Điều mong muốn lớn nhất của bạn là yêu thương và được yêu. Bạn có xu hướng lý tưởng hóa tình yêu, tạo ra hình ảnh về một cuộc sống tươi đẹp và hoàn hảo, sau đó phấn đấu vì nó. Bạn là người thuỷ chung và luôn cam kết trong các mối quan hệ, với suy nghĩ mình luôn đúng nên bạn hay thích lắng nghe và đưa ra các lời khuyên để hỗ trợ người khác. Với tình yêu sâu sắc dành cho tổ ấm của mình, bạn thường mong muốn có con nhiều hơn so với các chỉ số còn lại. CHỈ SỐ NỘI TÂM"
      ],
      "7": [
        "7 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 7 = KHAO KHÁT SỰ GIÁC NGỘ TÂM TINH Nội Tâm số 7 là người thông minh, kín đáo, tinh tế và quyến rũ. Bạn luôn bao phủ mình bằng một bức màn bí mật, tạo cho người khác ấn tượng rằng bạn là một người bí ẩn một cách thú vị và làm cho họ phải tò mò về bạn. Bạn là người tâm linh, việc cảm thấy trở thành nhà sư hoặc thầy tu là một ý tưởng hấp dẫn. Nên bạn có thể chọn một cuộc sống cô độc, ưu tiên việc của bản thân và ít xen vào chuyện người khác.",
        "Bạn có trực giác khá tốt nên cách tiếp cận khách quan của bạn đối với các mối quan hệ lãng mạn có thể gây ra sự ngờ vực, vì người kia có thể cảm thấy rằng bạn đang từ chối họ. Yêu và kết hôn là chuyện khó khăn nhất trong cuộc đời của bạn, nếu bạn chọn kết hôn, thì đó là lúc bạn thật sự trưởng thành và đối phương phải tạo cho bạn được cảm giác riêng tư và an toàn."
      ],
      "8": [
        "8 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 8 = KHAO KHÁT SỰ THỊNH VƯỢNG & GIÀU CÓ Tâm số 8 là người đặt mục tiêu thành công về tài chính là sự ưu tiên hàng đầu. Bạn là người hiểu được thành công phải có đầy đủ tất cả các yếu tố về vật chất, quyền lực và sức khỏe và danh tiếng, điều quan trọng là người khác phải công nhận và khâm phục bạn là người thành công. Bạn là người có đầu óc kinh doanh tuyệt vời, luôn nghĩ về những dự án vĩ mô, những công việc tuyệt vời đi kèm với những phần thưởng lớn bên cạnh đó bạn không ngại vất vả và có thể làm tất cả để đạt được mục đích như bạn mong muốn, thử thách lớn đối với bạn không là gì nếu như phần thưởng xứng đáng.",
        "Bạn sinh ra là để kinh doanh và làm chủ về tài chính, nhưng đôi khi bạn quá thực dụng và tham vọng vì vậy nếu rơi vào trạng thái tiêu cực thì bạn trở nên nóng tính, chán nản và buông xuôi. Đối với các mối quan hệ thì người bạn đời lý tưởng của bạn phải hấp dẫn, có năng lực và được định hướng phấn đấu giống như bạn."
      ],
      "9": [
        "9 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 9 = KHAO KHÁT ĐƯỢC CỐNG HIẾN & CHO ĐI Nội Tâm số 9 bạn là người rộng lượng và vị tha, đôi khi bạn cho mình đặc quyền để tha thứ cho người khác cũng như tự tìm lý do thuyết phục bản thân để bỏ qua chuyện họ đã làm sai hoặc tổn thương bạn. Bạn cực kỳ khôn ngoan và có tài năng với trực giác đặc biệt. nhờ vậy bạn rất chu đáo và luôn đoán trước được nhu cầu của người bạn đời khiến họ cảm thấy được chiều chuộng như bậc đế vương.",
        "Vì quá hiểu người khác nên bạn hay bị giằng xé giữa nhu cầu bản thân và nhu cầu của đối phương, điều này làm cảm xúc của bạn hay thay đổi thất thường và có xu hướng chỉ trích khi rơi vào trạng thái không tốt, bạn sẽ thất vọng khi mọi người không thể đáp ứng kỳ vọng cao của bạn. Đôi khi viết nhật ký là cách chữ lành tốt nhất đối với bạn, mơ ước thầm kín của bạn là có thể ảnh hưởng lớn đến thế giới và thậm chí có thể trở nên nổi tiếng và chu du khắp thế giới."
      ]
    },
    "intro": [
      "Chỉ số Nội Tâm là những gì ẩn sâu bên trong tâm thức của bạn, bao gồm những ước mơ, hoài bão, khao khát và động lực thực sự bên trong con người của bạn. Nó quyết định cách bạn hành động trong các mối quan hệ xung quanh. Nó ảnh hưởng rất nhiều đến những lựa chọn của bạn trong cuộc sống. Ảnh hưởng của nó ở khắp nơi từ đời sống, sự nghiệp, môi trường, tình cảm và phong cách sống của bạn. Khi chỉ số nội tâm hài hòa với chỉ số đường đời, bạn sẽ dễ dàng đưa ra quyết định. Khi nó trùng với chỉ số đường đời thì nó thúc đẩy năng lượng của con số đường đời rất mạnh, thúc đẩy bạn hành động để chinh phục mục tiêu cuộc đời của mình. Nếu chỉ số nội tâm xung đột với chỉ số đường đời thì bạn sẽ thiếu quyết đoán, tâm trí và trái tim mong muốn những điều mâu thuẫn lẫn nhau sinh ra trì hoãn và không đi đến được hành động dứt khoát. CHỈ SỐ NỘI TÂM"
    ]
  },
  "subconscious": {
    "byValue": {
      "3": [
        "TIỀM THỨC SỐ 3 = TẬP TRUNG MỤC TIÊU Bạn ứng phó với các trường hợp khẩn cấp bằng cách tìm kiếm sự giúp đỡ từ bạn bè và gia đình. Tuy nhiên, cuộc sống sẽ buộc bạn phải đương đầu với khó khăn cho đến khi bạn học được cách sử dụng sức mạnh của chính mình. Bạn sẽ sớm tìm được người yêu và bạn đời mà họ có thể hỗ trợ cho bạn, có thể bạn sẽ kết hôn với một người trưởng thành hơn bạn, người mà mang đến sự an toàn và che chở cho bạn.",
        "Bạn phải kiểm soát cảm xúc của mình tránh rơi vào trạng thái chán nản và buông xuôi, đừng làm chuyện nhỏ trở thành vấn đề phức tạp to lớn nếu không bạn sẽ đẩy sự việc đi quá xa và mất kiểm soát, bạn hãy nhớ chỉ cần bình tĩnh thì mọi vấn đề đều có thể giải quyết. Bạn phải nhìn lại bạn bè xung quanh để xem những gì mình hy sinh có thật sự xứng đáng hay không? đôi lúc cần phải chọn bạn mà chơi! Khi bạn nhận ra bạn thật sự giỏi làm một việc gì đó thì đó là món quà mà tạo hoá đã ban tặng cho bạn, lúc này bạn cần tập trung vào một việc bạn chọn và hướng tới thành công."
      ],
      "4": [
        "4 CHỈ SỐ TIỀM THỨC",
        "TIỀM THỨC SỐ 4 = XÂY DỰNG NỀN TẢNG VỮNG CHẮC Bạn có xu hướng đánh mất bản thân cho những chi tiết nhỏ nhặt, gây ra sự bối rối và thiếu quyết đoán và thậm chí là làm tê liệt khả năng phản ứng nhanh và mạnh mẽ của bản thân. Cầu toàn để đi đến sự hoàn hảo nhưng trong trường hợp của bạn thì cầu toàn sẽ làm cho bạn đứng yên tại chỗ, bạn cần bỏ đi những tiểu tiết để hướng đến những việc lớn hơn. Bạn phải học cách tin tưởng vào bản thân của mình và hành động một cách nhanh chóng. Phải tránh do dự và trì hoãn. Bạn cần xây dựng một nền tảng vững chắc trong cuộc sống của mình về công việc cũng như tinh thần. Số 4 tiềm thức chỉ ra rằng nếu bạn muốn kiểm soát thế giới thì trước hết hãy kiểm soát được cảm xúc của mình, hãy sẵn sàng ra ngoài và hành động để theo đuổi ước mơ của bạn vì hành động của bạn sẽ đưa bạn lên những cấp độ cao hơn và sẽ giúp bạn gặt hái được hạnh phúc mà bạn mong muốn. Bạn cần một người bạn đời thúc đẩy bạn phát triển cùng với một gia đình và môi trường làm việc mà bạn phải có trách nhiệm."
      ],
      "5": [
        "5 CHỈ SỐ TIỀM THỨC",
        "TIỀM THỨC SỐ 5 = HÃY KỶ LUẬT VÀ CÓ TỔ CHỨC Chỉ số 5 báo cho bạn biết rằng khi bạn làm quá nhiều việc cùng một lúc thì năng lượng sẽ bị phân tán khiến cho các dự án và kế hoạch của bạn khó hoàn thành như mong đợi.",
        "Hơn ai hết bạn là người cần có sự kỷ luật đối với bản thân của mình. Thay vì cố giải quyết vấn đề thì hãy chọn cách thay đổi nó bạn sẽ tìm được hướng đi mới tốt hơn. Đừng tìm kiếm hạnh phúc bởi vì hạnh phúc là trong suy nghĩ của mỗi người, việc bạn cần làm là hoàn thành thật tốt những việc nhỏ nhất thì hạnh phúc sẽ đến với bạn trọn vẹn nhất. Bạn được đặc ân là học hỏi rất nhanh và thích nghi tốt với sự thay đổi nên bạn đừng ngại thay đổi, sự thay đổi có thể giúp bạn căng buồm vươn ra biển lớn nhưng bạn nên nhớ cần chuẩn bị thật tốt cho bản thân và biết nhìn nhận trách nhiệm về mình.",
        "Gia đình và sự nghiệp đóng vai trò quan trọng trong cuộc sống của bạn, nên tốt hơn hết bạn hãy lấy đó làm động lực và phát triển bản thân thì bạn sẽ nhanh chóng gặt hái được thành công như mong đợi."
      ],
      "6": [
        "6 CHỈ SỐ TIỀM THỨC",
        "TIỀM THỨC SỐ 6 = HÃY YÊU THƯƠNG BẢN THÂN Bạn thích giúp đỡ người khác, đôi khi bạn nhiệt tình đến mức không quan tâm đến quyền lợi của bản thân nên thường hay nhận thua thiệt về mình. Bạn là người có trách nhiệm cao và sẵn sàng hy sinh vì người khác nếu bạn cảm thấy hy sinh là điều xứng đáng với họ. Nhưng đừng để người khác xem việc giúp họ là bổn phận và trách nhiệm của bạn! Bạn tỏa ra tình yêu thương và sự quan tâm chân thành dành cho người khác. Bù lại những lúc bạn cảm thấy kiệt sức thì gia đình và bạn bè là chỗ dựa tinh thần tốt nhất đối với bạn. Trong tình yêu bạn luôn tìm cách làm những điều tốt nhất cho đối phương và sẵn sàng hy sinh để họ được tốt hơn nên đôi khi bạn phải chịu tổn thương mà họ không hề hay biết. Để không bị người khác lợi dụng lòng tốt của mình thì lời khuyên tốt nhất dành cho bạn là hãy lập gia đình hoặc ưu tiên người thân trong gia đình vì khi đó bạn sẽ quan tâm đến tổ ấm của mình và những thứ khác đều được bạn xếp ở vị trí thứ hai."
      ],
      "7": [
        "7 CHỈ SỐ TIỀM THỨC",
        "TIỀM THỨC SỐ 7 = HÃY MỞ LÒNG CHIA SẺ Con số 7 tiềm thức nói lên rằng bạn là người có tâm bất biến giữa dòng đời vạn biến. Bạn có thể tỏ ra thờ ơ với môi trường xung quanh và có phần xa cách. Bạn là người có tính cân bằng nội tâm và có thể sống sót qua nhiều cơn bão trong cuộc sống. Mọi sự cám dỗ bạn đều có thể vượt qua một cách dễ dàng. Bạn chọn cuộc sống đơn độc và không chia sẻ cảm xúc của mình với người khác, bạn sống kín đáo nên việc người khác có biết bạn hay không đó không phải là vấn đề quan trọng. Bạn tự tìm niềm vui trong sự sáng tạo và phân tích sự việc từ kinh nghiệm của bản thân. Việc lựa chọn công việc có tính chất nghiên cứu và phát minh sẽ giúp bạn thăng hoa hơn trong cuộc sống. Trong mối quan hệ bạn cần làm cho đối phương hiểu mình nếu không họ sẽ rơi vào trạng thái bất an và từ từ sẽ xa cách bạn."
      ],
      "8": [
        "8 CHỈ SỐ TIỀM THỨC",
        "TIỀM THỨC SỐ 8 = KÍCH HOẠT TÂM THỨC TÀI CHÍNH Bạn là người tuỳ cơ ứng biến cực tốt, đối với bạn kinh nghiệm của bạn là những bài học vô giá vì nó có thể giúp bạn xử lý các tình huống bất ngờ một cách hữu hiệu và thường xoay xở để đạt được hiệu quả tốt nhất. Học hỏi nhanh và thường không lặp lại những sai lầm cũ là một trong những kỹ năng tuyệt vời của bạn. Bạn muốn được khen thưởng cho những nỗ lực của bản thân và liên hệ thành công của mình bằng vật chất cụ thể, được công nhận là động lực tốt nhất dành cho bạn. Bạn là người đáng tin cậy và vững chắc trong hầu hết mọi tình huống. Bạn không dễ dàng trở nên hoảng loạn và sợ hãi khi rơi vào những tình huống nguy cấp, sự bình tĩnh của bạn khi xử lý công việc trọng đại làm cho bạn trở nên khác biệt. Bạn có một cốt cách của doanh nhân, khi đối mặt với các vấn đề bạn sẽ nhanh chóng nhận ra những gì cần phải làm. Não của bạn hiểu được nguyên tắc vận hành của tiền bạc và bạn có thể làm chủ thế giới vật chất. Năng lực lãnh đạo và tổ chức của bạn thật tuyệt vời."
      ],
      "9": [
        "9 CHỈ SỐ TIỀM THỨC",
        "TIỀM THỨC SỐ 9 = KIỂM SOÁT TỰ MÃN Tự cho mình hiểu rõ về người khác là điều mà bất cứ ai cũng có thể mắc sai lầm vì đôi khi chúng ta không thể nhìn mặt mà bắt hình dong . Nên việc gặp rắc rối về các mối quan hệ xung quanh là điều không thể tránh khỏi. Cẩn trọng lời nói của bạn vì có thể nó dễ dàng gây hiểu lầm với người khác rằng bạn đang tỏ ra kiêu ngạo thay vì chỉ là tự hào và vui mừng. Mặc dù bạn nghĩ rằng mình là người quan tâm đến người khác và thậm chí là rất nhiều nhưng sự thật là bạn đang dần xa cách với các mối quan hệ của mình vì không ai muốn nghe về hạnh phúc của bạn hay những gì bạn thành công khi họ đang gặp nhiều vấn đề rắc rối và thất bại, nên việc nói về bản thân quá nhiều sẽ làm cho bạn trở nên tự mãn và đơn độc. Kiểm soát bản thân và lời nói của bạn, khiêm tốn là điều giúp bạn tiến xa hơn trong công việc cũng như các mối quan hệ xung quanh."
      ]
    },
    "intro": [
      "CHỈ SỐ TIỀM THỨC",
      "Chỉ số tiềm thức nói lên sự tự tin và năng lực cá nhân của mỗi người khi ứng phó với các sự kiện và tình huống đột ngột xảy ra trong cuộc sống. Nó còn cho bạn biết về sức mạnh bên trong của bạn để đối mặt với các thử thách và sự cố bất ngờ xảy đến trong cuộc đời bạn. Khi cuộc sống thay đổi đột ngột thì chỉ số này cho thấy bạn sẽ ứng phó với những tình huống dựa trên sự tự tin và năng lực của mình như thế nào. Khi bạn phải đối mặt với những tình huống khác nhau trong cuộc sống, bạn sẽ phải đưa ra quyết định để giải quyết những tình huống khó khăn thì tiềm thức sẽ cho bạn biết cách đối phó với những tình huống đó. Bên cạnh đó, nó cũng phản ánh những yếu điểm và một phần tính cách bạn cần phải củng cố và thay đổi. Hãy vận dụng tối ưu chỉ số này để giúp bạn kích hoạt tiềm thức trong ứng xử một cách hợp lý."
    ]
  },
  "logic": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 1: NGƯỜI ĐỘT PHÁ Bạn sở hữu một bộ óc sắc bén và nhanh nhạy có thể nảy sinh ra những ý tưởng hay và sáng tạo chỉ trong thời gian ngắn. Cách xử lý thông tin của bạn nhanh chóng, tận dụng thông tin cho một mục đích cụ thể, nhưng có xu hướng đưa nó vào trí nhớ ngắn hạn và quên nó đi khi nó không còn liên quan đến nhu cầu trước mắt của bạn. Bạn là người có nhiều ý tưởng cực kỳ độc đáo. Bạn thích ứng tuyển vào vị trí cấp cao của bất kỳ doanh nghiệp nào để đưa ra các phương pháp sáng tạo và giúp công ty phát triển tốt nhất. Bạn là người học nhanh, tiếp nhận thông tin nhanh chóng nên dễ dàng học nhiều loại ngôn ngữ khác nhau. Sự đột phá của bạn sẽ mang đến thành công bất ngờ cho doanh nghiệp mà bạn hết lòng phò trợ."
      ],
      "11": [
        "11/2 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 11/2: NGƯỜI THÔNG THÁI Bạn có tư duy của một nhà thông thái, có tầm hiểu biết rộng và luôn đưa ra những sự lựa chọn đúng đắn, phù hợp. Bạn có khả năng tiếp thu, thẩm thấu và làm chủ được những kiến thức, nhìn nhận các vấn đề một cách chính xác và hành xử một cách hợp lý và khéo léo.",
        "Bạn có khả năng sáng tạo, truyền đạt kiến thức và truyền cảm hứng cho mọi người, điều này giúp bạn luôn có được kính trọng đặc biệt trong lòng mọi người nhưng bên cạnh đó bạn cũng cực kỳ nhạy cảm với những lời chỉ trích và gặp khó khăn để giải quyết điều đó. Trong công việc bạn luôn có những phát minh, ý tưởng mới và những giải pháp độc đáo để phát triển công việc một cách tốt nhất. Bạn có sức hút đặc biệt cùng với những ý tưởng thú vị khiến bạn trở nên hấp dẫn đối với người khác phái, và đặc biệt bạn luôn thể hiện vị thế của mình trong các cuộc thương lượng điều này làm cho bạn có một đẳng cấp nhất định trong mắt người khác"
      ],
      "13": [
        "4 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 4: NGƯỜI QUY TRÌNH Bạn là một chiến lược gia đa tài với con mắt quan sát tỉ mỉ, làm việc gì cũng cẩn thận và chú ý đến từng chi tiết nhỏ. Bạn làm việc một cách tận tâm và luôn sống thực tế. Tuy nhiên, đôi khi vì quá tập trung vào chi tiết mà bạn lại mất đi tầm nhìn tổng thể, bạn có thể phát hiện lỗ thủng nhỏ trên con tàu và bịt nó lại nhưng đừng quên chú ý phía trước vì còn rất nhiều tảng băng khiến cho con tàu có thể vỡ đôi.",
        "Sự kiên trì, bền bỉ là ưu điểm của bạn, với niềm tin mãnh liệt rằng mọi việc đều có thể giải quyết một cách triệt để nên tất cả mọi việc bạn làm đều có trình tự và giải quyết một cách chu đáo. Trong mối các quan hệ đôi khi bạn quá để ý tiểu tiết sẽ làm cho đối phương cảm thấy tự ti, bạn luôn nhớ rằng không ai là hoàn hảo cả, nên khi phán xét người khác thì hãy nhớ rằng bản thân mình cũng chưa hoàn hảo, điều này sẽ giúp bạn có mối quan hệ hoà hợp hơn trong cuộc sống."
      ],
      "14": [
        "5 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 5: NGƯỜI LINH HOẠT Bạn sẽ có những phát minh giúp con người rút ngắn được thời gian để hoàn thành công việc vì bạn có một bộ óc nhanh nhạy và rất linh hoạt. Bạn có thể hấp thụ một lượng lớn thông tin một cách nhanh chóng và giữ lại những điểm quan trọng. Bạn rất tự tin trong tình huống nan giải hoặc nguy cấp, nếu có sự cố xảy ra thì bạn là người giải quyết vấn đề một cách nhanh chóng và ổn thỏa. Tuy nhiên, bạn thiếu kiên nhẫn khi phải tuân theo một quy trình được định sẵn và sẽ nổi loạn nếu bị buộc phải tuân theo bất kỳ khuôn mẫu nào trong một thời gian dài. Nên bạn thường tham gia vào nhiều dự án cùng một lúc. Bạn linh hoạt và tháo vác, sự linh hoạt giúp bạn có được vị trí dẫn đầu nhưng bạn nên nhớ rằng kỷ luật là sợi dây tốt nhất để giữ con diều bay được cao và xa hơn."
      ],
      "16": [
        "7 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 7: NGƯỜI UYÊN BÁC Bạn là trung tâm lưu trữ kiến thức, là thỏi nam châm tích cực để phát ra nguồn năng lượng lan tỏa đến mọi người xung quanh. Là một người hiếu học, bạn luôn rèn luyện bộ não của mình để trở nên uyên bác, có thể bạn là một thiên tài trong một lĩnh vực nghiên cứu vì bạn luôn nghiên cứu chuyên sâu về một chủ đề, và rất ghét sự hiểu biết hời hợt về bất cứ điều gì mà bạn xem là quan trọng. Đừng ai dại dột tranh luận với bạn về kiến thức, điều đó khiến bạn trở nên gắt gỏng vì sự thiếu hiểu biết của họ. Ngoài kiến thức uyên bác thì bạn lại có thêm một trực giác tuyệt vời, nó mang đến cho bạn rất nhiều lợi ích trong cuộc sống, giúp bạn tiên đoán được sự việc và hành động đúng. Bạn thường hay bí mật tìm hiểu người khác và phân tích họ qua những lỗi lầm, bạn luôn để tâm quá nhiều vào mặt tối của sự việc và đó là nguyên tắc sống của bạn."
      ],
      "19": [
        "1 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 1: NGƯỜI ĐỘT PHÁ Bạn sở hữu một bộ óc sắc bén và nhanh nhạy có thể nảy sinh ra những ý tưởng hay và sáng tạo chỉ trong thời gian ngắn. Cách xử lý thông tin của bạn nhanh chóng, tận dụng thông tin cho một mục đích cụ thể, nhưng có xu hướng đưa nó vào trí nhớ ngắn hạn và quên nó đi khi nó không còn liên quan đến nhu cầu trước mắt của bạn. Bạn là người có nhiều ý tưởng cực kỳ độc đáo. Bạn thích ứng tuyển vào vị trí cấp cao của bất kỳ doanh nghiệp nào để đưa ra các phương pháp sáng tạo và giúp công ty phát triển tốt nhất. Bạn là người học nhanh, tiếp nhận thông tin nhanh chóng nên dễ dàng học nhiều loại ngôn ngữ khác nhau. Sự đột phá của bạn sẽ mang đến thành công bất ngờ cho doanh nghiệp mà bạn hết lòng phò trợ."
      ],
      "2": [
        "2 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 2: NGƯỜI HOÀ GIẢI Tư duy logic số 2 là người biết nhún nhường và giữ hòa khí, khả năng nhẫn nhịn của bạn vượt trội hơn người khác giúp cho bạn có được nhiều thiện cảm trong các mối quan hệ. Bạn có thể lưu giữ nhiều thông tin và kiến thức nhờ vào trí nhớ tốt của bạn, cẩn trọng và người sống thiên về cảm xúc nên bạn rất nhạy cảm với những lời nói của người khác. Sự nhạy cảm của bạn giúp bạn tránh được những chuyện xung đột không đáng có. Bạn sở hữu một khả năng linh hoạt vượt trội, luôn cảm thông và hướng tới giải pháp hòa bình nên đôi khi hay làm hài lòng người khác và nhún nhường đối phương. Bạn luôn hiểu mình, hiểu người và hướng tới sự đơn giản. Bạn luôn là trung tâm hòa giải trong gia đình và các mối quan hệ bạn bè, bạn luôn hướng đến cuộc sống yên bình giản dị"
      ],
      "22": [
        "22/4 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 22/4: NGƯỜI CÓ TẦM NHÌN Một cơn bão đi qua có thể cuốn trôi hết tất cả nhưng bạn lại là người sống sót, không phải bạn may mắn mà là vì bạn là người có tầm nhìn xa để chuẩn bị cho những sự cố bất ngờ xảy ra trong cuộc đời mình. Với con mắt quan sát chi tiết thì bạn luôn có những kế hoạch tuyệt vời, cộng với sự kiên trì, bền bỉ của bạn thì trong tâm trí của bạn mọi việc đều có cách giải quyết ổn thỏa.",
        "Bạn là người bình tĩnh và tự tin nên khi gặp vấn đề cần giải quyết thì bạn luôn ung dung tự tại mà làm theo thứ tự và quy trình đã được định sẵn trong đầu của mình. Đây là con số Vua rất khó khai thác và rất ít người có được nên đòi hỏi người sở hữu nó phải vượt qua được nỗi sợ liên quan đến kỳ vọng và sự công nhận của những người xung quanh, sự can đảm và tự tin là động lực cần thiết để bạn có thể phát huy tối đa tài năng của bạn."
      ],
      "3": [
        "3 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 3: NGƯỜI SÁNG TẠO Sáng tạo nghệ thuật là công việc không thể thiếu đối với bạn, dù bạn là một kỹ sư thì việc chế tạo ra một chiếc máy kỳ dị là điều bạn cảm thấy hứng thú và ý nghĩa. Nhưng đi kèm với sự sáng tạo thì bạn luôn muốn cho cả thế giới biết tài năng của bạn nên đôi khi bạn bị đánh giá là khoa trương. Thời trang, thiết kế nội thất, kiến trúc hay các ngành nghề có liên quan đến sáng tạo nghệ thuật đều làm cho bạn hài lòng. Không những vậy, bạn là người thật sự có tài trong việc thiết kế không gian văn phòng và cảnh quan.",
        "Một căn nhà độc đáo được sáng tạo theo ý của bạn là điều bạn mong muốn. Tuy nhiên, bạn có thể bị phân tán tinh thần, những suy nghĩ xuất hiện trong đầu bạn dường như theo một cách ngẫu nhiên. Bạn cần phát triển tính kỷ luật và sự tập trung."
      ],
      "4": [
        "4 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 4: NGƯỜI QUY TRÌNH Bạn là một chiến lược gia đa tài với con mắt quan sát tỉ mỉ, làm việc gì cũng cẩn thận và chú ý đến từng chi tiết nhỏ. Bạn làm việc một cách tận tâm và luôn sống thực tế. Tuy nhiên, đôi khi vì quá tập trung vào chi tiết mà bạn lại mất đi tầm nhìn tổng thể, bạn có thể phát hiện lỗ thủng nhỏ trên con tàu và bịt nó lại nhưng đừng quên chú ý phía trước vì còn rất nhiều tảng băng khiến cho con tàu có thể vỡ đôi.",
        "Sự kiên trì, bền bỉ là ưu điểm của bạn, với niềm tin mãnh liệt rằng mọi việc đều có thể giải quyết một cách triệt để nên tất cả mọi việc bạn làm đều có trình tự và giải quyết một cách chu đáo. Trong mối các quan hệ đôi khi bạn quá để ý tiểu tiết sẽ làm cho đối phương cảm thấy tự ti, bạn luôn nhớ rằng không ai là hoàn hảo cả, nên khi phán xét người khác thì hãy nhớ rằng bản thân mình cũng chưa hoàn hảo, điều này sẽ giúp bạn có mối quan hệ hoà hợp hơn trong cuộc sống."
      ],
      "5": [
        "5 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 5: NGƯỜI LINH HOẠT Bạn sẽ có những phát minh giúp con người rút ngắn được thời gian để hoàn thành công việc vì bạn có một bộ óc nhanh nhạy và rất linh hoạt. Bạn có thể hấp thụ một lượng lớn thông tin một cách nhanh chóng và giữ lại những điểm quan trọng. Bạn rất tự tin trong tình huống nan giải hoặc nguy cấp, nếu có sự cố xảy ra thì bạn là người giải quyết vấn đề một cách nhanh chóng và ổn thỏa. Tuy nhiên, bạn thiếu kiên nhẫn khi phải tuân theo một quy trình được định sẵn và sẽ nổi loạn nếu bị buộc phải tuân theo bất kỳ khuôn mẫu nào trong một thời gian dài. Nên bạn thường tham gia vào nhiều dự án cùng một lúc. Bạn linh hoạt và tháo vát, sự linh hoạt giúp bạn có được vị trí dẫn đầu nhưng bạn nên nhớ rằng kỷ luật là sợi dây tốt nhất để giữ con diều bay được cao và xa hơn."
      ],
      "6": [
        "6 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 6: NGƯỜI CẦU TOÀN Vệt mực nhỏ có thể làm bạn bỏ cả trang giấy trắng đó là điều chắc chắn ở bạn. Vì bạn làm gì đều phải hoàn hảo như ý bạn muốn, bạn là người cầu toàn trong mọi việc. Bạn có tư duy của một người sáng tạo nghệ thuật như nhà thơ, nhà văn, nhạc sĩ hoặc diễn viên, đạo diễn. Bạn luôn nhìn cuộc sống dưới góc độ nghệ thuật. Việc giảng dạy và chữa bệnh đến với bạn một cách tự nhiên. Bạn sẵn sàng gánh vác nhiều trách nhiệm nhưng vẫn làm cho người khác đặt niềm tin ở bạn vì bạn rất đáng tin cậy. Hoàn thành tốt nghĩa vụ của mình với tinh thần trách nhiệm cao là bản chất của bạn. Bạn có khả năng làm một nhà phê bình nghệ thuật vì bạn có thể nhìn tất cả vẻ đẹp bằng đôi mắt khắt khe của mình. Triển vọng thành công trong kinh doanh của bạn là rất xuất sắc nhờ vào hành vi thực tế, tính chân thật và có trách nhiệm của bạn."
      ],
      "7": [
        "7 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 7: NGƯỜI UYÊN BÁC Bạn là trung tâm lưu trữ kiến thức, là thỏi nam châm tích cực để phát ra nguồn năng lượng lan tỏa đến mọi người xung quanh. Là một người hiếu học, bạn luôn rèn luyện bộ não của mình để trở nên uyên bác, có thể bạn là một thiên tài trong một lĩnh vực nghiên cứu vì bạn luôn nghiên cứu chuyên sâu về một chủ đề, và rất ghét sự hiểu biết hời hợt về bất cứ điều gì mà bạn xem là quan trọng. Đừng ai dại dột tranh luận với bạn về kiến thức, điều đó khiến bạn trở nên gắt gỏng vì sự thiếu hiểu biết của họ. Ngoài kiến thức uyên bác thì bạn lại có thêm một trực giác tuyệt vời, nó mang đến cho bạn rất nhiều lợi ích trong cuộc sống, giúp bạn tiên đoán được sự việc và hành động đúng. Bạn thường hay bí mật tìm hiểu người khác và phân tích họ qua những lỗi lầm, bạn luôn để tâm quá nhiều vào mặt tối của sự việc và đó là nguyên tắc sống của bạn."
      ],
      "8": [
        "8 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 8: NGƯỜI KINH DOANH Nếu nhân loại cần hơi thở thì đối với bạn tiền chính là hơi thở của bạn vì đó là mục đích sống của bạn, tiền bạc và quyền lực là điều cần thiết trong ý thức và lòng tự trọng của bạn. Việc làm chủ về tiền là điều chắc chắn vì bạn có một tài năng tuyệt vời trong lĩnh vực kinh doanh, bạn có thể quản lý các tập đoàn và tổ chức lớn, bạn hiểu cách sắp xếp nhân sự và hướng họ đến một số mục tiêu chung, bạn là người có tham vọng và tính cạnh tranh cao.",
        "Điều quan trọng nhất là bạn phải tránh việc đề cao bản thân quá mức và trở nên kiêu ngạo, bạn hãy nhớ khi cơn bão đi qua thì ngọn cỏ có thể còn đó nhưng cây đại thụ thì rất dễ bị quật ngã và cuốn trôi. Bạn có tính kỷ luật cao là một điều tuyệt vời để thành công, nhưng quá nghiêm khắc đòi hỏi nhiều ở bản thân và những người khác thì sẽ tạo ra áp lực cho mình và những người xung quanh."
      ],
      "9": [
        "9 CHỈ SỐ TƯ DUY LOGIC",
        "LOGIC SỐ 9: NGƯỜI CỘNG ĐỒNG Xã hội rất cần những người như bạn để phát triển, vì tất cả suy nghĩ của bạn đều đưa bạn đến với những quy mô lớn có tính chất giúp cho sự phát triển của cộng đồng. Bạn là người quan tâm đến hạnh phúc chung của xã hội và có tầm nhìn xa. Bạn cống hiến năng lượng của mình một cách không vụ lợi cho những mục đích xứng đáng và nhận được sự tôn trọng của mọi người nhờ vào sự quyết tâm của bạn.",
        "Đặc biệt, bạn là người lãng mạn và có những suy nghĩ mơ mộng về một tình yêu lý tưởng, bạn tô vẽ trong suy nghĩ về hình ảnh người bạn đời quá hoàn hảo nên đôi khi bạn bị vỡ mộng và hụt hẫng. Bạn có thể bị thu hút vào các dịch vụ công cộng hoặc sân khấu, bạn có cái nhìn bao quát về xã hội với tư cách là một nhà hảo tâm hoặc một người có tính chất ảnh hưởng đến công chúng Bạn là người dễ vị tha và không có thành kiến hay ác cảm với bất kỳ điều gì, bạn luôn ứng xử tuyệt vời trong cách đối nhân xử thế với mọi người từ mọi tầng lớp xã hội."
      ]
    },
    "intro": [
      "CHỈ SỐ TƯ DUY LOGIC",
      "CHỈ SỐ TƯ DUY LOGIC Chỉ số tư duy logic là chỉ số thể hiện hoạt động suy luận của bạn để giải quyết vấn đề một cách hợp lý, hiệu quả. Bạn suy nghĩ, phân tích, nhận định vị trí và hoàn cảnh của mình, cố gắng tìm ra điều gì là tốt nhất, sau đó bạn mới đưa ra phản ứng hành động phù hợp. Chỉ số tư duy logic giúp bạn có khả năng tự học, luôn khám phá ý nghĩa sâu xa của mọi thứ cũng như giải quyết các vấn đề thực tế nhờ vào hình dung tưởng tượng mà không cần phải viết ra giấy. Có được tư duy logic sẽ giúp bạn có chiến lược giải quyết công việc một cách nhanh chóng và gọn gàng. Khi bạn có tư duy logic thì khó ai lừa được bạn, vì chỉ cần bạn nghe họ nói chuyện phi logic và không thực tế thì bạn sẽ cảm nhận được sự dối trá qua lời nói."
    ]
  },
  "emotion": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 1 = DẪN DẮT & TRUYỀN ĐẠT HIỆU QUẢ Cùng một vấn đề nhưng chỉ cần bạn nói ra thì mọi người sẽ hiểu ngay lập tức và có thể làm theo ý bạn muốn, vì bạn sở hữu tư duy cảm xúc số 1 nên bạn là người có khả năng dẫn dắt và truyền đạt hiệu quả. Bạn luôn nói đến trọng tâm của vấn đề và điều hướng được mọi người trong cuộc nói chuyện theo ý bạn muốn, bạn có thể dẫn dắt đối phương đi đến mục tiêu cuối cùng.",
        "Bạn có thể gánh vác trách nhiệm của một người dẫn đầu, vì bạn là người vượt khó và thích chinh phục. Bạn đòi hỏi sự kết hợp chặt chẽ, đặc biệt là trong tình yêu và hôn nhân. Nếu không cẩn thận, bạn dễ dàng trở nên độc đoán. Bạn cần có ý chí mạnh mẽ nhưng linh hoạt để trở thành một người vợ hoặc chồng tốt. Bạn nên thả lỏng, mở lòng, lắng nghe và thấu hiểu người khác nhiều hơn."
      ],
      "11": [
        "11/2 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 11/2 = ĐỌC VỊ & THẤU HIỂU Nếu phải học cách đọc vị mới có thể hiểu được người khác thì bẩm sinh ở bạn đã có được kỹ năng đó mà không cần phải học, vì bạn đang sở hữu con số 11/2 tư duy cảm xúc, với chỉ số này thì bạn là người có trực giác và cực kỳ nhạy cảm với môi trường xung quanh, cảm xúc của bạn sẽ thay đổi liên tục đối với bất cứ điều gì làm bạn bị kích thích bởi tác nhân xung quanh bạn. Đôi khi ý kiến của người khác lại làm cho bạn bận tâm và suy nghĩ quá nhiều. Bạn có thể nhận thức khá rõ và những gì người khác đang nghĩ nên không ai có thể che giấu được cảm xúc đối với bạn, điều này giúp bạn khéo léo trong việc ngoại giao. Bạn có một đặc ân thiên phú là ăn nói chuẩn mực, bạn luôn biết lúc nào nói điều gì là hợp lý nên khả năng cố vấn của bạn cực kỳ tốt đặc biệt bạn còn có thể chữa lành tổn thương cho nội tâm của người khác."
      ],
      "13": [
        "4 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 4 = GIỎI TỔ CHỨC & QUẢN LÝ Con người khi uống say sẽ mất đi lý trí và không thể kiểm soát được cảm xúc và hành động của mình, và bạn thì không bao giờ để cho mình rơi vào những trường hợp đó. Bạn kiểm soát cảm xúc của mình rất tốt, bạn là một người có khả năng tổ chức và quản lý.",
        "Với khả năng kiểm soát cảm xúc thì bạn là người muốn có cuộc sống yên ổn, trật tự và không thích sóng gió nhưng đôi khi sự kìm nén cảm xúc sẽ khiến bạn căng thẳng và lo âu. Bao dung là một đức tính tốt nhưng với bạn thì bạn nên tránh điều đó và tránh tuyệt đối những mối quan hệ không thuận lợi hay phức tạp."
      ],
      "14": [
        "5 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 5 = THÍCH PHIÊU LƯU, KHÁM PHÁ Con ong, con bướm sẽ bay từ bông hoa này đến bông hoa khác, và đó là hình ảnh khi bạn sở hữu tư duy cảm xúc số 5 vì bạn luôn thích gặp những người mới, những chuyến du lịch và trải qua nhiều mối tình. Tuy nhiên, cảm xúc của bạn không sâu đậm nên việc duy trì các mối quan hệ lâu dài là rất khó và tò mò về người khác là cảm xúc mạnh mẽ của bạn.",
        "Bạn luôn làm mới cuộc sống bằng những ý tưởng mới mẻ, độc đáo. Bạn quan sát mọi thứ xung quanh một cách chi tiết và muốn chinh phục để vượt qua mọi giới hạn. Đôi khi bạn lại ủ rủ và lầm lì nếu như bắt bạn ở yên một chỗ, là một người thích phiêu lưu và khám phá thì bạn nên chọn ngành nghề phù hợp với cảm xúc của mình."
      ],
      "16": [
        "7 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 7 = TĨNH LẶNG & CHIÊM NGHIỆM Dù bạn cố tỏ ra rằng bạn yêu mến người khác nhưng họ vẫn không hay biết điều đó thì bạn cần phải xem lại hành động của mình vì chỉ số 7 tư duy cảm xúc nói lên rằng bạn là người giàu cảm xúc và cần tình yêu, nhưng bạn lại gặp khó khăn khi bày tỏ cảm xúc của mình.",
        "Điều này khiến người khác nghĩ rằng bạn hơi lạnh lùng hoặc thu mình, nhưng trên thực tế, bạn đang có những trải nghiệm cảm xúc mạnh mẽ tích tụ bên trong. Những cảm xúc tích tụ đó khiến bạn dễ bị bùng nổ cảm xúc của mình một cách tự nhiên. Điều này đòi hỏi sự tin tưởng và can đảm từ phía bạn. Một môi trường tĩnh lặng là không gian lý tưởng để bạn làm việc vì bạn có thể không chịu được tiếng ồn. Dù sao đi nữa thì bạn vẫn có được một đầu óc nhạy bén và một trực giác tuyệt vời nên trong hoàn cảnh khó khăn nhất thì bạn cứ tự tin làm theo con tim mình mách bảo là được."
      ],
      "19": [
        "1 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 1 = DẪN DẮT & TRUYỀN ĐẠT HIỆU QUẢ Cùng một vấn đề nhưng chỉ cần bạn nói ra thì mọi người sẽ hiểu ngay lập tức và có thể làm theo ý bạn muốn, vì bạn sở hữu tư duy cảm xúc số 1 nên bạn là người có khả năng dẫn dắt và truyền đạt hiệu quả. Bạn luôn nói đến trọng tâm của vấn đề và điều hướng được mọi người trong cuộc nói chuyện theo ý bạn muốn, bạn có thể dẫn dắt đối phương đi đến mục tiêu cuối cùng.",
        "Bạn có thể gánh vác trách nhiệm của một người dẫn đầu, vì bạn là người vượt khó và thích chinh phục. Bạn đòi hỏi sự kết hợp chặt chẽ, đặc biệt là trong tình yêu và hôn nhân. Nếu không cẩn thận, bạn dễ dàng trở nên độc đoán. Bạn cần có ý chí mạnh mẽ nhưng linh hoạt để trở thành một người vợ hoặc chồng tốt. Bạn nên thả lỏng, mở lòng, lắng nghe và thấu hiểu người khác nhiều hơn."
      ],
      "2": [
        "2 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 2 = THẤU HIỂU & YÊU THƯƠNG Đặt mình vào vị trí của người khác để hiểu được họ là một phần tư suy cảm xúc số 2 mang đến cho bạn, bạn có khả năng nhận ra cảm xúc của người khác và thấu hiểu người khác bằng cả tình yêu thương nên bạn luôn nhận được sự tin cậy của mọi người.",
        "Tuy nhiên, bạn hay lo lắng quá nhiều, bạn hãy cứ làm việc dựa trên sự tự tin của mình vì với tính ôn hòa và lãng mạn của bạn thì bạn dễ dàng làm việc nhóm và có khả năng kết nối mọi người lại với nhau. Về cảm xúc thì đôi lúc bạn nên cân bằng vì bạn quá dễ bị tổn thương, nên trong các mối quan hệ bạn cần phải tìm hiểu thật kỹ và đặt niềm tin đúng người."
      ],
      "22": [
        "22/4 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 22/4 = MỤC TIÊU & TẦM NHÌN XA Đối với người bình thường thì một món quà có giá trị sẽ có ý nghĩa với cảm xúc của họ nhưng đối với bạn thì cảm xúc chỉ thăng hoa khi được đánh giá cao khả năng tổ chức và quản lý ở những doanh nghiệp lớn. Sức mạnh và động lực của con số Vua 22/4 giúp bạn là người thực tế, định hướng mục tiêu rõ ràng, có tầm nhìn xa và tận tâm trong các kế hoạch làm việc, các dự án.",
        "Bạn là người giàu cảm xúc và bao dung nhưng vẫn chuẩn mực và thực tế. Bạn không để tình cảm đan xen với công việc. Bạn thích làm theo quy tắc và luôn giữ được sự cân bằng trong cảm xúc của mình."
      ],
      "3": [
        "3 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 3 = GIÀU TRÍ TƯỞNG TƯỢNG Thế giới vật chất của chúng ta đều bắt đầu bằng trí tưởng tượng mà hình thành, vì trước khi một chiếc điện thoại ra đời thì nó phải nằm trong trí tưởng tượng của một nhà phát minh, và con số 3 về tư duy cảm xúc nói lên rằng bạn là người có khả năng sáng tạo, phát minh và giàu trí tưởng tượng.",
        "Nhưng đi kèm với trí tưởng tượng của bạn là sự lãng mạn, nên khi bạn gặp những tình huống cảm xúc đau thương thì bạn hay trốn khỏi thực tại và tạo ra một thế giới tưởng tượng và nhốt mình trong đó, đến khi trưởng thành thì có thể bạn vẫn bị lặp lại những cảm xúc đó khiến cho bạn hình thành những thói quen không tốt. Bạn ghét những thứ theo quy cũ, vô tổ chức có thể là từ ngữ thích hợp dành cho bạn, nhưng đôi khi để sáng tạo người ta buộc phải thoát ra khỏi những trật tự thông thường. Sự mộng mơ của bạn giúp bạn có năng khiếu về nghệ thuật, đặc biệt là sáng tác, biểu diễn hoặc ca hát."
      ],
      "4": [
        "4 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 4 = GIỎI TỔ CHỨC & QUẢN LÝ Con người khi uống say sẽ mất đi lý trí và không thể kiểm soát được cảm xúc và hành động của mình, và bạn thì không bao giờ để cho mình rơi vào những trường hợp đó. Bạn kiểm soát cảm xúc của mình rất tốt, bạn là một người có khả năng tổ chức và quản lý.",
        "Với khả năng kiểm soát cảm xúc thì bạn là người muốn có cuộc sống yên ổn, trật tự và không thích sóng gió nhưng đôi khi sự kìm nén cảm xúc sẽ khiến bạn căng thẳng và lo âu. Bao dung là một đức tính tốt nhưng với bạn thì bạn nên tránh điều đó và tránh tuyệt đối những mối quan hệ không thuận lợi hay phức tạp."
      ],
      "5": [
        "5 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 5 = THÍCH PHIÊU LƯU, KHÁM PHÁ Con ong, con bướm sẽ bay từ bông hoa này đến bông hoa khác, và đó là hình ảnh khi bạn sở hữu tư duy cảm xúc số 5 vì bạn luôn thích gặp những người mới, những chuyến du lịch và trải qua nhiều mối tình. Tuy nhiên, cảm xúc của bạn không sâu đậm nên việc duy trì các mối quan hệ lâu dài là rất khó và tò mò về người khác là cảm xúc mạnh mẽ của bạn.",
        "Bạn luôn làm mới cuộc sống bằng những ý tưởng mới mẻ, độc đáo. Bạn quan sát mọi thứ xung quanh một cách chi tiết và muốn chinh phục để vượt qua mọi giới hạn. Đôi khi bạn lại ủ rủ và lầm lỳ nếu như bắt bạn ở yên một chỗ, là một người thích phiêu lưu và khám phá thì bạn nên chọn ngành nghề phù hợp với cảm xúc của mình."
      ],
      "6": [
        "6 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 6 = CHE CHỞ & BẢO VỆ NGƯỜI KHÁC Gà mẹ luôn che chở và bảo vệ con nó, thì cảm xúc của bạn đối với người khác cũng gần như vậy! Bạn luôn muốn che chở và bảo vệ người khác vì bạn đang sở hữu chỉ số cảm xúc số 6. Giàu cảm xúc nhưng lại xoay chuyển linh hoạt và có độ cân bằng là yếu tố mà chỉ có riêng bạn mới làm được. Bạn có chỉ số cảm xúc nói lên rằng bạn là người yêu gia đình và những người bạn thân thiết mà ít ai có được nên lo lắng cho người khác và có trách nhiệm với hành động của họ là điều bạn không thể tránh khỏi.",
        "Là một người duy tâm nên bạn có phần xem cuộc sống vốn dĩ là vô thường, bạn sẵn sàng hy sinh nhu cầu bạn thân cho lợi ích chung và thích giúp đỡ người khác. Đặc biệt khi bạn đã quyết định chọn người bạn đời thì bạn sẽ rất kiên quyết bảo vệ lập trường của mình và không thay đổi."
      ],
      "7": [
        "7 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 7 = TĨNH LẶNG & CHIÊM NGHIỆM Dù bạn cố tỏ ra rằng bạn yêu mến người khác nhưng họ vẫn không hay biết điều đó thì bạn cần phải xem lại hành động của mình vì chỉ số 7 tư duy cảm xúc nói lên rằng bạn là người giàu cảm xúc và cần tình yêu, nhưng bạn lại gặp khó khăn khi bày tỏ cảm xúc của mình.",
        "Điều này khiến người khác nghĩ rằng bạn có vẻ lạnh lùng hoặc thu mình, nhưng trên thực tế, bạn đang có những trải nghiệm cảm xúc mạnh mẽ tích tụ bên trong. Những cảm xúc tích tụ đó khiến bạn dễ bị bùng nổ cảm xúc của mình một cách tự nhiên. Điều này đòi hỏi sự tin tưởng và can đảm từ phía bạn. Một môi trường tĩnh lặng là không gian lý tưởng để bạn làm việc vì bạn có thể không chịu được tiếng ồn. Dù sao đi nữa thì bạn vẫn có được một đầu óc nhạy bén và một trực giác tuyệt vời nên trong hoàn cảnh khó khăn nhất thì bạn cứ tự tin làm theo con tim mình mách bảo là được."
      ],
      "8": [
        "8 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 8 = TIỀN BẠC & QUYỀN LỰC Chỉ số cảm xúc của bạn cực kỳ mạnh mẽ và có xu hướng chiếm ưu thế trong các mối quan hệ cá nhân và công việc, bạn luôn muốn đứng đầu trong ngành nghề mà bạn đã chọn. Có nhiều tham vọng về tiền bạc và quyền lực là phần không thể thiếu trong cảm xúc của bạn, vì bạn luôn mơ về những điều lớn lao trong cuộc sống như đứng đầu các tập đoàn, xây dựng các doanh nghiệp lớn và chỉ đạo nhiều người.",
        "Bất kỳ mối quan hệ nào khi bạn muốn kiểm soát thì đối phương phải chịu sự kiểm soát của bạn, khi bạn thành công thì bạn phải cho cả thế giới biết điều đó. Bạn là con người đặc trưng cho tiền bạc và quyền lực."
      ],
      "9": [
        "9 CHỈ SỐ TƯ DUY CẢM XÚC",
        "CẢM XÚC SỐ 9 = PHỤNG SỰ & CHO ĐI Đào giếng cho người uống nước là việc làm của bạn vì sứ mệnh của bạn là phụng sự và cho đi. Bạn yêu quý nhiều người, và bạn muốn cống hiến hết mình để giúp đỡ những người kém may mắn hơn mình. Bạn sẵn sàng hy sinh to lớn cho mục đích xứng đáng, và cảm thấy vô cùng hài lòng khi biết rằng cuộc sống của bạn đã tạo ra sự khác biệt tích cực cho người khác.",
        "Bạn có lòng trắc ẩn và chủ nghĩa lý tưởng. Trên thực tế, bạn duy tâm đến mức có thể có chút phi thực tế và bạn có thể bay bổng với những giấc mơ và quên mất thực tại. Bạn cần suy nghĩ thực tế, mang tính thiết thực để đạt hiệu quả cao nhất. Trong mối quan hệ đôi khi bạn cần nhìn lại xem người bạn cho có xứng đáng hay không vì không phải ai cũng tốt như bạn nghĩ."
      ]
    },
    "intro": [
      "Chỉ số cảm xúc chỉ ra rằng bạn sẽ dùng cảm xúc của mình như thế nào khi đối mặt với sự việc trong những hoàn cảnh khác nhau. Cảm nhận và trái tim của bạn phản ứng ngay lập tức chỉ cho bạn một hướng đi và tạo ra cảm xúc để bạn hành động. Thông thường trái tim lại quyết định suy nghĩ trong các trường hợp này. Chỉ số cảm xúc là yếu tố quan trọng nhất để đưa bạn đến sự hoàn hảo về Trí Tuệ Cảm Xúc vì 90% sự thành công của nhà lãnh đạo đều phát huy tốt trí tuệ cảm xúc của mình. Thông qua thần số học bạn sẽ biết chỉ số cảm xúc của mình khi ứng phó với ngoại cảnh sẽ như thế nào, từ đó có thể giúp bạn cải tạo hoặc sửa đổi để phát triển tốt hơn trong mối quan hệ cũng như sự nghiệp của mình. CHỈ SỐ TƯ DUY CẢM XÚC"
    ]
  },
  "intuition": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Tiên đoán trước sự việc sắp xảy ra và dữ liệu được những tình huống bất ngờ là khả năng của bạn, bạn là người có trực giác cao với những thông tin chi tiết chớp nhoáng.",
        "Bạn có thể cho rằng hầu hết các suy nghĩ của mình được xuất phát từ khả năng dự đoán, nhưng trên thực tế thì phần lớn những hiểu biết của bạn được đến từ nguồn năng lượng của vũ trụ thông qua những con số. Bạn luôn linh cảm được một sự việc nào đó sắp xảy ra và tiên đoán trước tương lai. Nhưng đừng quá lạm dụng vào trực giác nếu không sẽ ảnh hưởng đến mối quan hệ tình cảm của bạn."
      ],
      "11": [
        "11/2 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Bạn là người có trực giác chuẩn xác, và thậm chí có thể là nhà ngoại cảm. Bạn cảm nhận rất rõ mọi thứ, chẳng hạn như các sự kiện sắp diễn ra, sự thay đổi tâm trạng của mọi người và các xu hướng thịnh hành.",
        "Bạn phải cố gắng giữ tâm trí của mình một cách có kỷ luật để cho trí tưởng tượng và trực giác không xâm chiếm toàn bộ quyết định của bạn. Bạn có tri thức trực giác tốt, hoạt động tiềm thức của bạn hoạt động với tốc độ cao giúp cho bạn có thể ngăn chặn một sự cố nào đó sắp chuẩn bị xảy ra."
      ],
      "13": [
        "4 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Phải nhìn thấy thì bạn mới tin. đó là tính cách của bạn, bạn chỉ thích những gì thuộc về truyền thống và cái thủ tục đã được lập ra. Bạn không cảm thấy thoải mái với những ý tưởng trừu tượng và chưa được chứng minh.",
        "Khi bạn phát minh hay có ý tưởng về sáng tạo thì nó luôn thực tế và có thể ứng dụng được vào cuộc sống. Bạn vẫn có niềm tin về tôn giáo nhưng có thể là do theo xu hướng tập tục từ gia đình hoặc những người đi trước. Khi có những ý tưởng thoáng qua thì bạn cần ghi chép lại tỉ mỉ nếu không bạn sẽ không bạn sẽ mau chóng quên nó đi."
      ],
      "14": [
        "5 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Giữa cuộc sống cơm áo gạo tiền, nếu để lựa chọn giữa con tim và lý trí thì hầu hết mọi người sẽ chọn lý trí nhưng bạn lại chọn lắng nghe trái tim mách bảo, đó là tư duy trực giác của bạn.",
        "Bạn luôn tin vào những hiểu biết của mình, vì kiến thức và sự hiểu biết của bạn vượt ra ngoài giới hạn các đề tài mà bạn nghiên cứu. Tuy nhiên, bạn vẫn cần phải tập trung bằng kỷ luật để hiểu sâu hơn những gì bạn nghiên cứu. Luôn luôn tin vào linh cảm của mình, làm mọi việc theo cảm tính đó là ưu điểm của bạn, vì trái tim có lý lẽ riêng của nó, lý trí có khi làm chúng ta hối tiếc nhưng trái tim thì không."
      ],
      "16": [
        "7 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Bạn tin rằng những gì bạn thật sự giỏi ở hiện tại đều do bạn đã thực hành nó trong nhiều kiếp và ngộ tính của bạn cực kỳ cao khi học bất cứ điều gì mới. Bạn có trực giác tuyệt vời, có góc nhìn sâu sắc trong các vấn đề trừu tượng và siêu hình. Bạn tìm tòi để hiểu biết rộng lớn về tất cả các vấn đề một cách chi tiết và tỉ mỉ. Bạn muốn cung cấp hỗ trợ khoa học và hợp lý hoá cho tất cả những hiểu biết của mình, để chứng minh rằng những gì bạn cảm nhận đều là sự thật. Bạn có óc sáng tạo và có khả năng trở thành một nhà văn hoặc nhà soạn nhạc."
      ],
      "19": [
        "1 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Tiên đoán trước sự việc sắp xảy ra và dữ liệu được những tình huống bất ngờ là khả năng của bạn, bạn là người có trực giác cao với những thông tin chi tiết chớp nhoáng.",
        "Bạn có thể cho rằng hầu hết các suy nghĩ của mình được xuất phát từ khả năng dự đoán, nhưng trên thực tế thì phần lớn những hiểu biết của bạn được đến từ nguồn năng lượng của vũ trụ thông qua những con số. Bạn luôn linh cảm được một sự việc nào đó sắp xảy ra và tiên đoán trước tương lai. Nhưng đừng quá lạm dụng vào trực giác nếu không sẽ ảnh hưởng đến mối quan hệ tình cảm của bạn."
      ],
      "2": [
        "2 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Bạn là người tin rằng những giấc mơ sẽ liên quan đến thế giới thật của bạn, bạn luôn suy nghĩ đó là một điềm báo dành cho bạn vì bạn tin vào thế giới tâm linh và siêu hình.",
        "Trực giác của bạn khá tốt, những kiến thức về thế giới tâm linh hay siêu hình sẽ thu hút bạn. Đặc biệt bạn có khả năng kết nối với tiềm thức và phán đoán tương lai. Ngoài ra, bạn còn là một nhà cố vấn tài ba và thấu hiểu được mọi người. Bạn là người lắng nghe và thấu hiểu người khác thông qua sự nhạy cảm của mình, bạn luôn khéo léo và linh hoạt để giúp đỡ mọi người gắn kết lại với nhau."
      ],
      "22": [
        "22/4 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Bạn là người hiểu rõ về tâm linh nhưng lại áp dụng nó vào đời sống thực tế, đối với bạn :“đạo là đạo mà đời là đời”. Bạn vừa có tầm nhìn xa vừa có tư duy thực tế -- thế giới thực tại, vật chất, và thế giới của các kế hoạch và ý tưởng.",
        "Bạn dùng trực giác để hoạch định tương lai và tạo nền tảng vững chắc cho sự nghiệp của mình, bạn luôn hiểu rằng mọi thứ trong cuộc sống đều gắn liền với thế giới vật chất. Con số Vua 22/4 được định hướng để biến các ý tưởng thành hiện thực, tạo ra những điều tuyệt vời và sử dụng sức mạnh vốn có của nó để thúc đẩy và chỉ đạo người khác. -"
      ],
      "3": [
        "3 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Có thể bạn chưa nhìn thấy linh hồn và địa ngục bao giờ nhưng nếu bạn bắt buộc phải vẽ ra thì bạn vẫn có thể vẽ được vì bạn có khả năng tưởng tượng về thế giới vô hình, bạn là một người có năng khiếu nghệ thuật và đầy cảm hứng để sáng tạo.",
        "Khả năng truyền đạt và ăn nói khéo léo của bạn rất dễ luôn cuốn bạn đến với bục giảng. Tuy rằng trực giác của bạn không phải quá cao nhưng bạn có thể phóng đại về những hiểu biết của mình một cách logic về thế giới tâm linh."
      ],
      "4": [
        "4 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Phải nhìn thấy thì bạn mới tin. đó là tính cách của bạn, bạn chỉ thích những gì thuộc về truyền thống và cái thủ tục đã được lập ra. Bạn không cảm thấy thoải mái với những ý tưởng trừu tượng và chưa được chứng minh.",
        "Khi bạn phát minh hay có ý tưởng về sáng tạo thì nó luôn thực tế và có thể ứng dụng được vào cuộc sống. Bạn vẫn có niềm tin về tôn giáo nhưng có thể là do theo xu hướng tập tục từ gia đình hoặc những người đi trước. Khi có những ý tưởng thoáng qua thì bạn cần ghi chép lại tỉ mỉ nếu không bạn sẽ không bạn sẽ mau chóng quên nó đi."
      ],
      "5": [
        "5 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Giữa cuộc sống cơm áo gạo tiền, nếu để lựa chọn giữa con tim và lý trí thì hầu hết mọi người sẽ chọn lý trí nhưng bạn lại chọn lắng nghe trái tim mách bảo, đó là tư duy trực giác của bạn.",
        "Bạn luôn tin vào những hiểu biết của mình, vì kiến thức và sự hiểu biết của bạn vượt ra ngoài giới hạn các đề tài mà bạn nghiên cứu. Tuy nhiên, bạn vẫn cần phải tập trung bằng kỷ luật để hiểu sâu hơn những gì bạn nghiên cứu. Luôn luôn tin vào linh cảm của mình, làm mọi việc theo cảm tính đó là ưu điểm của bạn, vì trái tim có lý lẽ riêng của nó, lý trí có khi làm chúng ta hối tiếc nhưng trái tim thì không."
      ],
      "6": [
        "6 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Bạn có sở thích dự đoán tương lai vì bạn là người cực kỳ trực quan và tâm linh. Bạn có thể nắm bắt những ý tưởng và trải nghiệm tâm linh bằng chính mình. Bạn có nguy cơ bị dính mắc quá nhiều vào ý tưởng xa vời, và do đó bạn có thể bị ảo tưởng.",
        "Những trải nghiệm tâm linh bạn có được thường liên quan đến bạn bè và người thân, bạn nên xem xét những thông điệp này một cách nghiêm túc. Vì đôi khi việc gì quá cũng không tốt, bạn cần thực tế hơn trong cuộc sống."
      ],
      "7": [
        "7 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Bạn tin rằng những gì bạn thật sự giỏi ở hiện tại đều do bạn đã thực hành nó trong nhiều kiếp và ngộ tính của bạn cực kỳ cao khi học bất cứ điều gì mới. Bạn có trực giác tuyệt vời, có góc nhìn sâu sắc trong các vấn đề trừu tượng và siêu hình. Bạn tìm tòi để hiểu biết rộng lớn về tất cả các vấn đề một cách chi tiết và tỉ mỉ. Bạn muốn cung cấp hỗ trợ khoa học và hợp lý hoá cho tất cả những hiểu biết của mình, để chứng minh rằng những gì bạn cảm nhận đều là sự thật. Bạn có óc sáng tạo và có khả năng trở thành một nhà văn hoặc nhà soạn nhạc."
      ],
      "8": [
        "8 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Tất cả những nhà đầu tư hay tài phiệt trên thế giới này đều có khả năng phân tích và có trực giác siêu việt, và không có gì bất ngờ khi bạn cũng có tài năng đó vì bạn có con số 8 của tư duy trực giác.",
        "Bạn có một trực giác mạnh mẽ cùng nhiều khả năng ngoại cảm. Năng lượng trực quan sẽ dẫn bạn đến các công việc kinh doanh và tổ chức. Bạn có thể đánh giá mọi người một cách nhanh chóng và chính xác. Về tính cách, bạn là một thẩm phán xuất sắc. Bạn có khả năng phân tích vấn đề, ra quyết định nhanh và luôn tin vào trực giác của mình."
      ],
      "9": [
        "9 CHỈ SỐ TƯ DUY TRỰC GIÁC",
        "Nếu ai đó muốn biết về thế giới tâm linh thì họ có thể tìm đến bạn để nghe bạn nói cả ngày, vì bạn yêu thích những gì trừu tượng, và bạn có những ý tưởng hoành tráng liên quan đến tâm linh. Bạn có thể gây ảnh hưởng đến những nhóm người hoặc cộng đồng có cùng sở thích giống bạn hoặc được bạn dẫn dắt.",
        "Bạn là một người theo chủ nghĩa duy tâm, hay mơ mộng, và đặc biệt là bạn có một tâm hồn rời xa thực tế. Bạn rất dễ gây ấn tượng và đôi khi bạn đặt niềm tin vào những người mà bạn chưa biết rõ, điều này khiến bạn dễ bị lợi dụng."
      ]
    },
    "intro": [
      "CHỈ SỐ TƯ DUY TRỰC GIÁC",
      "Chỉ số trực giác là điều mình cảm nhận được trong suy nghĩ nhưng không thể lý giải. Nó là một loại cảm giác khó có thể diễn tả, nếu trực giác của bạn nhạy bén thì có thể nói đó là ngoại cảm.",
      "Trực giác mạnh thì bạn sẽ hành động trước khi những sự cố xảy ra, bạn sẽ trải qua một điềm báo trong cuộc đời mình, và giống như tất cả những người mang trực giác, bạn sẽ phải học cách phân biệt giữa ảo tưởng, trí tưởng tượng và trực giác. Các chỉ số trực giác sẽ giúp bạn biết rằng bạn có khả năng trực giác tốt như thế nào và cần phát triển nó tốt hơn để giúp bạn có những suy đoán nhạy bén và chính xác hơn trong cuộc sống."
    ]
  },
  "experience": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn là người năng động và đầy cảm hứng sáng tạo, bạn táo bạo trong kinh doanh và trong các lĩnh vực khác của cuộc sống, bạn làm việc chăm chỉ và rất quyết tâm trong công việc. Bạn có chính kiến mạnh mẽ, rõ ràng giữa thích và không thích, và bạn sống theo lập trường của chính mình.",
        "Bạn phát triển nhờ vào sự kết hợp giữa sự nhiệt tình của bạn và sự thử thách của công việc bạn được giao phó, thiếu những tính chất đó có thể khiến bạn trở nên buồn tẻ và không hứng thú. Bạn giống như một ngọn lửa, bùng cháy rực rỡ trong một khoảng thời gian cụ thể, nhưng phải chuyển sang các dự án khác để duy trì sự phấn khích của bạn. Bạn là người quyến rũ và hóm hỉnh, nhưng bạn dễ dàng cảm thấy chán nản khi đã chinh phục được mục tiêu – điều này có thể ảnh hưởng lớn đến cuộc sống của bạn nếu bạn không biết xử lý khéo léo."
      ],
      "11": [
        "11/2 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Cơ thể của bạn sẽ mách bảo cho bạn biết về những điều bạn cần, đó là nhờ vào sự nhạy cảm của bạn. Sự nhạy cảm sẽ giúp bạn hiểu được cách ăn uống hợp lý, tập thể dục để giúp bản thân đối phó với những căng thẳng. Với những biệt tài mà bạn có, bạn là một người lôi cuốn người khác dễ dàng và có thể truyền cảm hứng cho họ bằng những ý tưởng của bạn. Bạn có trực giác khá tốt và một thần kinh nhạy cảm nên đôi khi chỉ cần cảm nhận từ xa mà không cần tiếp xúc thì bạn vẫn có thể hiểu được đối phương. Điều quan trọng nhất đối với bạn là chăm sóc cơ thể của mình thật tốt, nó sẽ giúp bạn tự tin và giải phóng sự căng thẳng. Bạn có thể tập thiền, vì nó sẽ giúp được bạn cân bằng được cảm xúc."
      ],
      "13": [
        "4 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Là một người thực tế và có tổ chức, bạn luôn giỏi về các chi tiết và tuân thủ các quy trình theo một cách thứ tự có thể là máy móc, tuy nhiên bạn luôn có rất nhiều năng lượng và sự quyết tâm khi làm việc. Bạn có một khả năng tập trung cao độ và khá nghiêm túc, bạn tranh luận khá tốt, khi đối đầu với những chướng ngại và kẻ thù thì bạn thật sự là một chiến binh ngoan cường. Bạn là người trung thành, trung thực, ấm áp và hào phóng. Bạn đánh giá cao giá trị truyền thống và các thói quen tốt nên bạn không thích thay đổi, điều đó khiến bạn có thể cứng nhắc và không linh hoạt ."
      ],
      "14": [
        "5 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn có một khả năng tổ chức, linh hoạt và tháo vát, cơ thể của bạn phản ứng rất nhanh nhẹn. Sự thay đổi, đi du lịch để gặp gỡ những người mới là sở thích của bạn vì bạn bị thu hút bởi sự mới mẻ và thú vị. Khả năng phát huy ý tưởng của bạn khá tốt, những trải nghiệm giúp bạn có được hiểu biết rộng và nhiều kiến thức dành riêng cho bạn. Bạn không thích các tập tục truyền thống, bạn muốn làm việc gì cũng nhanh chóng và gọn lẹ, bạn sẽ là một nhân viên bán hàng xuất sắc nếu bạn tin tưởng vào chất lượng của sản phẩm."
      ],
      "16": [
        "7 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn là người biết chọn lọc thức ăn để duy trì sức khỏe của mình, vì cơ thể của bạn chính là nguồn động lực giúp bạn yêu đời và có nhiều năng lượng tích cực. Bạn luôn nghiên cứu về dinh dưỡng và các lĩnh vực về sức khỏe toàn diện, bạn có thể học được rất nhiều kiến thức về chữa trị bằng thực dưỡng một cách tự nhiên.",
        "Sự hiểu biết tinh tế của bạn về cơ thể như một công cụ cần điều chỉnh và chăm sóc tốt có thể mang lại lợi ích cho bạn và cho người khác. Bạn có trực giác tốt và khả năng hiểu những suy nghĩ trừu tượng. Bạn làm việc tốt nhất trong môi trường yên tĩnh, hay chiêm nghiệm và đi tìm câu trả lời cho những điều bí ẩn trong cuộc sống, bạn có khả năng nghiên cứu chuyên sâu một lĩnh vực mà bạn yêu thích."
      ],
      "19": [
        "1 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn là người năng động và đầy cảm hứng sáng tạo, bạn táo bạo trong kinh doanh và trong các lĩnh vực khác của cuộc sống, bạn làm việc chăm chỉ và rất quyết tâm trong công việc. Bạn có chính kiến mạnh mẽ, rõ ràng giữa thích và không thích, và bạn sống theo lập trường của chính mình.",
        "Bạn phát triển nhờ vào sự kết hợp giữa sự nhiệt tình của bạn và sự thử thách của công việc bạn được giao phó, thiếu những tính chất đó có thể khiến bạn trở nên buồn tẻ và không hứng thú. Bạn giống như một ngọn lửa, bùng cháy rực rỡ trong một khoảng thời gian cụ thể, nhưng phải chuyển sang các dự án khác để duy trì sự phấn khích của bạn. Bạn là người quyến rũ và hóm hỉnh, nhưng bạn dễ dàng cảm thấy chán nản khi đã chinh phục được mục tiêu – điều này có thể ảnh hưởng lớn đến cuộc sống của bạn nếu bạn không biết xử lý khéo léo."
      ],
      "2": [
        "2 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn là người rất nhạy cảm và có trực giác khá tốt, nó mách bảo cho bạn rất chính xác thông qua các giác quan, sức mạnh của bạn nằm ở sự kiên trì và nỗ lực bền bỉ. Bạn có thể mắc phải tính nhút nhát, thiếu tự tin, có thể cảm thấy lo lắng vì dễ bị tổn thương về cơ thể khi phải vận động mạnh tuy nhiên bạn vẫn cứng rắn nếu rơi vào tình thế cấp thiết và cần hành động. Bạn có phần lo lắng quá nhiều, phần lớn là do sự thiếu tự tin vào sức mạnh cá nhân của bạn. Nhưng bù lại bạn có một con mắt tinh tường và khả năng thu thập thông tin, vì vậy chỉ cần khi bạn tự tin thì bạn sẽ có những bước đi ung dung trong sự nghiệp của mình."
      ],
      "22": [
        "22/4 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn sở hữu con số Vua 22/4 là con số hiếm có của tư duy trải nghiệm, nên đôi khi bạn phải chịu những va vấp mà người khác không có được để rèn luyện con người của bạn. Tuy nhiên, bạn là người có nhiều nhiệt huyết và thực tế nên sự thành công sớm hay muộn cũng sẽ đến với bạn. Bạn có một chút tính cách gia trưởng, điều này thể hiện qua việc bạn không thích chạy theo xu hướng, bạn thích những quy trình các thủ tục thông thường. Khi bạn đã có được mục tiêu của mình thì bạn sẽ theo đuổi đến cùng, bạn có đầy đủ tố chất của một người lãnh đạo và quản lý. Sự linh hoạt, điềm tỉnh sẽ giúp bạn giải quyết được các vấn đề trong cuộc sống, thu hút được sự ngưỡng mộ của người khác phái và truyền được cảm hứng cho mọi người."
      ],
      "3": [
        "3 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn là trung tâm của sự chú ý vì bạn có một sức hút đặc biệt từ sự quyến rũ và hóm hỉnh của bạn, năng lực hấp dẫn này được lan toả một cách tự nhiên từ bạn. Bạn biết cách thể hiện cảm xúc của mình, dù rằng bạn dễ xúc động nhưng khi phản ứng thì bạn vẫn biết cách để thu hút mọi thứ một cách tự nhiên. Bạn có tính nghệ thuật cao, giàu trí tưởng tượng, tuy nhiên bạn lại không thích những công việc đòi hỏi sự chăm chỉ nên bạn thực sự cần rèn luyện tính kỷ luật. Bạn là người yêu thích sự vui vẻ, là một người bạn đồng hành tuyệt vời và thú vị tại những cuộc vui trong các sự kiện xã hội."
      ],
      "4": [
        "4 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Là một người thực tế và có tổ chức, bạn luôn giỏi về các chi tiết và tuân thủ các quy trình theo một cách thứ tự có thể là máy móc, tuy nhiên bạn luôn có rất nhiều năng lượng và sự quyết tâm khi làm việc. Bạn có một khả năng tập trung cao độ và khá nghiêm túc, bạn tranh luận khá tốt, khi đối đầu với những chướng ngại và kẻ thù thì bạn thật sự là một chiến binh ngoan cường. Bạn là người trung thành, trung thực, ấm áp và hào phóng. Bạn đánh giá cao giá trị truyền thống và các thói quen tốt nên bạn không thích thay đổi, điều đó khiến bạn có thể cứng nhắc và không linh hoạt ."
      ],
      "5": [
        "5 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn có một khả năng tổ chức, linh hoạt và tháo vát, cơ thể của bạn phản ứng rất nhanh nhẹn. Sự thay đổi, đi du lịch để gặp gỡ những người mới là sở thích của bạn vì bạn bị thu hút bởi sự mới mẻ và thú vị. Khả năng phát huy ý tưởng của bạn khá tốt, những trải nghiệm giúp bạn có được hiểu biết rộng và nhiều kiến thức dành riêng cho bạn. Bạn không thích các tập tục truyền thống, bạn muốn làm việc gì cũng nhanh chóng và gọn lẹ, bạn sẽ là một nhân viên bán hàng xuất sắc nếu bạn tin tưởng vào chất lượng của sản phẩm."
      ],
      "6": [
        "6 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Là một người duy tâm và giàu trí tưởng tượng, bạn có thể kết hợp giữa thực tế và tính nghệ thuật, nhiều nghệ sĩ thành công vang danh là nhờ có được chỉ số này. Bạn là người yêu đời và giàu tình cảm, bạn luôn có hành động phục vụ chu đáo đối với bất kỳ ai mà bạn tiếp xúc, nhưng sự tò mò về cuộc sống của người khác sẽ làm cho bạn gặp nhiều rắc rối vì bạn phải phân biệt được giữa sự giúp đỡ và can thiệp hoặc làm phiền người khác. Trong mối quan hệ khác giới thì bạn là một người chu toàn, là một đối tác hôn nhân tuyệt vời. Được làm cha mẹ là điều khiến bạn vui sướng và hài lòng."
      ],
      "7": [
        "7 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Bạn là người biết chọn lọc thức ăn để duy trì sức khỏe của mình, vì cơ thể của bạn chính là nguồn động lực giúp bạn yêu đời và có nhiều năng lượng tích cực. Bạn luôn nghiên cứu về dinh dưỡng và các lĩnh vực về sức khỏe toàn diện, bạn có thể học được rất nhiều kiến thức về chữa trị bằng thực dưỡng một cách tự nhiên.",
        "Sự hiểu biết tinh tế của bạn về cơ thể như một công cụ cần điều chỉnh và chăm sóc tốt có thể mang lại lợi ích cho bạn và cho người khác. Bạn có trực giác tốt và khả năng hiểu những suy nghĩ trừu tượng. Bạn làm việc tốt nhất trong môi trường yên tĩnh, hay chiêm nghiệm và đi tìm câu trả lời cho những điều bí ẩn trong cuộc sống, bạn có khả năng nghiên cứu chuyên sâu một lĩnh vực mà bạn yêu thích."
      ],
      "8": [
        "8 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Sẽ chẳng ai dám nhận vị trí số một khi làm việc trong cùng lĩnh vực với bạn vì bạn là người có tính cạnh tranh cao, bạn sẽ không chấp nhận vị trí thứ hai trong bất cứ lĩnh vực nào. Do vậy bạn luôn có một tầm nhìn và làm việc chăm chỉ để hoàn thành công việc một cách tốt nhất. Tham vọng là một từ nghe có vẻ hơi quá viển vông, nhưng với bạn thì tham vọng đi kèm với tài năng tuyệt vời của bạn nên nó sẽ tạo ra được nhiều thành quả vô cùng to lớn trong vai trò lãnh đạo và quản lý của bạn. Đôi khi bạn vẫn có một chút mong manh dễ vỡ khi rơi vào những tình thế suy sụp, bạn đừng quên rằng sự thất bại chỉ là trải nghiệm và những bài học tốt cho bạn. Tiền bạc và quyền lực là những phần không thể thiếu trong cuộc sống của bạn nên thử thách của bạn là phải cân bằng giữa giá trị vật chất và tinh thần, bên cạnh đó nhiều người tôn trọng và ngưỡng mộ bạn vì sự chăm chỉ, tầm nhìn và thành công của bạn."
      ],
      "9": [
        "9 CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
        "Đời người có câu cho đi là còn mãi và câu nói này được bạn áp dụng một cách tuyệt đối, bạn là người có lòng trắc ẩn, bao dung và độ lượng, bạn sẵn sàng cho đi vì làm như thế bạn sẽ cảm thấy thoải mái hơn, hạnh phúc của xã hội cũng là hạnh phúc của bạn. Bạn có tài năng diễn xuất, có sức lôi cuốn và sự tinh tế trong tính cách của bạn, điều này giúp bạn có thể hướng đến sân khấu hoặc đôi khi bạn lại bị thu hút bởi chính trị, quảng cáo và dịch vụ công cộng vì những nghề nghiệp đòi hỏi xuất hiện trước công chúng sẽ phù hợp với bạn. Bạn là người duy tâm và hay mơ mộng nên bằng cách nào đó bạn muốn làm hài lòng tất cả mọi người và có xu hướng đưa ra những lời hứa mà khó có thể giữ được. Nếu bạn có thể phát huy hết khả năng của mình thì chuyện nổi tiếng là sớm muộn đối với bạn."
      ]
    },
    "intro": [
      "CHỈ SỐ TƯ DUY TRẢI NGHIỆM",
      "CHỈ SỐ TƯ DUY TRẢI NGHIỆM Chỉ số trải nghiệm là khả năng sử dụng tối đa nguồn lực trong quá khứ sẵn có của bạn thông qua hành động, cảm nhận các sự vật sự việc, các mối quan hệ giúp bạn hình thành nên một hệ thống trải nghiệm. Mỗi con số sẽ cho bạn nhận biết phương thức trải nghiệm khác nhau.",
      "Trải nghiệm càng nhiều sẽ tạo ra kinh nghiệm và có nhiều bài học cuộc sống để phát triển tiềm năng của bạn. Chỉ số trải nghiệm cho bạn biết được khả năng học hỏi và đúc kết kinh nghiệm của bạn để bạn ứng phó khi gặp những tình huống ngoại cảnh tác động lên cuộc sống của bạn."
    ]
  },
  "repeated": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ LẶP",
        "SỐ LẶP 1 = NHÀ LÃNH ĐẠO - MẶT TRỜI Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người lãnh đạo vì bạn luôn tiên phong đi đầu và cũng là người thích chinh phục, bạn là người mở đường cho các dự án mới. Bạn chỉ hạnh phúc khi đạt được mục tiêu và kế hoạch mình đã đề ra. Lặp ở Đường Đời: Để chinh phục những thử thách lớn và tạo được thành công vĩ đại thì bạn không ngại chấp nhận mọi thử thách, bên cạnh đó bạn luôn có những trải nghiệm đủ lớn để giúp bạn trưởng thành hơn. Lặp ở Ngày sinh: Bạn luôn là người dẫn đầu, chỉ đạo tất cả mọi việc. Bạn có xu hướng điều khiển người khác làm theo kế hoạch mình đã vạch ra. Bạn có tài năng lãnh đạo và quản lý rất tốt. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải hoàn thành bất cứ thứ gì bạn đã đặt ra. Chỉ có chinh phục và đạt được thành quả mới làm hài lòng con người bên trong bạn. Lặp ở Tương Tác: Bạn là một người năng động, nhiệt huyết và luôn cho người khác thấy bạn là một người luôn tràn đầy năng lượng. Bạn có thể thu hút và hấp dẫn người khác một cách dễ dàng. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một nhà lãnh đạo tài ba, có khả năng tạo động lực cho người khác thông qua những cái nhìn hoặc ngôn ngữ đầy sức mạnh."
      ],
      "2": [
        "2 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người cố vấn và hỗ trợ tuyệt vời. Bạn là một sứ giả hòa bình, bạn có khả năng hòa giải và kết nối những con người lại với nhau để phát huy sức mạnh của đồng đội. Lặp ở Đường Đời: Bạn phải là người chấp nhận đứng phía sau sự thành công của một nhà lãnh đạo vĩ đại. Bạn là người hỗ trợ tuyệt vời, bạn luôn quan sát và lắng nghe, thấu hiểu để trở thành một cánh tay đắc lực trong một tổ chức. Lặp ở Ngày sinh: Bạn luôn là người hỗ trợ và là nhà tâm lý tuyệt vời trong đội nhóm, tổ chức. Bạn thấu hiểu được người khác nhanh chóng và trở thành người bạn tuyệt vời được nhiều bạn bè yêu thương, quý trọng. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải làm sao thấu hiểu những người xung quanh và thể hiện được tình yêu thương chân thành đến với họ. Bạn có nhiều cảm xúc cần được người khác thấu hiểu. Lặp ở Tương Tác: Bạn là một người nhẹ nhàng, dịu dàng và và giao tiếp rất khéo léo. Giọng điệu truyền cảm của bạn làm những người xung quanh bị thuyết phục và yêu mến. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người thân thiện, dễ gần gũi và có thể trở thành người bạn tâm giao giúp họ giải quyết được nhiều vấn đề trong cuộc sống."
      ],
      "3": [
        "3 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người ngoại giao giỏi. Bạn có khả năng truyền cảm xúc cho người khác và cũng dễ bị tác động mạnh bởi cảm xúc của người khác thông qua lời nói của họ. Lặp ở Đường Đời: Bạn phải là người nổi bật, nhiệt tình và có khả năng kết nối nhanh với mọi người, bạn là một nhà ngoại giao giỏi, bạn luôn gặp nhiều may mắn trên con đường ngoại giao cũng như sự nghiệp của mình. Lặp ở Ngày sinh: Bạn luôn là người lạc quan, giàu cảm xúc. Bạn giỏi sáng tạo và có thể tạo ra những ý tưởng tuyệt vời và vĩ đại. Bạn cũng là người bán hàng, nhà đàm phán, thương lượng đại tài. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải người bán hàng giỏi và làm sao để điều phối cảm xúc của mình phù hợp. Bạn hãy quản trị cảm xúc của mình mọi lúc để cân bằng nội tâm của bạn. Lặp ở Tương Tác: Bạn là một người năng động, luôn thể hiện mình trước đám đông và đặc biệt trong các buổi tiệc. Bạn rất chú ý đến ngoại hình của mình nên bạn biết cách chọn lựa phục trang tạo ấn tượng đến người khác. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người cực kỳ hấp dẫn. Họ cảm nhận được nguồn năng lượng may mắn khi đến gần bạn và cảm thấy giao tiếp với bạn rất thoải mái và vui vẻ."
      ],
      "4": [
        "4 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người luôn làm theo quy trình và tuân thủ những nguyên tắc đã đặt ra trước đó. Bạn giỏi hướng dẫn người khác thực hiện công việc theo quy trình của một tổ chức đã đề ra. Lặp ở Đường Đời: Bạn là người thực tế, bạn phải là người trải nghiệm trên con đường chinh phục mục đích cuộc đời. Chỉ khi nào trải qua và cảm nhận được những bài học đắt giá đó bạn mới tin điều đó là đúng và sự trải nghiệm chính là niềm tin của bạn. Lặp ở Ngày sinh: Bạn luôn là người có khả năng logic tốt, luôn có kế hoạch cho mọi việc và cũng là người trung thực, đáng tin cậy. Góc nhìn của bạn thiên về thực tế và có tính an toàn rất cao. Bạn là một chuyên gia đầu tư. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải làm sao tối ưu hóa được quy trình mọi việc một cách tốt nhất, làm sao vượt qua sớm những bài học trải nghiệm cuộc sống. Lặp ở Tương Tác: Bạn là một người chắc chắn nên những gì bạn đưa ra đều có tính thuyết phục cao và làm nhiều người yên tâm về kế hoạch của bạn. Những lý lẽ của bạn đều được lý giải một cách rõ ràng, cụ thể làm cho người khác tin tưởng bạn. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người nghiêm túc trong tất cả mọi việc. Bạn luôn cho người khác thấy sự an tâm và chắc chắn từ con người cũng như kế hoạch thực thi của bạn."
      ],
      "5": [
        "5 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người kết nối rất giỏi. Bạn có khả năng kết nối mọi thứ từ con người đến vạn vật trong cuộc sống. Tập trung đúng năng lượng con số này sẽ giúp bạn thu hút được rất nhiều người đến với bạn. Lặp ở Đường Đời: Bạn luôn thay đổi mọi thứ trên con đường chinh phục sự tự do, phiêu lưu và trải nghiệm sự mạo hiểm. Bạn giỏi khám phá những điều mới lạ để gia tăng thêm bộ sưu tập trên con đường chinh phục mục đích của mình. Lặp ở Ngày sinh: Bạn luôn là người bán hàng rất giỏi. bạn có khả năng thích nghi tốt và rất hoạt bát. Bạn hãy phát huy tài năng của mình trên các lĩnh vực về quảng cáo, marketing, bán hàng và kinh doanh tự do. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải làm sao kết nối và giao tiếp được càng nhiều người càng tốt. Bạn có khả năng kết nối và truyền cảm hứng. Lặp ở Tương Tác: Bạn là người thích tự do và am hiểu đa chủ đề nên có sự đa dạng trong tương tác với nhiều người. Điều này cũng làm cho nhiều người thích thú và khi nói quá nhiều thì bạn cũng sẽ dễ dẫn đến lan man nếu bạn không biết cách tập trung. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người có kiến thức rộng và am hiểu nhiều chủ đề trong cuộc sống. Bạn thể hiện cho người khác thấy sự nhanh trí của bạn và thích nghi mọi lúc mọi nơi."
      ],
      "6": [
        "6 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người luôn quan tâm đến người khác. Bạn dám hy sinh để đứng ra bảo vệ kẻ yếu và sẵn sàng giúp đỡ họ. Bạn yêu thương và sẵn sàng chăm sóc, lo lắng những người bạn quan tâm. Lặp ở Đường Đời: Bạn phải là người giàu lòng nhân ái và có trách nhiệm trên con đường thể hiện lòng yêu thương, giúp đỡ người khác. Bạn cũng thích ôm đồm nhiều thứ đôi lúc cũng làm bạn rất mệt mỏi trong cuộc đời. Lặp ở Ngày sinh: Bạn luôn là người có khả năng quyến rũ và hấp dẫn đến người khác. Bạn luôn thể hiện là một phần quan trọng trong cuộc đời của những người xung quanh và xã hội. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải trở thành một người có lòng bao dung, vị tha và mang giá trị cuộc sống đến với nhiều người. Lặp ở Tương Tác: Bạn là một người rất quan tâm và chăm lo đến người thân, gia đình và những ai đến với cuộc đời họ. Bạn luôn thể hiện cho người khác thấy sự bao dung và sẵn sàng giúp đỡ khi cần. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người lo lắng, có trách nhiệm với mọi người. Bạn không ngại vất vả và dám hy sinh bản thân để tạo nên vẻ đẹp cho nhân loại."
      ],
      "7": [
        "7 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người thầy hướng dẫn, một bậc thầy trí tuệ. Hãy chia sẻ những giá trị tuyệt vời mà bạn đã tích lũy nhiều năm nghiên cứu, chiêm nghiệm để giúp đỡ nhiều người. Lặp ở Đường Đời: Bạn phải là người trải nghiệm một cách sâu sắc những bài học cuộc sống. Những trải nghiệm thời trẻ chính là những bài học tuyệt vời để bạn trở thành người thầy vĩ đại trên con đường sự nghiệp của mình. Lặp ở Ngày sinh: Bạn luôn là người lý trí, có khả năng phân tích sâu sắc. Bạn thích một mình chiêm nghiệm và trả lời những câu hỏi về cuộc sống và biến nó trở thành công cụ để giúp đỡ nhiều người. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải thiền định mỗi ngày để có khả năng cảm nhận tâm linh mạnh và lý giải được những thứ mà khoa học ngày nay chưa lý giả được. Lặp ở Tương Tác: Bạn là người thích phân tích mọi thứ nên người khác sẽ cần bạn tư vấn dưới góc độ một chuyên gia và họ cảm nhận được năng lượng tuyệt vời từ bạn. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người thầy đức cao vọng trọng. Họ cảm nhận được kiến thức uyên bác từ bạn và họ rất kính phục, tôn trọng. Bạn tỏ ra phong thái của một Bậc Thầy Trí Tuệ."
      ],
      "8": [
        "8 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người làm chủ và điều hành một công ty hay doanh nghiệp kinh doanh riêng của bạn. Chủ đề tài chính - kinh doanh - đầu tư là mục đích thật sự mà bạn vào thực hiện trong cuộc đời. Lặp ở Đường Đời: Bạn phải là người thích tiền bạc và có nhiều tham vọng về quyền lực trên con đường chinh phục mục tiêu của mình. Bạn có tầm nhìn xa trên con đường phát triển sự nghiệp vĩ đại của mình. Lặp ở Ngày sinh: Bạn có khả năng điều hành và lên kế hoạch công việc người khác rất tốt. Bạn giỏi về quản trị tài chính cá nhân cũng như biết cách phân bổ vốn của mình trong những kênh đầu tư hiệu quả. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải làm một điều gì đó lớn lao. Tham vọng của bạn sẽ không dừng lại nếu bạn không biết cân bằng cuộc sống. Bạn phải biết cân bằng giữa vật chất và tinh thần. Lặp ở Tương Tác: Bạn là một người rất hào phóng và cũng rất liều lĩnh. Bạn cũng là người rất năng động, mạnh mẽ và có thể hành động bất chấp để đạt được mục đích của mình. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người thành đạt và mong muốn dẫn dắt người khác làm theo ý của mình."
      ],
      "9": [
        "9 CHỈ SỐ LẶP",
        "Lặp ở Sứ Mệnh: Bạn sinh ra để trở thành người sẵn sàng cống hiến hết tất cả những gì bạn tạo ra cho cộng đồng, công ích xã hội với mong muốn mang lại nhiều giá trị tốt đẹp đến nhiều người. Lặp ở Đường Đời: Bạn phải là người trí tuệ, giàu lòng nhân ái và thích chia sẻ những cơ hội, những giá trị tốt đẹp đến với nhiều người. Sự nghiệp của bạn liên quan đến rất nhiều về nhân sinh, cộng đồng xã hội. Lặp ở Ngày sinh: Bạn luôn là người có khả năng quyến rũ và hấp dẫn mạnh đến với người khác đặc biệt là tạo được ấn tượng khi xuất hiện trong đám đông. Những chia sẻ của bạn có tính thuyết phục cao và được đón nhận nhiệt tình. Lặp ở Nội Tâm: Ước mơ, khao khát từ bên trong cũng như những tiếng nói nhỏ trong đầu đều thôi thúc bạn phải làm tạo được giá trị cho bản thân và cống hiến một phần giá trị của mình cho nhân loại. Lặp ở Tương Tác: Bạn là một người của cộng đồng. Bạn cho người khác thấy được tình yêu thương, sự bao dung và lòng nhân ái khi họ tiếp xúc với bạn. Bạn được nhiều người yêu quý và ngưỡng mộ. Lặp ở Thái Độ: Phong cách ứng xử của bạn luôn cho người khác thấy bạn là một người có tinh thần nhân đạo và rất tự tin khi chia sẻ trước công chúng. Bạn sẵn sàng mở hầu bao của mình để làm từ thiện và giúp đỡ người khác khi cần thiết."
      ]
    },
    "intro": [
      "Trong hành trình chinh phục mục đích cuộc đời bạn sẽ cảm nhận được nguồn năng lượng tác động rất mãnh liệt bởi một con số nào đó có thể giúp bạn thành công cũng có thể cản trở con đường của bạn. Một trong những con số quan trọng có tần số rung động mạnh nhất đó là chỉ số lặp. Chỉ số lặp là đại diện cho cả thách thức và cơ hội. Khi nhận biết và ý thức được sự lặp lại hay sự tăng cường năng lượng trong hồ sơ của bạn, bạn có thể nỗ lực để điều chỉnh phản ứng của mình và thay đổi cách tiếp cận với những thách thức. Bạn hãy cảm nhận nguồn năng lượng vũ trụ tác động đến cuộc đời mình thông qua chỉ số lặp xuất hiện trong hồ sơ cốt lõi của bạn và hãy kiểm tra các chỉ số có chỉ số lặp đó để tận dụng nguồn lực tối đa. Hãy đón nhận nguồn năng lượng đó và biến nó trở thành công cụ giúp bạn sớm chinh phục mục đích cuộc đời. CHỈ SỐ LẶP"
    ]
  },
  "attitude": {
    "byValue": {
      "1": [
        "1 THÁI ĐỘ 1 = NGƯỜI ĐỘC ĐÁO Thái độ số 1 sẽ là người độc đáo, bạn mang dấu ấn cá nhân riêng của mình vào mọi việc bạn làm. Bạn có thể tỏ ra hung hăng nhưng đồng thời rất tự tin và có năng lực. Bạn tràn đầy nhiệt huyết và có những ý tưởng tuyệt vời. Bạn không sợ đối đầu, có thể rất bốc đồng và ít quan tâm đến hậu quả từ các hành động và quyết định nhanh của mình. Bạn có khả năng tạo ra sự ảnh hưởng của mình đến người khác, bạn có thể dẫn đầu cuộc đua, bạn có thể làm cho mọi người tin và đi theo bạn. Bạn rất dễ gây ấn tượng với những người xung quanh. CHỈ SỐ THÁI ĐỘ"
      ],
      "11": [
        "11/2 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 11/2 sẽ là người có trực giác mãnh liệt và thậm chí nhạy cảm. Bạn hay dùng giác quan của mình để đánh giá người khác trước khi tiếp xúc gần với họ và bạn có thái độ với họ thông qua sự đánh giá trực quan hơn là tìm hiểu họ. Khi ai đó có sự cầu thị ở bạn thì bạn sẵn sàng dùng hết năng lượng của mình để truyền đạt và bạn luôn ở một trạng thái tốt nhất để truyền cảm hứng cho người khác. Mọi người sẽ bị thu hút bởi năng lượng vốn có của bạn, vì bạn được sinh ra là để dẫn dắt và truyền cảm hứng cho mọi người."
      ],
      "13": [
        "4 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 4 là một người bên trong có nhiều tình cảm, nhưng bên ngoài lại tỏ ra bất cần lạnh lùng. Đừng lo lắng về biểu hiện yếu đuối của bạn khi bị người khác thấy. Việc thể hiện bị tổn thương về mặt cảm xúc không phải lúc nào cũng là điểm yếu mà đôi khi có thể giúp bạn tiến xa hơn trong các mối quan hệ.",
        "Bạn là người sống có quy tắc, bạn luôn cần bằng mọi thứ và luôn muốn người khác đánh giá cao tài năng mà bạn đã cống hiến. Bạn thích rèn luyện kỹ năng tổ chức, quản lý và muốn người khác phải công nhận khả năng của bạn và nghe theo."
      ],
      "14": [
        "5 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 5 sẽ là người có khả năng sử dụng sức hút của mình để điều hướng và đạt được những gì bạn muốn trong cuộc sống. Bạn thích một cuộc sống phiêu lưu, thú vị với nhịp sống nhanh. Bạn dường như không sợ gì và luôn tìm kiếm sự vui vẻ nhanh chóng, đôi khi vội vàng.",
        "Bạn sẵn sàng chịu thử thách và hoạt động tốt nhất trong môi trường luôn thay đổi, năng động và thậm chí hỗn loạn. Người khác luôn chú ý đến bạn vì sự năng động của bạn. Tránh các mối quan hệ nhanh chóng và mạo hiểm đặc biệt là trong tình cảm , vì nó có thể sẽ ảnh hưởng đến công việc của bạn và làm bạn bị rắc rối."
      ],
      "16": [
        "7 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 7 sẽ là người cảm thấy những câu chuyện phiếm có thể giết chết mình. Nếu việc trò chuyện bao gồm những tiếng cười giả tạo, bạn thà ở nhà. Điều này khiến bạn có vẻ lạc lõng và xa cách. Dường như có một bầu không khí bí ẩn về bạn vì bạn thích giữ chặt các lá bài tẩy của mình. Bạn muốn quan sát và đặt câu hỏi hơn là chia sẻ bất cứ điều gì quá riêng tư.",
        "Bạn ham học hỏi, thích những cuộc trò chuyện có nội dung và riêng tư hơn là những cuộc trò chuyện vui vẻ theo nhóm. Những lời châm biếm và đôi khi là khiếu hài hước khô khan của bạn không phải lúc nào cũng được đón nhận."
      ],
      "19": [
        "1 THÁI ĐỘ 1 = NGƯỜI ĐỘC ĐÁO Thái độ số 1 sẽ là người độc đáo, bạn mang dấu ấn cá nhân riêng của mình vào mọi việc bạn làm. Bạn có thể tỏ ra hung hăng nhưng đồng thời rất tự tin và có năng lực. Bạn tràn đầy nhiệt huyết và có những ý tưởng tuyệt vời. Bạn không sợ đối đầu, có thể rất bốc đồng và ít quan tâm đến hậu quả từ các hành động và quyết định nhanh của mình. Bạn có khả năng tạo ra sự ảnh hưởng của mình đến người khác, bạn có thể dẫn đầu cuộc đua, bạn có thể làm cho mọi người tin và đi theo bạn. Bạn rất dễ gây ấn tượng với những người xung quanh. CHỈ SỐ THÁI ĐỘ"
      ],
      "2": [
        "2 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 2 sẽ là người tử tế, ngoại giao tốt và kiên nhẫn. Sự nhạy cảm đáng kinh ngạc của bạn thường được thể hiện dưới dạng những lo lắng bất an. Hãy cẩn trọng về những cảm xúc bạn nhận từ người khác. Bạn không cần quá quan tâm đến những trải nghiệm, tâm trạng, ý kiến hay cảm xúc của người khác. Hãy nhớ rằng ai cũng có cuộc sống của riêng họ và bạn không phải là trung tâm của mọi sự chú ý. Đừng làm quá vấn đề hay đặt bản thân mình vào trung tâm."
      ],
      "22": [
        "22/4 CHỈ SỐ THÁI ĐỘ",
        "Bạn thích ai đó nói về những chủ đề vĩ mô, mang tầm cỡ thế giới và mang lại giá trị cho nhân loại, bên cạnh đó những người khác cũng sẽ thấy khả năng tuyệt vời của bạn trong việc xây dựng những ý tưởng có giá trị cống hiến cho xã hội lâu dài.",
        "Con số thái độ Vua 22/4 nói lên được bạn là người sống có quy tắc, luôn hiểu được mọi thứ trên đời đều có hai mặt của nó, nên bạn luôn giữ được sự cân bằng trong sự nghiệp ở bên ngoài và tâm hồn bên trong của bạn. Bạn sẽ trân trọng ai có học thức uyên bác nhưng có khả năng ứng dụng để tạo ra giá trị cho xã hội, đó là những người bạn cần giao tiếp và xây dựng mối quan hệ, nếu doanh nghiệp của bạn thành công vượt bậc chắc chắn phải có công sức của bạn vì bạn là người kiến tạo tuyệt vời"
      ],
      "3": [
        "3 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 3 là người có vẻ ngoài vui vẻ và vô tư, bạn thích việc làm cho người khác cười, điều này cũng khiến bạn vui, bạn thông minh và hóm hỉnh nên thu hút được nhiều người và rất giỏi ngoại giao.",
        "Tuy nhiên bạn rất nhạy cảm, hay lo sợ bị chỉ trích và phản đối. Bạn dễ bị phân tán, đôi lúc thất thường và kể nhiều câu chuyện khác nhau. Đừng bất an với những cảm xúc hỗn loạn, bạn chỉ cần học cách vượt qua và nhìn nhận nó thì sẽ loại bỏ được nó ra khỏi con người bạn. Đi du lịch một mình trải nghiệm hoặc tập yoga hay thiền sẽ giúp ích cho bạn rất nhiều."
      ],
      "4": [
        "4 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 4 là một người bên trong có nhiều tình cảm, nhưng bên ngoài lại tỏ ra bất cần lạnh lùng. Đừng lo lắng về biểu hiện yếu đuối của bạn khi bị người khác thấy. Việc thể hiện bị tổn thương về mặt cảm xúc không phải lúc nào cũng là điểm yếu mà đôi khi có thể giúp bạn tiến xa hơn trong các mối quan hệ.",
        "Bạn là người sống có quy tắc, bạn luôn cần bằng mọi thứ và luôn muốn người khác đánh giá cao tài năng mà bạn đã cống hiến. Bạn thích rèn luyện kỹ năng tổ chức, quản lý và muốn người khác phải công nhận khả năng của bạn và nghe theo."
      ],
      "5": [
        "5 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 5 sẽ là người có khả năng sử dụng sức hút của mình để điều hướng và đạt được những gì bạn muốn trong cuộc sống. Bạn thích một cuộc sống phiêu lưu, thú vị với nhịp sống nhanh. Bạn dường như không sợ gì và luôn tìm kiếm sự vui vẻ nhanh chóng, đôi khi vội vàng.",
        "Bạn sẵn sàng chịu thử thách và hoạt động tốt nhất trong môi trường luôn thay đổi, năng động và thậm chí hỗn loạn. Người khác luôn chú ý đến bạn vì sự năng động của bạn. Tránh các mối quan hệ nhanh chóng và mạo hiểm đặc biệt là trong tình cảm , vì nó có thể sẽ ảnh hưởng đến công việc của bạn và làm bạn bị rắc rối."
      ],
      "6": [
        "6 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 6 sẽ là người có năng lực, thông minh và nhanh trí. Bạn rất giỏi trong những trường hợp khẩn cấp và thậm chí còn giỏi hơn trong việc kiểm soát câu chuyện của bạn. Như một bác sĩ giỏi, bạn biết phải làm gì khẩn cấp. Những người khác nhìn nhận bạn là một người cầu toàn với gu thẩm mỹ tuyệt vời, luôn tìm cách đặt cái nhìn hoàn hảo của mình vào mọi thứ, đôi khi tạo áp lực cho bản thân và người đồng đội của bạn. Đôi khi bạn cần hạ thấp tiêu chuẩn bản thân để có được các mối quan hệ hay cộng sự của bạn cũng dễ dàng làm việc với bạn hơn."
      ],
      "7": [
        "7 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 7 sẽ là người cảm thấy những câu chuyện phiếm có thể giết chết mình. Nếu việc trò chuyện bao gồm những tiếng cười giả tạo, bạn thà ở nhà. Điều này khiến bạn có vẻ lạc lõng và xa cách. Dường như có một bầu không khí bí ẩn về bạn vì bạn thích giữ chặt các lá bài tẩy của mình. Bạn muốn quan sát và đặt câu hỏi hơn là chia sẻ bất cứ điều gì quá riêng tư.",
        "Bạn ham học hỏi, thích những cuộc trò chuyện có nội dung và riêng tư hơn là những cuộc trò chuyện vui vẻ theo nhóm. Những lời châm biếm và đôi khi là khiếu hài hước khô khan của bạn không phải lúc nào cũng được đón nhận."
      ],
      "8": [
        "8 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 8 sẽ là người sinh ra để dẫn đầu, bạn là người tiên phong trong mọi việc và khi được cân bằng về nội tâm cũng như vật chất thì không gì có thể ngăn cản được sự phát triển của bạn. Bạn thể hiện sự tự tin và nỗ lực để duy trì một hình ảnh thành công.",
        "Thời gian là tiền bạc, và nó có thể mang lại sự ổn định, an toàn và tự do mà bạn mong muốn. Nếu thấy mình thiếu nguồn lực hoặc thiếu khả năng kiểm soát, bạn có thể thể hiện thái độ chống đối và tức giận. Bạn sẽ nhanh chóng phải nhận nghiệp, dù tốt hay xấu."
      ],
      "9": [
        "9 CHỈ SỐ THÁI ĐỘ",
        "Thái độ số 9 sẽ là người tự tin và quyến rũ, bạn thu hút nhiều người khác phái săn đón bạn dù bạn không hề có ý định đùa giỡn với ai. Mọi người thường có cảm giác bị đe dọa bởi bạn. Bất kỳ ai có điều gì đó muốn che giấu đều lo sợ bạn sẽ phơi bày chúng trong vô thức nên sẽ có người yêu quý bạn hoặc tránh né bạn.",
        "Khi bạn đã làm việc gì thì bạn sẽ tạo cảm giác cho mọi người đều tin tưởng ở bạn. Điều này khiến cho bạn được giao nhiều trách nhiệm quan trọng hơn trong công việc."
      ]
    },
    "intro": [
      "CHỈ SỐ THÁI ĐỘ",
      "Chỉ số Thái độ có vai trò rất quan trọng trong việc thể hiện hành vi phản ứng của bạn thông qua biểu cảm, lời nói, hành động. Chỉ số này cho biết cách bạn hành xử trong cuộc sống như thế nào và thể hiện rất rõ nét từ khi sinh ra đến kết thúc đỉnh đầu tiên của chặng đường đời trong cuộc đời bạn.",
      "Chỉ số này còn cho biết khi một người khác đánh giá bạn bằng trực giác của họ thì liệu rằng họ có thích bạn hay có thể hòa hợp với bạn hay không. Chỉ số này liên quan đến ấn tượng và đánh giá đầu tiên về bạn. Ngoài ra cũng quyết định đến cơ hội tuyển dụng của bạn."
    ]
  },
  "interaction": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ TƯƠNG TÁC",
        "Năng lượng của bạn đủ để truyền cho tất cả mọi người, và kiểm soát luôn cả năng lượng của họ nên bạn dễ dàng dẫn dắt người khác làm theo ý bạn muốn. Khi gặp khó khăn, bạn là người kiên trì và thể hiện sự dũng cảm để mọi người vững tin vào bạn.",
        "Bạn biết cách ăn mặc và luôn chú ý đến ngoại hình của mình, theo dõi những phong cách thời trang khác nhau và tạo cho mình một phong cách riêng biệt. Bạn xứng đáng được danh hiệu là người dẫn đầu, một nhà thám hiểm chuyên nghiệp vì bạn luôn có ý tưởng riêng biệt khi thực hiện mọi việc. Điều bạn cần tránh là những hành xử hung hăng vì mọi người có thể cảm thấy bị đe dọa khi bạn không giữ được bình tĩnh."
      ],
      "11": [
        "11/2 CHỈ SỐ TƯƠNG TÁC",
        "11/2 - NGƯỜI THÂN THIỆN VÀ KHIÊM TỐN Nếu để tìm một người có thể tạm trú qua đêm trong lúc nguy cấp thì mọi người sẽ nghĩ đến bạn vì ở nơi bạn họ cảm nhận được sự gần gũi và an toàn, bạn là một người thiên thiện với vẻ ngoài dịu dàng và ân cần.",
        "Bạn có cốt cách của một người quý phái, sự mềm mại và ấm áp bên trong của bạn tỏa ra nguồn năng lượng thu hút được mọi người và tạo ra sự thiện cảm mà khó ai có thể không hài lòng về bạn. Tài năng nhưng khiêm tốn là cụm từ dành cho bạn. Tiêu chí của bạn là không xảy ra mâu thuẫn với bất kỳ ai, bạn luôn giữ cho mình một không gian riêng biệt với nền hòa bình tự trị và đôi lúc bạn là người hòa giải tốt nhất của mọi người xung quanh."
      ],
      "13": [
        "4 CHỈ SỐ TƯƠNG TÁC",
        "Bạn luôn tạo cho người khác nhìn thấy rằng bạn ở một vị thế trên cao và mọi người phải kính trọng bạn, bạn luôn tạo cho họ cảm giác đáng tin cậy. Bạn là người có trách nhiệm, sống dè dặt nên bạn khó để lọt tai những lời khuyên từ người khác điều này khiến họ cảm giác bạn là một người bảo thủ và tự cao. Bạn cần linh hoạt hơn trong mọi tình huống vì không phải lúc nào cũng làm theo quy tắc là tốt nhất. Đôi khi bạn cần lắng nghe lời khuyên của người khác và đặt niềm tin khi làm việc cùng với họ, đừng ôm hết mọi việc vào bản thân mình nếu bạn muốn tiến xa hơn thì hãy bỏ bớt những chuyện vặt."
      ],
      "14": [
        "5 CHỈ SỐ TƯƠNG TÁC",
        "Bạn có thể là trung tâm gây cười, vì bạn có khả năng hài hước và dí dỏm, sự lạc quan và vui vẻ của bạn luôn thu hút mọi người đến gần bạn hơn. Bạn sống hướng ngoại, bạn luôn trao chuốc cho ngoại hình của bạn, vì năng lượng bên trong con người bạn luôn trẻ trung và tươi mới.",
        "Nhưng bạn nên nhớ rằng khi bạn đã đảm nhận công việc gì thì phải đặt trách nhiệm lên hàng đầu vì điều đó sẽ giúp bạn phát triển sự nghiệp một cách tốt hơn. Đừng để sự vô tư của bạn ảnh hưởng đến công việc và ảnh hưởng đến người khác."
      ],
      "16": [
        "7 CHỈ SỐ TƯƠNG TÁC",
        "Bạn hiểu được trách nhiệm và bổn phận của mình trong đoàn thể, bạn luôn giữ đúng vị trí của bạn vì bạn không thích những lời nói không hay về bạn. Nhận thức của bạn vượt xa người bình thường vì bạn sở hữu một trí tuệ thông minh vượt bậc về tâm linh, bạn có nhiều câu hỏi bên trong nên những hành động của bạn có xu hướng lập dị và xa cách tuy nhiên nếu mọi người hiểu được bạn thì họ có thể làm bạn tri kỷ gắn bó lâu dài với bạn. Bạn sống hướng nội và đặc biệt hay chiêm nghiệm những câu triết lý trong cuộc sống và ghi nhớ chúng sau đó áp dụng với bản thân mình trong hoàn cảnh tương tự."
      ],
      "19": [
        "1 CHỈ SỐ TƯƠNG TÁC",
        "Năng lượng của bạn đủ để truyền cho tất cả mọi người, và kiểm soát luôn cả năng lượng của họ nên bạn dễ dàng dẫn dắt người khác làm theo ý bạn muốn. Khi gặp khó khăn, bạn là người kiên trì và thể hiện sự dũng cảm để mọi người vững tin vào bạn.",
        "Bạn biết cách ăn mặc và luôn chú ý đến ngoại hình của mình, theo dõi những phong cách thời trang khác nhau và tạo cho mình một phong cách riêng biệt. Bạn xứng đáng được danh hiệu là người dẫn đầu, một nhà thám hiểm chuyên nghiệp vì bạn luôn có ý tưởng riêng biệt khi thực hiện mọi việc. Điều bạn cần tránh là những hành xử hung hăng vì mọi người có thể cảm thấy bị đe dọa khi bạn không giữ được bình tĩnh."
      ],
      "2": [
        "2 CHỈ SỐ TƯƠNG TÁC",
        "Bạn có vẻ ngoài thân thiện, khiêm tốn và toát ra vẻ mềm mại, ấm áp. Mọi người bị thu hút bởi bạn vì bạn trông rất nhiệt tình và gần gũi với họ, họ có thể xem bạn như một nơi trú chân yên bình và ấm áp, đặc biệt sự dịu dàng và ân cần của bạn có thể tạo thiện cảm với người khác phái.",
        "Trang phục của bạn thường sạch sẽ, gọn gàng, thướt tha, mềm mại và nhẹ nhàng. Phong thái của bạn ung dung tự tại làm người khác ngưỡng mộ. Bạn luôn khiến người khác cảm thấy họ được trân trọng và được yêu thương, bạn xứng đáng là sứ giả hòa bình."
      ],
      "22": [
        "22/4 CHỈ SỐ TƯƠNG TÁC",
        "Bạn luôn luôn ở một vị trí mà người khác ngưỡng mộ bạn, vì bạn có được chỉ số tương tác 22/4 là con số Vua. Với tài năng và trách nhiệm của bạn thì nguồn năng lượng của bạn luôn tỏ ra là một người đáng tin cậy, bạn luôn được giao những trọng trách cao trong công việc. Việc quá tài giỏi khiến bạn khó có thể chấp nhận những khuyết điểm của mình, nên đôi khi dù biết mình sai nhưng bạn vẫn không nhận lỗi về mình.",
        "Bạn cần linh hoạt hơn trong lời nói, vì không phải lúc nào nói sự thật cũng là tốt nhất. Đặc biệt trong các mối quan hệ đôi khi bạn làm cho đối phương tự ti khi ở bên cạnh bạn. Khiêm tốn và hòa đồng là điều bạn cần học và ứng dụng."
      ],
      "3": [
        "3 CHỈ SỐ TƯƠNG TÁC",
        "Thu hút người khác là một việc không dễ dàng nhưng bạn vừa có thể thu hút người khác vừa có thể truyền cảm hứng cho họ như một diễn giả chuyên nghiệp. May mắn và cơ hội luôn đến với bạn vì bạn là người có khả năng tự tạo động lực cho mình và truyền cả động lực này cho người khác.",
        "Cuộc sống của bạn sẽ thăng hoa và được nhiều người mơ ước vì bạn là người hướng ngoại và lạc quan, lúc nào cũng ăn mặc sặc sỡ và trang sức lấp lánh và đặc biệt bạn rất thích được người khác giới theo đuổi, săn đón. Nhưng đừng lợi dụng sự quyến rũ của bạn để thả trôi bản thân quá nhiều vào chuyện tình ái, hãy cố gắng phát triển các mối quan hệ sâu sắc và lâu dài bạn sẽ tránh được những phiền toái không đáng có. Sự hóm hỉnh giúp bạn tạo được niềm vui cho người khác nhưng sẽ khiến bạn dấn thân quá nhiều vào những cuộc trò chuyện hời hợt, vô nghĩa làm mất khá nhiều thời gian của bạn."
      ],
      "4": [
        "4 CHỈ SỐ TƯƠNG TÁC",
        "Bạn luôn tạo cho người khác nhìn thấy rằng bạn ở một vị thế trên cao và mọi người phải kính trọng bạn, bạn luôn tạo cho họ cảm giác đáng tin cậy. Bạn là người có trách nhiệm, sống dè dặt nên bạn khó để lọt tai những lời khuyên từ người khác điều này khiến họ cảm giác bạn là một người bảo thủ và tự cao. Bạn cần linh hoạt hơn trong mọi tình huống vì không phải lúc nào cũng làm theo quy tắc là tốt nhất. Đôi khi bạn cần lắng nghe lời khuyên của người khác và đặt niềm tin khi làm việc cùng với họ, đừng ôm hết mọi việc vào bản thân mình nếu bạn muốn tiến xa hơn thì hãy bỏ bớt những chuyện vặt."
      ],
      "5": [
        "5 CHỈ SỐ TƯƠNG TÁC",
        "Bạn có thể là trung tâm gây cười, vì bạn có khả năng hài hước và dí dỏm, sự lạc quan và vui vẻ của bạn luôn thu hút mọi người đến gần bạn hơn. Bạn sống hướng ngoại, bạn luôn trao chuốc cho ngoại hình của bạn, vì năng lượng bên trong con người bạn luôn trẻ trung và tươi mới.",
        "Nhưng bạn nên nhớ rằng khi bạn đã đảm nhận công việc gì thì phải đặt trách nhiệm lên hàng đầu vì điều đó sẽ giúp bạn phát triển sự nghiệp một cách tốt hơn. Đừng để sự vô tư của bạn ảnh hưởng đến công việc và ảnh hưởng đến người khác."
      ],
      "6": [
        "6 CHỈ SỐ TƯƠNG TÁC",
        "Bạn luôn thể hiện mình là người có khả năng bảo vệ người khác, bạn sẵn sàng nghe họ tâm sự và kể về những nỗi đau hay mất mát của họ vì bạn có sự thấu cảm đặc biệt mà ít ai có được.",
        "Bạn có thể cảm thông cho hoàn cảnh của mọi người khi họ gặp khó khăn và tìm lý do để giúp đỡ họ, nhưng trong công việc bạn đặc biệt lại là người cầu toàn và muốn mọi việc lúc nào cũng phải hoàn hảo nhất. Bạn là một người có năng lực, trông rất thanh lịch và đặc biệt là có kỹ năng chăm sóc người khác, mọi người luôn yêu quý khả năng này của bạn"
      ],
      "7": [
        "7 CHỈ SỐ TƯƠNG TÁC",
        "Bạn hiểu được trách nhiệm và bổn phận của mình trong đoàn thể, bạn luôn giữ đúng vị trí của bạn vì bạn không thích những lời nói không hay về bạn. Nhận thức của bạn vượt xa người bình thường vì bạn sở hữu một trí tuệ thông minh vượt bậc về tâm linh, bạn có nhiều câu hỏi bên trong nên những hành động của bạn có xu hướng lập dị và xa cách tuy nhiên nếu mọi người hiểu được bạn thì họ có thể làm bạn tri kỷ gắn bó lâu dài với bạn. Bạn sống hướng nội và đặc biệt hay chiêm nghiệm những câu triết lý trong cuộc sống và ghi nhớ chúng sau đó áp dụng với bản thân mình trong hoàn cảnh tương tự."
      ],
      "8": [
        "8 CHỈ SỐ TƯƠNG TÁC",
        "8 - NGƯỜI MẠNH MẼ & ẤN TƯỢNG Bạn là người tạo ra giá trị cho người khác, bất kỳ ai gặp bạn cũng sẽ có ấn tượng rằng bạn là một doanh nhân thành đạt vì sự tinh tế và tự tin của bạn.",
        "Bạn có sức ảnh hưởng khá nhiều đối với các mối quan hệ xung quanh và có khả năng kiểm soát mọi thứ bạn muốn. Bạn luôn đặt mục tiêu làm việc và tạo ra giá trị, bạn có mong muốn cụ thể về vật chất một cách thiết thực, mục tiêu phấn đấu của bạn luôn ưu tiên là tiền bạc. Bạn sẵn sàng chiến đấu đến cùng nếu như phải rơi vào thế cạnh tranh, với tầm nhìn xa của bạn thì bạn sẽ nhanh chóng tạo ra quyền lực và thỏa mãn tham vọng lớn của mình."
      ],
      "9": [
        "9 CHỈ SỐ TƯƠNG TÁC",
        "Bạn luôn thể hiện mình có nét đặc trưng riêng trong đoàn thể, mọi người khó có thể thay thế vị trí của bạn vì bạn có một cá tính riêng biệt. Khi bạn đã quyết thì khó ai có thể thay đổi được bạn, tuy nhiên bạn là người có năng lực và ngoại giao rất tốt điều này giúp bạn có được hiệu quả trong công việc.",
        "Bạn nên hiểu rằng mỗi người đều có ưu điểm riêng của mình nên việc chúng ta học hỏi lẫn nhau là một điều tốt thay vì so sánh. Sự kiêu ngạo sẽ giết chết tất cả các mối quan hệ nếu như bạn không nhận ra điều đó."
      ]
    },
    "intro": [
      "CHỈ SỐ TƯƠNG TÁC",
      "Chỉ số tương tác thể hiện hành vi, cách ứng xử và phản ứng của bạn thông qua giao tiếp bằng ngôn ngữ. Đây là chỉ số quyết định ấn tượng đầu tiên của bạn đối với người khác. Chỉ số tương tác cũng chỉ ra hướng đi nghề nghiệp cho bạn, vì nó thể hiện tài năng và khả năng kết nối của bạn. Nó giúp bạn trở thành người tài giỏi trong lĩnh vực chuyên môn của mình. Chỉ số tương tác trong thần số học sẽ cho bạn biết mình cần học tập và rèn luyện thêm như thế nào để có thể ứng phó với những tình huống ngoại giao, giúp bạn phát triển bản thân."
    ]
  },
  "balance": {
    "byValue": {
      "1": [
        "CHỈ SỐ CÂN BẰNG 1",
        "Nếu bạn tập trung năng lượng của mình để làm một việc và không bị phân tán thì sức mạnh của bạn sẽ hội tụ một cách tuyệt đối cho nên bạn hãy cố gắng kiểm soát sức mạnh của mình. Gia đình và bạn bè là những người bạn có thể chia sẻ những khó khăn để họ hỗ trợ bạn để bạn tập trung vào những mục tiêu khác và có kế hoạch tốt để thực hiện chúng. Đừng làm người đơn độc khi đối mặt với các vấn đề, vì như vậy bạn có thể bị mắc phải góc nhìn phiến diện và các vấn đề ngày trở nên khó giải quyết hơn. Bạn có sức mạnh, lòng dũng cảm và sự sáng tạo từ bên trong nên bạn hãy tự tin rằng bạn luôn có những cánh tay đắc lực hỗ trợ bạn khi bạn đương đầu với những khó khăn thử thách."
      ],
      "2": [
        "CHỈ SỐ CÂN BẰNG 2",
        "Bên trong mỗi người đều có sự cân bằng, chỉ cần bạn biết cách thực hành thì bạn sẽ có thể cân bằng được sự nhạy cảm của bạn vì sự nhạy cảm có quá nhiều bên trong bạn. Để có thể cân bằng thì bạn phải làm việc nhiều hơn, khi bạn làm việc chăm chỉ thì bạn sẽ bớt căng thẳng, bạn cũng đừng quá lo lắng vì tài năng bẩm sinh của bạn là tìm ra giải pháp để thỏa mãn tất cả mọi việc.",
        "Sự can đảm có thể đặt được qua luyện tập, và bạn cần sự can đảm trong tính cách của mình, thay vì lùi bước trước khó khăn thì bạn hãy đương đầu với nó. Đừng quá dễ dàng thỏa hiệp với khó khăn, hãy sống lạc quan và vui vẻ hơn, cố gắng đừng làm quá mọi chuyện, nên học cách khéo léo trong giao tiếp giữa các mối quan hệ của mình."
      ],
      "3": [
        "CHỈ SỐ CÂN BẰNG 3",
        "Khi bạn vui vẻ và lạc quan thì các vấn đề của bạn có thể tháo gỡ một cách dễ dàng hơn, bạn đừng nên quá xúc động khi đối mặt với một vấn đề nào đó, hãy kiểm soát và quản trị cảm xúc của mình thì bạn sẽ có thể đối mặt với nó bằng tài năng vốn có của bạn. Bạn đừng nên nhìn sự việc một cách chủ quan, nhìn sự việc theo cách mà chỉ riêng bạn nhìn thấy. Hãy kết hợp với người khác để đạt được giải pháp thoả mãn cả hai phía, điều này giúp bạn dễ dàng tiếp cận đến các giải pháp tốt nhất để có thể hướng tới thành công."
      ],
      "4": [
        "CHỈ SỐ CÂN BẰNG 4",
        "Sự nóng giận có thể làm bạn mất nhiều mối quan hệ và đôi khi làm hỏng rất nhiều việc của bạn, nên việc đầu tiên bạn cần làm khi sở hữu con số này là phải học cách kiểm soát cơn giận của mình. Bạn phải hiểu rằng kỷ luật luôn là điều mà có thể giúp tất cả các doanh nghiệp lớn mạnh, nên kỷ luật cũng là sức mạnh của bạn, bạn cần có kỷ luật.",
        "Khi bạn giận dữ, bạn hãy đặt mình vào vị trí của người mà bạn đang có xung đột, họ có thể làm cho bạn nóng giận nhưng nếu bạn đổi vị trí thì có thể bạn sẽ hành xử khác đi, hãy nhìn sự việc ở nhiều góc độ hơn bạn sẽ nhìn nhận ra được vấn đề cần giải quyết. Khi bạn hiểu được lý lẽ thì ý thức về công lý sẽ đưa bạn đến một bậc cao hơn, ở nơi đó bạn sẽ có nhiều phẩm hạnh tốt như là vị tha, lòng trắc ẩn và biết cảm thông với người khác."
      ],
      "5": [
        "CHỈ SỐ CÂN BẰNG 5",
        "Đừng trốn tránh vấn đề, vì khi bạn tập trung vào giải quyết nó thì bạn sẽ bước lên một nấc thang cao hơn và nấc thang đó sẽ giúp bạn tiến gần đến thành công. Đừng quá lo âu, bạn có thể đi chơi hay thử nghiệm du lịch một mình để trải nghiệm cuộc sống, điều đó sẽ giúp bạn nhìn ra được nhiều điều mới mẻ.",
        "Có khi bạn không biết được tài năng của bạn có thể làm những việc phi thường đến mức nào, nên bạn thử đặt tâm trí của bạn vào một việc nào đó thì bạn sẽ thấy được khả năng tìm ra giải pháp mang tính sáng tạo của bạn, tất cả giải pháp để giải quyết mọi vấn đề đến với bạn đều nằm trong tầm tay của bạn."
      ],
      "6": [
        "CHỈ SỐ CÂN BẰNG 6",
        "Bạn nên nhớ rằng bạn bị thu hút bởi những người như thế nào thì bạn hãy tập trung để vượt trội hơn như vậy và đừng dành thời gian để ngưỡng mộ hay phục vụ cho người khác.",
        "Nếu bạn cần sự giúp đỡ thì cứ mạnh dạn tìm đến các mối quan hệ của mình, bạn bè hay gia đình là những người có khả năng giúp đỡ bạn, tốt nhất là bạn đừng xử lý các sự cố một mình. Hãy yêu thương bản thân và gia đình bạn nhiều hơn , đó là điều bạn cần nên làm hơn là chạy theo những hư danh hay sự ngưỡng mộ không đáng."
      ],
      "7": [
        "CHỈ SỐ CÂN BẰNG 7",
        "Bạn biết mình muốn gì không? Một người không biết mình muốn gì thì không bao giờ có mục tiêu rõ ràng. Bạn hãy nhìn thẳng vào vấn đề để tìm hướng giải quyết, đôi lúc phải dừng lại để chiêm nghiệm nội tâm của mình xem mình thật sự muốn gì và đưa ra giải pháp hợp lý.",
        "Bình tĩnh, tự tin và không qua đẩy cảm xúc đi quá xa thì bạn sẽ đối diện được với vấn đề và giải quyết nó một cách nhẹ nhàng. Bạn có thể vượt qua cảm xúc bằng cánh tĩnh tâm và chiêm nghiệm lại những gì mình đã làm."
      ],
      "8": [
        "CHỈ SỐ CÂN BẰNG 8",
        "Bạn có quá nhiều năng lượng, bạn là người có nhiều năng lực và cần học cách sử dụng nó một cách cân bằng thay vì sử dụng quyền lực theo cách thao túng. Bạn có khả năng tiếp cận với những người có quyền lực chính, nhưng bạn biết cách lựa chọn để không phải đối đầu.",
        "Cố gắng không áp đặt giải pháp riêng của bạn cho cả nhóm, nhưng hãy chia sẻ để họ nhìn thấy được những giải pháp chung lớn hơn và cùng nhau giải quyết vấn đề. Năng lượng của bạn có thể ảnh hưởng đến cả một tập thể, nên bạn cần học cách điều tiết năng lượng vì lợi ích chung của tất cả mọi người."
      ],
      "9": [
        "CHỈ SỐ CÂN BẰNG 9",
        "Các vấn đề của bạn đều nằm trong sự lo ngại của người khác, nên chỉ cần bạn đặt mình vào vị trí của họ và đồng cảm thì bạn sẽ hiểu được bạn cần làm gì.",
        "Bạn là người có khả năng nhìn bao quát nên bạn sẽ hiểu được mọi người một cách dễ dàng, dù ở tầng lớp nào bạn cũng có thể nhìn thấu họ nên bạn luôn cho rằng mình đứng ở vị trí cao hơn họ. Bạn đừng quên rằng tương lai là của ngày mai, quan trọng nhất vẫn là hiện tại, hãy trở về với thực tại mà mọi người đang sống bạn sẽ tìm ra các giải pháp của mình, chỉ khi cho đi thì mới nhận lại."
      ]
    },
    "intro": [
      "CHỈ SỐ CÂN BẰNG",
      "Mỗi người đều có những cảm xúc nội tâm khác nhau trong từng tình huống vì vậy sự cân bằng là điều cần thiết để chúng ta có thể phản ứng tốt với những gì xảy ra trong cuộc đời này. Sự trưởng thành và phát triển bản thân giúp chúng ta học được những phương pháp mới hiệu quả hơn để giải quyết những vấn đề mà chúng ta đối mặt, nhưng để trưởng thành thì chúng ta phải làm chủ được cảm xúc và có được sự cân bằng thân tâm. Chỉ số cân bằng sẽ giúp chúng ta tìm ra giải pháp tốt nhất để vượt qua những tình huống khó khăn trong cuộc đời để bạn luôn cân bằng cuộc sống."
    ]
  },
  "missing": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 1 = ĐỘC LẬP & CHỦ ĐỘ NG Để chinh phục ước mơ của mình, bạn cần chủ động hơn và phải có quyết tâm, đôi khi tính độc lập và tự đưa ra quyết định mà không cần tham khảo ý kiến người khác sẽ làm cho bạn mạnh mẽ và quyết đoán hơn. Cần nên khẳng định bản thân để không ai có thể đàn áp được bạn, chỉ cần bạn mạnh mẽ và năng động hơn, thường xuyên tập thể dục thể thao thì những kẻ mạnh khác sẽ không có cơ hội ức hiếp bạn.",
        "Hãy sống và làm việc trên sự tự tin và tin tưởng và khả năng của mình, đừng nên quá quan tâm đến những gì người khác nghĩ, khi bạn thành công thì mọi lời gièm pha sẽ không còn ý nghĩa với bạn. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 1 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "2": [
        "2 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 2 = THẤU HIỂU & YÊU THƯƠNG Để có thể làm việc nhóm thì bạn cần có tính kiên nhẫn và tinh thần hợp tác vì nếu bạn không thể khéo léo trong việc ngoại giao thì bạn luôn luôn gặp những xung đột không đáng có. Muốn thấu hiểu người khác bạn cần đặt mình vào vị trí của họ, bạn nên học cách trở thành một phần của nhóm và học cách nhạy cảm hơn về cảm xúc của người khác. Đôi khi sự đồng cảm và lắng nghe là điều cần thiết để thấu hiểu và yêu thương, bạn là người cần cả hai. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 2 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "3": [
        "3 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 3 = TƯỞNG TƯỢNG & GIAO TIẾP Nhìn quân phục biết tư cách, đôi khi bạn cần học cách nâng cấp và thể hiện bản thân một chút trong cách giao tiếp với những người xung quanh. Vui hay buồn thì thời gian vẫn cứ trôi đi và đời người có giới hạn, cho nên bạn cần trở nên lạc quan, vui vẻ hơn để tận hưởng cuộc sống và chia sẻ niềm vui với mọi người xung quanh. Ai rồi cũng sẽ phải tự đối mặt và giải quyết các vấn đề của mình, riêng bạn thì cuộc sống sẽ đưa bạn vào những tình huống đòi hỏi dùng trí tưởng tượng và sự giao tiếp để bạn có thể tháo gỡ các vấn đề của mình. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 3 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "4": [
        "4 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 4 = TẬP TRUNG & KỶ LUẬT Bạn cần đưa ra thời gian hành động cụ thể cho kế hoạch của mình, bạn phải học cách loại bỏ sự trì hoãn và lập ra cách tiếp cận vấn đề một cách có phương pháp và kỷ luật. Bạn nên nhớ phép vua thua lệ làng, bạn cần sống thực tế và có tổ chức hơn nếu không bạn sẽ gặp nhiều rắc rối trong công việc cũng như các mối quan hệ. Bạn cần xây dựng một nền tảng vững chắc, học tính kỷ luật bản thân để tập trung vào việc gì quan trọng nhất và giải quyết nó trước. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 4 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "5": [
        "5 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 5 = THÍCH NGHI & LINH HOẠT Ai rồi cũng phải tự bước đi trên đôi chân của mình, nên bạn phải học cách đón nhận sự thay đổi và những trải nghiệm mới trong cuộc đời của bạn. Bài học của bạn là hãy thực hiện một chuyến phiêu lưu trong cuộc sống và vượt qua nỗi sợ hãi bằng cách tin tưởng vào thông điệp, kế hoạch mà bạn đã gửi lên vũ trụ. Bạn phải học cách hòa nhập với cuộc sống, thích nghi với những thay đổi và ngày càng có nhiều trải nghiệm để trưởng thành hơn. Sự linh hoạt là điều cần thiết để bạn ứng phó với các sự kiện trong cuộc sống. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 5 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "6": [
        "6 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 6 = TRÁCH NHIỆM & CHÂN THÀNH Có quá nhiều điều mà bạn cần học để trưởng thành hơn, vì bạn gặp khó khăn trong việc gắn bó với hôn nhân và các mối quan hệ cá nhân quan trọng. Bạn phải học cách thể hiện cảm xúc thật của mình và thiết lập các mối quan hệ một cách chân thành. Bạn phải học cách cho đi và hy sinh khi cần thiết để dẫn đến tình bạn đích thực và tình yêu lâu dài. Điều quan trọng nhất là chịu trách nhiệm và sống một cách chân thành hơn. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 6 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "7": [
        "7 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 7 = KHOA HỌC & TÂM LINH Sự khó khăn gặp phải của bạn là những vấn đề về học tập và trường lớp, bạn cần cố gắng đào sâu kiến thức của mình cho một chuyên ngành cụ thể. Bạn nên tập trung để phát huy được tài năng của mình một cách tốt nhất, cần nhìn lại khuyết điểm của bản thân thay vì lên án gay gắt với người khác. Bài học cấp thiết mà bạn cần nhận ra là phải học tính xác thực về khoa học và tìm kiếm sự giác ngộ tâm linh. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 7 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp"
      ],
      "8": [
        "8 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 8 = QUẢN LÝ TÀI CHÍNH Đôi khi bạn cần lùi một bước để có thể tiến xa hơn, đó là cách bạn cần phải học khi xử lý các tình huống, nhượng bộ các cá nhân có thẩm quyền và chấp nhận lời khuyên của người khác là điều bạn cần nên học. Bạn cần cố gắng học cách xử lý tiền bạc để có thể hấp dẫn tiền bạc đến với bạn, bài học quan trọng đối với bạn là quản lý tài chính cá nhân. Tiêu xài phải có kế hoạch cụ thể, đừng để cảm xúc chi phối nếu không bạn sớm muộn cũng phải vướng vào nợ nần. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 8 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ],
      "9": [
        "9 CHỈ SỐ BÀI HỌC NGHIỆP",
        "BÀI HỌC NGHIỆP 9 = BA O DUNG & GIÚP ĐỠ Khi cho đi thì bạn sẽ nhận lại, kể cả tình thương và sự yêu thương cũng vậy, bạn nên học cách đồng cảm, bao dung và thấu hiểu hơn trong cuộc sống của mình vì đôi lúc chính bạn có thể là người cần những điều đó từ người khác. Hãy học cách chấp nhận sống vì lợi ích chung thay vì ưu tiên mục tiêu hay tham vọng cá nhân của bạn, khi trải qua những bài học đủ thì bạn sẽ hiểu được tầm quan trọng của cộng đồng và sự tha thứ. Bài học quan trọng của bạn là phải nhận ra mình cần bao dung và giúp đỡ những người trong gia đình và xã hội. Lưu ý: Ảnh hưởng Bài học nghiệp sẽ giảm đi nếu có ít nhất một con số 9 trong các con số chủ chốt của mình. Xem bảng tổng hợp định hướng sự nghiệp."
      ]
    },
    "intro": [
      "CHỈ SỐ BÀI HỌC NGHIỆP Bài học nghiệp là con số nói lên sự thiếu hụt năng lượng từ họ tên của bạn và bạn cần bổ sung hoặc rèn luyện để giúp bản thân cân bằng được năng lượng thiếu hụt đó.",
      "Có nhiều khuyết điểm của bản thân cần phải hoàn thiện để phát huy hết tiềm năng vốn có của bạn và con số bài học nghiệp sẽ cho bạn biết bạn phải làm gì để trở thành phiên bản tốt nhất cho chính mình."
    ]
  },
  "debts": {
    "byValue": {
      "1": [
        "CHỈ SỐ NỢ NGHIỆP 19/1",
        "HÓA GIẢI NỢ NGHIỆP 19/1 = CẦN SỰ HỖ TRỢ Chỉ số này nói lên rằng người sở hữu nó là những người đã lạm dụng quyền lực của mình trong kiếp trước. Bạn luôn làm việc độc lập và không nghe lời khuyên của bất kỳ ai, sự ngoan cố bên trong bạn cực lớn, bạn nên nhớ rằng đứng trên đôi chân của mình là một điều tốt nhưng bạn cần sự hỗ trợ và giúp đỡ như bất kỳ ai, đừng quá đề cao cái tôi của mình. Bạn cần học cách sử dụng quyền lực đúng đắn và chìa khóa thành công của bạn là chấp nhận sự hỗ trợ của người khác."
      ],
      "4": [
        "CHỈ SỐ NỢ NGHIỆP 13/4",
        "HÓA GIẢI NỢ NGHIỆP 13/4 = SỰ TẬP TRUNG Những bài học trong con số nợ nghiệp này là hậu quả từ sự lười biếng trong quá khứ và dễ dàng từ bỏ mục tiêu của mình. Hiện tại bạn phải học bài học về làm việc chăm chỉ, kỷ luật và khắc phục sự trì trệ. Một khi bạn chứng minh với vũ trụ rằng bạn có khả năng hoàn thành công việc mà bạn đã đặt mục tiêu thì vũ trụ sẽ ngừng thử thách bạn và cuộc sống của bạn sẽ trở nên dễ dàng hơn. Sự chăm chỉ và nỗ lực của bạn sẽ được đền đáp xứng đáng. Chìa khóa để thành công là sự tập trung."
      ],
      "5": [
        "CHỈ SỐ NỢ NGHIỆP 14/5",
        "HÓA GIẢI NỢ NGHIỆP 14/5 = SỰ CAM KẾT Chỉ số nợ nghiệp này là hậu quả của việc bạn sống vô độ và đắm chìm trong vui thú, trụy lạc ở kiếp trước. Con số này mách bảo rằng bạn là người nghiện ngập và bạn dễ lạm dụng bia rượu, chất kích thích, đồ ăn, tình dục, ma túy. Hiện tại bạn phải học bài học về duy trì trật tự trong cuộc sống, thiết lập sự ổn định về mặt cảm xúc của chính mình. Bạn phải học cách thích ứng với những điều bất ngờ có thể ập đến bất cứ lúc nào, đồng thời phải duy trì sự tập trung vào mục tiêu và ước mơ của bản thân. Bạn phải tiết chế và điều độ kỷ luật. Chìa khóa để thành công là Sự cam kết."
      ],
      "7": [
        "CHỈ SỐ NỢ NGHIỆP 16/7",
        "HÓA GIẢI NỢ NGHIỆP 16/7 = SỰ KHIÊM TỐN Nợ Nghiệp này phát sinh từ sự vô trách nhiệm với tình yêu trong kiếp trước nên bạn thường khó giao tiếp, trung thực với người mình yêu. Bạn có xu hướng giữ bí mật cá nhân, điều này có thể gây hại cho các mối quan hệ và thường dẫn đến chia tay hoặc ly hôn. Hiện tại bạn phải học bài học vượt qua sự ghen tị và thẳng thắn, trung thực trong giao tiếp và các mối quan hệ cần được rõ ràng. Bạn có khả năng thay cũ đổi mới một cách nhanh chóng, sự linh hoạt có thể giúp cuộc sống của bạn tốt hơn sau mỗi lần vấp ngã. Bạn là người có trí tuệ tinh tường và trực giác khá cao nên khiến bạn tự cao và có xu hướng xem thường người khác, điều này gây ra sự xa lánh và tận sâu bên trong con người bạn sẽ có cảm giác cô đơn. Chìa khóa thành công dành cho bạn là sự khiêm tốn."
      ]
    },
    "intro": [
      "CHỈ SỐ NỢ NGHIỆP",
      "Chỉ số Nợ Nghiệp cho biết bạn phải hoàn thành nghĩa vụ để gặt hái hoặc tiếp tục sứ mệnh của mình với trường năng lượng mà vũ trụ đã giao cho bạn.",
      "Không có thất bại, tất cả chỉ là bài học và trải nghiệm mà vũ trụ muốn bạn hiểu được, khi bạn vượt qua những thử thách và rút ra được bài học thì có thể xem như bạn hoàn thành được nợ nghiệp của mình. Các con số Nợ Nghiệp bao gồm: 13/4; 14/5; 16/7; 19/1"
    ]
  },
  "personalYear": {
    "byValue": {
      "1": [
        "1 KHỞI ĐẦU & CHINH PHỤC Đây là lúc để bạn tiến về phía trước. Đó là một sự thay đổi đáng hoan nghênh sau năm số 9 của bạn khi bạn đang dần buông bỏ và nhường chỗ cho những khởi đầu mới. Bạn có thể cảm thấy năm số 1 là một khởi đầu chậm chạp. Nhưng đây chính là thời điểm hoàn hảo để bạn đặt ra dự định, gieo hạt, phát triển ý tưởng và bắt đầu hành động để biến ước mơ thành hiện thực. Những gì xảy ra bây giờ sẽ ảnh hưởng trực tiếp đến thành quả của bạn trong chín năm tới. Bạn có đủ động lực và sự tự tin để thực hiện mục đích của mình. Năm này sẽ là năm của chuyển động, tiến bộ và sẽ trôi qua nhanh chóng. Bạn có thể thấy mình quyết liệt, tích cực hơn hiện tại. Hãy nhớ giữ mối quan hệ tốt với những người khác, đừng cứng đầu và hãy chủ động yêu cầu giúp đỡ khi cần. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "11": [
        "11/2 CHỈ SỐ NĂM CÁ NHÂN MỐI QUAN HỆ & SỰ NHẪN NẠI Năm này là thời gian để nuôi dưỡng những hạt giống bạn đã gieo vào Năm 1. Thời gian của bạn sẽ được sử dụng tốt để chăm sóc những ý tưởng lớn mà bạn đã đề ra vào năm trước. Con số 11/2 cũng giúp bạn có trực giác nhạy bén, vì vậy hãy tin vào bản năng của mình. Bạn sẽ có những kết nối mạnh mẽ và gặp gỡ những người có thể giúp bạn đạt được mục tiêu và ước mơ của mình. Đây là thời điểm tuyệt vời cho những mối quan hệ lãng mạn và xây dựng gia đình. Năm này diễn biến chậm hơn một chút so với năm trước, và sự kiên nhẫn cũng như khả năng thỏa hiệp của bạn sẽ được thử thách. Bạn cũng sẽ trải qua những việc liên quan đến sự nhạy cảm. Bạn có thể trải qua một số cảm xúc chán nản và thất vọng. Đây là năm được đánh dấu bằng sự đấu tranh nhưng cũng có nhiều cơ hội để thúc đẩy các kế hoạch của bạn. Đây cũng là năm tốt để cải thiện bản thân thông qua việc đọc và nghiên cứu. Sự kiên trì sẽ có phần thưởng xứng đáng của nó."
      ],
      "13": [
        "4 CHỈ SỐ NĂM CÁ NHÂN",
        "Đây là một năm có tổ chức và thực tế. Hãy tập trung và kế hoạch để hoàn thành mục tiêu của bạn. Khả năng tập trung và quyết tâm của bạn sẽ tốt hơn năm trước. Bạn sẽ có thái độ thực tế và quyết tâm hơn. Đây là thời điểm để những cơ hội quan trọng bạn cần phải nắm bắt nên bạn cần phải kiên trì, chăm chỉ và linh hoạt hơn. Đây là một năm tốt để mua bán bất động sản hoặc sửa sang lại nhà cửa của bạn. Cũng là thời điểm tốt đẻ chăm sóc cho những dự án đã bị trì hoãn quá lâu. Hãy hoàn thành bổn phận của mình và đừng ngại chi tiêu số tiền mà bạn vất vả kiếm được. Việc trao đổi và buôn bán trong năm nay thường là những nỗ lực thành công. Đây là năm để làm việc dựa trên nền tảng của bạn và chuẩn bị thích nghi với những thay đổi chắc chắn sẽ đến trong năm tới."
      ],
      "14": [
        "5 SỰ THAY ĐỔI & ĐỔI MỚI Đây là một năm bùng nổ với nhiều sự thay đổi và nhiều điều bất ngờ sẽ đến với cuộc đời bạn. Hãy cởi mở và sẵn sàng đón nhận những cơ hội mới. Đừng quá dè chừng trong năm nay. Đây là một năm mà một bước tiến lớn có thể xảy ra nếu bạn sẵn sàng chấp nhận rủi ro có tính toán và đánh cược một chút. Sự quyết đoán nhanh chóng là cần thiết khi đối mắt với những lựa chọn trong năm nay. Đây cũng là năm thú vị mà bạn sẽ phải thúc đẩy bản thân để tận dụng hết những cơ hội đang chờ đón bạn. Sẽ có nhiều cơ hội để thực hiện những chuyến du lịch và thay đổi nơi ở. Bạn sẽ muốn mua nhà mới, đổi xe, chuyển việc hoặc những thứ quan trọng khác.. Bạn cũng có thể bị cám dỗ bởi những ham muốn: lạm dụng quá mức trong ăn uống, rượu chè, tình dục và các chất kích thích khác. Hãy cẩn thận và phân biệt điều gì nên làm, nên tránh. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "16": [
        "7 CHUYÊN GIA & TÂM LINH Năm này là thời điểm bạn trở thành chuyên gia ở lĩnh vực nào đó. Mài giũa các kỹ năng của bạn theo hướng chuyên môn hóa và thúc đẩy sự khám phá và tìm tòi. Đây là một năm tuyệt vời để làm điều gì đó tâm linh hoặc khám phá siêu hình học và huyền học. Đây cũng là năm chăm sóc bản thân. Hãy dành thời gian cho chính mình. Hòa mình vào thiên nhiên hoặc tắm mình trong dòng nước sẽ tạo nên điều kỳ diệu cho tâm hồn bạn. Đây cũng là thời điểm tốt để bắt đầu tập thiền hoặc yoga. Bạn có thể sẽ cảm thấy mình thích ẩn mình ở một vài thời điểm trong năm này, thích ở nhà hơn là ra ngoài. Trong năm nay, bạn sẽ củng cố nền tảng cuộc sống. Những thành công của bạn đều dựa vào sức mạnh nội tâm bên trong. Sẽ có những sự kiện bất ngờ truyền cảm hứng để bạn có cái nhìn sâu sắc hơn về cuộc sống. Hãy dành thời gian nghỉ ngơi và chăm sóc sức khỏe bản thân. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "19": [
        "1 KHỞI ĐẦU & CHINH PHỤC Đây là lúc để bạn tiến về phía trước. Đó là một sự thay đổi đáng hoan nghênh sau năm số 9 của bạn khi bạn đang dần buông bỏ và nhường chỗ cho những khởi đầu mới. Bạn có thể cảm thấy năm số 1 là một khởi đầu chậm chạp. Nhưng đây chính là thời điểm hoàn hảo để bạn đặt ra dự định, gieo hạt, phát triển ý tưởng và bắt đầu hành động để biến ước mơ thành hiện thực. Những gì xảy ra bây giờ sẽ ảnh hưởng trực tiếp đến thành quả của bạn trong chín năm tới. Bạn có đủ động lực và sự tự tin để thực hiện mục đích của mình. Năm này sẽ là năm của chuyển động, tiến bộ và sẽ trôi qua nhanh chóng. Bạn có thể thấy mình quyết liệt, tích cực hơn hiện tại. Hãy nhớ giữ mối quan hệ tốt với những người khác, đừng cứng đầu và hãy chủ động yêu cầu giúp đỡ khi cần. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "2": [
        "2 CHỈ SỐ NĂM CÁ NHÂN MỐI QUAN HỆ & SỰ NHẪN NẠI Năm này là thời gian để nuôi dưỡng những hạt giống bạn đã gieo vào Năm 1. Thời gian của bạn sẽ được sử dụng tốt để chăm sóc những ý tưởng lớn mà bạn đã đề ra vào năm trước. Bạn sẽ có những kết nối mạnh mẽ và gặp gỡ những người có thể giúp bạn đạt được mục tiêu và ước mơ của mình. Đây là thời điểm tuyệt vời cho những mối quan hệ lãng mạn và xây dựng gia đình. Năm này diễn biến chậm hơn một chút so với năm trước, và sự kiên nhẫn cũng như khả năng thỏa hiệp của bạn sẽ được thử thách. Bạn cũng sẽ trải qua những việc liên quan đến sự nhạy cảm. Bạn có thể trải qua một số cảm xúc chán nản và thất vọng. Đây là năm được đánh dấu bằng sự đấu tranh nhưng cũng có nhiều cơ hội để thúc đẩy các kế hoạch của bạn. Đây cũng là năm tốt để cải thiện bản thân thông qua việc đọc và nghiên cứu. Sự kiên trì sẽ có phần thưởng xứng đáng của nó."
      ],
      "22": [
        "22/4 CHỈ SỐ NĂM CÁ NHÂN",
        "Đây là một năm có tổ chức và thực tế. Hãy tập trung và kế hoạch để hoàn thành mục tiêu của bạn. Khả năng tập trung và quyết tâm của bạn sẽ tốt hơn năm trước. Bạn sẽ có thái độ thực tế và quyết tâm hơn. Đây là thời điểm để những cơ hội quan trọng bạn cần phải nắm bắt nên bạn cần phải kiên trì, chăm chỉ và linh hoạt hơn. Con số 22/4 cũng là thời điểm bạn sắp xếp mọi thứ theo thứ tự, tạo nền tảng để xây dựng ước mơ của mình. Đây là một năm tốt để mua bán bất động sản hoặc sửa sang lại nhà cửa của bạn. Cũng là thời điểm tốt đẻ chăm sóc cho những dự án đã bị trì hoãn quá lâu. Hãy hoàn thành bổn phận của mình và đừng ngại chi tiêu số tiền mà bạn vất vả kiếm được. Việc trao đổi và buôn bán trong năm nay thường là những nỗ lực thành công. Đây là năm để làm việc dựa trên nền tảng của bạn và chuẩn bị thích nghi với những thay đổi chắc chắn sẽ đến trong năm tới."
      ],
      "3": [
        "3 CHỈ SỐ NĂM CÁ NHÂN",
        "Năm cá nhân 3 của bạn sẽ là một năm của các hoạt động và sự kiện xã hội và bạn có thể thấy mình nổi tiếng hơn bình thường. Đây là năm của những kết nối tuyệt vời nên hãy sẵn sàng đón nhận những lời mời. Vũ trụ muốn tạo một số kết nối cho bạn trong năm nay và hãy để chúng xảy ra. Chấp nhận mọi lời mời mà bạn nhận được và gặp gỡ nhiều người nhất có thể. Đây cũng sẽ là một năm đầy cảm xúc và điều này có nghĩa là bạn sẽ trải nghiệm mọi cung bậc cảm xúc: tức giận, sợ hãi, buồn bã, vui vẻ, thất vọng,… Tìm một lối thoáng sáng tạo mà bạn có thể chuyển hướng nguồn cảm xúc đang dâng cao của mình. Khả năng sáng tạo và kỹ năng giao tiếp của bạn sẽ đạt đến đỉnh cao trong năm nay. Đây cũng là thời điểm định mệnh. Trong năm 3, bạn có thể sẽ gặp một người có ảnh hưởng lớn đến cuộc sống của bạn hoặc mang lại cho bạn cơ hội thay đổi cuộc đời. Đây cũng là năm để bạn phát triển, tăng trưởng và mở rộng."
      ],
      "4": [
        "4 CHỈ SỐ NĂM CÁ NHÂN",
        "Đây là một năm có tổ chức và thực tế. Hãy tập trung và kế hoạch để hoàn thành mục tiêu của bạn. Khả năng tập trung và quyết tâm của bạn sẽ tốt hơn năm trước. Bạn sẽ có thái độ thực tế và quyết tâm hơn. Đây là thời điểm để những cơ hội quan trọng bạn cần phải nắm bắt nên bạn cần phải kiên trì, chăm chỉ và linh hoạt hơn. Đây là một năm tốt để mua bán bất động sản hoặc sửa sang lại nhà cửa của bạn. Cũng là thời điểm tốt đẻ chăm sóc cho những dự án đã bị trì hoãn quá lâu. Hãy hoàn thành bổn phận của mình và đừng ngại chi tiêu số tiền mà bạn vất vả kiếm được. Việc trao đổi và buôn bán trong năm nay thường là những nỗ lực thành công. Đây là năm để làm việc dựa trên nền tảng của bạn và chuẩn bị thích nghi với những thay đổi chắc chắn sẽ đến trong năm tới."
      ],
      "5": [
        "5 SỰ THAY ĐỔI & ĐỔI MỚI Đây là một năm bùng nổ với nhiều sự thay đổi và nhiều điều bất ngờ sẽ đến với cuộc đời bạn. Hãy cởi mở và sẵn sàng đón nhận những cơ hội mới. Đừng quá dè chừng trong năm nay. Đây là một năm mà một bước tiến lớn có thể xảy ra nếu bạn sẵn sàng chấp nhận rủi ro có tính toán và đánh cược một chút. Sự quyết đoán nhanh chóng là cần thiết khi đối mắt với những lựa chọn trong năm nay. Đây cũng là năm thú vị mà bạn sẽ phải thúc đẩy bản thân để tận dụng hết những cơ hội đang chờ đón bạn. Sẽ có nhiều cơ hội để thực hiện những chuyến du lịch và thay đổi nơi ở. Bạn sẽ muốn mua nhà mới, đổi xe, chuyển việc hoặc những thứ quan trọng khác.. Bạn cũng có thể bị cám dỗ bởi những ham muốn: lạm dụng quá mức trong ăn uống, rượu chè, tình dục và các chất kích thích khác. Hãy cẩn thận và phân biệt điều gì nên làm, nên tránh. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "6": [
        "6 TRÁCH NHIỆM & LO LẮNG Đây là một năm của sự tiến bộ và thăng tiến về tài chính. Các cơ hội nghề nghiệp dần xuất hiện. Đây cũng là năm đầy thử thách, sự phát triển cá nhân đi kèm với những trách nhiệm và thách thức mới. Đây là một năm của trách nhiệm đối nội và quan tâm đến nhu cầu của gia đình và bạn bè. Đó là khoảng thời gian cho những cảm xúc chân thành cùng một chút hy sinh, an ủi và chăm sóc. Bạn nhận ra tầm quan trọng và vị trí của mình trong cộng đồng. Bạn có thể kêu gọi để giúp đỡ một phần gánh nặng của người khác. Bạn là người luôn đưa ra những lời khuyên mỗi khi cần. Bạn làm việc để tạo ra một bầu không khí hài hòa và cân bằng. Năm số 6 là năm bạn kiểm soát quan hệ hôn nhân, việc sinh con, nhà cửa và thậm chí cả vật nuôi của bạn. Năm 6 cũng kiểm soát việc học hành, vì vậy bạn có thể thấy mình quay trở lại trường học hoặc tham gia các lớp học hoặc hội thảo vào cuối tuần. Đây là một năm tuyệt vời để học điều gì mới. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "7": [
        "7 CHUYÊN GIA & TÂM LINH Năm này là thời điểm bạn trở thành chuyên gia ở lĩnh vực nào đó. Mài giũa các kỹ năng của bạn theo hướng chuyên môn hóa và thúc đẩy sự khám phá và tìm tòi. Đây là một năm tuyệt vời để làm điều gì đó tâm linh hoặc khám phá siêu hình học và huyền học. Đây cũng là năm chăm sóc bản thân. Hãy dành thời gian cho chính mình. Hòa mình vào thiên nhiên hoặc tắm mình trong dòng nước sẽ tạo nên điều kỳ diệu cho tâm hồn bạn. Đây cũng là thời điểm tốt để bắt đầu tập thiền hoặc yoga. Bạn có thể sẽ cảm thấy mình thích ẩn mình ở một vài thời điểm trong năm này, thích ở nhà hơn là ra ngoài. Trong năm nay, bạn sẽ củng cố nền tảng cuộc sống. Những thành công của bạn đều dựa vào sức mạnh nội tâm bên trong. Sẽ có những sự kiện bất ngờ truyền cảm hứng để bạn có cái nhìn sâu sắc hơn về cuộc sống. Hãy dành thời gian nghỉ ngơi và chăm sóc sức khỏe bản thân. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "8": [
        "8 QUYỀN LỰC & TIỀN BẠC Năm cá nhân 8 là về vòng quay tiền bạc. Bất cứ điều gì cũng có thể xảy ra trong năm này - bạn có thể trúng xổ số hoặc bị phá sản. Quyền lực, dù tốt hay xấu, là điều mà bạn có thể đạt được trong năm này. Đây là một năm tuyệt vời để thăng tiến hoặc bắt đầu công việc kinh doanh của riêng bạn. Bạn cũng nhận được nhiều phần thưởng và thành quả trong năm 8. Đây là sự phản ánh trực tiếp những nỗ lực bạn đã bỏ ra trong suốt các năm từ 1 đến 8. Lợi ích vật chất, thành công, sự ổn định về tài chính và địa vị đều nằm trong tầm tay. Nếu bạn đã nghĩ về điều gì, hãy hành động ngay bây giờ. Ở năm 9, sẽ là quá muộn để bắt đầu những nỗ lực mới. Đây là cơ hội cuối cùng của bạn trước khi trở lại năm 1. Hãy thận trọng, đừng làm mọi thứ phức tạp hơn mức cần thiết. Sự cân bằng và tính xác thực là nơi phép thuật của bạn sẽ được tìm thấy. CHỈ SỐ NĂM CÁ NHÂN"
      ],
      "9": [
        "9 HOÀN THIỆN & GIẢI PHÓNG Đây là năm để hoàn thành mọi thứ và buông bỏ những điều không có ích với bạn. Bạn đã đạt đến cuối chu kỳ 9 năm của mình và sẵn sàng nhận được phần thưởng từ tất cả sự phát triển và làm việc chăm chỉ của mình trước đó. Các mối quan hệ hoặc một công việc mới trong năm số 9 có thể sẽ không kéo dài. Lòng dũng cảm và sức mạnh của bạn sẽ chịu thử thách trong năm năm này. Các mối quan hệ độc hại sẽ biến mất và các vấn đề kéo dài có thể tìm ra cách giải quyết. Đây là thời gian để kết thúc và chữa lành. Tha thứ là điều quan trọng lúc này. Hãy buông bỏ quá khứ để nhường chỗ cho tương lai phía trước. Bạn không muốn phải bực bội với vị khách không phải trả tiền phòng trong khi bạn có một khách thuê mới thú vị triển vọng trong năm cá nhân số 1 tới đây. Hãy chuẩn bị cho những ước mơ lớn và lập kế hoạch. Hãy hòa đồng và giao tiếp nhiều hơn, đồng thời thưởng thức âm nhạc và các môn nghệ thuật khác. Khả năng sáng tạo của bạn đang phát triển tốt. CHỈ SỐ NĂM CÁ NHÂN"
      ]
    },
    "intro": [
      "CHỈ SỐ NĂM CÁ NHÂN Mỗi năm trong chu kỳ 9 năm sẽ là những cuộc phiêu lưu khác nhau giúp bạn trưởng thành và phát triển hơn. Những trải nghiệm, thách thức và cơ hội ở mỗi chu kỳ sẽ bổ sung kiến thức, kỹ năng hành xử quan trọng cũng như những bài học cần phải học trong giai đoạn đó. Mỗi năm theo chu kỳ có tính chất riêng và được đặc trưng bởi bản thân con số đó. Sự trưởng thành và phát triển của bạn diễn ra theo chu kỳ chín năm. Mỗi chu kỳ 9 năm này đánh dấu sự bắt đầu và kết thúc của một giai đoạn phát triển cụ thể. Mỗi năm có một nhịp điệu và dòng chảy tự nhiên. Hãy tận dụng sức mạnh dự đoán của năm cá nhân và trở thành kiến trúc sư thiết kế cuộc đời cho chính bạn."
    ]
  },
  "destiny": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ SỨ MỆNH NGƯỜI LÃNH ĐẠO VÀ RA QUYẾT ĐỊNH",
        "Bạn luôn có cách làm đặc biệt riêng của mình. Bạn có khả năng giải quyết vấn đề nhanh chóng. Bạn có tầm nhìn tuyệt vời với những ý tưởng sáng tạo. Hống hách, kiêu ngạo, ích kỷ. Thiếu kiên nhẫn. Lạm dụng sức ảnh hưởng của mình cho mục đích xấu. Ưu điểm: Nhược điểm:"
      ],
      "11": [
        "11/2",
        "CHỈ SỐ SỨ MỆNH NGƯỜI CÓ TRỰC GIÁC NHẠY BÉN Bạn toát ra vẻ mạnh mẽ, tinh tế và thanh lịch. Bạn có năng lực về tâm linh và có khả năng lãnh đạo bẩm sinh. Bạn là người có thể đánh thức và soi sáng cho người khác. Sự tưởng tượng quá xa vời thực tế khó thực hiện. Có thể bị thao túng và sử dụng quyền lực cho mục đích xấu. Kỳ vọng cao khó ai có thể đáp ứng vừa ý của bạn. Ưu điểm: Nhược điểm:"
      ],
      "13": [
        "4",
        "CHỈ SỐ SỨ MỆNH Bạn là người có kế hoạch. Bạn là người đáng tin cậy, có tổ chức và đúng giờ. Bạn có khả năng giữ bình tĩnh khi đối mặt với hỗn loạn. Tham công tiếc việc và cố chấp. Hay phản kháng và thất thường. Sự căm giận có thể khiến bạn trở nên tàn nhẫn. Ưu điểm: Nhược điểm:NGƯỜI LẬP KẾ HOẠCH VÀ NHÀ SẢN XUẤT"
      ],
      "14": [
        "5",
        "CHỈ SỐ SỨ MỆNH Bạn có khả năng lôi cuốn và hấp dẫn người khác. Bạn thích sự tự do và có tinh thần mạo hiểm. Bạn thích nghi nhanh và chấp nhận sự đổi mới. Bạn thẳng thắn, hơi bốc đồng. Hành động nhanh hơn suy nghĩ hậu quả của sự việc. Dễ tự hủy hoại bản thân khi bị tổn thương. Ưu điểm: Nhược điểm:NGƯỜI TÌM KIẾM SỰ MẠO HIỂM"
      ],
      "16": [
        "7",
        "CHỈ SỐ SỨ MỆNH NGƯỜI CÓ TRÍ TUỆ SÂU SẮC Bạn có trí nhớ tuyệt vời, bậc thầy về trí tuệ. Bạn là người rất đam mê khoa học hoặc rất duy tâm. Trực giác của bạn mạnh đến mức đôi khi bạn có thể \"nhìn thấu\" tâm tư của người khác. Bạn có xu hướng thích đơn độc, mang chủ nghĩa cá nhân cao. Hay nghi ngờ và ghen tị. Bạn có kiến thức rộng lớn và nên chia sẻ nó cho hậu thế. Ưu điểm: Nhược điểm:"
      ],
      "19": [
        "1 CHỈ SỐ SỨ MỆNH NGƯỜI LÃNH ĐẠO VÀ RA QUYẾT ĐỊNH",
        "Bạn luôn có cách làm đặc biệt riêng của mình. Bạn có khả năng giải quyết vấn đề nhanh chóng. Bạn có tầm nhìn tuyệt vời với những ý tưởng sáng tạo. Hống hách, kiêu ngạo, ích kỷ. Thiếu kiên nhẫn. Lạm dụng sức ảnh hưởng của mình cho mục đích xấu. Ưu điểm: Nhược điểm:"
      ],
      "2": [
        "2 CHỈ SỐ SỨ MỆNH",
        "NGƯỜI ĐỒNG ĐỘI TỐT VÀ KHÉO LÉO Bạn giỏi về chi tiết, dễ hợp tác làm việc nhóm và kiên nhẫn. Bạn thích được trở thành tâm điểm chú ý và được ghi nhận. Bạn thích quan tâm người khác và cũng rất hào phóng. Dễ bị tác động tiêu cực. Quá nhạy cảm, hay bị tổn thương, dễ rơi nước mắt. Cảm giác không thoải mái khi ở môi trường không thân thiện. Ưu điểm: Nhược điểm:"
      ],
      "22": [
        "22/4",
        "CHỈ SỐ SỨ MỆNH NGƯỜI KIẾN TRÚC SƯ TÀI BA Bạn có thể nhận thức được bức tranh toàn cảnh từ khi còn nhỏ. Bạn có ước mơ lớn lao và mang trong mình một sứ mệnh. Bạn mong muốn để lại dấu ấn thực sự trên thế giới. Ranh mãnh và thâm hiểm trong kinh doanh. Phá hoại và thậm chí xấu xa nếu ai đó làm trái ý bạn. Lạm dụng quyền hạn của mình, khó kiểm soát. Ưu điểm: Nhược điểm:"
      ],
      "3": [
        "3 Bạn có khả năng sáng tạo rất cao. Bạn có một khiếu hài hước tuyệt vời, dễ hòa nhập. Bạn thích trải nghiệm vui vẻ và thăng hoa. Có thể mắc hội chứng Peter Pan và không bao giờ muốn lớn lên. Dễ bị tác động cảm xúc qua lời nói, bạn dễ chán nản và hay thay đổi. Tránh quá kịch tính hoặc cảm tính, cố chấp, ghen tuông. Ưu điểm: Nhược điểm:",
        "CHỈ SỐ SỨ MỆNH NGƯỜI NGHỆ SĨ VÀ NHÂN VẬT GIẢI TRÍ"
      ],
      "4": [
        "4",
        "CHỈ SỐ SỨ MỆNH Bạn là người có kế hoạch. Bạn là người đáng tin cậy, có tổ chức và đúng giờ. Bạn có khả năng giữ bình tĩnh khi đối mặt với hỗn loạn. Tham công tiếc việc và cố chấp. Hay phản kháng và thất thường. Sự căm giận có thể khiến bạn trở nên tàn nhẫn. Ưu điểm: Nhược điểm:NGƯỜI LẬP KẾ HOẠCH VÀ NHÀ SẢN XUẤT"
      ],
      "5": [
        "5",
        "CHỈ SỐ SỨ MỆNH Bạn có khả năng lôi cuốn và hấp dẫn người khác. Bạn thích sự tự do và có tinh thần mạo hiểm. Bạn thích nghi nhanh và chấp nhận sự đổi mới. Bạn thẳng thắn, hơi bốc đồng. Hành động nhanh hơn suy nghĩ hậu quả của sự việc. Dễ tự hủy hoại bản thân khi bị tổn thương. Ưu điểm: Nhược điểm:NGƯỜI TÌM KIẾM SỰ MẠO HIỂM"
      ],
      "6": [
        "6",
        "CHỈ SỐ SỨ MỆNH Bạn rất cầu toàn và theo chủ nghĩa hoàn hảo. Bạn là người có trách nhiệm với gia đình. Bạn là người có óc xét đoán và đáng tin cậy. Hay tự mãn, mỉa mai và tự phụ. Hay lo lắng, ôm đồm mọi việc nhưng không hoàn thành. Hay can thiệp vào vấn đề của người khác. Ưu điểm: Nhược điểm:NGƯỜI THEO CHỦ NGHĨA HOÀN HẢO"
      ],
      "7": [
        "7",
        "CHỈ SỐ SỨ MỆNH NGƯỜI CÓ TRÍ TUỆ SÂU SẮC Bạn có trí nhớ tuyệt vời, bậc thầy về trí tuệ. Bạn là người rất đam mê khoa học hoặc rất duy tâm. Trực giác của bạn mạnh đến mức đôi khi bạn có thể \"nhìn thấu\" tâm tư của người khác. Bạn có xu hướng thích đơn độc, mang chủ nghĩa cá nhân cao. Hay nghi ngờ và ghen tị. Bạn có kiến thức rộng lớn và nên chia sẻ nó cho hậu thế. Ưu điểm: Nhược điểm:"
      ],
      "8": [
        "8",
        "CHỈ SỐ SỨ MỆNH NGƯỜI ĐIỀU HÀNH VÀ CÓ SỨC ẢNH HƯỞNG Bạn sinh ra để thành công và là chuyên gia về tài chính. Bạn có xu hướng coi trọng vật chất và yêu thích thành tích. Bạn khao khát quyền lực và địa vị để thỏa mãn bản thân. Dễ bị lạm dụng chất kích thích, thú vui không lành mạnh. Thiếu sự kiên nhẫn và khoan dung, đôi lúc tàn nhẫn, bạo lực. Bạn luôn cần tìm kiếm sự cân bằng trong tâm trí. Ưu điểm: Nhược điểm:"
      ],
      "9": [
        "9",
        "CHỈ SỐ SỨ MỆNH NGƯỜI CÓ TẤM LÒNG NHÂN ĐẠO Bạn là người trí tuệ và truyền cảm hứng cho người khác rất tốt. Bạn có khả năng hướng dẫn, tư vấn và chữa lành cho mọi người. Bạn là người kiên nhẫn, nhân ái và lãng mạn. Muốn chiếm hữu, kiểm soát người khác. Thiếu quan tâm đến người thân. Thích mua sắm và rất dễ phung phí tiền bạc. Ưu điểm: Nhược điểm:"
      ]
    },
    "intro": [
      "CHỈ SỐ SỨ MỆNH SỨ MỆNH = SỰ GIÚP ĐỠ Chỉ số đầu tiên chúng ta phải biết đó là sứ mệnh của cuộc đời này là gì? Hầu hết chúng ta đều có mối quan hệ tương hỗ, nên thành công của bạn cũng sẽ góp phần giúp người khác thành công. Khi bạn càng giúp được nhiều người thì thành công của bạn càng lớn. Và đó cũng là sứ mệnh của cuộc đời bạn. Sứ mệnh không phải là một từ quá cao siêu, to tát hay vĩ đại gì cả. Cũng không phải chỉ dành cho những người thành công, chính trị gia, diễn giả, hay doanh nhân, mà từ sứ mệnh dành cho tất cả chúng ta. Chỉ số sứ mệnh tiết lộ tiềm năng cao nhất mà bạn phải cố gắng đạt được và hoàn thành trong cuộc đời. Chỉ số này cũng thể hiện mục tiêu cuộc đời bạn, liên quan đến sự nghiệp, gia đình và mẫu người bạn muốn trở thành. Chỉ số này có tần số rung động năng lượng rất lớn ảnh hưởng đến cuộc đời bạn. Sứ mệnh là một từ thể hiện sự giúp đỡ của bạn đối với người khác thông qua một hành động cụ thể hoặc nghề nghiệp cụ thể ứng với con số của bạn."
    ]
  },
  "lifePath": {
    "byValue": {
      "1": [
        "1 Bạn là một nhà lãnh đạo bẩm sinh, có nhiều ý tưởng và tầm nhìn độc đáo. Bạn luôn muốn đi đầu trong mọi lĩnh vực mà bạn chọn và chinh phục nó. Bạn là người rất mạnh mẽ, quyết đoán cao và có tinh thần trách nhiệm, bạn làm việc độc lập – tự chủ và xử lý mọi việc rất tốt. Bạn có tài năng đặc biệt và đứng lên sau vấp ngã là điều dễ dàng đối với bạn. Địa vị, vẻ ngoài là đều bạn luôn quan tâm, bạn là người luôn giữ cho mình phong thái của một doanh nhân, người thành đạt. Sự lộng lẫy là nguồn động lực giúp bạn thành công và hướng tới những gì tốt đẹp. Bạn nên chú ý đến tính ích kỷ, tự phụ và quan tâm quá mức về ngoại hình của mình. Bạn phải giữ bản thân tránh xa khỏi những hành vi thái quá, tức giận, hay manh động. Nếu những phẩm chất này không được kiểm soát bạn sẽ có thể trở nên quá độc đoán, thù hận và thậm chí là bạo lực. Bạn có thể trở nên căng thẳng quá mức do tính háo thắng của mình. Hãy cẩn thận những gì bạn ăn và duy trì một chế độ rèn luyện thể chất mà bạn thích. Đừng để niềm kiêu hãnh và sự tự tin thái quá làm chủ bạn. Hãy nhớ rằng tài năng và khả năng của bạn là một món quà từ ơn trên, điều này sẽ thúc đẩy lòng biết ơn và sự khiêm tốn, thay vì kiêu hãnh và tự phụ. Bạn có thể bị thu hút bởi các công việc kinh doanh, quân đội hoặc các tổ chức chính phủ,... miễn là bạn có vai trò lãnh đạo, quản trị trong tổ chức và khả năng thực hiện mọi việc theo cách của bạn. Nhiều vận động viên chuyên nghiệp thành công và vận động viên Olympic cũng có chỉ số đường đời này. SỐ 1 – NGƯ ỜI LÃNH ĐẠO Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Đường thẳng tạo thành số 1 đại diện cho ranh giới bạn cần dựng lên. Nó cũng cho thấy cách số 1 đứng một mình: một cá nhân duy nhất phấn đấu cho vị trí hàng đầu."
      ],
      "11": [
        "11/2 Bạn là người có thể khai sáng và dẫn dắt cho người khác với những kiến thức mà bạn có được. Bạn có tiềm năng trở thành nguồn cảm hứng và ánh sáng cho mọi người. Bạn sở hữu một nguồn năng lượng vô hạn và trực giác khá tốt. Bạn là một người có khả năng truyền đạt tâm linh cực tốt vì hầu như bạn hiểu rất sâu về nó. Bạn là một kênh thông tin cho mọi người ở mọi tầng lớp. Bạn rất nhạy cảm và đặc biệt trực giác mạnh nên bạn sở hữu một tầm nhìn xa. Bạn là mẫu người nhẹ nhàng và rất lôi cuốn, luôn thu hút sự chú ý của những người xung quanh. Bạn có khả năng phát minh rất lớn. Rất nhiều nhà phát minh, nghệ sĩ, nhà lãnh đạo tôn giáo, nhà tiên tri nổi bật và các nhân vật dẫn đầu trong lịch sử đều mang chỉ số Đường đời 11/2. Do nhận được quá nhiều ưu ái, nên bạn phải gánh chịu hậu quả như một con dao hai lưỡi. Bạn sở hữu những khả năng tuyệt vời nhưng lại rất thích tự phản biện và tự phê bình. Bạn có tính tự nhận thức quá cao và bạn tự nhận thấy rằng mình là người nổi bật nên ngay cả khi cố gắng hòa nhập với môi trường xung quanh, bạn vẫn dễ cảm thấy xa lạ và lạc lõng. Bạn thường cảm thấy thất vọng, phần lớn là do bạn đặt kỳ vọng rất cao vào bản thân. Nhưng những kỳ vọng này có thể không thực tế và ngăn bạn hoàn thành dự định của mình. Bạn cũng hay bối rối và mất phương hướng làm bạn mất tự tin và suy giảm tinh thần rõ rệt. Sự tự tin là chìa khóa giải phóng bản thân bạn. Bạn có Đường đời 11/2 là phiên bản cao cấp của người có đường đời 2 nên phù hợp với tất cả các lĩnh vực như: Tư vấn, giảng dạy, chữa bệnh, nhà lãnh đạo tinh thần, người dẫn chương trình truyền hình, nhân vật truyền thông,... SỐ 11 – NGƯỜI TRUYỀN CẢM HỨNG Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 11/2 cảm nhận mọi thứ quá sâu sắc nên có thể dẫn đến trầm cảm, lo lắng và tình trạng dị ứng nghiêm trọng. Sự rung cảm độc đáo của số 11 kéo theo các vấn đề sức khỏe của cả số 1 và 2"
      ],
      "13": [
        "4 Bạn là người logic, thực chứng, rõ ràng. Với bạn, mọi thông tin cần phải được mô tả cụ thể, rành mạch, không màu mè, lòng vòng. Và bạn sẽ không thích nếu ai đó nói chuyện với bạn theo kiểu hoa mỹ. Bạn sẽ dễ tin tưởng một ai đó hơn nếu họ trình bày một cách logic, có dẫn chứng. Bạn có năng lực phân tích tốt. Bạn thường phân tích mọi thứ một cách tỉ mỉ, chi tiết, giàu thông tin và nhiều khía cạnh. Bạn tìm kiếm sự rõ ràng, sự thật, nguyên lý, chân lý. Cũng vì điều này bạn có thể trở thành một chuyên gia khi hứng thú với một lĩnh vực nào đó. Bạn có khả năng truyền đạt rất trực quan dễ hiểu. Bạn coi trọng sự trung thực và chân thành, đó là điều quan trọng nhất trong một mối quan hệ. Vì vậy, bạn sẽ không chấp nhận sự dối trá hay khuất tất. Bạn là người tạo cho người khác cảm giác an toàn và đang tin cậy, là người có tính kỷ luật cao, luôn tuân thủ các quy định, quy chế, quy tắc của cơ quan hoặc tổ chức. Sự nghiêm khắc, khó tính, bảo thủ và chỉ chấp nhận những gì hợp logic trong đầu mình. Bạn cho rằng những gì mình nghĩ, mình đã trải qua là đúng đắn. Bạn cũng là người suy nghĩ nhiều, phân tích nhiều nên lắm lúc bị căng thẳng đầu óc. Bạn nên cân bằng giữa công việc và nghỉ ngơi, thư giãn. Sự phân tích quá kỹ lưỡng cũng khiến bạn khó ra quyết định và có thể bị lỡ mất cơ hội. Hãy xây dựng một bộ tiêu chí trợ giúp cho việc ra quyết định. Bạn có Đường đời 4 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: Giáo dục, kinh doanh, chăm sóc sức khỏe, quản trị, chuyên gia, chính trị và kế toán,… Bạn phù hợp với những công việc có tính thực tế như sản xuất, xây dựng, kỹ thuật, thi công, thiết kế hoặc kinh doanh sản phẩm như siêu thị, điện máy. SỐ 4 – NG ƯỜI THỰC TẾ Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 4 được tạo thành hoàn toàn từ các đường thẳng, thể hiện nhu cầu duy trì trật tự và hiệu quả. Hãy nhớ luôn duy trì sự linh hoạt."
      ],
      "14": [
        "5 Bạn thích du lịch, phiêu lưu, mạo hiểm và sự tự do, khám phá. Bạn sở hữu tính tò mò của một chú mèo, bạn khao khát được trải nghiệm tất cả mọi thứ trong cuộc sống. Bạn thích tham gia nhiều công việc cùng một lúc miễn sao không bị bó buộc vào bất kỳ lĩnh vực nào. Bạn thích sự thay đổi, khám phá những điều mới và những chân trời mới vì bạn rất dễ thích nghi với môi trường mới. Bạn dễ dàng kết bạn, với tính cách hoạt bát lạc quan và nhanh trí thì bạn có thể trở thành một chuyên gia bán hàng trong mọi lĩnh vực. Bạn có khả năng truyền cảm hứng và thu hút mọi người từ mọi tầng lớp trong xã hội bởi sự sắc sảo, trung thực và giàu lòng nhân ái. Bạn sẵn sàng giúp đỡ những người khó khăn. Bạn cũng không ngần ngại vạch trần những sự dối trá. Bạn là người gợi cảm và thích nếm trải tất cả mọi thứ trong cuộc sống. Tình dục, thức ăn và trải nghiệm về cảm giác là điều không thể thiếu cho việc tận hưởng cuộc sống của bạn. Bạn gặp khó khăn trong việc kiên định với mối quan hệ, nhưng một khi đã quyết tâm, bạn sẽ vô cùng chung thủy. Bạn thường có xu hướng thiếu kỷ luật và trật tự. Điều này có thể khiến bạn trở nên bốc đồng và có những hành động hoặc thể hiện mà bạn sẽ cảm thấy hối tiếc về sau. Bạn là mẫu người dễ đam mê, do đó hãy thận trọng với những thú vui tiêu cực. Đôi khi bạn cũng đanh đá, gắt gỏng, nóng nảy, bồn chồn, bất an. Bạn có Đường đời 5 sẽ phù hợp với những công việc cho phép bạn tự do, sáng tạo, trải nghiệm và đột phá: bán hàng, quảng cáo, giải trí, đầu tư, khoa học, y học, tâm linh, dịch vụ cộng đồng, du lịch, tiếp viên hàng không, tổ chức sự kiện,...SỐ 5 – NGƯ ỜI KẾT NỐI Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 5 có hình dạng mở ra cả bên phải và bên trái, thẳng ở trên và cong ở dưới. Điều này cho thấy nhu cầu về sự đa dạng và thay đổi liên tục. Hãy nhớ giữ bình tĩnh và kiên định."
      ],
      "16": [
        "7 Bạn là người thông minh và bí ẩn, thuộc tiếp người mạnh mẽ và trầm lặng. Bạn có trực giác tâm linh vô cùng rõ ràng và thuyết phục. Mục tiêu của bạn là khám phá những điều chưa biết và tìm ra câu trả lời cho các bí ẩn cuộc sống. Bạn có thể xử lý tốt công việc một mình. Bạn sở hữu một tâm trí khỏe mạnh, là một nhà phân tích, người có khả năng tập trung cao độ và hiểu biết về những kiến thức lý thuyết. Bạn là người thích nghiên cứu và đưa ra giải pháp tốt nhất cho các vấn đề. Bạn thích tận hưởng sự đơn độc của bản thân và thích làm việc một mình. Bạn cần thời gian để chiêm nghiệm những ý tưởng của mình mà không bị xen ngang bởi suy nghĩ của người khác. Bạn là một con sói đơn độc, một người sống theo ý tưởng và phương pháp của riêng bạn. Bạn là một bậc thầy trí tuệ và luôn tìm tòi câu trả lời cho những câu hỏi quan trọng trong cuộc sống, bạn có tiềm năng phát triển to lớn và thành công. Khi bước vào tuổi trung niên, bạn sẽ tỏa ra sự tinh anh và thông thái. Pythagoras yêu thích và chọn môn đệ có Đường đời số 7 vì tiềm năng tâm linh to lớn của nó. Bạn gặp khó khăn trong việc kiên định với mối quan hệ, nhưng một khi đã quyết tâm, bạn sẽ vô cùng chung thủy. Bạn thường có xu hướng thiếu kỷ luật và trật tự. Điều này có thể khiến bạn trở nên bốc đồng và có những hành động hoặc thể hiện mà bạn sẽ cảm thấy hối tiếc về sau. Bạn là mẫu người dễ đam mê, do đó hãy thận trọng với những thú vui tiêu cực. Đôi khi bạn cũng đanh đá, gắt gỏng, nóng nảy, bồn chồn, bất an. Bạn có Đường đời 7 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: kinh doanh, khoa học, tôn giáo, bảo hiểm, phát minh, giáo viên thần học, những điều huyền bí và bất cứ thứ gì liên quan đến nghiên cứu. SỐ 7 – NGƯỜI HƯỚNG DẪN Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 7 có hình dạng giống như một Boomerang, phản ánh chính nó trong mối quan hệ, hoàn cảnh sống và sự nghiệp. Chân số 7 không có điểm tựa, việc mất cân bằng có thể dẫn đến trầm cảm, nghiện ngập và mất ngủ."
      ],
      "19": [
        "1 Bạn là một nhà lãnh đạo bẩm sinh, có nhiều ý tưởng và tầm nhìn độc đáo. Bạn luôn muốn đi đầu trong mọi lĩnh vực mà bạn chọn và chinh phục nó. Bạn là người rất mạnh mẽ, quyết đoán cao và có tinh thần trách nhiệm, bạn làm việc độc lập – tự chủ và xử lý mọi việc rất tốt. Bạn có tài năng đặc biệt và đứng lên sau vấp ngã là điều dễ dàng đối với bạn. Địa vị, vẻ ngoài là đều bạn luôn quan tâm, bạn là người luôn giữ cho mình phong thái của một doanh nhân, người thành đạt. Sự lộng lẫy là nguồn động lực giúp bạn thành công và hướng tới những gì tốt đẹp. Bạn nên chú ý đến tính ích kỷ, tự phụ và quan tâm quá mức về ngoại hình của mình. Bạn phải giữ bản thân tránh xa khỏi những hành vi thái quá, tức giận, hay manh động. Nếu những phẩm chất này không được kiểm soát bạn sẽ có thể trở nên quá độc đoán, thù hận và thậm chí là bạo lực. Bạn có thể trở nên căng thẳng quá mức do tính háo thắng của mình. Hãy cẩn thận những gì bạn ăn và duy trì một chế độ rèn luyện thể chất mà bạn thích. Đừng để niềm kiêu hãnh và sự tự tin thái quá làm chủ bạn. Hãy nhớ rằng tài năng và khả năng của bạn là một món quà từ ơn trên, điều này sẽ thúc đẩy lòng biết ơn và sự khiêm tốn, thay vì kiêu hãnh và tự phụ. Bạn có thể bị thu hút bởi các công việc kinh doanh, quân đội hoặc các tổ chức chính phủ,... miễn là bạn có vai trò lãnh đạo, quản trị trong tổ chức và khả năng thực hiện mọi việc theo cách của bạn. Nhiều vận động viên chuyên nghiệp thành công và vận động viên Olympic cũng có chỉ số đường đời này. SỐ 1 – NGƯ ỜI LÃNH ĐẠO Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Đường thẳng tạo thành số 1 đại diện cho ranh giới bạn cần dựng lên. Nó cũng cho thấy cách số 1 đứng một mình: một cá nhân duy nhất phấn đấu cho vị trí hàng đầu."
      ],
      "2": [
        "2 Bạn là người rất nhạy cảm, có năng lực tâm linh và trực giác tốt. Cảm nhận của bạn về một điều gì đó thường là chính xác. Có thể bạn luôn có những giấc mơ biến thành sự thật. Bạn sẵn sàng tha thứ cho người khác nếu họ biết lỗi. Bạn không những thấu hiểu mà còn đồng cảm được với niềm vui hoặc nỗi buồn của người khác khi họ tâm sự với bạn, làm cho họ được vơi đi. Bạn có thể dành hàng giờ chỉ để ngồi nghe họ tâm sự. Bạn có thể kết nối bạn bè với những người khác để giúp mọi người. Bạn là chuyên gia kết nối và cũng là một chuyên gia hòa giải đại tài. Bạn là người sinh ra để yêu và được yêu; coi trọng tình cảm, gia đình, tình bạn. Bạn muốn được mọi người đối xử bằng tình yêu thương, sự dịu dàng trong lời nói và hành động, luôn mong cho mọi người được bình an, hòa thuận và hạnh phúc. Bạn là người hòa giải nên có nhiều giải pháp và luôn hành động hóa giải xung đột, đối đầu. Bạn thường có những hành động, việc làm để hòa giải những người đang có vấn đề xung đột với nhau. Bạn quá yêu thương sẽ làm bạn dễ bị kiệt sức, bởi bạn thường xuyên phải giải quyết, tư vấn, níu kéo để tránh sự đổ vỡ nào đó. Bạn sợ bị từ chối bởi với bạn đó là biểu hiện của sự rạn nứt. Bạn quá cảm xúc nên có thể sẽ không kiểm soát được tâm trạng, nhất là khi bị khủng hoảng. Bạn có Đường đời 2 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: Tư vấn, giảng dạy và chữa bệnh. Bạn cũng hoàn toàn phù hợp với những nghề nghiệp trong lĩnh vực âm nhạc, kiến trúc, quảng cáo, nông nghiệp, thiết kế công nghiệp, thời trang, sửa chữa đồng hồ và các loại máy móc khác... Chính trị và pháp luật cho phép bạn sử dụng tài năng đáng kể của mình trong đàm phán và giải quyết vấn đề. SỐ 2 – NGƯ ỜI NHẠY CẢM Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 2 có dáng cong và cho thấy sự thỏa hiệp, vì vậy bạn cần phải học cách đứng lên bảo vệ chính mình."
      ],
      "22": [
        "22/4 Bạn được sinh ra với con số mạnh mẽ nhất và có khả năng thành công nhất trong tất cả các con số đường đời. Nó cho bạn khả năng tuyệt đối trong mọi khía cạnh cuộc sống. Bạn sẽ là người có tầm ảnh hưởng rất lớn cho thế giới. Bạn là người kiến tạo tài ba. Con số vua 22/4 là những người có khả năng đặc biệt biến tầm nhìn thành hiện thực. Bạn là người thích quyền lực nên muốn xây dựng đế chế và di sản cho mình để được lưu truyền hậu thế và được vinh danh. Bạn có tham vọng lớn, điều đó khiến bạn trở thành người khó tính nhất thúc đẩy bạn hoàn thành tất cả những gì mình muốn làm. Bạn thích đặt tên mình lên tất cả mọi thứ. Bạn là người cực đoan và có thể sử dụng sức mạnh của mình cho cả điều thiện hoặc ác. Phần thưởng lớn nhất của bạn sẽ đến từ những nỗ lực làm việc thiện và có mục đích tốt. Các nhà lãnh đạo, vĩ nhân hay tổng thống trên thế giới thường sẽ mang con số đường đời 22/4. Bạn thường thiếu niềm tin vào khả năng của người khác. Do đó bạn có xu hướng kiểm soát mọi người và mọi tình huống, và đôi khi bạn cũng dễ bị cám dỗ bởi sự thao túng. Bạn có đường đời 22/4 là phiên bản cao cấp của người có đường đời 4 nên phù hợp với tất cả các lĩnh vực như: Giáo dục, kinh doanh, chăm sóc sức khỏe, quản trị, chuyên gia, chính trị và kế toán,…SỐ 22/4 – NG ƯỜI KIẾN TẠO Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Sự rung cảm độc đáo của số 22 kéo theo các vấn đề sức khỏe cả số 2 và số 4 như dị ứng và căng thẳng."
      ],
      "3": [
        "3 Chỉ số đường đời 3 thể hiện bạn là người có năng lực truyền thụ, vui vẻ, hài hước, sáng tạo và nhiều ý tưởng tuyệt vời. Nhiều nhà văn, nhà thơ, nhạc sĩ và những người hoạt động nghệ thuật được sinh ra với con số đường đời 3. Bạn có năng lực sử dụng ngôn từ rất tốt và khả năng truyền đạt tuyệt vời. Tuy nhiên, khi cao hứng cũng có thể bị cảm xúc cuốn đi quá xa. Bạn là con người của sự kết nối, bạn thích môi trường có sự tương tác, trao đổi và phối hợp với nhau. Bạn là người lạc quan, bạn có khả năng tự phục hồi để bước qua những vấp ngã. Bạn tích cực hoạt động xã hội, nổi tiếng và truyền cảm hứng cho mọi người bằng năng lượng tích cực, vui vẻ, đầy ấm áp của mình. Trong tình yêu và gia đình, bạn là người lãng mạn. Vốn dĩ là người có tâm trí bay bổng, đầy ắp sự sáng tạo, vui vẻ nên bạn thường làm cho cuộc sống và tình yêu có nhiều màu sắc và lãng mạn. Bạn cũng là người chung tình và có thể khó quên tình cũ dù chuyện đó đã trôi qua rất lâu. Bạn là người dễ xúc động và dễ bị tổn thương. Bạn có thể trở nên ủ rũ và cộc cằn khi trầm cảm. bạn cũng dễ bị tác động cảm xúc bởi những ngôn từ tiêu cực: mỉa mai, phê phán, chỉ trích. Hãy tạo ra môi trường tích cực cho mình giúp bạn thể hiện tài năng và truyền cảm hứng cho thế giới. Nhiều người sinh ra với đường đời 3 thường gặp khó khăn trong việc xử lý tiền bạc vì họ có thể vô kế hoạch và không đặc biệt nghiêm túc chịu trách nhiệm với chính mình. Bạn có Đường đời 3 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: Ngoại giao, bán hàng, Trainer, MC, thuyết trình, giảng viên, văn học, nghệ thuật... Bạn thích môi trường làm việc có sự tương tác, giao tiếp, có cảm hứng và sự vui vẻ. SỐ 3 – NGƯỜI MA Y MẮN Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 3 có hình dáng giống như một cặp móng ngựa nằm ngang và được coi là con số may mắn nhất."
      ],
      "4": [
        "4 Bạn là người logic, thực chứng, rõ ràng. Với bạn, mọi thông tin cần phải được mô tả cụ thể, rành mạch, không màu mè, lòng vòng. Và bạn sẽ không thích nếu ai đó nói chuyện với bạn theo kiểu hoa mỹ. Bạn sẽ dễ tin tưởng một ai đó hơn nếu họ trình bày một cách logic, có dẫn chứng. Bạn có năng lực phân tích tốt. Bạn thường phân tích mọi thứ một cách tỉ mỉ, chi tiết, giàu thông tin và nhiều khía cạnh. Bạn tìm kiếm sự rõ ràng, sự thật, nguyên lý, chân lý. Cũng vì điều này bạn có thể trở thành một chuyên gia khi hứng thú với một lĩnh vực nào đó. Bạn có khả năng truyền đạt rất trực quan dễ hiểu. Bạn coi trọng sự trung thực và chân thành, đó là điều quan trọng nhất trong một mối quan hệ. Vì vậy, bạn sẽ không chấp nhận sự dối trá hay khuất tất. Bạn là người tạo cho người khác cảm giác an toàn và đang tin cậy, là người có tính kỷ luật cao, luôn tuân thủ các quy định, quy chế, quy tắc của cơ quan hoặc tổ chức. Sự nghiêm khắc, khó tính, bảo thủ và chỉ chấp nhận những gì hợp logic trong đầu mình. Bạn cho rằng những gì mình nghĩ, mình đã trải qua là đúng đắn. Bạn cũng là người suy nghĩ nhiều, phân tích nhiều nên lắm lúc bị căng thẳng đầu óc. Bạn nên cân bằng giữa công việc và nghỉ ngơi, thư giãn. Sự phân tích quá kỹ lưỡng cũng khiến bạn khó ra quyết định và có thể bị lỡ mất cơ hội. Hãy xây dựng một bộ tiêu chí trợ giúp cho việc ra quyết định. Bạn có Đường đời 4 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: Giáo dục, kinh doanh, chăm sóc sức khỏe, quản trị, chuyên gia, chính trị và kế toán,… Bạn phù hợp với những công việc có tính thực tế như sản xuất, xây dựng, kỹ thuật, thi công, thiết kế hoặc kinh doanh sản phẩm như siêu thị, điện máy. SỐ 4 – NG ƯỜI THỰC TẾ Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 4 được tạo thành hoàn toàn từ các đường thẳng, thể hiện nhu cầu duy trì trật tự và hiệu quả. Hãy nhớ luôn duy trì sự linh hoạt."
      ],
      "5": [
        "5 Bạn thích du lịch, phiêu lưu, mạo hiểm và sự tự do, khám phá. Bạn sở hữu tính tò mò của một chú mèo, bạn khao khát được trải nghiệm tất cả mọi thứ trong cuộc sống. Bạn thích tham gia nhiều công việc cùng một lúc miễn sao không bị bó buộc vào bất kỳ lĩnh vực nào. Bạn thích sự thay đổi, khám phá những điều mới và những chân trời mới vì bạn rất dễ thích nghi với môi trường mới. Bạn dễ dàng kết bạn, với tính cách hoạt bát lạc quan và nhanh trí thì bạn có thể trở thành một chuyên gia bán hàng trong mọi lĩnh vực. Bạn có khả năng truyền cảm hứng và thu hút mọi người từ mọi tầng lớp trong xã hội bởi sự sắc sảo, trung thực và giàu lòng nhân ái. Bạn sẵn sàng giúp đỡ những người khó khăn. Bạn cũng không ngần ngại vạch trần những sự dối trá. Bạn là người gợi cảm và thích nếm trải tất cả mọi thứ trong cuộc sống. Tình dục, thức ăn và trải nghiệm về cảm giác là điều không thể thiếu cho việc tận hưởng cuộc sống của bạn. Bạn gặp khó khăn trong việc kiên định với mối quan hệ, nhưng một khi đã quyết tâm, bạn sẽ vô cùng chung thủy. Bạn thường có xu hướng thiếu kỷ luật và trật tự. Điều này có thể khiến bạn trở nên bốc đồng và có những hành động hoặc thể hiện mà bạn sẽ cảm thấy hối tiếc về sau. Bạn là mẫu người dễ đam mê, do đó hãy thận trọng với những thú vui tiêu cực. Đôi khi bạn cũng đanh đá, gắt gỏng, nóng nảy, bồn chồn, bất an. Bạn có Đường đời 5 sẽ phù hợp với những công việc cho phép bạn tự do, sáng tạo, trải nghiệm và đột phá: bán hàng, quảng cáo, giải trí, đầu tư, khoa học, y học, tâm linh, dịch vụ cộng đồng, du lịch, tiếp viên hàng không, tổ chức sự kiện,...SỐ 5 – NGƯ ỜI KẾT NỐI Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 5 có hình dạng mở ra cả bên phải và bên trái, thẳng ở trên và cong ở dưới. Điều này cho thấy nhu cầu về sự đa dạng và thay đổi liên tục. Hãy nhớ giữ bình tĩnh và kiên định."
      ],
      "6": [
        "6 Bạn là người rất tình cảm, tốt bụng, nhân hậu và bao dung. Bạn dễ rung động trước cái đẹp, dù đó là vẻ đẹp của phong cảnh, đồ vật hay vẻ đẹp của con người. Bạn dễ xúc động trước những hoàn cảnh đáng thương, éo le và bạn cũng dễ xúc động trước những sự yêu thương, chăm sóc, khen ngợi dành cho bạn. Bạn giàu lòng nhân ái và sẵn lòng giúp đỡ người khác một cách chân thành. Thường thì mọi người mở lời xin sự giúp đỡ thì bạn sẽ đồng ý, nhất là những người gần gũi hoặc thân thiết của bạn. Bạn thích ôm đồm mọi việc nên hãy cẩn thận để không phải làm việc bao đồng, bao bọc, thậm chí làm hư những người gần gũi bạn. Bạn là người dám hy sinh và bảo vệ kẻ yếu. Bạn bao dung như một người mẹ. Dù có giận người ta đến đâu, chỉ cần họ thể hiện sự biết lỗi hoặc hòa giải, bạn sẵn lòng bỏ qua. Bạn còn có thể rất áy náy nếu thấy có lỗi với ai đó. Bạn rất quyến rũ, có khả năng hấp dẫn người khác và cũng là người chữa lành, mang lại sự an ủi cho những ai đang cần và thường là một bờ vai an toàn để họ tựa vào mỗi khi buồn. Quan điểm cứng rắn của bạn cũng sẽ khiến bạn gặp rắc rối. Nếu thấy mình luôn trong tình trạng căng thẳng về tài chính, bạn đang không sống đúng với mục đích của mình. Bạn yêu nhiều, đôi khi quá nhiều và cũng có xu hướng cất giấu tình cảm trong lòng. Các vấn đề sức khỏe thường gặp liên quan đến khả năng sinh nở và các vấn đề tim mạch. Bạn có Đường đời 6 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: Giảng dạy, tư vấn, chăm sóc sức khỏe, khách sạn, tâm lý học, quản lý, bất động sản, chính phủ, các ngành nghề liên quan đến động vật hoặc lĩnh vực thẩm mỹ như thời trang hay thiết kế nội thất. SỐ 6 – NGƯỜI CHỮA LÀNH Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 6 có hình dạng giống như một phụ nữ mang thai. Một điều không thay đổi đối với số 6: tầm quan trọng của gia đình và luôn muốn chăm sóc người khác."
      ],
      "7": [
        "7 Bạn là người thông minh và bí ẩn, thuộc tiếp người mạnh mẽ và trầm lặng. Bạn có trực giác tâm linh vô cùng rõ ràng và thuyết phục. Mục tiêu của bạn là khám phá những điều chưa biết và tìm ra câu trả lời cho các bí ẩn cuộc sống. Bạn có thể xử lý tốt công việc một mình. Bạn sở hữu một tâm trí khỏe mạnh, là một nhà phân tích, người có khả năng tập trung cao độ và hiểu biết về những kiến thức lý thuyết. Bạn là người thích nghiên cứu và đưa ra giải pháp tốt nhất cho các vấn đề. Bạn thích tận hưởng sự đơn độc của bản thân và thích làm việc một mình. Bạn cần thời gian để chiêm nghiệm những ý tưởng của mình mà không bị xen ngang bởi suy nghĩ của người khác. Bạn là một con sói đơn độc, một người sống theo ý tưởng và phương pháp của riêng bạn. Bạn là một bậc thầy trí tuệ và luôn tìm tòi câu trả lời cho những câu hỏi quan trọng trong cuộc sống, bạn có tiềm năng phát triển to lớn và thành công. Khi bước vào tuổi trung niên, bạn sẽ tỏa ra sự tinh anh và thông thái. Pythagoras yêu thích và chọn môn đệ có Đường đời số 7 vì tiềm năng tâm linh to lớn của nó. Bạn gặp khó khăn trong việc kiên định với mối quan hệ, nhưng một khi đã quyết tâm, bạn sẽ vô cùng chung thủy. Bạn thường có xu hướng thiếu kỷ luật và trật tự. Điều này có thể khiến bạn trở nên bốc đồng và có những hành động hoặc thể hiện mà bạn sẽ cảm thấy hối tiếc về sau. Bạn là mẫu người dễ đam mê, do đó hãy thận trọng với những thú vui tiêu cực. Đôi khi bạn cũng đanh đá, gắt gỏng, nóng nảy, bồn chồn, bất an. Bạn có Đường đời 7 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: kinh doanh, khoa học, tôn giáo, bảo hiểm, phát minh, giáo viên thần học, những điều huyền bí và bất cứ thứ gì liên quan đến nghiên cứu. SỐ 7 – NGƯỜI HƯỚNG DẪN Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 7 có hình dạng giống như một Boomerang, phản ánh chính nó trong mối quan hệ, hoàn cảnh sống và sự nghiệp. Chân số 7 không có điểm tựa, việc mất cân bằng có thể dẫn đến trầm cảm, nghiện ngập và mất ngủ."
      ],
      "8": [
        "8 Bạn có năng khiếu lãnh đạo bẩm sinh và khả năng tích lũy tài sản lớn. Bạn có tài quản lý tuyệt vời trong mọi lĩnh vực của cuộc sống, đặc biệt lĩnh vực kinh doanh và tài chính. Tài năng của bạn không nằm ở việc ghi chép sổ sách hay quản lý lặt vặt, mà ở tầm nhìn xa hơn với mục đích và mục tiêu dài hạn. Bạn có tầm nhìn xa và có phần hơi liều lĩnh. Bạn có khả năng truyền cảm hứng cho đồng đội, phải thúc đẩy họ hành động và hướng theo con đường mà bạn thấy sẽ thành công. Bạn thu hút thành công về mặt tài chính hơn những người mang con số đường đời khác, nhưng bạn phải nỗ lực để đạt được thành công đó. Hãy nhớ rằng có một ranh giới giữa quyền lực và tham nhũng và bạn phải bước đi trên ranh giới đó một cách cẩn thận. Bạn thích tiền và tiêu xài hoang phí. Những việc bạn làm liên quan đến tiền sẽ phản tác dụng nếu bạn làm vì mục đích sai trái. Tuy nhiên, bạn có thể đạt được thành công nếu làm việc với sự chính trực và thành thật. Hãy cẩn thận đừng trở nên cứng đầu, cố chấp, hống hách và thiếu kiên nhẫn, những đặc điểm đó có thể được hình thành từ rất sớm trong cuộc đời bạn. Bạn thường trải qua tuổi thơ với những bậc cha mẹ khắt khe, hay sinh trưởng trong một gia đình mang nặng những giáo điều tôn giáo hay tư tưởng hà khắc. Cái tôi, sự kiêu ngạo và ích kỷ có thể là điểm yếu của bạn. Bạn dễ nổi giận nhưng cơn giận luôn nhanh chóng qua đi. Bạn học hỏi từ những kinh nghiệm này. Hãy học cách chịu trách nhiệm, thành thật xin lỗi và tiến bộ. Bạn có Đường đời 8 thường trải qua nhiều công việc tại các công ty khác nhau, cố gắng tìm ra môi trường phù hợp. Bạn sẽ hoàn thành xuất sắc mọi việc trong môi trường kinh doanh và đây cũng là lĩnh vực bạn có lợi thế và tạo được sự ảnh hưởng như: ngân hàng, bất động sản, tài chính và báo chí,…SỐ 8 – NGƯỜI THAM VỌNG Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 8 có hình dạng được tạo thành từ hai vòng tròn dính liền thể hiện tinh thần và vật chất. Bạn phải luôn giữ hai mặt này được cân bằng mới thấy hài lòng thật sự."
      ],
      "9": [
        "9 Bạn là nhà từ thiện, nhà nhân đạo có ý thức xã hội và quan tâm sâu sắc đến tình hình thế giới. Bạn có tấm lòng trắc ẩn to lớn và chủ nghĩa lý tưởng. Bạn là người theo chủ nghĩa duy tâm và sẽ dành cả cuộc đời để cố gắng thực hiện giấc mơ duy tâm của mình. Bạn sẵn sàng hy sinh tiền bạc, thời gian và năng lượng cho thế giới tốt đẹp hơn. Chính khi cho đi bạn mới thấy hài lòng. Bạn có cái nhìn rộng về nhiều khía cạnh của cuộc sống. Bạn có xu hướng đánh giá bức tranh tổng thể hơn là các chi tiết nhỏ. Bạn có thể hấp dẫn mọi người từ mọi tầng lớp xã hội. Bạn hoàn toàn là người theo chủ nghĩa bình đẳng. Bạn là người giàu trí tưởng tượng và sáng tạo, đặc biệt là khả năng sắp xếp hài hòa vẻ đẹp vốn đã tiềm ẩn trong môi trường sẵn có. Bạn có sự nhiệt tình và khả năng hoàn thành những gì bạn bắt tay vào. Con đường thành công và thỏa mãn nhất của bạn là sự cống hiến, chia sẻ và hy sinh vì mục tiêu lớn hơn mà không mong được đền đáp. Cơ hội lớn nhất đưa bạn đến thành công là gắn kết vận may của mình với nỗ lực biến thế giới trở thành một nơi tốt đẹp hơn cho mọi người. Bạn là người lãng mạn, nhưng tình yêu của bạn lại có phần bồng bột. Bạn có xu hướng mơ mộng quá nhiều. Khi không thể hòa hợp với bản chất thật của mình bạn sẽ rơi vào trạng thái ủ rũ, xa cách và thu mình. Bạn cũng có thể trở nên rụt rè, thiếu kiên định và quên ơn, đổ lỗi cho những rắc rối của bạn lên người khác hoặc thế giới. Hãy thành thật với chính mình bằng cách cởi mở đối mặt với những khuyết điểm cũng như ưu điểm của mình, bạn sẽ phát triển trạng thái cân bằng. Từ đó giúp bạn hiểu rõ hơn về bản thân và cuộc sống. Bạn có Đường đời 9 sẽ đạt được nhiều thành tựu trong các lĩnh vực như: giảng dạy, tư vấn, chăm sóc sức khỏe, kinh doanh quốc tế,... Bạn sẽ cảm thấy sự thỏa mãn bằng cách truyền cảm hứng cho người khác bằng ý tưởng của mình. SỐ 9 – NGƯ ỜI CỐNG HIẾN Điểm mạnh: Điểm hạn chế cần khắc phục: Sự nghiệp: CHỈ SỐ ĐƯỜNG ĐỜI Số 9 có hình dạng là một cái đầu đầy trí tuệ. Bạn có thể thấy rằng những người lạ đến với bạn để tìm kiếm thông tin, lời khuyên hoặc chỉ đường."
      ]
    },
    "intro": [
      "ĐƯỜNG ĐỜI = SỰ NGHIỆP CUỘC ĐỜI Chỉ số Đường đời tiết lộ tài năng và năng lực tiềm ẩn mà bạn cần phải khai phá để phát huy tối đa giúp cho sự nghiệp của bạn thành công. Khi bạn hiểu rõ về chỉ số này sẽ giúp bạn phát triển được sự nghiệp của mình một cách hoàn hảo, sử dụng hiệu quả tài năng và năng lực thiên bẩm cũng như nuôi dưỡng các mối quan hệ và khả năng tự nhận thức. Bạn được sinh ra và có quyền tự do tối thượng để làm những gì bạn muốn cho cuộc sống của mình. Bạn có thể cống hiến hết mình với tiềm năng của bạn hoặc tạo ra một phiên bản nhỏ hơn của chính bạn. Tất cả phụ thuộc vào sự nỗ lực của bạn. Chỉ số này có sức mạnh và năng lượng rất lớn ảnh hưởng đến cuộc đời bạn. CHỈ SỐ ĐƯỜNG ĐỜI"
    ]
  },
  "birthNumber": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 1 = NGƯỜI DẪN ĐẦU & CHINH PHỤC Bạn là người độc lập, thích cạnh tranh và là một nhà lãnh đạo bẩm sinh, luôn là người tiên phong và khởi xướng. Bạn có năng khiếu kinh doanh tuyệt vời và với sự đào tạo phù hợp bạn có thể điều hành các tổ chức và doanh nghiệp lớn. Bạn là người sáng tạo với rất nhiều ý tưởng độc đáo và bạn thích nổi bật, có tầm nhìn xa trông rộng và khả năng thúc đẩy người khác rất tốt. Bạn có sức mạnh ý chí tuyệt vời. Điều đó khiến cho cơ hội đạt được thành công của bạn rất lớn. Bạn rất cởi mở với ý tưởng của người khác nhưng cũng có thể trở nên cực kỳ bướng bỉnh và cứng đầu một khi đã quyết tâm gắn bó với kế hoạch của mình. Hãy cẩn thận với sự lười biếng và trì hoãn. Bạn được sinh ra với sự nóng nảy và dễ chán nản đôi lúc rất độc đoán. Hãy cố gắng chia sẻ và làm việc nhóm."
      ],
      "11": [
        "11/2 CHỈ SỐ NGÀY SINH",
        "Bạn là người duy tâm và sở hữu trực giác mạnh mẽ, bạn rất nhạy bén nên có thể trở thành một nhà cố vấn hoặc người chữa lành. Bạn dễ dàng thấu hiểu mọi người ngay cả trước khi khi họ bộc lộ nội tâm của mình. Bạn dễ nhạy cảm, xúc động và phản ứng nhanh. Hay bị tổn thương vì những lời chỉ trích của người khác và có thể phải mất một thời gian để hồi phục sau những vết thương đó. Trực giác và sự nhạy cảm của bạn chắc chắn sẽ dẫn đến việc theo đuổi những mục tiêu về triết học và duy tâm. Bạn có thể truyền cảm hứng cho mọi người đi theo một hướng cụ thể hoặc áp dụng các phương pháp mới cho cuộc sống. Bạn có tố chất của một người nhìn xa trông rộng và hay khích lệ người khác với những ý tưởng về một thế giới tốt đẹp hơn. Sự hiện diện của bạn tạo nên sự phấn khởi đến những người xung quanh. Bạn không giỏi trong lĩnh vực kinh doanh, ngoại trừ vai trò cố vấn. Tâm trí của bạn hoạt động theo trực giác nhiều hơn lý trí."
      ],
      "13": [
        "4 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 4 = NGƯỜI THỰC TẾ & TRUNG THỰC Bạn là một người chăm chỉ và tận tâm. Bạn coi trọng sự chính xác và cẩn thận trong những việc mình làm. Bạn có nguyên tắc, kỷ luật và trách nhiệm cao. Bạn rất coi trọng nghĩa vụ của mình và là người có đạo đức. Bạn rất tự tin và ngay thẳng nhưng hoàn toàn không hề kiêu ngạo. Bạn có lòng trắc ẩn với mọi người và luôn kiên trì đối mặt với trở ngại hoặc các vấn đề cá nhân. Bạn rất yêu gia đình và là một người bạn đời tuyệt vời. Tuy nhiên, bạn không phải là mẫu người đa sầu đa cảm hoặc dễ thể hiện tình yêu của mình. Ngược lại, bạn có xu hướng che giấu cảm xúc của bản thân. Bạn là người vô cùng lý trí, bạn không áp dụng những giải pháp phi thực tế cho các vấn đề và cũng không phù hợp với các kế hoạch làm giàu nhanh chóng. Bạn là người thực tế, đáng tin cậy, chăm chỉ, trung thực, cân bằng và được xem là nền tảng bền vững của mọi nỗ lực."
      ],
      "14": [
        "5 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 5 = NGƯỜI PHIÊU LƯU & MẠO HIỂM Bạn thích sự thay đổi, du lịch và phiêu lưu như một hòn đá lăn mãi không ngừng. Bạn có trí tò mò lớn, luôn khao khát được nhìn thấy những nơi xa xôi và gặp gỡ những con người kỳ lạ. Bạn có khả năng thích nghi cao và khơi gợi nguồn cảm hứng. Bạn có quan hệ tốt với những người xung quanh và không gặp bất kỳ trở ngại nào trong việc sử dụng ngôn từ. Bạn có tài trong lĩnh vực quảng bá, quan hệ công chúng và có khả năng sáng tác. Khả năng giao tiếp và quảng bá sản phẩm hoặc sự kiện giúp bạn trở thành một nhân viên bán hàng giỏi. Bạn gặp khó khăn khi bị ràng buộc vào những công việc văn phòng. Bạn có thể hơi thiếu trách nhiệm, do đó bạn cần rèn luyện thêm tính kỷ luật và nề nếp. Bạn là người tháo vác, dám chấp nhận sự thay đổi, và đôi khi bốc đồng. Bài học của bạn là học cách chịu trách nhiệm."
      ],
      "16": [
        "7 CHỈ SỐ NGÀY SINH",
        "Bạn có trí thông minh phát triển tuyệt vời. Bộ óc của bạn là công cụ để khám phá thế giới và những gì liên quan. Bạn có định hướng về mặt triết học và tâm hồn. Bạn có khả năng chuyên sâu một lĩnh vực nhất định để tận dụng hết khả năng và năng khiếu trí tuệ bẩm sinh. Bạn có xu hướng phân tích là lý trí trong cách tiếp cận các mối quan hệ. Cảm xúc là thứ mơ hồ và không chắc chắn đối với bạn và bạn thường không tin tưởng vào nó. Bạn có trực giác tuyệt vời nên bạn hãy thiền định và thực hiện một số bài tập thể dục tinh thần để phát triển món quà quý giá này. Khi đã bắt đầu tin tưởng vào trực giác của mình thì bạn sẽ hình thành nên một niềm tin vững chắc. Bạn thích làm việc một mình và tự thiết lập tốc độ phát triển riêng. Bạn có xu hướng hoàn thành các dự án khi đã bắt đầu. Sở thích của bạn nghiêng về khoa học, kỹ thuật và những lĩnh vực siêu hình."
      ],
      "19": [
        "1 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 1 = NGƯỜI DẪN ĐẦU & CHINH PHỤC Bạn là người độc lập, thích cạnh tranh và là một nhà lãnh đạo bẩm sinh, luôn là người tiên phong và khởi xướng. Bạn có năng khiếu kinh doanh tuyệt vời và với sự đào tạo phù hợp bạn có thể điều hành các tổ chức và doanh nghiệp lớn. Bạn là người sáng tạo với rất nhiều ý tưởng độc đáo và bạn thích nổi bật, có tầm nhìn xa trông rộng và khả năng thúc đẩy người khác rất tốt. Bạn có sức mạnh ý chí tuyệt vời. Điều đó khiến cho cơ hội đạt được thành công của bạn rất lớn. Bạn rất cởi mở với ý tưởng của người khác nhưng cũng có thể trở nên cực kỳ bướng bỉnh và cứng đầu một khi đã quyết tâm gắn bó với kế hoạch của mình. Hãy cẩn thận với sự lười biếng và trì hoãn. Bạn được sinh ra với sự nóng nảy và dễ chán nản đôi lúc rất độc đoán. Hãy cố gắng chia sẻ và làm việc nhóm."
      ],
      "2": [
        "2 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 2 = NGƯỜI HỖ TRỢ & NHẠY CẢM Bạn là người tốt bụng, kiên nhẫn, nhạy cảm và trực giác nhạy bén, bạn làm việc nhóm tốt hơn là một mình. Sự nhạy cảm khiến bạn dễ rung động và dễ bị tổn thương. Bạn có thể trở thành nạn nhân của chứng trầm cảm và tự ti. Bạn là một đồng đội hòa đồng, chu đáo và luôn hỗ trợ người khác. Tài năng của bạn nằm ở mối quan hệ và kỹ năng ngoại giao. Bạn nhận thức sâu sắc về suy nghĩ của người khác và có thể điều chỉnh hành động để hòa hợp với họ. Bạn sở hữu nghệ thuật của một nhà ngoại giao và giúp người khác tìm được ý trung nhân hoặc sự đồng thuận trước đám đông. Bạn cũng có thể có năng khiếu nghệ thuật và âm nhạc. Bạn là người ấm áp và giàu tình cảm, bạn cũng cần điều đó từ bạn bè và người thân của mình. Bạn muốn được ôm, âu yếm, thích cảm giác an toàn và che chở."
      ],
      "22": [
        "22/4 CHỈ SỐ NGÀY SINH",
        "Bạn có tiềm năng lớn với tư cách là nhà lãnh đạo, nhà tổ chức hoặc người xây dựng tổ chức, doanh nghiệp. Bạn có tầm nhìn và khả năng thực hiện hóa nó. Bạn sở hữu khả năng có sức mạnh tuyệt vời, nhưng ngược lại bạn có nỗi sợ sâu sắc về các chiều hướng tham vọng của mình. Bạn có tài năng nhìn thấy cả chi tiết của một kế hoạch và cách nó sẽ diễn ra. Bạn có tính kỷ luật và kiên nhẫn cao. Bạn có thể tiếp cận vấn đề một cách bài bản và có hệ thống. Thách thức của bạn là sự sẵn sàng để khởi nghiệp với quy mô nhỏ và thực hiện các bước tiến để mở rộng doanh nghiệp của mình lên phạm vi vừa phải. Các giải pháp của bạn khá đặc biệt. Bạn có nhận thức khác biệt, trực giác bạn rất tốt và bạn nên tin vào những ấn tượng đầu tiên của mình. Bạn vừa thực tế vừa duy tâm. Bạn có xu hướng muốn xây dựng lý tưởng của mình bằng những phương pháp thực tế."
      ],
      "3": [
        "3 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 3 = NGƯỜI THÂN THIỆN & HÒA ĐỒNG Bạn là người thân thiện và tràn đầy năng lượng. Khả năng sáng tạo của bạn không có giới hạn. Bạn có tài văn chương tuyệt vời và có mắt thẩm mỹ hoặc nghệ thuật diễn xuất. Bạn là người có trí tưởng tượng phong phú và lanh lợi. Bạn cũng có năng khiếu ăn nói bẩm sinh và tràn đầy nhiệt tình. Người khác sẽ cảm nhận được nguồn cảm hứng và sự quyến rũ từ bạn. Bạn là nhân viên bán hàng tuyệt vời, là người rất thân thiện, hòa đồng, vui vẻ và là người thích cuộc sống của những bữa tiệc. Tâm trạng của bạn cũng khá thất thường, có thể lên xuống nhanh chóng. Bạn hãy học cách quản lý cảm xúc và ngừng tìm kiếm sự thỏa mãn tức thì. Bạn có năng khiếu trồng cây và cắm hoa. Hãy cẩn thận để không lãng phí thời gian và năng lượng vào những điều nhỏ nhặt. Hãy tập trung vào mục tiêu và tầm nhìn dài hạn của mình."
      ],
      "4": [
        "4 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 4 = NGƯỜI THỰC TẾ & TRUNG THỰC Bạn là một người chăm chỉ và tận tâm. Bạn coi trọng sự chính xác và cẩn thận trong những việc mình làm. Bạn có nguyên tắc, kỷ luật và trách nhiệm cao. Bạn rất coi trọng nghĩa vụ của mình và là người có đạo đức. Bạn rất tự tin và ngay thẳng nhưng hoàn toàn không hề kiêu ngạo. Bạn có lòng trắc ẩn với mọi người và luôn kiên trì đối mặt với trở ngại hoặc các vấn đề cá nhân. Bạn rất yêu gia đình và là một người bạn đời tuyệt vời. Tuy nhiên, bạn không phải là mẫu người đa sầu đa cảm hoặc dễ thể hiện tình yêu của mình. Ngược lại, bạn có xu hướng che giấu cảm xúc của bản thân. Bạn là người vô cùng lý trí, bạn không áp dụng những giải pháp phi thực tế cho các vấn đề và cũng không phù hợp với các kế hoạch làm giàu nhanh chóng. Bạn là người thực tế, đáng tin cậy, chăm chỉ, trung thực, cân bằng và được xem là nền tảng bền vững của mọi nỗ lực."
      ],
      "5": [
        "5 CHỈ SỐ NGÀY SINH",
        "NGÀY SINH 5 = NGƯỜI PHIÊU LƯU & MẠO HIỂM Bạn thích sự thay đổi, du lịch và phiêu lưu như một hòn đá lăn mãi không ngừng. Bạn có trí tò mò lớn, luôn khao khát được nhìn thấy những nơi xa xôi và gặp gỡ những con người kỳ lạ. Bạn có khả năng thích nghi cao và khơi gợi nguồn cảm hứng. Bạn có quan hệ tốt với những người xung quanh và không gặp bất kỳ trở ngại nào trong việc sử dụng ngôn từ. Bạn có tài trong lĩnh vực quảng bá, quan hệ công chúng và có khả năng sáng tác. Khả năng giao tiếp và quảng bá sản phẩm hoặc sự kiện giúp bạn trở thành một nhân viên bán hàng giỏi. Bạn gặp khó khăn khi bị ràng buộc vào những công việc văn phòng. Bạn có thể hơi thiếu trách nhiệm, do đó bạn cần rèn luyện thêm tính kỷ luật và nề nếp. Bạn là người tháo vác, dám chấp nhận sự thay đổi, và đôi khi bốc đồng. Bài học của bạn là học cách chịu trách nhiệm."
      ],
      "6": [
        "6 CHỈ SỐ NGÀY SINH",
        "Bạn là người luôn hướng về gia đình và có tài giải quyết tranh chấp giữa mọi người. Bạn thấu hiểu nhiều mặt của vấn đề từ vị trí trung gian. Bài học cho cuộc sống của bạn là lấy sự cân bằng làm trung tâm. Bạn là người trách nhiệm và sẽ cống hiến hết mình mà không cần sự đáp trả. Trọng tâm của bạn là các mối quan hệ. Bạn luôn muốn giúp đỡ người khác. Bạn có tài chữa lành và có thể hiểu sâu về nghệ thuật chữa bệnh. Bạn cũng có khả năng trở thành nhà trị liệu về dinh dưỡng hoặc y học (châm cứu, xoa bóp) hay thậm chí là bác sĩ. Trung thành, cầu toàn và chu đáo đều là một phần bản chất của bạn (mặc dù bạn có xu hướng can thiệp vào những công việc không phải của mình). Bạn sẵn sàng hy sinh sự thoải mái của bản thân để hỗ trợ và giúp đỡ người khác. Bạn là người hào phóng, tốt bụng và cảm thông. Bạn hãy nghiên cứu và phát triển các kỹ năng chữa lành để phát huy tối đa tài năng của mình."
      ],
      "7": [
        "7 CHỈ SỐ NGÀY SINH",
        "Bạn có trí thông minh phát triển tuyệt vời. Bộ óc của bạn là công cụ để khám phá thế giới và những gì liên quan. Bạn có định hướng về mặt triết học và tâm hồn. Bạn có khả năng chuyên sâu một lĩnh vực nhất định để tận dụng hết khả năng và năng khiếu trí tuệ bẩm sinh. Bạn có xu hướng phân tích là lý trí trong cách tiếp cận các mối quan hệ. Cảm xúc là thứ mơ hồ và không chắc chắn đối với bạn và bạn thường không tin tưởng vào nó. Bạn có trực giác tuyệt vời nên bạn hãy thiền định và thực hiện một số bài tập thể dục tinh thần để phát triển món quà quý giá này. Khi đã bắt đầu tin tưởng vào trực giác của mình thì bạn sẽ hình thành nên một niềm tin vững chắc. Bạn thích làm việc một mình và tự thiết lập tốc độ phát triển riêng. Bạn có xu hướng hoàn thành các dự án khi đã bắt đầu. Sở thích của bạn nghiêng về khoa học, kỹ thuật và những lĩnh vực siêu hình."
      ],
      "8": [
        "8 CHỈ SỐ NGÀY SINH",
        "Bạn có năng khiếu kinh doanh và khả năng kiểm soát tốt về mặt tài chính. Cách tiếp cận kinh doanh của bạn rất độc đáo, sáng tạo và táo bạo. Bạn có tính cạnh tranh cao và các mối quan hệ đối tác chặt chẽ. Tham vọng quyền lực sẽ đẩy bạn đến những mưu mô và thao túng. Bạn làm việc hiệu quả và có thể xử lý các dự án lớn. Nếu bạn vẫn chưa điều hành bất kỳ bộ phận nào hoặc doanh nghiệp nào của riêng mình thì bạn đã định sẵn cho một vị trí như thế. Lãnh đạo là tài năng thiên bẩm của bạn. Bạn có tài năng tuyệt vời về tổ chức. Bạn có thể quản lý các nhóm lớn và dẫn dắt họ theo tầm nhìn của bạn. Bạn là người thực tế, tự tin, thực dụng, tham vọng và luôn hướng tới mục tiêu. Người khác tôn trọng bạn và sự phán xét của bạn. Họ biết rằng bạn có thể là chỗ dựa vững chắc cho họ và bạn sẽ vượt qua được tất cả. Bạn thích đối đầu với mọi thử thách và có niềm đam mê mãnh liệt với tiền bạc."
      ],
      "9": [
        "9 CHỈ SỐ NGÀY SINH",
        "Bạn là người thông suốt, di tâm và giàu lòng nhân ái. Bạn nên được học tập trong một nền giáo dục đa dạng, đặc biệt là lĩnh vực nghệ thuật. Nhiều nghệ sĩ tài năng cũng có con số ngày sinh này. Thách thức của bạn là tìm cho mình một vị trí mang lại quyền lợi trực tiếp đến người khác. Bạn phục vụ cho lợi ích chung của xã hội càng nhiều thì phần thưởng cá nhân của bạn sẽ càng lớn bao gồm cả vật chất và tinh thần. Hãy cẩn thận với việc tỏ ra biết tất cả hoặc ra vẻ trịch thượng. Bạn hãy học cách tha thứ và buông bỏ. Bạn thường suy nghĩ cẩn thận trước khi chọn ngành nghề. Bạn có xu hướng thiên về hoạt động xã hội và có khả năng thu hút người khác. Bạn được mọi người yêu mến và ngưỡng mộ. Bạn có xu hướng thu hút tiền bạc từ các nguồn khác như tài sản thừa kế hoặc do may mắn."
      ]
    },
    "intro": [
      "Chỉ Số ngày sinh có ý nghĩa quan trọng trong việc hiểu bạn là ai và tài năng của bạn nằm ở đâu. Nó là một món quà giúp bạn thành công trên đường đời. Chỉ số ngày sinh của bạn đi kèm với một khả năng hoặc tài năng đặc biệt và có ảnh hưởng đến cuộc sống của bạn. Chỉ Số Ngày Sinh là một món quà mà vũ trụ gửi đến bạn. Bạn hãy hình dung, ai trong chúng ta khi sinh ra cũng có ngày sinh cụ thể, và ứng với mỗi ngày sinh này, chúng ta sẽ nhận được 1 nguồn năng lượng nào đó từ vũ trụ này gửi đến chúng ta, nó là một dạng năng lực có sẵn bên trong con người bạn. CHỈ SỐ NGÀY SINH"
    ]
  },
  "maturity": {
    "byValue": {
      "1": [
        "1 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 1 = CHINH PHỤC MỤC TIÊU Trưởng Thành số 1 làm bạn khao khát sự chinh phục và bứt phá. Bạn cảm nhận được năng lượng hạnh phúc và thành công khi mình đạt được thành quả xứng đáng. Bạn không muốn chấp nhận sự thất bại. Động lực, quyết tâm và tinh thần chịu trách nhiệm của bạn rất cao. Bạn cần có sự độc lập và tính cá nhân mạnh mẽ hơn. Bạn phải nỗ lực nhiều hơn để được công nhận và đền đáp. Bạn nên cẩn trọng trong cách hành xử để không trở thành kẻ bắt nạt và gây chiến với người yếu thế hơn mình."
      ],
      "11": [
        "11/2 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 11/2 = TRỰC GIÁC RẤT MẠNH Trưởng Thành số 11/2 giúp bạn có thêm những trải nghiệm trực giác và tâm linh đáng kinh ngạc khi bạn càng lớn tuổi. Hãy tin vào cảm nhận của bạn. Sự nhạy cảm và khả năng phán đoán tính cách của bạn sẽ ngày càng sâu sắc, tinh tế hơn và mọi người thường sẽ ngạc nhiên bởi mức độ chính xác của bạn. Cuộc sống của bạn có thể gắn liền với huyền học và tạo nên giá trị khi thực hành điều đó. Hiểu biết trong cuộc sống của bạn sẽ được nâng cao. Bạn sẽ phân biệt đối xử rõ với những người mà bạn cho phép bước vào thế giới của mình và kết quả là những mối quan hệ lâu dài."
      ],
      "13": [
        "4 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 4 = KẾ HOẠCH - THỰC TẾ Trưởng Thành số 4 giúp bạn tập trung hướng tới mục tiêu, loại bỏ các chi tiết không cần thiết và đi thẳng đến giải quyết vấn đề. Bạn không bao giờ nghĩ mình sẽ nghỉ hưu trong yên tĩnh. Bạn tham gia vào tất cả kế hoạch để có thể khiến mục tiêu của mình biến thành hiện thực. Bạn sẽ thấy mình trở thành người có kế hoạch, thực tế và có tổ chức hơn. Tránh việc quá cứng nhắc, không linh hoạt và cố chấp. Hãy nhớ dành thời gian để tận hưởng niềm vui."
      ],
      "14": [
        "5 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 5 = KẾT N ỐI Trưởng Thành số 5 giúp bạn trở nên năng động và linh hoạt hơn, sức ảnh hưởng của bạn cũng tăng lên. Bạn sẽ quan tâm đến nhiều lĩnh vực mà bạn chưa từng trải nghiệm trước đây. Bạn hay có cảm giác bồn chồn và thiếu tính kiên nhẫn. Du lịch, tự do và những sự kiện bất ngờ sẽ chi phối nửa sau cuộc đời bạn. Khả năng kể chuyện của bạn sẽ phát triển, và bạn sẽ trở nên độc đáo và thú vị hơn, dám chấp nhận rủi ro hơn. Hãy cẩn thận với việc phân tán năng lượng của bạn vào những thú vui không lành mạnh."
      ],
      "16": [
        "7 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 7 = CH UYÊN GIA Trưởng Thành số 7 giúp bạn đặt ra những câu hỏi về cuộc sống nhân sinh thông qua việc suy ngẫm, tìm hiểu và tự nghiên cứu. Bạn có thể chuyển sang triết học hoặc tôn giáo, có thể là huyền học. Nhưng bạn cũng xem xét mở rộng kiến thức của mình qua nhiều lĩnh vực hơn và chuyên sâu hơn. Vì bất kỳ lĩnh vực nào bạn tham gia thì bạn đều có thể đào sâu nó. Bạn có xu hướng thích sống ẩn dật và không màn thế sự. Trực giác của bạn phát triển mạnh mẽ hơn, thích phân tích những câu hỏi sâu sắc và sống theo đúng lý tưởng của mình. Bạn trở thành chuyên gia trong một lĩnh vực cụ thể."
      ],
      "19": [
        "1 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 1 = CHINH PHỤC MỤC TIÊU Trưởng Thành số 1 làm bạn khao khát sự chinh phục và bứt phá. Bạn cảm nhận được năng lượng hạnh phúc và thành công khi mình đạt được thành quả xứng đáng. Bạn không muốn chấp nhận sự thất bại. Động lực, quyết tâm và tinh thần chịu trách nhiệm của bạn rất cao. Bạn cần có sự độc lập và tính cá nhân mạnh mẽ hơn. Bạn phải nỗ lực nhiều hơn để được công nhận và đền đáp. Bạn nên cẩn trọng trong cách hành xử để không trở thành kẻ bắt nạt và gây chiến với người yếu thế hơn mình."
      ],
      "2": [
        "2 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 2 = THẤU HIỂU Trưởng Thành số 2 giúp bạn nhận ra mình có năng lực để làm việc với người khác. Khả năng gây ảnh hưởng đến người khác tăng lên cũng như khả năng để nắm bắt tâm lý và cảm xúc người khác được cải thiện rất nhiều. Bạn có thể kết nối và tạo ra nhiều mối quan hệ chất lượng. Sự nhạy cảm cũng như sự khôn khéo và khả năng ngoại giao của bạn sẽ tăng lên. Bạn phù hợp với những công việc phía sau hậu trường, lựa chọn hướng dẫn nhẹ nhàng thay vì sử dụng vũ lực. Sự thấu hiểu giúp cho bạn ngày càng trở nên hòa nhập hơn và trở nên hạnh phúc hơn trong cuộc sống."
      ],
      "22": [
        "22/4 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 22/4 = SỰ TỰ TIN Trưởng Thành số 22/4 giúp bạn có một nền tảng vững chắc, trực giác nhạy bén, sự tự tin mới hình thành và sức mạnh cá nhân sâu sắc. Những công cụ này sẽ giúp bạn biến nhiều ước mơ thành hiện thực và để lại di sản cho gia đình của bạn và để lại những công trình nghiên cứu của bạn cho cộng đồng. Bạn có con số trưởng thành này khi có con số Đường đời 11/2 và con số sứ mệnh 11/2. Vào giai đoạn đầu, bạn sẽ gặp rất nhiều khó khăn, bạn cảm thấy xa lạ trong cuộc sống của chính mình. Theo thời gian bạn sẽ khám phá được sức mạnh tiềm ẩn bên trong và khả năng đưa ra những quyết định táo bạo để có được thành tựu to lớn."
      ],
      "3": [
        "3 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 3 = NGOẠI GIA O Trưởng Thành số 3 giúp bạn muốn thể hiện bản thân và tinh thần lạc quan về tương lai. Bạn dễ dàng bắt chuyện và làm quen với những người xa lạ một cách nhanh chóng. Nhiều điều may mắn sẽ đến với bạn trong cuộc sống. Bạn sẽ trở nên hòa đồng và hướng ngoại hơn. Khả năng giao tiếp của bạn sẽ được cải thiện cùng sự nổi tiếng và tiềm năng sáng tạo của bạn. Bạn có thể vẽ tranh, viết lách hoặc diễn xuất. Bạn sẽ biết cách chọn lọc mối quan hệ của mình, các mối quan hệ của bạn ngày càng chất lượng hơn."
      ],
      "4": [
        "4 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 4 = KẾ HOẠCH - THỰC TẾ Trưởng Thành số 4 giúp bạn tập trung hướng tới mục tiêu, loại bỏ các chi tiết không cần thiết và đi thẳng đến giải quyết vấn đề. Bạn không bao giờ nghĩ mình sẽ nghỉ hưu trong yên tĩnh. Bạn tham gia vào tất cả kế hoạch để có thể khiến mục tiêu của mình biến thành hiện thực. Bạn sẽ thấy mình trở thành người có kế hoạch, thực tế và có tổ chức hơn. Tránh việc quá cứng nhắc, không linh hoạt và cố chấp. Hãy nhớ dành thời gian để tận hưởng niềm vui."
      ],
      "5": [
        "5 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 5 = KẾT N ỐI Trưởng Thành số 5 giúp bạn trở nên năng động và linh hoạt hơn, sức ảnh hưởng của bạn cũng tăng lên. Bạn sẽ quan tâm đến nhiều lĩnh vực mà bạn chưa từng trải nghiệm trước đây. Bạn hay có cảm giác bồn chồn và thiếu tính kiên nhẫn. Du lịch, tự do và những sự kiện bất ngờ sẽ chi phối nửa sau cuộc đời bạn. Khả năng kể chuyện của bạn sẽ phát triển, và bạn sẽ trở nên độc đáo và thú vị hơn, dám chấp nhận rủi ro hơn. Hãy cẩn thận với việc phân tán năng lượng của bạn vào những thú vui không lành mạnh."
      ],
      "6": [
        "6 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 6 = QUAN TÂM Trưởng Thành số 6 giúp bạn trở nên quan tâm đến tình cảm gia đình, bạn bè và cộng đồng. Bạn dễ bị thu hút vào những công việc như chữa bệnh, tư vấn và giáo viên, công việc bảo vệ môi trường, tình nguyện hoặc chính trị. Gia đình, bạn bè và cộng đồng sẽ ngày càng quan tâm đến bạn. Bạn sẽ trưởng thành như một nhà hiền triết thông thái và có thể đưa ra lời khuyên cũng như sự an ủi cho những ai cần nó. Con số trưởng thành này hứa hẹn một tuổi già an toàn. Đây thường là những người con chăm sóc cha mẹ già và cũng là những người cha, người mẹ hy sinh và chăm sóc con cái rất chu đáo."
      ],
      "7": [
        "7 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 7 = CH UYÊN GIA Trưởng Thành số 7 giúp bạn đặt ra những câu hỏi về cuộc sống nhân sinh thông qua việc suy ngẫm, tìm hiểu và tự nghiên cứu. Bạn có thể chuyển sang triết học hoặc tôn giáo, có thể là huyền học. Nhưng bạn cũng xem xét mở rộng kiến thức của mình qua nhiều lĩnh vực hơn và chuyên sâu hơn. Vì bất kỳ lĩnh vực nào bạn tham gia thì bạn đều có thể đào sâu nó. Bạn có xu hướng thích sống ẩn dật và không màn thế sự. Trực giác của bạn phát triển mạnh mẽ hơn, thích phân tích những câu hỏi sâu sắc và sống theo đúng lý tưởng của mình. Bạn trở thành chuyên gia trong một lĩnh vực cụ thể."
      ],
      "8": [
        "8 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 8 = QUẢN LÝ TÀI CHÍNH Trưởng Thành số 8 giúp bạn tìm thấy sự thành công trong công việc và tích lũy tài chính. Bạn ngày càng muốn gắn bó dài lâu với công việc của mình. Bạn dễ dàng vượt qua những khó khăn trên con đường sự nghiệp của bản thân. Bạn biết cách tận dụng nguồn năng lượng của mình. Bạn tự tin hơn trong công việc kinh doanh, luôn học hỏi để phát triển và kiểm soát được tài chính. Mọi người xung quanh bạn đều công nhận rằng bạn chính là trụ cột và là một người vô cùng đáng tin cậy. Khi bạn có đầy đủ những thứ bạn cần thì bạn sẽ phải học cách tách khỏi ham muốn vật chất để dấn thân vào những mục tiêu cao hơn của nhân loại."
      ],
      "9": [
        "9 CHỈ SỐ TRƯỞNG THÀNH TRƯỞNG THÀNH 9 = CỘNG ĐỒNG Trưởng Thành số 9 giúp bạn ngày càng quan tâm hơn với xã hội. Bạn sẽ bị thu hút bởi các dịch vụ vì cộng đồng. Lợi ích lâu dài của cộng đồng và thậm chí của thế giới sẽ ngày càng chiếm trọn tâm trí bạn. Những điều mang đến sự tốt đẹp cho nhân loại luôn chiếm hữu tâm trí bạn. Trí tuệ, khiếu hài hước và tấm lòng nhân đạo của bạn đều sẽ phát triển lớn dần theo thời gian. Hoạt động tình nguyện và mối quan tâm đến nghệ thuật - văn hóa sẽ mang lại niềm vui cho bạn. Bạn sẽ cố gắng đóng góp những điều có giá trị lâu dài và các thế hệ sau sẽ được thừa hưởng từ những thành tựu của bạn."
      ]
    },
    "intro": [
      "TRƯỞNG THÀNH = SỨ MỆNH + ĐƯỜNG ĐỜI Chỉ số Trưởng thành của bạn chỉ ra mong muốn hay khao khát tiềm ẩn sẽ dần xuất hiện trong độ tuổi từ 30 đến 35. Khi bạn hiểu bản thân mình hơn, đặc tính của con số này sẽ bắt đầu xuất hiện. Càng hiểu về bản thân, bạn sẽ nhận thức rõ hơn mình là ai, mục tiêu cuộc sống là gì và muốn định hướng nào trong cuộc đời mình. Đây là món quà của sự trưởng thành và bạn sẽ không lãng phí thời gian và sức lực cho những thứ không đáng quan tâm. Cho dù bây giờ bạn bao nhiêu tuổi, thì cuộc sống cũng đang hướng bạn đến mục tiêu rất cụ thể. Mục tiêu này có thể xem như một phần thưởng hoặc thành quả của lời hứa ẩn chứa trong những nỗ lực hiện tại của bạn mà thông thường bạn không nhận ra. Chỉ số Trưởng thành bắt đầu có tác động sâu sắc đến cuộc sống của bạn sau độ tuổi 35. Ảnh hưởng của nó sẽ tăng dần khi bạn lớn tuổi thêm. Chỉ số này đóng vai trò quan trọng khi bạn lớn lên và hợp nhất với chỉ số Đường Đời và hình thành Sự nghiệp của nửa sau cuộc đời bạn. CHỈ SỐ TRƯỞNG THÀNH"
    ]
  },
  "passion": {
    "byValue": {
      "1": [
        "1 ĐAM MÊ 1 = THÍCH CHINH PHỤC Bạn là người luôn có nguồn động lực không giới hạn để thúc đẩy bạn phát huy tài năng và nổi bật. Bên trong bạn có nhiều tham vọng khá lớn và luôn muốn hoàn thành nó sớm nhất có thể. Bạn rất năng động và có khả năng sáng tạo tuyệt vời mà tạo hóa ban tặng, nên bất kỳ việc gì bạn cũng muốn trở thành người giỏi nhất và là người tiên phong hoàn thành nó. Bạn nắm bắt được tâm lý đám đông, có khả năng gây ảnh hưởng lên người khác và thao túng họ. Điều này nói lên khả năng chính trị của bạn cũng rất nổi bật. Nhưng khi còn trẻ ( trước 25 tuổi ) bạn thường có những lúc lại thiếu tự tin. Nếu bạn có nhiều số 1 (≥ 6 số) thì trở nên hung hăng, bạo lực, độc tài. CHỈ SỐ ĐAM MÊ"
      ],
      "2": [
        "2 ĐAM MÊ 2 = THÍCH SỰ BÌNH YÊN Bạn rất chu đáo, nhạy cảm và ấm áp nên bạn luôn là người thiết lập sự hợp giữa bạn bè và đồng nghiệp. Trong khi làm việc nhóm, bạn là người có vai trò kiến tạo hòa bình và giữ sợi dây liên kết cực tốt. Bạn mang trong mình sự nhạy cảm nên đôi khi khá rụt rè và nhút nhát và có nhiều nỗi sợ bên trong cần khắc phục, cho nên tìm kiếm một môi trường yên bình và dễ chịu là điều bạn muốn làm. Bạn có sự tự giác cao trong học tập, bạn thu thập nhiều nguồn thông tin cho mình bạn là người nho nhã và đặc biệt không thích sự ồn ào và những người thô lỗ. CHỈ SỐ ĐAM MÊ"
      ],
      "3": [
        "3 ĐAM MÊ 3 = THÍCH GIAO TIẾP Bạn bẩm sinh là người có sự đam mê về nghệ thuật, tài năng của bạn sẽ phát huy ở nhiều lĩnh vực về nghệ thuật như : sáng tác, diễn xuất, âm nhạc, hội họa. Bạn có thể trở nên nổi tiếng và là một người bạn tốt. Bạn rất giỏi truyền cảm hứng và động lực cho mọi người, bạn luôn là tâm điểm của những cuộc hội ngộ. Nên bạn rất thích giải trí và tham gia và các bữa tiệc. Bạn thể hiện năng khiếu bản thân rất tốt nên thường bạn sẽ thích sinh hoạt cộng đồng nhiều hơn. Bạn được trời phú cho một sức hấp dẫn và sức thu hút đáng kể. Bạn cần có kỷ luật và tập trung để tối đa tài năng của mình. Bạn phải đề phòng không để bản thân có tính ích kỷ và quá ham muốn sự thỏa mãn cảm tính. CHỈ SỐ ĐAM MÊ"
      ],
      "4": [
        "4 ĐAM MÊ 4 = THÍCH TRẢI NGHIỆM BÀI HỌC THỰC TẾ Bạn là người có quyết tâm, kiên trì và kỷ luật tự giác rất cao, nên đôi mắt của bạn luôn quan sát các chi tiết một cách nhạy bén. Với bạn mọi thứ phải có tổ chức và mục tiêu cụ thể trong khả năng của mình vì bạn là một người thực tế và có tính thiết thực. Mọi người đánh giá bạn vững chắc như một tảng đá và cũng rất đáng tin cậy vì bạn luôn có sự an toàn và ổn định theo lịch trình và bạn cũng không thích những điều bất ngờ. Bạn có sự tập trung cao độ khi làm việc, tuy nhiên bạn không quên tạo phúc lợi cho cộng đồng hay môi trường làm việc của bạn. CHỈ SỐ ĐAM MÊ"
      ],
      "5": [
        "5 ĐAM MÊ 5 = THÍCH SỰ TỰ DO - KẾT NỐI Bạn là người nuông chìu cảm xúc của mình, bạn luôn thỏa mãn các cảm giác mà bạn muốn. Bạn thích đổi mới, thực hiện những thử thách mới và thích đi du lịch là điều bạn luôn nghĩ trong đầu. Bạn có năng khiếu về ngôn ngữ và khá giỏi ăn nói nên bạn có khả năng thích nghi cao và linh hoạt. Bên cạnh đó bạn lại có khiếu hài hước và nhanh nhẹn nên lúc nào bạn cũng tháo vát và độc đáo, điều này làm cho bạn trở nên cực kỳ gợi cảm nhưng đôi khi lại bốc đồng. Khát vọng tự do bên trong bạn quá lớn nên khó ổn định và nếu bạn có quá nhiều số 5 (≥ 6 số) thường lạm dụng quá mức trong ăn uống, rượu bia, tình dục và ma túy. CHỈ SỐ ĐAM MÊ"
      ],
      "6": [
        "6 ĐAM MÊ 6 = THÍCH QUAN TÂM NGƯỜI KHÁC Bạn luôn là nơi mọi người tìm đến khi họ gặp khó khăn vì bạn là người hay giúp đỡ và luôn sẵn sàng lắng nghe những rắc rối của người khác. Bạn là người khá hào phóng và có tính nhân đạo rất cao nên bạn luôn mong muốn chăm sóc những người bạn yêu thương và cống hiến vì cộng đồng. Bạn là người duy tâm và có chính kiến mạnh mẽ, luôn cho mình là người có trách nhiệm và sữa lòng hy sinh nên đôi khi bạn phải cẩn thận để không trở thành tấm thảm chùi chân cho những người luôn tìm cách lợi dụng bạn. Bạn rất thích hợp để làm bác sĩ, giáo viên và người chữa lành. Trong gia đình nhỏ của bạn, bạn là một bậc phụ huynh và là một người vợ/chồng tuyệt vời. CHỈ SỐ ĐAM MÊ"
      ],
      "7": [
        "7 ĐAM MÊ 7 = THÍCH NGHIÊN CỨU VÀ ĐƯA RA GIẢI PHÁP Bạn có một bộ óc phát triển cao và có trực giác khá tốt, bạn là một người có trí tuệ và xử lý tốt những ý tưởng trừu tượng. Bạn rất dễ bị lôi cuốn về triết học và những điều siêu hình. Bạn đặc biệt thích ở một mình để chiêm nghiệm, thiền định và học tập nên bạn luôn là người sâu sắc với sự hiểu biết và có cái nhìn độc đáo. Bạn thường nghĩ ra những giải pháp độc đáo để giải quyết vấn đề. Bạn có thể rất đa nghi và hoài nghi về những điều vô căn cứ, nên bạn không thích lãng phí thời gian vào những việc tầm thường. Bạn có thể trở thành một chuyên gia và là người theo đuổi chủ nghĩa hoàn hảo. CHỈ SỐ ĐAM MÊ"
      ],
      "8": [
        "8 ĐAM MÊ 8 = THÍCH KINH DOANH - ĐẦU TƯ Thành công và những phần thưởng vật chất là động lực đối với bạn , khi bạn thành công bạn có xu hướng khoe khoang sự giàu có và thành công của bạn , đó cũng là điều thúc đẩy bạn nỗ lực. Bạn luôn tin tưởng rằng cứ nỗ lực sẽ được đền đáp, và bạn là người làm việc theo mục tiêu đặt ra. Khi vào công việc kinh doanh, bạn có thể áp đảo và gây ấn tượng với người khác về tầm nhìn và khả năng thiên phú về tài chính của bạn. Bạn là nhà quản lý và tổ chức bẩm sinh, cấp dưới thường rất yêu quý bạn. Bạn có khả năng đánh giá người khác với sự cảm nhận công bằng về điểm mạnh và điểm yếu của họ. CHỈ SỐ ĐAM MÊ"
      ],
      "9": [
        "9 ĐAM MÊ 9 = THÍCH CỐNG HIẾN - GIÚP ĐỠ CỘNG ĐỒNG Bạn là một người ấm áp, hào phóng và đam mê ,bạn luôn luôn làm tốt và vui vẻ tận hưởng trong bất kỳ bối cảnh nào. Điều bạn cho tuyệt vời nhất là được cống hiến và giúp đỡ người khác. Bạn là người yêu thích nghệ thuật; con số đam mê này thường được tìm thấy ở nhiều thiên tài sáng tạo. Bạn có thể bị cuốn và những giấc mơ và lý tưởng mà lại không thực tế, nhưng bạn có đủ lửa và nhiệt huyết để thu hút sự ủng hộ vì bạn có khả năng thuyết phục và hùng biện khá tốt. Bạn khao khát mãnh liệt đối với cái nhìn sâu sắc và kiến thức phổ quát điều này thúc đẩy để bạn làm việc một cách riêng tư và bạn khá độc lập. CHỈ SỐ ĐAM MÊ"
      ]
    },
    "intro": [
      "ĐAM MÊ = TẦN SỐ THĂNG HOA Đam mê là niềm yêu thích, khát khao theo đuổi đến cùng một lĩnh vực gì đó. Là động lực để các bạn có thể cống hiến hết mình và tận dụng toàn bộ thế mạnh, sở trường của mình để cống hiến cho lĩnh vực đó. Từ ĐAM MÊ gồm có 5 ký tự : D, A, M, M, E. Mỗi ký tự đều có một ý nghĩa riêng, được biểu đạt trong tiếng Anh. D: xuất phát từ chữ Definite nghĩa là xác định A: xuất phát từ chữ Advance nghĩa là đưa ra M: xuất phát từ Must do it nghĩa là phải hành động M: xuất phát từ More learning nghĩa là học hỏi thêm E : xuất phát từ Enthuse nghĩa là say mê. Hành trình đi đến thành công bao gồm việc xác định thế mạnh của bản thân, đưa ra quyết định đối với niềm đam mê của chính mình, trực tiếp bắt tay hành động và không ngừng học hỏi với niềm say mê. Khi theo đuổi được nó đến cùng, chắc chắn, bạn sẽ thu về rất nhiều những quả ngọt từ sự nỗ lực không ngừng đó. Những con số xuất hiện hai lần hoặc nhiều hơn trong tên của bạn đại diện cho một sức mạnh hoặc một khả năng cụ thể. Nó cũng đại diện cho lĩnh vực chuyên môn cụ thể hoặc một tài năng tập trung mà bạn có. Chỉ số Đam Mê tiết lộ tần số rung động mãnh liệt khiến bạn thăng hoa đến tột cùng. Bạn hãy kích hoạt con số này để giúp bản thân duy trì và phát huy được nguồn năng lượng vô tận bên trong và khiến bạn luôn tràn đầy năng lượng tích cực và luôn phấn khởi mỗi ngày. CHỈ SỐ ĐAM MÊ"
    ]
  },
  "soulInteraction": {
    "byValue": {
      "0": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 0 Chỉ số kết nối số 0 cho biết rằng nội tâm trùng với tương tác. Lúc này trường năng lượng của bạn sẽ đồng bộ từ trong ra ngoài. Suy nghĩ và hành động của bạn sẽ nhất quán và không bị mâu thuẫn. Bạn chỉ cần tập trung đúng con số nội tâm và tương tác để phát huy tốt những công việc mình đang làm và trở thành người giỏi nhất trong lĩnh vực ngành nghề mình đã chọn."
      ],
      "1": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 1 Bạn cần phải mạnh mẽ, tự tin khi thể hiện mình. Hãy hành động theo sự thôi thúc và khao khát bên trong bạn. Đôi khi bạn không thể chỉ dùng lý trí mà còn phải tin vào trái tim và trực giác của mình. Bạn cần phải thấu hiểu nội tâm và lắng nghe những gì trái tim mách bảo để giúp mình chinh phục mục tiêu và phát huy tốt tài năng của mình. Sự tự tin và rõ ràng về mục tiêu sống là điều cần thiết để giữ vững thế giới nội tâm của bạn được tốt hơn."
      ],
      "2": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 2 Bạn gặp khó khăn trong việc thể hiện bản thân và sợ người khác không hiểu và đánh giá sai về mình. Bạn cần phải kiên nhẫn, lắng nghe và thấu hiểu sẽ giúp bạn tự tin hơn và hành xử chuẩn mực hơn giúp bạn cân bằng được nội tâm bên trong và tương tác bên ngoài. Bạn có thể học về ngôn ngữ cơ thể để có thể thấu hiểu mọi người xung quanh và tự tin hơn khi thể hiện bản thân. Bạn cần làm mọi việc một cách cẩn thận, đối với bạn thì chậm mà chắc là lời khuyên tốt nhất cho bạn."
      ],
      "3": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 3 Bạn cần phải giúp cho nội tâm bình an hơn và vượt qua những thử thách. Đừng để điều gì ngăn cản bạn được vui vẻ, yêu đời và nhảy múa ca hát. Hãy thể hiện những cảm xúc hạnh phúc đến với mọi người, chia sẻ nhiều hơn và sự may mắn sẽ đến với cuộc đời bạn mỗi ngày. Hãy lạc quan chấp nhận những việc khó khăn ban đầu, đừng vội nản lòng trước thử thách. Thiền tịnh là điều có thể giúp bạn chữa lành và giảm đi những lo lắng thái quá gây mệt mỏi cho bạn."
      ],
      "4": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 4 Đừng ép mình đến những nơi ồn ào, nội tâm bạn sẽ có những phản kháng. Hãy lắng nghe nghiêm túc nội tâm của mình. Đừng để hành động đi ngược với nội tâm sẽ gây nên sự đấu tranh bên trong tâm trí của bạn. Hãy sống thực tế và lắng nghe những tiếng nói nhỏ trong đầu để cảm nhận được sự tương thích với những trải nghiệm bên ngoài giúp bạn có nhiều bài học tuyệt vời trên hành trang chinh phục ước mơ của mình. Hãy rèn luyện tính kỷ luật , biết quý trọng thời gian và áp dụng những phương pháp khoa học vào cuộc sống thì bạn sẽ phát triển rất nhanh."
      ],
      "5": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 5 Bạn giữ cho mình một lối suy nghĩ đi ngược lại số đông cũng là một điều tốt để bạn có hướng đi riêng. Nhưng bạn phải linh hoạt, thích ứng mọi hoàn cảnh để dễ dàng kết nối với nhiều người trong cuộc sống. Tin vào trực giác và những gì bạn cho là đúng cũng là điều tốt, tuy nhiên bạn cũng phải chấp nhận sự thay đổi để giúp cho bản thân phát huy được khả năng sáng tạo, tưởng tượng. Đừng giữ mình trong vùng an toàn, đôi khi cần một chút mạo hiểm, một chút liều lĩnh để đạt tới thành tựu lớn hơn."
      ],
      "6": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 6 Bạn hãy lắng nghe nhu cầu của bản thân và đừng quá nghiêm khắc với chính mình. Kiểm soát bản năng là một điều khá khó và bạn có thể làm tốt nhưng điều đó sẽ làm cho bạn bị giới hạn trong các mối quan hệ. Bạn cũng không nên quá lo lắng khi chưa kết nối với thế giới bên ngoài. Hãy thể hiện tình yêu thương, thấu hiểu và bao dung nhiều hơn đến với mọi người và đặt mình vào vị trí của họ thì bạn sẽ hiểu được họ và kết nối dễ dàng hơn. Dành tình cảm nhiều hơn cho gia đình và chia sẻ với bạn bè, đồng nghiệp, đừng ngại đưa ra ý kiến cá nhân của bạn."
      ],
      "7": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 7 Bạn hãy vận dụng lý trí, trực giác và óc phân tích của mình để thấu hiểu chính mình và những người xung quanh nhiều hơn. Cách tốt nhất là quan sát những người xung quanh và đặt mình vào vị trí của họ. Điều này sẽ giúp bạn cải thiện mối quan hệ với mọi người. Bạn cần tách ra khỏi đám đông và soi chiếu lại bản thân, dành thời gian một mình để chiêm nghiệm lại mọi thứ bạn sẽ thấy cuộc sống sâu sắc và ý nghĩa hơn rất nhiều. Bạn cần lắng nghe nội tâm cũng như tâm linh bên trong mình mách bảo để giúp khả năng tương tác, ứng xử của bạn ngày càng tốt hơn."
      ],
      "8": [
        "CHỈ SỐ KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC 8 Bạn cần phải cân bằng giữa vật chất và tâm linh, đừng vì tiền mà bất chấp làm những điều phi đạo đức. Hiểu rõ bản chất đúng của giá trị đồng tiền giúp bạn hòa hợp giữa thế giới nội tâm bên trong và thế giới bên ngoài. Sự an toàn của bạn là đảm bảo về tài chính trước tiên nhưng bạn nên nhớ đi đường tắc không phù hợp với bạn, nó khó dẫn bạn đến thành công. Cố gắng chăm chỉ và khắc phục sự trì hoãn bên trong bạn. Bạn là một nhà nhân đạo đầy tham vọng và bạn có khả năng thành công trên con đường sự nghiệp kinh doanh, đầu tư và quản trị tài chính cá nhân."
      ]
    }
  },
  "destinyLifePath": {
    "byValue": {
      "0": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 0 Chỉ số kết nối số 0 cho biết rằng bạn có ít nhất hai con số chủ chốt giống nhau. Bạn rất may mắn và có nhiều cơ hội để đạt được những tiến bộ. Qua hai con số lặp bạn sẽ thực sự dễ dàng thành công trong các lĩnh vực của cuộc sống. Bạn là người có suy nghĩ và hành động nhất quán. Bạn chỉ cần đi đúng con đường bạn chọn, luôn nỗ lực, cam kết hết mình để hoàn thành sứ mệnh và chinh phục mục tiêu cuộc đời bạn. Bạn nên hiểu rằng hành trình là điều quan trọng hơn cả đích đến, chỉ cần làm tốt từng việc nhỏ trên hành trình thì đích đến là điều chắc chắn."
      ],
      "1": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 1 Xây dựng niềm tin tuyệt đối vào chính mình. Xác định mục tiêu thật rõ ràng và nhất quán. Đứng trước khó khăn hãy giải quyết vấn đề bằng năng lực của mình. Hãy quyết đoán hơn, đừng cứ chạy vòng quanh, cứ thẳng thắn khi bày tỏ quan điểm và cảm xúc của mình. Luôn kiên định với quyết định chính mình. Bạn cần phải làm chủ tình huống thường xuyên hơn. Thoát khỏi lối mòn tư duy và tìm ra những cách làm sáng tạo. Đừng trở thành một người bình thường như cách mà mọi người mong muốn bạn làm vậy, hãy khác biệt và dám khẳng định bản thân. Bạn hãy mở lòng mình ra, học cách lắng nghe và hợp tác nhiều hơn."
      ],
      "2": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 2 Hãy thấu hiểu hơn các nhu cầu và mong chờ của người khác. Đừng gây ra xung đột, tranh cãi thường xuyên, hãy giữ hòa khí và cố gắng giúp mọi việc diễn ra suôn sẻ. Bạn phải sử dụng năng lực của mình để có thể gây ảnh hưởng đến người khác bằng các biện pháp giao tiếp nhẹ nhàng. Thay vì đối đầu, hãy học cách hợp tác, hòa đồng, bao dung và thấu hiểu nhiều hơn. Học cách hòa đồng và hợp tác với mọi người. Đừng ngại thể hiện tình yêu và sự quan tâm của bạn đến những người bạn thương mến."
      ],
      "3": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 3 Thả lỏng tâm trí và cơ thể của bạn. Một chút vui vẻ sẽ nạp lại năng lượng cho bạn. Hãy rộng lượng hơn với bản thân. Hãy chia sẻ những cảm xúc từ tận đáy lòng, ít ra là với người thân thiết nhất của bạn. Hãy luôn sống với tinh thần lạc quan và thái độ tò mò. Hãy phát huy tính sáng tạo và trí tưởng tượng phong phú đặc biệt là trong các bộ môn nghệ thuật như: nhảy múa, diễn xuất, thơ ca hoặc văn học. Hãy học cách tin tưởng vào bản thân. Hãy luôn nhiệt huyết, năng động và tràn đầy năng lượng. Đừng ngại thể hiện sự sáng tạo và trí tưởng tượng phong phú của mình. Chia sẻ những ý tưởng với bạn bè xung quanh và lắng nghe ý kiến của họ, bạn sẽ thấy mình đang dần đi đúng quỹ đạo."
      ],
      "4": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 4 Đừng trì hoãn. Bạn cần trở thành một người đáng tin cậy và đúng giờ hơn. Hãy sống thực tế, làm việc có phương pháp và có hệ thống hơn. Luôn theo dõi các chi tiết, tiến độ, tránh gây ra sự hỗn loạn. Làm việc vì những điều cơ bản của cuộc sống. Các hoạt động thể chất và hoạt động ngoài trời giúp bạn có nhiều sức khỏe. Hoặc bạn cũng có thể thử làm vườn, trồng cây để có thể gần gũi với thiên nhiên. Cho dù làm bất cứ công việc gì, hãy duy nghĩ thực thế, tổ chức rõ ràng và nghiêm túc hành động. Phát huy tính quy trình, kỷ luật và chuẩn mực, bạn sẽ dễ dàng hơn trên con đường hoàn thành sứ mệnh."
      ],
      "5": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 5 Hãy cố gắng cân bằng bản thân giữa hai thái cực: sự hy sinh vô hạn và tính vị kỷ. Đôi khi bạn quá coi trọng quyền lợi của bản thân mà quay lưng lại với những người khác. Trong công việc, bạn có thể hơi phụ thuộc quá vào các đồng nghiệp khác, hãy độc lập hơn. Cần xác định rõ vị trí và trách nhiệm của bản thân. Đừng ngại hòa mình vào các cuộc vui tập thể hoặc tự do khám phá, thể hiện bản thân. Những trải nghiệm mang đến cho bạn vốn sống giàu có, kinh nghiệm dày dặn giúp bạn phát triển trên con đường thực hiện sứ mệnh."
      ],
      "6": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 6 Con số kết nối này chỉ có thể được xây dựng thông qua việc phục vụ, tham gia nhiều hơn vào công việc của gia đình và cộng đồng với tinh thần trách nhiệm cao. Bạn có thể được xây dựng thông qua việc phục vụ, tham gia nhiều hơn vào công việc của gia đình và cộng đồng với tinh thần trách nhiệm cao. Bạn nên để khả năng sáng tạo của mình được phát triển tự do. Điểm mạnh là sự xuất hiện của bạn như một món quà và lan truyền niềm cảm hứng cho mọi người. Điểm yếu của bạn là không tuân theo quy định và thiếu sự nghiêm túc, bạn cần đưa ra kế hoạch cụ thể khi làm việc và cam kết đúng kỷ luật đặt ra."
      ],
      "7": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 7 Bạn luôn sẵn sàng đi tiên phong để có được những thứ bạn muốn, nhưng bạn cần phải lắng nghe và hợp tác nhiều hơn, tránh việc lạm dụng quyền và đưa cái tôi cá nhân lên quá cao. Bạn có lý tưởng sống vĩ đại và luôn muốn mang đến những điều tốt đẹp nhất cho thế giới. Nhưng bạn cần lưu ý cân bằng giữ xã hội và gia đình và đừng quên phải yêu bản thân của mình là điều trước tiên. Có hai thách thức mà bạn cần vượt qua: bạn cần khiêm tốn hơn và phải có trách nhiệm hơn với bản thân. Chăm sóc bản thân chính là điều cốt lõi."
      ],
      "8": [
        "CHỈ SỐ KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI 8 Sự kết hợp giữa số 9 và 1 Con số này chỉ là kết quả của tổ hợp 9 trừ đi 1, và vấn đề chủ chốt ở đây là hiểu được giá trị của đồng tiền. Tiền là một công cụ dùng để giao dịch, không hơn không kém. Sự kết hợp này cho thấy bạn là một người duy tâm. Đôi khi chủ nghĩa duy tâm của bạn đưa bản thân đi quá xa và không thực tế. Điều này thể hiện rõ nhất ở việc bạn không thích tiền. Đôi khi số 1 lấn át số 9, khiến người đó bị ám ảnh bởi thành công cá nhân. Tuy nhiên, phần lớn số 9 và số 1 khi đi cùng nhau sẽ cho thấy một nhà nhân đạo đầy tham vọng, người có tiềm năng thành công trên thế giới hoặc bất kỳ nghề nghiệp nào có kết nối và hoạt động quốc tế."
      ]
    }
  }
};

export const PINNACLE_CONTENT: { intro: string[]; dinh1: Record<string, string[]>; dinh2: Record<string, string[]>; dinh3: Record<string, string[]>; dinh4: Record<string, string[]> } = {
  "intro": [
    "BIỂU ĐỒ CHẶNG ĐƯỜNG ĐỜI",
    "Các chu kỳ đỉnh cao trong biểu đồ chặng đường đời là bốn chu kỳ dài hạn trên đường đời của bạn. Mỗi đỉnh cao xuất hiện một con số mang đến những cơ hội và thách thức trong giai đoạn chịu tác động năng lượng bởi con số đó. Khi bạn kết hợp với chỉ số đường đời và các chỉ số khác trên hồ sơ của bạn sẽ thấy rõ năng lượng tác động mạnh mẽ và chi phối bạn. Do đó bạn hãy tuân theo quy luật tự nhiên về sự vận hành năng lượng các con số đó để giúp mình nắm bắt được cơ hội phát triển đạt đến sự thành công. Đỉnh 1: Được kéo dài từ khi bạn chào đời cho đến khi 36 tuổi, trừ chỉ số Đường Đời. Đỉnh 2: Kéo dài từ kết thúc đỉnh 1 đến 9 năm tiếp theo trong cuộc đời bạn. Đỉnh 3: Kéo dài từ kết thúc đỉnh 2 đến 9 năm tiếp theo trong cuộc đời bạn. Đỉnh 4: Kéo dài từ kết thúc đỉnh 3 cho đến cuối đời."
  ],
  "dinh1": {
    "1": [
      "ĐỈNH 1",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "10": [
      "ĐỈNH 1",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "11": [
      "ĐỈNH 1 11/2",
      "Đây là một giai đoạn đầy thử thách mà bạn đang ở đỉnh điểm của sự nhạy cảm và trực giác. Có quá nhiều thứ đang diễn ra trong tâm lý của bạn khiến bạn có thể bị nhầm lẫn về phương hướng con đường sự nghiệp của mình. Đây là một giai đoạn phát triển rất lớn về tinh thần và cá nhân. Bạn sẽ thoát khỏi nó với một mục tiêu thật sự rõ ràng và hiểu biết sâu về cuộc sống. Đồng thời, đây cũng là giai đoạn đòi hỏi rất nhiều về tình cảm và tinh thần. Thử thách của bạn là giữ vững lập trường và gắn bó với hoài bão của mình. Bạn phải tìm ra giải pháp thực tế để giúp đỡ người khác, đồng thời phát triển bản thân để một ngày nào đó có thể phát huy những tài năng tiềm ẩn mà bạn có trong mình. Bạn sẽ giác ngộ về mặt tâm linh sâu sắc và có khả năng khai sáng, truyền động lực, truyền cảm hứng cho người khác."
    ],
    "13": [
      "ĐỈNH 1 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "14": [
      "ĐỈNH 1 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "16": [
      "ĐỈNH 1 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "19": [
      "ĐỈNH 1",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "2": [
      "ĐỈNH 1 2",
      "Đỉnh cao này khiến bạn trở nên cực kỳ nhạy cảm, trực quan và đầy sáng suốt. Đây là giai đoạn đòi hỏi sự kiên nhẫn và phát triển nhận thức bên trong. Bạn được yêu cầu sử dụng quyền lực và sự thuyết phục nhẹ nhàng để đạt đến những mục tiêu mong muốn. Sự hiểu biết sâu sắc của bạn về cảm xúc và động lực của người khác rất sắc nét đến mức bạn dường như nhìn thấy đúng cốt lõi của mọi việc. Bây giờ bạn là một nhà cố vấn tài ba, một nhà ngoại giao tuyệt vời và một người mang đến sự hòa bình. Thách thức của bạn trong giai đoạn này là mang lại sự cân bằng về hai mặt ở mọi hình thức và mọi cấp độ. Bạn sẽ nhận ra giá trị của cả hai mặt cho một cuộc tranh cãi và tìm ra được điểm chung mang đến sự hòa hợp."
    ],
    "22": [
      "ĐỈNH 1 22/4",
      "Đây là khoảng thời gian đòi hỏi tất cả sức mạnh cá nhân của bạn được thể hiện và được cung cấp cho bạn. Đồng thời, bạn phải đối mặt với nhiều thách thức to lớn, trong đó tất cả sức mạnh của bạn đều rất cần thiết. Bạn rất thực tế trong giai đoạn này. Cách tiếp cận vấn đề của bạn có bài bản nhưng táo bạo. Đây là giai đoạn mà bạn phải dấn thân vào, không bao bao giờ do dự trước những hậu quả có thể xảy ra. Đời sống cá nhân của bạn có thể sẽ lùi lại để nhường chỗ cho sự phấn khích, hào hứng theo đuổi giấc mơ. Bạn sẽ có những ý tưởng, sáng tạo và kiến tạo nên những giá trị tuyệt vời trong giai đoạn này và để lại cho mai sau. Thử thách của bạn là kiểm soát những tư duy cực đoan và luôn duy trì những nguồn năng lượng tích cực mang đến sự thành công, thịnh vượng."
    ],
    "3": [
      "ĐỈNH 1 3",
      "Đây là giai đoạn sáng tạo đỉnh cao. Sự thể hiện bản thân của bạn được nâng cao đáng kể. Tài năng sáng tạo và nghệ thuật của bạn sẽ đạt đến đỉnh điểm. Bạn thu hút bạn bè và những người ngưỡng mộ bạn bằng sự quyến rũ và bản tính hòa đồng của mình. Bạn có khả năng truyền cảm hứng và động lực cho mọi người. Năng lượng lạc quan của bạn khiến mọi người muốn làm việc cùng với bạn. Đây cũng là giai đoạn khá may mắn đến với bạn và gặp được nhiều quý nhân đến hỗ trợ và giúp bạn thành công. Bạn cũng mang lại sự may mắn đến cho người khác trong giai đoạn này. Thách thức trong giai đoạn này là phải biết quản trị cảm xúc và cân bằng cảm xúc khi bị tác động bởi những năng lượng tiêu cực. Bạn cần tập trung và có kỷ luật để tận dụng tối đa cơ hội và mang may mắn đến với bạn."
    ],
    "4": [
      "ĐỈNH 1 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "5": [
      "ĐỈNH 1 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "6": [
      "ĐỈNH 1 6",
      "Đây là giai đoạn bạn sẽ tham gia rất nhiều vào gia đình, bạn bè và cộng đồng của mình. Bạn phải đối mặt với sự gia tăng trách nhiệm và nghĩa vụ đối với tất cả những công việc, những mối quan hệ đến với cuộc đời bạn. Bạn là trung tâm của gia đình, là người mà mọi người tìm đến để an ủi, thấu hiểu và mong cầu bạn chữa lành cho họ. Bạn có thể cảm thấy gánh nặng được tăng lên khi bạn phải gánh vác sự chăm sóc của nhiều người. Đỉnh cao này tràn đầy tình yêu thương, sự gần gũi và ấm áp, nhưng bạn phải vươn lên trước những thử thách mà các mối quan hệ thân thiết mang lại. Đỉnh cao này \"đòi hỏi sự cân bằng\" mà bạn sở hữu, vì bạn có thể dễ dàng căng mình theo nhiều hướng và cuối cùng bạn cảm thấy kiệt sức trước những yêu cầu trong cộng đồng của mình. Bạn cần nạp năng lượng bằng chạy bộ và thiền định để không bị kiệt sức trước những năng lượng tiêu cực."
    ],
    "7": [
      "ĐỈNH 1 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "8": [
      "ĐỈNH 1 8",
      "Đây là giai đoạn tài năng của bạn sẽ được cải thiện rất nhiều để giải quyết thành công về các vấn đề kinh doanh và tài chính. Đây là thời điểm của sự phát triển vật chất, và cũng là thời điểm của sự mở rộng và phần thưởng. Đây chính là chu kỳ thu hoạch từ kinh doanh, đầu tư của bạn. Con số đỉnh cao 8 cũng làm gia tăng sức mạnh cá nhân của bạn. Bạn có tư duy nhạy bén và tầm nhìn xa. Đây là cơ sở thành công về mặt tài chính của bạn. Mọi người cảm nhận được sức mạnh và hiệu quả của bạn. Bạn có thể trở thành nhà điều hành và quản lý các tổ chức doanh nghiệp lớn. Bạn rất tự tin và hướng đến mục tiêu, ước mơ của mình. Thách thức của bạn là cân bằng giữa giá trị vật chất và tinh thần trong cuộc sống."
    ],
    "9": [
      "ĐỈNH 1 9",
      "Đây là giai đoạn mà bạn phải xác định với một số dự án lớn hơn hoặc mục tiêu lớn hơn. Sự hài lòng lớn nhất của bạn chính là hỗ trợ cho người khác cũng như cho chính bạn. Đỉnh cao này cũng là khoảng thời gian mà bạn sử dụng nguồn năng lượng của mình về phát triển trí tuệ và mang giá trị lớn hơn cho cộng đồng. Đây là thời điểm thuận lợi để phát triển tài chính và tiến triển trong các công việc kinh doanh. Đó cũng là giai đoạn mà bạn phải đối mặt với một thách thức lớn và bạn phải cống hiến hết mình cho nó. Bạn sẽ cảm thấy ý thức xã hội và lòng trắc ẩn đối với người khác được tăng lên đáng kể. Bạn sẽ muốn giúp đỡ những người kém may mắn hơn mình và bạn có thể sẽ đặt bản thân vào một số hoạt động xã hội và từ thiện. Đây là giai đoạn bạn cảm thấy có một tình yêu to lớn đối với cộng đồng, đất nước và thế giới của bạn."
    ]
  },
  "dinh2": {
    "1": [
      "ĐỈNH 2",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "10": [
      "ĐỈNH 2",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "11": [
      "ĐỈNH 2 11/2",
      "Đây là một giai đoạn đầy thử thách mà bạn đang ở đỉnh điểm của sự nhạy cảm và trực giác. Có quá nhiều thứ đang diễn ra trong tâm lý của bạn khiến bạn có thể bị nhầm lẫn về phương hướng con đường sự nghiệp của mình. Đây là một giai đoạn phát triển rất lớn về tinh thần và cá nhân. Bạn sẽ thoát khỏi nó với một mục tiêu thật sự rõ ràng và hiểu biết sâu về cuộc sống. Đồng thời, đây cũng là giai đoạn đòi hỏi rất nhiều về tình cảm và tinh thần. Thử thách của bạn là giữ vững lập trường và gắn bó với hoài bão của mình. Bạn phải tìm ra giải pháp thực tế để giúp đỡ người khác, đồng thời phát triển bản thân để một ngày nào đó có thể phát huy những tài năng tiềm ẩn mà bạn có trong mình. Bạn sẽ giác ngộ về mặt tâm linh sâu sắc và có khả năng khai sáng, truyền động lực, truyền cảm hứng cho người khác."
    ],
    "13": [
      "ĐỈNH 2 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "14": [
      "ĐỈNH 2 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "16": [
      "ĐỈNH 2 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "19": [
      "ĐỈNH 2",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "2": [
      "ĐỈNH 2 2",
      "Đỉnh cao này khiến bạn trở nên cực kỳ nhạy cảm, trực quan và đầy sáng suốt. Đây là giai đoạn đòi hỏi sự kiên nhẫn và phát triển nhận thức bên trong. Bạn được yêu cầu sử dụng quyền lực và sự thuyết phục nhẹ nhàng để đạt đến những mục tiêu mong muốn. Sự hiểu biết sâu sắc của bạn về cảm xúc và động lực của người khác rất sắc nét đến mức bạn dường như nhìn thấy đúng cốt lõi của mọi việc. Bây giờ bạn là một nhà cố vấn tài ba, một nhà ngoại giao tuyệt vời và một người mang đến sự hòa bình. Thách thức của bạn trong giai đoạn này là mang lại sự cân bằng về hai mặt ở mọi hình thức và mọi cấp độ. Bạn sẽ nhận ra giá trị của cả hai mặt cho một cuộc tranh cãi và tìm ra được điểm chung mang đến sự hòa hợp."
    ],
    "22": [
      "ĐỈNH 2 22/4",
      "Đây là khoảng thời gian đòi hỏi tất cả sức mạnh cá nhân của bạn được thể hiện và được cung cấp cho bạn. Đồng thời, bạn phải đối mặt với nhiều thách thức to lớn, trong đó tất cả sức mạnh của bạn đều rất cần thiết. Bạn rất thực tế trong giai đoạn này. Cách tiếp cận vấn đề của bạn có bài bản nhưng táo bạo. Đây là giai đoạn mà bạn phải dấn thân vào, không bao bao giờ do dự trước những hậu quả có thể xảy ra. Đời sống cá nhân của bạn có thể sẽ lùi lại để nhường chỗ cho sự phấn khích, hào hứng theo đuổi giấc mơ. Bạn sẽ có những ý tưởng, sáng tạo và kiến tạo nên những giá trị tuyệt vời trong giai đoạn này và để lại cho mai sau. Thử thách của bạn là kiểm soát những tư duy cực đoan và luôn duy trì những nguồn năng lượng tích cực mang đến sự thành công, thịnh vượng."
    ],
    "3": [
      "ĐỈNH 2 3",
      "Đây là giai đoạn sáng tạo đỉnh cao. Sự thể hiện bản thân của bạn được nâng cao đáng kể. Tài năng sáng tạo và nghệ thuật của bạn sẽ đạt đến đỉnh điểm. Bạn thu hút bạn bè và những người ngưỡng mộ bạn bằng sự quyến rũ và bản tính hòa đồng của mình. Bạn có khả năng truyền cảm hứng và động lực cho mọi người. Năng lượng lạc quan của bạn khiến mọi người muốn làm việc cùng với bạn. Đây cũng là giai đoạn khá may mắn đến với bạn và gặp được nhiều quý nhân đến hỗ trợ và giúp bạn thành công. Bạn cũng mang lại sự may mắn đến cho người khác trong giai đoạn này. Thách thức trong giai đoạn này là phải biết quản trị cảm xúc và cân bằng cảm xúc khi bị tác động bởi những năng lượng tiêu cực. Bạn cần tập trung và có kỷ luật để tận dụng tối đa cơ hội và mang may mắn đến với bạn."
    ],
    "4": [
      "ĐỈNH 2 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "5": [
      "ĐỈNH 2 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "6": [
      "ĐỈNH 2 6",
      "Đây là giai đoạn bạn sẽ tham gia rất nhiều vào gia đình, bạn bè và cộng đồng của mình. Bạn phải đối mặt với sự gia tăng trách nhiệm và nghĩa vụ đối với tất cả những công việc, những mối quan hệ đến với cuộc đời bạn. Bạn là trung tâm của gia đình, là người mà mọi người tìm đến để an ủi, thấu hiểu và mong cầu bạn chữa lành cho họ. Bạn có thể cảm thấy gánh nặng được tăng lên khi bạn phải gánh vác sự chăm sóc của nhiều người. Đỉnh cao này tràn đầy tình yêu thương, sự gần gũi và ấm áp, nhưng bạn phải vươn lên trước những thử thách mà các mối quan hệ thân thiết mang lại. Đỉnh cao này \"đòi hỏi sự cân bằng\" mà bạn sở hữu, vì bạn có thể dễ dàng căng mình theo nhiều hướng và cuối cùng bạn cảm thấy kiệt sức trước những yêu cầu trong cộng đồng của mình. Bạn cần nạp năng lượng bằng chạy bộ và thiền định để không bị kiệt sức trước những năng lượng tiêu cực."
    ],
    "7": [
      "ĐỈNH 2 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "8": [
      "ĐỈNH 2 8",
      "Đây là giai đoạn tài năng của bạn sẽ được cải thiện rất nhiều để giải quyết thành công về các vấn đề kinh doanh và tài chính. Đây là thời điểm của sự phát triển vật chất, và cũng là thời điểm của sự mở rộng và phần thưởng. Đây chính là chu kỳ thu hoạch từ kinh doanh, đầu tư của bạn. Con số đỉnh cao 8 cũng làm gia tăng sức mạnh cá nhân của bạn. Bạn có tư duy nhạy bén và tầm nhìn xa. Đây là cơ sở thành công về mặt tài chính của bạn. Mọi người cảm nhận được sức mạnh và hiệu quả của bạn. Bạn có thể trở thành nhà điều hành và quản lý các tổ chức doanh nghiệp lớn. Bạn rất tự tin và hướng đến mục tiêu, ước mơ của mình. Thách thức của bạn là cân bằng giữa giá trị vật chất và tinh thần trong cuộc sống."
    ],
    "9": [
      "ĐỈNH 2 9",
      "Đây là giai đoạn mà bạn phải xác định với một số dự án lớn hơn hoặc mục tiêu lớn hơn. Sự hài lòng lớn nhất của bạn chính là hỗ trợ cho người khác cũng như cho chính bạn. Đỉnh cao này cũng là khoảng thời gian mà bạn sử dụng nguồn năng lượng của mình về phát triển trí tuệ và mang giá trị lớn hơn cho cộng đồng. Đây là thời điểm thuận lợi để phát triển tài chính và tiến triển trong các công việc kinh doanh. Đó cũng là giai đoạn mà bạn phải đối mặt với một thách thức lớn và bạn phải cống hiến hết mình cho nó. Bạn sẽ cảm thấy ý thức xã hội và lòng trắc ẩn đối với người khác được tăng lên đáng kể. Bạn sẽ muốn giúp đỡ những người kém may mắn hơn mình và bạn có thể sẽ đặt bản thân vào một số hoạt động xã hội và từ thiện. Đây là giai đoạn bạn cảm thấy có một tình yêu to lớn đối với cộng đồng, đất nước và thế giới của bạn."
    ]
  },
  "dinh3": {
    "1": [
      "ĐỈNH 3",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "11": [
      "ĐỈNH 3 11/2",
      "Đây là một giai đoạn đầy thử thách mà bạn đang ở đỉnh điểm của sự nhạy cảm và trực giác. Có quá nhiều thứ đang diễn ra trong tâm lý của bạn khiến bạn có thể bị nhầm lẫn về phương hướng con đường sự nghiệp của mình. Đây là một giai đoạn phát triển rất lớn về tinh thần và cá nhân. Bạn sẽ thoát khỏi nó với một mục tiêu thật sự rõ ràng và hiểu biết sâu về cuộc sống. Đồng thời, đây cũng là giai đoạn đòi hỏi rất nhiều về tình cảm và tinh thần. Thử thách của bạn là giữ vững lập trường và gắn bó với hoài bảo của mình. Bạn phải tìm ra giải pháp thực tế để giúp đỡ người khác, đồng thời phát triển bản thân để một ngày nào đó có thể phát huy những tài năng tiềm ẩn mà bạn có trong mình. Bạn sẽ giác ngộ về mặt tâm linh sâu sắc và có khả năng khai sáng, truyền động lực, truyền cảm hứng cho người khác."
    ],
    "13": [
      "ĐỈNH 3 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "14": [
      "ĐỈNH 3 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "16": [
      "ĐỈNH 3 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "19": [
      "ĐỈNH 3",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "2": [
      "ĐỈNH 3 2",
      "Đỉnh cao này khiến bạn trở nên cực kỳ nhạy cảm, trực quan và đầy sáng suốt. Đây là giai đoạn đòi hỏi sự kiên nhẫn và phát triển nhận thức bên trong. Bạn được yêu cầu sử dụng quyền lực và sự thuyết phục nhẹ nhàng để đạt đến những mục tiêu mong muốn. Sự hiểu biết sâu sắc của bạn về cảm xúc và động lực của người khác rất sắc nét đến mức bạn dường như nhìn thấy đúng cốt lõi của mọi việc. Bây giờ bạn là một nhà cố vấn tài ba, một nhà ngoại giao tuyệt vời và một người mang đến sự hòa bình. Thách thức của bạn trong giai đoạn này là mang lại sự cân bằng về hai mặt ở mọi hình thức và mọi cấp độ. Bạn sẽ nhận ra giá trị của cả hai mặt cho một cuộc tranh cãi và tìm ra được điểm chung mang đến sự hòa hợp."
    ],
    "22": [
      "ĐỈNH 3 22/4",
      "Đây là khoảng thời gian đòi hỏi tất cả sức mạnh cá nhân của bạn được thể hiện và được cung cấp cho bạn. Đồng thời, bạn phải đối mặt với nhiều thách thức to lớn, trong đó tất cả sức mạnh của bạn đều rất cần thiết. Bạn rất thực tế trong giai đoạn này. Cách tiếp cận vấn đề của bạn có bài bản nhưng táo bạo. Đây là giai đoạn mà bạn phải dấn thân vào, không bao bao giờ do dự trước những hậu quả có thể xảy ra. Đời sống cá nhân của bạn có thể sẽ lùi lại để nhường chỗ cho sự phấn khích, hào hứng theo đuổi giấc mơ. Bạn sẽ có những ý tưởng, sáng tạo và kiến tạo nên những giá trị tuyệt vời trong giai đoạn này và để lại cho mai sau. Thử thách của bạn là kiểm soát những tư duy cực đoan và luôn duy trì những nguồn năng lượng tích cực mang đến sự thành công, thịnh vượng."
    ],
    "3": [
      "ĐỈNH 3 3",
      "Đây là giai đoạn sáng tạo đỉnh cao. Sự thể hiện bản thân của bạn được nâng cao đáng kể. Tài năng sáng tạo và nghệ thuật của bạn sẽ đạt đến đỉnh điểm. Bạn thu hút bạn bè và những người ngưỡng mộ bạn bằng sự quyến rũ và bản tính hòa đồng của mình. Bạn có khả năng truyền cảm hứng và động lực cho mọi người. Năng lượng lạc quan của bạn khiến mọi người muốn làm việc cùng với bạn. Đây cũng là giai đoạn khá may mắn đến với bạn và gặp được nhiều quý nhân đến hỗ trợ và giúp bạn thành công. Bạn cũng mang lại sự may mắn đến cho người khác trong giai đoạn này. Thách thức trong giai đoạn này là phải biết quản trị cảm xúc và cân bằng cảm xúc khi bị tác động bởi những năng lượng tiêu cực. Bạn cần tập trung và có kỷ luật để tận dụng tối đa cơ hội và mang may mắn đến với bạn."
    ],
    "4": [
      "ĐỈNH 3 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "5": [
      "ĐỈNH 3 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "6": [
      "ĐỈNH 3 6",
      "Đây là giai đoạn bạn sẽ tham gia rất nhiều vào gia đình, bạn bè và cộng đồng của mình. Bạn phải đối mặt với sự gia tăng trách nhiệm và nghĩa vụ đối với tất cả những công việc, những mối quan hệ đến với cuộc đời bạn. Bạn là trung tâm của gia đình, là người mà mọi người tìm đến để an ủi, thấu hiểu và mong cầu bạn chữa lành cho họ. Bạn có thể cảm thấy gánh nặng được tăng lên khi bạn phải gánh vác sự chăm sóc của nhiều người. Đỉnh cao này tràn đầy tình yêu thương, sự gần gũi và ấm áp, nhưng bạn phải vươn lên trước những thử thách mà các mối quan hệ thân thiết mang lại. Đỉnh cao này \"đòi hỏi sự cân bằng\" mà bạn sở hữu, vì bạn có thể dễ dàng căng mình theo nhiều hướng và cuối cùng bạn cảm thấy kiệt sức trước những yêu cầu trong cộng đồng của mình. Bạn cần nạp năng lượng bằng chạy bộ và thiền định để không bị kiệt sức trước những năng lượng tiêu cực."
    ],
    "7": [
      "ĐỈNH 3 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "8": [
      "ĐỈNH 3 8",
      "Đây là giai đoạn tài năng của bạn sẽ được cải thiện rất nhiều để giải quyết thành công về các vấn đề kinh doanh và tài chính. Đây là thời điểm của sự phát triển vật chất, và cũng là thời điểm của sự mở rộng và phần thưởng. Đây chính là chu kỳ thu hoạch từ kinh doanh, đầu tư của bạn. Con số đỉnh cao 8 cũng làm gia tăng sức mạnh cá nhân của bạn. Bạn có tư duy nhạy bén và tầm nhìn xa. Đây là cơ sở thành công về mặt tài chính của bạn. Mọi người cảm nhận được sức mạnh và hiệu quả của bạn. Bạn có thể trở thành nhà điều hành và quản lý các tổ chức doanh nghiệp lớn. Bạn rất tự tin và hướng đến mục tiêu, ước mơ của mình. Thách thức của bạn là cân bằng giữa giá trị vật chất và tinh thần trong cuộc sống."
    ],
    "9": [
      "ĐỈNH 3 9",
      "Đây là giai đoạn mà bạn phải xác định với một số dự án lớn hơn hoặc mục tiêu lớn hơn. Sự hài lòng lớn nhất của bạn chính là hỗ trợ cho người khác cũng như cho chính bạn. Đỉnh cao này cũng là khoảng thời gian mà bạn sử dụng nguồn năng lượng của mình về phát triển trí tuệ và mang giá trị lớn hơn cho cộng đồng. Đây là thời điểm thuận lợi để phát triển tài chính và tiến triển trong các công việc kinh doanh. Đó cũng là giai đoạn mà bạn phải đối mặt với một thách thức lớn và bạn phải cống hiến hết mình cho nó. Bạn sẽ cảm thấy ý thức xã hội và lòng trắc ẩn đối với người khác được tăng lên đáng kể. Bạn sẽ muốn giúp đỡ những người kém may mắn hơn mình và bạn có thể sẽ đặt bản thân vào một số hoạt động xã hội và từ thiện. Đây là giai đoạn bạn cảm thấy có một tình yêu to lớn đối với cộng đồng, đất nước và thế giới của bạn."
    ]
  },
  "dinh4": {
    "1": [
      "ĐỈNH 4",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "11": [
      "ĐỈNH 4 11/2",
      "Đây là một giai đoạn đầy thử thách mà bạn đang ở đỉnh điểm của sự nhạy cảm và trực giác. Có quá nhiều thứ đang diễn ra trong tâm lý của bạn khiến bạn có thể bị nhầm lẫn về phương hướng con đường sự nghiệp của mình. Đây là một giai đoạn phát triển rất lớn về tinh thần và cá nhân. Bạn sẽ thoát khỏi nó với một mục tiêu thật sự rõ ràng và hiểu biết sâu về cuộc sống. Đồng thời, đây cũng là giai đoạn đòi hỏi rất nhiều về tình cảm và tinh thần. Thử thách của bạn là giữ vững lập trường và gắn bó với hoài bảo của mình. Bạn phải tìm ra giải pháp thực tế để giúp đỡ người khác, đồng thời phát triển bản thân để một ngày nào đó có thể phát huy những tài năng tiềm ẩn mà bạn có trong mình. Bạn sẽ giác ngộ về mặt tâm linh sâu sắc và có khả năng khai sáng, truyền động lực, truyền cảm hứng cho người khác."
    ],
    "13": [
      "ĐỈNH 4 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "14": [
      "ĐỈNH 4 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "16": [
      "ĐỈNH 4 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "19": [
      "ĐỈNH 4",
      "1 ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU Đây là giai đoạn đòi hỏi khá nhiều sự độc lập, dũng cảm, mạnh mẽ, quyết đoán và chinh phục mục tiêu cuộc đời. Bạn phải đứng lên sau những khó khăn, thử thách của đỉnh cao này để có được sức mạnh ý chí. Bạn không có nhiều sự hỗ trợ từ người khác và gia đình nên phải tự dựa vào chính sức mạnh của mình. Bạn đừng quá tủi thân vì đây là bài học giúp bạn đứng vững một mình mà không cần sự giúp đỡ. Hãy tập trung vào ước mơ của bạn. Đỉnh cao này sẽ đòi hỏi một ý chí sắt đá để giữ vững mục tiêu. Đây cũng là giai đoạn hoàn thiện bản thân và trưởng thành nhanh chóng. Bạn phải tận dụng tất cả tài năng vốn có để chinh phục ước mơ của bạn. Nếu trùng với chỉ số Đường đời sẽ tăng cường năng lượng Đường đời giúp bạn phát huy mạnh mẽ con đường sự nghiệp của bạn."
    ],
    "2": [
      "ĐỈNH 4 2",
      "Đỉnh cao này khiến bạn trở nên cực kỳ nhạy cảm, trực quan và đầy sáng suốt. Đây là giai đoạn đòi hỏi sự kiên nhẫn và phát triển nhận thức bên trong. Bạn được yêu cầu sử dụng quyền lực và sự thuyết phục nhẹ nhàng để đạt đến những mục tiêu mong muốn. Sự hiểu biết sâu sắc của bạn về cảm xúc và động lực của người khác rất sắc nét đến mức bạn dường như nhìn thấy đúng cốt lõi của mọi việc. Bây giờ bạn là một nhà cố vấn tài ba, một nhà ngoại giao tuyệt vời và một người mang đến sự hòa bình. Thách thức của bạn trong giai đoạn này là mang lại sự cân bằng về hai mặt ở mọi hình thức và mọi cấp độ. Bạn sẽ nhận ra giá trị của cả hai mặt cho một cuộc tranh cãi và tìm ra được điểm chung mang đến sự hòa hợp."
    ],
    "22": [
      "ĐỈNH 4 22/4",
      "Đây là khoảng thời gian đòi hỏi tất cả sức mạnh cá nhân của bạn được thể hiện và được cung cấp cho bạn. Đồng thời, bạn phải đối mặt với nhiều thách thức to lớn, trong đó tất cả sức mạnh của bạn đều rất cần thiết. Bạn rất thực tế trong giai đoạn này. Cách tiếp cận vấn đề của bạn có bài bản nhưng táo bạo. Đây là giai đoạn mà bạn phải dấn thân vào, không bao bao giờ do dự trước những hậu quả có thể xảy ra. Đời sống cá nhân của bạn có thể sẽ lùi lại để nhường chỗ cho sự phấn khích, hào hứng theo đuổi giấc mơ. Bạn sẽ có những ý tưởng, sáng tạo và kiến tạo nên những giá trị tuyệt vời trong giai đoạn này và để lại cho mai sau. Thử thách của bạn là kiểm soát những tư duy cực đoan và luôn duy trì những nguồn năng lượng tích cực mang đến sự thành công, thịnh vượng."
    ],
    "3": [
      "ĐỈNH 4 3",
      "Đây là giai đoạn sáng tạo đỉnh cao. Sự thể hiện bản thân của bạn được nâng cao đáng kể. Tài năng sáng tạo và nghệ thuật của bạn sẽ đạt đến đỉnh điểm. Bạn thu hút bạn bè và những người ngưỡng mộ bạn bằng sự quyến rũ và bản tính hòa đồng của mình. Bạn có khả năng truyền cảm hứng và động lực cho mọi người. Năng lượng lạc quan của bạn khiến mọi người muốn làm việc cùng với bạn. Đây cũng là giai đoạn khá may mắn đến với bạn và gặp được nhiều quý nhân đến hỗ trợ và giúp bạn thành công. Bạn cũng mang lại sự may mắn đến cho người khác trong giai đoạn này. Thách thức trong giai đoạn này là phải biết quản trị cảm xúc và cân bằng cảm xúc khi bị tác động bởi những năng lượng tiêu cực. Bạn cần tập trung và có kỷ luật để tận dụng tối đa cơ hội và mang may mắn đến với bạn."
    ],
    "4": [
      "ĐỈNH 4 4",
      "Đây là đỉnh cao của sự chăm chỉ, chắc chắn, an toàn, thực tế. Bạn có cơ hội để xây dựng một nền tảng vững chắc. Khả năng của bạn với vai trò là người tổ chức, người quản lý, người cố vấn xây dựng quy trình, hệ thống cho tổ chức. Bạn là người đáng tin cậy và có thể dựa vào. Khả năng hoàn thành những trách nhiệm của bạn cũng được nâng cao. Nhờ vào kỹ năng và sự kiên trì mà thành công đã có thể nằm trong tầm tay của bạn. Đây là một quá trình mà bạn phải tiến lên từng bước một, trong quy trình đó bạn sẽ xây dựng bằng những viên gạch nhỏ được xếp lần lượt. Thách thức của bạn là phải trở nên linh hoạt và thích ứng. Học cách giải trí nhiều hơn và cho phép bản thân được tự do hơn."
    ],
    "5": [
      "ĐỈNH 4 5",
      "Đây là giai đoạn của sự tự do và có khả năng kết nối con người cũng như vạn vật. Bạn sẽ đi đến những nơi xa xôi, gặp gỡ những người mới và thú vị, trải nghiệm nhiều cuộc phiêu lưu. Bạn đang trong giai đoạn học hỏi cấp tốc và kinh nghiệm chính là người thầy của bạn. Khả năng ngôn luận của bạn được tăng lên đáng kể. Bạn có thể viết và nói một cách dễ dàng. Bạn có thể là một nhân viên bán hàng hoặc nhà quảng cáo đầy tiềm năng. Thử thách của bạn là ngăn bản thân trở thành một hòn đá cứ lao về phía trước. Bạn cần rèn luyện khả năng tập trung vào một lĩnh vực, nghề nghiệp hoặc mối quan hệ cụ thể giúp bạn thành công trong cuộc sống."
    ],
    "6": [
      "ĐỈNH 4 6",
      "Đây là giai đoạn bạn sẽ tham gia rất nhiều vào gia đình, bạn bè và cộng đồng của mình. Bạn phải đối mặt với sự gia tăng trách nhiệm và nghĩa vụ đối với tất cả những công việc, những mối quan hệ đến với cuộc đời bạn. Bạn là trung tâm của gia đình, là người mà mọi người tìm đến để an ủi, thấu hiểu và mong cầu bạn chữa lành cho họ. Bạn có thể cảm thấy gánh nặng được tăng lên khi bạn phải gánh vác sự chăm sóc của nhiều người. Đỉnh cao này tràn đầy tình yêu thương, sự gần gũi và ấm áp, nhưng bạn phải vươn lên trước những thử thách mà các mối quan hệ thân thiết mang lại. Đỉnh cao này \"đòi hỏi sự cân bằng\" mà bạn sở hữu, vì bạn có thể dễ dàng căng mình theo nhiều hướng và cuối cùng bạn cảm thấy kiệt sức trước những yêu cầu trong cộng đồng của mình. Bạn cần nạp năng lượng bằng chạy bộ và thiền định để không bị kiệt sức trước những năng lượng tiêu cực."
    ],
    "7": [
      "ĐỈNH 4 7",
      "Đây là giai đoạn phát triển nội tâm và tìm kiếm sự giác ngộ về tâm linh. Bạn sẽ giải quyết những câu hỏi quan trọng sâu sắc về sự tồn tại của cá nhân và ý nghĩa cuộc sống. Bạn sẽ cần thời gian ở một mình để chiêm nghiệm thế giới nội tâm của mình. Đây là thời điểm phát triển tâm linh. Bạn sẽ trải nghiệm một cảm giác đức tin cao độ. Sức mạnh của vũ trụ sẽ sánh vai cùng bạn. Bạn sẽ có đánh giá cao về thơ ca và thiên nhiên. Những chuyến đi bộ trong tự nhiên mang lại giá trị trị liệu và bồi bổ tinh thần rất lớn. Trong suốt giai đoạn này, sự phát triển về tinh thần, gia tăng kiến thức và trí tuệ là những phần thưởng lớn. Thách thức của bạn là đề phòng khả năng trở nên quá chỉ trích hoặc hoài nghi về người khác."
    ],
    "8": [
      "ĐỈNH 4 8",
      "Đây là giai đoạn tài năng của bạn sẽ được cải thiện rất nhiều để giải quyết thành công về các vấn đề kinh doanh và tài chính. Đây là thời điểm của sự phát triển vật chất, và cũng là thời điểm của sự mở rộng và phần thưởng. Đây chính là chu kỳ thu hoạch từ kinh doanh, đầu tư của bạn. Con số đỉnh cao 8 cũng làm gia tăng sức mạnh cá nhân của bạn. Bạn có tư duy nhạy bén và tầm nhìn xa. Đây là cơ sở thành công về mặt tài chính của bạn. Mọi người cảm nhận được sức mạnh và hiệu quả của bạn. Bạn có thể trở thành nhà điều hành và quản lý các tổ chức doanh nghiệp lớn. Bạn rất tự tin và hướng đến mục tiêu, ước mơ của mình. Thách thức của bạn là cân bằng giữa giá trị vật chất và tinh thần trong cuộc sống."
    ],
    "9": [
      "ĐỈNH 4 9",
      "Đây là giai đoạn mà bạn phải xác định với một số dự án lớn hơn hoặc mục tiêu lớn hơn. Sự hài lòng lớn nhất của bạn chính là hỗ trợ cho người khác cũng như cho chính bạn. Đỉnh cao này cũng là khoảng thời gian mà bạn sử dụng nguồn năng lượng của mình về phát triển trí tuệ và mang giá trị lớn hơn cho cộng đồng. Đây là thời điểm thuận lợi để phát triển tài chính và tiến triển trong các công việc kinh doanh. Đó cũng là giai đoạn mà bạn phải đối mặt với một thách thức lớn và bạn phải cống hiến hết mình cho nó. Bạn sẽ cảm thấy ý thức xã hội và lòng trắc ẩn đối với người khác được tăng lên đáng kể. Bạn sẽ muốn giúp đỡ những người kém may mắn hơn mình và bạn có thể sẽ đặt bản thân vào một số hoạt động xã hội và từ thiện. Đây là giai đoạn bạn cảm thấy có một tình yêu to lớn đối với cộng đồng, đất nước và thế giới của bạn."
    ]
  }
};

export const BIRTH_NAME_CHART_PAGES: string[][] = [
  [
    "BIỂU ĐỒ NGÀY SINH Biểu đồ ngày sinh tiết lộ điểm mạnh và hạn chế trong tính cách của bạn. Ý nghĩa được thể hiện thông qua vị trí các con số trong các hàng, cột và trên đường chéo. Số 1: Giúp bạn tự tin và độc lập thực thi mọi việc nếu bạn xuất hiện đủ 2 số trong biểu đồ. Nếu chỉ có 1 số thì thiếu tự tin còn từ 3 số trở lên thì cứng nhắc, độc đoán. Nếu số 1 bị cô lập thì làm bạn dễ mất tự tin khi đứng trước đám đông. Số 2: Giúp bạn kiên nhẫn và chu đáo trong mọi việc, có tính kiên trì cao. Số 3: Giúp bạn dễ dàng kết nối và giao tiếp tốt với những người xung quanh. Nếu số 3 bị cô lập bạn sẽ cảm thấy khó kết nối được với nhiều người. Số 4: Giúp bạn thấy thực tế mọi việc và có tính tổ chức cao, có tầm nhìn tốt. Số 5: Giúp bạn linh hoạt, khả năng thích ứng và kết nối tốt. Sẵn sàng học hỏi và dễ dàng thay đổi để thích nghi nhanh. Số 6: Giúp bạn có trách nhiệm với tất cả mọi thứ đến với cuộc đời bạn. Ngoài ra giúp bạn kích hoạt được trí tưởng tượng, sáng tạo độc đáo. Số 7: Giúp bạn tò mò, nghiên cứu, chiêm nghiệm và đúc kết nhiều bài học trong cuộc sống để thành bậc thầy tâm linh mạnh. Nếu số 7 bị cô lập thì tài năng của bạn khó được phát huy ra bên ngoài một cách dễ dàng. Số 8: Giúp bạn rèn luyện được khả năng quản lý tài chính cá nhân tốt và khao khát xây dựng địa vị, quyền lực của mình trong cuộc sống. Số 9: Giúp bạn sẵn sàng học hỏi và phát huy trí tuệ của mình. Mong muốn được chia sẻ những giá trị của mình đến với cộng đồng. Nếu số 9 bị cô lập thì trí tuệ của bạn cũng bị giới hạn và bao nhiêu hoài bão, khát vọng đều cảm thấy xa vời."
  ],
  [
    "BIỂU ĐỒ HỌ TÊN Biểu đồ họ tên cho bạn biết cường độ các con số trong họ tên của bạn xuất hiện nhiều nhất. Đây chính là chỉ số đam mê của bạn cũng là chỉ số giúp bạn kích hoạt được nguồn năng lượng hạnh phúc mỗi ngày giúp bạn thăng hoa đến tột cùng. Biểu đồ họ tên còn cho bạn biết những con số bị thiếu hoặc trống trong các ô vuông. Điều này giúp bạn thấy rõ mình cần phải phát triển bản thân bằng cách rèn luyện các số thiếu đó được nhắc đến trong chỉ số Bài Học Nghiệp. Nếu các con số thiếu đó bạn được tăng cường hoặc xuất hiện trong các chỉ số đường đời, sứ mệnh, trưởng thành, đam mê, nội tâm, tương tác, ngày sinh thì cũng giúp bạn dễ dàng kích hoạt trường năng lượng bởi con số thiếu đó. Biểu đồ họ tên được lấy từ trong họ, tên lót và tên. Từ đó cho biết các chỉ số quan trọng bổ trợ các con số còn thiếu trong biểu đồ ngày sinh nên việc đặt tên giúp cân bằng các con số để phát triển toàn diện về mặt thể chất và tinh thần là rất quan trọng đối với con người."
  ],
  [
    "BIỂU ĐỒ ĐƯỜNG MŨI TÊN ĐẦY ĐỦ",
    "Những con số xuất hiện trong biểu đồ ngày sinh và xuất hiện đủ cả 3 số thì hình thành nên một đường mũi tên. Từ đó thể hiện năng lực rõ nhất trong bạn. Đường Quyết Tâm 1-5-9: Giúp bạn Kiên định, quyết tâm vượt qua nghịch cảnh. Đường Tâm Linh 3-5-7: Giúp bạn ngày càng phát huy niềm tin tâm linh mạnh mẽ. Đường Kế Hoạch 1-2-3: Giúp bạn làm việc gì cũng phải có kế hoạch cụ thể, rõ ràng, có tính tổ chức, kỷ luật trong tất cả mọi việc. Đường Ý Chí 4-5-6: Giúp bạn luôn có ý chí mạnh mẽ để thực thi mọi việc. Đây cũng là đường rất quan trọng tạo ra được nguồn động lực mạnh mẽ trong bạn. Đường Hành Động 7-8-9: Sức chịu đựng tốt và sẵn sàng hành động tạo ra kết quả. Đường Thực Tế 1-4-7: Giúp bạn biết rõ năng lực của mình ở đâu và làm sao đạt được một cách dễ dàng và từng bước chứ không mơ mộng hão huyền. Đường Cân Bằng Cảm Xúc 2-5-8: Giúp bạn dễ dàng kiểm soát cảm xúc, cảm thông và lấy lại sự cân bằng nhanh nếu có bị tác động bởi môi trường. Đường Trí Tuệ 3-6-9: Giúp bạn có khả năng ghi nhớ, logic tốt và thông minh."
  ],
  [
    "Đường Thiếu Kế Hoạch Đường Trí Nhớ Ngắn Hạn Đường Trì Hoãn Đường Thụ Động Đường Nhạy Cảm Đường Hoài Nghi Đường Uất Giận Đường Thiếu Thực Tế BIỂU ĐỒ ĐƯỜNG MŨI TÊN TRỐNG",
    "Những con số trống trong biểu đồ ngày sinh và chỉ cần trống một số thì hình thành nên một đường mũi tên trống . Từ đó bạn hãy rèn luyện và cân bằng chúng. Đường Trì Hoãn 1-5-9: Thiếu động lực, dễ dàng từ bỏ mục tiêu. Đường Hoài Nghi 3-5-7: Thiếu tinh thần tâm linh, ít nhận thức cảm xúc hay nghi ngờ tất cả mọi việc. Đường Thiếu kế hoạch 1-2-3: Dễ nhầm lẫn, bối rối, thiếu tổ chức, kỷ luật, thiếu cam kết và hay hiểu lầm. Đường Uất Giận 4-5-6: Thiếu quyết đoán, hay thất vọng, dễ sinh ra bực bội, khó chịu và dễ bị tuột năng lượng khi bị thất bại trong cuộc sống. Đường Thụ động 7-8-9: Hay lưỡng lự, chần chừ, lười biếng, thiếu niềm tin. Đường Thiếu Thực tế 1-4-7: Hay mơ mộng viển vông và chi tiêu quá mức. Đường Nhạy Cảm 2-5-8: Cảm giác tự ti, sợ hãi và khao khát được chữa lành. Đường Trí Nhớ Ngắn Hạn 3-6-9: Thiếu tập trung, hay quên, thiếu thông cảm, không quan tâm và trốn tránh trách nhiệm."
  ]
];

export const OPENING_CONTENT: { letter: string[]; pythagoras: string[]; history: string[]; purpose: string[] } = {
  "letter": [
    "THƯ NGỎ Những gì sau đây bạn đọc không đơn thuần chỉ là thông tin của một quyển sách, mà nó là chiếc chìa khóa giải mã cuộc đời của bạn. Vì chính nó cũng đã giải mã cuộc đời của tôi và giúp tôi nhận ra được hướng đi tốt nhất để phát triển sự nghiệp của mình. Để giúp được nhiều người hơn, tôi đã dành thời gian nghiên cứu và kết hợp giữa thần số học Pythagoras và biểu đồ Ikigai của Nhật để cho ra sản phẩm tâm huyết “Thần số học định hướng sự nghiệp”. Khi bạn dùng “thần số học định hướng sự nghiệp” thì bạn phải lấy họ tên và ngày tháng năm sinh trên giấy khai sinh hoặc căn cước công dân của bạn, vì từ khi sinh ra và lớn lên bạn chịu ảnh hưởng mạnh nhất bởi năng lượng vũ trụ về những con số từ 1 đến 9 và có mối liên hệ mật thiết bởi các vì sao trên vũ trụ với cuộc đời mình. Cuối cùng, thần số học định hướng sự nghiệp chưa chắc có thể giúp bạn trở thành những vĩ nhân, nhưng nó sẽ giúp bạn thấu hiểu về bản thân, khám phá sức mạnh nội tại và lên kế hoạch định hướng phát triển sự nghiệp cho tương lai của bạn. Để đạt được sự thành công cần phải có sự nỗ lực rất nhiều trong việc tạo ra môi trường và nắm bắt được ý nghĩa của các con số tác động đến cuộc đời bạn qua các thời điểm từng năm và các chu kỳ. Và ngay bây giờ, chào mừng bạn đã bắt đầu cuộc hành trình chinh phục mục tiêu cuộc đời. Hãy cùng tôi sống một cuộc sống đầy ý nghĩa, hạnh phúc viên mãn! Chúc bạn thành công! Ths. Phạm Bá Nha - Giám đốc Học viện SGEN Education thân gửi! Chào",
    "NGUYỄN MINH ANH"
  ],
  "pythagoras": [
    "Thần số học (Numerology) là một chuyên ngành nghiên cứu về những con số và các tác động SÓNG RUNG của những con số thông qua Ngày tháng năm sinh và Họ tên đối với đời sống con người. Lĩnh vực nghiên cứu này xem xét ý nghĩa của các con số (và chữ cái) trong cuộc sống của bạn. Nó tổng hợp phức tạp của khoa học, thần thoại, triết học và là chìa khóa để giải mã Vũ trụ và tìm ra Mục đích cuộc đời bạn. Mỗi con số trên lịch chứa một năng lượng cụ thể. Các con số chứa đựng những rung động hay rung cảm riêng. Dù là ngày 1, 13 hay 22 của tháng và tùy thuộc vào vị trí của bạn trong chu kỳ cá nhân, mỗi ngày đều có một chủ đề và quy luật riêng. Khi tìm hiểu về thần số học, bạn sẽ nhận thấy năng lượng cá nhân của mình trong một ngày nhất định mạnh hơn so với những ngày khác. Những cái tên cũng có ý nghĩa quan trọng và sẽ được diễn giải cụ thể trong bài báo cáo của bạn. Ý NGHĨA THẦN SỐ HỌC PYTHAGORAS"
  ],
  "history": [
    "Thần số học phương Tây, hệ thống Pythagoras là một trong những phương pháp tự thân được hình thành lâu đời và phổ biến nhất. Người Trung Quốc, Nhật Bản, Hy Lạp, Ai Cập, Cơ đốc giáo, người Maya và Inca đều sử dụng hệ thống số học để tìm hiểu sâu hơn về bản thân và Vũ trụ. Thần số học được phát triển và biết đến nhiều hơn với tên tuổi của Pythagoras – Nhà Triết Học người Hy Lạp sinh vào thế kỷ thứ 6 trước Công Nguyên (năm 580 đến 572 TCN). Ông được biết đến là một nhà khoa học và Toán Học vĩ đại. Ông được xem là người đầu tiên nhận ra các con số có mối liên hệ giữa con người với Vũ Trụ. Thần số học được sử dụng như một phương pháp để tìm hiểu sâu hơn về bản chất của chính bạn như: tài năng và mục tiêu cuộc đời bạn; năng lực tiềm ẩn; điểm mạnh và điểm yếu của bạn; cơ hội và thách thức của bạn. Nó mang đến cho bạn một cái nhìn tổng quan và đa chiều về những điều sẽ xảy ra trong cuộc sống của mình. Nó mô tả các chu kỳ diễn ra trong cuộc đời bạn và giúp bạn định hướng sự nghiệp, chuyện tình cảm và đạt đến đỉnh cao của đời người. Ngày nay, Thần số học tiếp tục phát triển với sự hiện diện ở khắp mọi nơi như trên báo và tạp chí. Các chuyên gia Thần số học dần nhận được sự tín nhiệm khi được tham khảo ý kiến trong lĩnh vực công việc, tình cảm, hôn nhân,.. Có nhiều lý do cho sự tồn tại bền lâu của hệ thống kì diệu này. Nói một cách đơn giản là vì nó có độ chính xác cao. Đã có nhiều người không nghĩ rằng thuật toán có thể dự đoán chính xác những khả năng, sự kiện có thể xảy ra trong tương lai. Ẩn chứa bên trong bộ môn khoa học tâm linh này là nguồn gốc tri thức lâu đời, kiến thức sâu rộng của vũ trụ mà mọi người phải thấu hiểu, tôn trọng và có cái nhìn trực quan. Thần số học dễ dàng tiếp cận với mọi người. LỊCH SỬ RA ĐỜI THẦN SỐ HỌC PYTHAGORAS"
  ],
  "purpose": [
    "Giúp bạn khai thác tiềm năng lớn nhất của mình. Hướng dẫn bạn hiểu rõ về bản thân và những người xung quanh, khai thác trực giác của bạn, đưa ra những lựa chọn thông minh hơn, tối đa hóa tiềm năng của bạn vào những ngày nhất định trong những năm nhất định. Giúp bạn hiểu được khả năng hòa hợp của bạn và người yêu, tận dụng thời điểm tốt và quyết định khi nào cần hành động và khi nào cần chờ đợi. Giúp bạn khám phá tài năng, những khả năng thiên bẩm mà mình được ban tặng, hiểu được chu kỳ cuộc đời và phát hiện ra những bài học nghiệp và nợ nghiệp, và nắm bắt sự thay đổi. Ngoài ra còn tiết lộ những đặc điểm tính cách và những trở ngại tiềm ẩn trong cuộc sống cho cả bạn và những người khác cũng như cho biết những hành động tốt nhất để thực hiện. Giúp bạn nhìn lại quá khứ. Khi suy ngẫm về các sự kiện của cuộc đời mình và cách chúng diễn ra trong các chu kỳ số, bạn sẽ hiểu rõ tường tận nguyên nhân mọi việc. Bên cạnh đó bạn có thể biết được những gì bạn sắp trải qua từng năm/tháng/ngày cụ thể để hướng chu kỳ cuộc sống dễ dàng hơn. Bạn có thể dự đoán và chuẩn bị cho những thử thách sắp tới cũng như tận dụng các cơ hội tuyệt vời và đầy tiềm năng. Tất cả sẽ được lý giải thông qua hồ sơ cốt lõi của bạn dưới đây và ở trong bài báo cáo này chúng tôi đã kết hợp với một bộ công cụ tuyệt vời của người Nhật - Ikigai giúp bạn định hướng sự nghiệp một cách đúng đắn và chuẩn xác nhất. Chúc mừng bạn bắt đầu khám phá và chinh phục mục tiêu cuộc đời của mình. MỤC ĐÍCH BÀI BÁO CÁO SỐ HỌC ĐỊNH HƯỚNG SỰ NGHIỆP"
  ]
};

export const CAREER_INTRO: string[] = [
  "CHƯƠNG 3 ĐỊNH HƯỚNG SỰ NGHIỆP MỤC ĐÍCH CUỘC ĐỜI",
  "Mỗi ngành nghề được sinh ra để đáp ứng cho nhu cầu sống của con người. Đôi khi bạn sẽ không biết mình nên chọn ngành nghề nào cho phù hợp với khả năng của mình và mục đích của cuộc đời là làm gì? Khi chúng ta sinh ra thì chúng ta chịu ảnh hưởng bởi năng lượng vũ trụ và bên cạnh đó là sự tác động của các con số hình thành nên tính cách và hành động của mỗi chúng ta. Nên chương 3 thần số học sẽ cho chúng ta biết được mục đích cuộc đời và định hướng sự nghiệp của mỗi người thông qua các con số của ngày tháng năm sinh và tên họ."
];

export const CONCLUSION_CONTENT: string[] = [
  "CHƯƠNG 5 KẾT LUẬN",
  "Chúc mừng bạn vừa khám phá xong hành trình chạm sâu vào thế giới của chính mình, bạn đã thấu hiểu bản thân mình thông qua thế giới bên trong và thế giới bên ngoài. Từ đó, bạn biết cách phát triển bản thân mỗi ngày. Bên cạnh đó bạn đã biết được mục đích cuộc đời và nguồn lực để hỗ trợ cho bạn, Hãy tận dụng năng lượng mà các con số này mang lại, bạn sẽ hoàn thành xuất sắc sứ mệnh cuộc đời và vượt ngưỡng bản thân với những thành quả tuyệt vời. Niềm tin là điều quan trọng nhất trên hành trình phát triển bản thân của bạn! Hãy cho phép bản thân bạn tin về khả năng của mình thông qua những con số! Buông bỏ những niềm tin tiêu cực, những rào cản vô hình, lựa chọn những tinh chất tốt đẹp để gieo trồng niềm tin tích cực bên trong mình. Đó là điều mà chúng tôi muốn nhắn gửi đến người đang cầm trên tay cuốn sách này. Tìm ra năng lực bên trong bạn cũng giống như tìm thấy những hạt giống ưu tú. Nhiệm vụ còn lại của bạn là nuôi dưỡng, chăm sóc hạt giống ấy trong môi trường phù hợp. Trên hành trình cuộc đời, bạn phải nỗ lực học tập, rèn luyện không ngừng để sống một cuộc đời đầy giá trị, đánh thức con người phi thường bên trong bạn. Cuốn sách vừa kết thúc và hành trình mới của bạn chính thức được bắt đầu = hành trình của việc học tập, huấn luyện và phát triển bản thân để trở thành phiên bản tốt nhất của chính mình."
];

export const IKIGAI_INTRO: string[] = [
  "BIỂU ĐỒ IKIGAI MỤC ĐÍCH CUỘC ĐỜI",
  "Ikigai là một từ trong tiếng Nhật mô tả niềm vui và ý nghĩa của cuộc sống. Xét về từ nguyên, từ này gồm hai phần \"iki\" - sống và \"gai\" - lý do. Đây là công cụ giúp bạn tìm ra mục đích sống trong cuộc đời khi phối các con số ĐAM MÊ, SỨ MỆNH, SỰ NGHIỆP, CHUYÊN MÔN và tìm ra điểm cân bằng giữa chúng cũng như tìm ra sở trường mạnh nhất của bạn để phát huy tạo ra thu nhập cao và mang lại giá trị cho xã hội cũng như sống một cuộc đời đầy ý nghĩa. Trong bản ebook thần số học định hướng sự nghiệp này sẽ giúp bạn tìm ra điểm cân bằng và điểm mạnh nhất của mình đặc biệt trong bộ số của bạn có Bộ Tam Thần Thánh (tổ hợp tâm trí; tư duy kinh doanh; sáng tạo) thì bạn sẽ phát huy một cách toàn diện tài năng của bạn. Bạn mạnh bộ nào thì hãy tập trung phát huy chúng để phát triển bản thân sớm đạt đến sự thành công. Ngoài ra cũng cần kết hợp ý nghĩa các đường mũi tên trong biểu đồ ngày sinh để kiểm tra bản thân cần bổ trợ con số nào thiếu giúp bản thân ngày càng hoàn thiện và phát triển vượt bậc."
];
