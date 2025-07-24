import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OutstandingTasks from "../components/header/sidebar/OutstandingTasks";
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
    fetchDashboardTasks: jest.fn(),
  }),
}));

const tasks = [
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
    deadlineDate: "2025-07-31",
    deadlineTime: "12:00",
    estimatedTimeTaken: 1,
    minChunk: 0.5,
    importance: "High" as const,
    group: "Group2",
  },
];

describe("OutstandingTasks", () => {
  it("renders tasks and buttons", () => {
    render(
      <OutstandingTasks
        tasks={tasks}
        fetchTasks={jest.fn()}
        sortAndFetchTasks={jest.fn()}
        deleteTask={jest.fn()}
        markTaskAsDone={jest.fn()}
        fetchDashboardTasks={jest.fn()}
      />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getAllByText(/done/i)).toHaveLength(2);
    expect(screen.getByText(/schedule tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/create new task/i)).toBeInTheDocument();
  });

  it("calls deleteTask when delete button is clicked", () => {
    const mockDeleteTask = jest.fn();
    render(
      <OutstandingTasks
        tasks={tasks}
        fetchTasks={jest.fn()}
        sortAndFetchTasks={jest.fn()}
        deleteTask={mockDeleteTask}
        markTaskAsDone={jest.fn()}
        fetchDashboardTasks={jest.fn()}
      />
    );
    // Find all delete buttons (with title "Delete Task")
    const deleteBtns = screen.getAllByTitle("Delete Task");
    fireEvent.click(deleteBtns[0]);
    expect(mockDeleteTask).toHaveBeenCalledWith("t1");
  });

  it("calls markTaskAsDone when Done button is clicked", () => {
    const mockMarkTaskAsDone = jest.fn();
    render(
      <OutstandingTasks
        tasks={tasks}
        fetchTasks={jest.fn()}
        sortAndFetchTasks={jest.fn()}
        deleteTask={jest.fn()}
        markTaskAsDone={mockMarkTaskAsDone}
        fetchDashboardTasks={jest.fn()}
      />
    );
    fireEvent.click(screen.getAllByText(/done/i)[0]);
    expect(mockMarkTaskAsDone).toHaveBeenCalledWith("t1");
  });

  it("calls sortAndFetchTasks and fetchDashboardTasks when Schedule tasks is clicked", async () => {
    const mockSortAndFetchTasks = jest.fn().mockResolvedValue(undefined);
    const mockFetchDashboardTasks = jest.fn();
    render(
      <OutstandingTasks
        tasks={tasks}
        fetchTasks={jest.fn()}
        sortAndFetchTasks={mockSortAndFetchTasks}
        deleteTask={jest.fn()}
        markTaskAsDone={jest.fn()}
        fetchDashboardTasks={mockFetchDashboardTasks}
      />
    );
    fireEvent.click(screen.getByText(/schedule tasks/i));
    await waitFor(() => {
      expect(mockSortAndFetchTasks).toHaveBeenCalled();
      expect(mockFetchDashboardTasks).toHaveBeenCalled();
    });
  });

  it("opens Create dialog and submits new task", async () => {
    render(
      <OutstandingTasks
        tasks={tasks}
        fetchTasks={jest.fn()}
        sortAndFetchTasks={jest.fn()}
        deleteTask={jest.fn()}
        markTaskAsDone={jest.fn()}
        fetchDashboardTasks={jest.fn()}
      />
    );
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
    fireEvent.mouseDown(screen.getByText(/importance/i));
    const lowOptions = screen.getAllByText("Low");
    fireEvent.click(lowOptions[lowOptions.length - 1]);
    fireEvent.mouseDown(screen.getAllByText(/group/i)[0]);
    const groupOptions = screen.getAllByText("Group1");
    fireEvent.click(groupOptions[groupOptions.length - 1]);
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
    });
  });

  it("opens EditTask dialog and submits changes", async () => {
    render(
      <OutstandingTasks
        tasks={tasks}
        fetchTasks={jest.fn()}
        sortAndFetchTasks={jest.fn()}
        deleteTask={jest.fn()}
        markTaskAsDone={jest.fn()}
        fetchDashboardTasks={jest.fn()}
      />
    );
    // Open Edit dialog for first task
    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Updated Task" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2025-08-03" },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "14:00" },
    });
    fireEvent.change(screen.getByLabelText("Estimated time taken (h)"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Min. chunk (h)"), {
      target: { value: "1.5" },
    });
    fireEvent.mouseDown(screen.getByText(/importance/i));
    const highOptions = screen.getAllByText("High");
    fireEvent.click(highOptions[highOptions.length - 1]);
    fireEvent.mouseDown(screen.getAllByText(/group/i)[0]);
    const groupOptions = screen.getAllByText("Group2");
    fireEvent.click(groupOptions[groupOptions.length - 1]);
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
    });
  });
});