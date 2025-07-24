const dayjs = require("dayjs");
const { getWeeklyFreeTimes } = require("../services/freeTimes");

describe("getWeeklyFreeTimes", () => {
  it("returns all day free when no blockouts or lessons", async () => {
    const firstSundayOfSem = dayjs().startOf("week").format("YYYY-MM-DD");
    const blockOutTimings = [];
    const lessons = [];
    const currentDayjs = dayjs(firstSundayOfSem); // week 1

    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      lessons,
      currentDayjs
    );

    expect(freeTimes.length).toBe(7);
    freeTimes.forEach(day => {
      expect(day.free[0]).toEqual({ from: "00:00", to: "24:00" });
    });
  });

  it("respects blockout timings for all days", async () => {
    const firstSundayOfSem = dayjs().startOf("week").format("YYYY-MM-DD");
    const blockOutTimings = [
      { from: "08:00", to: "10:00", day: "all" }
    ];
    const lessons = [];
    const currentDayjs = dayjs(firstSundayOfSem); // week 1

    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      lessons,
      currentDayjs
    );

    freeTimes.forEach(day => {
      expect(day.free).toContainEqual({ from: "00:00", to: "08:00" });
      expect(day.free).toContainEqual({ from: "10:00", to: "24:00" });
    });
  });

  it("respects blockout timings for a specific day", async () => {
    const firstSundayOfSem = dayjs().startOf("week").format("YYYY-MM-DD");
    const blockOutTimings = [
      { from: "14:00", to: "16:00", day: "Monday" }
    ];
    const lessons = [];
    const currentDayjs = dayjs(firstSundayOfSem); // week 1

    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      lessons,
      currentDayjs
    );

    // Monday is day 1
    expect(freeTimes[1].free).toContainEqual({ from: "00:00", to: "14:00" });
    expect(freeTimes[1].free).toContainEqual({ from: "16:00", to: "24:00" });
    // Other days are unaffected
    freeTimes.forEach((day, idx) => {
      if (idx !== 1) {
        expect(day.free[0]).toEqual({ from: "00:00", to: "24:00" });
      }
    });
  });

  it("removes lesson times from free slots for the current week", async () => {
    const firstSundayOfSem = dayjs().startOf("week").format("YYYY-MM-DD");
    const lessons = [
      {
        startTime: "09:00",
        endTime: "11:00",
        weeks: [1],
        day: 1, // Monday
      },
    ];
    const blockOutTimings = [];
    const currentDayjs = dayjs(firstSundayOfSem); // week 1

    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      lessons,
      currentDayjs
    );

    // Monday should have two free slots: 00:00-09:00 and 11:00-24:00
    expect(freeTimes[1].free).toContainEqual({ from: "00:00", to: "09:00" });
    expect(freeTimes[1].free).toContainEqual({ from: "11:00", to: "24:00" });
  });

  it("ignores lessons not in the current week", async () => {
    const firstSundayOfSem = dayjs().startOf("week").format("YYYY-MM-DD");
    const lessons = [
      {
        startTime: "09:00",
        endTime: "11:00",
        weeks: [2],
        day: 1, // Monday
      },
    ];
    const blockOutTimings = [];
    const currentDayjs = dayjs(firstSundayOfSem); // week 1

    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      lessons,
      currentDayjs
    );

    // Monday should be fully free
    expect(freeTimes[1].free[0]).toEqual({ from: "00:00", to: "24:00" });
  });
});