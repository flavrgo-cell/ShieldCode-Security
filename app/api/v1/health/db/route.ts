import { NextResponse } from "next/server";
import { getDbHealthStatus } from "@/lib/supabase/db";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

/**
 * GET /api/v1/health/db
 * Reports live Supabase PostgreSQL connectivity and Algerian table counts.
 */
export async function GET() {
  const status = await getDbHealthStatus();
  return NextResponse.json(status, {
    status: 200,
    headers: NO_STORE_HEADERS,
  });
}
