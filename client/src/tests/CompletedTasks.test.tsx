import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CompletedTasks from "../components/header/sidebar/CompletedTasks";
import "@testing-library/jest-dom";

// Mock react-hot-toast
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

// Mock localStorage
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

// Mock fetch
beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;
});

// Dynamic mock for useTaskContext
let mockCompletedTasks: any[] = [
  {
    _id: "t1",
    name: "Completed Task 1",
    description: "Desc 1",
    deadlineDate: "2025-07-30",
    deadlineTime: "23:59",
    estimatedTimeTaken: 2,
    minChunk: 1,
    importance: "High",
    group: "Group1",
  },
  {
    _id: "t2",
    name: "Completed Task 2",
    description: "Desc 2",
    deadlineDate: "2025-07-31",
    deadlineTime: "12:00",
    estimatedTimeTaken: 1,
    minChunk: 0.5,
    importance: "Low",
    group: "Group2",
  },
];
const mockFetchTasks = jest.fn();
const mockMarkTaskAsUndone = jest.fn();

jest.mock("../context/TaskContext", () => ({
  useTaskContext: () => ({
    completedTasks: mockCompletedTasks,
    fetchTasks: mockFetchTasks,
    markTaskAsUndone: mockMarkTaskAsUndone,
  }),
}));

describe("CompletedTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default tasks before each test
    mockCompletedTasks = [
      {
        _id: "t1",
        name: "Completed Task 1",
        description: "Desc 1",
        deadlineDate: "2025-07-30",
        deadlineTime: "23:59",
        estimatedTimeTaken: 2,
        minChunk: 1,
        importance: "High",
        group: "Group1",
      },
      {
        _id: "t2",
        name: "Completed Task 2",
        description: "Desc 2",
        deadlineDate: "2025-07-31",
        deadlineTime: "12:00",
        estimatedTimeTaken: 1,
        minChunk: 0.5,
        importance: "Low",
        group: "Group2",
      },
    ];
  });

  it("renders completed tasks", () => {
    render(<CompletedTasks />);
    expect(screen.getByText("Completed Task 1")).toBeInTheDocument();
    expect(screen.getByText("Completed Task 2")).toBeInTheDocument();
    expect(screen.getAllByText(/mark as undone/i)).toHaveLength(2);
  });

  it("calls markTaskAsUndone when button is clicked", () => {
    render(<CompletedTasks />);
    fireEvent.click(screen.getAllByText(/mark as undone/i)[0]);
    expect(mockMarkTaskAsUndone).toHaveBeenCalledWith("t1");
  });

  it("calls fetchTasks and shows toast when 'Clear completed tasks' is clicked", async () => {
    render(<CompletedTasks />);
    fireEvent.click(screen.getByText(/clear completed tasks/i));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/clear"),
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
      expect(mockFetchTasks).toHaveBeenCalled();
    });
  });

  it("shows 'No completed tasks.' if list is empty", () => {
    mockCompletedTasks = [];
    render(<CompletedTasks />);
    expect(screen.getByText(/no completed tasks/i)).toBeInTheDocument();
  });
});