import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDashboardContext } from "@/context/DashboardContext";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const DeleteAccount = () => {
    const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setLoggedIn, setIsSettingsbarOpen, setIsSidebarOpen } = useDashboardContext();
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const response = await fetch(`${API_URL}/api/delete?email=${email}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        toast.success("Account deleted successfully.", { duration: 2000 });
        setOpen(false);
        setIsSidebarOpen(false); 
        setIsSettingsbarOpen(false); 
        localStorage.removeItem("token"); 
        localStorage.removeItem("email"); 
        setLoggedIn(false); 
        navigate("/signup"); 
      } else {
        toast.error("An unexpected error occurred.", { duration: 2000 });
      }
    } catch (error) {
      console.error("An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="w-full bg-red-500 hover:bg-red-600 cursor-pointer text-white"
        >
          <p>Delete account</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-64">
        <DialogHeader>
          <DialogTitle>Delete my account?</DialogTitle>
          <DialogDescription>This action is irreversible.</DialogDescription>
        </DialogHeader>

            <Button
              variant="secondary"
              className="w-full bg-red-500 hover:bg-red-400 cursor-pointer text-white"
              onClick={handleDeleteAccount}
            >
              Please delete my account
            </Button>
      </DialogContent>
    </Dialog>
  );
};
