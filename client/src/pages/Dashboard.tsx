import { useEffect } from "react";
import Weekview from "@/components/Weekview";
import Dayview from "@/components/Dayview";
import Logout from "@/components/header/Logout";
import { useDashboardContext } from "@/context/DashboardContext";

export function Dashboard() {

  const {
    view,
    scheduledTasks,
    fetchDashboardTasks,
    dashboardData,
    fetchDashboard,
  } = useDashboardContext();

  useEffect(() => {
    fetchDashboard(localStorage.getItem("email") || "");
  }, []);

  useEffect(() => {
    fetchDashboardTasks();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        {view == "Week" ? (
          dashboardData && dashboardData.events ? (
            <Weekview
              lessons={dashboardData.events}
              groups={dashboardData.groups}
              firstSundayOfSem={dashboardData.firstSundayOfSem}
              tasks={scheduledTasks}
              blockOutTimings={dashboardData.blockOutTimings}
            />
          ) : (
            <Logout />
          )
        ) : (
          <Dayview
            lessons={dashboardData.events}
            groups={dashboardData.groups}
            firstSundayOfSem={dashboardData.firstSundayOfSem}
            tasks={scheduledTasks}
            blockOutTimings={dashboardData.blockOutTimings}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;
