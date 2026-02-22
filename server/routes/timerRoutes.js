import express from "express";
import {
  createTimer,
  getTimers,
  deleteTimer,
} from "../controllers/timerController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/add", requireAuth(), createTimer);
router.get("/all", requireAuth(), getTimers);
router.delete("/delete/:id", requireAuth(), deleteTimer);

export default router;
