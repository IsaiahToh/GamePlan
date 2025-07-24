import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditTask } from "../components/header/sidebar/EditTask";
import "@testing-library/jest-dom";

// Set up environment variable for API URL
process.env.VITE_API_URL = "http://localhost:3000";

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

// Mock useDashboardContext to provide groups
jest.mock("../context/DashboardContext", () => ({
  useDashboardContext: () => ({
    dashboardData: {
      groups: [{ name: "Group1" }, { name: "Group2" }],
    },
  }),
}));

const mockTask = {
  _id: "t1",
  name: "Task 1",
  description: "Desc 1",
  deadlineDate: "2025-07-30",
  deadlineTime: "23:59",
  estimatedTimeTaken: 2,
  minChunk: 1,
  importance: "Low",
  group: "Group1",
};

describe("EditTask", () => {
  it("renders dialog and form fields", () => {
    render(<EditTask task={mockTask} fetchTasks={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Estimated time taken (h)")).toBeInTheDocument();
    expect(screen.getByLabelText("Min. chunk (h)")).toBeInTheDocument();
  });

  it("submits the form and calls fetchTasks", async () => {
    const mockFetchTasks = jest.fn();
    render(<EditTask task={mockTask} fetchTasks={mockFetchTasks} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Updated Task" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2025-08-01" },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText("Estimated time taken (h)"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Min. chunk (h)"), {
      target: { value: "1.5" },
    });

    // Select importance and group
    fireEvent.mouseDown(screen.getByText(/importance/i));
    const highOptions = screen.getAllByText("High");
    fireEvent.click(highOptions[highOptions.length - 1]);

    fireEvent.mouseDown(screen.getAllByText(/group/i)[0]);
    const groupOptions = screen.getAllByText("Group2");
    fireEvent.click(groupOptions[groupOptions.length - 1]);

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/t1"),
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
      expect(mockFetchTasks).toHaveBeenCalled();
    });
  });
});