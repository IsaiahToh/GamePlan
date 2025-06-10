import { cn, getHours, getWeek } from "@/lib/utils";
import dayjs from "dayjs";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";

export default function Weekview() {
  const selectedDate = dayjs();
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute
    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-auto">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2">
        <div className="w-16 border-r border-gray-300">
          <div className="relative h-16">
            <div className="absolute top-2 text-xs text-gray-600">GMT +8</div>
          </div>
        </div>
        {getWeek(selectedDate).map(({ currentDate, today }, i) => (
          <div>
            <div key={i} className={cn("text-xs", today && "text-blue-600")}>
              {currentDate.format("ddd")}
            </div>
            <div
              className={cn(
                "h-12 w-12 rounded-full p-2 text-2xl",
                today && "bg-blue-600 text-white"
              )}
            >
              {currentDate.format("DD")}{" "}
            </div>
          </div>
        ))}
      </div>
      <ScrollArea className="h-[70vh]">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2">
          {/* Time Column */}
          <div className="w-16 border-r border-gray-300">
            {getHours.map((hour, index) => (
              <div key={index} className="relative h-16">
                <div className="absolute -top-2 text-xs text-gray-600">
                  {hour.format("HH:mm")}
                </div>
              </div>
            ))}
          </div>
          {getWeek(selectedDate).map(({ isCurrentDay, today }, index) => {
            const dayDate = selectedDate.startOf("week").add(index, "day");

            return (
              <div key={index} className="relative border-r border-gray-300">
                {getHours.map((hour, i) => (
                  <div
                    key={i}
                    className="relative flex h-16 cursor-pointer flex-col items-center gap-y-2 border-b border-gray-300 hover:bg-gray-100"
                  >
                    
                  </div>
                ))}
                {/* Current time indicator */}

                {isCurrentDay(dayDate) && today && (
                  <div
                    className={cn("absolute h-0.5 w-full bg-red-500")}
                    style={{
                      top: `${(currentTime.hour() / 24) * 100}%`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
