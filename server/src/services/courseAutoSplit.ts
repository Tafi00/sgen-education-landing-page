import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { formatClock, isDiscussionChapter, youtubeClip, type Chapter } from "../../../shared/course-video.js";
import { env } from "../env.js";
import { AppError } from "../middleware/errors.js";
import { CourseTranscript, type CourseLessonDoc, type CourseTranscriptDoc, type TranscriptSegment } from "../models/index.js";
import { loadSettings, readIntegrationSecrets } from "./settings.js";

/**
 * Tự tách một buổi học dài thành các đoạn 10–15 phút theo nội dung (quản trị bấm "Tách đoạn tự động" ở Bài giảng video):
 *
 * 1. Chép lời giảng: file tải lên thì tách âm thanh bằng ffmpeg rồi gửi OpenAI Whisper từng phần 10 phút; link YouTube thì lấy
 *    phụ đề tự động của YouTube (miễn phí). Lời đã chép lưu vào `course_transcripts`, tách lại không phải trả phí chép lại.
 * 2. Claude đọc lời giảng có mốc thời gian, chia đoạn ở chỗ chuyển chủ đề, đặt tên và tách riêng phần thảo luận.
 *
 * Kết quả chỉ là gợi ý: trang quản trị điền vào ô mốc để quản trị sửa rồi mới bấm áp dụng. Việc chạy mất vài phút nên chạy nền,
 * trang quản trị hỏi tiến độ mỗi vài giây; mỗi lúc chỉ tách một video để máy chủ không bị quá tải.
 */

export type SplitJob = {
  lessonId: string;
  lessonTitle: string;
  state: "running" | "done" | "error";
  step: string;
  startedAt: string;
  finishedAt?: string;
  chapters?: Chapter[];
  error?: string;
};

const CLAUDE_MODEL = "claude-opus-5-5";
const AUDIO_PART_SECONDS = 600;
const WHISPER_CONCURRENCY = 3;
const JOB_TTL_MS = 6 * 60 * 60 * 1000;
const jobs = new Map<string, SplitJob>();

/** Khoảng [from, to) của video mà bài đang phát; `to` = 0 khi chưa biết độ dài. */
export function lessonRange(lesson: Pick<CourseLessonDoc, "videoFile" | "videoUrl" | "startSeconds" | "endSeconds" | "durationSeconds">) {
  if (lesson.videoFile) {
    const from = lesson.startSeconds ?? 0;
    return { from, to: lesson.endSeconds || (lesson.durationSeconds ? from + lesson.durationSeconds : 0) };
  }
  const clip = youtubeClip(lesson.videoUrl);
  if (!clip) return { from: 0, to: 0 };
  return { from: clip.start, to: clip.end || (lesson.durationSeconds ? clip.start + lesson.durationSeconds : 0) };
}

/** Khoá lưu lời giảng: cùng một file / video YouTube thì dùng lại, dù bài đã được chia thành nhiều đoạn. */
export function transcriptKey(lesson: Pick<CourseLessonDoc, "videoFile" | "videoUrl">) {
  if (lesson.videoFile) return `file:${path.basename(lesson.videoFile)}`;
  const clip = youtubeClip(lesson.videoUrl);
  return clip ? `youtube:${clip.id}` : "";
}

export async function cachedTranscript(key: string) {
  return key ? CourseTranscript.findOne({ sourceKey: key }).lean<CourseTranscriptDoc>() : null;
}

function pruneJobs() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (job.state !== "running" && now - Date.parse(job.finishedAt ?? job.startedAt) > JOB_TTL_MS) jobs.delete(id);
  }
}

export function getSplitJob(lessonId: string) {
  pruneJobs();
  return jobs.get(lessonId) ?? null;
}

