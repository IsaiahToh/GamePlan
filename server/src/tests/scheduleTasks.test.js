const dayjs = require("dayjs");
const { scheduleTasks } = require("../services/scheduleTasks");

describe("scheduleTasks", () => {
  it("schedules a simple task into a single free slot", async () => {
    const freeTimes = [
      { day: 1, free: [{ from: "10:00", to: "12:00" }] }, // Monday
      { day: 2, free: [] },
      { day: 3, free: [] },
      { day: 4, free: [] },
      { day: 5, free: [] },
      { day: 6, free: [] },
      { day: 0, free: [] },
    ];
    const tasks = [
      {
        name: "Task 1",
        deadlineDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        deadlineTime: "12:00",
        estimatedTimeTaken: 2,
        minChunk: 1,
        importance: "High",
        group: "A",
      },
    ];
    const now = dayjs().startOf("week"); // Sunday 00:00

    const scheduled = await scheduleTasks(freeTimes, tasks, now);

    expect(scheduled.length).toBe(1);
    expect(scheduled[0]).toMatchObject({
      name: "Task 1",
      day: 1,
      startTime: "10:00",
      endTime: "12:00",
    });
  });

  it("splits a task into multiple chunks if minChunk allows", async () => {
    const freeTimes = [
      { day: 1, free: [{ from: "10:00", to: "11:00" }, { from: "11:30", to: "12:30" }] },
      { day: 2, free: [] },
      { day: 3, free: [] },
      { day: 4, free: [] },
      { day: 5, free: [] },
      { day: 6, free: [] },
      { day: 0, free: [] },
    ];
    const tasks = [
      {
        name: "Chunky Task",
        deadlineDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        deadlineTime: "13:00",
        estimatedTimeTaken: 2,
        minChunk: 1,
        importance: "High",
        group: "A",
      },
    ];
    const now = dayjs().startOf("week"); // Sunday 00:00

    const scheduled = await scheduleTasks(freeTimes, tasks, now);

    expect(scheduled.length).toBe(2);
    expect(scheduled[0].startTime).toBe("10:00");
    expect(scheduled[0].endTime).toBe("11:00");
    expect(scheduled[1].startTime).toBe("11:30");
    expect(scheduled[1].endTime).toBe("12:30");
  });

  it("skips slots smaller than minChunk", async () => {
    const freeTimes = [
      { day: 1, free: [{ from: "10:00", to: "10:20" }, { from: "10:30", to: "11:30" }] },
      { day: 2, free: [] },
      { day: 3, free: [] },
      { day: 4, free: [] },
      { day: 5, free: [] },
      { day: 6, free: [] },
      { day: 0, free: [] },
    ];
    const tasks = [
      {
        name: "MinChunk Task",
        deadlineDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        deadlineTime: "12:00",
        estimatedTimeTaken: 1,
        minChunk: 1,
        importance: "High",
        group: "A",
      },
    ];
    const now = dayjs().startOf("week"); // Sunday 00:00

    const scheduled = await scheduleTasks(freeTimes, tasks, now);

    expect(scheduled.length).toBe(1);
    expect(scheduled[0].startTime).toBe("10:30");
    expect(scheduled[0].endTime).toBe("11:30");
  });

  it("returns empty array if no free slots", async () => {
    const freeTimes = [
      { day: 1, free: [] },
      { day: 2, free: [] },
      { day: 3, free: [] },
      { day: 4, free: [] },
      { day: 5, free: [] },
      { day: 6, free: [] },
      { day: 0, free: [] },
    ];
    const tasks = [
      {
        name: "No Slot Task",
        deadlineDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        deadlineTime: "12:00",
        estimatedTimeTaken: 1,
        minChunk: 1,
        importance: "High",
        group: "A",
      },
    ];
    const now = dayjs().startOf("week"); // Sunday 00:00

    const scheduled = await scheduleTasks(freeTimes, tasks, now);

    expect(scheduled.length).toBe(0);
  });
});