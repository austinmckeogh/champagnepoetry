import type { Deal, Owner, HygieneData, HygieneIssue } from './types';
import { DEAL_STAGES, STAGE_TIME_LIMITS, REQUIRED_FIELDS_BY_STAGE } from './constants';
import { daysAgo } from './format';

export function computeHygiene(deals: Deal[], owners: Owner[]): HygieneData {
  const ownerMap = new Map(owners.map((o) => [o.id, `${o.firstName} ${o.lastName}`.trim()]));
  const openStageKeys: string[] = DEAL_STAGES.map((s) => s.key);
  const openDeals = deals.filter((d) => openStageKeys.includes(d.dealstage));
  const issues: HygieneIssue[] = [];

  for (const deal of openDeals) {
    const ownerName = ownerMap.get(deal.hubspot_owner_id) || 'Unassigned';

    // Stale deals
    const limits = STAGE_TIME_LIMITS[deal.dealstage];
    if (limits) {
      const lastEntry = deal.stageHistory
        ?.filter((h) => h.value === deal.dealstage)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const enteredDate = lastEntry?.timestamp || deal.createdate;
      const days = daysAgo(enteredDate);
      if (days > limits.critical) {
        issues.push({
          dealId: deal.id,
          dealName: deal.dealname,
          ownerName,
          type: 'stale',
          severity: 'critical',
          detail: `Stuck in ${deal.dealstage} for ${days}d (critical: ${limits.critical}d)`,
        });
      } else if (days > limits.warning) {
        issues.push({
          dealId: deal.id,
          dealName: deal.dealname,
          ownerName,
          type: 'stale',
          severity: 'warning',
          detail: `In ${deal.dealstage} for ${days}d (warning: ${limits.warning}d)`,
        });
      }
    }

    // No recent activity (7+ days since last modified)
    if (daysAgo(deal.hs_lastmodifieddate) > 7) {
      issues.push({
        dealId: deal.id,
        dealName: deal.dealname,
        ownerName,
        type: 'no_activity',
        severity: daysAgo(deal.hs_lastmodifieddate) > 14 ? 'critical' : 'warning',
        detail: `No activity for ${daysAgo(deal.hs_lastmodifieddate)}d`,
      });
    }

    // Missing required fields
    const requiredFields = REQUIRED_FIELDS_BY_STAGE[deal.dealstage];
    if (requiredFields) {
      const missing: string[] = [];
      for (const field of requiredFields) {
        const value = (deal as unknown as Record<string, unknown>)[field];
        if (value === null || value === undefined || value === '' || value === '0') {
          missing.push(field);
        }
      }
      if (missing.length > 0) {
        issues.push({
          dealId: deal.id,
          dealName: deal.dealname,
          ownerName,
          type: 'missing_fields',
          severity: 'warning',
          detail: `Missing: ${missing.join(', ')}`,
        });
      }
    }
  }

  const summary = {
    stale: issues.filter((i) => i.type === 'stale').length,
    overdueTasks: issues.filter((i) => i.type === 'overdue_task').length,
    noActivity: issues.filter((i) => i.type === 'no_activity').length,
    missingFields: issues.filter((i) => i.type === 'missing_fields').length,
    total: issues.length,
  };

  return { issues, summary };
}
