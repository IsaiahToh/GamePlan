"use client";

export default function Sidebar() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="bg-white shadow-md shadow-gray-500 w-64">
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
