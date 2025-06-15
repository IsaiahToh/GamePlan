import React, { useEffect, useState } from "react";
import Weekview from "@/components/Weekview";
import Dayview from "@/components/Dayview";

type DashboardProps = {
  view: String;
};

const Dashboard: React.FC<DashboardProps> = ({ view }: DashboardProps) => {
  const [dashboardData, setDashboardData] = useState<any>(null);

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
        console.log(data.events);
        console.log(data.groups);
        setDashboardData(data);
        console.log("Fetched data:", data);
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        {view == "Week" ? (
          dashboardData && dashboardData.events ? (
            <Weekview
              lessons={dashboardData.events}
              groups={dashboardData.groups}
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
