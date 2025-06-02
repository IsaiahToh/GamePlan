import React from "react";

type SidebarProps = {
  isSidebarOpen: boolean;
};

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white w-64 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-[50px]"
        }`}
      >
        <nav>
          <ul className="p-4 space-y-2">
            <li>Menu Item 1</li>
            <li>Menu Item 2</li>
            <li>Menu Item 3</li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}
