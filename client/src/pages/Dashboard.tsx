import React, { useEffect, useState } from "react";
import Weekview from "@/components/Weekview";
import Dayview from "@/components/Dayview";

type DashboardProps = {
  view: String;
};

const Dashboard: React.FC<DashboardProps> = ({ view }: DashboardProps) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [tasks, setTasks] = useState<any>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
        const res = await fetch("http://localhost:3000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDashboardData(data);
        console.log("Fetched data:", data);
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        "http://localhost:3000/api/tasks/sorted/by-deadline-and-importance",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.scheduledTasks);
      console.log("Sorted tasks:", tasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };
    fetchTasks();
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
              tasks={tasks}
            />
          ) : (
            <div>Loading...</div>
          )
        ) : (
          <Dayview />
        )}
      </div>
    </>
  );
};

export default Dashboard;
