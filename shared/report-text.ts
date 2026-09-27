/**
 * Chuẩn hóa đoạn văn báo cáo trích từ tài liệu Word gốc.
 *
 * Khi trích, tiêu đề in hoa bị dính vào đoạn văn theo hai kiểu:
 *  - dính đầu đoạn: "1 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 1 = KHAO KHÁT CHINH PHỤC Bạn sinh ra…"
 *  - dính cuối đoạn trước (tiêu đề của mục kế tiếp): "…với mọi người.LỊCH SỬ RA ĐỜI THẦN SỐ HỌC"
 * Hàm tách chúng thành cặp { heading, text } để giao diện hiển thị tiêu đề con thật.
 */
export type ReportParagraph = { heading?: string; text: string };

const hasLetter = (word: string) => /\p{L}/u.test(word);
const isCapsWord = (word: string) => hasLetter(word) && word === word.toLocaleUpperCase("vi") && word !== word.toLocaleLowerCase("vi");
const isNeutral = (word: string) => !hasLetter(word);
const isHeadingWord = (word: string) => isCapsWord(word) || isNeutral(word);

/** Đủ dài để là tiêu đề (tránh bắt nhầm từ viết tắt như "SGEN" hay "DISC"). */
function looksLikeHeading(words: string[]) {
  const caps = words.filter(isCapsWord);
  const letters = caps.join("").replace(/[^\p{L}]/gu, "").length;
  return caps.length >= 2 && letters >= 8;
}

/** "1 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 1 = KHAO KHÁT…" → "NỘI TÂM SỐ 1 = KHAO KHÁT…" */
function cleanHeading(raw: string) {
  let heading = raw.replace(/\s+/g, " ").trim();
  const numbered = heading.match(/(?:^|\s)((?:\p{Lu}+\s){1,4}SỐ\s+[\d/]+\s*=\s*.+)$/u);
  if (numbered) heading = numbered[1];
  heading = heading.replace(/^[\d/]+\s+/, "");
  // Khử cụm từ lặp liền nhau: "NỘI TÂM NỘI TÂM SỐ 1" → "NỘI TÂM SỐ 1"
  heading = heading.replace(/((?:\p{Lu}+ ){1,4})\1/gu, "$1");
  return heading.replace(/[.:\s]+$/, "").trim();
}

function splitLeading(words: string[]) {
  let end = 0;
  while (end < words.length && isHeadingWord(words[end])) end += 1;
  // Cần còn thân bài phía sau và phần đầu phải thực sự là tiêu đề.
  if (end === 0 || end >= words.length || !looksLikeHeading(words.slice(0, end))) return null;
  return { heading: words.slice(0, end).join(" "), rest: words.slice(end) };
}

function splitTrailing(words: string[]) {
  let start = words.length;
  while (start > 0 && isHeadingWord(words[start - 1])) start -= 1;
  if (start === words.length || start === 0) return null;
  // Tiêu đề dính cuối chỉ hợp lệ khi đứng ngay sau dấu kết câu.
  if (!/[.!?…:”"]$/.test(words[start - 1])) return null;
  const tail = words.slice(start);
  if (!looksLikeHeading(tail)) return null;
  return { body: words.slice(0, start), heading: tail.join(" ") };
}

export function structureParagraphs(paragraphs: readonly string[]): ReportParagraph[] {
  const out: ReportParagraph[] = [];
  let pending: string | undefined;

  for (const raw of paragraphs) {
    // Tách phần dính liền sau dấu chấm: "người.LỊCH SỬ" → "người. LỊCH SỬ"
    let words = raw.replace(/([.!?…])(?=\p{Lu}{2})/gu, "$1 ").trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;

    let heading = pending;
    pending = undefined;

    // Cả đoạn chỉ là tiêu đề → dùng cho đoạn kế tiếp.
    if (words.every(isHeadingWord)) {
      if (looksLikeHeading(words)) {
        pending = cleanHeading(words.join(" "));
        continue;
      }
    }

    const trailing = splitTrailing(words);
    if (trailing) {
      words = trailing.body;
      pending = cleanHeading(trailing.heading);
    }

    const leading = splitLeading(words);
    if (leading) {
      const own = cleanHeading(leading.heading);
      // Tiêu đề chờ từ đoạn trước thường trùng một phần tiêu đề đầu đoạn — ưu tiên bản đầy đủ hơn.
      heading = heading && own.includes(heading) ? own : heading && !own ? heading : own || heading;
      words = leading.rest;
    }

    const text = words.join(" ").trim();
    if (text) out.push(heading ? { heading, text } : { text });
    else if (heading) pending = heading;
  }

  return out;
}
