"use client";

import { Select, SelectItem } from "@/ui/select";
import { Button } from "@/ui/button";
import { useState } from "react";
import {
  LuDollarSign,
  LuStar,
  LuCalendar,
  LuArrowUp,
  LuArrowDown,
  LuDownload,
} from "react-icons/lu";

type SortMenubarProps = {
  onChange: (sortBy: string, ascending: boolean) => void;
};

export function SortMenubar({ onChange }: SortMenubarProps) {
  const [sortBy, setSortBy] = useState<string>("price");
  const [isUp, setIsUp] = useState(true);

  const handleClick = () => {
    const updateIsUp = !isUp;
    setIsUp(updateIsUp);
    onChange(sortBy, updateIsUp);
  };

  const handleSelect = (value: string) => {
    setSortBy(value);
    onChange(value, isUp);
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-sm text-white/60">Sort results by:</span>
      <div className="w-32">
        <Select
          placeholder="None"
          variant="outline"
          size="md"
          value={sortBy}
          onValueChange={handleSelect}
        >
          <SelectItem value="price">
            <div className="flex items-center gap-2">
              <LuDollarSign className="text-base" />
              <div className="font-semibold">Price</div>
            </div>
          </SelectItem>
          <SelectItem value="reviews">
            <div className="flex items-center gap-2">
              <LuStar className="text-base" />
              <div className="font-semibold">Reviews</div>
            </div>
          </SelectItem>
          <SelectItem value="date">
            <div className="flex items-center gap-2">
              <LuCalendar className="text-base" />
              <div className="font-semibold">Date</div>
            </div>
          </SelectItem>
          <SelectItem value="downloads">
            <div className="flex items-center gap-2">
              <LuDownload className="text-base" />
              <div className="font-semibold">Downloads</div>
            </div>
          </SelectItem>
        </Select>
      </div>
      <div>
        <Button
          icon
          variant="outline"
          size="md"
          className="p-3"
          onClick={handleClick}
        >
          {isUp ? <LuArrowUp /> : <LuArrowDown />}
        </Button>
      </div>
    </div>
  );
}
