import React from "react";

export default function Day({ day, rowIdx }: { day: any; rowIdx: number }) {
  function getCurrentDayClass() {
    const today = new Date();
    const isToday = day.isSame(today, "day");
    return isToday ? "bg-blue-600 text-white rounded-full w-7" : "";
  }
  return (
    <div className="border border-gray-200 flex flex-col">
      <header className="flex flex-col items-center">
        {rowIdx === 0 ? (
          <p className="text-sm mt-1">{day.format("ddd").toUpperCase()}</p>
        ) : null}
        <p className={`text-sm p-1 my-1 text-center ${getCurrentDayClass()}`}>
          {day.format("DD")}
        </p>
      </header>
    </div>
  );
}
