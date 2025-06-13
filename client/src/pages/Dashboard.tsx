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
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDashboardData(data);
    };
    fetchDashboard();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        {view == "Week" ? <Weekview /> : <Dayview />}
      </div>
    </>
  );
};

export default Dashboard;
