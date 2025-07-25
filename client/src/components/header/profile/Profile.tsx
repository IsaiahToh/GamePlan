import { User } from "lucide-react";
import { AddFriend } from "./AddFriend";
import { ViewFriend } from "./ViewFriend";
import { useNavigate } from "react-router-dom";
import { useDashboardContext } from "@/context/DashboardContext";
import { DeleteAccount } from "./DeleteAccount";

export default function Profile() {
  const { setIsSidebarOpen, setIsSettingsbarOpen, setLoggedIn } =
    useDashboardContext();
  // Use useNavigate to
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  async function handleLogout() {
    setIsSidebarOpen(false); 
    setIsSettingsbarOpen(false);
    localStorage.removeItem("token"); 
    localStorage.removeItem("email"); 
    setLoggedIn(false);
    navigate("/login"); 
  }
  return (
    <div className="group relative">
      <User className="cursor-pointer" />
      <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-10">
        <div className="flex flex-col gap-1 w-36 py-2 px-3 bg-white text-gray-500 rounded shadow-lg">
          <p className="text-black text-xs underline my-2">{email}</p>

          <AddFriend />
          <ViewFriend />
          <p className="cursor-pointer hover:text-black" onClick={handleLogout}>
            Logout
          </p>
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}
