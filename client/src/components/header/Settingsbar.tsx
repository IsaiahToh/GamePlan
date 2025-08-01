"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Loader, Plus } from "lucide-react";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { colorOptions } from "@/lib/utils";
import { useDashboardContext } from "@/context/DashboardContext";
import toast from "react-hot-toast";
import { settingsSchema } from "@/lib/types";

const API_URL = import.meta.env.VITE_API_URL;

export default function Settingsbar() {
  const { fetchDashboard, dashboardData } = useDashboardContext();
  const [loading, setLoading] = useState(false);

  const initialValues = dashboardData
    ? {
        url: dashboardData.url,
        blockOutTimings: dashboardData.blockOutTimings,
        groups: dashboardData.groups,
        firstSundayOfSem: dashboardData.firstSundayOfSem,
      }
    : {
        url: "",
        blockOutTimings: [],
        groups: [],
        firstSundayOfSem: "",
      };

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues,
  });

  const {
    fields: timeFields,
    append: appendTime,
    remove: removeTime,
  } = useFieldArray({
    control: form.control,
    name: "blockOutTimings",
  });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control: form.control,
    name: "groups",
  });

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    // Fetch NUSMods API, handle timings, etc.
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/dashboard`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockOutTimings: values.blockOutTimings.map((time) => ({
            from: time.from,
            to: time.to,
            label: time.label,
            day: time.day,
          })),
          url: values.url,
          groups: values.groups.map((group) => ({
            name: group.name,
            color: group.color,
          })),
          firstSundayOfSem: values.firstSundayOfSem,
        }),
      });
      if (!res.ok) {
        // Try to parse the error message from the response
        toast.error("Invalid URL or data.", { duration: 2000 });
        return; // Stop further execution
      } else {
        const data = await res.json();
        console.log("Sent data:", data);
      }
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      fetchDashboard(localStorage.getItem("email") || "");
      setLoading(false);
    }
  };
  return (
    <div className="flex">
      {/* Settingsbar */}
      <aside className="bg-white text-gray-700 shadow-md shadow-gray-500 h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-5"
          >
            <FormField
              control={form.control}
              name="blockOutTimings"
              render={() => (
                <FormItem>
                  <FormLabel className="text-black text-xl font-semibold">
                    Daily Blockout Timings
                  </FormLabel>
                  <FormDescription>
                    Specify times when you are unavailable for tasks.
                  </FormDescription>
                  {timeFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 mb-2"
                    >
                      <FormControl>
                        <Input
                          type="time"
                          className="w-28"
                          {...form.register(`blockOutTimings.${index}.from`)}
                          placeholder="From"
                        />
                      </FormControl>
                      <span>to</span>
                      <FormControl>
                        <Input
                          type="time"
                          className="w-28"
                          {...form.register(`blockOutTimings.${index}.to`)}
                          placeholder="To"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="text"
                          {...form.register(`blockOutTimings.${index}.label`)}
                          placeholder="Title"
                          className="w-32"
                        />
                      </FormControl>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            form.setValue(
                              `blockOutTimings.${index}.day`,
                              value as
                                | "all"
                                | "Sunday"
                                | "Monday"
                                | "Tuesday"
                                | "Wednesday"
                                | "Thursday"
                                | "Friday"
                                | "Saturday"
                            )
                          }
                          value={form.watch(`blockOutTimings.${index}.day`)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="All Days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Days</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeTime(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendTime({ from: "", to: "", label: "", day: "all" })
                    }
                    className="bg-white text-gray-500 w-1/4"
                    variant="link"
                  >
                    <Plus />
                    <p>Add another</p>
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-semibold text-black">
                    NUSMods Link
                  </FormLabel>
                  <FormDescription>
                    Enter your NUSMods sharing link. Retrieve under Share/Sync.
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="e.g. https://shorten.nusmods.com?shortUrl=xxxxxx"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groups"
              render={() => (
                <FormItem>
                  <FormLabel className="text-black text-xl font-semibold">
                    Groups
                  </FormLabel>
                  <FormDescription>
                    Add groups and assign each a color.
                  </FormDescription>
                  {groupFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 mb-2"
                    >
                      <FormControl>
                        <Input
                          placeholder="Group name"
                          {...form.register(`groups.${index}.name`)}
                        />
                      </FormControl>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            form.setValue(
                              `groups.${index}.color`,
                              value as
                                | "red"
                                | "orange"
                                | "yellow"
                                | "green"
                                | "blue"
                                | "purple"
                                | "pink"
                                | "teal"
                                | "brown"
                                | "gray"
                            )
                          }
                          value={form.watch(`groups.${index}.color`)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <span
                                  className={`inline-block w-4 h-4 rounded-full mr-2 align-middle ${option.css}`}
                                />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeGroup(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => appendGroup({ name: "", color: "red" })}
                    className="bg-white text-gray-500 w-1/4"
                    variant="link"
                  >
                    <Plus />
                    <p>Add group</p>
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstSundayOfSem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-semibold text-black">
                    First Sunday of Sem
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 w-full "
              >
                {loading ? <Loader className="animate-spin" /> : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </aside>
    </div>
  );
}
