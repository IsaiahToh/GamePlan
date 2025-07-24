import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import { type Task } from "@/lib/types";

// Uncomment the line below if you are testing locally
// const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

// Uncomment the line below if you are using the deployed app
const API_URL = import.meta.env.VITE_API_URL;

interface TaskContextValue {
  outstandingTasks: Task[];
  completedTasks: Task[];
  fetchTasks: () => Promise<void>;
  sortAndFetchTasks: () => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markTaskAsDone: (taskId: string) => Promise<void>;
  markTaskAsUndone: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context)
    throw new Error(
      "useTaskContext must be used within TaskProvider"
    );
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [outstandingTasks, setOutstandingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setOutstandingTasks(data.outstandingTasks || []);
      setCompletedTasks(data.completedTasks || []);
      console.log("fetchTasks", data.outstandingTasks);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  const sortAndFetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks?sort=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setOutstandingTasks(data.outstandingTasks || []);
      console.log("sortAndFetchTasks", data.outstandingTasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };

  const deleteTask = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Task deleted!");
        fetchTasks();
      }
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  const markTaskAsDone = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Task completed!");
        fetchTasks();
      }
    } catch (error) {
      console.log("Error marking task as done:", error);
    }
  };

  const markTaskAsUndone = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/uncomplete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Task marked uncomplete!");
        fetchTasks();
      }
    } catch (error) {
      console.log("Error marking task as undone:", error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        outstandingTasks,
        completedTasks,
        fetchTasks,
        sortAndFetchTasks,
        deleteTask,
        markTaskAsDone,
        markTaskAsUndone,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
