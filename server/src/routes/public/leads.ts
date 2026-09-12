import { Router } from "express";
import { Lead } from "../../models/index.js";
import { asyncHandler } from "../../middleware/errors.js";
import { publicFormLimiter } from "../../middleware/rateLimit.js";
import { loadSettings } from "../../services/settings.js";
import { dispatchLeadNotifications } from "../../services/notifications.js";
import { leadCreateSchema } from "../schemas.js";

export const publicLeadRouter = Router();

publicLeadRouter.post(
  "/",
  publicFormLimiter,
  asyncHandler(async (req, res) => {
    const parsed = leadCreateSchema.parse(req.body);
    const { company, consent, ...rest } = parsed;
    const spam = Boolean(company && company.trim().length > 0);
    if (spam) {
      res.status(201).json({ ok: true, id: null, spam: true });
      return;
    }
    const lead = await Lead.create({
      ...rest,
      payload: rest.payload ?? {},
      notification: { resend: "skipped", telegram: "skipped" },
    });
    const settings = await loadSettings();
    dispatchLeadNotifications(lead, settings);
    res.status(201).json({ ok: true, id: String(lead._id), consent: consent === true });
  }),
);
