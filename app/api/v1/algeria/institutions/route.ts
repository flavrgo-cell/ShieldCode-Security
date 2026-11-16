import { NextResponse } from 'next/server';
import { ALGERIAN_BANKS_DATABASE } from '@/lib/algerian-registry';

/**
 * GET /api/v1/algeria/institutions
 * Public directory of Algerian Banks, Algérie Poste, and SATIM registered on ShieldCode.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    total: ALGERIAN_BANKS_DATABASE.length,
    institutions: ALGERIAN_BANKS_DATABASE,
    timestamp: Date.now(),
  });
}
