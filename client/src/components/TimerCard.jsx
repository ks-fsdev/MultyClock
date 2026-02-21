import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useTimerContext } from "../context/TimerContext";
import { Play, Pause } from "lucide-react";

const TimerCard = ({ timer }) => {
  const { getToken } = useAuth();

  // Grab setTimers for deletion, and syncTimer to broadcast our live time
  const { setTimers, syncTimer, globalCommand } = useTimerContext();

  const [timeLeft, setTimeLeft] = useState(timer.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // This listens for the master override signal!
  useEffect(() => {
    if (!globalCommand) return;

    if (globalCommand.command === "play" && timeLeft > 0) {
      setIsRunning(true);
    } else if (globalCommand.command === "pause") {
      setIsRunning(false);
    }
    // We include globalCommand.timestamp so it runs even if you hit pause twice in a row
  }, [globalCommand, timeLeft]);

  // --- NEW: THE LIVE SYNC BROADCAST ---
  // This tells the global context exactly where this timer is every second
  useEffect(() => {
    syncTimer(timer.id, timeLeft, isRunning);
  }, [timeLeft, isRunning, timer.id, syncTimer]);

  // --- DELETE LOGIC ---
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!window.confirm(`Delete "${timer.label}"?`)) return;

    setIsDeleting(true);
    try {
      const token = await getToken();

      await axios.delete(
        `http://localhost:5000/api/timers/delete/${timer.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Remove it from the Dashboard instantly
      setTimers((prevTimers) => prevTimers.filter((t) => t.id !== timer.id));
    } catch (error) {
      alert(
        "Error deleting timer: " +
          (error.response?.data?.error || error.message),
      );
      setIsDeleting(false);
    }
  };

  // --- MATH & CHECKPOINTS ---
  const checkpoints = [];
  let runningTotal = 0;
  if (timer.intervals) {
    timer.intervals.forEach((interval) => {
      runningTotal += interval;
      checkpoints.push(runningTotal);
    });
  }

  // --- THE INTERNAL CLOCK LOOP ---
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const elapsedTime = timer.duration - timeLeft;
  const nextCheckpointStamp = checkpoints.find((stamp) => stamp > elapsedTime);
  const timeUntilCheckpoint = nextCheckpointStamp
    ? nextCheckpointStamp - elapsedTime
    : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all relative ${
        isRunning
          ? "bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          : "bg-black/40 border-white/10 hover:border-white/20"
      } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2 group hover:text-indigo-300 transition-colors">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: timer.color,
                boxShadow: isRunning ? `0 0 10px ${timer.color}` : "none",
              }}></span>
            {timer.label}
          </h4>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            Total: {formatTime(timer.duration)}
          </p>
        </div>

        {/* Controls */}
        <div
          className="flex flex-wrap gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-all cursor-pointer sm:flex-none text-center">
            {isRunning ? (
              <Pause className="h-3.5" />
            ) : (
              <Play className="h-3.5" />
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(timer.duration);
            }}
            className="bg-white/5 hover:bg-white/20 text-gray-300 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all cursor-pointer "
            title="Reset">
            ↺
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            title="Delete Timer">
            ✕
          </button>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="mb-4">
        <div className="text-4xl font-extrabold tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Next Checkpoint Info Area */}
      <div className="bg-black/50 rounded-lg p-3 border border-white/5">
        {timeLeft === 0 ? (
          <p className="text-sm font-semibold text-green-400">
            Timer Complete!
          </p>
        ) : timeUntilCheckpoint > 0 ? (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Next checkpoint in:</span>
            <span className="font-mono font-bold text-indigo-300">
              {formatTime(timeUntilCheckpoint)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No upcoming checkpoints</p>
        )}

        {/* Visual Progress Bar for Checkpoints */}
        <div className="flex gap-1 mt-3 h-1.5 w-full rounded-full overflow-hidden">
          {timer.intervals?.map((interval, idx) => {
            // Find exactly when this specific block starts and ends
            const blockEndTime = checkpoints[idx];
            const blockStartTime = idx === 0 ? 0 : checkpoints[idx - 1];

            // Calculate how full this specific block should be (0 to 100%)
            let fillPercentage = 0;
            if (elapsedTime >= blockEndTime) {
              fillPercentage = 100; // Block is fully complete
            } else if (elapsedTime > blockStartTime) {
              // Block is currently active! Calculate the exact percentage.
              fillPercentage =
                ((elapsedTime - blockStartTime) / interval) * 100;
            }

            return (
              <div
                key={idx}
                className="h-full flex-1 bg-white/20 relative overflow-hidden rounded-full">
                {/* The smooth animated colored fill */}
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${fillPercentage}%`,
                    backgroundColor: timer.color,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimerCard;
