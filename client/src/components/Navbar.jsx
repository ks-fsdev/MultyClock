import { UserButton } from "@clerk/clerk-react";
import { useTimerContext } from "../context/TimerContext";
import { ClockPlus } from "lucide-react";
import logo from "../../public/logo.png";

const Navbar = () => {
  const { isFormOpen, setIsFormOpen } = useTimerContext();

  return (
    <nav className="glass-panel fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full animate-pulse">
          <img src={logo} alt="" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white md:inline-block hidden">
          Multy<span className="text-indigo-400">Clock</span>
        </span>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setIsFormOpen(true)}
          className={` text-white hover:text-black px-2 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer  ${isFormOpen ? "opacity-0" : "opacity-100"}`}>
          <ClockPlus />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-2 ring-indigo-500/50",
            },
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
