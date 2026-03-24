import type { Deal, PipelineData, StageData, AgingBucket, VelocityStage, TrafficLightColor } from './types';
import { DEAL_STAGES, STAGE_PROBABILITIES, STAGE_TIME_LIMITS, AGING_BUCKETS } from './constants';
import { daysAgo } from './format';

export function computePipeline(deals: Deal[], quarterlyTarget: number): PipelineData {
  const openStageKeys: string[] = DEAL_STAGES.map((s) => s.key);
  const openDeals = deals.filter((d) => openStageKeys.includes(d.dealstage));

  // Stages
  const stages: StageData[] = DEAL_STAGES.map((stage) => {
    const stageDeals = openDeals.filter((d) => d.dealstage === stage.key);
    const value = stageDeals.reduce((sum, d) => sum + d.amount, 0);
    const prob = STAGE_PROBABILITIES[stage.key] || 0;
    return {
      name: stage.name,
      key: stage.key,
      count: stageDeals.length,
      value,
      weightedValue: value * prob,
      probability: prob,
    };
  });

  const totalPipeline = stages.reduce((sum, s) => sum + s.value, 0);
  const weightedForecast = stages.reduce((sum, s) => sum + s.weightedValue, 0);
  const coverageRatio = quarterlyTarget > 0 ? totalPipeline / quarterlyTarget : 0;

  // Aging
  const aging: AgingBucket[] = AGING_BUCKETS.map((bucket) => {
    const matching = openDeals.filter((d) => {
      const age = daysAgo(d.createdate);
      return age >= bucket.min && age <= bucket.max;
    });
    return {
      label: bucket.label,
      count: matching.length,
      value: matching.reduce((sum, d) => sum + d.amount, 0),
    };
  });

  // Velocity — average days in current stage per stage
  const velocity: VelocityStage[] = DEAL_STAGES.map((stage) => {
    const stageDeals = openDeals.filter((d) => d.dealstage === stage.key);
    let totalDays = 0;
    for (const deal of stageDeals) {
      const lastEntry = deal.stageHistory
        ?.filter((h) => h.value === deal.dealstage)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const enteredDate = lastEntry?.timestamp || deal.createdate;
      totalDays += daysAgo(enteredDate);
    }
    const avgDays = stageDeals.length > 0 ? totalDays / stageDeals.length : 0;
    const limit = STAGE_TIME_LIMITS[stage.key]?.warning || 14;
    let color: TrafficLightColor = 'green';
    if (avgDays > limit) color = 'red';
    else if (avgDays > limit * 0.7) color = 'yellow';

    return { stage: stage.name, avgDays: Math.round(avgDays), limit, color };
  });

  return { stages, totalPipeline, weightedForecast, coverageRatio, quarterlyTarget, aging, velocity };
}
