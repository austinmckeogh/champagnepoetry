import { NextResponse } from 'next/server';
import { getAllDeals, getOwners } from '@/lib/hubspot';
import { computeHygiene } from '@/lib/hygiene';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [deals, owners] = await Promise.all([getAllDeals(), getOwners()]);
    const data = computeHygiene(deals, owners);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Hygiene API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
