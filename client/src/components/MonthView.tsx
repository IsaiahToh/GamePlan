import React from 'react'
import Day from './Day'

export default function MonthView({month}: { month: any[][] }) {
  return (
    <div className='grid grid-cols-7 grid-rows-5 h-2/3 w-screen'>
      {month.map((row, i) => (
        <React.Fragment key={i}>
            {row.map((day, j) => (
                <Day day={day} key={j} rowIdx={i}/>
            ))}
        </React.Fragment>
        ))}
    </div>
  )
}
