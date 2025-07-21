import { Button } from "@/components/ui/button";
import { Calendar, Menu, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Dropdown } from "./Dropdown";
import Profile from "./Profile";
import { useDashboardContext } from "@/context/DashboardContext";

export default function Header() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isSettingsbarOpen,
    setIsSettingsbarOpen,
    currentDashboard,
    loggedIn,
  } = useDashboardContext();

  const date = dayjs();

  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-gray-800 text-white h-16">
      {/* Left */}
      <div className="flex items-center">
        {loggedIn && currentDashboard === "My" ? (
          <Menu
            className="cursor-pointer mx-3"
            size={20}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : null}

        <div
          className="group relative flex mx-2 gap-x-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <Calendar />
          <p className="font-semibold">GamePlan</p>
        </div>

        {loggedIn ? (
          <p className="text-md text-white px-4 py-1 border rounded-lg mx-2">
            {date.format("MMMM YYYY")}
          </p>
        ) : null}
      </div>

      {/* Center (absolutely centered) */}
      {loggedIn ? (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="text-2xl font-bold text-white px-4 py-2 whitespace-nowrap">
            {currentDashboard === "My" ? "My" : currentDashboard + "'s"} dashboard
          </p>
        </div>
      ) : null}

      {/* Right */}
      {loggedIn ? (
        <div className="flex items-center gap-4">
          <Dropdown />
          <Profile />
          {currentDashboard === "My" ? (
            <Settings
              className="cursor-pointer"
              size={20}
              onClick={() => {
                setIsSettingsbarOpen(!isSettingsbarOpen);
              }}
            />
          ) : null}
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

