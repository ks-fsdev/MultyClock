import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useTimerContext } from "../context/TimerContext";
import TimerCard from "./TimerCard"; // 👈 Import the new card

const TimerList = () => {
  const { getToken } = useAuth();
  const { timers, setTimers } = useTimerContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimers = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          "http://localhost:5000/api/timers/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTimers(response.data.timers);
      } catch (error) {
        console.error("Error fetching timers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimers();
  }, [getToken, setTimers]);

  if (loading)
    return (
      <p className="text-gray-500 text-center mt-8">
        Loading your dashboard...
      </p>
    );

  if (timers.length === 0)
    return (
      <p className="text-gray-500 text-center mt-8">
        No active timers. Click 'Add Timer' above!
      </p>
    );

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-6">
      <h3 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3">
        Active Dashboard
      </h3>

      {/* Grid to display the cards nicely */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timers.map((timer) => (
          <TimerCard key={timer.id} timer={timer} />
        ))}
      </div>
    </div>
  );
};

export default TimerList;
