import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import MonthView from '@/components/MonthView';
import { getMonth } from '@/lib/utils';
import Weekview from '@/components/Weekview';
import Dayview from '@/components/Dayview';

type DashboardProps = {
  month: number;
  view: String;
  currentDate: dayjs.Dayjs;
};

const Dashboard: React.FC<DashboardProps> = ({ month, view, currentDate }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard", {
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
        {view == "Month" ? (<MonthView month={getMonth(month)} />) : view == "Week" ? 
        (<Weekview currentDate={currentDate}/>) : (<Dayview currentDate={currentDate}/>)}
      </div>
    </>
  )
}

export default Dashboard