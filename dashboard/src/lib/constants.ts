export const DASHBOARD_SLUG = 'sb-exec-7f3k9x2m';

export const DEAL_STAGES = [
  { name: 'Lead Identified', key: 'leadidentified' },
  { name: 'Outreach Initiated', key: 'outreachinitiated' },
  { name: 'Discovery Meeting', key: 'discoverymeeting' },
  { name: 'Needs Analysis', key: 'needsanalysis' },
  { name: 'Proposal/Demo', key: 'proposaldemo' },
  { name: 'Negotiation', key: 'negotiation' },
] as const;

export const CLOSED_STAGES = [
  { name: 'Closed Won', key: 'closedwon' },
  { name: 'Closed Lost', key: 'closedlost' },
] as const;

export const STAGE_TIME_LIMITS: Record<string, { warning: number; critical: number }> = {
  leadidentified: { warning: 3, critical: 6 },
  outreachinitiated: { warning: 7, critical: 14 },
  discoverymeeting: { warning: 14, critical: 28 },
  needsanalysis: { warning: 14, critical: 28 },
  proposaldemo: { warning: 21, critical: 42 },
  negotiation: { warning: 30, critical: 60 },
};

export const STAGE_PROBABILITIES: Record<string, number> = {
  leadidentified: 0.05,
  outreachinitiated: 0.1,
  discoverymeeting: 0.2,
  needsanalysis: 0.4,
  proposaldemo: 0.6,
  negotiation: 0.8,
};

export const REQUIRED_FIELDS_BY_STAGE: Record<string, string[]> = {
  leadidentified: ['dealname', 'amount'],
  outreachinitiated: ['dealname', 'amount'],
  discoverymeeting: ['dealname', 'amount', 'closedate'],
  needsanalysis: ['dealname', 'amount', 'closedate'],
  proposaldemo: ['dealname', 'amount', 'closedate', 'num_decision_makers'],
  negotiation: ['dealname', 'amount', 'closedate', 'num_decision_makers'],
};

export const COVERAGE_THRESHOLDS = { green: 3, yellow: 2 };

export const AGING_BUCKETS = [
  { label: '0–30 days', min: 0, max: 30 },
  { label: '31–60 days', min: 31, max: 60 },
  { label: '61–90 days', min: 61, max: 90 },
  { label: '90+ days', min: 91, max: Infinity },
];

export const EOS_METRICS = [
  { id: 1, name: 'Outbound Touches', goal: 100, type: 'per_rep' as const, unit: '#' },
  { id: 2, name: 'New Conversations', goal: 15, type: 'per_rep' as const, unit: '#' },
  { id: 3, name: 'Discovery Meetings Set', goal: 5, type: 'per_rep' as const, unit: '#' },
  { id: 4, name: 'Discovery Meetings Held', goal: 4, type: 'per_rep' as const, unit: '#' },
  { id: 5, name: 'Proposals Sent', goal: 2, type: 'per_rep' as const, unit: '#' },
  { id: 6, name: 'Pipeline Created ($)', goal: 0, type: 'team' as const, unit: '$', goalDynamic: 'QUARTERLY_TARGET/13' },
  { id: 7, name: 'Pipeline Velocity', goal: 0, type: 'team' as const, unit: 'days', lowerIsBetter: true },
  { id: 8, name: 'Stale Deal Count', goal: 0, type: 'team' as const, unit: '#', lowerIsBetter: true },
  { id: 9, name: 'Task Completion %', goal: 90, type: 'per_rep' as const, unit: '%' },
  { id: 10, name: 'Activity Log Rate', goal: 95, type: 'per_rep' as const, unit: '%' },
  { id: 11, name: 'Closed Won ($)', goal: 0, type: 'team' as const, unit: '$', goalDynamic: 'QUARTERLY_TARGET/13' },
  { id: 12, name: 'Win Rate', goal: 25, type: 'team' as const, unit: '%' },
] as const;

export const DEAL_PROPERTIES = [
  'dealname',
  'dealstage',
  'pipeline',
  'amount',
  'hubspot_owner_id',
  'closedate',
  'createdate',
  'hs_lastmodifieddate',
  'num_decision_makers',
];
