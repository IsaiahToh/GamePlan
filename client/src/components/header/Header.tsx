import { Button } from "@/components/ui/button";
import { Calendar, Menu, Settings, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Dropdown } from "./Dropdown";
// import { AddFriend } from "./friends/AddFriend";


interface HeaderProps {
  isSideBarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSettingsbarOpen: boolean;
  setIsSettingsbarOpen: (open: boolean) => void;
  setView: React.Dispatch<React.SetStateAction<string>>;
}

const date = dayjs();

export default function Header({
  isSideBarOpen,
  setIsSidebarOpen,
  isSettingsbarOpen,
  setIsSettingsbarOpen,
  setView,
}: HeaderProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check if the user is authenticated
  const isToken =
    token && JSON.parse(atob(token.split(".")[1])).exp * 1000 > Date.now();

  const handleLogout = () => {
    setIsSidebarOpen(false); // Close sidebar if open
    setIsSettingsbarOpen(false); // Close settings bar if open
    localStorage.removeItem("token"); // Remove token from local storage
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        {isToken ? (
          <Menu
            className="cursor-pointer mx-3"
            size={20}
            onClick={() => setIsSidebarOpen(!isSideBarOpen)}
          />
        ) : null}

        <div
          className="group relative flex mx-2 gap-x-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <Calendar />
          <p className="font-semibold">GamePlan</p>
        </div>

        {isToken ? (
          <p className="text-md text-white px-4 py-1 border rounded-lg mx-2">
            {date.format("MMMM YYYY")}
          </p>
        ) : null}
      </div>

      <div className="lg:flex hidden pt-2 justify-between gap-5 text-sm text-white absolute left-1/2 -translate-x-1/2">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-white" />
        </NavLink>
        {isToken ? (
          <NavLink to="/dashboard" className="flex flex-col items-center gap-1">
            <p>DASHBOARD</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-white" />
          </NavLink>
        ) : null}
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-white" />
        </NavLink>
      </div>

      {isToken ? (
        <div className="flex items-center gap-4">
          <Dropdown setView={setView} />
          <div className="group relative">
            <User className="cursor-pointer" />
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-1 w-36 py-2 px-3 bg-white text-gray-500 rounded shadow-lg">
                {/* <AddFriend /> */}
                <p
                  className="cursor-pointer hover:text-black"
                  onClick={handleLogout}
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
          <Settings
            className="cursor-pointer"
            size={20}
            onClick={() => {
              setIsSettingsbarOpen(!isSettingsbarOpen);
            }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 hover:text-white"
          >
            <Link to="/signup" className="text-white hover:text-gray-300">
              Sign Up
            </Link>
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 hover:text-white"
          >
            <Link to="/login" className="text-white hover:text-gray-300">
              Log In
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
