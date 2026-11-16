import { NextResponse } from 'next/server';
import { ALGERIAN_TELECOM_OPERATORS } from '@/lib/algerian-registry';

/**
 * GET /api/v1/algeria/telecoms
 * Live registry of Algerian Mobile Telecom Operators (Mobilis, Djezzy, Ooredoo).
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    total: ALGERIAN_TELECOM_OPERATORS.length,
    operators: ALGERIAN_TELECOM_OPERATORS,
    timestamp: Date.now(),
  });
}
