import { NextResponse } from 'next/server';
import { getAllDeals } from '@/lib/hubspot';
import { computePipeline } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await getAllDeals();
    const quarterlyTarget = parseInt(process.env.QUARTERLY_TARGET || '500000', 10);
    const data = computePipeline(deals, quarterlyTarget);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Pipeline API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