export async function startSplitJob(lesson: CourseLessonDoc) {
  pruneJobs();
  const id = String(lesson._id);
  const current = jobs.get(id);
  if (current?.state === "running") return current;
  const busy = [...jobs.values()].find((job) => job.state === "running");
  if (busy) throw new AppError(409, `Đang tách đoạn bài “${busy.lessonTitle}”. Vui lòng đợi xong (vài phút) rồi thử lại.`, "split_busy");

  const key = transcriptKey(lesson);
  if (!key) throw new AppError(422, "Chỉ tự tách được video tải lên máy chủ hoặc link YouTube.", "split_unsupported");
  const keys = readIntegrationSecrets(await loadSettings());
  if (!keys.anthropicApiKey) throw new AppError(422, "Chưa có khoá Anthropic (Claude). Vào Cài đặt → Tích hợp AI để thêm khoá.", "anthropic_key_missing");
  if (lesson.videoFile && !keys.openaiApiKey && !(await cachedTranscript(key))) {
    throw new AppError(422, "Chưa có khoá OpenAI để chép lời video tải lên. Vào Cài đặt → Tích hợp AI để thêm khoá.", "openai_key_missing");
  }

  const job: SplitJob = { lessonId: id, lessonTitle: lesson.title, state: "running", step: "Đang chuẩn bị…", startedAt: new Date().toISOString() };
  jobs.set(id, job);
  void runSplitJob(job, lesson, key, keys).catch((error: unknown) => {
    console.error(`[tach-doan] ${lesson.title}:`, error);
    job.state = "error";
    job.error = error instanceof AppError ? error.message : `Không tách được: ${error instanceof Error ? error.message : String(error)}`;
    job.finishedAt = new Date().toISOString();
  });
  return job;
}

async function runSplitJob(job: SplitJob, lesson: CourseLessonDoc, key: string, keys: { openaiApiKey: string; anthropicApiKey: string }) {
  const onStep = (step: string) => {
    job.step = step;
  };
  let transcript = await cachedTranscript(key);
  if (!transcript) {
    const result = lesson.videoFile ? await transcribeFile(lesson.videoFile, keys.openaiApiKey, onStep) : await youtubeCaptions(youtubeClip(lesson.videoUrl)!.id, onStep);
    if (!result.segments.length) throw new AppError(422, "Video không có lời nói nào để chia đoạn.", "empty_transcript");
    await CourseTranscript.deleteMany({ sourceKey: key });
    transcript = (await CourseTranscript.create({ sourceKey: key, ...result })).toObject() as CourseTranscriptDoc;
  }

  const range = lessonRange(lesson);
  const to = range.to || transcript.durationSeconds || transcript.segments.at(-1)?.end || 0;
  const segments = transcript.segments.filter((segment) => segment.end > range.from && (!to || segment.start < to));
  if (!segments.length) throw new AppError(422, "Đoạn video của bài này không có lời nói nào để chia.", "empty_transcript");

  onStep("Claude đang đọc lời giảng và chia đoạn theo nội dung…");
  const raw = await suggestChapters(segments, { from: range.from, to }, lesson.title, keys.anthropicApiKey);
  job.chapters = normalizeChapters(raw, { from: range.from, to });
  if (job.chapters.length < 2) throw new AppError(422, "Video ngắn hoặc chỉ có một chủ đề nên không cần chia thêm.", "split_single");
  job.state = "done";
  job.step = `Đã chia thành ${job.chapters.length} đoạn.`;
  job.finishedAt = new Date().toISOString();
}

/* ------------------------------ chép lời ------------------------------ */

type TranscriptResult = { provider: string; segments: TranscriptSegment[]; durationSeconds: number };

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = (stderr + chunk.toString()).slice(-2000);
    });
    child.on("error", (error: NodeJS.ErrnoException) =>
      reject(error.code === "ENOENT" ? new AppError(500, "Máy chủ chưa cài ffmpeg nên chưa tách được âm thanh khỏi video.", "ffmpeg_missing") : error),
    );
    child.on("close", (code) => (code === 0 ? resolve() : reject(new AppError(422, `Không đọc được âm thanh của video (ffmpeg: ${stderr.trim().split("\n").at(-1) ?? code}).`, "ffmpeg_failed"))));
  });
}

async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}

/** Từ khoá giúp Whisper viết đúng thuật ngữ của các khóa học SGEN. */
const WHISPER_PROMPT = "Buổi học Thần số học, phong thủy, Kinh Dịch của SGEN: Pythagoras, đường đời, sứ mệnh, linh hồn, nhân cách, nợ nghiệp, số chủ đạo, quẻ, hào động, tứ trụ, bát tự, huyền không, phi tinh.";

