import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Create } from "../Create";
import { X } from "lucide-react";

type Task = {
  _id: string;
  name: string;
  description: string;
  deadlineDate: string;
  estimatedTimeTaken: number;
  importance: string | number;
};

export default function Sidebar() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  const fetchSortedTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      logTasks();
      const res = await fetch("http://localhost:3000/api/tasks/sorted/by-importance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data);
      console.log("Sorted tasks:", data);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };

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
    console.log("Unsorted tasks:", data);
  } catch (error) {
    console.log("Error fetching unsorted tasks:", error);
  }
};

  const deleteTask = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log("Task deleted:", id);
        fetchTasks();
      } else {
        console.log("Failed to delete task");
      }
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const logTasks = () => {
    console.log("User's tasks:", tasks);
  };

  return (
    <div className="flex">
      <aside className="bg-white shadow-md shadow-gray-500 w-64 h-screen">
        <nav>
          <ul className="p-4 space-y-2 overflow-y-auto max-h-[90vh]">
            <li className="items-center">
              <Create onTaskCreated={fetchTasks} />
            </li>
            <li>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                onClick={fetchSortedTasks}
              >
                Schedule My Tasks
              </Button>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white mt-2"
                onClick={fetchUnsortedTasks}
              >
                Unschedule tasks
              </Button>
            </li>
            {tasks.map((task) => (
              <li key={task._id} className="relative border rounded p-2 mb-2 bg-blue-50">
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteTask(task._id)}
                    title="Delete Task"
                  >
                    <X size={16} />
                  </button>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {task.estimatedTimeTaken}h
                  </span>
                  <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {task.importance}
                  </span>
                </div>
                <div className="font-semibold">{task.name}</div>
                <div className="text-sm">{task.description}</div>
                <div className="text-xs text-gray-500">Due: {task.deadlineDate}</div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}