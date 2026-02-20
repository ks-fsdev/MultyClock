// controllers/timerController.js
import { db } from "../config/firebase.js";

// 🎨 THE AESTHETIC MENU (Our Allowed Colors)
const ALLOWED_COLORS = [
  "#FF5733", // Vibrant Orange
  "#33FF57", // Slime Green
  "#3357FF", // Electric Blue
  "#F0F0F0", // Minimalist White
  "#121212", // Deep Black
];

// --- CREATE TIMER (POST) ---
export const createTimer = async (req, res) => {
  try {
    const { userId } = req.auth;
    // We added 'intervals' here to grab it from the frontend
    let { label, duration, color, intervals } = req.body;

    // 🛡️ AESTHETIC GUARD: Check if the color is allowed
    if (!ALLOWED_COLORS.includes(color)) {
      color = ALLOWED_COLORS[0];
    }

    // In Firestore, we 'add' to a collection.
    const docRef = await db.collection("timers").add({
      label,
      duration,
      color,
      intervals: intervals || [], // Added this so it actually saves to the DB
      userId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "Timer saved successfully!",
      savedColor: color,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- GET TIMERS (GET) ---
export const getTimers = async (req, res) => {
  try {
    const { userId } = req.auth; // We'll filter by user

    // Logic: Go to 'timers' collection -> find matches -> get them
    const snapshot = await db
      .collection("timers")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc") // Newest timers first
      .get();

    // Firestore returns a 'snapshot'. we need to loop to get the actual data.
    const timers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, timers: timers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE TIMER
export const deleteTimer = async (req, res) => {
  try {
    const { id } = req.params; // Get the timer ID from the URL
    const { userId } = req.auth; // Get the user ID from Clerk

    const timerRef = db.collection("timers").doc(id);
    const doc = await timerRef.get();

    // 1. Does this timer even exist?
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Timer not found" });
    }

    // 2. 🛡️ SECURITY CHECK: Is this YOUR timer?
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this timer!",
      });
    }

    // 3. Delete it
    await timerRef.delete();

    res
      .status(200)
      .json({ success: true, message: "Timer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
