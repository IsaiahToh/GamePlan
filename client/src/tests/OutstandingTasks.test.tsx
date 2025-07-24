import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OutstandingTasks from "../components/header/sidebar/OutstandingTasks";
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
    fetchDashboardTasks: jest.fn(),
  }),
}));

// Mocks for useTaskContext
const mockSortAndFetchTasks = jest.fn();
const mockDeleteTask = jest.fn();
const mockMarkTaskAsDone = jest.fn();
const mockFetchTasks = jest.fn();

let mockOutstandingTasks = [
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
  {
    _id: "t2",
    name: "Task 2",
    description: "Desc 2",
    deadlineDate: "2025-07-29",
    deadlineTime: "12:00",
    estimatedTimeTaken: 1,
    minChunk: 0.5,
    importance: "High" as const,
    group: "Group2",
  },
];

jest.mock("../context/TaskContext", () => ({
  useTaskContext: () => ({
    outstandingTasks: mockOutstandingTasks,
    sortAndFetchTasks: mockSortAndFetchTasks,
    deleteTask: mockDeleteTask,
    markTaskAsDone: mockMarkTaskAsDone,
    fetchTasks: mockFetchTasks,
  }),
}));

describe("OutstandingTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset tasks before each test
    mockOutstandingTasks = [
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
      {
        _id: "t2",
        name: "Task 2",
        description: "Desc 2",
        deadlineDate: "2025-07-29",
        deadlineTime: "12:00",
        estimatedTimeTaken: 1,
        minChunk: 0.5,
        importance: "High" as const,
        group: "Group2",
      },
    ];
  });

  it("renders create new task button and schedule button", () => {
    render(<OutstandingTasks />);
    expect(screen.getByText(/create new task/i)).toBeInTheDocument();
    expect(screen.getByText(/schedule tasks/i)).toBeInTheDocument();
  });

  it("renders outstanding tasks", () => {
    render(<OutstandingTasks />);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 2")).toBeInTheDocument();
    expect(screen.getAllByText(/due:/i)).toHaveLength(2);
  });

  it("calls sortAndFetchTasks and fetchDashboardTasks when schedule button is clicked", async () => {
    render(<OutstandingTasks />);
    fireEvent.click(screen.getByText(/schedule tasks/i));
    await waitFor(() => {
      expect(mockSortAndFetchTasks).toHaveBeenCalled();
    });
  });

  it("calls deleteTask when delete button is clicked", () => {
    render(<OutstandingTasks />);
    const deleteBtns = screen.getAllByTitle("Delete Task");
    fireEvent.click(deleteBtns[0]);
    expect(mockDeleteTask).toHaveBeenCalledWith("t1");
  });

  it("calls markTaskAsDone when done button is clicked", () => {
    render(<OutstandingTasks />);
    const doneBtns = screen.getAllByText(/done/i);
    fireEvent.click(doneBtns[0]);
    expect(mockMarkTaskAsDone).toHaveBeenCalledWith("t1");
  });

  it("shows 'Past due' for overdue tasks", () => {
    // Set a past deadline
    mockOutstandingTasks = [
      {
        _id: "t3",
        name: "Past Task",
        description: "Old",
        deadlineDate: "2020-01-01",
        deadlineTime: "12:00",
        estimatedTimeTaken: 1,
        minChunk: 0.5,
        importance: "Low" as const,
        group: "Group1",
      },
    ];
    render(<OutstandingTasks />);
    expect(screen.getByText(/past due/i)).toBeInTheDocument();
  });

  it("shows 'No outstanding tasks.' if list is empty", () => {
    mockOutstandingTasks = [];
    render(<OutstandingTasks />);
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });
});