import { Button } from "@/components/ui/button";
import { Calendar, Search, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check if the user is authenticated
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    navigate("/login"); // Redirect to login page
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <Button
          variant="ghost"
          className="bg-gray-800 hover:bg-gray-700 hover:text-white font-bold"
          onClick={() => window.location.reload()}
        >
          <Calendar />
          <p>GamePlan</p>
        </Button>

        <div className="flex pt-2 justify-between gap-5 text-sm text-white">
          <NavLink to="/" className="flex flex-col items-center gap-1">
            <p>HOME</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-white" />
          </NavLink>
          {token ? (
            <NavLink
              to="/dashboard"
              className="flex flex-col items-center gap-1"
            >
              <p>DASHBOARD</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-white" />
            </NavLink>
          ) : null}
          <NavLink to="/about" className="flex flex-col items-center gap-1">
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-white" />
          </NavLink>
        </div>

        {token ? (
          <div className="flex items-center gap-4">
            <Search />
            <div className="group relative">
              <User className="cursor-pointer" />
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                <div className="flex flex-col gap-1 w-36 py-2 px-3 bg-gray-100 text-gray-500 rounded">
                  <p
                    className="cursor-pointer hover:text-black"
                    onClick={handleLogout}
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
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
    </>
  );
}
