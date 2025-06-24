import React, { useState, type ReactNode } from "react";
import OutstandingTasks from "./OutstandingTasks";
import { ChevronDown, ChevronUp } from "lucide-react";
import CompletedTasks from "./CompletedTasks";

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
        className="w-full flex justify-between items-center px-4 py-2 text-left font-semibold hover:bg-gray-100 active:shadow-none shadow-[0_4px_6px_-4px_rgba(0,0,0,0.2)]"
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
};

export default Sidebar;
