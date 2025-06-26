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

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsbarOpen, setIsSettingsbarOpen] = useState(false);
  const [view, setView] = useState("Week");
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const fetchDashboardTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(
          "http://localhost:3000/api/tasks/sorted/by-deadline-and-importance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setScheduledTasks(data.scheduledTasks);
        console.log("Scheduled tasks:", scheduledTasks);
      } catch (error) {
        console.log("Error fetching sorted tasks:", error);
      }
    };

  return (
    <div className="flex flex-col h-full">
      <Header
        isSideBarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSettingsbarOpen={isSettingsbarOpen}
        setIsSettingsbarOpen={setIsSettingsbarOpen}
        setView={setView}
      />
      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar fetchDashboardTasks={fetchDashboardTasks}/>}
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard view={view} scheduledTasks={scheduledTasks} fetchDashboardTasks={fetchDashboardTasks}/>
                </ProtectedRoute>
              }
            ></Route>
            <Route path="/" element={<Home />}></Route>
            <Route path="/about" element={<About />}></Route>
          </Routes>
        </main>
        {isSettingsbarOpen && <Settingsbar />}
      </div>
    </div>
  );
}

export default App;
