import { NextRequest, NextResponse } from "next/server";
import { streamBusinesses } from "@/lib/business";
import { getApiKey } from "@/lib/get-api-key";
import { BusinessFilterState } from "@/types/business";
import { Business } from "@/types/business";

const CSV_HEADERS = [
  "name", "domain", "website", "country_name", "region", "city_name",
  "google_category", "naics", "naics_description", "sic_code",
  "sic_code_description", "number_of_employees_range",
  "yearly_revenue_range", "linkedin_profile", "business_description",
];

function toCSVRow(b: Business): string {
  return CSV_HEADERS
    .map((k) => {
      const v = (b as unknown as Record<string, unknown>)[k] ?? "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    })
    .join(",");
}

export async function POST(req: NextRequest) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log("[ESCH:businesses:download] POST → 401: no API key");
    return NextResponse.json({ error: "API key not configured" }, { status: 401 });
  }

  const body = await req.json();
  const filters: BusinessFilterState = body.filters ?? body;
  const limit = Math.min(Math.max(1, body.limit ?? 1000), 60000);
  console.log(`[ESCH:businesses:download] POST starting CSV stream, limit=${limit}, filters=${JSON.stringify(filters)}`);
  const encoder = new TextEncoder();
  const start = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(CSV_HEADERS.join(",") + "\n"));
      let totalRows = 0;
      try {
        for await (const batch of streamBusinesses(filters, apiKey, limit)) {
          for (const b of batch) {
            controller.enqueue(encoder.encode(toCSVRow(b) + "\n"));
          }
          totalRows += batch.length;
        }
        console.log(`[ESCH:businesses:download] POST stream complete → ${totalRows} rows (${Date.now() - start}ms)`);
      } catch (err) {
        console.log(`[ESCH:businesses:download] POST stream error after ${totalRows} rows: ${err instanceof Error ? err.message : String(err)}`);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="explorium-businesses.csv"',
    },
  });
}
