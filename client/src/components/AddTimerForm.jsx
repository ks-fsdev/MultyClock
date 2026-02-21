import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useTimerContext } from "../context/TimerContext";

// Our backend's allowed aesthetic colors
const ALLOWED_COLORS = ["#FF5733", "#33FF57", "#3357FF", "#F0F0F0"];

const AddTimerForm = ({ onTimerAdded }) => {
  const { isFormOpen, setIsFormOpen } = useTimerContext();

  const { getToken } = useAuth();

  // Form State
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(ALLOWED_COLORS[0]);

  // Sub-timers State
  const [intervals, setIntervals] = useState([]);
  const [newIntervalTime, setNewIntervalTime] = useState("");

  // Calculate total duration dynamically
  const totalMinutes = intervals.reduce((acc, curr) => acc + curr, 0);

  const handleAddInterval = () => {
    const time = parseInt(newIntervalTime, 10);
    if (!time || isNaN(time) || time <= 0) return;

    setIntervals([...intervals, time]);
    setNewIntervalTime("");
  };

  const handleRemoveInterval = (indexToRemove) => {
    setIntervals(intervals.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (intervals.length === 0) {
      alert("You need to add at least one time block!");
      return;
    }

    try {
      const token = await getToken();

      const payload = {
        label,
        color: selectedColor,
        intervals: intervals.map((mins) => mins * 60), // Convert each block to seconds
        duration: totalMinutes * 60, // Backend expects total duration in seconds
      };

      const response = await axios.post(
        "http://localhost:5000/api/timers/add",
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Reset form
      setLabel("");
      setIntervals([]);
      if (onTimerAdded) onTimerAdded(response.data);

      alert("Timer locked in!");
    } catch (error) {
      alert(
        "Error saving timer: " + (error.response?.data?.error || error.message),
      );
    }
  };

  return (
    <div
      className={`bg-[#181818] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto shadow-2xl mt-8 ${
        isFormOpen ? "block" : "hidden"
      } max-h-[85vh] overflow-y-auto touch-no-scrollbar`}>
      <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 tracking-tight">
        New Timer
      </h2>

      <div className="space-y-5">
        {/* Label Input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Label
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Deep Work, Read..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 sm:py-2 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Aesthetic Color Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Timer Ring Color
          </label>
          <div className="flex flex-wrap gap-3">
            {ALLOWED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-transform ${
                  selectedColor === color
                    ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#181818]"
                    : "hover:scale-110"
                }`}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Sub-Timers Section */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Divide your time (Sub-timers)
          </label>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="number"
              placeholder="Minutes (e.g., 5)"
              value={newIntervalTime}
              onChange={(e) => setNewIntervalTime(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddInterval())
              }
              className="flex-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 sm:py-2 text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddInterval}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
              Add Block
            </button>
          </div>

          {/* Render the chunks visually */}
          {intervals.length > 0 ? (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 touch-no-scrollbar">
              {intervals.map((time, idx) => (
                <div
                  key={idx}
                  onClick={() => handleRemoveInterval(idx)}
                  className="bg-white/10 hover:bg-red-500/80 px-3 py-2 sm:py-1.5 rounded-md text-sm text-gray-200 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 group "
                  title="Click to remove">
                  {time}m
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4 italic">
              No blocks added yet.
            </p>
          )}

          <p className="text-sm font-medium text-indigo-400 text-right">
            Total: {totalMinutes} minutes
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full mt-6 bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg cursor-pointer">
          Save & Launch Timer
        </button>
      </div>
    </div>
  );
};

export default AddTimerForm;
