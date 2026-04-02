// SERVER-SIDE ONLY.
import { cookies } from "next/headers";

export async function getApiKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get("explorium_api_key")?.value ||
    process.env.EXPLORIUM_API_KEY ||
    null
  );
}
