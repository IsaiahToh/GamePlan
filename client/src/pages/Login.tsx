"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useDashboardContext } from "@/context/DashboardContext";

const API_URL = import.meta.env.VITE_API_URL;

// Define Zod schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export function Login() {
  const { setLoggedIn } = useDashboardContext();
  // Set up form with useForm and zodResolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { setError } = form;

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.status === 404) {
        setError("email", {
          type: "server",
          message: "Email address not found.",
        });
      } else if (response.status === 401) {
        setError("password", {
          type: "server",
          message: "Incorrect password.",
        });
      } else if (!response.ok) {
        setError("root", {
          type: "server",
          message: "An unexpected error occurred. Please try again later.",
        });
      } else {
        const data = await response.json();
        localStorage.setItem("token", data.token); // Store token in local storage
        localStorage.setItem("email", values.email); // Store email in local storage
        setLoggedIn(true); // Update loggedIn state
        navigate("/"); // Redirect to dashboard page after successful login
      }
    } catch (error) {
      setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  }

  return (
    <Card className="max-w-xl mx-auto shadow-lg mt-20">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Log In</CardTitle>
        <CardDescription>More Game to Plan?</CardDescription>
      </CardHeader>
      <CardContent>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-md mx-auto"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 cursor-pointer mb-2"
            >
              Log In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Login;
