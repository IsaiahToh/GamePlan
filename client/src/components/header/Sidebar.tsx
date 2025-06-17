import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Create } from "../Create";

type Task = {
  _id: string;
  name: string;
  description: string;
  deadlineDate: string;
  estimatedTimeTaken: number;
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const logTasks = () => {
    console.log("User's tasks:", tasks);
  };

  return (
    <div className="flex">
      <aside className="bg-white shadow-md shadow-gray-500 w-64">
        <nav>
          <ul className="p-4 space-y-2">
            <li className="items-center">
              <Create onTaskCreated={fetchTasks} />
            </li>
            <li>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                onClick={logTasks}
              >
                Schedule My Tasks
              </Button>
            </li>
            {tasks.map((task) => (
              <li key={task._id} className="relative border rounded p-2 mb-2 bg-blue-50">
                <span className="absolute top-2 right-2 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {task.estimatedTimeTaken}h
                </span>
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