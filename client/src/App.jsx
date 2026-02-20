import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import Navbar from "./components/Navbar";
import AddTimerForm from "./components/AddTimerForm";
import Clock from "./components/Clock"; 

function App() {
  const { getToken } = useAuth();

  // The connection test logic
  const testApi = async () => {
    try {
      const token = await getToken();

      // Note: Make sure your backend URL is correct!
      const response = await axios.post(
        "http://localhost:5000/api/timers/add",
        {
          label: "Frontend Test Timer",
          duration: 300,
          color: "#33FF57",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("✅ Success! Backend Response: " + response.data.message);
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 flex flex-col items-center">
      <Navbar />
      <Clock />

      <SignedOut>
        <header className="max-w-2xl text-center mt-12 space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            Master Your Time.
          </h1>
          <p className="text-lg text-gray-400">
            The only multi-timer app that lets you bifurcate time like a pro.
          </p>
        </header>
      </SignedOut>

      {/* Only show the 'Test Connection' area if the user is actually logged in */}
      <SignedIn>
        <AddTimerForm />
      </SignedIn>
    </div>
  );
}

export default App;
