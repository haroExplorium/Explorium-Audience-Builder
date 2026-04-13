"use client";
import { Business } from "@/types/business";

interface BusinessResultsViewProps {
  businesses: Business[];
  totalCount: number;
  responseTimeMs: number;
}

export function BusinessResultsView({
  businesses,
  totalCount,
  responseTimeMs,
}: BusinessResultsViewProps) {
  const displayCount = totalCount.toLocaleString();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFBFC]">
      {/* Results header */}
      <div className="bg-white border-b border-gray-200 px-7 py-5 flex items-center gap-4 flex-shrink-0">
        <span className="text-[28px] font-serif text-[#0B2B3C]">
          {displayCount}
        </span>
        <span className="text-sm text-gray-500">businesses found</span>
        <span className="text-xs text-gray-300 bg-gray-50 px-2.5 py-1 rounded-full">
          {(responseTimeMs / 1000).toFixed(2)}s
        </span>
      </div>

      {/* Preview notice */}
      <div className="bg-[#E6F7F0] px-7 py-2.5 flex items-center gap-2 text-sm text-[#065F46] flex-shrink-0">
        <InfoIcon />
        Showing a{" "}
        <strong className="font-semibold">
          preview of {businesses.length} records
        </strong>{" "}
        from {displayCount} total.
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[13px] min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Company Name",
                "Website",
                "Google Category",
                "NAICS Category",
                "Size",
                "Revenue",
                "Location",
              ].map((h) => (
                <th
                  key={h}
                  className="bg-[#F5F7FA] px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {businesses.map((b, i) => {
              const location = [b.city_name, b.region, b.country_name]
                .filter(Boolean)
                .join(", ");
              const domain = b.domain || b.website;
              return (
                <tr key={b.business_id ?? i} className="group">
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] font-semibold text-gray-900">
                    {b.name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] text-gray-600 text-xs">
                    {domain ? (
                      <a
                        href={
                          domain.startsWith("http")
                            ? domain
                            : `https://${domain}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B2B3C] hover:underline"
                      >
                        {domain}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] text-gray-700">
                    {b.google_category ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] text-gray-700">
                    {b.naics_description ?? (b.naics ? String(b.naics) : "—")}
                  </td>
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] text-gray-600">
                    {b.number_of_employees_range ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] text-gray-600">
                    {b.yearly_revenue_range ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 border-b border-gray-50 bg-white group-hover:bg-[#F0FDF4] text-gray-600">
                    {location || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
