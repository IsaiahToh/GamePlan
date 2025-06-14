"use client";

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
import { useState } from "react";
import { Loader, Plus } from "lucide-react";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";

const colorOptions = [
  { label: "Red", value: "red" },
  { label: "Orange", value: "orange" },
  { label: "Yellow", value: "yellow" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
  { label: "Purple", value: "purple" },
  { label: "Pink", value: "pink" },
  { label: "Teal", value: "teal" },
  { label: "Brown", value: "brown" },
  { label: "Gray", value: "gray" },
];

const formSchema = z.object({
  blockOutTimings: z.array(
    z.object({
      from: z.string().min(1, "Start time required"),
      to: z.string().min(1, "End time required"),
    })
  ),
  url: z.string().min(1, "Link required").url("Invalid URL format"),
  groups: z.array(
    z.object({
      name: z.string().min(1, "Group name required"),
      color: z.enum([
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
        "teal",
        "brown",
        "gray",
      ]),
    })
  ),
});

export default function Settingsbar() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockOutTimings: [{ from: "", to: "" }],
      url: "",
      groups: [{ name: "", color: "red" }],
    },
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

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Fetch NUSMods API, handle timings, etc.
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:3000/api/dashboard/scrape-and-import",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blockOutTimings: values.blockOutTimings,
            url: values.url,
            groups: values.groups.map((group) => ({
              name: group.name,
              color: group.color,
            })),
          }),
        }
      );
      const data = await res.json();
      console.log(data);
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      //window.location.reload(); // eventually can reload to reflect changes
      setLoading(false);
    }
  };
  return (
    <div className="flex">
      {/* Settingsbar */}
      <aside className="bg-white text-gray-700 shadow-md shadow-gray-500">
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
                    <div key={field.id} className="flex items-center gap-2 ">
                      <FormControl>
                        <Input
                          type="time"
                          {...form.register(`blockOutTimings.${index}.from`)}
                          placeholder="From"
                        />
                      </FormControl>
                      <span>to</span>
                      <FormControl>
                        <Input
                          type="time"
                          {...form.register(`blockOutTimings.${index}.to`)}
                          placeholder="To"
                        />
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
                    onClick={() => appendTime({ from: "", to: "" })}
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
                                  className={`inline-block w-4 h-4 rounded-full mr-2 align-middle
          ${
            {
              red: "bg-red-500",
              orange: "bg-orange-500",
              yellow: "bg-yellow-400",
              green: "bg-green-500",
              blue: "bg-blue-500",
              purple: "bg-purple-500",
              pink: "bg-pink-400",
              teal: "bg-teal-500",
              brown: "bg-yellow-900",
              gray: "bg-gray-500",
            }[option.value]
          }
        `}
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
