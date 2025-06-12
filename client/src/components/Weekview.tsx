import { cn, getHours, getWeek } from "@/lib/utils";
import dayjs from "dayjs";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";

const events = [
  {
    id: "1",
    name: "MS2220",
    description: "AS8-02-02",
    start: "2025-06-09T09:00:00+08:00",
    end: "2025-06-09T11:00:00+08:00",
  },
  {
    id: "2",
    name: "Doctor Appointment",
    description: "Annual physical checkup.",
    start: "2025-06-11T14:30:00+08:00",
    end: "2025-06-11T15:00:00+08:00",
  },
  {
    id: "3",
    name: "Project Review",
    description: "Review project milestones.",
    start: "2025-06-13T16:00:00+08:00",
    end: "2025-06-13T17:00:00+08:00",
  },
];
type Event = {
  id: string;
  name: string;
  description: string;
  start: string; // ISO string
  end: string; // ISO string
};

type WeekviewProps = {
  currentDate: dayjs.Dayjs;
  events: Event[];
};

export default function Weekview({ currentDate }: WeekviewProps) {
  const selectedDate = currentDate;
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
          {getWeek(selectedDate).map(({ isCurrentDay, today }, dayIndex) => { 
            const dayDate = selectedDate.startOf("week").add(dayIndex, "day");

            return (
              <div key={dayIndex} className="relative border-r border-gray-300">
                {getHours.map((hour, hourIndex) => {
                  const firstHalfSlotStart = dayDate
                    .hour(hour.hour())
                    .minute(0)
                    .second(0);
                  const firstHalfSlotEnd = firstHalfSlotStart.add(0.5, "hour");
                  const secondHalfSlotStart = firstHalfSlotEnd;
                  const secondHalfSlotEnd = secondHalfSlotStart.add(
                    0.5,
                    "hour"
                  );

                  // Combine both half-hour slots for easier iteration
                  const halfHourSlots = [
                    {
                      slotStart: firstHalfSlotStart,
                      slotEnd: firstHalfSlotEnd,
                      position: "top-0",
                    },
                    {
                      slotStart: secondHalfSlotStart,
                      slotEnd: secondHalfSlotEnd,
                      position: "bottom-0",
                    },
                  ];

                  return (
                    <div
                      key={hourIndex}
                      className="relative flex h-16 cursor-pointer flex-col items-center gap-y-2 border-b border-gray-300 hover:bg-gray-100"
                    >
                      {halfHourSlots.map(
                        ({ slotStart, slotEnd, position }, slotIdx) => {
                          // Only render if the event starts in this slot
                          return events
                            .filter((event) => {
                              const eventStart = dayjs(event.start);
                              return eventStart.isSame(slotStart);
                            })
                            .map((event) => {
                              const eventStart = dayjs(event.start);
                              const eventEnd = dayjs(event.end);
                              const duration = eventEnd.diff(
                                eventStart,
                                "minute"
                              );
                              const slotCount = Math.ceil(duration / 30);
                              return (
                                <div
                                  key={event.id}
                                  className={`bg-blue-200 rounded px-2 py-1 text-xs w-full absolute ${position}`}
                                  style={{
                                    height: `${slotCount * 50}%`, // Each half-hour is 50% of the slot's height
                                    zIndex: 10,
                                  }}
                                  title={event.description}
                                >
                                  <h1 className="text-gray-800">{event.name}</h1>
                                  <p className="text-gray-500">{event.description}</p>
                                </div>
                              );
                            });
                        }
                      )}
                    </div>
                  );
                })}

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
