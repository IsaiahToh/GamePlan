import React from 'react';
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
