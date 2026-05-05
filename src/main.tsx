import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear any stuck Supabase locks from local storage to prevent infinite loading
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith("lock:sb-")) {
    localStorage.removeItem(key);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
