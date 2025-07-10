import { Button } from "@/components/ui/button";
import { Calendar, Menu, Settings } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import dayjs from "dayjs";
import { Dropdown } from "./Dropdown";
import Profile from "./Profile";
import { useState } from "react";


interface HeaderProps {
  isSideBarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSettingsbarOpen: boolean;
  setIsSettingsbarOpen: (open: boolean) => void;
  setView: React.Dispatch<React.SetStateAction<string>>;
  token: string | null;
  setToken: (token: string | null) => void;
}

const date = dayjs();

export default function Header({
  isSideBarOpen,
  setIsSidebarOpen,
  isSettingsbarOpen,
  setIsSettingsbarOpen,
  setView,
  token,
  setToken
}: HeaderProps) {

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        {!!token ? (
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

        {!!token ? (
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
        {!!token ? (
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

      {!!token ? (
        <div className="flex items-center gap-4">
          <Dropdown setView={setView} />
          <Profile setIsSidebarOpen={setIsSidebarOpen} setIsSettingsbarOpen={setIsSettingsbarOpen} setToken={setToken}/>
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
