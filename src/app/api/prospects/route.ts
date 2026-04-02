import { NextRequest, NextResponse } from "next/server";
import { fetchProspectSample, enrichContacts } from "@/lib/explorium";
import { getApiKey } from "@/lib/get-api-key";
import { FilterState } from "@/types/filters";

export async function POST(req: NextRequest) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log("[ESCH:prospects] POST → 401: no API key");
    return NextResponse.json({ error: "API key not configured" }, { status: 401 });
  }

  const filters: FilterState = await req.json();
  const start = Date.now();
  try {
    const result = await fetchProspectSample(filters, apiKey);

    // Enrich sample with contact info (emails/phones)
    const ids = result.data.map((p) => p.prospect_id).filter(Boolean);
    const contacts = await enrichContacts(ids, apiKey);

    const enrichedProspects = result.data.map((p) => {
      const contact = contacts.get(p.prospect_id);
      return {
        ...p,
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
      };
    });

    const elapsed = Date.now() - start;
    console.log(`[ESCH:prospects] POST filters=${JSON.stringify(filters)} key=*** → 200 (${result.total_results} results, ${elapsed}ms, enriched=${contacts.size})`);
    return NextResponse.json({
      prospects: enrichedProspects,
      totalCount: result.total_results,
      responseTimeMs: elapsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[ESCH:prospects] POST → 500: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
