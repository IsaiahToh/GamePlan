import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { type FriendRequest } from "@/lib/types";
import { Calendar, Check, X } from "lucide-react";
import { useDashboardContext } from "@/context/DashboardContext";

export function ViewFriend() {
  const { fetchDashboard, setFriendView, setTaskOn } = useDashboardContext();
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  async function fetchReceived() {
    if (!token) {
      toast.error("You are not logged in.", { duration: 2000 });
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3000/api/friend?type=received",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setReceived(data === null ? [] : data);
    } catch (error) {
      toast.error("An unexpected error ocurred.", { duration: 2000 });
    }
  }

  async function fetchFriends() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/friend?type=friends",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setFriends(data === null ? [] : data);
    } catch (error) {
      toast.error("An unexpected error ocurred.", { duration: 2000 });
    }
  }

  async function deleteFriendRequest(id: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/friend/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 404) {
        toast.error("Friend not found.", { duration: 2000 });
      } else if (response.status === 200) {
        toast.success("Deleted successfully.", {
          duration: 2000,
        });
        fetchFriends();
        fetchReceived();
      } else {
        toast.error("Server error.", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Unexpected error.", { duration: 2000 });
    }
  }

  async function addFriend(id: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/friend/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 404) {
        toast.error("Friend request not found.", { duration: 2000 });
      } else if (response.status === 200) {
        toast.success("Friend request accepted successfully.", {
          duration: 2000,
        });
        fetchReceived();
        fetchFriends();
      } else {
        toast.error("Server error.", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Unexpected error.", { duration: 2000 });
    }
  }

  useEffect(() => {
    fetchReceived();
    fetchFriends();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="cursor-pointer hover:text-black">View friends</p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Friends list</DialogTitle>
          <DialogDescription>Checkout their GamePlans!</DialogDescription>
        </DialogHeader>
        {friends.length > 0 ? (
          <div>
            <p className="text-sm mb-1">Friends:</p>
            <ul>
              {friends.map((req) => (
                <li
                  key={req._id}
                  className="text-gray-600 text-sm flex border border-gray mb-1 rounded-lg px-1"
                >
                  {req.requester.email === email
                    ? `${req.recipient.email} [${req.recipient.name}]`
                    : `${req.requester.email} [${req.requester.name}]`}
                  <div className="flex ml-auto">
                    <DialogClose asChild>
                      <Calendar
                        className="h-5 cursor-pointer"
                        color="blue"
                        onClick={() => {
                          setFriendView(true);
                          setTaskOn(false);
                          fetchDashboard(
                            req.requester.email === email
                              ? req.recipient.email
                              : req.requester.email
                          );
                        }}
                      />
                    </DialogClose>
                    <X
                      className="h-5 cursor-pointer "
                      color="red"
                      onClick={() =>
                        deleteFriendRequest(
                          req.requester.email === email
                            ? req.recipient._id
                            : req.requester._id
                        )
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>No friends added yet.</div>
        )}
        {received.length > 0 ? (
          <div>
            <p className="text-sm mb-1">Friend requests:</p>
            <ul>
              {received.map((req) => (
                <li
                  key={req._id}
                  className="text-gray-600 text-sm flex border border-gray mb-1 rounded-lg px-1"
                >
                  {`${req.requester.email} [${req.requester.name}]`}
                  <div className="flex ml-auto">
                    <Check
                      className="h-5 cursor-pointer"
                      color="green"
                      onClick={() => addFriend(req.requester._id)}
                    />
                    <X
                      className="h-5 cursor-pointer "
                      color="red"
                      onClick={() => deleteFriendRequest(req.requester._id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>No requests received.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
