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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const formSchema = z.object({
  blockOutTimings: z
    .array(
      z.object({
        from: z.string().min(1, "Start time required"),
        to: z.string().min(1, "End time required"),
      })
    )
    .min(1, "At least one block out timing required"),
  nusmodsApi: z.string().min(1, "Course code required"),
});

type FormValues = z.infer<typeof formSchema>;

export function Settings() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockOutTimings: [{ from: "", to: "" }],
      nusmodsApi: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "blockOutTimings",
  });

  const onSubmit = (values: FormValues) => {
    // Fetch NUSMods API, handle timings, etc.
    console.log(values);
  };

  return (
    <Card className="max-w-xl mx-auto shadow-lg mt-10">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Settings</CardTitle>

      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="blockOutTimings"
              render={() => (
                <FormItem>
                  <FormLabel>Daily block out timings</FormLabel>
                  <FormDescription>
                    Add your daily unavailable time slots.
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
                    className="bg-gray-800 hover:bg-gray-700"
                  >
                    Add another
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nusmodsApi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NUSMods Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. https://shorten.nusmods.com?shortUrl=xxxxxx"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your NUSMods sharing link. Retrieve under Share/Sync.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 w-1/4 "
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
