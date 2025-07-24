import React, { useState, useEffect, type ReactNode } from "react";
import OutstandingTasks from "./OutstandingTasks";
import CompletedTasks from "./CompletedTasks";
import { ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { useTaskContext } from "@/context/TaskContext";

interface SidebarDropdownProps {
  label: string;
  children: ReactNode;
}
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

export default function Sidebar() {
  const { outstandingTasks, fetchTasks } = useTaskContext();

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
        toast.custom(
          (t) => (
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
          ),
          { duration: 6000 }
        );
      }
    });
  }, [outstandingTasks]);

  return (
    <aside className="bg-white shadow-md shadow-gray-500 w-64 h-screen overflow-y-auto">
      <SidebarDropdown label="Outstanding tasks">
        <OutstandingTasks />
      </SidebarDropdown>
      <SidebarDropdown label="Completed tasks">
        <CompletedTasks />
      </SidebarDropdown>
    </aside>
  );
}
