import { cn, getHours, getWeek } from "@/lib/utils";
import dayjs from "dayjs";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { colorOptions } from "@/lib/utils";
import { type ScheduledTask, type Lesson } from "@/lib/types";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useDashboardContext } from "@/context/DashboardContext";
import { CornerDownLeft } from "lucide-react";

export default function Weekview() {
  const date = dayjs();
  const {
    dashboardData,
    scheduledTasks,
    taskOn,
    setTaskOn,
    friendView,
    setFriendView,
    fetchDashboard,
  } = useDashboardContext();
  const { lessons, groups, firstSundayOfSem, blockOutTimings } = dashboardData;
  const [currentTime, setCurrentTime] = useState(dayjs());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const weekNumber = dayjs(firstSundayOfSem).isAfter(date, "day")
    ? 0
    : date.diff(dayjs(firstSundayOfSem), "week") + 1;

  const handleCheck = () => {
    setTaskOn(!taskOn);
  };

  const handleReturn = () => {
    setFriendView(false);
    setTaskOn(true);
    fetchDashboard(localStorage.getItem("email") || "");
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-auto">
      {/* Header with dates of the current week */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2 shadow-sm">
        <div className="h-full border-r border-gray-300 flex flex-col items-center justify-center gap-y-2 pr-3">
          <div className="text-xs text-gray-600">
            {weekNumber == 0 ? "Sem break" : `Week ${weekNumber}`}
          </div>
          <div className="flex items-center gap-1">
            {friendView ? (
              <CornerDownLeft onClick={handleReturn} />
            ) : (
              <div className="flex items-center gap-1">
                <Checkbox
                  id="terms"
                  className="w-4 h-4"
                  onClick={handleCheck}
                  defaultChecked
                />
                <Label htmlFor="terms" className="text-xs text-gray-600">
                  Tasks
                </Label>
              </div>
            )}
          </div>
        </div>

        {getWeek(date).map(({ currentDate, today }, i) => (
          <div key={i}>
            <div
              className={cn(
                "text-xs flex items-center justify-center",
                today && "text-blue-600"
              )}
            >
              {currentDate.format("ddd")}
            </div>
            <div
              className={cn(
                "h-12 w-12 rounded-full items-center justify-center flex text-2xl",
                today && "bg-blue-600 text-white"
              )}
            >
              {currentDate.format("DD")}{" "}
            </div>
          </div>
        ))}
      </div>
      <ScrollArea className="h-[70vh]" ref={scrollAreaRef}>
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
          {getWeek(date).map(
            ({ isCurrentDay, today, currentDate }, dayIndex) => {
              // Use currentDate.format("dddd") to get the day name (e.g. "Monday")
              const dayName = currentDate.format("dddd");

              // Filter blockouts for this day
              const relevantBlockouts =
                !blockOutTimings || blockOutTimings.length === 0
                  ? []
                  : blockOutTimings.filter(
                      (block) =>
                        block.day === "all" ||
                        !block.day ||
                        block.day === dayName
                    );

              return (
                <div
                  key={dayIndex}
                  className="relative border-r border-gray-300 h-full"
                >
                  {/* Blockout timings as single absolute blocks */}
                  {relevantBlockouts.map((block, blockIdx) => {
                    const [blockStartHour, blockStartMin] = block.from
                      .split(":")
                      .map(Number);
                    const [blockEndHour, blockEndMin] = block.to
                      .split(":")
                      .map(Number);

                    const blockStart = blockStartHour * 60 + blockStartMin;
                    const blockEnd = blockEndHour * 60 + blockEndMin;
                    const dayStart = 0;
                    const dayEnd = 24 * 60;

                    const top =
                      ((blockStart - dayStart) / (dayEnd - dayStart)) * 100;
                    const height =
                      ((blockEnd - blockStart) / (dayEnd - dayStart)) * 100;

                    return (
                      <div
                        key={blockIdx}
                        className="absolute left-0 w-full bg-gray-400 bg-opacity-60 rounded-lg px-2 py-1 text-xs z-1 flex flex-col items-start"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                        }}
                        title={block.label}
                      >
                        <span className="font-semibold text-gray-800">
                          {block.label || "Blocked"}
                        </span>
                        <span className="text-gray-600">
                          {block.from} - {block.to}
                        </span>
                      </div>
                    );
                  })}

                  {/* Hour slots */}
                  {getHours.map((hour, hourIndex) => {
                    const slotStart = currentDate
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
                          .filter((lesson: Lesson) => lesson.day === dayIndex)
                          .filter((lesson: Lesson) =>
                            lesson.weeks.includes(weekNumber)
                          )
                          .filter((lesson: Lesson) => {
                            const taskStart = currentDate
                              .hour(Number(lesson.startTime.split(":")[0]))
                              .minute(Number(lesson.startTime.split(":")[1]));
                            return (
                              (taskStart.isSame(slotStart) ||
                                taskStart.isAfter(slotStart)) &&
                              taskStart.isBefore(slotStart.add(1, "hour"))
                            );
                          })
                          .map((lesson: Lesson, lessonIndex: number) => {
                            const taskStart = currentDate
                              .hour(Number(lesson.startTime.split(":")[0]))
                              .minute(Number(lesson.startTime.split(":")[1]));
                            const lessonEnd = currentDate
                              .hour(Number(lesson.endTime.split(":")[0]))
                              .minute(Number(lesson.endTime.split(":")[1]));
                            const duration = lessonEnd.diff(
                              taskStart,
                              "minutes"
                            );
                            const isOClockLesson = taskStart.minute() === 0;
                            const group = groups
                              ? groups.find(
                                  (g) =>
                                    g.name.toLowerCase() ===
                                    lesson.moduleCode.toLowerCase()
                                )
                              : undefined;
                            const colorOption = group
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
                        {taskOn &&
                          (scheduledTasks || [])
                            .filter(
                              (task: ScheduledTask) => task.day === dayIndex
                            )
                            .filter((task: ScheduledTask) => {
                              const taskStart = currentDate
                                .hour(Number(task.startTime.split(":")[0]))
                                .minute(Number(task.startTime.split(":")[1]));
                              return (
                                (taskStart.isSame(slotStart) ||
                                  taskStart.isAfter(slotStart)) &&
                                taskStart.isBefore(slotStart.add(1, "hour"))
                              );
                            })
                            .map((task: ScheduledTask, taskIndex: number) => {
                              const taskStart = currentDate
                                .hour(Number(task.startTime.split(":")[0]))
                                .minute(Number(task.startTime.split(":")[1]));
                              const taskEnd = currentDate
                                .hour(Number(task.endTime.split(":")[0]))
                                .minute(Number(task.endTime.split(":")[1]));
                              const duration = taskEnd.diff(
                                taskStart,
                                "minutes"
                              );
                              const isOClockTask = taskStart.minute() === 0;
                              const group = groups
                                ? groups.find(
                                    (g) =>
                                      g.name.toLowerCase() ===
                                      task.group.toLowerCase()
                                  )
                                : undefined;
                              const colorOption = group
                                ? colorOptions.find(
                                    (option) => option.value === group.color
                                  )
                                : undefined;

                              return (
                                <div
                                  key={taskIndex}
                                  className={`absolute left-0 w-full ${
                                    colorOption
                                      ? colorOption.css
                                      : "bg-gray-300"
                                  } rounded-lg px-2 py-1 text-xs z-2`}
                                  style={{
                                    top: `${isOClockTask ? 0 : 50}%`,
                                    height: `${(duration / 59) * 100}%`,
                                  }}
                                >
                                  <div className="font-semibold">
                                    {task.name}
                                  </div>
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
                  {isCurrentDay(currentDate) && today && (
                    <div
                      className="absolute w-full flex items-center z-4 pointer-events-none"
                      style={{
                        top: `${
                          (currentTime.hour() / 24 +
                            currentTime.minute() / 30 / 48) *
                          100
                        }%`,
                        transform: "translateY(-50%)",
                      }}
                    >
                      {/* Red circle (bulb) */}
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-md -ml-1 z-50" />
                      {/* Red line */}
                      <div className="h-0.5 bg-red-500 flex-1" />
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
