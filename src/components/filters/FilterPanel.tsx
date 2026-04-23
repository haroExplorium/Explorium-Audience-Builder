"use client";
import { useQueryStates } from "nuqs";
import { filterParamsParsers } from "@/lib/filter-params";
import { FilterSection } from "./FilterSection";
import { ChipFilter } from "./ChipFilter";
import { AutocompleteFilter } from "./AutocompleteFilter";
import { MANAGEMENT_LEVELS, REVENUE_RANGES, EMPLOYEE_RANGES } from "@/types/filters";

interface FilterPanelProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export function FilterPanel({ onGenerate, isLoading }: FilterPanelProps) {
  const [filters, setFilters] = useQueryStates(filterParamsParsers, {
    shallow: false,
  });

  const activeCount =
    [
      filters.country,
      filters.industry,
      filters.revenue,
      filters.region,
      filters.employees,
      filters.managementLevel,
      filters.jobTitle,
      filters.department,
      filters.companyName,
      filters.businessId,
    ].filter((v) => Array.isArray(v) && v.length > 0).length +
    (filters.hasEmail ? 1 : 0) +
    (filters.hasPhone ? 1 : 0);

  const tagsFor = (key: keyof typeof filters) => {
    const val = filters[key];
    if (!Array.isArray(val)) return [];
    return (val as string[]).map((v) => ({
      label: v,
      onRemove: () =>
        setFilters({ [key]: (val as string[]).filter((x) => x !== v) } as Parameters<typeof setFilters>[0]),
    }));
  };

  const setArr = (key: string, v: string[]) =>
    setFilters({ [key]: v } as Parameters<typeof setFilters>[0]);

  return (
    <aside className="fixed left-14 top-[52px] bottom-0 w-[380px] bg-white border-r border-gray-200 z-30 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <span className="text-[15px] font-semibold text-gray-900">
          Select criteria to generate an audience
        </span>
        {activeCount > 0 && (
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <span className="bg-[#0B2B3C] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
            <button
              onClick={() => setFilters({
                country: [],
                region: [],
                industry: [],
                revenue: [],
                employees: [],
                companyName: [],
                businessId: [],
                managementLevel: [],
                jobTitle: [],
                department: [],
                hasEmail: false,
                hasPhone: false,
              })}
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
                  setArr(
                    "country",
                    current.includes(opt.value)
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value]
                  );
                }}
                className={`px-3 py-1 border rounded-full text-xs cursor-pointer transition-all
                  ${(filters.country ?? []).includes(opt.value)
                    ? "bg-[#E6F7F0] border-[#0B2B3C] text-[#0B2B3C] font-medium"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#0B2B3C] hover:text-[#0B2B3C]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <AutocompleteFilter
            field="country"
            placeholder="Search more countries..."
            selected={filters.country ?? []}
            onChange={(v) => setArr("country", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<RegionIcon />}
          label="Region / State"
          activeCount={filters.region?.length || undefined}
          appliedTags={tagsFor("region")}
        >
          <AutocompleteFilter
            field="region_country_code"
            placeholder="Search states or regions..."
            selected={filters.region ?? []}
            onChange={(v) => setArr("region", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<IndustryIcon />}
          label="Industry"
          activeCount={filters.industry?.length || undefined}
          appliedTags={tagsFor("industry")}
        >
          <AutocompleteFilter
            field="linkedin_category"
            placeholder="Search industries..."
            selected={filters.industry ?? []}
            onChange={(v) => setArr("industry", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<RevenueIcon />}
          label="Revenue"
          activeCount={filters.revenue?.length || undefined}
          appliedTags={tagsFor("revenue")}
        >
          <ChipFilter
            options={REVENUE_RANGES}
            selected={filters.revenue ?? []}
            onChange={(v) => setArr("revenue", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<EmployeesIcon />}
          label="Number of employees"
          activeCount={filters.employees?.length || undefined}
          appliedTags={tagsFor("employees")}
        >
          <ChipFilter
            options={EMPLOYEE_RANGES}
            selected={filters.employees ?? []}
            onChange={(v) => setArr("employees", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<BuildingIcon />}
          label="Company name"
          activeCount={filters.companyName?.length || undefined}
          appliedTags={tagsFor("companyName")}
        >
          <AutocompleteFilter
            field="company_name"
            placeholder="Search companies..."
            selected={filters.companyName ?? []}
            onChange={(v) => setArr("companyName", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<IdIcon />}
          label="Business ID"
          activeCount={filters.businessId?.length || undefined}
          appliedTags={tagsFor("businessId")}
        >
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Paste a business ID..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B2B3C] focus:ring-2 focus:ring-[#0B2B3C]/10 font-mono placeholder:font-sans placeholder:text-gray-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !(filters.businessId ?? []).includes(val)) {
                    setArr("businessId", [...(filters.businessId ?? []), val]);
                  }
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Press Enter to add. Get IDs from the Business search tab.
          </p>
        </FilterSection>

        <FilterSection
          icon={<LevelIcon />}
          label="Management level"
          activeCount={filters.managementLevel?.length || undefined}
          appliedTags={tagsFor("managementLevel")}
        >
          <ChipFilter
            options={MANAGEMENT_LEVELS}
            selected={filters.managementLevel ?? []}
            onChange={(v) => setArr("managementLevel", v)}
          />
        </FilterSection>

        <FilterSection
          icon={<TitleIcon />}
          label="Job title"
          activeCount={filters.jobTitle?.length || undefined}
          appliedTags={tagsFor("jobTitle")}
        >
          <AutocompleteFilter
            field="job_title"
            placeholder="Search job titles..."
            selected={filters.jobTitle ?? []}
            onChange={(v) => setArr("jobTitle", v)}
          />
          <label className="flex items-center gap-2 mt-2 text-[12px] text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includeRelatedTitles !== false}
              onChange={(e) => setFilters({ includeRelatedTitles: e.target.checked })}
              className="w-3.5 h-3.5 accent-[#0B2B3C]"
            />
            Include related job titles
          </label>
        </FilterSection>

        <FilterSection
          icon={<DeptIcon />}
          label="Department"
          activeCount={filters.department?.length || undefined}
          appliedTags={tagsFor("department")}
        >
          <AutocompleteFilter
            field="job_department"
            placeholder="Search departments..."
            selected={filters.department ?? []}
            onChange={(v) => setArr("department", v)}
          />
        </FilterSection>

      </div>

      <div className="px-6 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
        {(
          [
            { key: "hasEmail" as const, label: "Include only contacts with an email" },
            { key: "hasPhone" as const, label: "Include only contacts with a phone number" },
          ] as const
        ).map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-2.5 py-1.5 text-[13px] text-gray-600 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!filters[key]}
              onChange={(e) => setFilters({ [key]: e.target.checked })}
              className="w-4 h-4 accent-[#0B2B3C]"
            />
            {label}
          </label>
        ))}
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
          {isLoading ? "Generating..." : "Generate Audience"}
        </button>
      </div>
    </aside>
  );
}

function LocationIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function RegionIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6l9 4 9-4"/><path d="M3 6v12l9 4 9-4V6"/><path d="M12 10v12"/></svg>;
}
function IndustryIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
}
function RevenueIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
}
function EmployeesIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
}
function KeywordIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IdIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="14" y2="12"/><line x1="6" y1="16" x2="10" y2="16"/></svg>;
}
function BuildingIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/></svg>;
}
function LevelIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
}
function TitleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
}
function DeptIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>;
}
function SkillsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>;
}
