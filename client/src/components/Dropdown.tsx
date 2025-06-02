"use client";

import * as React from "react";

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

interface DropdownProps {
    setView: React.Dispatch<React.SetStateAction<string>>;
    }

export function Dropdown({setView} : DropdownProps) {
  const [position, setPosition] = React.useState("Month");

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
          <DropdownMenuRadioItem value="Month" onClick={() => {setView("Month")}}>Month</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Week" onClick={() => {setView("Week")}}>Week</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Day" onClick={() => {setView("Day")}}>Day</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
