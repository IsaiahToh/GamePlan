import React from 'react';
import dayjs from 'dayjs';
import MonthView from '@/components/MonthView';

type DashboardProps = {
  month: dayjs.Dayjs[][];
};

const Dashboard: React.FC<DashboardProps> = ({ month }) => {

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        <MonthView month={month} />
      </div>
    </>
  )
}

export default Dashboard
