"use client";
import { useState, useCallback, Suspense } from "react";
import { useQueryStates } from "nuqs";
import { filterParamsParsers } from "@/lib/filter-params";
import { NavRail } from "@/components/layout/NavRail";
import { TopBar } from "@/components/layout/TopBar";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { EmptyState } from "@/components/EmptyState";
import { ResultsView } from "@/components/ResultsView";
import { FilterState } from "@/types/filters";
import { Prospect } from "@/types/prospect";

interface Results {
  prospects: Prospect[];
  totalCount: number;
  responseTimeMs: number;
}

function HomePageContent() {
  const [filters] = useQueryStates(filterParamsParsers);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters as FilterState),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch prospects");
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA]">
      <NavRail />
      <TopBar />
      <FilterPanel
        onGenerate={handleGenerate}
        isLoading={loading}
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
              <div className="w-8 h-8 border-2 border-[#1A73E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Finding matching prospects...</p>
            </div>
          </div>
        )}
        {!loading && !results && <EmptyState />}
        {!loading && results && (
          <ResultsView
            prospects={results.prospects}
            totalCount={results.totalCount}
            responseTimeMs={results.responseTimeMs}
            filters={filters as FilterState}
          />
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
