"""Sinh dữ liệu Đổng Công và Trạng Trình (Bát Thập Tam Mục) cho trang Xem ngày từ giáo trình của khách.

Nguồn: "Giáo trình Trạch Cát Trạng Trình và Đổng Công.docx" (khách gửi 26/10/2026, là bản đầy đủ và đúng nhất).
Chạy lại khi khách gửi bản giáo trình mới:

    python3 -I scripts/extract_trach_cat.py "/đường/dẫn/Giáo trình Trạch Cát Trạng Trình và Đổng Công.docx"

Ghi đè `shared/xem-ngay/dong-cong-data.ts` và `shared/xem-ngay/trang-trinh-data.ts`, in ra các chỗ đã tự bổ sung / sửa.
Chỉ dùng thư viện chuẩn: đọc thẳng word/document.xml, gộp ô theo gridSpan / vMerge như Word hiển thị.
"""

import json
import os
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]
BRANCHES = ["Tý", "Sửu", "Dần", "Mẹo", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
OFFICERS = ["Kiên", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thâu", "Khai", "Bế"]
RATINGS = ["Đại Kiết", "Thứ Kiết", "Thứ Hung", "Đại Hung"]
MONTHS = {"GIÊNG": 1, "HAI": 2, "BA": 3, "TƯ": 4, "NĂM": 5, "SÁU": 6, "BẢY": 7, "TÁM": 8, "CHÍN": 9, "MƯỜI": 10, "MƯỜI MỘT": 11, "MƯỜI HAI": 12}
MONTH_NAMES = ["Tháng Giêng", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Chạp"]

# Cách viết khác / lỗi gõ của tên Can Chi trong bảng ngày (giáo trình gõ "Tuât", "Dàn", "Dạu", "Hợp", "Thần").
NAME_ALIASES = {"Mão": "Mẹo", "Tỵ": "Tị", "Tí": "Tý", "Tuât": "Tuất", "Quí": "Quý", "Dàn": "Dần", "Dạu": "Dậu", "Hợp": "Hợi", "Thần": "Thân"}

# Lỗi gõ hiển nhiên trong lời văn (chỉ sửa chữ, không đổi ý); in ra khi áp dụng.
TEXT_FIXES = [
    ("cvos", "có"),
    ("trong cóa", "trong có"),
    ("ĐẰng", "Đằng"),
    (" cso ", " có "),
    ("cảu ", "của "),
    ("cuản ", "của "),
    ("đâò", "đào"),
    ("Sữa chữa", "Sửa chữa"),
    ("vaạy", "vậy"),
    ("Tiểu Tiết", "Tiểu Tuyết"),
]

# Sao / cách cục kèm tên ngày mà giáo trình không ghi ở dòng tiêu đề nhóm ngày nhưng trang mẫu (xemngay.thayphongthuy.vn)
# có hiện; giữ lại để thẻ ngày không mất thông tin. Khoá "tháng|Chi"; nhãn của giáo trình (nếu có) luôn được ưu tiên.
REFERENCE_LABELS = {
    "1|Dần": "Vãng Vong", "1|Thìn": "Thiên Phủ, Thiên Tặc, Thiên La", "1|Tuất": "Thiên Hỷ, Địa Võng",
    "3|Tý": "Huỳnh Sa, Thiên Hỷ", "3|Sửu": "Tiểu Hồng Sa, Thiên Tặc", "3|Ngọ": "Thiên Phú", "3|Hợi": "Thiên Thành",
    "4|Ngọ": "Huỳnh La", "4|Mùi": "Thiên Phú, Thiên Tặc", "4|Tuất": "Câu Giảo",
    "5|Thân": "Thiên Phú, Thiên Hỷ",
    "6|Tý": "Huỳnh Sa", "6|Sửu": "Tiểu Hồng Sa", "6|Ngọ": "Vãng Vong", "6|Dậu": "Thiên Hỷ, Thiên Phú",
    "7|Thìn": "Thiên Hỷ", "7|Mùi": "Thiên Thành, Thiên Xá", "7|Tuất": "Thiên Phú, Thiên Tặc",
    "8|Tý": "Vãng Vong, Châu Tước, Câu Giảo", "8|Dần": "Huỳnh Sa", "8|Mẹo": "Thiên Tặc", "8|Hợi": "Thiên Phú",
    "9|Tý": "Huỳnh Sa, Thiên Phú", "9|Sửu": "Tiểu Hồng Sa, Phúc Sinh", "9|Thìn": "Vãng Vong, Thiên Thời, Nguyệt Đức", "9|Ngọ": "Thiên Hỷ", "9|Dậu": "Thiên Tặc", "9|Hợi": "Thiên Thành",
    "10|Sửu": "Thiên Phú, Thiên Thành, Thiên Tặc", "10|Dần": "Thiên Phú, Thiên Thành, Châu Tinh", "10|Thìn": "", "10|Tị": "Tiểu Hồng Sa, Châu Tước, Câu Giảo", "10|Ngọ": "Huỳnh Sa", "10|Mùi": "Nguyệt Kiên, Tam Hạp", "10|Tuất": "Hỏa Tinh",
    "11|Tý": "Hỏa Tinh", "11|Sửu": "Thiên Ôn", "11|Dần": "Huỳnh Sa, Thiên Phú, Huỳnh La, Tử Đàng, Thiên Hoàng, Địa Hoàng", "11|Mẹo": "Thiên Tặc", "11|Ngọ": "Thiên Tặc", "11|Thân": "Thiên Hỷ", "11|Tuất": "Vãng Vong",
    "12|Tý": "Huỳnh Sa", "12|Sửu": "Vãng Vong, Hồng Sa", "12|Mẹo": "Thiên Phú", "12|Hợi": "Thiên Tặc, Nguyệt Yểm",
}

# Mục không có "bảng ngày tốt chung": 23, 42, 54, 63 chia ngày theo tiết khí / tháng; bảng của mục 33 là ngày KỊ.
MUC_WITHOUT_MAIN_TABLE = {23, 33, 42, 54, 63}

log = []


def nfc(text):
    return unicodedata.normalize("NFC", text or "").replace("\u00d0", "Đ").replace("\xa0", " ")


def clean(text):
    return re.sub(r"[ \t]+", " ", nfc(text)).strip()


def fix_text(text):
    out = text
    for wrong, right in TEXT_FIXES:
        if wrong in out:
            log.append(f"sửa chữ: {wrong!r} → {right!r}")
            out = out.replace(wrong, right)
    return out


def name(text):
    text = clean(text)
    if text in NAME_ALIASES:
        log.append(f"sửa tên Can Chi: {text} → {NAME_ALIASES[text]}")
    return NAME_ALIASES.get(text, text)


# ---------------------------------------------------------------- đọc docx

def para_text(p):
    parts = []
    for node in p.iter():
        if node.tag == W + "t" and node.text:
            parts.append(node.text)
        elif node.tag == W + "tab":
            parts.append("\t")
        elif node.tag in (W + "br", W + "cr"):
            parts.append("\n")
    return "".join(parts)


def cell_lines(paras):
    lines = []
    for p in paras:
        lines.extend(clean(line) for line in nfc(p).split("\n"))
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    out = []
    for line in lines:
        if not line and out and not out[-1]:
            continue
        out.append(line)
    return out


def read_rows(docx):
    """Toàn bộ thân văn bản thành một dãy dòng: mỗi dòng là danh sách (cột, các dòng chữ). Đoạn văn = dòng một ô."""
    with zipfile.ZipFile(docx) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    rows = []
    for child in root.find(W + "body"):
        if child.tag == W + "p":
            text = para_text(child)
            if clean(text):
                rows.append([(0, cell_lines([text]))])
        elif child.tag == W + "tbl":
            above = {}
            for tr in child.findall(W + "tr"):
                row, col = [], 0
                for tc in tr.findall(W + "tc"):
                    pr = tc.find(W + "tcPr")
                    span, vmerge = 1, None
                    if pr is not None:
                        grid = pr.find(W + "gridSpan")
                        if grid is not None:
                            span = int(grid.get(W + "val", "1"))
                        merge = pr.find(W + "vMerge")
                        if merge is not None:
                            vmerge = merge.get(W + "val", "continue")
                    lines = cell_lines([para_text(p) for p in tc.iter(W + "p")])
                    if vmerge == "continue":
                        lines = above.get(col, lines)
                    for k in range(span):
                        above[col + k] = lines
                    row.append((col, lines))
                    col += span
                rows.append(row)
    return rows


def filled(row):
    return [cell for cell in row if any(cell[1])]


def joined(cell):
    return "\n".join(cell[1])


# ---------------------------------------------------------------- Đổng Công

def rating_of(text):
    low = text.lower()
    for rating in RATINGS:
        if rating.lower() in low:
            return rating
    return None


def parse_overview_ratings(cells):
    """Ô "Hung" / "Kiết" của bảng tổng quan tháng: "Giáp, Bính, Mậu Thìn: Đại Hung" → {Can Chi: mức}."""
    found = {}
    for cell in cells:
        for line in cell[1]:
            match = re.match(r"(.+?)\s*:\s*(Đại Hung|Thứ Hung|Đại Kiết|Thứ Kiết)\s*$", line)
            if not match:
                continue
            words = re.split(r"[,\s]+", match.group(1).replace("CanhThân", "Canh Thân"))
            words = [name(w) for w in words if w]
            branch = words[-1]
            for stem in words[:-1]:
                if stem in STEMS and branch in BRANCHES:
                    found[f"{stem} {branch}"] = match.group(2)
    return found


def parse_dong_cong(rows):
    months = {}
    month = None
    mode = None
    info_cols = []
    for row in rows:
        cells = filled(row)
        if not cells:
            if mode == "info":
                mode = None
            continue
        first = joined(cells[0])
        heading = re.match(r"ĐỔNG CÔNG THÁNG (.+)$", first.upper())
        if heading and len(cells) == 1:
            month = MONTHS[heading.group(1).strip()]
            months[month] = {"terms": "", "hungSat": [], "overview": {}, "groups": {}, "days": {}}
            mode = None
            continue
        if month is None:
            continue
        if first.upper().startswith("QUY TẮC CHỌN NGÀY"):
            break
        data = months[month]
        texts = [joined(c).replace("\n", " ") for c in cells]
        if len(cells) == 1 and first.upper().startswith("THÁNG"):
            lines = [line for line in cells[0][1] if line]
            if not data["terms"] and len(lines) > 1:
                data["terms"] = fix_text(lines[-1])
            continue
        if texts[:2] == ["Thời Gian", "Hung Sát"]:
            mode, info_cols = "info", [c[0] for c in cells]
            continue
        if texts[:2] == ["Trực", "Chi"]:
            mode = "overview"
            continue
        if texts[0] == "Ngày" and len(texts) >= 3 and "Nghi" in texts[1]:
            mode = "days"
            continue
        if first.startswith("Ngày ") and len(cells) == 2 and name(texts[1]) in BRANCHES:
            lines = [line for line in cells[0][1] if line]
            words = lines[0].split()
            label = ", ".join(lines[1:]) if len(lines) > 1 else " ".join(words[2:])
            data["groups"][name(texts[1])] = {"officer": words[1], "label": clean(label)}
            mode = "days"
            continue
        if mode == "info":
            values = [""] * len(info_cols)
            for col, lines in row:
                slot = max((i for i, c in enumerate(info_cols) if c <= col), default=0)
                text = " ".join(line for line in lines if line)
                if text:
                    values[slot] = (values[slot] + " " + text).strip()
            data["hungSat"].append(values)
            continue
        if mode == "overview" and name(first) in OFFICERS:
            data["overview"].update(parse_overview_ratings(cells[2:]))
            continue
        stem = name(cells[0][1][0]) if cells[0][1] else ""
        branch = name(texts[1]) if len(cells) > 1 else ""
        if stem in STEMS and branch in BRANCHES:
            content = [lines for col, lines in row if col > cells[1][0]]
            while len(content) < 3:
                content.append([])
            data["days"][f"{stem} {branch}"] = {
                "nghiKi": fix_text("\n".join(content[0])),
                "anhHuong": fix_text("\n".join(content[1])),
                "rating": rating_of(" ".join(content[2])),
            }
            continue
        log.append(f"Đổng Công tháng {month}: bỏ qua dòng {texts[:3]}")
    return months


def build_dong_cong(months):
    pool, pool_index = [], {}

    def ref(text):
        if text not in pool_index:
            pool_index[text] = len(pool)
            pool.append(text)
        return pool_index[text]

    out = []
    for month in range(1, 13):
        data = months[month]
        days = []
        for index in range(60):
            key = f"{STEMS[index % 10]} {BRANCHES[index % 12]}"
            branch = BRANCHES[index % 12]
            rec = data["days"].get(key)
            rating = (rec or {}).get("rating") or data["overview"].get(key)
            if rec is None or not (rec["nghiKi"] or rec["anhHuong"]):
                # Dòng bị thiếu / để trống trong giáo trình: lấy lời của ngày cùng Chi, cùng mức kiết hung trong tháng.
                donor = next(
                    (r for k, r in data["days"].items() if k.endswith(" " + branch) and (r["nghiKi"] or r["anhHuong"]) and r["rating"] == rating),
                    None,
                )
                if donor is None:
                    raise SystemExit(f"Đổng Công tháng {month} {key}: thiếu lời luận và không có ngày cùng nhóm để bổ sung")
                log.append(f"Đổng Công {MONTH_NAMES[month - 1]} {key}: giáo trình {'thiếu dòng' if rec is None else 'để trống'}, lấy lời của ngày cùng nhóm ({rating})")
                rec = {**donor, "rating": rating}
            if not rating:
                raise SystemExit(f"Đổng Công tháng {month} {key}: không đọc được mức kiết hung")
            overview = data["overview"].get(key)
            if overview and overview != rating:
                log.append(f"Đổng Công {MONTH_NAMES[month - 1]} {key}: bảng ngày ghi {rating}, bảng tổng quan tháng ghi {overview} — dùng {rating}")
            days.append([ref(rec["nghiKi"]), ref(rec["anhHuong"]), RATINGS.index(rating)])
        groups = {}
        for branch in BRANCHES:
            group = data["groups"].get(branch)
            if not group:
                raise SystemExit(f"Đổng Công tháng {month}: không có nhóm ngày {branch}")
            label = group["label"] or REFERENCE_LABELS.get(f"{month}|{branch}", "")
            groups[branch] = [group["officer"], label]
        out.append({"name": MONTH_NAMES[month - 1], "terms": data["terms"], "hungSat": data["hungSat"], "groups": groups, "days": days})
    return pool, out


# ---------------------------------------------------------------- Trạng Trình

def parse_trang_trinh(rows):
    start = next(i for i, row in enumerate(rows) if row and "BÁT THẬP TAM MỤC" in joined(row[0]))
    muc, current, pending_can = {}, None, None
    for row in rows[start + 1:]:
        cells = filled(row)
        if not cells:
            continue
        first = joined(cells[0])
        heading = re.match(r"^MỤC\s*0*(\d+)$", first.strip().upper())
        if heading and len(cells) == 1:
            current = {"title": None, "blocks": []}
            muc[int(heading.group(1))] = current
            pending_can = None
            continue
        if current is None:
            continue
        texts = [joined(c).replace("\n", " ") for c in cells]
        if current["title"] is None and len(cells) == 1:
            current["title"] = clean(first)
            continue
        if texts[0] == "Can" and len(cells) >= 6 and all(name(t) in STEMS for t in texts[1:]):
            pending_can = [(c[0], name(joined(c))) for c in cells[1:]]
            continue
        if pending_can is not None and texts[0] == "Chi":
            by_col = dict(row)
            days = {}
            for col, stem in pending_can:
                branches = []
                for line in by_col.get(col, []):
                    for token in re.split(r"[,\s/]+", line):
                        if not token:
                            continue
                        branch = name(token)
                        if branch not in BRANCHES:
                            raise SystemExit(f"Mục {current_no(muc, current)}: không hiểu '{token}' trong cột {stem}")
                        if BRANCHES.index(branch) % 2 != STEMS.index(stem) % 2:
                            log.append(f"Mục {current_no(muc, current)}: bỏ '{stem} {branch}' (Can Chi không có thật)")
                            continue
                        branches.append(branch)
                if branches:
                    days[stem] = branches
            current["blocks"].append({"kind": "days", "days": days})
            pending_can = None
            continue
        pending_can = None
        if len(cells) == 1 and cells[0][0] == 0:
            current["blocks"].append({"kind": "text", "lines": [fix_text(line) for line in cells[0][1]]})
            continue
        cells_text = [fix_text("\n".join(lines)) for _, lines in row]
        last = current["blocks"][-1] if current["blocks"] else None
        if last and last["kind"] == "grid":
            last["rows"].append(cells_text)
        else:
            current["blocks"].append({"kind": "grid", "rows": [cells_text]})
    return muc


def current_no(muc, current):
    return next(no for no, value in muc.items() if value is current)


# ---------------------------------------------------------------- ghi TypeScript

def ts(value):
    return json.dumps(value, ensure_ascii=False)


def write_dong_cong(pool, months):
    path = os.path.join(ROOT, "shared", "xem-ngay", "dong-cong-data.ts")
    lines = [
        "/**",
        " * Đổng Công soạn trạch nhựt theo giáo trình của khách (\"Giáo trình Trạch Cát Trạng Trình và Đổng Công\").",
        " * File sinh tự động bằng scripts/extract_trach_cat.py — không sửa tay.",
        " *",
        " * `DONG_CONG_TEXTS`: kho lời văn (nhiều ngày dùng chung một lời); mỗi ngày là [lời Nghi – Kị, lời Ảnh hưởng, mức]",
        " * với mức 0–3 = Đại Kiết, Thứ Kiết, Thứ Hung, Đại Hung. `days` theo thứ tự lục thập hoa giáp (Giáp Tý = 0).",
        " * `groups` theo Chi: [Trực, sao / cách cục ghi kèm tên ngày]. `hungSat`: [Thời gian, Hung sát, Phương, Hướng, Kị].",
        " */",
        "",
        "export type DongCongMonth = {",
        "  name: string;",
        "  terms: string;",
        "  hungSat: string[][];",
        "  groups: Record<string, [officer: string, label: string]>;",
        "  days: [nghiKi: number, anhHuong: number, rating: number][];",
        "};",
        "",
        "export const DONG_CONG_TEXTS: string[] = [",
    ]
    lines += [f"  {ts(text)}," for text in pool]
    lines += ["];", "", "/** Tháng tiết khí 1–12 (tháng Giêng = tháng Dần, từ Lập Xuân). */", "export const DONG_CONG_MONTHS: DongCongMonth[] = ["]
    for month in months:
        lines.append("  {")
        lines.append(f"    name: {ts(month['name'])},")
        lines.append(f"    terms: {ts(month['terms'])},")
        lines.append(f"    hungSat: {ts(month['hungSat'])},")
        lines.append(f"    groups: {ts(month['groups'])},")
        lines.append(f"    days: {ts(month['days'])},")
        lines.append("  },")
    lines += ["];", ""]
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    return path


def write_trang_trinh(muc):
    path = os.path.join(ROOT, "shared", "xem-ngay", "trang-trinh-data.ts")
    lines = [
        "/**",
        " * Bát Thập Tam Mục (83 mục việc) theo giáo trình của khách (\"Giáo trình Trạch Cát Trạng Trình và Đổng Công\").",
        " * File sinh tự động bằng scripts/extract_trach_cat.py — không sửa tay.",
        " *",
        " * Mỗi mục giữ đúng thứ tự nội dung trong giáo trình: đoạn văn (`text`), bảng Can → Chi ngày tốt (`days`) và các",
        " * bảng khác giữ nguyên ô (`grid`). Ô rỗng của bảng là chuỗi rỗng; xuống dòng trong ô là \"\\n\".",
        " */",
        "",
        "export type TrangTrinhBlock =",
        "  | { kind: \"text\"; lines: string[] }",
        "  | { kind: \"days\"; days: Record<string, string[]> }",
        "  | { kind: \"grid\"; rows: string[][] };",
        "",
        "export type TrangTrinhContent = { title: string; blocks: TrangTrinhBlock[] };",
        "",
        "export const TRANG_TRINH_CONTENT: Record<number, TrangTrinhContent> = {",
    ]
    for no in sorted(muc):
        item = muc[no]
        lines.append(f"  {no}: {{")
        lines.append(f"    title: {ts(item['title'])},")
        lines.append("    blocks: [")
        for block in item["blocks"]:
            lines.append(f"      {ts(block)},")
        lines.append("    ],")
        lines.append("  },")
    lines += ["};", ""]
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    return path


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    rows = read_rows(sys.argv[1])
    months = parse_dong_cong(rows)
    if sorted(months) != list(range(1, 13)):
        raise SystemExit(f"Thiếu tháng Đổng Công: có {sorted(months)}")
    pool, dong_cong = build_dong_cong(months)
    muc = parse_trang_trinh(rows)
    missing = sorted(set(range(1, 84)) - set(muc))
    if missing:
        raise SystemExit(f"Thiếu mục Trạng Trình: {missing}")
    print(write_dong_cong(pool, dong_cong), f"— 12 tháng × 60 ngày, {len(pool)} lời văn")
    print(write_trang_trinh(muc), f"— {len(muc)} mục")
    for line in dict.fromkeys(log):
        print(" ·", line)


if __name__ == "__main__":
    main()
