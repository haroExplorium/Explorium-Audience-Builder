import { NextRequest, NextResponse } from "next/server";
import { getHeaders } from "@/lib/explorium";

const COOKIE_NAME = "explorium_api_key";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
};

// POST /api/key — validate key then set cookie
export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    console.log("[ESCH:key] POST validate → failed (400: missing key)");
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const trimmed = apiKey.trim();

  // Validate key by hitting the autocomplete endpoint
  try {
    const res = await fetch(
      "https://api.explorium.ai/v1/prospects/autocomplete?field=country&query=unit",
      { headers: getHeaders(trimmed) }
    );
    if (!res.ok) {
      console.log("[ESCH:key] POST validate → failed (401: invalid key)");
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
  } catch {
    console.log("[ESCH:key] POST validate → failed (502: API unreachable)");
    return NextResponse.json(
      { error: "Could not reach Explorium API" },
      { status: 502 }
    );
  }

  console.log("[ESCH:key] POST validate → success");
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, trimmed, COOKIE_OPTIONS);
  return response;
}

// DELETE /api/key — clear cookie
export async function DELETE() {
  console.log("[ESCH:key] DELETE → cookie cleared");
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
