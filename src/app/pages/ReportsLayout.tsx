import { Outlet } from "react-router";
import { ReportsProvider } from "../context/ReportsContext";

/** Wraps all /reports/* routes so every section can call useReports(). */
export function ReportsLayout() {
  return (
    <ReportsProvider>
      <Outlet />
    </ReportsProvider>
  );
}
