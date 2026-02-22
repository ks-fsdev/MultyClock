import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useTimerContext } from "../context/TimerContext";
import { Play, Pause } from "lucide-react";
import toast from "react-hot-toast";

const checkpointSound = new Audio("/checkpoint.wav");
const finalSound = new Audio("/timer.wav");

checkpointSound.loop = true;
finalSound.loop = true;

const TimerCard = ({ timer }) => {
  const { getToken } = useAuth();

  const stopAllAlarms = () => {
    checkpointSound.pause();
    checkpointSound.currentTime = 0;
    finalSound.pause();
    finalSound.currentTime = 0;
  };

  const triggerAlarm = (isFinal = false) => {
    // Stop anything currently playing first
    stopAllAlarms();

    const soundToPlay = isFinal ? finalSound : checkpointSound;

    soundToPlay.play().catch((err) => console.error("Playback blocked:", err));

    const toastId = toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {isFinal ? "Timer Complete!" : "Checkpoint Reached!"}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {isFinal
              ? `You've finished "${timer.label}".`
              : `Moving to the next block in "${timer.label}".`}
          </p>
          <button
            onClick={() => {
              stopAllAlarms();
              toast.dismiss(t.id);
            }}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg text-xs font-bold transition-colors">
            ACKNOWLEDGE
          </button>
        </div>
      ),
      {
        duration: isFinal ? Infinity : 10000,
        position: "top-center",
        className:
          "bg-[#181818] border border-white/10 p-4 rounded-2xl shadow-2xl",
      },
    );

    // If it's a checkpoint, we must stop the sound when the toast auto-dismisses
    if (!isFinal) {
      setTimeout(() => {
        stopAllAlarms();
        toast.dismiss(toastId);
      }, 10000);
    }
  };

  const { setTimers, syncTimer, globalCommand, backendUrl } = useTimerContext();

  const [timeLeft, setTimeLeft] = useState(timer.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // master play/pause
  useEffect(() => {
    if (!globalCommand) return;

    if (globalCommand.command === "play" && timeLeft > 0) {
      setIsRunning(true);
    } else if (globalCommand.command === "pause") {
      setIsRunning(false);
    }
  }, [globalCommand, timeLeft]);

  useEffect(() => {
    syncTimer(timer.id, timeLeft, isRunning);
  }, [timeLeft, isRunning, timer.id, syncTimer]);

  // --- DELETE LOGIC ---
  const handleDelete = (e) => {
    e.stopPropagation();

    toast(
      (t) => (
        <div className="min-w-50">
          <p className="text-white mb-3">
            Delete{" "}
            <span className="font-semibold capitalize">{timer.label}</span> ?
          </p>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Dismiss prompt first
                await confirmDelete(); // Then wait for the delete to finish
              }}
              className="bg-[#ff4b4b] text-white border-0 px-3 py-1 rounded cursor-pointer w-full font-bold">
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-[#333] text-white border-0 px-3 py-1 rounded cursor-pointer w-full">
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000, id: "delete-confirmation" },
    );
  };

  // Separate the actual API logic
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      await axios.delete(`${backendUrl}/api/timers/delete/${timer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTimers((prevTimers) => prevTimers.filter((t) => t.id !== timer.id));
      const toastId = toast.success("Timer Deleted!", { id: "delete-success" });

      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    } catch (error) {
      toast.error(
        "Error deleting: " + (error.response?.data?.error || error.message),
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

  const isSingleInterval = !timer.intervals || timer.intervals.length <= 1;

  // --- THE INTERNAL CLOCK LOOP ---
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
    }

    // Final Completion
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      triggerAlarm(true);
    }

    // Checkpoint Hit
    const isCheckpoint = checkpoints.some((cp) => cp === elapsedTime);

    if (isRunning && isCheckpoint && timeLeft !== 0 && elapsedTime !== 0) {
      triggerAlarm(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timer.label, timer.color]);

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
          ? "bg-neutral-900 border-white/40 shadow-lg]"
          : "bg-black/40 border-white/10 hover:border-white/20"
      } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2 group hover:text-indigo-300 transition-colors">
            <span
              className="w-3 h-3 rounded-full capitalize"
              style={{
                backgroundColor: timer.color,
                boxShadow: isRunning ? `0 0 10px ${timer.color}` : "none",
              }}></span>
            {timer.label}
          </h4>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            Total: ${formatTime(timer.duration)}
          </p>
        </div>

        {/* Controls */}
        <div
          className="flex flex-wrap gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}>
          {timeLeft > 0 && (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-all cursor-pointer sm:flex-none text-center">
              {isRunning ? (
                <Pause className="h-3.5" />
              ) : (
                <Play className="h-3.5" />
              )}
            </button>
          )}

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(timer.duration);
              stopAllAlarms();
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
        {timeLeft === 0 && !isSingleInterval ? (
          <p className="text-sm font-semibold text-green-400">
            Timer Complete!
          </p>
        ) : timeUntilCheckpoint > 0 && !isSingleInterval ? (
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
            const blockEndTime = checkpoints[idx];
            const blockStartTime = idx === 0 ? 0 : checkpoints[idx - 1];

            let fillPercentage = 0;
            if (elapsedTime >= blockEndTime) {
              fillPercentage = 100;
            } else if (elapsedTime > blockStartTime) {
              fillPercentage =
                ((elapsedTime - blockStartTime) / interval) * 100;
            }

            return (
              <div
                key={idx}
                className="h-full flex-1 bg-white/20 relative overflow-hidden rounded-full">
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