async function whisper(file: string, apiKey: string): Promise<{ duration: number; segments: { start: number; end: number; text: string }[] }> {
  const audio = await fs.readFile(file);
  for (let attempt = 1; ; attempt += 1) {
    const form = new FormData();
    form.append("file", new Blob([audio], { type: "audio/ogg" }), path.basename(file));
    form.append("model", "whisper-1");
    form.append("language", "vi");
    form.append("prompt", WHISPER_PROMPT);
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "segment");
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(10 * 60 * 1000),
    }).catch((error: unknown) => {
      throw new AppError(502, `Không kết nối được OpenAI: ${error instanceof Error ? error.message : String(error)}`, "openai_unreachable");
    });
    if (response.ok) return (await response.json()) as { duration: number; segments: { start: number; end: number; text: string }[] };
    const body = (await response.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
    const retryable = response.status >= 500 || (response.status === 429 && body?.error?.code !== "insufficient_quota");
    if (retryable && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
      continue;
    }
    if (response.status === 401) throw new AppError(422, "Khoá OpenAI không đúng hoặc đã bị thu hồi. Kiểm tra lại ở Cài đặt → Tích hợp AI.", "openai_auth");
    if (body?.error?.code === "insufficient_quota") throw new AppError(422, "Tài khoản OpenAI đã hết tiền (insufficient_quota). Nạp thêm tại platform.openai.com rồi thử lại.", "openai_quota");
    throw new AppError(502, `OpenAI báo lỗi ${response.status}: ${body?.error?.message ?? response.statusText}`, "openai_error");
  }
}

async function transcribeFile(videoFile: string, apiKey: string, onStep: (step: string) => void): Promise<TranscriptResult> {
  const source = path.join(env.courseVideoDir, path.basename(videoFile));
  if (!(await fs.stat(source).catch(() => null))) throw new AppError(404, "Không tìm thấy file video trên máy chủ.", "video_missing");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sgen-audio-"));
  try {
    onStep("Đang tách âm thanh khỏi video…");
    // Âm thanh mono 16 kHz Opus 24 kbps: 10 phút ≈ 2 MB, dưới giới hạn 25 MB mỗi lần gửi của Whisper.
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-nostdin", "-i", source, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "libopus", "-b:a", "24k", "-f", "segment", "-segment_time", String(AUDIO_PART_SECONDS), "-reset_timestamps", "1", path.join(dir, "part%03d.ogg")]);
    const parts = (await fs.readdir(dir)).filter((name) => name.endsWith(".ogg")).sort();
    if (!parts.length) throw new AppError(422, "Video không có âm thanh.", "no_audio");
    let done = 0;
    onStep(`Đang chép lời giảng (0/${parts.length} phần 10 phút)…`);
    const results = await mapLimit(parts, WHISPER_CONCURRENCY, async (name) => {
      const result = await whisper(path.join(dir, name), apiKey);
      done += 1;
      onStep(`Đang chép lời giảng (${done}/${parts.length} phần 10 phút)…`);
      return result;
    });
    const segments: TranscriptSegment[] = [];
    let offset = 0;
    for (const result of results) {
      for (const segment of result.segments ?? []) {
        const text = segment.text.trim();
        if (text) segments.push({ start: Math.round((offset + segment.start) * 10) / 10, end: Math.round((offset + segment.end) * 10) / 10, text });
      }
      offset += result.duration || AUDIO_PART_SECONDS;
    }
    return { provider: "openai", segments, durationSeconds: Math.round(offset) };
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

const YOUTUBE_CLIENTS = [
  { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 33, userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 13) gzip" },
  { clientName: "IOS", clientVersion: "20.10.4", userAgent: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3 like Mac OS X)" },
  { clientName: "WEB", clientVersion: "2.20250101.00.00", userAgent: "Mozilla/5.0" },
];

type CaptionTrack = { baseUrl: string; languageCode?: string; kind?: string };

function decodeXml(text: string) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Phụ đề YouTube có thể trả JSON (json3) hoặc XML (srv3 `<p t d>` / srv1 `<text start dur>`), tuỳ máy khách. */
export function parseYoutubeCaptions(body: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const push = (start: number, duration: number, text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean) segments.push({ start, end: start + Math.max(duration, 0), text: clean });
  };
  if (body.trimStart().startsWith("{")) {
    const data = JSON.parse(body) as { events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[] };
    for (const event of data.events ?? []) {
      if (event.segs) push((event.tStartMs ?? 0) / 1000, (event.dDurationMs ?? 0) / 1000, event.segs.map((seg) => seg.utf8 ?? "").join(""));
    }
    return segments;
  }
  for (const match of body.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)) {
    const start = Number(/\bt="(\d+)"/.exec(match[1])?.[1] ?? 0) / 1000;
    const duration = Number(/\bd="(\d+)"/.exec(match[1])?.[1] ?? 0) / 1000;
    push(start, duration, decodeXml(match[2].replace(/<s\b[^>]*>/g, " ")));
  }
  if (segments.length) return segments;
  for (const match of body.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    push(Number(/\bstart="([\d.]+)"/.exec(match[1])?.[1] ?? 0), Number(/\bdur="([\d.]+)"/.exec(match[1])?.[1] ?? 0), decodeXml(decodeXml(match[2])));
  }
  return segments;
}

