import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sidebar from "../components/header/sidebar/Sidebar";
import "@testing-library/jest-dom";

// Mock react-hot-toast to avoid errors
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
    custom: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
    custom: jest.fn(),
  },
}));

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn((key) => {
        if (key === "token") return "test-token";
        if (key === "email") return "test@email.com";
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock fetch
beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          outstandingTasks: [
            {
              _id: "t1",
              name: "Task 1",
              description: "Desc 1",
              deadlineDate: "2025-07-30",
              deadlineTime: "23:59",
              estimatedTimeTaken: 2,
              minChunk: 1,
              importance: "Low",
              group: "Group1",
            },
          ],
          completedTasks: [
            {
              _id: "t2",
              name: "Task 2",
              description: "Desc 2",
              deadlineDate: "2025-07-29",
              deadlineTime: "12:00",
              estimatedTimeTaken: 1,
              importance: "High",
              group: "Group2",
              completed: true,
            },
          ],
        }),
    })
  ) as jest.Mock;
});

// Mock useDashboardContext
jest.mock("../context/DashboardContext", () => ({
  useDashboardContext: () => ({
    dashboardData: {
      groups: ["Group1", "Group2"],
      lessons: [],
      firstSundayOfSem: "2025-07-27",
      blockOutTimings: [],
    },
    fetchDashboardTasks: jest.fn(),
  }),
}));

describe("Sidebar", () => {
  it("renders sidebar and dropdowns", async () => {
    render(<Sidebar />);
    expect(screen.getByText(/outstanding tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/completed tasks/i)).toBeInTheDocument();
    // Dropdowns are collapsed by default
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });

  it("shows tasks when dropdown is opened", async () => {
    render(<Sidebar />);
    // Open Outstanding tasks dropdown
    fireEvent.click(screen.getByText(/outstanding tasks/i));
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });
    // Open Completed tasks dropdown
    fireEvent.click(screen.getByText(/completed tasks/i));
    await waitFor(() => {
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });
  });

  it("shows create new task button in OutstandingTasks", async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/outstanding tasks/i));
    await waitFor(() => {
      expect(screen.getByText(/create new task/i)).toBeInTheDocument();
    });
  });

  it("shows done button for outstanding tasks", async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/outstanding tasks/i));
    await waitFor(() => {
      expect(screen.getByText(/done/i)).toBeInTheDocument();
    });
  });

  it("shows mark as undone button for completed tasks", async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText(/completed tasks/i));
    await waitFor(() => {
      expect(screen.getByText(/mark as undone/i)).toBeInTheDocument();
    });
  });
});