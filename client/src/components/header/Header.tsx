import { Button } from "@/components/ui/button";
import { Calendar, Menu, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Dropdown } from "./Dropdown";
import Profile from "./Profile";
import { useDashboardContext } from "@/context/DashboardContext";

const date = dayjs();

export default function Header() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isSettingsbarOpen,
    setIsSettingsbarOpen,
    setView,
    token,
    setToken,
    fetchDashboard,
  } = useDashboardContext();

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        {!!token ? (
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

        {!!token ? (
          <p className="text-md text-white px-4 py-1 border rounded-lg mx-2">
            {date.format("MMMM YYYY")}
          </p>
        ) : null}
      </div>

      {!!token ? (
        <div className="flex items-center gap-4">
          <Dropdown setView={setView} />
          <Profile setIsSidebarOpen={setIsSidebarOpen} setIsSettingsbarOpen={setIsSettingsbarOpen} setToken={setToken} fetchDashboard={fetchDashboard}/>
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
