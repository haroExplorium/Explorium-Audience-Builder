"use client";
import { useState } from "react";

interface FilterSectionProps {
  icon: React.ReactNode;
  label: string;
  activeCount?: number;
  children: React.ReactNode;
  appliedTags?: { label: string; onRemove: () => void }[];
}

export function FilterSection({
  icon,
  label,
  activeCount,
  children,
  appliedTags,
}: FilterSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3.5 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-[#1A73E8] w-5 h-5 flex-shrink-0">{icon}</span>
        <span className="text-sm text-[#1A73E8] font-medium flex-1">{label}</span>
        {activeCount ? (
          <span className="text-[11px] text-[#1A73E8] bg-[#E3F2FD] px-2 py-0.5 rounded-full font-semibold">
            {activeCount}
          </span>
        ) : null}
        <ChevronIcon open={open} />
      </button>

      {appliedTags && appliedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-6 pb-2.5 pl-[58px]">
          {appliedTags.map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-1 bg-[#E3F2FD] text-[#1A73E8] text-[11px] font-medium px-2 py-0.5 rounded"
            >
              {t.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  t.onRemove();
                }}
                className="opacity-60 hover:opacity-100 text-[13px] font-bold leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && <div className="px-6 pb-4 pl-[58px]">{children}</div>}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}
