"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChipsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChipsInput({
  value = [],
  onChange,
  placeholder = "Add item...",
  disabled = false
}: ChipsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addChip = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeChip = (chipToRemove: string) => {
    onChange(value.filter(chip => chip !== chipToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeChip(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 w-full">
        {value.map((chip, index) => (
          <Badge key={index} variant="secondary" className="flex flex-wrap items-center gap-1 whitespace-normal break-words max-w-full">
            {chip}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button type="button" onClick={addChip} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
