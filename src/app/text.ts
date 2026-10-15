/**
 * Giữ một cụm từ trên cùng một dòng bằng khoảng trắng không ngắt (U+00A0).
 * Tiếng Việt viết rời từng âm tiết nên trình duyệt hay ngắt giữa một từ ghép ("ứng | dụng").
 */
export function keepTogether(phrase: string) {
  return phrase.replace(/ /g, " ");
}
