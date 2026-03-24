import { NextResponse } from 'next/server';
import { getAllDeals, getOwners } from '@/lib/hubspot';
import { computeScorecard } from '@/lib/scorecard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [deals, owners] = await Promise.all([getAllDeals(), getOwners()]);
    const quarterlyTarget = parseInt(process.env.QUARTERLY_TARGET || '500000', 10);
    const data = computeScorecard(deals, owners, quarterlyTarget);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Scorecard API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
