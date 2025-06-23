import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useState } from "react";

const importanceLevels = ["Low", "Med", "High", "Very High"] as const;

const taskSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  deadlineDate: z.string(),
  deadlineTime: z.string(),
  estimatedTimeTaken: z.coerce.number().min(0.5),
  minChunk: z.coerce.number().min(0.5),
  group: z.string(),
  importance: z.enum(importanceLevels),
});

type EditTaskProps = {
  task: any;
  onTaskUpdated: () => void;
  buttonClassName?: string;
};

export function EditTask({
  task,
  onTaskUpdated,
  buttonClassName,
}: EditTaskProps) {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: task.name,
      description: task.description,
      deadlineDate: task.deadlineDate,
      deadlineTime: task.deadlineTime,
      estimatedTimeTaken: task.estimatedTimeTaken,
      minChunk: task.minChunk,
      group: task.group,
      importance: task.importance,
    },
  });

  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
        const res = await fetch("http://localhost:3000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const groupArray = data.groups.map(
          (group: { name: string }) => group.name
        );
        setGroups(groupArray);
      } catch (error) {
        console.log("Error fetching group:", error);
      }
    };
    fetchGroups();
  }, []);

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });
    console.log("Task edited:", JSON.stringify(values));
    if (onTaskUpdated) onTaskUpdated();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={
            buttonClassName ??
            "text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded"
          }
          type="button"
        >
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Edit your task details</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title of task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Description of task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 w-full">
              <FormField
                control={form.control}
                name="deadlineDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadlineTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="estimatedTimeTaken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated time taken (h)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minChunk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min. chunk (h)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="importance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importance</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select importance" />
                      </SelectTrigger>
                      <SelectContent>
                        {importanceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 cursor-pointer mb-2"
            >
              Save Changes
            </Button>
          </form>
        </Form>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
