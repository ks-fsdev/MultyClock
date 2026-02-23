import {
  SignedIn,
  SignedOut,
  useAuth,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import AddTimerForm from "./components/AddTimerForm";
import Clock from "./components/Clock";
import Dashboard from "./components/Dashboard";
import { useTimerContext } from "./context/TimerContext";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const { isFormOpen, setIsFormOpen, setTimers } = useTimerContext();

  return (
    <div className="h-screen pt-24 px-6 flex flex-col items-center overflow-hidden">
      <Toaster
        position="top-30"
        toastOptions={{
          // Default styling for all toasts
          className: "toast-detault",
          success: {
            iconTheme: {
              primary: "#A0E8AF",
              secondary: "#181818",
            },
          },
          error: {
            iconTheme: {
              primary: "#FF003C",
              secondary: "#181818",
            },
          },
        }}
      />

      <SignedOut>
        <div className="flex-1 flexbox flex-col px-6 relative w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 sm:w-150 sm:h-150 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-6">
              Master Your Time.
            </h1>

            <p className="text-base sm:text-xl text-gray-400 font-light tracking-wide mb-12 max-w-xl mx-auto">
              The only multi-timer app that lets you bifurcate time like a pro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
              <SignUpButton mode="modal">
                <button className="intro-button bg-white text-black font-bold text-sm  hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Get Started
                </button>
              </SignUpButton>

              <SignInButton mode="modal">
                <button className="intro-button border border-white/20 text-white font-medium text-sm tracking-wide hover:bg-white/10 hover:border-white/40 transition-all">
                  Log In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>

      {/* user logged in */}
      <SignedIn>
        <Navbar />
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-6 flex-1 min-h-0 mt-4">
          {/* LEFT SIDE: The Clock */}
          <div className="lg:col-span-1 w-full flex justify-center shrink-0 lg:pt-10">
            <Clock />
          </div>

          {/* RIGHT SIDE: The Dashboard */}
          <div className="lg:col-span-2 w-full flex-1 min-h-0 flex flex-col pr-2">
            <h3 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 shrink-0 mt-4 lg:mt-0">
              Dashboard
            </h3>

            {/* 2. The Scrolling List */}
            <div className="flex-1 overflow-y-auto touch-no-scrollbar pb-20">
              <Dashboard />
            </div>
          </div>
        </div>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flexbox p-4">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute -top-12 right-0 text-white/50 hover:text-white text-xl p-2 cursor-pointer transition-colors">
                ✕ <span className="hidden lg:inline-block">Close</span>
              </button>

              <AddTimerForm
                onTimerAdded={() => {
                  setIsFormOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </SignedIn>
    </div>
  );
}

export default App;
