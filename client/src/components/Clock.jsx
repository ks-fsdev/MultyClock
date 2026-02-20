import { useEffect, useState } from "react";

const Clock = ({ timerData }) => {
  // If no timer is selected, show a placeholder
  if (!timerData) {
    return (
      <div className="flex items-center justify-center h-96 w-96 rounded-full border-4 border-white/5 mx-auto">
        <p className="text-gray-500">Select a timer to start</p>
      </div>
    );
  }

  const { duration, intervals, color, label } = timerData;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  // SVG Configuration
  const radius = 180; // Size of the circle
  const stroke = 12; // Thickness of the ring
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // 1. Calculate the Stroke Offset (The Depleting Ring Animation)
  // As timeLeft goes down, the offset goes UP, "erasing" the ring.
  const strokeDashoffset =
    circumference - (timeLeft / duration) * circumference;

  // 2. Calculate Bifurcation Dots (The "Keyframes")
  // We map over the intervals to find the cumulative percentage for each dot.
  let runningTotal = 0;
  const bifurcationDots = intervals.map((interval) => {
    runningTotal += interval;
    const angle = (runningTotal / duration) * 360; // Convert to degrees

    // Math magic to position the dot on the circle's edge
    // We subtract 90 degrees because SVG circles start at 3 o'clock, but we want 12 o'clock.
    const angleInRadians = (angle - 90) * (Math.PI / 180);
    const x = radius + normalizedRadius * Math.cos(angleInRadians);
    const y = radius + normalizedRadius * Math.sin(angleInRadians);

    return { x, y, id: runningTotal }; // return coordinates
  });

  // The Timer Logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false); // Stop when done
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Formatting Time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* The SVG Canvas */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-1000" // Rotate so it starts at top
        >
          {/* 1. Background Ring (Grey) */}
          <circle
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* 2. The Active Timer Ring (Colored) */}
          <circle
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 1s linear",
            }}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round" // Makes the end of the line rounded
          />

          {/* 3. The Bifurcation Dots (White dividers) */}
          {bifurcationDots.map(
            (dot, index) =>
              // Don't draw a dot at the very end (360 degrees)
              index !== bifurcationDots.length - 1 && (
                <circle
                  key={dot.id}
                  cx={dot.x}
                  cy={dot.y}
                  r={4} // Size of the dot
                  fill="white"
                  className="shadow-glow" // Optional: Add a glow effect in CSS
                />
              ),
          )}
        </svg>

        {/* Center Text (Time Display) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-6xl font-bold tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </h1>
          <p className="text-gray-400 mt-2 text-lg uppercase tracking-widest opacity-80">
            {label}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 cursor-pointer">
          {isRunning ? "Pause" : "Start Focus"}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(duration);
          }}
          className="bg-white/10 text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-white/20 transition-all cursor-pointer">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Clock;
