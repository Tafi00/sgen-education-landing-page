"""Tách trang luận giải theo con số từ bộ trang gốc `pdf_full` của phần mềm ebook trên Macbook cho bản đầy đủ.

Khách gửi `pdf_full.zip` (15/11/2026): thư mục từng chương của phần mềm gốc, mỗi chỉ số có trang giới thiệu `_000` và một
trang thiết kế (ảnh minh hoạ riêng) cho từng con số — `NoiTam_002.pdf` là Nội tâm 2, `NoiTam_0013.pdf` là Nội tâm 13/4,
`KNNoiTamTuongTac_So3.pdf` là Kết nối Nội tâm & Tương tác 3. Phần mềm gốc ghép nguyên các trang này; ebook đầy đủ trên web
làm y như vậy thay cho trang tự dựng (chỉ có chữ).

Thư mục `Những trang update ngày …` chỉ là bản lưu các lần sửa: thư mục chương đã chứa bản mới nhất (đối chiếu 15/11/2026),
nên script chỉ đọc thư mục chương.

Mỗi trang được xử lý như `build_ebook_chuan.py` (bỏ chân trang cũ + cặp xoáy góc, ảnh minh hoạ → JPEG ~200 dpi) rồi ghi vào
`assets/numerology-pdf/chuan/<chỉ-số>-<con số>.pdf`. Trang của số nợ nghiệp (13, 14, 16, 19) thường giống hệt trang căn số
(4, 5, 7, 1): khi ảnh dựng ra trùng từng điểm ảnh thì chỉ giữ một tệp. Bảng tra con số → tệp ghi ở
`assets/numerology-pdf/chuan/trang-theo-so.json` (bộ dựng `numerologyFullPdf.ts` đọc bảng này).

Cách chạy (cần PyMuPDF và Pillow):

    python3 scripts/build_ebook_trang_goc.py <thư-mục pdf_full> [--force]

Tệp đã có trong `chuan/` được giữ nguyên (các trang của bản chuẩn Elon Musk tách từ trước); `--force` để tách lại tất cả.
"""

import hashlib
import json
import os
import re
import sys
from multiprocessing import Pool

import fitz  # PyMuPDF

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_ebook_chuan import OUT_DIR, cut, render, set_source, shrink_images, strip_spans  # noqa: E402

INDEX_PATH = os.path.join(OUT_DIR, "trang-theo-so.json")

# Tên trong `chuan/` → (thư mục trong pdf_full, mẫu tên tệp; nhóm 1 = con số).
SOURCES = {
    "noi-tam": ("01_Chuong01A/01_NoiTam", r"NoiTam_00(\d+)"),
    "tiem-thuc": ("01_Chuong01A/02_TiemThuc", r"TiemThuc_00(\d+)"),
    "logic": ("01_Chuong01A/03_Logic", r"Logic_00(\d+)"),
    "cam-xuc": ("01_Chuong01A/04_CamXuc", r"CamXuc_00(\d+)"),
    "truc-giac": ("01_Chuong01A/05_TrucGiac", r"TrucGiac_00(\d+)"),
    "trai-nghiem": ("01_Chuong01A/06_TraiNghiem", r"TraiNghiem_00(\d+)"),
    "so-lap": ("01_Chuong01B/01_SoLap", r"SoLap_00(\d+)"),
    "thai-do": ("01_Chuong01B/02_ThaiDo", r"ThaiDo_00(\d+)"),
    "tuong-tac": ("01_Chuong01B/03_TuongTac", r"TuongTac_00(\d+)"),
    "can-bang": ("02_Chuong02/01_CanBang", r"CanBang_00(\d+)"),
    "bai-hoc-nghiep": ("02_Chuong02/02_BaiHocNghiep", r"BaiHocNghiep_00(\d+)"),
    "nam-ca-nhan": ("03_Chuong03/01_NamCaNhan", r"NamCaNhan_00(\d+)"),
    "ngay-sinh": ("03_Chuong03/04_NgaySinh", r"NgaySinh_00(\d+)"),
    "truong-thanh": ("03_Chuong03/05_TruongThanh", r"TruongThanh_00(\d+)"),
    "dinh-1": ("03_Chuong03/07_DuongDoi/01_Dinh1", r"Dinh1_00(\d+)"),
    "dinh-2": ("03_Chuong03/07_DuongDoi/02_Dinh2", r"Dinh2_00(\d+)"),
    "dinh-3": ("03_Chuong03/07_DuongDoi/03_Dinh3", r"Dinh3_00(\d+)"),
    "dinh-4": ("03_Chuong03/07_DuongDoi/04_Dinh4", r"Dinh4_00(\d+)"),
    "ket-noi-noi-tam-tuong-tac": ("04_Chuong04/01_NoiTamTuongTac", r"KNNoiTamTuongTac_So(\d+)"),
    "ket-noi-su-menh-duong-doi": ("04_Chuong04/02_SuMenhDuongDoi", r"KNSuMenhDuongDoi_So(\d+)"),
}
# `_000` là trang giới thiệu chỉ số (đã có trong `chuan/<chỉ-số>.pdf`), trừ hai chỉ số kết nối đánh số từ So0.
INTRO_ZERO = {slug for slug in SOURCES if not slug.startswith("ket-noi-")}


