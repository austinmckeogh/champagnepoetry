export type TrafficLightColor = 'green' | 'yellow' | 'red';

export interface Deal {
  id: string;
  dealname: string;
  dealstage: string;
  pipeline: string;
  amount: number;
  hubspot_owner_id: string;
  closedate: string | null;
  createdate: string;
  hs_lastmodifieddate: string;
  num_decision_makers: string | null;
  stageHistory?: StageEntry[];
}

export interface StageEntry {
  value: string;
  timestamp: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ScorecardMetric {
  id: number;
  name: string;
  goal: number | string;
  actual: number;
  unit: string;
  color: TrafficLightColor;
  type: 'per_rep' | 'team';
  lowerIsBetter?: boolean;
}

export interface ScorecardData {
  weekLabel: string;
  metrics: ScorecardMetric[];
  repBreakdown?: Record<string, ScorecardMetric[]>;
}

export interface StageData {
  name: string;
  key: string;
  count: number;
  value: number;
  weightedValue: number;
  probability: number;
}

export interface PipelineData {
  stages: StageData[];
  totalPipeline: number;
  weightedForecast: number;
  coverageRatio: number;
  quarterlyTarget: number;
  aging: AgingBucket[];
  velocity: VelocityStage[];
}

export interface AgingBucket {
  label: string;
  count: number;
  value: number;
}

export interface VelocityStage {
  stage: string;
  avgDays: number;
  limit: number;
  color: TrafficLightColor;
}

export interface HygieneIssue {
  dealId: string;
  dealName: string;
  ownerName: string;
  type: 'stale' | 'overdue_task' | 'no_activity' | 'missing_fields';
  severity: 'warning' | 'critical';
  detail: string;
}

export interface HygieneData {
  issues: HygieneIssue[];
  summary: {
    stale: number;
    overdueTasks: number;
    noActivity: number;
    missingFields: number;
    total: number;
  };
}

export interface RepMetrics {
  ownerId: string;
  name: string;
  openDeals: number;
  pipelineValue: number;
  closedWon: number;
  closedWonValue: number;
  avgDealAge: number;
  staleDeals: number;
  hygieneIssues: number;
}

export interface RepData {
  reps: RepMetrics[];
}
