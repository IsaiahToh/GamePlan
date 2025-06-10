import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  User,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import dayjs from "dayjs";
import { Dropdown } from "./Dropdown";

interface HeaderProps {
  isSideBarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  currentDate: dayjs.Dayjs;
  setCurrentDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
}

export default function Header({
  isSideBarOpen,
  setIsSidebarOpen,
  currentMonth,
  setCurrentMonth,
  currentDate,
  setCurrentDate,
  view,
  setView,
}: HeaderProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check if the user is authenticated

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    navigate("/login"); // Redirect to login page
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="flex items-center">
          {token ? (
            <Button
              variant={"ghost"}
              className="bg-gray-800 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSideBarOpen)}
            >
              <Menu />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            className="hidden lg:flex bg-gray-800 hover:bg-gray-700 hover:text-white font-bold mr-10"
            onClick={() => navigate("/")}
          >
            <Calendar />
            <p>GamePlan</p>
          </Button>
          {token ? (
            <Button
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                setCurrentMonth(dayjs().month());
                setCurrentDate(dayjs());
              }}
            >
              <p>Today</p>
            </Button>
          ) : null}
          {token ? (
            <Button
              className="bg-gray-800 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                view === "Month" ? setCurrentMonth(currentMonth - 1)
                : view === "Week" ? setCurrentDate(currentDate.subtract(1, 'week'))
                : setCurrentDate(currentDate.subtract(1, 'day'));
              }}
            >
              <ChevronLeft />
            </Button>
          ) : null}
          {token ? (
            <Button
              className="bg-gray-800 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                view === "Month" ? setCurrentMonth(currentMonth + 1)
                : view === "Week" ? setCurrentDate(currentDate.add(1, 'week'))
                : setCurrentDate(currentDate.add(1, 'day'));
              }}
            >
              <ChevronRight />
            </Button>
          ) : null}
          {token ? (
            <p>{currentDate.format("MMMM YYYY")}</p>) : null
          }
        </div>

        <div className="lg:flex hidden pt-2 justify-between gap-5 text-sm text-white absolute left-1/2 -translate-x-1/2">
          <NavLink to="/" className="flex flex-col items-center gap-1">
            <p>HOME</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-white" />
          </NavLink>
          {token ? (
            <NavLink
              to="/dashboard"
              className="flex flex-col items-center gap-1"
            >
              <p>DASHBOARD</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-white" />
            </NavLink>
          ) : null}
          <NavLink to="/about" className="flex flex-col items-center gap-1">
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-white" />
          </NavLink>
        </div>

        {token ? (
          <div className="flex items-center gap-4">
            <Dropdown setView={setView} />
            <Search className="translate-x-11 hidden lg:block" />
            <Input
              placeholder="Search users..."
              className="pl-9 text-gray-300 rounded-full hidden lg:block"
            ></Input>
            <div className="group relative">
              <User className="cursor-pointer" />
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                <div className="flex flex-col gap-1 w-36 py-2 px-3 bg-white text-gray-500 rounded shadow-lg">
                  <p
                    className="cursor-pointer hover:text-black"
                    onClick={handleLogout}
                  >
                    Logout
                  </p>
                  <p
                    className="cursor-pointer hover:text-black"
                    onClick={handleSettings}
                  >
                    Settings
                  </p>
                </div>
              </div>
            </div>
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
    </>
  );
}
