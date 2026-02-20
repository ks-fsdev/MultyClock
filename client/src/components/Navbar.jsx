import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useTimerContext } from "../context/TimerContext";

const Navbar = () => {
  const { isFormOpen, setIsFormOpen } = useTimerContext();

  return (
    <nav className="glass-panel fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-indigo-500 rounded-full animate-pulse"></div>
        <span className="text-lg font-bold tracking-tight text-white">
          Clock<span className="text-indigo-400">App</span>
        </span>
      </div>

      {/* Right: Auth Actions */}
      <div className="flex items-center gap-6">
        {/* If NOT logged in, show these buttons */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
              Log In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>

        {/* If LOGGED IN, show the user profile circle */}
        <SignedIn>
          <button
            onClick={() => setIsFormOpen(true)}
            className={`bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer  ${isFormOpen ? "opacity-0" : "opacity-100"}`}>
            Add Timer
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-indigo-500/50",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
