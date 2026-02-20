// src/context/TimerContext.jsx
import { createContext, useContext, useState } from "react";

// 1. Create the Context
const TimerContext = createContext();

// 2. Create the Provider Component
export const TimerProvider = ({ children }) => {
  // Here is your universal state!
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [timers, setTimers] = useState([]); // We'll use this later for the DB
  const [activeTimer, setActiveTimer] = useState(null); // The timer running on the clock

  return (
    <TimerContext.Provider
      value={{
        isFormOpen,
        setIsFormOpen,
        timers,
        setTimers,
        activeTimer,
        setActiveTimer,
      }}>
      {children}
    </TimerContext.Provider>
  );
};

// 3. Create a custom hook so it's easy to use anywhere
export const useTimerContext = () => useContext(TimerContext);
