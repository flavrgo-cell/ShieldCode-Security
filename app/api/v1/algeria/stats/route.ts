import { NextResponse } from 'next/server';
import { AlgerianLiveStore } from '@/lib/db/live-store';
import { ALGERIAN_BANKS_DATABASE, ALGERIAN_TELECOM_OPERATORS } from '@/lib/algerian-registry';

/**
 * GET /api/v1/algeria/stats
 * Real-time health, statistics, and audit logs of the Algerian National ShieldCode Network.
 */
export async function GET() {
  const stats = AlgerianLiveStore.getStats();
  const recentLogs = AlgerianLiveStore.getLogs(15);
  const citizens = AlgerianLiveStore.getAllCitizens();

  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      totalBanksIntegrated: ALGERIAN_BANKS_DATABASE.length,
      totalTelecomsActive: ALGERIAN_TELECOM_OPERATORS.length,
      totalCitizensProtected: citizens.length,
    },
    registeredCitizens: citizens,
    recentLogs,
    timestamp: Date.now(),
  });
}
