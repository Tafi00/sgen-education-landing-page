"""Tách các trang thiết kế gốc từ "bảng chuẩn" ebook Thần số học đầy đủ cho bộ dựng ebook (`numerologyFullPdf.ts`).

Khách gửi bản chuẩn xuất từ phần mềm gốc (ELON MUSK 28061971.pdf, 76 trang, 28/10/2026) và yêu cầu ebook đầy đủ trên web
có các trang bên trong giống bản đó. Script này lấy từng trang cần dùng, ghi vào `assets/numerology-pdf/chuan/<tên>.pdf`:

- Bỏ chân trang cũ ("… - Trang NN"; bộ dựng in lại số trang đúng vị trí) và cặp xoáy góc dưới (vẽ véc-tơ ~1,3 MB mỗi
  trang; bộ dựng vẽ lại bằng khung dùng chung `full/frame.pdf`). Hai phần này được nhận ra bằng cách bỏ thử từng khối
  lệnh rồi so ảnh: khối chân trang chỉ làm đổi dải dưới cùng, nhóm xoáy chỉ làm đổi hai góc dưới.
- Trang "Cảm nhận khách hàng" bỏ thêm họ tên/ngày sinh mẫu (bộ dựng in tên khách vào đúng chỗ).
- Ảnh minh hoạ lớn chuyển sang JPEG ở ~200 dpi theo kích thước hiển thị để file ebook không quá nặng.

Cách chạy (cần PyMuPDF và Pillow):

    python3 scripts/build_ebook_chuan.py <bản-chuẩn.pdf>

Trang luận giải theo con số chỉ có các con số của hồ sơ mẫu (Elon Reeve Musk); khi khách gửi thêm bộ trang gốc của các
con số khác thì thêm vào `PAGES` và bảng `DESIGNED_VALUE_PAGES` trong `numerologyFullPdf.ts`.
"""

import io
import os
import re
import sys

import fitz  # PyMuPDF
from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "numerology-pdf", "chuan")

# Số trang trong bản chuẩn (đếm từ 1) → tên tệp. Trang 1–7, 44–47, 52–53, 73 và 76 đã có trong bộ mẫu cũ (giống hệt).
PAGES = {
    8: "chuong-1",
    9: "the-gioi-ben-trong",
    10: "noi-tam",
    11: "noi-tam-2",
    12: "tiem-thuc",
    13: "tiem-thuc-7",
    14: "logic",
    15: "logic-8",
    16: "cam-xuc",
    17: "cam-xuc-7",
    18: "truc-giac",
    19: "truc-giac-9",
    20: "trai-nghiem",
    21: "trai-nghiem-6",
    22: "the-gioi-ben-ngoai",
    23: "so-lap",
    24: "so-lap-1",
    25: "so-lap-7",
    26: "thai-do",
    27: "thai-do-7",
    28: "tuong-tac",
    29: "tuong-tac-1",
    30: "chuong-2",
    31: "can-bang",
    32: "can-bang-9",
    33: "bai-hoc-nghiep",
    34: "bai-hoc-nghiep-7",
    35: "bai-hoc-nghiep-8",
    36: "no-nghiep",
    37: "no-nghiep-13-4",
    38: "no-nghiep-14-5",
    39: "no-nghiep-16-7",
    40: "no-nghiep-19-1",
    41: "chuong-3",
    42: "nam-ca-nhan",
    43: "nam-ca-nhan-8",
    48: "ngay-sinh",
    49: "ngay-sinh-1",
    50: "truong-thanh",
    51: "truong-thanh-1",
    54: "chang-duong-doi",
    55: "dinh-1-7",
    56: "dinh-2-1",
    57: "dinh-3-8",
    58: "dinh-4-6",
    59: "ikigai",
    60: "to-hop-tam-tri",
    61: "to-hop-kinh-doanh",
    62: "to-hop-sang-tao",
    63: "chuong-4",
    64: "ket-noi-noi-tam-tuong-tac",
    65: "ket-noi-noi-tam-tuong-tac-1",
    66: "ket-noi-su-menh-duong-doi",
    67: "ket-noi-su-menh-duong-doi-4",
    68: "bieu-do-ngay-sinh",
    69: "bieu-do-ho-ten",
    70: "mui-ten-day-du",
    71: "mui-ten-trong",
    72: "chuong-5",
    74: "loi-cam-on",
    75: "cam-nhan-khach-hang",
}
# Chữ riêng của hồ sơ mẫu cần bỏ (bộ dựng in lại theo khách).
PERSONAL_TEXT = {75: ["ELON REEVE MUSK", "28/06/1971"]}

ZOOM = 0.5
JPEG_QUALITY = 82
TARGET_DPI = 200

# Tách khối giống `stripTemplateSource` trong numerologyFullPdf.ts.
SPACE = r"[\0\t\n\f\r ]"
SAVE_RESTORE = re.compile(rf"(?<={SPACE})[qQ](?={SPACE})|^[qQ](?={SPACE})")
TEXT_OBJECT = re.compile(r"BT\b[\s\S]*?\bET\b")


