import { Router } from "express";
import { publicContentRouter } from "./content.js";
import { publicEbookRouter } from "./ebook.js";
import { publicLeadRouter } from "./leads.js";
import { publicLookupRouter, publicQuizRouter } from "./lookups.js";
import { publicMemberRouter } from "./members.js";
import { publicOrderRouter } from "./orders.js";
import { analyzeSimPhongThuyWithReference } from "../../../../shared/sim/sim-phong-thuy-reference.js";
import type { SimAnalysisInput } from "../../../../shared/sim/sim-phong-thuy-engine.js";
export const publicApiRouter = Router();

publicApiRouter.use("/", publicContentRouter);
publicApiRouter.use("/quiz", publicQuizRouter);
publicApiRouter.use("/lookups", publicLookupRouter);
publicApiRouter.use("/leads", publicLeadRouter);
publicApiRouter.use("/members", publicMemberRouter);
publicApiRouter.use("/orders", publicOrderRouter);
publicApiRouter.use("/ebook", publicEbookRouter);

publicApiRouter.get("/sim-phong-thuy", async (req, res) => {
  try {
    const phone = String(req.query.so ?? "");
    const year = String(req.query.nam ?? "");
    const month = String(req.query.thang ?? "");
    const day = String(req.query.ngay ?? "");
    const hour = String(req.query.gio ?? "");
    const minute = String(req.query.phut ?? "");
    const birthDate = year && month && day ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : year ? `${year}-01-01` : undefined;
    const input: SimAnalysisInput = {
      phone,
      birthDate,
      birthTime: hour !== "" && minute !== "" ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}` : undefined,
      gender: req.query.gioitinh === "nu" ? "Nữ" : "Nam",
      calendarType: req.query.lich === "al" ? "lunar" : "solar",
      lunarLeapMonth: req.query.nhuan === "1",
    };
    const { result } = await analyzeSimPhongThuyWithReference(input);
    res.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể đối chiếu dữ liệu phong thủy sim.";
    const status = error instanceof RangeError ? 400 : 502;
    res.status(status).json({ error: message });
  }
});
