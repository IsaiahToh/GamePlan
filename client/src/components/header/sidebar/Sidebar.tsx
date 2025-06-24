import React, { useState, useEffect, type ReactNode } from "react";
import OutstandingTasks from "./OutstandingTasks";
import CompletedTasks from "./CompletedTasks";
import { ChevronDown, ChevronUp } from "lucide-react";

type Task = {
  _id: string;
  name: string;
  description: string;
  deadlineDate: string;
  deadlineTime: string;
  estimatedTimeTaken: number;
  importance: string | number;
  completed?: boolean;
};

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

const Sidebar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortedTasks, setSortedTasks] = useState<Task[]>([]);
  const [showSorted, setShowSorted] = useState(false);

  // Fetch sorted tasks
  const fetchSortedTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        "http://localhost:3000/api/tasks/sorted/by-deadline-and-importance",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setSortedTasks(data.sortedTasks || []);
      setShowSorted(true);
      console.log("Sorted tasks:", data.sortedTasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    } finally {
      // window.location.reload();
    }
  };

  // Fetch all tasks (unsorted)
  const fetchUnsortedTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data);
      setShowSorted(false);
      console.log("Unsorted tasks:", data);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log("Task deleted successfully");
        fetchUnsortedTasks();
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
        `http://localhost:3000/api/tasks/${taskId}/complete`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        console.log("Task marked as done successfully");
        fetchUnsortedTasks();
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
        `http://localhost:3000/api/tasks/${taskId}/uncomplete`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        console.log("Task marked as undone successfully");
        fetchUnsortedTasks();
      }
    } catch (error) {
      console.log("Error marking task as undone:", error);
    }
  };

  useEffect(() => {
    fetchUnsortedTasks();
  }, []);

  return (
    <aside className="bg-white shadow-md shadow-gray-500 w-64 h-screen overflow-y-auto">
      <SidebarDropdown label="Outstanding tasks">
        <OutstandingTasks
          tasks={
            showSorted
              ? sortedTasks.filter((task) => !task.completed)
              : tasks.filter((task) => !task.completed)
          }
          onTaskCreated={fetchUnsortedTasks}
          onTaskUpdated={fetchUnsortedTasks}
          fetchSortedTasks={fetchSortedTasks}
          fetchUnsortedTasks={fetchUnsortedTasks}
          deleteTask={deleteTask}
          markTaskAsDone={markTaskAsDone}
        />
      </SidebarDropdown>
      <SidebarDropdown label="Completed tasks">
        <CompletedTasks
        tasks={tasks.filter((task) => task.completed)}
        markTaskAsUndone={markTaskAsUndone}
        />
      </SidebarDropdown>
    </aside>
  );
};

export default Sidebar;