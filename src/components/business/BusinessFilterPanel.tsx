"use client";
import { useState } from "react";
import { FilterSection } from "../filters/FilterSection";
import { BusinessAutocompleteFilter } from "./BusinessAutocompleteFilter";
import { BusinessFilterState } from "@/types/business";

interface BusinessFilterPanelProps {
  onGenerate: () => void;
  isLoading: boolean;
  filters: BusinessFilterState;
  setFilters: (filters: BusinessFilterState) => void;
}

export function BusinessFilterPanel({
  onGenerate,
  isLoading,
  filters,
  setFilters,
}: BusinessFilterPanelProps) {
  const hasGoogle = (filters.googleCategory?.length ?? 0) > 0;
  const hasNaics = (filters.naicsCategory?.length ?? 0) > 0;

  const activeCount =
    [filters.country, filters.googleCategory, filters.naicsCategory].filter(
      (v) => Array.isArray(v) && v.length > 0
    ).length;

  const tagsFor = (key: keyof BusinessFilterState) => {
    const val = filters[key];
    if (!Array.isArray(val)) return [];
    return val.map((v) => ({
      label: v,
      onRemove: () =>
        setFilters({ ...filters, [key]: val.filter((x) => x !== v) }),
    }));
  };

  return (
    <aside className="fixed left-14 top-[52px] bottom-0 w-[380px] bg-white border-r border-gray-200 z-30 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <span className="text-[15px] font-semibold text-gray-900">
          Search businesses
        </span>
        {activeCount > 0 && (
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <span className="bg-[#0B2B3C] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
            <button
              onClick={() =>
                setFilters({ country: [], googleCategory: [], naicsCategory: [] })
              }
              className="text-[11px] text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <FilterSection
          icon={<LocationIcon />}
          label="Location"
          activeCount={filters.country?.length || undefined}
          appliedTags={tagsFor("country")}
        >
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              { value: "us", label: "United States" },
              { value: "gb", label: "United Kingdom" },
              { value: "ca", label: "Canada" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  const current = filters.country ?? [];
                  setFilters({
                    ...filters,
                    country: current.includes(opt.value)
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value],
                  });
                }}
                className={`px-3 py-1 border rounded-full text-xs cursor-pointer transition-all
                  ${
                    (filters.country ?? []).includes(opt.value)
                      ? "bg-[#E6F7F0] border-[#0B2B3C] text-[#0B2B3C] font-medium"
                      : "bg-white border-gray-200 text-gray-600 hover:border-[#0B2B3C] hover:text-[#0B2B3C]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <BusinessAutocompleteFilter
            field="country"
            placeholder="Search more countries..."
            selected={filters.country ?? []}
            onChange={(v) => setFilters({ ...filters, country: v })}
          />
        </FilterSection>

        <FilterSection
          icon={<CategoryIcon />}
          label="Google Category"
          activeCount={filters.googleCategory?.length || undefined}
          appliedTags={tagsFor("googleCategory")}
        >
          {hasNaics && (
            <p className="text-[11px] text-amber-600 mb-2">
              Only one category filter allowed per request. Clear NAICS to use this.
            </p>
          )}
          <BusinessAutocompleteFilter
            field="google_category"
            placeholder="Search Google categories..."
            selected={filters.googleCategory ?? []}
            onChange={(v) => setFilters({ ...filters, googleCategory: v })}
            disabled={hasNaics}
          />
        </FilterSection>

        <FilterSection
          icon={<NaicsIcon />}
          label="NAICS Code"
          activeCount={filters.naicsCategory?.length || undefined}
          appliedTags={tagsFor("naicsCategory")}
        >
          {hasGoogle && (
            <p className="text-[11px] text-amber-600 mb-2">
              Only one category filter allowed per request. Clear Google Category to use this.
            </p>
          )}
          <BusinessAutocompleteFilter
            field="naics_category"
            placeholder="Search NAICS codes..."
            selected={filters.naicsCategory ?? []}
            onChange={(v) => setFilters({ ...filters, naicsCategory: v })}
            disabled={hasGoogle}
          />
        </FilterSection>
      </div>

      <div className="px-6 pb-6 flex-shrink-0">
        <button
          onClick={onGenerate}
          disabled={activeCount === 0 || isLoading}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all
            ${
              activeCount === 0
                ? "bg-[#0B2B3C] opacity-40 cursor-not-allowed"
                : "bg-[#0B2B3C] hover:bg-[#0A2230] shadow-[0_2px_8px_rgba(11,43,60,0.3)]"
            }`}
        >
          {isLoading ? "Searching..." : "Search Businesses"}
        </button>
      </div>
    </aside>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function CategoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function NaicsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}
