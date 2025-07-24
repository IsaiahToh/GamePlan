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

export function getWeek(date: dayjs.Dayjs) {
  const startOfWeek = date.startOf("week");
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = startOfWeek.add(i, "day");
    weekDates.push({
      currentDate,
      today:
        currentDate.toDate().toDateString() === dayjs().toDate().toDateString(),
      isCurrentDay,
    });
  }
  return weekDates;
}

export const getHours = Array.from({ length: 24 }, (_, i) =>
  dayjs().startOf("day").add(i, "hour")
);

export const colorOptions = [
  { label: "Red", value: "red", css: "bg-red-400" },
  { label: "Orange", value: "orange", css: "bg-orange-400" },
  { label: "Yellow", value: "yellow", css: "bg-yellow-300" },
  { label: "Green", value: "green", css: "bg-green-500" },
  { label: "Blue", value: "blue", css: "bg-blue-500" },
  { label: "Purple", value: "purple", css: "bg-purple-500" },
  { label: "Pink", value: "pink", css: "bg-pink-400" },
  { label: "Teal", value: "teal", css: "bg-teal-500" },
  { label: "Brown", value: "brown", css: "bg-yellow-600" },
  { label: "Gray", value: "gray", css: "bg-gray-500" },
];

export const getColorCSS = {
  red: "data-[highlighted]:bg-red-400",
  orange: "data-[highlighted]:bg-orange-400",
  yellow: "data-[highlighted]:bg-yellow-300",
  green: "data-[highlighted]:bg-green-500",
  blue: "data-[highlighted]:bg-blue-500",
  purple: "data-[highlighted]:bg-purple-500",
  pink: "data-[highlighted]:bg-pink-400",
  teal: "data-[highlighted]:bg-teal-500",
  brown: "data-[highlighted]:bg-yellow-600",
  gray: "data-[highlighted]:bg-gray-500",
  None: "data-[highlighted]:bg-gray-400",
};

