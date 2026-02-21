import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { TimerProvider } from "./context/TimerContext.jsx";
import { dark } from "@clerk/themes";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        // 2. Set the base theme to dark so the text flips to white
        baseTheme: dark,

        // 3. Override the global variables to match your exact hex codes
        variables: {
          colorPrimary: "#ffffff", // Makes the main buttons/spinners white
          colorTextOnPrimaryBackground: "#000000", // Black text on white buttons
          colorBackground: "#181818", // Matches your TimerCard background exactly
          colorInputBackground: "rgba(0, 0, 0, 0.5)", // Matches your form inputs
          colorInputText: "#ffffff",
          colorTextSecondary: "#9ca3af", // Tailwind gray-400
          borderRadius: "1rem", // Matches your rounded-2xl
        },

        // 4. Target specific Clerk elements to inject custom Tailwind-like borders
        elements: {
          card: {
            border: "1px solid rgba(255, 255, 255, 0.1)", // white/10 border
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", // Deep shadow
          },
          formButtonPrimary: {
            "&:hover": {
              backgroundColor: "#e5e7eb", // gray-200 hover effect
            },
          },
          formFieldInput: {
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          footerActionLink: {
            color: "#ffffff",
            "&:hover": {
              color: "#9ca3af",
            },
          },
        },
      }}>
      <TimerProvider>
        <App />
      </TimerProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
