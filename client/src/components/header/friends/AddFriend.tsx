import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FriendForm } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { type FriendRequest } from "@/lib/types";
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export function AddFriend() {
  const form = useForm<z.infer<typeof FriendForm>>({
    resolver: zodResolver(FriendForm),
    defaultValues: {
      email: "",
    },
  });
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const token = localStorage.getItem("token");

  async function fetchSent() {
    try {
      const response = await fetch(
        `${API_URL}/api/friend?type=sent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSent(data === null ? [] : data);
    } catch (error) {
      // handle error (e.g., show toast)
    } finally {
    }
  }

  async function deleteFriendRequest(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/friend/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 404) {
        toast.error("Friend request not found.", { duration: 2000 });
      } else if (response.status === 200) {
        toast.success("Friend request deleted successfully.", {
          duration: 2000,
        });
        fetchSent();
      } else {
        toast.error("Server error.", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Unexpected error.", { duration: 2000 });
    }
  }

  useEffect(() => {
    fetchSent();
  }, []);

  async function onSubmit(data: z.infer<typeof FriendForm>) {
    try {
      const response = await fetch(`${API_URL}/api/friend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      if (response.status === 404) {
        toast.error("Email not found. Please check the email address.", {
          duration: 2000,
        });
      } else if (response.status === 400) {
        const errData = await response.json();
        if (errData.code === "FRIEND") {
          toast.error("You cannot add yourself as a friend.", {
            duration: 2000,
          });
        } else if (errData.code === "ALREADY_SENT") {
          toast.error("Friend request already sent.", { duration: 2000 });
        } else {
          toast.error("You are already friends with this user.", {
            duration: 2000,
          });
        }
      } else if (response.status === 201) {
        toast.success("Friend request sent successfully!", { duration: 2000 });
      } else {
        toast.error("Unexpected error occurred.", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Server error.", { duration: 2000 });
    } finally {
      fetchSent();
      form.reset();
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="cursor-pointer hover:text-black">Add friends</p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add friend</DialogTitle>
          <DialogDescription>Find a friend. Connect.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Find an email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-gray-800">
              Send friend request
            </Button>
          </form>
        </Form>
        {sent.length > 0 ? (
          <div>
            <p className="text-sm mb-1">Pending sent requests:</p>
            <ul>
              {sent.map((req) => (
                <li
                  key={req._id}
                  className="text-gray-600 text-sm flex border border-gray mb-1 rounded-lg px-1"
                >
                  {`${req.recipient.email} [${req.recipient.name}]`}
                  <X
                    className="h-5 ml-auto cursor-pointer "
                    color="red"
                    onClick={() => deleteFriendRequest(req.recipient._id)}
                  />{" "}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>No requests sent.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
