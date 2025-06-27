const dayjs = require("dayjs");

async function getWeeklyFreeTimes(
  firstSundayOfSem,
  blockOutTimings,
  events,
  currentDayjs
) {
  // Determine the current week number (1-based)
  const firstSunday = dayjs(firstSundayOfSem);
  const weekNumber = dayjs(firstSundayOfSem).isAfter(currentDayjs, "day")
    ? 0
    : currentDayjs.diff(dayjs(firstSundayOfSem), "week") + 1;

  // Helper to convert 'HH:mm' to minutes since midnight
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  // Helper to convert minutes since midnight to 'HH:mm'
  const toTime = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  // Prepare busy intervals for each day (1-7)
  const busyByDay = Array.from({ length: 7 }, () => []);

  // Add blockout timings to every day
  for (let d = 0; d < 7; d++) {
    for (const block of blockOutTimings) {
      busyByDay[d].push([toMinutes(block.from), toMinutes(block.to)]);
    }
  }

  // Add lesson timings to busy intervals if present in current week
  for (const event of events) {
    if (event.weeks.includes(weekNumber)) {
      const dayIdx = event.day; // 0-based index
      busyByDay[dayIdx].push([
        toMinutes(event.startTime),
        toMinutes(event.endTime),
      ]);
    }
  }

  // For each day, merge intervals and find free times
  const freeTimes = [];
  for (let d = 0; d < 7; d++) {
    const busy = busyByDay[d];
    // Merge overlapping intervals
    busy.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [start, end] of busy) {
      if (!merged.length || merged[merged.length - 1][1] < start) {
        merged.push([start, end]);
      } else {
        merged[merged.length - 1][1] = Math.max(
          merged[merged.length - 1][1],
          end
        );
      }
    }
    // Find free times between merged busy intervals
    const free = [];
    let prevEnd = 0;
    for (const [start, end] of merged) {
      if (start > prevEnd) free.push([prevEnd, start]);
      prevEnd = end;
    }
    if (prevEnd < 24 * 60) free.push([prevEnd, 24 * 60]);
    // Convert back to 'HH:mm'
    freeTimes.push({
      day: d, // 0: Sunday, ..., 6: Saturday
      free: free
        .filter(([start, end]) => end > start)
        .map(([start, end]) => ({
          from: toTime(start),
          to: toTime(end),
        })),
    });
  }
  return freeTimes;
}

module.exports = { getWeeklyFreeTimes };
