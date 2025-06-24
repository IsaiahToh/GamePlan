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
};

export default function CompletedTasks({ tasks = [], markTaskAsUndone }: CompletedTasksProps) {
  if (!tasks.length) return <div>No completed tasks.</div>;
  return (
    <div>
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
    </div>
  );
}