async function youtubeCaptions(videoId: string, onStep: (step: string) => void): Promise<TranscriptResult> {
  onStep("Đang lấy phụ đề tự động của YouTube…");
  for (const { userAgent, ...client } of YOUTUBE_CLIENTS) {
    try {
      const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": userAgent },
        body: JSON.stringify({ videoId, context: { client: { ...client, hl: "vi" } } }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) continue;
      const player = (await response.json()) as {
        captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } };
        videoDetails?: { lengthSeconds?: string };
      };
      const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
      const track = tracks.find((item) => item.languageCode?.startsWith("vi") && item.kind !== "asr") ?? tracks.find((item) => item.languageCode?.startsWith("vi")) ?? tracks[0];
      if (!track) continue;
      for (const format of ["json3", ""]) {
        const captions = await fetch(`${track.baseUrl}${format ? `&fmt=${format}` : ""}`, { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(60_000) });
        if (!captions.ok) continue;
        const segments = parseYoutubeCaptions(await captions.text());
        if (segments.length) return { provider: "youtube", segments, durationSeconds: Number(player.videoDetails?.lengthSeconds ?? 0) || Math.round(segments.at(-1)!.end) };
      }
    } catch (error) {
      console.warn(`[tach-doan] phụ đề YouTube ${videoId} (${client.clientName}):`, error instanceof Error ? error.message : error);
    }
  }
  throw new AppError(
    422,
    "Chưa lấy được phụ đề tự động của video YouTube này. Video mới tải lên cần vài giờ để YouTube tạo phụ đề; nếu vẫn lỗi, hãy tải file video lên máy chủ thay cho link.",
    "youtube_captions",
  );
}

/* ------------------------------ chia đoạn ------------------------------ */

const ChapterOutput = z.object({
  chapters: z.array(z.object({ start: z.number(), title: z.string(), kind: z.enum(["lecture", "discussion"]) })).min(1),
});

