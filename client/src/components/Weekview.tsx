import { cn, getHours, getWeek } from "@/lib/utils";
import dayjs from "dayjs";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { colorOptions } from "@/lib/utils";

type Lesson = {
  moduleCode: string;
  lessonType: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  weeks: Array<number>; // Array of week numbers (1-13)
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

type Task = {
  name: string;
  description: string;
  deadlineDate: string; // YYYY-MM-DD format
  deadlineTime: string; // HH:mm format
  estimatedTimeTaken: number;
  minChunk: number;
  importance: string;
  group: string;
  day: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
};

type WeekviewProps = {
  lessons: Lesson[];
  tasks: Task[];
  groups: { name: string; color: string }[];
  firstSundayOfSem: string;
};

export default function Weekview({
  lessons,
  tasks,
  groups,
  firstSundayOfSem,
}: WeekviewProps) {
  const date = dayjs();
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-auto">
      {/* Header with dates of the current week */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2 shadow-sm border-b">
        <div className="w-16 border-r border-gray-300">
          <div className="relative h-16">
            <div className="absolute top-2 text-xs text-gray-600">GMT +8</div>
          </div>
        </div>
        {getWeek(date).map(({ currentDate, today }, i) => (
          <div key={i}>
            <div className={cn("text-xs", today && "text-blue-600")}>
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
              <div key={index} className="relative h-12">
                <div className="absolute -top-2 text-xs text-gray-600">
                  {hour.format("HH:mm")}
                </div>
              </div>
            ))}
          </div>
          {getWeek(date).map(({ isCurrentDay, today }, dayIndex) => {
            const dayDate = date.startOf("week").add(dayIndex, "day");

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
                      className="relative flex h-12 flex-col items-center gap-y-2 border-b border-gray-300"
                    >
                      {/* lessons view */}

                      {lessons
                        .filter((lesson: Lesson) => lesson.day === dayIndex) // Filter by day
                        .filter((lesson: Lesson) =>
                          lesson.weeks.includes(
                            date.diff(dayjs(firstSundayOfSem), "week") + 1 // Filter by whether it exists on the week
                          )
                        )
                        .filter((lesson: Lesson) => {
                          // Filter by time slot
                          // Check if the lesson starts at or after the slot start time
                          const taskStart = dayDate
                            .hour(Number(lesson.startTime.split(":")[0]))
                            .minute(Number(lesson.startTime.split(":")[1]));
                          return (
                            (taskStart.isSame(slotStart) ||
                              taskStart.isAfter(slotStart)) &&
                            taskStart.isBefore(slotStart.add(1, "hour"))
                          );
                        })
                        .map((lesson: Lesson, lessonIndex: number) => {
                          const taskStart = dayDate
                            .hour(Number(lesson.startTime.split(":")[0]))
                            .minute(Number(lesson.startTime.split(":")[1]));
                          const lessonEnd = dayDate
                            .hour(Number(lesson.endTime.split(":")[0]))
                            .minute(Number(lesson.endTime.split(":")[1]));
                          const duration = lessonEnd.diff(taskStart, "minutes");
                          const isOClockLesson = taskStart.minute() === 0;
                          const group = groups // Find exact group with corresponding module code
                            ? groups.find(
                                (g) =>
                                  g.name.toLowerCase() ===
                                  lesson.moduleCode.toLowerCase()
                              )
                            : undefined;
                          const colorOption = group // Find exact colorOption with corresponding color
                            ? colorOptions.find(
                                (option) => option.value === group.color
                              )
                            : undefined;

                          return (
                            <div
                              key={lessonIndex}
                              className={`absolute left-0 w-full ${
                                colorOption ? colorOption.css : "bg-gray-300"
                              } rounded-lg px-2 py-1 text-xs z-3 shadow-[0_3px_5px_rgba(0,0,0,3)]`}
                              style={{
                                top: `${isOClockLesson ? 0 : 50}%`,
                                height: `${(duration / 59) * 100}%`,
                              }}
                            >
                              <div className="font-semibold">
                                {lesson.moduleCode}
                              </div>
                              <div className="text-gray-600">
                                {lesson.lessonType}
                              </div>
                            </div>
                          );
                        })}

                      {/* tasks view */}

                      {tasks
                        .filter((task: Task) => task.day === dayIndex) // Filter by day
                        .filter((task: Task) => {
                          // Filter by time slot
                          // Check if the task starts at or after the slot start time
                          const taskStart = dayDate
                            .hour(Number(task.startTime.split(":")[0]))
                            .minute(Number(task.startTime.split(":")[1]));
                          return (
                            (taskStart.isSame(slotStart) ||
                              taskStart.isAfter(slotStart)) &&
                            taskStart.isBefore(slotStart.add(1, "hour"))
                          );
                        })
                        .map((task: Task, taskIndex: number) => {
                          const taskStart = dayDate
                            .hour(Number(task.startTime.split(":")[0]))
                            .minute(Number(task.startTime.split(":")[1]));
                          const taskEnd = dayDate
                            .hour(Number(task.endTime.split(":")[0]))
                            .minute(Number(task.endTime.split(":")[1]));
                          const duration = taskEnd.diff(taskStart, "minutes");
                          const isOClockTask = taskStart.minute() === 0;
                          const group = groups // Find exact group with corresponding module code
                            ? groups.find(
                                (g) =>
                                  g.name.toLowerCase() ===
                                  task.group.toLowerCase()
                              )
                            : undefined;
                          const colorOption = group // Find exact colorOption with corresponding color
                            ? colorOptions.find(
                                (option) => option.value === group.color
                              )
                            : undefined;

                          return (
                            <div
                              key={taskIndex}
                              className={`absolute left-0 w-full ${
                                colorOption ? colorOption.css : "bg-gray-300"
                              } rounded-lg px-2 py-1 text-xs z-2`}
                              style={{
                                top: `${isOClockTask ? 0 : 50}%`,
                                height: `${(duration / 59) * 100}%`,
                              }}
                            >
                              <div className="font-semibold">{task.name}</div>
                              <div className="text-gray-600">
                                {task.description}
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
                      top: `${
                        (currentTime.hour() / 24 +
                          currentTime.minute() / 30 / 48) *
                        100
                      }%`,
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