def fingerprint(path):
    """Ảnh dựng của trang (độ phân giải thấp) — để nhận ra hai trang giống hệt nhau."""
    pix = fitz.open(path)[0].get_pixmap(matrix=fitz.Matrix(0.5, 0.5), alpha=False)
    return hashlib.sha1(pix.samples).hexdigest()


def process(source_path, out_path):
    """Bỏ chân trang + xoáy góc, nén ảnh; trả về thông báo lỗi hoặc None."""
    doc = fitz.open()
    doc.insert_pdf(fitz.open(source_path))
    if doc.page_count != 1:
        return f"có {doc.page_count} trang"
    source, swirls, footer, _ = strip_spans(doc, None)
    if len(swirls) != 2 or not footer:
        return f"không nhận ra đủ xoáy góc/chân trang ({len(swirls)} xoáy, {len(footer)} khối chân trang)"
    set_source(doc, cut(source, swirls + footer))
    shrink_images(doc)
    doc.save(out_path, garbage=4, deflate=True)
    return None


def process_job(job):
    source_path, out_path = job
    return source_path, process(source_path, out_path)


def main() -> int:
    args = [arg for arg in sys.argv[1:] if not arg.startswith("--")]
    force = "--force" in sys.argv
    if len(args) != 1:
        print("Cách dùng: python3 scripts/build_ebook_trang_goc.py <thư-mục pdf_full> [--force]", file=sys.stderr)
        return 2
    root = args[0]
    os.makedirs(OUT_DIR, exist_ok=True)

    # Căn số trước (1–9) để số nợ nghiệp/số chủ đạo trùng trang trỏ về tệp của căn số.
    plan = {}
    for slug, (folder, pattern) in SOURCES.items():
        directory = os.path.join(root, folder)
        found = []
        for name in os.listdir(directory):
            match = re.fullmatch(pattern + r"\.pdf", name)
            if match and not (slug in INTRO_ZERO and match.group(1) == "0"):
                value = int(match.group(1))
                found.append((value, os.path.join(directory, name), os.path.join(OUT_DIR, f"{slug}-{value}.pdf")))
        if not found:
            print(f"{folder}: không có trang theo con số", file=sys.stderr)
            return 1
        plan[slug] = sorted(found)

    jobs = [(source, out) for found in plan.values() for _, source, out in found if force or not os.path.exists(out)]
    # Mỗi trang ~5 giây (dựng ảnh nhiều lần để nhận ra chân trang/xoáy góc); chạy vài tiến trình cho nhanh.
    with Pool(min(4, os.cpu_count() or 1)) as pool:
        for done, (source, error) in enumerate(pool.imap_unordered(process_job, jobs), 1):
            if error:
                print(f"{os.path.relpath(source, root)}: {error}", file=sys.stderr)
                pool.terminate()
                return 1
            if done % 20 == 0:
                print(f"… đã tách {done}/{len(jobs)} trang", flush=True)

    index = {}
    written, kept, aliased = len(jobs), sum(len(found) for found in plan.values()) - len(jobs), 0
    for slug, found in plan.items():
        pages, seen = {}, {}
        for value, _, out_path in found:
            target = f"{slug}-{value}"
            mark = fingerprint(out_path)
            if mark in seen:
                os.remove(out_path)
                pages[str(value)] = seen[mark]
                aliased += 1
            else:
                seen[mark] = target
                pages[str(value)] = target
        index[slug] = pages
        print(f"{slug}: {len(found)} con số → {len(seen)} tệp")
    with open(INDEX_PATH, "w", encoding="utf-8") as handle:
        json.dump(index, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    total = sum(os.path.getsize(os.path.join(OUT_DIR, name)) for name in os.listdir(OUT_DIR) if name.endswith(".pdf"))
    print(f"Tách mới {written}, giữ {kept}, gộp trùng {aliased}; chuan/ tổng {total // 1024} KB → {os.path.relpath(INDEX_PATH)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
