import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { getHours, isCurrentDay } from "@/lib/utils";
import { type ScheduledTask, type Lesson } from "@/lib/types";
import { colorOptions } from "@/lib/utils";

type DayviewProps = {
  lessons: Lesson[];
  tasks: ScheduledTask[];
  groups: { name: string; color: string }[];
  firstSundayOfSem: string;
};

export default function Dayview({
  lessons,
  tasks,
  groups,
  firstSundayOfSem,
}: DayviewProps) {
  const date = dayjs();
  const weekNumber = dayjs(firstSundayOfSem).isAfter(date, "day")
    ? 0
    : date.diff(dayjs(firstSundayOfSem), "week") + 1;
  const [currentTime, setCurrentTime] = useState(dayjs());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current time as fraction of the day
    const minutesPassed = date.hour() * 60 + date.minute();
    const fractionOfDay = minutesPassed / (24 * 60);

    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement | null;
      if (viewport) {
        const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
        viewport.scrollTop = maxScrollTop * fractionOfDay;
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-auto">
      <div className="grid grid-cols-[auto_1fr] px-4">
        <div className="w-16 border-r border-gray-300 text-xs">GMT +8</div>
        <div className="flex w-16 flex-col items-center">
          <div className="text-xs flex items-center justify-center text-blue-600">
            {date.format("ddd")}
          </div>
          <div className="h-12 w-12 rounded-full items-center justify-center flex text-2xl bg-blue-600 text-white">
            {date.format("DD")}{" "}
          </div>
        </div>
        <div></div>
      </div>

      <ScrollArea className="h-[70vh]" ref={scrollAreaRef}>
        <div className="grid grid-cols-[auto_1fr] p-4">
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

          {/* Day/Boxes Column */}
          <div className="relative border-r border-gray-300">
            {getHours.map((hour, hourIndex) => {
              const slotStart = date.hour(hour.hour()).minute(0).second(0);

              return (
                <div
                  key={hourIndex}
                  className="relative flex h-12 flex-col items-center gap-y-2 border-b border-gray-300"
                >
                  {/* lessons view */}

                  {lessons
                    .filter((lesson: Lesson) => lesson.day === date.day()) // Filter by day
                    .filter(
                      (lesson: Lesson) => lesson.weeks.includes(weekNumber) // Check that lesson falls into week
                    )
                    .filter((lesson: Lesson) => {
                      // Filter by time slot
                      // Check if the lesson starts at or after the slot start time
                      const taskStart = date
                        .hour(Number(lesson.startTime.split(":")[0]))
                        .minute(Number(lesson.startTime.split(":")[1]));
                      return (
                        (taskStart.isSame(slotStart) ||
                          taskStart.isAfter(slotStart)) &&
                        taskStart.isBefore(slotStart.add(1, "hour"))
                      );
                    })
                    .map((lesson: Lesson, lessonIndex: number) => {
                      const taskStart = date
                        .hour(Number(lesson.startTime.split(":")[0]))
                        .minute(Number(lesson.startTime.split(":")[1]));
                      const lessonEnd = date
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
                          } rounded-lg px-2 py-1 text-xs z-3 shadow-[0_3px_5px_rgba(0,0,0,1)]`}
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
                    .filter((task: ScheduledTask) => task.day === date.day()) // Filter by day
                    .filter((task: ScheduledTask) => {
                      // Filter by time slot
                      // Check if the task starts at or after the slot start time
                      const taskStart = date
                        .hour(Number(task.startTime.split(":")[0]))
                        .minute(Number(task.startTime.split(":")[1]));
                      return (
                        (taskStart.isSame(slotStart) ||
                          taskStart.isAfter(slotStart)) &&
                        taskStart.isBefore(slotStart.add(1, "hour"))
                      );
                    })
                    .map((task: ScheduledTask, taskIndex: number) => {
                      const taskStart = date
                        .hour(Number(task.startTime.split(":")[0]))
                        .minute(Number(task.startTime.split(":")[1]));
                      const taskEnd = date
                        .hour(Number(task.endTime.split(":")[0]))
                        .minute(Number(task.endTime.split(":")[1]));
                      const duration = taskEnd.diff(taskStart, "minutes");
                      const isOClockTask = taskStart.minute() === 0;
                      const group = groups // Find exact group with corresponding module code
                        ? groups.find(
                            (g) =>
                              g.name.toLowerCase() === task.group.toLowerCase()
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
            <div
              className="absolute w-full flex items-center z-10 pointer-events-none"
              style={{
                top: `${
                  (currentTime.hour() / 24 + currentTime.minute() / 30 / 48) *
                  100
                }%`,
                transform: "translateY(-50%)",
              }}
            >
              {/* Red circle (bulb) */}
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-md -ml-1 z-20" />
              {/* Red line */}
              <div className="h-0.5 bg-red-500 flex-1" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
