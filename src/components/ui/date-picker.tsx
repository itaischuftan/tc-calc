"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Root as PopoverRoot, Trigger as PopoverTrigger, Content as PopoverContent, Portal as PopoverPortal } from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  selected,
  onSelect,
  disabled = false,
  placeholder = "Pick a date",
  className
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Ensure we have a valid date or undefined
  const validDate = selected && !isNaN(selected.getTime()) ? selected : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date && !isNaN(date.getTime())) {
      onSelect?.(date);
      setOpen(false);
    }
  };

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !validDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {validDate ? format(validDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-md shadow-lg" align="start">
          <DayPicker
            mode="single"
            selected={validDate}
            onSelect={handleSelect}
            disabled={{ before: new Date("1900-01-01"), after: new Date("2100-12-31") }}
            className="p-3"
            styles={{
              head_cell: {
                width: "36px",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#6b7280"
              },
              cell: {
                width: "36px",
                height: "36px",
                textAlign: "center",
                fontSize: "0.875rem",
                borderRadius: "6px"
              },
              day: {
                width: "36px",
                height: "36px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s"
              },
              day_today: {
                backgroundColor: "#f3f4f6",
                fontWeight: "600"
              },
              day_selected: {
                backgroundColor: "#3b82f6",
                color: "white",
                fontWeight: "600"
              },
              day_disabled: {
                color: "#d1d5db",
                cursor: "not-allowed"
              },
              day_outside: {
                color: "#d1d5db"
              },
              day_range_middle: {
                backgroundColor: "#dbeafe"
              },
              nav_button: {
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              },
              nav_button_previous: {
                marginRight: "8px"
              },
              nav_button_next: {
                marginLeft: "8px"
              },
              caption: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                fontSize: "0.875rem",
                fontWeight: "600"
              },
              caption_label: {
                fontSize: "0.875rem",
                fontWeight: "600"
              },
              table: {
                borderSpacing: "2px"
              }
            }}
            modifiersStyles={{
              selected: {
                backgroundColor: "#3b82f6",
                color: "white"
              }
            }}
          />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  );
} 