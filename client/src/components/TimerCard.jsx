import { useState, useEffect } from "react";

const TimerCard = ({ timer }) => {
  const [timeLeft, setTimeLeft] = useState(timer.duration);
  const [isRunning, setIsRunning] = useState(false);

  // Calculate the cumulative timestamps for the checkpoints
  const checkpoints = [];
  let runningTotal = 0;
  if (timer.intervals) {
    timer.intervals.forEach((interval) => {
      runningTotal += interval;
      checkpoints.push(runningTotal);
    });
  }

  // The Countdown Loop
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

  // Figure out the next checkpoint
  const elapsedTime = timer.duration - timeLeft;
  const nextCheckpointStamp = checkpoints.find((stamp) => stamp > elapsedTime);
  const timeUntilCheckpoint = nextCheckpointStamp ? nextCheckpointStamp - elapsedTime : 0;

  // Time Formatting Helper
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div 
      className={`p-5 rounded-2xl border transition-all ${
        isRunning 
          ? "bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
          : "bg-black/40 border-white/10 hover:border-white/20"
      }`}
    >
      {/* Header: Label & Status Indicator */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: timer.color, boxShadow: isRunning ? `0 0 10px ${timer.color}` : 'none' }}
            ></span>
            {timer.label}
          </h4>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            Total: {formatTime(timer.duration)}
          </p>
        </div>
        
        {/* Play / Pause / Reset Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
          >
            {isRunning ? "Pause" : "Play"}
          </button>
          
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(timer.duration);
            }}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer title='Reset'"
          >
            ↺
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
          <p className="text-sm font-semibold text-green-400">✅ Timer Complete!</p>
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
        <div className="flex gap-1 mt-3 h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
          {timer.intervals?.map((interval, idx) => {
            const blockStamp = checkpoints[idx];
            // If elapsedTime is past this block's stamp, it's done (colored)
            const isDone = elapsedTime >= blockStamp;
            return (
              <div 
                key={idx} 
                className="h-full flex-1 transition-colors duration-1000"
                style={{ backgroundColor: isDone ? timer.color : 'rgba(255,255,255,0.2)' }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimerCard;