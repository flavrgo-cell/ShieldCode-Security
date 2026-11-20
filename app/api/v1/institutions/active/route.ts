import { NextResponse } from "next/server";
import { listActiveInstitutions } from "@/lib/supabase/db";

/**
 * GET /api/v1/institutions/active
 * Returns the live list of Algerian Financial and Postal Institutions from Supabase
 * (with automatic fallback to the official Algerian clearing directory when unconfigured).
 */
export async function GET() {
  const { source, institutions } = await listActiveInstitutions();

  return NextResponse.json(
    {
      source,
      count: institutions.length,
      institutions,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    }
  );
}
