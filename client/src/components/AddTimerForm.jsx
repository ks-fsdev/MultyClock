import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useTimerContext } from "../context/TimerContext";
import toast from "react-hot-toast";

const ALLOWED_COLORS = [
  "#FF5733",
  "#F0F0F0",
  "#FF2A6D",
  "#39FF14",
  "#FAEA48",
  "#9D4EDD",
];

const AddTimerForm = ({ onTimerAdded }) => {
  const { isFormOpen, backendUrl, timers } = useTimerContext();
  const { getToken } = useAuth();

  // Form State
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(ALLOWED_COLORS[0]);
  const [intervals, setIntervals] = useState([]);
  
  // Split Time Input State
  const [newMinutes, setNewMinutes] = useState("");
  const [newSeconds, setNewSeconds] = useState("");

  const usedColors = timers.map((t) => t.color);

  // Helper to format seconds for display (e.g., 65 -> "1m 5s")
  const formatDisplay = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}m`;
    return `${m}m ${s}s`;
  };

  const handleAddInterval = () => {
    const m = parseInt(newMinutes, 10) || 0;
    const s = parseInt(newSeconds, 10) || 0;
    const totalInSeconds = (m * 60) + s;

    if (totalInSeconds <= 0) {
      toast.error("Enter a valid time!");
      return;
    }

    setIntervals([...intervals, totalInSeconds]);
    setNewMinutes("");
    setNewSeconds("");
  };

  const handleRemoveInterval = (indexToRemove) => {
    setIntervals(intervals.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!label.trim()) {
      toast.error("Please give your timer a label.");
      return;
    }

    if (intervals.length === 0) {
      toast.error("Add at least one time block!");
      return;
    }

    const totalDuration = intervals.reduce((acc, curr) => acc + curr, 0);

    try {
      const token = await getToken();

      const payload = {
        label,
        color: selectedColor,
        intervals: intervals, // Now storing raw seconds
        duration: totalDuration,
      };

      const response = await axios.post(
        `${backendUrl}/api/timers/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset Form
      setLabel("");
      setIntervals([]);
      if (onTimerAdded) onTimerAdded(response.data);

      toast.success("Timer locked in!", {
        position: "top-left",
        className: "bg-[#181818] text-white border border-white/10 rounded-[1rem] shadow-2xl mt-[50px] ml-[20px] m-[10px]",
      });
    } catch (error) {
      toast.error(
        "Error saving: " + (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div
      className={`bg-[#181818] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto shadow-2xl mt-8 ${
        isFormOpen ? "block" : "hidden"
      } max-h-[85vh] overflow-y-auto touch-no-scrollbar`}
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-6 tracking-tight text-white">
        New Timer
      </h2>

      <div className="space-y-6">
        {/* Label Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Label
          </label>
          <input
            type="text"
            placeholder="e.g., Sprint, Meditation..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Color Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Theme Color
          </label>
          <div className="flex flex-wrap gap-3">
            {ALLOWED_COLORS.map((color) => {
              const isUsed = usedColors.includes(color);
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  disabled={isUsed}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-9 h-9 rounded-full transition-all relative flex items-center justify-center ${
                    isUsed
                      ? "opacity-20 cursor-not-allowed scale-90"
                      : isSelected
                      ? "ring-2 ring-white ring-offset-4 ring-offset-[#181818] scale-110"
                      : "hover:scale-110 cursor-pointer shadow-lg"
                  }`}
                >
                  {isUsed && <span className="text-[10px] text-white">✕</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Input Section */}
        <div className="pt-6 border-t border-white/5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Add Time Blocks
          </label>
          
          <div className="flex gap-2 mb-4">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min"
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold uppercase pointer-events-none">M</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Sec"
                  value={newSeconds}
                  onChange={(e) => setNewSeconds(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold uppercase pointer-events-none">S</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddInterval}
              className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl text-sm font-bold transition-all"
            >
              Add
            </button>
          </div>

          {/* Visual Intervals */}
          <div className="flex flex-wrap gap-2 min-h-10">
            {intervals.map((time, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRemoveInterval(idx)}
                className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-2 group"
              >
                {formatDisplay(time)}
                <span className="opacity-40 group-hover:opacity-100 text-[10px]">✕</span>
              </button>
            ))}
            {intervals.length === 0 && (
              <p className="text-xs text-gray-600 italic">No blocks added yet...</p>
            )}
          </div>
        </div>

        {/* Footer info and Submit */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Run Time</span>
            <span className="text-lg font-black text-white tabular-nums">
              {formatDisplay(intervals.reduce((acc, curr) => acc + curr, 0))}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 cursor-pointer"
          >
            SAVE & LAUNCH
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTimerForm;