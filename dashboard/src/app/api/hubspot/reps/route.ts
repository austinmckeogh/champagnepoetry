import { NextResponse } from 'next/server';
import { getAllDeals, getOwners } from '@/lib/hubspot';
import { DEAL_STAGES, STAGE_TIME_LIMITS } from '@/lib/constants';
import { daysAgo } from '@/lib/format';
import type { RepMetrics, RepData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [deals, owners] = await Promise.all([getAllDeals(), getOwners()]);
    const openStageKeys: string[] = DEAL_STAGES.map((s) => s.key);

    const repMap = new Map<string, RepMetrics>();

    for (const owner of owners) {
      repMap.set(owner.id, {
        ownerId: owner.id,
        name: `${owner.firstName} ${owner.lastName}`.trim(),
        openDeals: 0,
        pipelineValue: 0,
        closedWon: 0,
        closedWonValue: 0,
        avgDealAge: 0,
        staleDeals: 0,
        hygieneIssues: 0,
      });
    }

    const dealsByOwner = new Map<string, typeof deals>();
    for (const deal of deals) {
      if (!deal.hubspot_owner_id) continue;
      const existing = dealsByOwner.get(deal.hubspot_owner_id) || [];
      existing.push(deal);
      dealsByOwner.set(deal.hubspot_owner_id, existing);
    }

    for (const [ownerId, ownerDeals] of dealsByOwner) {
      let rep = repMap.get(ownerId);
      if (!rep) {
        rep = {
          ownerId,
          name: `Owner ${ownerId}`,
          openDeals: 0,
          pipelineValue: 0,
          closedWon: 0,
          closedWonValue: 0,
          avgDealAge: 0,
          staleDeals: 0,
          hygieneIssues: 0,
        };
        repMap.set(ownerId, rep);
      }

      const openDeals = ownerDeals.filter((d) => openStageKeys.includes(d.dealstage));
      rep.openDeals = openDeals.length;
      rep.pipelineValue = openDeals.reduce((sum, d) => sum + d.amount, 0);

      const wonDeals = ownerDeals.filter((d) => d.dealstage === 'closedwon');
      rep.closedWon = wonDeals.length;
      rep.closedWonValue = wonDeals.reduce((sum, d) => sum + d.amount, 0);

      if (openDeals.length > 0) {
        rep.avgDealAge = Math.round(
          openDeals.reduce((sum, d) => sum + daysAgo(d.createdate), 0) / openDeals.length
        );
      }

      for (const deal of openDeals) {
        const limits = STAGE_TIME_LIMITS[deal.dealstage];
        if (!limits) continue;
        const lastEntry = deal.stageHistory
          ?.filter((h) => h.value === deal.dealstage)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const enteredDate = lastEntry?.timestamp || deal.createdate;
        if (daysAgo(enteredDate) > limits.warning) rep.staleDeals++;
        if (daysAgo(deal.hs_lastmodifieddate) > 7) rep.hygieneIssues++;
      }
    }

    // Filter out reps with no deals at all
    const reps = Array.from(repMap.values()).filter(
      (r) => r.openDeals > 0 || r.closedWon > 0
    );
    reps.sort((a, b) => b.pipelineValue - a.pipelineValue);

    const data: RepData = { reps };
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reps API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