def analyse(source, level=0):
    """Khối BT…ET và các nhóm q…Q mở ở độ sâu `level` (0 = cấp ngoài cùng)."""
    blocks = [(m.start(), m.end()) for m in TEXT_OBJECT.finditer(source)]
    groups, depth, start = [], 0, 0
    for m in SAVE_RESTORE.finditer(source):
        if m.group() == "q":
            if depth == level:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == level:
                groups.append((start, m.end()))
    return blocks, groups


def cut(source, spans):
    out, last = [], 0
    for a, b in sorted(spans):
        out.append(source[last:a])
        last = b
    return "".join(out) + source[last:]


def set_source(doc, source):
    xrefs = doc[0].get_contents()
    doc.update_stream(xrefs[0], source.encode("latin1"))
    for xref in xrefs[1:]:
        doc.update_stream(xref, b"")


def render(doc):
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def changed_box(a, b):
    box = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0).getbbox()
    return None if box is None else tuple(v / ZOOM for v in box)


def strip_spans(doc, personal):
    """Khối chân trang, nhóm xoáy góc và (nếu có) khối chữ riêng của hồ sơ mẫu cần bỏ khỏi trang."""
    source = b"".join(doc.xref_stream(x) for x in doc[0].get_contents()).decode("latin1")
    width, height = doc[0].rect.width, doc[0].rect.height
    base = render(doc)
    base_text = doc[0].get_text()
    swirls, footer, own = [], [], []
    # Đa số trang vẽ xoáy ở cấp ngoài cùng; vài trang bọc cả trang trong một nhóm q…Q nên xoáy nằm ở cấp kế tiếp.
    for level in (0, 1):
        blocks, groups = analyse(source, level)
        for span in groups:
            if span[1] - span[0] < 50_000:
                continue
            set_source(doc, cut(source, [span]))
            box = changed_box(base, render(doc))
            if box and box[1] > height - 160 and (box[2] < 150 or box[0] > width - 150):
                swirls.append(span)
        if swirls:
            break
    for span in blocks:
        set_source(doc, cut(source, [span]))
        box = changed_box(base, render(doc))
        if box and box[1] > height - 40:
            footer.append(span)
        elif personal and box:
            text = doc[0].get_text()
            if any(item in base_text and item not in text for item in personal):
                own.append(span)
    set_source(doc, source)
    return source, swirls, footer, own


def shrink_images(doc):
    """Ảnh lớn (không có mặt nạ trong suốt) → JPEG ~200 dpi theo khung hiển thị."""
    page = doc[0]
    for info in page.get_images(full=True):
        xref, smask, width, height = info[0], info[1], info[2], info[3]
        if smask or width * height < 150_000:
            continue
        shown = page.get_image_bbox(info)
        target = max(1, round(shown.width / 72 * TARGET_DPI))
        pix = fitz.Pixmap(doc, xref)
        if pix.n - pix.alpha != 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        if image.width > target:
            image = image.resize((target, round(image.height * target / image.width)), Image.LANCZOS)
        buffer = io.BytesIO()
        image.save(buffer, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        page.replace_image(xref, stream=buffer.getvalue())


def main() -> int:
    if len(sys.argv) != 2:
        print("Cách dùng: python3 scripts/build_ebook_chuan.py <bản-chuẩn.pdf>", file=sys.stderr)
        return 2
    std = fitz.open(sys.argv[1])
    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for number, slug in PAGES.items():
        doc = fitz.open()
        doc.insert_pdf(std, from_page=number - 1, to_page=number - 1)
        original = render(doc)
        source, swirls, footer, own = strip_spans(doc, PERSONAL_TEXT.get(number))
        if len(swirls) != 2 or not footer or (number in PERSONAL_TEXT and not own):
            print(f"Trang {number} ({slug}): không nhận ra đủ xoáy góc/chân trang ({len(swirls)} xoáy, {len(footer)} khối chân trang)", file=sys.stderr)
            return 1
        set_source(doc, cut(source, swirls + footer + own))
        shrink_images(doc)
        # Ngoài dải chân trang + xoáy góc (và dòng tên mẫu) trang phải giữ nguyên.
        # Ảnh JPEG lệch vài mức màu là bình thường; chỉ báo lỗi khi có vùng đổi rõ.
        keep = (0, 0, round(doc[0].rect.width * ZOOM), round((doc[0].rect.height - 62) * ZOOM))
        diff = ImageChops.difference(original.crop(keep), render(doc).crop(keep)).convert("L")
        changed = sum(diff.histogram()[48:]) / (diff.width * diff.height)
        if changed > 0.002 and not own:
            print(f"Trang {number} ({slug}): phần thân bị đổi {changed:.2%}", file=sys.stderr)
            return 1
        path = os.path.join(OUT_DIR, f"{slug}.pdf")
        doc.save(path, garbage=4, deflate=True)
        size = os.path.getsize(path)
        total += size
        print(f"{number:02d} → chuan/{slug}.pdf {size // 1024} KB (bỏ {len(footer)} khối chân trang, {len(own)} khối tên mẫu)")
    print(f"{len(PAGES)} trang, tổng {total // 1024} KB → {os.path.relpath(OUT_DIR, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
