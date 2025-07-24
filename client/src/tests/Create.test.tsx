import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Create } from "../components/header/sidebar/Create";
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
    },
  }),
}));

// Mock useTaskContext
const mockFetchTasks = jest.fn();
jest.mock("../context/TaskContext", () => ({
  useTaskContext: () => ({
    fetchTasks: mockFetchTasks,
  }),
}));

describe("Create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create new task button and dialog", () => {
    render(<Create />);
    expect(screen.getByText(/create new task/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/create new task/i));
    expect(screen.getByRole("heading", { name: /new task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated time taken/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min. chunk/i)).toBeInTheDocument();
    expect(screen.getByText(/importance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^group$/i).length).toBeGreaterThan(0);
  });

  it("shows validation errors for empty required fields", async () => {
    render(<Create />);
    fireEvent.click(screen.getByText(/create new task/i));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByText(/must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  it("submits the form and calls fetchTasks", async () => {
    render(<Create />);
    fireEvent.click(screen.getByText(/create new task/i));
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2025-08-02" },
    });
    fireEvent.change(screen.getByLabelText(/due time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/estimated time taken/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/min. chunk/i), {
      target: { value: "1" },
    });
    // Select importance
    fireEvent.mouseDown(screen.getByText(/importance/i));
    const lowOptions = screen.getAllByText("Low");
    fireEvent.click(lowOptions[lowOptions.length - 1]);
    // Select group (custom select: open by clicking the label or trigger)
    fireEvent.mouseDown(screen.getAllByText(/^group$/i)[0]);
    const groupOptions = screen.getAllByText("Group1");
    fireEvent.click(groupOptions[groupOptions.length - 1]);
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
      expect(mockFetchTasks).toHaveBeenCalled();
    });
  });
});