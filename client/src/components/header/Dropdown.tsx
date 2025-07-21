"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDashboardContext } from "@/context/DashboardContext";

export function Dropdown() {
  const { setView } = useDashboardContext();
  const [position, setPosition] = React.useState("Week");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-gray-800 hover:bg-gray-700 hover:text-white text-white rounded-sm p-3"
        >
          <div className="flex items-center gap-1">
            <h1>{position}</h1>
            <ChevronDown />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem
            value="Week"
            onClick={() => {
              setView("Week");
            }}
          >
            Week
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="Day"
            onClick={() => {
              setView("Day");
            }}
          >
            Day
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
