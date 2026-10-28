"""Chuyển file ebook Thần số học mẫu (PDF) thành ảnh WebP từng trang cho khối "Ebook Mẫu" dưới nút Tra cứu ngay.

Khách muốn khách hàng thấy trước file PDF đầy đủ trông thế nào (bản mẫu của Elon Reeve Musk, 28/06/1971) nên trang web
chỉ hiển thị ảnh từng trang trong trình xem chỉ đọc, không phát hành file PDF. Ảnh ghi vào
`public/assets/ebook-mau/trang-001.webp` … (công khai, vì đây là bản giới thiệu).

File PDF lấy từ trang /ebook (xuất bản đầy đủ cho Elon Reeve Musk) hoặc bản khách gửi, rồi chạy:

    python3 scripts/render_ebook_mau.py <đường-dẫn-file.pdf>

Cần PyMuPDF (`pip install pymupdf`) và Pillow có hỗ trợ WebP. Nếu số trang thay đổi, cập nhật `SAMPLE_EBOOK` trong
`src/components/lookup/SampleEbook.tsx` (số trang, kích thước ảnh).
"""

import glob
import os
import sys

import fitz  # PyMuPDF
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "assets", "ebook-mau")
WIDTH = 900  # px — đủ đọc trên điện thoại và laptop, ~100 KB/trang
QUALITY = 70
THUMB_WIDTH = 320


def main() -> int:
    if len(sys.argv) != 2:
        print("Cách dùng: python3 scripts/render_ebook_mau.py <file.pdf>", file=sys.stderr)
        return 2
    doc = fitz.open(sys.argv[1])
    os.makedirs(OUT_DIR, exist_ok=True)
    for old in glob.glob(os.path.join(OUT_DIR, "*.webp")):
        os.remove(old)
    total = 0
    size = (0, 0)
    for index, page in enumerate(doc):
        zoom = WIDTH / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        path = os.path.join(OUT_DIR, f"trang-{index + 1:03d}.webp")
        image.save(path, "WEBP", quality=QUALITY, method=6)
        total += os.path.getsize(path)
        size = image.size
    # Ảnh bìa nhỏ cho thẻ "Ebook Mẫu" (không phải tải ảnh trang cỡ lớn chỉ để làm hình minh hoạ).
    cover = Image.open(os.path.join(OUT_DIR, "trang-001.webp"))
    cover.thumbnail((THUMB_WIDTH, THUMB_WIDTH * 2))
    cover.save(os.path.join(OUT_DIR, "bia-nho.webp"), "WEBP", quality=QUALITY, method=6)
    print(f"{len(doc)} trang, ảnh {size[0]}×{size[1]} px, tổng {total // 1024} KB → {os.path.relpath(OUT_DIR, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
