import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { INDIA_COLLEGES } from "@/lib/india-colleges";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function CollegeAutocomplete({ id, value, onChange, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [] as string[];
    const starts: string[] = [];
    const contains: string[] = [];
    for (const name of INDIA_COLLEGES) {
      const lower = name.toLowerCase();
      if (lower === query) continue;
      if (lower.startsWith(query)) starts.push(name);
      else if (lower.includes(query)) contains.push(name);
      if (starts.length >= 8) break;
    }
    return [...starts, ...contains].slice(0, 8);
  }, [value]);

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const choose = (name: string) => { onChange(name); setOpen(false); };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        className="h-12 rounded-xl"
        onChange={(event) => { onChange(event.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!open || suggestions.length === 0) return;
          if (event.key === "ArrowDown") { event.preventDefault(); setHighlight((h) => (h + 1) % suggestions.length); }
          else if (event.key === "ArrowUp") { event.preventDefault(); setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length); }
          else if (event.key === "Enter") { event.preventDefault(); choose(suggestions[highlight]); }
          else if (event.key === "Escape") { setOpen(false); }
        }}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-popover shadow-elevated">
          {suggestions.map((name, index) => (
            <button
              key={name}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(name)}
              onMouseEnter={() => setHighlight(index)}
              className={cn(
                "block w-full truncate px-3 py-2 text-left text-sm transition-colors",
                index === highlight ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
