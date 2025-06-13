import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Header from "./components/header/Header";
import { useState, type JSX } from "react";
import dayjs from "dayjs";
import Sidebar from "./components/header/Sidebar";
import { Settings } from "./pages/Settings";

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState("Week");

  return (
    <div className="flex flex-col h-screen">
      <Header
        isSideBarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        view={view}
        setView={setView}
      />
      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar isSidebarOpen={isSidebarOpen} />}
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    view={view}
                  />
                </ProtectedRoute>
              }
            ></Route>
            <Route path="/" element={<Home />}></Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;