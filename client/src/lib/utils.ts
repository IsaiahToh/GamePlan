import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isCurrentDay(date: dayjs.Dayjs) {
  const today = dayjs();
  return date.isSame(today, "day");
}

export function getMonth(month = dayjs().month()) {
  const year = dayjs().year();
  const firstDayOfMonth = dayjs(new Date(year, month, 1)).day();
  let currentDayCount = 0 - firstDayOfMonth;
  const daysMatrix = new Array(5).fill(0).map(() =>
    new Array(7).fill(0).map(() => {
      currentDayCount++;
      return dayjs(new Date(year, month, currentDayCount));
    })
  );
  return daysMatrix;
}

export function getWeek(date: dayjs.Dayjs) {
  const startOfWeek = date.startOf("week");
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = startOfWeek.add(i, "day");
    weekDates.push({
      currentDate,
      today: 
      currentDate.toDate().toDateString() === dayjs().toDate().toDateString(),
      isCurrentDay
    }
    )
  }
  return weekDates;
}

export const getHours = Array.from({ length: 24 }, (_, i) => 
  dayjs().startOf("day").add(i, "hour"),
);