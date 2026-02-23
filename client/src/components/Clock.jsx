// src/components/Clock.jsx
import { useTimerContext } from "../context/TimerContext";

const Clock = () => {
  const { timers, liveTimers, setGlobalCommand } = useTimerContext();

  // Sort timers by total duration (longest first)
  const sortedTimers = [...timers].sort((a, b) => b.duration - a.duration);

  const center = 200; // Center point of the SVG
  const stroke = 3; // Thickness of the rings
  const gap = 11; // Space between rings
  const maxRadius = 180; // The outermost ring size

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="relative flex items-center justify-center">
        {/* The SVG Clock Rings */}
        <svg
          viewBox={`0 0 ${center * 2} ${center * 2}`}
          className="-rotate-90 w-full max-w-100 h-auto aspect-square">
          {sortedTimers.length === 0 && (
            <circle
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={stroke}
              fill="transparent"
              r={maxRadius}
              cx={center}
              cy={center}
            />
          )}

          {/* Render Active Timer Rings */}
          {sortedTimers.map((timer, index) => {
            const liveData = liveTimers[timer.id] || {
              timeLeft: timer.duration,
              isRunning: false,
            };

            const r = maxRadius - index * (stroke + gap);

            if (r <= 10) return null;

            const circumference = 2 * Math.PI * r;
            const strokeDashoffset =
              circumference -
              (liveData.timeLeft / timer.duration) * circumference;

            return (
              <g
                key={timer.id}
                className="transition-all duration-700 ease-in-out">
                {/* Background Track Ring */}
                <circle
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={stroke}
                  fill="transparent"
                  r={r}
                  cx={center}
                  cy={center}
                />

                {/* Active Colored Ring */}
                <circle
                  stroke={timer.color}
                  strokeWidth={stroke}
                  strokeDasharray={circumference}
                  style={{
                    strokeDashoffset: isNaN(strokeDashoffset)
                      ? 0
                      : strokeDashoffset,
                    transition: liveData.isRunning
                      ? "stroke-dashoffset 1s linear"
                      : "stroke-dashoffset 0.8s ease-in-out",
                  }}
                  fill="transparent"
                  r={r}
                  cx={center}
                  cy={center}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Center Display */}
        {(() => {
          const isAnythingRunning = Object.values(liveTimers).some(
            (t) => t.isRunning,
          );

          let nextUpTimer = null;
          let minTime = Infinity;

          timers.forEach((t) => {
            const live = liveTimers[t.id];
            if (
              live &&
              live.isRunning &&
              live.timeLeft > 0 &&
              live.timeLeft < minTime
            ) {
              minTime = live.timeLeft;
              nextUpTimer = { ...t, timeLeft: live.timeLeft };
            }
          });

          if (!nextUpTimer) {
            timers.forEach((t) => {
              const live = liveTimers[t.id];
              if (live && live.timeLeft > 0 && live.timeLeft < minTime) {
                minTime = live.timeLeft;
                nextUpTimer = { ...t, timeLeft: live.timeLeft };
              }
            });
          }

          // Automatically falls back to 00:00 and white/gray if no timers exist
          if (!nextUpTimer) {
            nextUpTimer = { color: "#ffffff", timeLeft: 0 };
          }

          const formatCenterTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
          };

          const handleGlobalToggle = () => {
            if (isAnythingRunning) {
              setGlobalCommand({ command: "pause", timestamp: Date.now() });
            } else {
              setGlobalCommand({ command: "play", timestamp: Date.now() });
            }
          };

          return (
            <button
              onClick={handleGlobalToggle}
              // Disabled clicking if there are no timers
              disabled={timers.length === 0}
              className={`absolute flexbox w-40 h-40 rounded-full group outline-none transition-transform ${
                timers.length > 0
                  ? "cursor-pointer active:scale-95"
                  : "cursor-default"
              }`}
              title={isAnythingRunning ? "Pause All" : "Play All"}>
              {/* Background */}
              <div
                className="absolute inset-0 rounded-full bg-black border border-white/5 transition-all duration-700"
                style={{
                  boxShadow:
                    "inset 0 0 40px 15px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.5)",
                }}
              />

              {/* The Event Horizon Glow */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 blur-2xl ${
                  isAnythingRunning ? "opacity-20" : "opacity-0"
                }`}
                style={{ backgroundColor: nextUpTimer.color }}
              />

              {/* The Raw Numbers */}
              <div
                className={`relative z-10 font-mono text-5xl font-light tracking-widest tabular-nums transition-all duration-500 doto-font ${
                  isAnythingRunning ? "text-white" : "text-white/20"
                }`}>
                {formatCenterTime(nextUpTimer.timeLeft).replace(":", " ")}
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default Clock;
