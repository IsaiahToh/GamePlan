import React, { useEffect, useState } from "react";
import Weekview from "@/components/Weekview";
import Dayview from "@/components/Dayview";
import Logout from "@/components/header/Logout";
import { type ScheduledTask, type dashboardData } from "@/lib/types";

type DashboardProps = {
  view: String;
  scheduledTasks: ScheduledTask[];
  fetchDashboardTasks: () => Promise<any>;
  fetchDashboard: (email: string) => Promise<void>;
  dashboardData: dashboardData;
};

const Dashboard: React.FC<DashboardProps> = ({
  view,
  scheduledTasks,
  fetchDashboardTasks,
  fetchDashboard,
  dashboardData,
}: DashboardProps) => {

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
