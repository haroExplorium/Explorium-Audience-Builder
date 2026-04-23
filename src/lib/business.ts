// SERVER-SIDE ONLY. Never import this in client components.

import type { Business, BusinessFilterState, BusinessApiResponse } from "@/types/business";
import { getHeaders } from "./explorium";

const BASE_URL = "https://api.explorium.ai/v1";

function hasValue(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

export function buildBusinessFilters(filters: BusinessFilterState): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (hasValue(filters.country)) {
    body["country_code"] = { values: filters.country };
  }
  // Only one category filter allowed per request
  if (hasValue(filters.googleCategory)) {
    body["google_category"] = { values: filters.googleCategory };
  } else if (hasValue(filters.naicsCategory)) {
    body["naics_category"] = { values: filters.naicsCategory };
  }
  if (hasValue(filters.employees)) {
    body["company_size"] = { values: filters.employees };
  }
  if (hasValue(filters.revenue)) {
    body["company_revenue"] = { values: filters.revenue };
  }

  return body;
}

export async function fetchBusinesses(
  filters: BusinessFilterState,
  apiKey: string
): Promise<BusinessApiResponse> {
  const start = Date.now();
  const response = await fetch(`${BASE_URL}/businesses`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      mode: "full",
      page: 1,
      page_size: 10,
      filters: buildBusinessFilters(filters),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(`[ESCH:businesses] POST /v1/businesses → ${response.status}: ${text}`);
    throw new Error(`Explorium API error ${response.status}: ${text}`);
  }

  const data = await response.json() as BusinessApiResponse;
  console.log(`[ESCH:businesses] POST /v1/businesses page=1 page_size=10 → ${response.status} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  return data;
}

export async function fetchBusinessAutocomplete(
  field: string,
  query: string,
  apiKey: string
): Promise<{ label: string; value: string }[]> {
  try {
    const url = new URL(`${BASE_URL}/businesses/autocomplete`);
    url.searchParams.set("field", field);
    url.searchParams.set("query", query);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      console.log(`[ESCH:businesses] GET /v1/businesses/autocomplete?field=${field}&query=${query} → ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      console.log(`[ESCH:businesses] GET /v1/businesses/autocomplete?field=${field}&query=${query} → 200 (${data.length} results)`);
      return data.map((item: { label: string; value: string }) => ({
        label: item.label,
        value: item.value,
      }));
    }
    return [];
  } catch (err) {
    console.log(`[ESCH:businesses] GET /v1/businesses/autocomplete error: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

export async function* streamBusinesses(
  filters: BusinessFilterState,
  apiKey: string,
  maxRecords = 10_000
): AsyncGenerator<Business[]> {
  let fetched = 0;
  let page = 1;

  while (fetched < maxRecords) {
    const pageSize = Math.min(100, maxRecords - fetched);
    const start = Date.now();

    const response = await fetch(`${BASE_URL}/businesses`, {
      method: "POST",
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        mode: "full",
        page,
        page_size: pageSize,
        filters: buildBusinessFilters(filters),
      }),
    });

    if (!response.ok) {
      console.log(`[ESCH:businesses] POST /v1/businesses page=${page} → ${response.status}: ${response.statusText}`);
      throw new Error(`Explorium API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as BusinessApiResponse;
    const batch = data.data ?? [];
    console.log(`[ESCH:businesses] POST /v1/businesses page=${page} page_size=${pageSize} → ${response.status} (${batch.length} rows, ${((Date.now() - start) / 1000).toFixed(1)}s)`);

    if (batch.length === 0) break;

    yield batch;
    fetched += batch.length;

    if (batch.length < pageSize) break;
    page++;
  }
}
