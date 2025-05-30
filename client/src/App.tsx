import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Header from "./components/Header";
import { useState } from "react";
import { getMonth } from "./lib/utils";
import Sidebar from "./components/Sidebar";

function App() {
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Header
        isSideBarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
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
              element={<Dashboard month={currentMonth} />}
            ></Route>
            <Route path="/" element={<Home />}></Route>
            <Route path="/about" element={<About />}></Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
