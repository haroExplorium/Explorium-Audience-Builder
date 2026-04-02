import { NextRequest, NextResponse } from "next/server";
import { streamProspects, enrichContacts } from "@/lib/explorium";
import { getApiKey } from "@/lib/get-api-key";
import { FilterState } from "@/types/filters";
import { Prospect } from "@/types/prospect";

const CSV_HEADERS = [
  "full_name", "first_name", "last_name", "job_title", "company_name",
  "job_department_main", "job_level_main", "country_name", "region_name",
  "city", "email", "phone", "linkedin", "company_website",
];

function toCSVRow(p: Prospect): string {
  return CSV_HEADERS
    .map((k) => {
      const v = (p as unknown as Record<string, unknown>)[k] ?? "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    })
    .join(",");
}

export async function POST(req: NextRequest) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log("[ESCH:download] POST → 401: no API key");
    return NextResponse.json({ error: "API key not configured" }, { status: 401 });
  }

  const body = await req.json();
  const filters: FilterState = body.filters ?? body;
  const limit = Math.min(Math.max(1, body.limit ?? 1000), 60000);
  console.log(`[ESCH:download] POST starting CSV stream, limit=${limit}, filters=${JSON.stringify(filters)} key=***`);
  const encoder = new TextEncoder();
  const start = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(CSV_HEADERS.join(",") + "\n"));
      let totalRows = 0;
      try {
        for await (const batch of streamProspects(filters, apiKey, limit)) {
          // Enrich batch with contact info
          const ids = batch.map((p) => p.prospect_id).filter(Boolean);
          const contacts = await enrichContacts(ids, apiKey);

          for (const p of batch) {
            const contact = contacts.get(p.prospect_id);
            const enriched = {
              ...p,
              email: contact?.email ?? "",
              phone: contact?.phone ?? "",
            };
            controller.enqueue(encoder.encode(toCSVRow(enriched) + "\n"));
          }
          totalRows += batch.length;
        }
        console.log(`[ESCH:download] POST stream complete → ${totalRows} rows (${Date.now() - start}ms)`);
      } catch (err) {
        console.log(`[ESCH:download] POST stream error after ${totalRows} rows: ${err instanceof Error ? err.message : String(err)}`);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="explorium-prospects.csv"',
    },
  });
}
