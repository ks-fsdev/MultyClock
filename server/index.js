import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/firebase.js"; 
import timerRoutes from "./routes/timerRoutes.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Clock App API is running!");
});

// linking modular root
app.use("/api/timers", timerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server spinning on http://localhost:${PORT}`);
});
