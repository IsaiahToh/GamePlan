import { Button } from "@/components/ui/button";
import { Create } from "./Create";
import { EditTask } from "./EditTask";
import { X } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { useDashboardContext } from "@/context/DashboardContext";

export default function OutstandingTasks() {
  const { sortAndFetchTasks, deleteTask, markTaskAsDone, outstandingTasks } = useTaskContext();
  const { fetchDashboardTasks } = useDashboardContext();
  return (
    <ul className="pr-1 space-y-2 overflow-y-auto max-h-[70vh]">
      <li className="items-center">
        <Create />
      </li>
      <li>
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
          onClick={async () => {
            await sortAndFetchTasks();
            fetchDashboardTasks();
          }}
        >
          Schedule tasks
        </Button>
      </li>
      {outstandingTasks.map((task) => {
        const today = new Date();
        const dueDate = new Date(task.deadlineDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return (
          <li
            key={task._id}
            className="relative border rounded p-2 mb-2 bg-blue-50"
          >
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
            <div className="text-xs text-gray-500">
              Due: {task.deadlineDate} {task.deadlineTime}
            </div>
            <div className="text-xs text-gray-700">
              {daysLeft >= 0
                ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                : "Past due"}
            </div>
            <div className="mt-2 flex gap-2">
              <EditTask task={task}/>
              <Button
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded"
                onClick={() => markTaskAsDone(task._id)}
              >
                Done
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
