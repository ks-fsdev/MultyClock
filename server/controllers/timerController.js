import { db } from "../config/firebase.js";

const ALLOWED_COLORS = [
  "#FF5733",
  "#F0F0F0",
  "#FF2A6D",
  "#39FF14",
  "#FAEA48",
  "#9D4EDD",
];

// --- CREATE TIMER (POST) ---
export const createTimer = async (req, res) => {
  try {
    const { userId } = req.auth;
    let { label, duration, color, intervals } = req.body;

    // Fetch colors currently used by this user
    const userTimersSnapshot = await db
      .collection("timers")
      .where("userId", "==", userId)
      .select("color")
      .get();

    const usedColors = userTimersSnapshot.docs.map((doc) => doc.data().color);

    // Logic to determine the final color
    if (
      !color ||
      usedColors.includes(color) ||
      !ALLOWED_COLORS.includes(color)
    ) {
      const availableColor = ALLOWED_COLORS.find(
        (c) => !usedColors.includes(c),
      );

      color = availableColor || ALLOWED_COLORS[0];
    }
    // Adding to a firebase collection.
    const docRef = await db.collection("timers").add({
      label,
      duration,
      color,
      intervals: intervals || [],
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
    const { userId } = req.auth;

    const snapshot = await db
      .collection("timers")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    // convering shapshot to data.
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
    const { id } = req.params; 
    const { userId } = req.auth;

    const timerRef = db.collection("timers").doc(id);
    const doc = await timerRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Timer not found" });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this timer!",
      });
    }

    // Delete it
    await timerRef.delete();

    res
      .status(200)
      .json({ success: true, message: "Timer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
