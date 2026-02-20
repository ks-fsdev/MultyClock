// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/firebase.js"; // Note the .js extension is required in ES modules
import timerRoutes from "./routes/timerRoutes.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// ✅ 2. Use it (The Gatekeeper)
// This doesn't block anyone yet, but it checks their pockets for a "Token"
app.use(clerkMiddleware());

// Basic Test Route
app.get("/", (req, res) => {
  res.send("Clock App API is running!");
});

// linking modular root
app.use("/api/timers", timerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server spinning on http://localhost:${PORT}`);
});
