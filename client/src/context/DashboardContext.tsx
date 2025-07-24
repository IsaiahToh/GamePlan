import React, { createContext, useContext, useState } from "react";
import { type ScheduledTask, type dashboardData } from "../lib/types";

type DashboardContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsbarOpen: boolean;
  setIsSettingsbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  currentDashboard: string;
  setCurrentDashboard: React.Dispatch<React.SetStateAction<string>>;
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
// Uncomment the line below if you are testing locally
//  const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

// Uncomment the line below if you are using the deployed app
  const API_URL = import.meta.env.VITE_API_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsbarOpen, setIsSettingsbarOpen] = useState(false);
  const [view, setView] = useState("Week");
  const [currentDashboard, setCurrentDashboard] = useState("My");
  const [taskOn, setTaskOn] = useState(true);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [dashboardData, setDashboardData] = useState<dashboardData>({
    userId: "",
    url: "",
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
        setLoggedIn(false);
        return;
      }
      const res = await fetch(
        `${API_URL}/api/dashboard?email=${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        setLoggedIn(false);
        return;
      }
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
      const res = await fetch(`${API_URL}/api/tasks?sort=true`, {
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
        currentDashboard,
        setCurrentDashboard,
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
