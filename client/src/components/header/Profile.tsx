import { User } from "lucide-react";
import { AddFriend } from "./friends/AddFriend";
import { ViewFriend } from "./friends/ViewFriend";
import { useNavigate } from "react-router-dom";

interface ProfileProps {
  setIsSidebarOpen: (open: boolean) => void;
  setIsSettingsbarOpen: (open: boolean) => void;
  setToken: (token: string | null) => void;
  fetchDashboard: (email: string) => Promise<void>;
}

export default function Profile({
  setIsSidebarOpen,
  setIsSettingsbarOpen,
  setToken,
  fetchDashboard,
}: ProfileProps) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  async function handleLogout() {
    setIsSidebarOpen(false); // Close sidebar if open
    setIsSettingsbarOpen(false); // Close settings bar if open
    setToken(null);
    navigate("/login"); // Redirect to login page
  }
  return (
    <div className="group relative">
      <User className="cursor-pointer" />
      <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-10">
        <div className="flex flex-col gap-1 w-36 py-2 px-3 bg-white text-gray-500 rounded shadow-lg">
          <p className="text-black text-xs underline my-2">{email}</p>

          <AddFriend />
          <ViewFriend fetchDashboard={fetchDashboard} />
          <p className="cursor-pointer hover:text-black" onClick={handleLogout}>
            Logout
          </p>
        </div>
      </div>
    </div>
  );
}
