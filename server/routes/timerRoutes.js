// routes/timerRoutes.js
import express from "express";
import {
  createTimer,
  getTimers,
  deleteTimer,
} from "../controllers/timerController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// This will be accessible at /api/timers/add
router.post("/add", requireAuth(), createTimer);
router.get("/all", requireAuth(), getTimers); // GET: /api/timers/all?userId=123
router.delete("/delete/:id", requireAuth(), deleteTimer);

export default router;
