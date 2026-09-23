/** Kết quả 64 quẻ, chép từ bảng “BẢNG TỔNG HƠP 64 QUẺ KINH DỊCH” trong tài liệu nội dung SGEN 22/09/2026. */
export type IChingDocumentReading = { pair: string; name: string; meaning: string; finance: string; career: string; health: string; relationship: string };
export const ICHING_DOCUMENT_READINGS: Record<number, IChingDocumentReading> = {
  "1": {
    "pair": "1/1",
    "name": "Thiên Vi Càn",
    "meaning": "Sáng tạo, Thành công, Sức mạnh, Dương. NHÂN - NGHĨA - TRÍ - DŨNG",
    "finance": "Có một số tiền khá lớn.",
    "career": "Cương quyết, sáng tạo, Thành công. Trực giác rất nhạy cảm.",
    "health": "Rất tốt. Chú ý bệnh về hô hấp: Viêm họng, viêm phế cấp, tiêu hóa, tiêu chảy, đau thắt lưng.",
    "relationship": "Thành công về mặt tình cảm. Tránh lạm dụng quyền hành với người bạn đời."
  },
  "2": {
    "pair": "8/8",
    "name": "Địa Vi Khôn",
    "meaning": "Thụ động, Mềm mỏng, Ngoại Giao, Âm",
    "finance": "Sự trông mong tiền sẽ đến nhưng chậm",
    "career": "Thích hợp Kinh Doanh, hoạt động sáng tạo.",
    "health": "Ăn kiêng tránh béo phì. Chú ý đường hô hấp, Viêm phế quản mãn tính, tiểu đường, tiêu hóa.",
    "relationship": "Làm quen trở lại."
  },
  "3": {
    "pair": "6/4",
    "name": "Thủy Lôi Truân",
    "meaning": "Gian lao, Khó khăn ban đầu, nguy hiểm.",
    "finance": "Coi chừng mất tiền và khó có thể tìm lại được.",
    "career": "Khó khăn ban đầu. Cần kiên nhẫn và có sự trợ giúp bên ngoài mới thành công.",
    "health": "Chú ý huyết áp cao.",
    "relationship": "Hãy bình tĩnh. Bạn đừng cảm thấy quá cô đơn. Cố gắng có thêm bạn bè để hỗ trợ."
  },
  "4": {
    "pair": "7/6",
    "name": "Sơn Thủy Mông",
    "meaning": "Điên cuồng tuổi trẻ, mù quáng, liều lĩnh.",
    "finance": "Đầu tư cần tham khảo ý kiến người có kinh nghiệm để tránh mất tiền.",
    "career": "Hấp tấp, thiếu suy nghĩ, bốc đồng sẽ đem lại đe dọa và mất mát.",
    "health": "Giữ điều độ trong ẩm thực, cuộc sống lứa đôi. Chú ý: Tùy, Thận, Đại tràng.",
    "relationship": "Nên tìm nhà cố vấn trong mối quan hệ."
  },
  "5": {
    "pair": "6/1",
    "name": "Thủy Thiên Nhu",
    "meaning": "Chờ đợi, nhẫn nại, sự kiên nhẫn dẽo dai.",
    "finance": "Tránh tiêu xài phung phí trong lúc này, sẽ có khó khăn tài chính trong nhất thời nhưng được quý nhân giúp đỡ.",
    "career": "Mọi việc sẽ tốt đẹp trong tương lai nhưng phải học cách kiên nhẫn chờ đợi. Tránh mọi việc tranh chấp, cải vã.",
    "health": "Ăn uống kiêng cử.Chú ý đến Phổi, Gan, Thận.",
    "relationship": "Phải bình tĩnh, kiên hẫn nhịn nhục với nhau nếu không sẽ bị đỗ vỡ bởi những lười đồn cũng như những kẻ ác mồm ác miệng cố tình gây xào xáo trong gia đình bạn."
  },
  "6": {
    "pair": "1/6",
    "name": "Thiên Thủy Tụng",
    "meaning": "Sự Tranh chấp, nghi ngờ, bất đồng, kiện cáo.",
    "finance": "Thua thiệt, mất mát tiền bạc, lỗ vốn",
    "career": "Khó khăn. Dĩ hòa di quý. Tránh mạo hiểm. Không nên làm ăn lớn.",
    "health": "Tâm lý bị xao động ảnh hưởng sức khỏe. Chú ý bệnh ở đường hô hấp, đau mỏi thắc lưng, tức giận làm đau nhói bên hông",
    "relationship": "Sự chia tay/ Phản bội/ Bất nghĩa/ Xảo trá/ Sự ra đi đột ngột"
  },
  "7": {
    "pair": "8/6",
    "name": "Địa Thủy Sư",
    "meaning": "Quân đội, chỉ huy, bạo loạn, đau khổ.",
    "finance": "Hiện chưa có nhiều tiền, đừng tiêu pha hoang phí.",
    "career": "Không nên làm việc gì có tính may rủi, phải xem xét cẩn thận. Bạn tỏ ra vững vàng bạn sẽ thành công.",
    "health": "Đầy nghị lực và tràn đầy sinh lực.",
    "relationship": "Nếu bạn đã có gia đình thì các khó khăn sẽ không còn nữa. Nên kết giao với nhiều người."
  },
  "8": {
    "pair": "6/8",
    "name": "Thủy Địa Tỷ",
    "meaning": "Tương trợ, hòa thuận, tập hợp, thống nhất.",
    "finance": "May mắn. Có quý nhân giúp đỡ. Nên từ thiện. Ước mơ sẽ thành hiện thực.",
    "career": "Chân thật và liêm khiết sẽ thành công và may mắn.",
    "health": "Khỏe mạnh, yêu đời. Ăn uống điều độ, chơi thể thao.",
    "relationship": "Xích lại gần nhau. Yêu thương và thành thật."
  },
  "9": {
    "pair": "5/1",
    "name": "Phong Thiên Tiểu Súc",
    "meaning": "Sức Ngăn trở nhỏ, ngưng trệ, kìm hãm",
    "finance": "Chờ đợi thêm thời gian nữa mới có tiền",
    "career": "Hợp tác với người khác và Tránh phô trương.",
    "health": "Tránh phẩu thuật. Kiêng cử.",
    "relationship": "Chờ đợi/ Nhượng bộ hoặc cắt đứt nếu chưa lập gia đình"
  },
  "10": {
    "pair": "1/2",
    "name": "Thiên Trạch Lý",
    "meaning": "Chọn lựa lối đi, cách cư xử nhẹ nhàng tế nhị.",
    "finance": "Kiên nhẫn và chờ đợi thêm một thời gian nữa, cần tiết kiệm chi tiêu.",
    "career": "Không nên quyết định một cách vội vàng Và đừng nên cho rằng nhận định của mình là tuyệt đối đúng",
    "health": "Tránh làm việc quá sức, sống buông thả. Cần luyện tập thể dục dưỡng sinh thường xuyên và kỷ luật. Chú ý đường hô hấp và Thận",
    "relationship": "Xung quanh bạn là những người lương thiện.Không nên làm họ Tự Ái và mất lòng. Loại bỏ mọi sự ích kỷ trong quan hệ tình ái."
  },
  "11": {
    "pair": "8/1",
    "name": "Địa Thiên Thái",
    "meaning": "Thái Bình, Phồn Vinh, Hòa Hợp, Cân bằng",
    "finance": "Phát tài",
    "career": "Phồn vinh, Thịnh vượng",
    "health": "Rất tốt. Chú ý ăn kiêng",
    "relationship": "Hòa hợp"
  },
  "12": {
    "pair": "1/8",
    "name": "Thiên Địa Bỉ",
    "meaning": "Bế tắc, đình trệ, suy thoái, tan rã, bất động",
    "finance": "Chưa được may mắn. Không nên đầu tư tiền bạc. Chỉ có thua lỗ và mất mát.",
    "career": "Đình trề, suy thoái. Không nên dấn thân vào công việc làm ăn mới.",
    "health": "Đang suy giảm. Cần nghỉ ngơi.",
    "relationship": "Chia sẽ, suy thoái. Đang đến hồi kết thúc."
  },
  "13": {
    "pair": "1/3",
    "name": "Thiên Hỏa Đồng Nhân",
    "meaning": "Cộng đồng, Liên kết, Gắn bó, đồng tâm",
    "finance": "Có Lợi Lộc trong hợp tác với người khác, cần tiết kiệm chi tiêu.",
    "career": "Thuận lợi, lợi tức tăng. Thích hợp cộng đồng. Khách hàng phát triển.",
    "health": "Sức khỏe tốt. Chú ý đến Tim của bạn.",
    "relationship": "Được mến mộ/ Cuộc sống lứa đôi được thăng tiến. Chú ý ích kỷ cá nhân làm mất đoàn kết."
  },
  "14": {
    "pair": "3/1",
    "name": "Hỏa Thiên Đại Hữu",
    "meaning": "Có nhiều, sung túc, giàu có, nổi tiếng",
    "finance": "Giàu có, sung túc. Nên chia sẻ bớt người nghèo khó.",
    "career": "Thời vận đã đến, bạn sẽ trở nên quá giàu. Công việc thuận lợi, thành công.",
    "health": "Dồi dào. Chú ý béo phì. Theo dõi huyết áp cao, tim mạch, mỡ trong máu.",
    "relationship": "Có nhiều mối quan hệ tốt. Sai lầm duy nhất có thể là bạn đòi hỏi nhiều hơn ở họ là sự cung phụng."
  },
  "15": {
    "pair": "8/7",
    "name": "Địa Sơn Khiêm",
    "meaning": "Khiêm nhường, mềm mỏng, giản dị.",
    "finance": "Thu hoạch còn ít, cần phải tiết kiệm chi tiêu.",
    "career": "Thành đạt sẽ tới. Bạn nên kiểm soát cảm xúc để có một nhận định khách quan.",
    "health": "Nên theo một chế độ kiêng cử chặc chẽ.",
    "relationship": "Bạn được yêu thương nhờ sự kiên trì của bạn."
  },
  "16": {
    "pair": "4/8",
    "name": "Lôi Địa Dự",
    "meaning": "Hân hoan, Chiến thắng, nhiệt tâm.",
    "finance": "Được thăng chức và tăng lương. Phát tài trong đầu tư.",
    "career": "Thành công vang dội. Được làm điều bạn thích.",
    "health": "Đề phòng bệnh tiêu hóa: trúng thực, tiêu chảy. Cần ăn chay để tránh xơ vữa động mạch vành hay chứng béo phì.",
    "relationship": "Có một cuộc tình vui vẻ. Hấp dẫn được người mình muốn."
  },
  "17": {
    "pair": "2/4",
    "name": "Trạch Lôi Tùy",
    "meaning": "Kế thừa, nối nghiệp, gia nhập, tự nguyện.",
    "finance": "Phải nghiên cứu cẩn thận và chờ thời cơ thuận lợi.",
    "career": "Tuân theo sự biến đổi dòng chảy của xã hội bạn sẽ thành công một cách dễ dàng.",
    "health": "Sức khỏe tốt, nhưng cũng cần chú ý đến gan của bạn.",
    "relationship": "Bạn sẽ gặp được người mình hằng mơ ước."
  },
  "18": {
    "pair": "7/5",
    "name": "Sơn Phong Cổ",
    "meaning": "Sửa sai, cải tiến, suy tính, lo toan.",
    "finance": "Chưa được phát đạt lắm, vận may chưa đến với bạn.",
    "career": "Bạn có nhiều cơ hội để sửa sai nếu đã lầm đường. Các thay đổi không phải một sớm một chiều. Lâu ngày mọi việc sẽ ổn thỏa.",
    "health": "Chú ý sức khỏe giúp bạn vượt qua các khó khăn. Hãy chơi thể thao.",
    "relationship": "Lập lại trật tự trong mối quan hệ"
  },
  "19": {
    "pair": "8/2",
    "name": "Địa Trạch Lâm",
    "meaning": "Trưởng thành từng bước, Thành công lớn",
    "finance": "May mắn tiền bạc",
    "career": "Thuận lợi, thăng tiến, Nắm quyền. Không nên ký hợp đồng trong những ngày trăng tròn (14 đến 16 ÂL). Cẩn thận tháng 8",
    "health": "Tốt. Chú ý ăn uống cẩn thận, có thể Viêm họng.",
    "relationship": "Mối quan hệ tốt đẹp. Tuy nhiên có thể hợp tác với người không cùng cảm nghĩ. Cần tìm một thỏa hiệp hợp lý giữa hai người."
  },
  "20": {
    "pair": "5/8",
    "name": "Phong Địa Quan",
    "meaning": "Suy tư, quan sát, thấy xa, khả năng tiên tri.",
    "finance": "Thực hiện từng bước và có kế hoạch cụ thể sẽ được kết quả.",
    "career": "Nhờ biết tiên đoán giúp bạn có ảnh hưởng đến người khác. Có cái nhìn sâu sắc để nắm bắt các thời điểm thiết yếu của vũ trụ.",
    "health": "Cần phải nghỉ ngơi.",
    "relationship": "Mối quan hệ càng ngày càng xích lại gần nhau."
  },
  "21": {
    "pair": "3/4",
    "name": "Hỏa Lôi Phê Hạp",
    "meaning": "Phá hủy chướng ngại, trừng trị, tiêu diệt.",
    "finance": "Chưa phát tài trong lúc này có khi còn hao tiền tài. Cần kiên nhẫn chờ đợi.",
    "career": "Phá hủy được chướng ngai đưa đến thành công.",
    "health": "Chú ý: giải phẩu, cảm sốt.",
    "relationship": "Loại bỏ sự hiểu lầm"
  },
  "22": {
    "pair": "7/3",
    "name": "Sơn Hỏa Bí",
    "meaning": "Sắc đẹp, xinh xắn, hình thức, nghệ thuật.",
    "finance": "Thuận lợi cho việc đầu tư về lâu về dài, sẽ thu hoạch trong tương lại.",
    "career": "Hãy thỏa mãn với những việc nhỏ và cần sự tận dụng óc thẩm mỹ của bạn.",
    "health": "Nên kiểm tra lại sức khỏe. Chú ý tim và tùy vị của bạn.",
    "relationship": "Không nên chú ý đến vẻ bề ngoài. Cần phải có cái nhìn sáng suốt."
  },
  "23": {
    "pair": "7/8",
    "name": "Sơn Địa Bác",
    "meaning": "Bùng nổ, sụp đổ, suy thoái, phá sản.",
    "finance": "Chưa gặp may mắn, còn khá khăn, nên xài tiền cẩn thận.",
    "career": "Công việc làm ăn không thuận lợi, dễ bị mất mát. Coi chừng phá sản.",
    "health": "Chú ý về tim mạch, huyết áp cao, tiểu đường, xuất huyết não.",
    "relationship": "Sự chia tay, gãy đổ, kết thúc."
  },
  "24": {
    "pair": "8/4",
    "name": "Địa Lôi Phục",
    "meaning": "Trở về, sự đổi mới, chấm dứt đen tối.",
    "finance": "Vẫn còn cầm chưng, không hao hụt nhưng cũng chưa phát triển lắm.",
    "career": "Dù trải qua giai đoạn khó nhọc nhưng may mắn sẽ đến với bạn. Đây là thời điểm thuận lợi để làm các cuộc làm ăn mới.",
    "health": "Sẽ lấy lại sức mạnh.",
    "relationship": "Xây dựng lại những mối quan hệ trước đây. Tình yêu đang ở trước mắt bạn."
  },
  "25": {
    "pair": "1/4",
    "name": "Thiên Lôi Vô Vọng",
    "meaning": "Vô tư, Thật thà, giản dị, ngẫu nhiên",
    "finance": "Cẩn thận về tiền bạc. Không Phung phí cũng không quá keo kiệt. Nên làm việc thiện.",
    "career": "Đừng dấn thân vào kinh doanh ko rõ ràng. Làm vừa và chờ đợi. Thận trọng.",
    "health": "Châm cứu, dưỡng sinh. Thuốc Nam, Bắc giúp sức khỏe tốt hơn.",
    "relationship": "Sự giản dị, tự nhiên giúp bạn có những mối quan hệ tuyệt vời."
  },
  "26": {
    "pair": "7/1",
    "name": "Sơn Thiên Đại Súc",
    "meaning": "Tích lũy tài năng, phát triển cá nhân.",
    "finance": "May mắn sẽ đến với bạn",
    "career": "Thành công. Ảnh hưởng của bạn rất lớn trong xã hội. Bạn sẽ có địa vị cao trong xã hội.",
    "health": "Tốt",
    "relationship": "Xây dựng được mối quan hệ bạn mong muốn."
  },
  "27": {
    "pair": "7/4",
    "name": "Sơn Lôi Di",
    "meaning": "Thực phẩm, cái miệng, tư cách, sự nói.",
    "finance": "Chưa có gì sáng sủa",
    "career": "Đừng quá tham công tiếc việc. Hãy thỏa mãn những gì mình có.",
    "health": "Tráng sự gắng sức quá độ. Phải ăn uống điều độ.",
    "relationship": "Bạn sẽ giúp đỡ người bạn yêu thương. Hành xử như một nhà tu khổ hạnh."
  },
  "28": {
    "pair": "2/5",
    "name": "Trạch Phong Đại Quá",
    "meaning": "Trao dồi tài đức để làm việc phi thường.",
    "finance": "Phải chi tiêu cẩn thận.",
    "career": "Đừng quá tham lam. Hãy chọn con đường chính đáng nếu không sẽ gặp tai ương. Tránh vay mượn quá nhiều.",
    "health": "Không nên làm việc quá độ ảnh hưởng sức khỏe. Nên ăn kiêng, giứ kỷ luật. Tránh lái xe quá tốc độ.",
    "relationship": "Không nên quá nghiêm khắc với người xung quanh. Cần sửa đổi các tật xấu để giữ mối quan hệ tốt."
  },
  "29": {
    "pair": "6/6",
    "name": "Thủy Vi Khảm",
    "meaning": "Nguy hiểm, Bí mật, ăn trộm, vực thẳm.",
    "finance": "Tiền bạc đang thiếu hụt. Coi chừng bị mất tiền do cướp giật hay ăn trộm.",
    "career": "Hãy thận tọng và suy nghĩ chín chắn. Sự may mắn chưa mỉm cười với bạn. Tránh các việc kinh doanh mới.",
    "health": "Chưa tốt. Đề phòng nhiễm độc thức ăn và bệnh ở tai",
    "relationship": "Kết giao mối qun hệ không tốt. Không nên tranh cãi."
  },
  "30": {
    "pair": "3/3",
    "name": "Hỏa Vi Ly",
    "meaning": "Gắn bó, trong sáng, lý tưởng, chiếu rọi.",
    "finance": "Có thể phát đạt nhưng tránh lạm dụng.",
    "career": "Thành công nhiều với việc bạn ham muốn. Hãy làm những gì bạn thích.",
    "health": "Bạn tự làm tiêu hao năng lượng của bạn quá nhiều. Coi chừng có thể dẫn đến loạn thần kinh tim kèm mất ngủ.",
    "relationship": "Dấu hiệu của một tiếng sét ái ti tình, một đam mê mãnh liệt."
  },
  "31": {
    "pair": "2/7",
    "name": "Trạch Sơn Hàm",
    "meaning": "Hòa hợp, đám cưới, hiệp định, liên minh",
    "finance": "Gặp may mắn. Cẩn thận đừng vì Tiền Bạc mà bán linh hồn.",
    "career": "Thuận lợi và chờ đợi thời cơ hợp lý. Trang bị kiến thức ko nên ích kỷ.",
    "health": "Chú ý bệnh Tiêu hóa, Đường hô hấp. Tập Yoga, dưỡng sinh, thư giãn.",
    "relationship": "Khơi dậy tình cảm lứa đôi. Đám cưới. Hôn nhân hạnh phúc."
  },
  "32": {
    "pair": "4/5",
    "name": "Lôi Phong Hằng",
    "meaning": "Trường cửu, Kiên tâm, lòng trung thành",
    "finance": "Gặp may mắn",
    "career": "Hành động thuận lợi. Tập trung Mục tiêu  và Kiên tâm bạn sẽ thành công.",
    "health": "Ăn kiên sẽ có Sức khỏe tốt. Chú ý Gan.",
    "relationship": "Mối quan hệ bền vững và Trường cửu."
  },
  "33": {
    "pair": "1/7",
    "name": "Thiên Sơn Độn",
    "meaning": "Trốn chạy, Rút lui, Rời chỗ cũ đến chỗ mới.",
    "finance": "Chưa được may mắn. Không nên đầu tư tiền bạc.",
    "career": "Không nên nghĩ đến việc kinh doanh vào thời điểm này.",
    "health": "Chú ý Gan và Đường Hô Hấp",
    "relationship": "Giữ khoảng cách trong mối quan hệ."
  },
  "34": {
    "pair": "4/1",
    "name": "Lôi Thiên Đại Tráng",
    "meaning": "Quyền lực lớn mạnh, Tài năng, Năng lực",
    "finance": "Gặp nhiều may mắn. Mong ước sẽ thành đạt.",
    "career": "Thuận lợi. Có sự thăng tiến.",
    "health": "Tốt",
    "relationship": "Tốt"
  },
  "35": {
    "pair": "3/8",
    "name": "Hỏa Địa Tấn",
    "meaning": "Tiến bộ, Thăng chức, thành đạt rạng rỡ.",
    "finance": "Gặp nhiều may mắn.",
    "career": "Mở rộng, phát triển, Thành công.",
    "health": "Tốt",
    "relationship": "Tốt"
  },
  "36": {
    "pair": "8/3",
    "name": "Địa Hỏa Minh Di",
    "meaning": "Ánh sáng bị che lấp, Buồn thảm, đau lòng.",
    "finance": "Chưa gặp may mắn, thời cơ chưa đến , cần phải chờ đợi",
    "career": "Đang ở trong giai đoạn suy thoái. Hãy thỏa mãn với những gì mình hiện có.",
    "health": "Khó khăn về sức khỏe. Chú ý Tim và Tỳ vị.",
    "relationship": "Có sự phiền muộn"
  },
  "37": {
    "pair": "5/3",
    "name": "Phong Hỏa Gia Nhân",
    "meaning": "Gia đình, quần thể xã hội tập hợp lại.",
    "finance": "Gặp may mắn.",
    "career": "Làm việc với người trong gia đình.",
    "health": "Tốt.",
    "relationship": "Gia đình tăng trưởng. Có sự sinh nở."
  },
  "38": {
    "pair": "3/2",
    "name": "Hỏa Trạch Khuê",
    "meaning": "Tương khắc, đối đầu, lợi dụng lẫn nhau.",
    "finance": "Coi chừng có thể bị mất một số tiền lớn, ăn trộm viếng nhà.",
    "career": "Hãy thận trọng và suy nghĩ. Coi chừng hiểu lầm dẫn đến việc kinh doanh xấu. Ít được tin tưởng và giao các quyền hạn dưới khả năng của bạn.",
    "health": "Sự dằng co nội tâm ảnh hưởng đến sức khỏe. Chú ý tim mạch và hô hấp.",
    "relationship": "Sự đối đầu, sự di biệt làm các mối quan hệ của bạn không bền vững, dễ xa nhau."
  },
  "39": {
    "pair": "6/7",
    "name": "Thủy Sơn Kiển",
    "meaning": "Chướng ngại, trắc trở, bế tắc, nguy khốn.",
    "finance": "Chưa thuận lợi. Cẩn thận vay tiền bạn bè.",
    "career": "Hiểu làm dẫn đến kinh doanh xấu. Tranh chấp trong nội tâm. Thận trọng và suy nghĩ.",
    "health": "Khó khăn và bệnh tật. Cơ thể mẹt mỏi. Tự chữa bệnh, ăn kiêng.",
    "relationship": "Kiên nhẫn để vượt qua chông gai trong mối quan hệ."
  },
  "40": {
    "pair": "4/6",
    "name": "Lôi Thủy Giải",
    "meaning": "Giải phóng, Chấm dứt khó khăn, ân xá",
    "finance": "Gặp may mắn trong hùn hạp và đầu tư.",
    "career": "Mọi việc trên đà giàn xếp. Cần thận trọng.",
    "health": "Chấm dứt căng thẳng. Sức khỏe tăng dần. CHú ý gan thận",
    "relationship": "Chấm dứt những khó khăn trong mối quan hệ trước đây."
  },
  "41": {
    "pair": "7/2",
    "name": "Sơn Trạch Tổn",
    "meaning": "Thua thiệt, tổn hại, rút lui, suy thoái.",
    "finance": "Chưa gặp được may mắn. Phải kiên nhẫn chờ đợi.",
    "career": "Trang trải qua thời kỳ suy thoái.",
    "health": "Suy giảm, mệt mỏi. Chú ý hô hấp và tiêu hóa.",
    "relationship": "Chia lìa, xa cách"
  },
  "42": {
    "pair": "5/4",
    "name": "Phong Lôi Ích",
    "meaning": "Tăng trưởng, Vượt lên, phát triển thêm",
    "finance": "Gặp may mắn. Nên hùn hợp với đồng nghiệp trong công việc làm ăn",
    "career": "Bạn đang phát triển tột bực. Doanh thu tăng. Sẽ giàu hơn. Có Quý nhân giúp đỡ và Rất thuận lợi",
    "health": "Đầy sinh lực",
    "relationship": "Có sự tăng trưởng trong các quan hệ"
  },
  "43": {
    "pair": "2/1",
    "name": "Trạch Thiên Quải",
    "meaning": "Thâm nhập, quyết đoán, can đảm trừ ác.",
    "finance": "Cẩn thận kẻo bị mất mát (bị giật đồ, mất đồ) và làm ăn thua lỗ.",
    "career": "Cần có một quyết định cứng rắn, độc lập. Tuyệt đối không dùng vũ lực nếu không sẽ thất bại.",
    "health": "Từ chối giải phẩu nếu thấy bệnh không trầm trọng. Sử dụng liệu pháp Đông y, châm cứu.",
    "relationship": "Chấm dứt tình trạng căng thẳng."
  },
  "44": {
    "pair": "1/5",
    "name": "Thiên Phong Cấu",
    "meaning": "Cám dỗ, quyến rũ, cấu kết, liên kết xấu.",
    "finance": "Bị lường gạt và mất trắng tiền bạc.",
    "career": "Đề phòng sự cám dỗ. Mất sự ung dung, lo sợ sự may mắn quay lưng lại với bạn.",
    "health": "Chú ý Gan và Đường Hô Hấp",
    "relationship": "Cẩn thận trong việc thực hiện các giao hảo không tốt."
  },
  "45": {
    "pair": "2/8",
    "name": "Trạch Địa Tụy",
    "meaning": "Tập hợp, Thuận tình, đoàn thể, biểu tình",
    "finance": "Nên hợp tác đầu tư sẽ có lợi. Tránh vụ lợi cá nhân",
    "career": "Hợp tác làm ăn với nhiều người 2 bên đầu (Win-Win) sẽ thành công",
    "health": "Phải ăn kiêng. Chơi thể thao. Chú ý bệnh Đường tiêu hóa, béo phì.",
    "relationship": "Tái hợp lại với những người mà bạn yêu thương và quý mến."
  },
  "46": {
    "pair": "8/5",
    "name": "Địa Phong Thăng",
    "meaning": "Thăng tiến, thăng chức, tích lũy tài sản.",
    "finance": "Sẽ đạt kết quả như mong muốn.",
    "career": "Nỗ lực giúp bạn thành công. Có chí nhưng phải biết cư xử một cách nhẹ nhàng, không nên quá khích.",
    "health": "Đang trên đà phát triển tốt. Đề phòng tế bào ác tính dẫn đến ung bướu. Chú ý: Gan và dạ dày.",
    "relationship": "Tốt. Được sống gần với người bạn yêu thương."
  },
  "47": {
    "pair": "2/6",
    "name": "Trạch Thủy Khốn",
    "meaning": "Khốn cùng, Khánh tận, bại hoại, nãn chí.",
    "finance": "Bị giảm sút",
    "career": "Xấu. Khánh tận, Suy thoái.\"Còn tiền, còn bạc còn đệ tử; Hết tiền, hết bạc, hêt ông tôi\"",
    "health": "Suy yếu, bất lực. Cần phục hồi sức khỏe.",
    "relationship": "Sự gãy đổ, sự bất lực."
  },
  "48": {
    "pair": "6/5",
    "name": "Thủy Phong Tỉnh",
    "meaning": "Che dấu, Huyền bí, kiên nhẫn, trầm lặng. Mở tung kho tàng tri thức.",
    "finance": "Cần phải kiên trì sẽ thành đạt như ý muốn.",
    "career": "Làm giàu dựa trên bài học kinh nghiệm.",
    "health": "Học cách làm chủ lấy mình. Chú ý kỷ luật trong quan hệ. Chú ý Gang, Thận, bàng quang.",
    "relationship": "Còn bị che dấu. Cần phải kiên nhẫn trong mối quan hệ."
  },
  "49": {
    "pair": "2/3",
    "name": "Trạch Hỏa Cách",
    "meaning": "Cải cách, Biến đổi, Cuộc cách mạng",
    "finance": "Có lợi trong làm ăn, đầu tư",
    "career": "Có sự xáo trộn. Bạn phải có sự sáng tạo và lập kế hoạch mới thành công.",
    "health": "Tránh làm việc quá sức. Coi chừng rối loạn nhịp Tim và đường hô hấp",
    "relationship": "Sự thay đổi trong mối quan hệ."
  },
  "50": {
    "pair": "3/5",
    "name": "Hỏa Phong Đỉnh",
    "meaning": "Hun đúc, rèn luyện, cải thiện, tu dưỡng.",
    "finance": "Bạn sắp có một số tiền lớn.",
    "career": "Bạn sẽ thành công",
    "health": "Chú ý: ăn uống, gan, tim.",
    "relationship": "Có được mối quan hệ tốt đẹp, quan trọng và đón nhận thêm thành viên mới."
  },
  "51": {
    "pair": "4/4",
    "name": "Lôi Vi Chấn",
    "meaning": "Sấm sét, Chuyển động, Bản năng sinh tồn.",
    "finance": "Chưa được may mắn. Không nên đầu tư tiền bạc.",
    "career": "Cần Kiên Nhẫn chờ đợi thời cơ, mọi việc chưa thể thực hiện ngay được.",
    "health": "Không nên làm quá sức. Cần yên tĩnh, thư giãn. Đề phòng Tim, Phổi.",
    "relationship": "Cùng nhau giải quyết vượt qua nghịch cảnh."
  },
  "52": {
    "pair": "7/7",
    "name": "Sơn Vi Cấn",
    "meaning": "Ngừng Nghỉ, Bất động, Ngưng trệ, im lặng.",
    "finance": "Kiên nhẫn chờ đợi.",
    "career": "Kiên nhẫn chờ đợi thời cơ.",
    "health": "Tĩnh lặng, thư giãn, dưỡng sinh. Tránh cà phê, thuốc lá.",
    "relationship": "Án binh bất động. Giữ yên lặng trong hòa bình. Loại bỏ các ảo tưởng."
  },
  "53": {
    "pair": "5/7",
    "name": "Phong Sơn Tiệm",
    "meaning": "Tiến dần dần, Tiến bộ,Thăng chức.",
    "finance": "Kiên nhẫn đem lại lợi lộc.",
    "career": "Kiên trì và thuận theo dòng chảy của xã hội. Cần chuẩn bị chu đáo và bền chí trong việc làm ăn của bạn.",
    "health": "Sức khỏe tốt.",
    "relationship": "Đoàn kết"
  },
  "54": {
    "pair": "4/2",
    "name": "Lôi Trạch Quy Muội",
    "meaning": "Cô dâu, cuộc hôn nhân, công việc không bền.",
    "finance": "Nên để dành tiền, không nên đầu tư hoặc cho ai mượn sẽ mất mát.",
    "career": "Bạn đang ở trong vị thế bất lợi. Tốt nhất nên ở nguyên vị thế hiện tại.",
    "health": "Chú ý: Gan, thận.",
    "relationship": "Mối quan hệ không bền vững. Không nên cử hành đám cưới."
  },
  "55": {
    "pair": "4/3",
    "name": "Lôi Hỏa Phong",
    "meaning": "Trù phú, thành công, trưởng thành.",
    "finance": "Gặp nhiều may mắn",
    "career": "Công việc tốt đẹp. Thành công.",
    "health": "Tốt. Cần chú ý Tim và Gan",
    "relationship": "Mối quan hệ tốt đẹp và hạnh phúc."
  },
  "56": {
    "pair": "3/7",
    "name": "Hỏa Sơn Lữ",
    "meaning": "Lữ khách, tạm trú, không bền vững.",
    "finance": "May mắn chưa mỉm cười với bạn. Coi chừng mất tiền.",
    "career": "Dễ mất công việc đang nắm giữ. Thích nghi với hiện tại, hãy kín đáo và chớ quá tin vò trí thông minh của bạn.",
    "health": "Chú ý tim và đường tiêu hóa.",
    "relationship": "Mối quan hệ không bền vững."
  },
  "57": {
    "pair": "5/5",
    "name": "Phong Vi Tốn",
    "meaning": "Dịu dàng, uyển chuyển, khéo léo, tế nhị.",
    "finance": "Chỉ có lợi nhỏ, cần tiết kiệm tránh xài phung phí.",
    "career": "Đừng làm việc cho có. Bạn sẽ gặp thất bại nếu bạn đanh đá.",
    "health": "Chú ý theo dõi sức khỏe. Chú ý: Gan, mật.",
    "relationship": "Sự dịu dàng, khéo léo giúp bạn xây dựng được mối quan hệ tốt."
  },
  "58": {
    "pair": "2/2",
    "name": "Trạch Vi Đoài",
    "meaning": "Vui Tươi, Quang Vinh, Niềm Vui Mừng",
    "finance": "Kiên nhẫn đem lại lợi lộc.",
    "career": "Mọi việc đều tốt đẹp nếu bạn cố gắng dựa vào những người có khả năng.",
    "health": "Sức khỏe tốt.",
    "relationship": "Vui vẻ. Giao tiếp dễ dàng với người khác. Nhiều người tìm đến bạn."
  },
  "59": {
    "pair": "5/6",
    "name": "Phong Thủy Hoán",
    "meaning": "Tan rã, Giải thể, Trốn đi xa, gián đoạn",
    "finance": "Nhờ vào đầu tư bạn sẽ thu được tiền.",
    "career": "Có thể thực hiện công việc làm ăn nhưng cần phải tránh xa nơi có bạo lực. Hãy làm việc thiện và tự phê bình bản thân.",
    "health": "Bệnh tật đang dòm ngó. Hãy nghĩ ngơi và thực hiện các xét nghiệm để xác minh chính xác bệnh tình. Chú ý Gan và Sạn Thận.",
    "relationship": "Sự tan rã/ Sự chia ly"
  },
  "60": {
    "pair": "6/2",
    "name": "Thủy Trạch Tiết",
    "meaning": "Phân giới, giới hạn, các luật lệ, kiềm chế.",
    "finance": "Tránh chi tiêu phung phí. Cần tiết kiệm và sử dụng đồng tiền đúng chỗ.",
    "career": "Nên giới hạn. Phải hạn chế các đòi hỏi và đam mê. Đừng vượt quá khả năng của mình.",
    "health": "Đừng phí sức lực. Coi chừng xáo trộn tinh thần, Cần nghỉ ngơi. Chú ý: Thận và hô hấp.",
    "relationship": "Sự phân ranh giới rõ ràng trong mối quan hệ."
  },
  "61": {
    "pair": "5/2",
    "name": "Phong Trạch Trung Phu",
    "meaning": "Có đức tin, trung thực, uy tín, thành thật.",
    "finance": "Gặp may mắn nhưng chưa có nhiều tiền.",
    "career": "Công việc thuận lợi. Thành công cũng cần phải cẩn thận. Hãy tôn trọng ý kiến người khác.",
    "health": "Tốt. Cần chú ý Tim và Gan",
    "relationship": "Mối quan hệ tin cậy, thành thật."
  },
  "62": {
    "pair": "4/7",
    "name": "Lôi Sơn Tiểu Quá",
    "meaning": "Ưu thế của kẻ yếu, Giới hạn, Tin tức nhỏ",
    "finance": "Không nên vay mượn thêm tiền có thể bị vỡ nợ",
    "career": "Tránh các cuộc kinh doanh phiêu lưu, làm ăn quá sức. Kiên trì với những cái nhỏ",
    "health": "Giới hạn từ thức ăn đến nếp sống. Chú ý Gan mật và bộ phận tiêu hóa.",
    "relationship": "Hãy thể hiện đúng bản chất của bạn để được nhiều người yêu thương."
  },
  "63": {
    "pair": "6/3",
    "name": "Thủy Hỏa Ký Tế",
    "meaning": "Việc đã thành, Trật tự văn hồi, Thành công.",
    "finance": "Gặp may mắn một phần nhỏ.",
    "career": "Sự thăng tiến. Ko nên mượn tiền, nợ nần. Bình tĩnh đương đầu với tình hình.",
    "health": "Chú ý Tim, Thận, Bệnh Béo phì",
    "relationship": "Sẽ thay đổi. Sẽ gặp bất ngờ. Trật tự sẽ được điều chỉnh."
  },
  "64": {
    "pair": "3/6",
    "name": "Hỏa Thủy Vị Tế",
    "meaning": "Việc chưa hoàn thành, rối loạn, hổn độn",
    "finance": "Phải chi tiêu có chừng mực, nên dành dụm cho mai sau.",
    "career": "Mọi việc chưa đến hồi kết thúc. Cần phải hoàn thành việc đã khởi xướng từ ban đầu. Hành xử thận trọng.",
    "health": "Tránh làm việc quá sức. Chú ý tim mạch.",
    "relationship": "Không nên đối đầu với những người xung quanh. Mở rộng tầm nhìn, gia nhập vào một nhóm cởi mở và sáng suốt."
  }
};
