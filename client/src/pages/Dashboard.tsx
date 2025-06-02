import React from 'react';
import dayjs from 'dayjs';
import MonthView from '@/components/MonthView';
import { getMonth } from '@/lib/utils';
import Weekview from '@/components/Weekview';
import Dayview from '@/components/Dayview';

type DashboardProps = {
  month: number;
  view: String;
};

const Dashboard: React.FC<DashboardProps> = ({ month, view }) => {

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        {view == "Month" ? (<MonthView month={getMonth(month)} />) : view == "Week" ? 
        (<Weekview />) : (<Dayview />)}
      </div>
    </>
  )
}

export default Dashboard
