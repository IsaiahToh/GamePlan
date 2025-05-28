import { Button } from "@/components/ui/button";
import { Calendar, ChartArea, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <Menu />
      <Button
        variant="ghost"
        className="bg-gray-800 hover:bg-gray-700 hover:text-white font-bold"
        onClick={() => window.location.reload()}
      >
        <Calendar />
        <p>GamePlan</p>
      </Button>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="bg-gray-800 hover:bg-gray-700 hover:text-white"
        >
          <a
            href="https://polygon.io/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Polygon.io Docs
          </a>
        </Button>
        <Button
          variant="outline"
          className="bg-gray-800 hover:bg-gray-700 hover:text-white"
        >
          <a
            href="https://polygon.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Polygon.io
          </a>
        </Button>
      </div>
    </header>
  );
}
