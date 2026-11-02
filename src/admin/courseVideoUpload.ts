import { api } from "../api/client";

/** Mỗi phần nhỏ hơn giới hạn 12 MB của máy chủ và proxy, đủ nhỏ để mạng yếu không phải gửi lại nhiều. */
const CHUNK_BYTES = 8 * 1024 * 1024;
const CHUNK_RETRIES = 3;

/** Tải video lên từng phần kèm tiến độ; phần lỗi mạng được gửi lại vài lần trước khi báo lỗi. */
export async function uploadCourseVideo(file: File, onProgress: (ratio: number) => void) {
  const { uploadId } = await api.post<{ uploadId: string }>("/api/admin/course-lessons/uploads");
  try {
    for (let offset = 0; offset < file.size; offset += CHUNK_BYTES) {
      const chunk = file.slice(offset, offset + CHUNK_BYTES);
      for (let attempt = 1; ; attempt += 1) {
        try {
          await api.postBinary(`/api/admin/course-lessons/uploads/${uploadId}/chunk`, chunk, { offset });
          break;
        } catch (error) {
          if (attempt >= CHUNK_RETRIES) throw error;
        }
      }
      onProgress(Math.min(1, (offset + chunk.size) / file.size));
    }
    return await api.post<{ videoFile: string; size: number }>(`/api/admin/course-lessons/uploads/${uploadId}/finish`, { filename: file.name });
  } catch (error) {
    await api.del(`/api/admin/course-lessons/uploads/${uploadId}`).catch(() => undefined);
    throw error;
  }
}

/** Đọc thời lượng ngay ở trình duyệt; định dạng trình duyệt không đọc được thì để 0 (không hiện thời lượng). */
export function readVideoDuration(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (seconds: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(seconds) ? Math.round(seconds) : 0);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => done(video.duration);
    video.onerror = () => done(0);
    video.src = url;
  });
}

/** "03 - Bốn nhóm số.mp4" → "Bốn nhóm số": tên file do scripts/cut_course_video.py đặt theo nội dung từng đoạn. */
export function lessonTitleFromFilename(filename: string) {
  return filename.normalize("NFC").replace(/\.[^.]+$/, "").replace(/^\s*\d+\s*[-._)]+\s*/, "").trim() || filename;
}

export function isDiscussionTitle(title: string) {
  return /thảo luận|hỏi đáp|tương tác/i.test(title);
}
