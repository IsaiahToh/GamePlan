import { Button } from "@/components/ui/button";

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

type CompletedTasksProps = {
  tasks: Task[];
  markTaskAsUndone: (id: string) => void;
  fetchTasks: () => void;
};

export default function CompletedTasks({ tasks = [], markTaskAsUndone, fetchTasks}: CompletedTasksProps) {
  if (!tasks.length) return<div>No completed tasks.</div>;

  const deleteCompletedTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log("Task deleted successfully");
        fetchTasks();
      }
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  return (
    <div className="pr-1 space-y-2 overflow-y-auto max-h-[84vh]">
      <Button variant="outline" className="w-full" onClick={deleteCompletedTasks}>
        Clear completed tasks
      </Button>
      <ul>
        {tasks.map((task) => (
          <li key={task._id} className="border rounded p-2 mb-2 bg-green-50">
            <div className="font-semibold">{task.name}</div>
            <div className="text-sm">{task.description}</div>
            <div className="text-xs text-gray-500">
              Due: {task.deadlineDate} {task.deadlineTime}
            </div>
            <button
              className="mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-0.5 rounded"
              onClick={() => markTaskAsUndone(task._id)}
            >
              Mark as Undone
            </button>
          </li>
        ))}
      </ul>
      <div style={{ height: 48 }} aria-hidden="true"></div>
      <div style={{ height: 48 }} aria-hidden="true"></div>
    </div>
  );
}