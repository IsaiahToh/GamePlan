import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CompletedTasks from "../components/header/sidebar/CompletedTasks";
import "@testing-library/jest-dom";

// Set up environment variable for API URL
process.env.VITE_API_URL = "http://localhost:3000";

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn((key) => {
        if (key === "token") return "test-token";
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock react-hot-toast to avoid errors
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
beforeEach(() => {
  globalThis.fetch = jest.fn((url) => {
    if (url?.toString().includes("/api/tasks/clear")) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  }) as jest.Mock;
});

describe("CompletedTasks", () => {
  it("renders 'No completed tasks.' when tasks is empty", () => {
    render(
      <CompletedTasks tasks={[]} markTaskAsUndone={jest.fn()} fetchTasks={jest.fn()} />
    );
    expect(screen.getByText(/no completed tasks/i)).toBeInTheDocument();
  });

  it("renders completed tasks", () => {
    const tasks = [
      {
        _id: "t1",
        name: "Task 1",
        description: "Desc 1",
        deadlineDate: "2025-07-30",
        deadlineTime: "23:59",
        estimatedTimeTaken: 2,
        importance: "High",
      },
      {
        _id: "t2",
        name: "Task 2",
        description: "Desc 2",
        deadlineDate: "2025-07-31",
        deadlineTime: "12:00",
        estimatedTimeTaken: 1,
        importance: "Low",
      },
    ];
    render(
      <CompletedTasks tasks={tasks} markTaskAsUndone={jest.fn()} fetchTasks={jest.fn()} />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getAllByText(/mark as undone/i)).toHaveLength(2);
  });

  it("calls markTaskAsUndone when button is clicked", () => {
    const mockMarkAsUndone = jest.fn();
    const tasks = [
      {
        _id: "t1",
        name: "Task 1",
        description: "Desc 1",
        deadlineDate: "2025-07-30",
        deadlineTime: "23:59",
        estimatedTimeTaken: 2,
        importance: "High",
      },
    ];
    render(
      <CompletedTasks tasks={tasks} markTaskAsUndone={mockMarkAsUndone} fetchTasks={jest.fn()} />
    );
    fireEvent.click(screen.getByText(/mark as undone/i));
    expect(mockMarkAsUndone).toHaveBeenCalledWith("t1");
  });

  it("calls fetchTasks and shows toast when 'Clear completed tasks' is clicked", async () => {
    const mockFetchTasks = jest.fn();
    const tasks = [
      {
        _id: "t1",
        name: "Task 1",
        description: "Desc 1",
        deadlineDate: "2025-07-30",
        deadlineTime: "23:59",
        estimatedTimeTaken: 2,
        importance: "High",
      },
    ];
    render(
      <CompletedTasks tasks={tasks} markTaskAsUndone={jest.fn()} fetchTasks={mockFetchTasks} />
    );
    fireEvent.click(screen.getByText(/clear completed tasks/i));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/clear"),
        expect.objectContaining({ method: "DELETE" })
      );
      expect(mockFetchTasks).toHaveBeenCalled();
    });
  });
});