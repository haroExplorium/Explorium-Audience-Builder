import { NextRequest, NextResponse } from "next/server";
import { fetchBusinesses } from "@/lib/business";
import { getApiKey } from "@/lib/get-api-key";
import { BusinessFilterState } from "@/types/business";

export async function POST(req: NextRequest) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log("[ESCH:businesses] POST → 401: no API key");
    return NextResponse.json({ error: "API key not configured" }, { status: 401 });
  }

  const filters: BusinessFilterState = await req.json();
  const start = Date.now();
  try {
    const result = await fetchBusinesses(filters, apiKey);
    const elapsed = Date.now() - start;
    console.log(`[ESCH:businesses] POST filters=${JSON.stringify(filters)} → 200 (${result.total_results} results, ${elapsed}ms)`);
    return NextResponse.json({
      businesses: result.data,
      totalCount: result.total_results,
      responseTimeMs: elapsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[ESCH:businesses] POST → 500: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
