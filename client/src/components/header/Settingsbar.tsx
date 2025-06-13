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

const formSchema = z.object({
  blockOutTimings: z.array(
    z.object({
      from: z.string().min(1, "Start time required"),
      to: z.string().min(1, "End time required"),
    })
  ),
  url: z.string().min(1, "Link required").url("Invalid URL format"),
});

export default function Settingsbar() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockOutTimings: [{ from: "", to: "" }],
      url: "https://shorten.nusmods.com?shortUrl=75bsp5",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "blockOutTimings",
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
                  {fields.map((field, index) => (
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
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => append({ from: "", to: "" })}
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
