"use client";

interface Option {
  value: string;
  label: string;
}

interface ChipFilterProps {
  options: readonly Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function ChipFilter({ options, selected, onChange }: ChipFilterProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => toggle(opt.value)}
          className={`px-3 py-1 border rounded-full text-xs cursor-pointer transition-all
            ${
              selected.includes(opt.value)
                ? "bg-[#E6F7F0] border-[#0B2B3C] text-[#0B2B3C] font-medium"
                : "bg-white border-gray-200 text-gray-600 hover:border-[#0B2B3C] hover:text-[#0B2B3C]"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
