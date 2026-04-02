"use client";
import { useState, useEffect, useRef } from "react";

interface Suggestion {
  label: string;
  value: string;
}

interface AutocompleteFilterProps {
  field: string;
  placeholder: string;
  selected: string[];
  onChange: (values: string[]) => void;
}

export function AutocompleteFilter({
  field,
  placeholder,
  selected,
  onChange,
}: AutocompleteFilterProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      const res = await fetch(
        `/api/autocomplete?field=${field}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSuggestions(data.results ?? []);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query, field]);

  const add = (suggestion: Suggestion) => {
    if (!selected.includes(suggestion.value)) {
      onChange([...selected, suggestion.value]);
    }
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const remove = (val: string) => onChange(selected.filter((v) => v !== val));

  return (
    <div className="mt-1">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10 font-[inherit] placeholder:text-gray-300"
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.value}
                onMouseDown={() => add(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#E3F2FD] hover:text-[#1A73E8]"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
