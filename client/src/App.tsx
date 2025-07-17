import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Header from "./components/header/Header";
import { useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import Settingsbar from "./components/header/Settingsbar";
import Sidebar from "./components/header/sidebar/Sidebar";
import { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsbarOpen, setIsSettingsbarOpen] = useState(false);
  const [view, setView] = useState("Week");
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboard = async (email: string) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
        const res = await fetch(`${API_URL}/api/dashboard?email=${email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
      console.log("Scheduled tasks:", scheduledTasks);
    } catch (error) {
      console.log("Error fetching sorted tasks:", error);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-full">
        <Header
          isSideBarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isSettingsbarOpen={isSettingsbarOpen}
          setIsSettingsbarOpen={setIsSettingsbarOpen}
          setView={setView}
          token={token}
          setToken={setToken}
          fetchDashboard={fetchDashboard}
        />
        <div className="flex flex-1">
          {isSidebarOpen && (
            <Sidebar fetchDashboardTasks={fetchDashboardTasks} />
          )}
          <main className="flex-1">
            <Routes>
              <Route
                path="/login"
                element={<Login setToken={setToken} />}
              ></Route>
              <Route path="/signup" element={<Signup />}></Route>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard
                      view={view}
                      scheduledTasks={scheduledTasks}
                      fetchDashboardTasks={fetchDashboardTasks}
                      dashboardData={dashboardData}
                      fetchDashboard={fetchDashboard}
                      isSettingsbarOpen={isSettingsbarOpen}
                      setIsSettingsbarOpen={setIsSettingsbarOpen}
                    />
                  </ProtectedRoute>
                }
              ></Route>
              <Route path="/" element={<Home />}></Route>
              <Route path="/about" element={<About />}></Route>
            </Routes>
          </main>
          {isSettingsbarOpen && (
            <Settingsbar
              fetchDashboard={fetchDashboard}
              setIsSettingsbarOpen={setIsSettingsbarOpen}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
