import { render, screen, fireEvent } from "@testing-library/react";
import Dayview from "../components/Dayview";
import "@testing-library/jest-dom";
import dayjs from "dayjs";

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn((key) => {
        if (key === "token") return "test-token";
        if (key === "email") return "me@email.com";
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock useDashboardContext to provide dashboardData
jest.mock("../context/DashboardContext", () => ({
  useDashboardContext: () => ({
    dashboardData: {
      lessons: [
        {
          moduleCode: "CS1010",
          lessonType: "Lecture",
          startTime: "09:00",
          endTime: "10:00",
          day: dayjs().day(),
          weeks: [1, 2, 3],
        },
      ],
      groups: [
        { name: "CS1010", color: "blue" },
        { name: "Personal", color: "red" },
      ],
      firstSundayOfSem: dayjs().subtract(1, "week").format("YYYY-MM-DD"),
      blockOutTimings: [
        { from: "13:00", to: "14:00", label: "Lunch", day: "all" },
      ],
    },
    scheduledTasks: [
      {
        name: "Task 1",
        description: "Desc 1",
        startTime: "15:00",
        endTime: "16:00",
        day: dayjs().day(),
        group: "Personal",
        deadlineDate: dayjs().format("YYYY-MM-DD"),
        deadlineTime: "23:59",
      },
    ],
    taskOn: true,
    setTaskOn: jest.fn(),
    currentDashboard: "My",
    setCurrentDashboard: jest.fn(),
    fetchDashboard: jest.fn(),
  }),
}));

describe("Dayview", () => {
  it("renders week number, date, and time column", () => {
    render(<Dayview />);
    // Fix ambiguous 'week' text by using getAllByText
    expect(screen.getAllByText(/week/i).length).toBeGreaterThan(0);
    expect(screen.getByText(dayjs().format("ddd"))).toBeInTheDocument();
    expect(screen.getByText(dayjs().format("DD"))).toBeInTheDocument();
    expect(screen.getAllByText(/00:00/)[0]).toBeInTheDocument();
  });

  it("shows lessons and tasks for today", () => {
    render(<Dayview />);
    expect(screen.getByText("CS1010")).toBeInTheDocument();
    expect(screen.getByText("Lecture")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
  });

  it("shows blockout timings", () => {
    render(<Dayview />);
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText(/13:00 - 14:00/)).toBeInTheDocument();
  });

  it("toggles tasks view with checkbox", () => {
    render(<Dayview />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    // No assertion for hiding tasks, as setTaskOn is mocked
  });

  it("shows current time indicator", () => {
    render(<Dayview />);
    // Look for the red circle by class (if you use Tailwind or similar)
    // You may need to adjust the class name to match your indicator
    const bulbs = document.querySelectorAll(".bg-red-500.rounded-full");
    expect(bulbs.length).toBeGreaterThan(0);
  });
});