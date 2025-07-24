import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Create } from "../components/header/sidebar/Create";
import "@testing-library/jest-dom";

// Set up environment variable for API URL
process.env.VITE_API_URL = "http://localhost:3000";

// Mock react-hot-toast to avoid errors
jest.mock("react-hot-toast", () => ({
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

describe("Create", () => {
  it("renders dialog and form fields", () => {
    render(<Create fetchTasks={jest.fn()} />);
    fireEvent.click(screen.getByText(/create new task/i));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due time/i)).toBeInTheDocument();
    expect(screen.getByText(/importance/i)).toBeInTheDocument();
    // Use getAllByText for "Group" label
    expect(screen.getAllByText(/group/i)[0]).toBeInTheDocument();
  });

  it("submits the form and calls fetchTasks", async () => {
    const mockFetchTasks = jest.fn();
    render(<Create fetchTasks={mockFetchTasks} />);
    fireEvent.click(screen.getByText(/create new task/i));

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "My Task" },
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2025-08-01" },
    });
    fireEvent.change(screen.getByLabelText(/due time/i), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText(/estimated time taken/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/min. chunk/i), {
      target: { value: "1" },
    });

    // Select importance and group
    fireEvent.mouseDown(screen.getByText(/importance/i));
    const lowOptions = screen.getAllByText("Low");
    fireEvent.click(lowOptions[lowOptions.length - 1]);

    // Use getAllByText for "Group" label and option
    fireEvent.mouseDown(screen.getAllByText(/group/i)[0]);
    const groupOptions = screen.getAllByText("Group1");
    fireEvent.click(groupOptions[groupOptions.length - 1]);

    // Submit the form
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