const CHAPTER_SCHEMA = {
  type: "object",
  properties: {
    chapters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: { type: "integer", description: "Giây tính từ đầu video, lấy từ mốc [H:MM:SS] của dòng nơi đoạn bắt đầu." },
          title: { type: "string", description: "Tên đoạn tiếng Việt có dấu; phần thảo luận bắt đầu bằng \"Thảo luận: \"." },
          kind: { type: "string", enum: ["lecture", "discussion"] },
        },
        required: ["start", "title", "kind"],
        additionalProperties: false,
      },
    },
  },
  required: ["chapters"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `Bạn biên tập video khóa học của SGEN Education (Thần số học, phong thủy, Kinh Dịch). Mỗi video là một buổi học trực tuyến dài 1–2 tiếng gồm phần thầy giảng và phần học viên hỏi đáp, chia sẻ, được thầy luận lá số. Học viên xem lại tại nhà theo từng đoạn ngắn nên bạn chia buổi học thành các đoạn liền nhau theo nội dung.

Cách chia:
- Mỗi đoạn khoảng 8–15 phút, cắt ở chỗ chuyển chủ đề hoặc chuyển giữa giảng bài và thảo luận. Không để đoạn nào dưới 4 phút (trừ đoạn cuối) hay quá 20 phút.
- Phần học viên hỏi, chia sẻ cảm nhận, thầy luận lá số / số điện thoại của học viên là đoạn thảo luận: kind "discussion" và tên bắt đầu bằng "Thảo luận: ". Phần thầy giảng kiến thức là "lecture".
- Tên đoạn 40–85 ký tự, nêu cụ thể nội dung chính (khái niệm, con số, ví dụ) để học viên tìm lại được; không đánh số "Phần 1", không chép tên riêng, số điện thoại, ngày sinh của học viên.
- start là số giây của mốc [H:MM:SS] ở dòng nơi đoạn bắt đầu. Đoạn đầu tiên bắt đầu ở mốc đầu tiên của lời giảng.
- Lời giảng do máy chép nên có thể sai chính tả, thiếu dấu câu; hiểu theo ngữ cảnh và viết tên đoạn đúng thuật ngữ.

Ví dụ tên đoạn tốt:
- Cách tính chỉ số đường đời, ví dụ lá số Elon Musk và thực hành tính
- Ý nghĩa nét viết các con số, năng lượng số 4 và số 5
- Thảo luận: số 5 – thích tự do, quyết định vội, làm nhiều việc cùng lúc
- Cách tính nợ nghiệp, đọc trên lá số; ý nghĩa 13/4, 14/5, 16/7, 19/1`;

/** Gom các câu thành dòng ~20 giây có mốc thời gian để Claude đọc gọn mà vẫn chọn được điểm cắt sát. */
function transcriptLines(segments: TranscriptSegment[]) {
  const lines: string[] = [];
  let start = -1;
  let buffer: string[] = [];
  const flush = () => {
    if (buffer.length) lines.push(`[${formatClock(start)}] ${buffer.join(" ")}`);
    buffer = [];
    start = -1;
  };
  for (const segment of segments) {
    if (start < 0) start = segment.start;
    buffer.push(segment.text);
    if (segment.end - start >= 20) flush();
  }
  flush();
  return lines.join("\n");
}

async function suggestChapters(segments: TranscriptSegment[], range: { from: number; to: number }, lessonTitle: string, apiKey: string) {
  const client = new Anthropic({ apiKey, maxRetries: 3, timeout: 15 * 60 * 1000 });
  const minutes = Math.round((range.to - range.from) / 60);
  try {
    const stream = client.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema: CHAPTER_SCHEMA } },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Video "${lessonTitle}", từ ${formatClock(range.from)} đến ${formatClock(range.to)} (khoảng ${minutes} phút). Lời giảng chép tự động:\n\n<loi_giang>\n${transcriptLines(segments)}\n</loi_giang>\n\nChia video này thành các đoạn theo hướng dẫn.`,
        },
      ],
    });
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") throw new AppError(422, "Claude từ chối xử lý nội dung video này. Vui lòng tự nhập mốc chia đoạn.", "claude_refusal");
    if (message.stop_reason === "max_tokens") throw new AppError(502, "Claude trả lời bị cắt giữa chừng. Vui lòng bấm tách lại.", "claude_truncated");
    const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
    const parsed = ChapterOutput.safeParse(JSON.parse(text || "null"));
    if (!parsed.success) throw new AppError(502, "Claude trả về kết quả không đúng dạng. Vui lòng bấm tách lại.", "claude_format");
    return parsed.data.chapters;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof SyntaxError) throw new AppError(502, "Claude trả về kết quả không đúng dạng. Vui lòng bấm tách lại.", "claude_format");
    if (error instanceof Anthropic.AuthenticationError) throw new AppError(422, "Khoá Anthropic không đúng hoặc đã bị thu hồi. Kiểm tra lại ở Cài đặt → Tích hợp AI.", "anthropic_auth");
    if (error instanceof Anthropic.RateLimitError) throw new AppError(429, "Anthropic đang giới hạn lượt gọi. Vui lòng thử lại sau ít phút.", "anthropic_rate_limit");
    if (error instanceof Anthropic.APIError) throw new AppError(502, `Anthropic báo lỗi ${error.status ?? ""}: ${error.message}`, "anthropic_error");
    throw error;
  }
}

/** Sắp lại, bỏ mốc trùng / sát nhau / ngoài video, ghép tiền tố "Thảo luận: " để ô mốc đọc lại đúng loại bài. */
export function normalizeChapters(raw: { start: number; title: string; kind: "lecture" | "discussion" }[], range: { from: number; to: number }): Chapter[] {
  const chapters: Chapter[] = [];
  for (const item of [...raw].sort((left, right) => left.start - right.start)) {
    let title = item.title.replace(/\s+/g, " ").trim().slice(0, 200);
    if (title.length < 2) continue;
    const discussion = item.kind === "discussion" || isDiscussionChapter(title);
    if (discussion && !isDiscussionChapter(title)) title = `Thảo luận: ${title.charAt(0).toLowerCase()}${title.slice(1)}`.slice(0, 200);
    const start = chapters.length ? Math.round(item.start) : range.from;
    if (range.to && start >= range.to - 60) continue;
    if (chapters.length && start - chapters.at(-1)!.start < 90) continue;
    chapters.push({ start, title, kind: discussion ? "discussion" : "lecture" });
  }
  return chapters;
}
