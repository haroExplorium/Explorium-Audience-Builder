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

const cache = new Map<string, Suggestion[]>();

export function AutocompleteFilter({
  field,
  placeholder,
  selected,
  onChange,
}: AutocompleteFilterProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const cacheKey = `${field}:${query}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    timer.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `/api/autocomplete?field=${field}&query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        const results = data.results ?? [];
        cache.set(cacheKey, results);
        setSuggestions(results);
        setOpen(true);
      } catch {
        // aborted or network error
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(timer.current);
      abortRef.current?.abort();
    };
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
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B2B3C] focus:ring-2 focus:ring-[#0B2B3C]/10 font-[inherit] placeholder:text-gray-300"
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && query.length > 0 && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#0B2B3C] rounded-full animate-spin" />
          </div>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.value}
                onMouseDown={() => add(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#E6F7F0] hover:text-[#0B2B3C]"
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
