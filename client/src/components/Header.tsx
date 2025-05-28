import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
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
          <NavLink to="/about" className="flex flex-col items-center gap-1">
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-white" />
          </NavLink>
        </div>

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
            Log In</Link>
          </Button>
        </div>
      </header>
    </>
  );
}
