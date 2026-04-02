// SERVER-SIDE ONLY. Never import this in client components.

import type { FilterState } from "@/types/filters";
import type { ProspectsApiResponse, Prospect } from "@/types/prospect";

const BASE_URL = "https://api.explorium.ai/v1";

export function getHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "api_key": apiKey,
  };
}

function hasValue(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

export function buildProspectFilters(filters: FilterState): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  // Geographic filters — {"values": [...]}
  if (hasValue(filters.country)) {
    body["country_code"] = { values: filters.country };
  }
  // Industry — {"values": [...]}
  if (hasValue(filters.industry)) {
    body["linkedin_category"] = { values: filters.industry };
  }
  // Company filters — {"values": [...]}
  if (hasValue(filters.revenue)) {
    body["company_revenue"] = { values: filters.revenue };
  }
  if (hasValue(filters.employees)) {
    body["company_size"] = { values: filters.employees };
  }
  if (hasValue(filters.companyName)) {
    body["company_name"] = { values: filters.companyName };
  }
  // Professional filters — {"values": [...]}
  if (hasValue(filters.managementLevel)) {
    body["job_level"] = { values: filters.managementLevel };
  }
  if (hasValue(filters.jobTitle)) {
    body["job_title"] = { values: filters.jobTitle };
  }
  if (hasValue(filters.department)) {
    body["job_department"] = { values: filters.department };
  }
  // Contact availability — {"value": true}
  if (filters.hasEmail) {
    body["has_email"] = { value: true };
  }
  if (filters.hasPhone) {
    body["has_phone_number"] = { value: true };
  }

  return body;
}

export async function fetchProspectSample(
  filters: FilterState,
  apiKey: string
): Promise<ProspectsApiResponse> {
  const start = Date.now();
  const response = await fetch(`${BASE_URL}/prospects`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      mode: "full",
      page: 1,
      page_size: 10,
      filters: buildProspectFilters(filters),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(`[ESCH:explorium] POST /v1/prospects → ${response.status}: ${text}`);
    throw new Error(`Explorium API error ${response.status}: ${text}`);
  }

  const data = await response.json() as ProspectsApiResponse;
  console.log(`[ESCH:explorium] POST /v1/prospects page=1 page_size=10 → ${response.status} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  return data;
}

export async function* streamProspects(
  filters: FilterState,
  apiKey: string,
  maxRecords = 10_000
): AsyncGenerator<Prospect[]> {
  let fetched = 0;
  let page = 1;

  while (fetched < maxRecords) {
    const pageSize = Math.min(100, maxRecords - fetched);
    const start = Date.now();

    const response = await fetch(`${BASE_URL}/prospects`, {
      method: "POST",
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        mode: "full",
        page,
        page_size: pageSize,
        filters: buildProspectFilters(filters),
      }),
    });

    if (!response.ok) {
      console.log(`[ESCH:explorium] POST /v1/prospects page=${page} → ${response.status}: ${response.statusText}`);
      throw new Error(`Explorium API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ProspectsApiResponse;
    const batch = data.data ?? [];
    console.log(`[ESCH:explorium] POST /v1/prospects page=${page} page_size=${pageSize} → ${response.status} (${batch.length} rows, ${((Date.now() - start) / 1000).toFixed(1)}s)`);

    if (batch.length === 0) break;

    yield batch;
    fetched += batch.length;

    if (batch.length < pageSize) break; // last page
    page++;
  }
}

export async function fetchAutocomplete(
  field: string,
  query: string,
  apiKey: string
): Promise<{ label: string; value: string }[]> {
  try {
    const url = new URL(`${BASE_URL}/prospects/autocomplete`);
    url.searchParams.set("field", field);
    url.searchParams.set("query", query);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      console.log(`[ESCH:explorium] GET /v1/prospects/autocomplete?field=${field}&query=${query} → ${response.status}`);
      return [];
    }

    const data = await response.json();
    // API returns array of {query, label, value}
    if (Array.isArray(data)) {
      console.log(`[ESCH:explorium] GET /v1/prospects/autocomplete?field=${field}&query=${query} → 200 (${data.length} results)`);
      return data.map((item: { label: string; value: string }) => ({
        label: item.label,
        value: item.value,
      }));
    }
    return [];
  } catch (err) {
    console.log(`[ESCH:explorium] GET /v1/prospects/autocomplete?field=${field}&query=${query} → error: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

interface EnrichmentResult {
  prospect_id: string;
  data: {
    emails?: { address: string; type: string }[];
    professions_email?: string;
    phone_numbers?: { phone_number: string }[];
    mobile_phone?: string;
  };
}

interface EnrichmentResponse {
  data: EnrichmentResult[];
}

export async function enrichContacts(
  prospectIds: string[],
  apiKey: string
): Promise<Map<string, { email: string; phone: string }>> {
  const contactMap = new Map<string, { email: string; phone: string }>();
  if (prospectIds.length === 0) return contactMap;

  // Process in chunks of 50 (API limit)
  for (let i = 0; i < prospectIds.length; i += 50) {
    const chunk = prospectIds.slice(i, i + 50);
    const start = Date.now();

    try {
      const response = await fetch(`${BASE_URL}/prospects/contacts_information/bulk_enrich`, {
        method: "POST",
        headers: getHeaders(apiKey),
        body: JSON.stringify({ prospect_ids: chunk }),
      });

      if (!response.ok) {
        console.log(`[ESCH:explorium] POST /v1/prospects/contacts_information/bulk_enrich → ${response.status} (${chunk.length} IDs)`);
        continue;
      }

      const result = (await response.json()) as EnrichmentResponse;
      console.log(`[ESCH:explorium] POST /v1/prospects/contacts_information/bulk_enrich → 200 (${chunk.length} IDs, ${((Date.now() - start) / 1000).toFixed(1)}s)`);

      for (const item of result.data ?? []) {
        const email =
          item.data?.professions_email ??
          item.data?.emails?.find((e) => e.type === "professional")?.address ??
          item.data?.emails?.[0]?.address ??
          "";
        const phone =
          item.data?.mobile_phone ??
          item.data?.phone_numbers?.[0]?.phone_number ??
          "";
        contactMap.set(item.prospect_id, { email, phone });
      }
    } catch (err) {
      console.log(`[ESCH:explorium] POST bulk_enrich error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return contactMap;
}
