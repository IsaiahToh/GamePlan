import { useEffect } from "react";
import Weekview from "@/components/Weekview";
import Dayview from "@/components/Dayview";
import Logout from "@/components/header/Logout";
import { useDashboardContext } from "@/context/DashboardContext";

export function Dashboard() {
  const { view, fetchDashboardTasks, fetchDashboard, loggedIn } =
    useDashboardContext();

  useEffect(() => {
    fetchDashboard(localStorage.getItem("email") || "");
    fetchDashboardTasks();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        {loggedIn ? view === "Week" ? <Weekview /> : <Dayview /> : <Logout />}
      </div>
    </>
  );
}

export default Dashboard;
