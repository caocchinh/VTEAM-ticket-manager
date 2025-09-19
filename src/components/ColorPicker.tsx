"use client";

import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker = ({ color, onChange, label }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-8 h-8 p-0 border-2"
          style={{ backgroundColor: color }}
          title={label || "Pick color"}
        ></Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={color} onChange={onChange} />
        <div className="mt-2 flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-mono">{color}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
