import React from 'react'
import Day from './Day'
import type dayjs from 'dayjs'

type MonthViewProps = {
  month: dayjs.Dayjs[][];
}

export default function MonthView({month}: MonthViewProps) {
  return (
    <div className='grid grid-cols-7 grid-rows-5 h-screen w-full overflow-auto'>
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
