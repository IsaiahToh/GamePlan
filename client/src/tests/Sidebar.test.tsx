import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/header/sidebar/Sidebar";
import "@testing-library/jest-dom";

// Mock react-hot-toast to avoid errors
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
}));

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

// Mock useDashboardContext
jest.mock("../context/DashboardContext", () => ({
  useDashboardContext: () => ({
    dashboardData: {
      groups: [
        { name: "Group1", color: "blue" },
        { name: "Group2", color: "red" },
      ],
      firstSundayOfSem: "2025-07-27",
      blockOutTimings: [],
      lessons: [],
    },
    fetchDashboard: jest.fn(),
    isSidebarOpen: true,
    setIsSidebarOpen: jest.fn(),
    isSettingsbarOpen: false,
    setIsSettingsbarOpen: jest.fn(),
    currentDashboard: "My",
    setCurrentDashboard: jest.fn(),
    loggedIn: true,
  }),
}));

// Mock useTaskContext
const mockFetchTasks = jest.fn();
jest.mock("../context/TaskContext", () => ({
  useTaskContext: () => ({
    outstandingTasks: [
      {
        _id: "t1",
        name: "Task 1",
        description: "Desc 1",
        deadlineDate: "2025-07-30",
        deadlineTime: "23:59",
        estimatedTimeTaken: 2,
        minChunk: 1,
        importance: "Low" as const,
        group: "Group1",
      },
    ],
    fetchTasks: mockFetchTasks,
    completedTasks: [],
  }),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Outstanding tasks and Completed tasks sections", () => {
    render(<Sidebar />);
    expect(screen.getByText(/outstanding tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/completed tasks/i)).toBeInTheDocument();
  });

  it("renders an outstanding task", () => {
    render(<Sidebar />);
    // Expand the Outstanding tasks dropdown
    fireEvent.click(screen.getByText(/outstanding tasks/i));
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
  });

  it("calls fetchTasks on mount", () => {
    render(<Sidebar />);
    expect(mockFetchTasks).toHaveBeenCalled();
  });
});