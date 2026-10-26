"""Sinh dữ liệu Thập nhị trực và Nhị thập bát tú cho thẻ giải nghĩa trang Xem ngày từ giáo trình của khách.

Nguồn: "Giáo trình Trạch Cát Lý Số.docx" (khách gửi 26/10/2026):
  - chương "Chọn ngày theo Thập nhị trực": bảng "Thập nhị địa chi chú giảng" (tên khác, tính chất), bảng ngũ hành,
    Hoàng đạo / Hắc đạo, mục 4 "Ý nghĩa Cát – Hung Thập nhị trực" (Nên / Kị);
  - bảng "12 Trực" của "Chọn ngày theo Bành Tổ kỵ nhật";
  - chương "Nhị thập bát tú luận kiết hung": nhóm toàn cát / toàn hung / trung bình, bảng 28 sao, lời từng sao
    (tướng tinh, hai nguồn, ba bài thơ, Nên làm / Kiêng cữ / Ngoại lệ) và mục "Kim thần Thất sát".
Chạy lại khi khách gửi bản giáo trình mới:

    python3 -I scripts/extract_ly_so.py "/đường/dẫn/Giáo trình Trạch Cát Lý Số.docx"

Ghi đè `shared/xem-ngay/truc-tu-data.ts`, in ra các chỗ đã sửa chữ / nối dòng.
Chỉ dùng thư viện chuẩn: đọc thẳng word/document.xml.
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

TRUC = ["Kiên", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thâu", "Khai", "Bế"]
# Tên 28 sao đúng như engine (shared/xem-ngay/rules.ts → TU28) để thẻ tra thẳng theo tên đang hiện trên bảng.
TU28 = [
    "Giác Mộc Giao", "Can Kim Long", "Đê Thổ Lạc", "Phòng Nhật Thố", "Tâm Nguyệt Hồ", "Vĩ Hỏa Hổ", "Cơ Thủy Báo",
    "Đẩu Mộc Giải", "Ngưu Kim Ngưu", "Nữ Thổ Bức", "Hư Nhật Thử", "Nguy Nguyệt Yến", "Thất Hỏa Trư", "Bích Thủy Du",
    "Khuê Mộc Lang", "Lâu Kim Cẩu", "Vị Thổ Trĩ", "Mão Nhật Kê", "Tất Nguyệt Ô", "Chủy Hỏa Hầu", "Sâm Thủy Viên",
    "Tỉnh Mộc Can", "Quỷ Kim Dương", "Liễu Thổ Chương", "Tinh Nhật Mã", "Trương Nguyệt Lộc", "Dực Hỏa Xà", "Chẩn Thủy Dẫn",
]
# Tên sao giáo trình viết khác engine.
TU_ALIASES = {"Cang": "Can", "Vỹ": "Vĩ", "Chuỷ": "Chủy", "Dục": "Dực"}

# Sao mà dòng "Theo …" ở lời chi tiết mâu thuẫn với chính giáo trình: lời chi tiết sao Quỷ ghi "Tốt mọi việc" /
# "Xấu, riêng xây dựng tốt" (trùng y chữ sao Chủy, Sâm) trong khi bảng 28 sao ghi "Xấu mọi việc" / "Xấu, riêng mai táng
# tốt", khớp nhóm "Quỷ [Chỉ mai táng tốt]" và "Nên làm: Chôn cất…" → dùng bảng 28 sao.
PREFER_SUMMARY = {"Quỷ Kim Dương"}

# Cách bỏ dấu cũ → cách viết dùng trên trang (cùng chữ, chỉ khác vị trí dấu).
SPELLING = {"Thuỷ": "Thủy", "Hoả": "Hỏa"}

# Lỗi gõ hiển nhiên (chỉ sửa chữ, không đổi ý); in ra khi áp dụng. Áp lên cả đoạn nhiều dòng ("\n").
TEXT_FIXES = [
    # Thập nhị trực
    ("Bỏ cái củ", "Bỏ cái cũ"),
    ("mổ xe hay", "mổ xẻ hay"),
    ("gát đòn dông", "gác đòn dông"),
    ("đòn dông,,", "đòn dông,"),
    ("an sang,", "an sàng,"),
    ("Kiện tụn,", "Kiện tụng,"),
    ("trôm cướp", "trộm cướp"),
    ("cầu than,", "cầu thân,"),
    ("nên nao vét", "nên nạo vét"),
    # Nhị thập bát tú
    ("cưới gã", "cưới gả"),
    ("Cưới gã", "Cưới gả"),
    ("chon cất", "chôn cất"),
    ("CHôn cất", "Chôn cất"),
    ("Vănh nhân", "Văn nhân"),
    ("Can tinh tạo tác", "Cang tinh tạo tác"),
    ("Tốt tang tài lộc", "Tốt tăng tài lộc"),
    ("không cò việc", "không có việc"),
    ("Tâm linh tạo tác", "Tâm tinh tạo tác"),
    ("Chẩn chinh tạo tác", "Chẩn tinh tạo tác"),
    ("mương rảnh", "mương rãnh"),
    ("Sửa mã,", "Sửa mả,"),
    ("mồ mã", "mồ mả"),
    ("cô mien", "cô miên"),
    ("phúc lien miên", "phúc liên miên"),
    ("NHƯNg", "NHƯNG"),
    ("bât khả", "bất khả"),
    ("Giá thu hôn", "Giá thú hôn"),
    ("tạo ác tiến", "tạo tác tiến"),
    ("Phục Đọan", "Phục Đoạn"),
    ("khai ngôn, hoa chẳng", "khai môn, họa chẳng"),
    ("rạng tong đường", "rạng tông đường"),
    ("Mãi dắc", "Mãi đắc"),
    ("nhâtj", "nhật"),
    ("đẹ nhất", "đệ nhất"),
    ("đước tiền", "được tiền"),
    ("Phúc vô ưu!.", "Phúc vô ưu!"),
    ("Sao thất Đại", "Sao Thất Đại"),
    ("Sao sâm Đăng", "Sao Sâm Đăng"),
    ("Sao tất Đăng", "Sao Tất Đăng"),
    ("Tại tị", "Tại Tị"),
    ("Tại dậu", "Tại Dậu"),
    ("Đinh sửu", "Đinh Sửu"),
    ("Ngày Chủ nhật", "Ngày Chủ Nhật"),
    # Bài bát cú sao Tỉnh: chữ "Khai môn" (gõ "Khai môm") bị dính lên cuối câu 4 thay vì đầu câu 5.
    ("hoàng điên tuyền Khai môm.\n\nphóng thủy", "hoàng điên tuyền.\n\nKhai môn phóng thủy"),
]

log = []


def nfc(text):
    return unicodedata.normalize("NFC", text or "").replace("Ð", "Đ").replace("\xa0", " ")


def tidy(text):
    """Gộp khoảng trắng, bỏ khoảng trắng trước dấu câu / sát ngoặc (chỉ đổi khoảng trắng)."""
    out = re.sub(r"[ \t]+", " ", nfc(text)).strip()
    out = re.sub(r" +([,.;:!?)])", r"\1", out)
    out = re.sub(r"\( +", "(", out)
    return out


def fix(text):
    out = text
    for wrong, right in TEXT_FIXES:
        if wrong in out:
            log.append(f"sửa chữ: {wrong!r} → {right!r}")
            out = out.replace(wrong, right)
    return out


def spell(text):
    for wrong, right in SPELLING.items():
        text = text.replace(wrong, right)
    return text


def lines_of(paras):
    """Các đoạn của một ô → danh sách dòng đã gọn khoảng trắng, sửa chữ; giữ một dòng trống giữa hai khổ."""
    raw = []
    for p in paras:
        raw.extend(tidy(line) for line in nfc(p).split("\n"))
    text = "\n".join(raw)
    text = re.sub(r"\n{3,}", "\n\n", fix(text)).strip("\n")
    return text.split("\n") if text else []


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


def read_blocks(docx):
    """Thân văn bản thành dãy khối: ("p", chữ) hoặc ("tbl", [hàng → [ô → [đoạn]]])."""
    with zipfile.ZipFile(docx) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    blocks = []
    for child in root.find(W + "body"):
        if child.tag == W + "p":
            blocks.append(("p", nfc(para_text(child))))
        elif child.tag == W + "tbl":
            rows = []
            for tr in child.iter(W + "tr"):
                rows.append([[nfc(para_text(p)) for p in tc.findall(W + "p")] for tc in tr.findall(W + "tc")])
            blocks.append(("tbl", rows))
    return blocks


def cell_text(cell):
    return " ".join(tidy(p) for p in cell if tidy(p))


def find_block(blocks, start, predicate):
    for index in range(start, len(blocks)):
        if predicate(*blocks[index]):
            return index
    raise SystemExit("Không tìm thấy khối cần đọc trong giáo trình")


def para_index(blocks, text, start=0):
    return find_block(blocks, start, lambda kind, value: kind == "p" and text in value)


# ---------------------------------------------------------------- Thập nhị trực

def truc_key(text):
    name = tidy(text).title().replace("Kiến", "Kiên")
    if name not in TRUC:
        raise SystemExit(f"Tên trực lạ: {text!r}")
    return name


def parse_truc(blocks):
    chapter = para_index(blocks, "CHỌN NGÀY THEO THẬP NHỊ TRỰC")
    out = {name: {"name": name, "order": order + 1} for order, name in enumerate(TRUC)}

    table = find_block(blocks, chapter, lambda kind, value: kind == "tbl" and "CHÚ GIẢNG" in cell_text(value[0][0]))
    for row in blocks[table][1]:
        cells = [cell_text(cell) for cell in row]
        if len(cells) == 4 and cells[0].isdigit():
            item = out[truc_key(cells[1])]
            item["otherName"], item["nature"] = cells[2], cells[3]

    table = find_block(blocks, chapter, lambda kind, value: kind == "tbl" and cell_text(value[0][0]) == "Kim")
    heads, names = blocks[table][1][0], blocks[table][1][1]
    for head, cell in zip(heads, names):
        for name in re.split(r"[,\s]+", cell_text(cell)):
            if name:
                out[truc_key(name)]["element"] = spell(cell_text(head))

    for label in ("Hoàng đạo", "Hắc đạo"):
        index = para_index(blocks, f"+ {label}:", chapter)
        for name in re.split(r"[,.\s]+", blocks[index][1].split(":", 1)[1]):
            if name:
                out[truc_key(name)]["dao"] = label

    start = para_index(blocks, "Ý NGHĨA CÁT - HUNG THẬP NHỊ TRỰC", chapter)
    end = para_index(blocks, "CHỌN NGÀY THEO BÀNH TỔ KỴ NHẬT", start)
    current = None
    for kind, value in blocks[start:end]:
        if kind != "tbl":
            continue
        for row in value:
            cells = [cell_text(cell) for cell in row]
            if len(cells) == 1 and cells[0].startswith("TRỰC "):
                current = out[truc_key(cells[0][5:])]
            elif len(cells) == 2 and cells[0] in ("Nên", "Kị"):
                current["nen" if cells[0] == "Nên" else "ki"] = " ".join(lines_of(row[1]))

    table = find_block(blocks, end, lambda kind, value: kind == "tbl" and cell_text(value[0][0]) == "12 TRỰC")
    for row in blocks[table][1][1:]:
        out[truc_key(cell_text(row[0]))]["banhTo"] = [line for line in lines_of(row[1]) if line]

    items = [out[name] for name in TRUC]
    for item in items:
        missing = {"otherName", "nature", "element", "dao", "nen", "ki", "banhTo"} - set(item)
        if missing:
            raise SystemExit(f"Trực {item['name']} thiếu {sorted(missing)}")
    return items


# ---------------------------------------------------------------- Nhị thập bát tú

def tu_key(text):
    """Tên ngắn của sao theo giáo trình → vị trí trong TU28."""
    short = tidy(text).split(" ")[0]
    short = TU_ALIASES.get(short, short)
    for index, name in enumerate(TU28):
        if name.split(" ")[0] == short:
            return index
    raise SystemExit(f"Tên sao lạ: {text!r}")


def parse_groups(blocks, start):
    groups = {}
    for label in ("toàn cát", "toàn hung", "trung bình"):
        index = para_index(blocks, f"Tú “{label}”:", start)
        body = blocks[index][1].split(":", 1)[1]
        body = re.sub(r"\.\s*\d+\s*tú\.?$", "", tidy(body))
        for part in re.finditer(r"([^,\[\]]+?)\s*(?:\[([^\]]*)\])?\s*(?:,|$)", body):
            name = part.group(1).strip()
            if not name:
                continue
            groups[tu_key(name)] = (label, tidy(part.group(2)) if part.group(2) else None)
    return groups


def parse_summary(blocks, start):
    table = find_block(blocks, start, lambda kind, value: kind == "tbl" and cell_text(value[0][0]) == "Số TT")
    out = {}
    for row in blocks[table][1][1:]:
        cells = [cell_text(cell) for cell in row]
        out[tu_key(cells[1])] = {"animal": cells[2], "thuoc": spell(cells[3]), "thanBi": cells[4], "thaiBaLe": cells[5]}
    return out


def split_info(paras):
    """Ô "- Nên làm / - Kiêng cữ / - Ngoại lệ" → (nên, kỵ, [ngoại lệ])."""
    nen = ky = None
    extra = []
    for line in lines_of(paras):
        if not line:
            continue
        match = re.match(r"-\s*(Nên làm|Kỵ làm|Kiêng cử)\s*:\s*(.*)", line, re.I)
        if match:
            if match.group(1).lower() == "nên làm":
                nen = match.group(2)
            else:
                ky = match.group(2)
            continue
        match = re.match(r"-\s*Ngoại lệ\s*:\s*(.*)", line, re.I)
        line = match.group(1) if match else re.sub(r"^\+\s*", "", line)
        if extra and line[:1].islower():
            log.append(f"nối dòng ngoại lệ bị ngắt: {extra[-1][-20:]!r} + {line[:20]!r}")
            extra[-1] = f"{extra[-1]} {line}"
        else:
            extra.append(line)
    if nen is None or ky is None or not extra:
        raise SystemExit(f"Ô Nên / Kiêng / Ngoại lệ lạ: {paras!r}")
    return nen, ky, extra


def parse_stars(blocks, start, end):
    rows = [row for kind, value in blocks[start:end] if kind == "tbl" for row in value]
    stars = {}
    for index, row in enumerate(rows):
        head = lines_of(row[0]) if len(row) == 1 else []
        title = next((line for line in head if line), "")
        if not any(line.startswith("Tướng tinh:") for line in head):
            continue
        poem, bat_cu, info = rows[index + 1], rows[index + 2], rows[index + 3]
        if len(poem) != 2 or len(bat_cu) != 1 or len(info) != 1:
            raise SystemExit(f"Khối sao {title} không đủ 4 hàng như mẫu")
        star = {"heading": title}
        for line in head:
            match = re.match(r"Tướng tinh:\s*(.+?)\s+-\s+Chủ trì\s+(.+)", line)
            if match:
                star["tuongTinh"], star["chuTri"] = match.group(1), match.group(2)
            elif line.startswith("Theo Thần Bí Trạch Cát TQ:"):
                star["thanBi"] = line.split(":", 1)[1].strip()
            elif line.startswith("Theo Tuyển Trạch Thông Thư"):
                star["thaiBaLe"] = line.split(":", 1)[1].strip()
        star["tuTuyet"] = lines_of(poem[0])
        star["dich"] = lines_of(poem[1])
        star["batCu"] = lines_of(bat_cu[0])
        star["nen"], star["ky"], star["ngoaiLe"] = split_info(info[0])
        stars[tu_key(title)] = star
    return stars


def parse_tu28(blocks):
    start = para_index(blocks, "NHỊ THẬP BÁT TÚ LUẬN KIẾT HUNG")
    end = para_index(blocks, "KIM THẦN THẤT SÁT", start)
    groups = parse_groups(blocks, start)
    summary = parse_summary(blocks, start)
    stars = parse_stars(blocks, start, end)

    kim_than_index = para_index(blocks, "“Kim thần Thất sát”", end)
    kim_than_text = fix(tidy(blocks[kim_than_index][1]))
    listed = kim_than_text.rsplit("Đó là:", 1)[1]
    kim_than = {tu_key(name) for name in re.split(r"[,.\s]+", listed) if name}

    items = []
    for index, key in enumerate(TU28):
        if index not in groups or index not in summary or index not in stars:
            raise SystemExit(f"Thiếu sao {key} trong nhóm / bảng / lời chi tiết")
        group, note = groups[index]
        star, row = stars[index], summary[index]
        for field in ("thanBi", "thaiBaLe"):
            listed = fix(row[field]).lstrip("+ ")
            if listed.rstrip(".") != star[field].rstrip("."):
                use = "bảng 28 sao" if key in PREFER_SUMMARY else "lời chi tiết"
                log.append(f"{key}: bảng 28 sao ghi {field} = {listed!r}, lời chi tiết ghi {star[field]!r} (dùng {use})")
                if key in PREFER_SUMMARY:
                    star[field] = listed
        item = {
            "key": key,
            "name": tidy(star["heading"]).split(" ")[0],
            "tuongTinh": star["tuongTinh"],
            "chuTri": star["chuTri"],
            "thuoc": row["thuoc"],
            "nhom": group,
        }
        if note:
            item["nhomNote"] = note
        item.update({
            "thanBi": star["thanBi"],
            "thaiBaLe": star["thaiBaLe"],
            "nen": star["nen"],
            "ky": star["ky"],
            "ngoaiLe": star["ngoaiLe"],
            "tuTuyet": star["tuTuyet"],
            "dich": star["dich"],
            "batCu": star["batCu"],
            "kimThan": index in kim_than,
        })
        items.append(item)
    return items, kim_than_text


# ---------------------------------------------------------------- ghi file

def ts(value):
    return json.dumps(value, ensure_ascii=False)


def write_data(truc, tu28, kim_than):
    path = os.path.join(ROOT, "shared", "xem-ngay", "truc-tu-data.ts")
    lines = [
        "/**",
        " * Thập nhị trực và Nhị thập bát tú theo giáo trình của khách (\"Giáo trình Trạch Cát Lý Số\").",
        " * File sinh tự động bằng scripts/extract_ly_so.py — không sửa tay.",
        " *",
        " * Lời văn giữ nguyên giáo trình (chỉ gọn khoảng trắng, sửa lỗi gõ hiển nhiên — xem TEXT_FIXES trong script).",
        " * Thơ là mảng dòng, dòng rỗng ngăn hai khổ.",
        " */",
        "",
        "export type TrucGiaoTrinh = {",
        "  /** Tên trực như bảng \"Thập nhị địa chi chú giảng\". */",
        "  name: string;",
        "  order: number;",
        "  /** Cột \"Tên khác\". */",
        "  otherName: string;",
        "  /** Cột \"Tính chất\": Kiết, Hung hoặc Kiết Hung. */",
        "  nature: string;",
        "  /** Mục 3 \"Tính ngũ hành của trực\". */",
        "  element: string;",
        "  dao: \"Hoàng đạo\" | \"Hắc đạo\";",
        "  /** Mục 4 \"Ý nghĩa Cát – Hung Thập nhị trực\". */",
        "  nen: string;",
        "  ki: string;",
        "  /** Bành Tổ kỵ nhật của trực: [câu Hán Việt, lời dịch]. */",
        "  banhTo: string[];",
        "};",
        "",
        "export type TuGiaoTrinh = {",
        "  /** Tên sao như engine (rules.ts → TU28). */",
        "  key: string;",
        "  /** Tên ngắn như giáo trình viết. */",
        "  name: string;",
        "  tuongTinh: string;",
        "  chuTri: string;",
        "  /** Cột \"Thuộc\" của bảng 28 sao. */",
        "  thuoc: string;",
        "  /** Nhóm trong \"Nhị thập bát tú luận kiết hung\" và lời ghi kèm trong ngoặc (nếu có). */",
        "  nhom: \"toàn cát\" | \"toàn hung\" | \"trung bình\";",
        "  nhomNote?: string;",
        "  /** \"Theo Thần Bí Trạch Cát TQ\". */",
        "  thanBi: string;",
        "  /** \"Theo Tuyển Trạch Thông Thư và của Thái Bá Lệ\". */",
        "  thaiBaLe: string;",
        "  nen: string;",
        "  ky: string;",
        "  ngoaiLe: string[];",
        "  /** Thất ngôn tứ tuyệt (Hán Việt), bài dịch, thất ngôn bát cú (Hứa Chân Quân). */",
        "  tuTuyet: string[];",
        "  dich: string[];",
        "  batCu: string[];",
        "  /** Thuộc 7 sao \"Kim thần Thất sát\". */",
        "  kimThan: boolean;",
        "};",
        "",
        "export const TRUC_GIAO_TRINH: TrucGiaoTrinh[] = [",
    ]
    lines += [f"  {ts(item)}," for item in truc]
    lines += ["];", "", "export const TU28_GIAO_TRINH: TuGiaoTrinh[] = ["]
    lines += [f"  {ts(item)}," for item in tu28]
    lines += ["];", "", "/** Mục \"Kim thần Thất sát\" của giáo trình. */", f"export const KIM_THAN_THAT_SAT = {ts(kim_than)};", ""]
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    return path


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    blocks = read_blocks(sys.argv[1])
    truc = parse_truc(blocks)
    tu28, kim_than = parse_tu28(blocks)
    print(write_data(truc, tu28, kim_than), f"— {len(truc)} trực, {len(tu28)} sao")
    for line in dict.fromkeys(log):
        print(" ·", line)


if __name__ == "__main__":
    main()
