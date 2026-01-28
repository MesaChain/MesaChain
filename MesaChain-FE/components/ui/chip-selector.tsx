import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const chipVariants = cva(
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        selected:
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface Option {
  value: string;
  label: string;
}

export interface ChipSelectorProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  mode?: "single" | "multiple";
  isDisabled?: boolean;
  onClear?: () => void;
  className?: string;
}

export function ChipSelector({
  options,
  value,
  onChange,
  mode = "multiple",
  isDisabled = false,
  onClear,
  className,
}: ChipSelectorProps) {
  const chipRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    chipRefs.current = chipRefs.current.slice(0, options.length);
  }, [options]);

  function findSelectedIndex(opts: Option[], val: string | string[]) {
    if (Array.isArray(val)) {
      return opts.findIndex((opt) => val.includes(opt.value));
    }
    return opts.findIndex((opt) => opt.value === val);
  }

  const [focusedIndex, setFocusedIndex] = React.useState(() => {
    const selectedIndex = findSelectedIndex(options, value);
    return selectedIndex >= 0 ? selectedIndex : 0;
  });

  React.useEffect(() => {
    if (options.length === 0) return;
    setFocusedIndex((prev) => {
      if (prev >= 0 && prev < options.length) return prev;
      const selectedIndex = findSelectedIndex(options, value);
      return selectedIndex >= 0 ? selectedIndex : 0;
    });
  }, [options, value]);

  const isSelected = (optionValue: string) => {
    if (Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (isDisabled) return;

    if (mode === "single") {
      // In single mode, if it's already selected, do nothing or deselect?
      // Requirement: "Selecting a new chip deselects the previous one"
      // Usually single select implies one must be selected, or it acts like a radio.
      // If we allow deselecting the current one (toggle), then it becomes empty.
      // Requirement says: "Clicking a chip toggles its selection state" but also "Only one chip can be selected at a time".
      // If I click the *same* chip in single mode, should it deselect?
      // "Clicking a chip toggles its selection state" implies yes.
      if (value === optionValue) {
        onChange(""); // Deselect if same is clicked
      } else {
        onChange(optionValue);
      }
    } else {
      // Multiple mode
      const currentValues = Array.isArray(value) ? [...value] : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    optionValue: string,
    index: number
  ) => {
    if (isDisabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(optionValue);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      setFocusedIndex(nextIndex);
      chipRefs.current[nextIndex]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      setFocusedIndex(prevIndex);
      chipRefs.current[prevIndex]?.focus();
    }
  };

  const showClear = mode === "multiple" && onClear && Array.isArray(value) && value.length > 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="group"
        className="flex flex-wrap gap-2"
        aria-disabled={isDisabled}
      >
        {options.map((option, index) => {
          const selected = isSelected(option.value);
          return (
            <div
              key={option.value}
              ref={(el) => {
                chipRefs.current[index] = el;
              }}
              role="button"
              aria-pressed={selected}
              aria-disabled={isDisabled}
              tabIndex={isDisabled ? -1 : index === focusedIndex ? 0 : -1}
              onClick={() => {
                setFocusedIndex(index);
                handleSelect(option.value);
                chipRefs.current[index]?.focus();
              }}
              onFocus={() => setFocusedIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, option.value, index)}
              className={cn(
                chipVariants({ variant: selected ? "selected" : "default" }),
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {option.label}
            </div>
          );
        })}
      </div>
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          disabled={isDisabled}
          className="text-sm text-muted-foreground hover:text-foreground self-start flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-3 h-3" />
          Clear All
        </button>
      )}
    </div>
  );
}
