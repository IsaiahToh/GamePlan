  const dayjs = require("dayjs");

  // Helper: Convert "HH:mm" to minutes since midnight
  function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }
  // Helper: Convert minutes since midnight to "HH:mm"
  function toTime(mins) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
  }
  // Helper: Round up to next :00 or :30
  function roundUpToHalfHour(mins) {
    return Math.ceil(mins / 30) * 30;
  }

  async function scheduleTasks(freeTimes, tasks, now) {
    // Clone freeTimes to allow mutation
    const freeByDay = freeTimes.map((dayObj) => ({
      day: dayObj.day,
      free: dayObj.free.map((slot) => ({ ...slot })),
    }));

    // Get current day and time in minutes
    const currentDay = now.day(); // 0 = Sunday
    const currentTimeMins = now.hour() * 60 + now.minute();

    const scheduledTasks = [];

    for (const task of tasks) {
      let timeLeft = task.estimatedTimeTaken; // in hours
      const minChunk = task.minChunk;
      const deadline = dayjs(`${task.deadlineDate}T${task.deadlineTime}`);
      const scheduledChunks = [];

      // Try to schedule as early as possible
      outer: for (let offset = 0; offset < 7 && timeLeft > 0; offset++) {
        const dayIdx = (currentDay + offset) % 7;
        const dayObj = freeByDay.find((d) => d.day === dayIdx);
        if (!dayObj) continue;

        for (
          let slotIdx = 0;
          slotIdx < dayObj.free.length && timeLeft > 0;
          slotIdx++
        ) {
          let { from, to } = dayObj.free[slotIdx];
          let slotStart = toMinutes(from);
          let slotEnd = toMinutes(to);

          // If today, skip past current time
          if (offset === 0 && slotEnd <= currentTimeMins) continue;
          if (offset === 0 && slotStart < currentTimeMins)
            slotStart = currentTimeMins;

          // Round up slotStart to next :00 or :30
          slotStart = roundUpToHalfHour(slotStart);
          if (slotStart >= slotEnd) continue;

          // Calculate slot duration after rounding
          let slotDuration = (slotEnd - slotStart) / 60; // in hours
          if (slotDuration < minChunk) continue;

          // Don't schedule past the deadline
          const chunkStartDayjs = now
            .startOf("day")
            .add(offset, "day")
            .add(slotStart, "minute");
          if (chunkStartDayjs.isAfter(deadline)) break outer;
          let chunkEndDayjs = chunkStartDayjs.add(
            Math.min(timeLeft, slotDuration, Math.max(minChunk, 0)),
            "hour"
          );
          if (chunkEndDayjs.isAfter(deadline)) {
            chunkEndDayjs = deadline;
          }
          let chunkHours = chunkEndDayjs.diff(chunkStartDayjs, "minute") / 60;
          if (chunkHours < minChunk) continue;

          // Ensure chunk ends on or before slotEnd
          let chunkEndMins = slotStart + chunkHours * 60;
          if (chunkEndMins > slotEnd) {
            chunkHours = (slotEnd - slotStart) / 60;
            chunkEndMins = slotEnd;
          }

          // Schedule the chunk
          scheduledChunks.push({
            ...task,
            day: dayIdx,
            startTime: toTime(slotStart),
            endTime: toTime(chunkEndMins),
          });

          // Update free slot
          if (chunkHours * 60 === slotEnd - slotStart) {
            // Use up entire slot
            dayObj.free.splice(slotIdx, 1);
            slotIdx--;
          } else {
            // Shorten slot
            dayObj.free[slotIdx].from = toTime(slotStart + chunkHours * 60);
          }

          // Update remaining task time
          timeLeft -= chunkHours;
        }
      }

      // Add scheduled chunks to result
      scheduledTasks.push(...scheduledChunks);
    }

    return scheduledTasks;
  }

  module.exports = { scheduleTasks };
