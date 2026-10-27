"""Chuyển "Phụ lục chi tiết 64 quẻ Kinh Dịch" (PDF) thành ảnh WebP từng trang cho trình xem trên trang Gieo quẻ.

Khách yêu cầu tài liệu chỉ được XEM, không cho tải về, và chỉ học viên được cấp mã mới xem được: tệp gốc nằm ở
`assets/phu-luc-64-que/`, ảnh từng trang ở `assets/phu-luc-64-que/trang/trang-001.webp` … — cả hai đều không nằm trong
`public/`; máy chủ chỉ trả ảnh qua `/api/hoc-vien/phu-luc/…` cho phiên đã nhập mã học viên. Khi khách gửi bản PDF mới,
thay tệp gốc rồi chạy lại:

    python3 scripts/render_phu_luc_64_que.py

Cần PyMuPDF (`pip install pymupdf`) và Pillow có hỗ trợ WebP. Nếu số trang thay đổi, cập nhật `APPENDIX` trong
`src/components/fengshui/IChingToolView.tsx` (số trang, số trang in của trang đầu, kích thước ảnh).
"""

import glob
import os
import sys

import fitz  # PyMuPDF
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "assets", "phu-luc-64-que", "phu-luc-64-que-kinh-dich.pdf")
OUT_DIR = os.path.join(ROOT, "assets", "phu-luc-64-que", "trang")
WIDTH = 1000  # px — đủ nét để đọc bảng tra trên màn hình retina cỡ laptop, ~90 KB/trang
QUALITY = 68


def main() -> None:
    doc = fitz.open(SOURCE)
    os.makedirs(OUT_DIR, exist_ok=True)
    for old in glob.glob(os.path.join(OUT_DIR, "trang-*.webp")):
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
    print(f"{len(doc)} trang, ảnh {size[0]}×{size[1]} px, tổng {total // 1024} KB → {os.path.relpath(OUT_DIR, ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
