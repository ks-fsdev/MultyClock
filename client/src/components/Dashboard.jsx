import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useTimerContext } from "../context/TimerContext";
import TimerCard from "./TimerCard";

const Dashboard = () => {
  const { getToken } = useAuth();
  const { timers, setTimers, isFormOpen, setIsFormOpen, backendUrl } =
    useTimerContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimers = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(`${backendUrl}/api/timers/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimers(response.data.timers);
      } catch (error) {
        console.error("Error fetching timers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isFormOpen) {
      fetchTimers();
    }
  }, [getToken, setTimers, isFormOpen]);

  if (loading)
    return (
      <p className="text-gray-500 text-center mt-8 animate-pulse">
        Initializing dashboard...
      </p>
    );

  return (
    <div className="w-full max-w-4xl mx-auto lg:px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Render all active timers */}
        {timers.map((timer) => (
          <TimerCard key={timer.id} timer={timer} />
        ))}

        {/* The Dormant "Ghost" Card */}
        {timers.length === 0 && (
          <div
            onClick={() => setIsFormOpen(true)}
            className="bg-[#181818] border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col cursor-pointer hover:border-white/30 hover:bg-[#202020] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
                  Add a timer
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Ready for configuration
                </p>
              </div>
              <div className="w-4 h-4 rounded-full border border-gray-600/70 group-hover:border-gray-400 transition-colors" />
            </div>

            <div className="font-mono text-5xl font-light tracking-widest tabular-nums text-white/10 doto-font group-hover:text-white/30 transition-colors">
              00 00
            </div>

            <div className="flex gap-1 mt-3 h-1.5 w-full rounded-full overflow-hidden bg-white/5"></div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
              <div className="bg-white/5 border border-dashed border-white/10 text-gray-500 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold flex-1 sm:flex-none text-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                + Configure
              </div>

              <div className="bg-transparent border border-dashed border-white/5 px-4 py-2.5 sm:py-2 rounded-lg text-sm text-transparent select-none">
                ↺
              </div>

              <div className="bg-transparent border border-dashed border-white/5 px-4 py-2.5 sm:py-2 rounded-lg text-sm text-transparent select-none">
                ✕
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
