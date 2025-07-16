import React, { useState, useEffect, type ReactNode } from "react";
import OutstandingTasks from "./OutstandingTasks";
import CompletedTasks from "./CompletedTasks";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type Task } from "@/lib/types";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

type SidebarDropdownProps = {
  label: string;
  children: ReactNode;
};

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
  label,
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        className="w-full flex justify-between items-center px-4 py-2 text-left font-semibold hover:bg-gray-100"
        onClick={() => setOpen((x) => !x)}
        type="button"
        aria-expanded={open}
      >
        {label}
        <span className="ml-2">{open ? <ChevronUp /> : <ChevronDown />}</span>
      </button>
      {open && <div className="px-4 py-2">{children}</div>}
    </div>
  );
};

type SidebarProps = {
  fetchDashboardTasks: () => Promise<any>;
};

export default function Sidebar({ fetchDashboardTasks }: SidebarProps) {
  const [outstandingTasks, setOutstandingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  // Fetch tasks
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("${API_URL}/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setOutstandingTasks(data.outstandingTasks || []);
      setCompletedTasks(data.completedTasks || []);
      console.log("fetchTasks", data.outstandingTasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };

  // Sort + Fetch tasks
  const sortAndFetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        "${API_URL}/api/tasks?sort=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setOutstandingTasks(data.outstandingTasks || []);
      console.log("sortAndFetchTasks", data.outstandingTasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };
  

  // Delete a task
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

  // Mark a task as done
  const markTaskAsDone = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/complete`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/uncomplete`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("Task marked uncomplete!");
        fetchTasks();
      }
    } catch (error) {
      console.log("Error marking task as undone:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const now = new Date();
    outstandingTasks.forEach((task) => {
      const deadline = new Date(`${task.deadlineDate}T${task.deadlineTime}`);
      const diffMs = deadline.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      if (diffHrs > 0 && diffHrs <= 24) {
        toast.custom((t) => (
          <div className="bg-white rounded shadow px-4 py-2 flex items-center gap-2 relative min-w-[250px] pr-8">
            <span className="text-lg">⏰</span>
            <span className="flex-1">
              Task "<b>{task.name}</b>" is due in less than 24 hours!
            </span>
            <button
              className="absolute top-1 right-2 text-gray-400 hover:text-gray-700 text-lg"
              onClick={() => toast.dismiss(t.id)}
            >
              ×
            </button>
          </div>
        ), { duration: 6000 });
      }
    });
  }, [outstandingTasks]);

  return (
    <aside className="bg-white shadow-md shadow-gray-500 w-64 h-screen overflow-y-auto">
      <SidebarDropdown label="Outstanding tasks">
        <OutstandingTasks
          tasks={outstandingTasks}
          fetchTasks={fetchTasks}
          sortAndFetchTasks={sortAndFetchTasks}
          deleteTask={deleteTask}
          markTaskAsDone={markTaskAsDone}
          fetchDashboardTasks={fetchDashboardTasks}
        />
      </SidebarDropdown>
      <SidebarDropdown label="Completed tasks">
        <CompletedTasks
          tasks={completedTasks}
          markTaskAsUndone={markTaskAsUndone}
          fetchTasks={fetchTasks}
        />
      </SidebarDropdown>
    </aside>
  );
}
