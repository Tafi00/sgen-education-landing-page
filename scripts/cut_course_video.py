#!/usr/bin/env python3
"""Cắt video khóa học dài thành các đoạn ngắn theo nội dung, sẵn sàng tải lên Quản trị → Bài giảng video.

Mỗi dòng của file mốc gồm thời điểm bắt đầu và tên đoạn (dòng trống, dòng bắt đầu bằng # được bỏ qua):

    00:00:00 | Mở đầu và giới thiệu khóa học
    00:12:40 | Nguồn gốc hệ Pythagoras
    01:48:05 | Thảo luận: câu hỏi của học viên

Đoạn cuối chạy tới hết video. Đặt chữ "Thảo luận" trong tên thì trang quản trị tự đánh dấu là phần thảo luận tương tác.

    python3 scripts/cut_course_video.py video-1.mp4 video-1.txt -o out/video-1 --start-number 1

Mặc định không mã hoá lại nên rất nhanh và không giảm chất lượng, nhưng điểm cắt rơi vào khung khoá gần nhất (lệch vài giây).
Thêm --encode để cắt đúng giây và nén về 720p cho nhẹ (chậm hơn nhiều). File ra luôn có moov ở đầu để phát ngay khi tua.
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

TIME = re.compile(r"^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\.\d+)?$")


def parse_time(text: str) -> float:
    match = TIME.match(text.strip())
    if not match:
        raise ValueError(f"thời điểm không hợp lệ: {text!r} (cần dạng HH:MM:SS hoặc MM:SS)")
    hours, minutes, seconds = match.groups()
    return int(hours or 0) * 3600 + int(minutes) * 60 + int(seconds)


def parse_chapters(path: Path) -> list[tuple[float, str]]:
    chapters: list[tuple[float, str]] = []
    for number, raw in enumerate(path.read_text(encoding="utf8").splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "|" not in line:
            raise ValueError(f"dòng {number}: thiếu dấu | giữa thời điểm và tên đoạn")
        time_text, title = line.split("|", 1)
        if not title.strip():
            raise ValueError(f"dòng {number}: thiếu tên đoạn")
        start = parse_time(time_text)
        if chapters and start <= chapters[-1][0]:
            raise ValueError(f"dòng {number}: thời điểm phải tăng dần")
        chapters.append((start, title.strip()))
    if not chapters:
        raise ValueError("file mốc không có dòng nào")
    return chapters


def safe_name(title: str) -> str:
    """Giữ tiếng Việt có dấu vì tên file thành tên bài; chỉ bỏ ký tự hệ điều hành cấm."""
    return re.sub(r"\s+", " ", re.sub(r'[\\/:*?"<>|]', " ", title)).strip().rstrip(".")


def video_duration(source: Path) -> float:
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(source)],
        check=True, capture_output=True, text=True,
    )
    return float(output.stdout.strip())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="video gốc")
    parser.add_argument("chapters", type=Path, help="file mốc: mỗi dòng 'HH:MM:SS | Tên đoạn'")
    parser.add_argument("-o", "--out", type=Path, default=Path("out"), help="thư mục ra")
    parser.add_argument("--start-number", type=int, default=1, help="số thứ tự của đoạn đầu (nối tiếp video trước)")
    parser.add_argument("--encode", action="store_true", help="mã hoá lại về 720p, cắt đúng giây")
    args = parser.parse_args()

    try:
        chapters = parse_chapters(args.chapters)
    except ValueError as error:
        print(f"Lỗi file mốc: {error}", file=sys.stderr)
        return 2

    duration = video_duration(args.source)
    if chapters[-1][0] >= duration:
        print(f"Lỗi file mốc: đoạn cuối bắt đầu sau khi video đã hết ({duration:.0f} giây).", file=sys.stderr)
        return 2

    args.out.mkdir(parents=True, exist_ok=True)
    for index, (start, title) in enumerate(chapters):
        end = chapters[index + 1][0] if index + 1 < len(chapters) else duration
        target = args.out / f"{args.start_number + index:02d} - {safe_name(title)}.mp4"
        codec = ["-vf", "scale=-2:'min(720,ih)'", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-c:a", "aac", "-b:a", "96k"] if args.encode else ["-c", "copy", "-avoid_negative_ts", "make_zero"]
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-i", str(args.source), "-t", str(end - start), *codec, "-movflags", "+faststart", str(target)],
            check=True,
        )
        print(f"{target.name}  ({(end - start) / 60:.1f} phút, {target.stat().st_size / 1024 / 1024:.0f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
