
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { getRecentReportApiLogs } from "./app/utils/reportApiLogger";

if (import.meta.env.DEV) {
  (window as Window & { __reportApiLogs?: () => ReturnType<typeof getRecentReportApiLogs> }).__reportApiLogs =
    getRecentReportApiLogs;
}

createRoot(document.getElementById("root")!).render(<App />);