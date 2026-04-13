import { NextRequest, NextResponse } from "next/server";
import { fetchBusinessAutocomplete } from "@/lib/business";
import { getApiKey } from "@/lib/get-api-key";

export async function GET(req: NextRequest) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log("[ESCH:businesses:autocomplete] GET → empty (no API key)");
    return NextResponse.json({ results: [] });
  }

  const field = req.nextUrl.searchParams.get("field") ?? "";
  const query = req.nextUrl.searchParams.get("query") ?? "";

  if (!field || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = await fetchBusinessAutocomplete(field, query, apiKey);
  console.log(`[ESCH:businesses:autocomplete] GET field=${field} query=${query} → ${results.length} results`);
  return NextResponse.json({ results });
}
