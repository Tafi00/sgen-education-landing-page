import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import { env } from "../env.js";
import { MediaAsset } from "../models/index.js";
import { AppError } from "../middleware/errors.js";

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

const RASTER_MIME: Record<string, true> = { "image/jpeg": true, "image/png": true, "image/webp": true, "image/avif": true };

const MAX_BYTES = 12 * 1024 * 1024;
const VARIANT_WIDTHS = [480, 960, 1920];

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 20 },
  fileFilter: (_req, file, callback) => {
    if (!MIME_EXTENSION[file.mimetype]) {
      callback(new AppError(422, `Định dạng ${file.mimetype} không được hỗ trợ. Chỉ nhận JPG, PNG, WebP, AVIF, SVG, PDF.`, "unsupported_media"));
      return;
    }
    callback(null, true);
  },
});

export function safeFolderName(folder: string) {
  const cleaned = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  return cleaned || "general";
}

async function writeFileToUploadDir(relativePath: string, data: Buffer) {
  const target = path.join(env.uploadDir, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return `/uploads/${relativePath.split(path.sep).join("/")}`;
}

/**
 * Lưu ảnh vào UPLOAD_DIR, sinh biến thể WebP theo bề rộng chuẩn và trả về
 * bản ghi media. Cơ sở dữ liệu chỉ giữ đường dẫn `/uploads/...`.
 */
export async function storeUploadedImage(options: {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  folder?: string;
  alt?: string;
  uploadedBy?: string | null;
}) {
  const folder = safeFolderName(options.folder ?? "general");
  const stamp = Date.now().toString(36);
  const base = `${crypto.randomBytes(4).toString("hex")}-${stamp}`;
  const isRaster = RASTER_MIME[options.mimetype];
  let filename = `${base}${MIME_EXTENSION[options.mimetype] ?? ".bin"}`;
  let url = "";
  let width = 0;
  let height = 0;
  const variants: { label: string; url: string; width: number }[] = [];

  if (isRaster) {
    const image = sharp(options.buffer, { failOn: "none" });
    const metadata = await image.metadata();
    width = metadata.width ?? 0;
    height = metadata.height ?? 0;
    filename = `${base}.webp`;
    const largest = Math.min(width || VARIANT_WIDTHS.at(-1)!, VARIANT_WIDTHS.at(-1)!);
    const fullBuffer = await image.clone().resize({ width: largest, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
    url = await writeFileToUploadDir(path.join(folder, filename), fullBuffer);
    for (const target of VARIANT_WIDTHS) {
      if (width && target > width) continue;
      const label = target === VARIANT_WIDTHS.at(-1) ? "lg" : target === VARIANT_WIDTHS[1] ? "md" : "sm";
      const buffer = await image.clone().resize({ width: target, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
      const variantUrl = await writeFileToUploadDir(path.join(folder, "variants", `${base}-${target}.webp`), buffer);
      variants.push({ label, url: variantUrl, width: target });
    }
  } else {
    url = await writeFileToUploadDir(path.join(folder, filename), options.buffer);
  }

  return MediaAsset.create({
    filename: options.originalName || filename,
    url,
    mime: isRaster ? "image/webp" : options.mimetype,
    size: options.buffer.length,
    width,
    height,
    alt: options.alt ?? "",
    folder,
    variants,
    uploadedBy: options.uploadedBy ?? null,
  });
}

export async function deleteMediaAsset(id: string) {
  const asset = await MediaAsset.findById(id);
  if (!asset) throw new AppError(404, "Không tìm thấy tệp.", "not_found");
  const targets = [asset.url, ...asset.variants.map((variant) => variant.url)].filter((target): target is string => Boolean(target));
  for (const target of targets) {
    if (!target.startsWith("/uploads/")) continue;
    const filePath = path.join(env.uploadDir, target.replace("/uploads/", ""));
    await fs.rm(filePath, { force: true });
  }
  await asset.deleteOne();
}
