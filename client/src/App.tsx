import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Header from "./components/Header";
import { useState } from "react";
import { getMonth } from "./lib/utils";

function App() {
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/dashboard" element={<Dashboard month={currentMonth}/>}></Route>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/about" element={<About />}></Route>
      </Routes>
    </>
  );
}

export default App;
