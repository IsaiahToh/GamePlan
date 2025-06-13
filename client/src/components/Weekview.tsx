import { cn, getHours, getWeek } from "@/lib/utils";
import dayjs from "dayjs";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);

const lessons = [
  {
    id: "1",
    name: "MS2220",
    description: "AS8-02-02",
    day: 2,
    start: "14:30",
    end: "17:30",
  },
  {
    id: "2",
    name: "CS2040S",
    description: "Tut [01]",
    day: 3,
    start: "08:00",
    end: "09:30",
  },
  {
    id: "3",
    name: "CS2030S",
    description: "KR lecture hall",
    day: 5,
    start: "08:30",
    end: "10:00",
  },
];
type Lesson = {
  id: string;
  name: string;
  description: string;
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start: string; // ISO string
  end: string; // ISO string
};

type WeekviewProps = {
  currentDate: dayjs.Dayjs;
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
              <div key={index} className="relative h-8">
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
                  const slotStart = dayDate
                    .hour(hour.hour())
                    .minute(0)
                    .second(0);

                  return (
                    <div
                      key={hourIndex}
                      className="relative flex h-8 flex-col items-center gap-y-2 border-b border-gray-300"
                    >
                      {lessons
                        .filter((lesson: Lesson) => lesson.day === dayIndex) // Filter by day
                        .filter((lesson: Lesson) => {
                          // Filter by time slot
                          // Check if the lesson starts at or after the slot start time
                          const lessonStart = dayDate
                            .hour(Number(lesson.start.split(":")[0]))
                            .minute(Number(lesson.start.split(":")[1]));
                          return (
                            (lessonStart.isSame(slotStart) ||
                              lessonStart.isAfter(slotStart)) &&
                            lessonStart.isBefore(slotStart.add(1, "hour"))
                          );
                        })
                        .map((lesson: Lesson) => {
                          const lessonStart = dayDate
                            .hour(Number(lesson.start.split(":")[0]))
                            .minute(Number(lesson.start.split(":")[1]));
                          const lessonEnd = dayDate
                            .hour(Number(lesson.end.split(":")[0]))
                            .minute(Number(lesson.end.split(":")[1]));
                          const duration = lessonEnd.diff(
                            lessonStart,
                            "minutes"
                          );
                          const isOClockLesson = lessonStart.minute() === 0;

                          return (
                            <div
                              key={lesson.id}
                              className="absolute left-0 w-full bg-blue-200 rounded px-2 py-1 text-xs"
                              style={{
                                top: `${isOClockLesson ? 0 : 50}%`,
                                height: `${(duration / 59) * 100}%`,
                              }}
                            >
                              <div className="font-semibold">{lesson.name}</div>
                              <div className="text-gray-600">
                                {lesson.description}
                              </div>
                            </div>
                          );
                        })}
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
