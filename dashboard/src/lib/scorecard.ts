import type { Deal, Owner, ScorecardData, ScorecardMetric, TrafficLightColor } from './types';
import { DEAL_STAGES, STAGE_TIME_LIMITS, EOS_METRICS } from './constants';
import { daysAgo } from './format';

function getWeekBounds(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay();
  // If Monday, use previous week
  const offset = day === 1 ? 7 : day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - offset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const label = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return { start: monday, end: sunday, label };
}

function trafficLight(actual: number, goal: number, lowerIsBetter?: boolean): TrafficLightColor {
  if (lowerIsBetter) {
    if (actual <= goal) return 'green';
    if (actual <= goal * 1.2 + 1) return 'yellow'; // +1 to handle goal=0
    return 'red';
  }
  if (goal === 0) return 'green';
  const ratio = actual / goal;
  if (ratio >= 1) return 'green';
  if (ratio >= 0.8) return 'yellow';
  return 'red';
}

export function computeScorecard(
  deals: Deal[],
  owners: Owner[],
  quarterlyTarget: number
): ScorecardData {
  const { start, end, label } = getWeekBounds();
  const weeklyTarget = quarterlyTarget / 13;

  const openStageKeys: string[] = DEAL_STAGES.map((s) => s.key);
  const openDeals = deals.filter((d) => openStageKeys.includes(d.dealstage));

  // Stale deal count
  let staleDealCount = 0;
  for (const deal of openDeals) {
    const limits = STAGE_TIME_LIMITS[deal.dealstage];
    if (!limits) continue;
    const lastEntry = deal.stageHistory
      ?.filter((h) => h.value === deal.dealstage)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const enteredDate = lastEntry?.timestamp || deal.createdate;
    if (daysAgo(enteredDate) > limits.warning) staleDealCount++;
  }

  // Pipeline velocity — average days in current stage across all open deals
  let totalDaysInStage = 0;
  let countForVelocity = 0;
  for (const deal of openDeals) {
    const lastEntry = deal.stageHistory
      ?.filter((h) => h.value === deal.dealstage)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const enteredDate = lastEntry?.timestamp || deal.createdate;
    totalDaysInStage += daysAgo(enteredDate);
    countForVelocity++;
  }
  const avgVelocity = countForVelocity > 0 ? totalDaysInStage / countForVelocity : 0;

  // Deals created this week (pipeline created)
  const pipelineCreated = deals
    .filter((d) => {
      const created = new Date(d.createdate);
      return created >= start && created <= end;
    })
    .reduce((sum, d) => sum + d.amount, 0);

  // Closed won this week
  const closedWonDeals = deals.filter((d) => {
    if (d.dealstage !== 'closedwon') return false;
    const lastStageChange = d.stageHistory
      ?.filter((h) => h.value === 'closedwon')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (!lastStageChange) return false;
    const changed = new Date(lastStageChange.timestamp);
    return changed >= start && changed <= end;
  });
  const closedWonValue = closedWonDeals.reduce((sum, d) => sum + d.amount, 0);

  // Win rate — closed won / (closed won + closed lost) in the period
  const closedLostThisWeek = deals.filter((d) => {
    if (d.dealstage !== 'closedlost') return false;
    const lastStageChange = d.stageHistory
      ?.filter((h) => h.value === 'closedlost')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (!lastStageChange) return false;
    const changed = new Date(lastStageChange.timestamp);
    return changed >= start && changed <= end;
  });
  const totalClosed = closedWonDeals.length + closedLostThisWeek.length;
  const winRate = totalClosed > 0 ? (closedWonDeals.length / totalClosed) * 100 : 0;

  const metrics: ScorecardMetric[] = [
    { id: 1, name: 'Outbound Touches', goal: 100, actual: 0, unit: '#', color: 'yellow', type: 'per_rep' },
    { id: 2, name: 'New Conversations', goal: 15, actual: 0, unit: '#', color: 'yellow', type: 'per_rep' },
    { id: 3, name: 'Discovery Meetings Set', goal: 5, actual: 0, unit: '#', color: 'yellow', type: 'per_rep' },
    { id: 4, name: 'Discovery Meetings Held', goal: 4, actual: 0, unit: '#', color: 'yellow', type: 'per_rep' },
    { id: 5, name: 'Proposals Sent', goal: 2, actual: 0, unit: '#', color: 'yellow', type: 'per_rep' },
    {
      id: 6,
      name: 'Pipeline Created ($)',
      goal: weeklyTarget,
      actual: pipelineCreated,
      unit: '$',
      color: trafficLight(pipelineCreated, weeklyTarget),
      type: 'team',
    },
    {
      id: 7,
      name: 'Pipeline Velocity',
      goal: 14,
      actual: Math.round(avgVelocity),
      unit: 'days',
      color: trafficLight(avgVelocity, 14, true),
      type: 'team',
      lowerIsBetter: true,
    },
    {
      id: 8,
      name: 'Stale Deal Count',
      goal: 0,
      actual: staleDealCount,
      unit: '#',
      color: trafficLight(staleDealCount, 0, true),
      type: 'team',
      lowerIsBetter: true,
    },
    { id: 9, name: 'Task Completion %', goal: 90, actual: 0, unit: '%', color: 'yellow', type: 'per_rep' },
    { id: 10, name: 'Activity Log Rate', goal: 95, actual: 0, unit: '%', color: 'yellow', type: 'per_rep' },
    {
      id: 11,
      name: 'Closed Won ($)',
      goal: weeklyTarget,
      actual: closedWonValue,
      unit: '$',
      color: trafficLight(closedWonValue, weeklyTarget),
      type: 'team',
    },
    {
      id: 12,
      name: 'Win Rate',
      goal: 25,
      actual: Math.round(winRate * 10) / 10,
      unit: '%',
      color: trafficLight(winRate, 25),
      type: 'team',
    },
  ];

  return { weekLabel: label, metrics };
}
