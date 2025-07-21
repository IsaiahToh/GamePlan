import React, { createContext, useContext, useState } from "react";
import { type ScheduledTask, type dashboardData } from "../lib/types";

type DashboardContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsbarOpen: boolean;
  setIsSettingsbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  friendView: boolean;
  setFriendView: React.Dispatch<React.SetStateAction<boolean>>;
  taskOn: boolean;
  setTaskOn: React.Dispatch<React.SetStateAction<boolean>>;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  scheduledTasks: ScheduledTask[];
  setScheduledTasks: React.Dispatch<React.SetStateAction<ScheduledTask[]>>;
  dashboardData: dashboardData;
  setDashboardData: React.Dispatch<React.SetStateAction<dashboardData>>;
  fetchDashboard: (email: string) => Promise<void>;
  fetchDashboardTasks: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error(
      "useDashboardContext must be used within DashboardProvider"
    );
  return context;
};

export const DashboardProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsbarOpen, setIsSettingsbarOpen] = useState(false);
  const [view, setView] = useState("Week");
  const [friendView, setFriendView] = useState(false);
  const [taskOn, setTaskOn] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [dashboardData, setDashboardData] = useState<dashboardData>({
    userId: "",
    blockOutTimings: [],
    lessons: [],
    firstSundayOfSem: "",
    freeTimeSlots: [],
    groups: [],
  });

  const fetchDashboard = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token in localStorage");
        return;
      }
      const res = await fetch(
        `http://localhost:3000/api/dashboard?email=${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setDashboardData(data);
      console.log("Fetched data:", data);
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    }
  };

  const fetchDashboardTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/api/tasks?sort=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setScheduledTasks(data.scheduledTasks);
      console.log("Scheduled tasks:", data.scheduledTasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isSettingsbarOpen,
        setIsSettingsbarOpen,
        view,
        setView,
        friendView,
        setFriendView,
        taskOn,
        setTaskOn,
        loggedIn,
        setLoggedIn,
        scheduledTasks,
        setScheduledTasks,
        dashboardData,
        setDashboardData,
        fetchDashboard,
        fetchDashboardTasks,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
