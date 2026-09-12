import { Router } from "express";
import { z } from "zod";
import { MediaAsset } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { imageUpload, deleteMediaAsset, storeUploadedImage } from "../../services/media.js";
import { mediaMetaSchema } from "../schemas.js";

export const adminMediaRouter = Router();

adminMediaRouter.post(
  "/upload",
  imageUpload.array("files", 20),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) throw new AppError(422, "Chưa chọn tệp nào để tải lên.", "missing_file");
    const folder = String(req.body?.folder ?? "general");
    const alt = String(req.body?.alt ?? "");
    const created = [];
    for (const file of files) {
      created.push(
        await storeUploadedImage({
          buffer: file.buffer,
          originalName: file.originalname,
          mimetype: file.mimetype,
          folder,
          alt,
          uploadedBy: req.session.adminId ?? null,
        }),
      );
    }
    res.status(201).json({ items: created });
  }),
);

adminMediaRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = mediaMetaSchema.parse(req.body);
    const updated = await MediaAsset.findByIdAndUpdate(req.params.id, { $set: parsed }, { new: true }).lean();
    if (!updated) throw new AppError(404, "Không tìm thấy tệp.", "not_found");
    res.json({ item: updated });
  }),
);

adminMediaRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await deleteMediaAsset(req.params.id);
    res.json({ ok: true });
  }),
);

adminMediaRouter.post(
  "/bulk-delete",
  asyncHandler(async (req, res) => {
    const ids = z.array(z.string().min(1)).parse(req.body?.ids ?? []);
    for (const id of ids) await deleteMediaAsset(id);
    res.json({ ok: true, affected: ids.length });
  }),
);
