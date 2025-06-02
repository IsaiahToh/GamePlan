import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Header from "./components/Header";
import { useState } from "react";
import dayjs from "dayjs";
import Sidebar from "./components/Sidebar";
import { Settings } from "./pages/Settings";

function App() {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState("Month");

  return (
    <div className="flex flex-col h-screen">
      <Header
        isSideBarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        setView={setView}
      />
      <div className="flex flex-1">
        {isSidebarOpen && (
          <Sidebar isSidebarOpen={isSidebarOpen} />
        )}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route
              path="/dashboard"
              element={<Dashboard month={currentMonth} view={view} />}
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
