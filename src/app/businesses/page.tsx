"use client";
import { useState } from "react";
import { NavRail } from "@/components/layout/NavRail";
import { TopBar } from "@/components/layout/TopBar";
import { BusinessFilterPanel } from "@/components/business/BusinessFilterPanel";
import { BusinessResultsView } from "@/components/business/BusinessResultsView";
import { Business, BusinessFilterState } from "@/types/business";

interface Results {
  businesses: Business[];
  totalCount: number;
  responseTimeMs: number;
}

export default function BusinessesPage() {
  const [filters, setFilters] = useState<BusinessFilterState>({
    country: [],
    googleCategory: [],
    naicsCategory: [],
  });
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch businesses");
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA]">
      <NavRail />
      <TopBar />
      <BusinessFilterPanel
        onGenerate={handleGenerate}
        isLoading={loading}
        filters={filters}
        setFilters={setFilters}
      />

      <main className="ml-[436px] mt-[52px] h-[calc(100vh-52px)] flex flex-col">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 text-sm flex-shrink-0">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex-1 flex items-center justify-center bg-[#FAFBFC]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#0B2B3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Searching businesses...
              </p>
            </div>
          </div>
        )}
        {!loading && !results && <BusinessEmptyState />}
        {!loading && results && (
          <BusinessResultsView
            businesses={results.businesses}
            totalCount={results.totalCount}
            responseTimeMs={results.responseTimeMs}
            filters={filters}
          />
        )}
      </main>
    </div>
  );
}

function BusinessEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#FAFBFC]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E6F7F0] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#0B2B3C]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <h2 className="text-xl font-serif text-[#0B2B3C] mb-2">
          Search Businesses
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Select a location and business category to find matching companies
          from over 80 million businesses across 150+ countries.
        </p>
      </div>
    </div>
  );
}
