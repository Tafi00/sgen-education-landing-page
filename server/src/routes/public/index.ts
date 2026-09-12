import { Router } from "express";
import { publicContentRouter } from "./content.js";
import { publicLeadRouter } from "./leads.js";
import { publicLookupRouter, publicQuizRouter } from "./lookups.js";
import { publicMemberRouter } from "./members.js";
import { publicOrderRouter } from "./orders.js";

export const publicApiRouter = Router();

publicApiRouter.use("/", publicContentRouter);
publicApiRouter.use("/quiz", publicQuizRouter);
publicApiRouter.use("/lookups", publicLookupRouter);
publicApiRouter.use("/leads", publicLeadRouter);
publicApiRouter.use("/members", publicMemberRouter);
publicApiRouter.use("/orders", publicOrderRouter);
