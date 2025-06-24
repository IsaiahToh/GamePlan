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
        {isSidebarOpen && <Sidebar />}
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard view={view} />
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
