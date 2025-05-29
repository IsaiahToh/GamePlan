import WeekView from '@/components/WeekView';
import React from 'react';

const Dashboard = () => {

  return (
    <div className='flex'>

      {/* Sidebar can be included here if needed */}

      <div className="w-full flex-1">
        <WeekView />
      </div>
    </div>
  )
}

export default Dashboard
