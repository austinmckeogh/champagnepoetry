import { getAccessToken } from './token-refresh';
import { DEAL_PROPERTIES } from './constants';
import type { Deal, Owner, StageEntry } from './types';

const BASE_URL = 'https://api.hubapi.com';

async function hubspotFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot API error: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getAllDeals(): Promise<Deal[]> {
  const deals: Deal[] = [];
  let after: string | undefined;

  do {
    const params = new URLSearchParams({
      limit: '50',
      properties: DEAL_PROPERTIES.join(','),
      propertiesWithHistory: 'dealstage',
    });
    if (after) params.set('after', after);

    const data = await hubspotFetch<{
      results: Array<{
        id: string;
        properties: Record<string, string | null>;
        propertiesWithHistory?: {
          dealstage?: { value: string; timestamp: string }[];
        };
      }>;
      paging?: { next?: { after: string } };
    }>(`/crm/v3/objects/deals?${params}`);

    for (const r of data.results) {
      deals.push({
        id: r.id,
        dealname: r.properties.dealname || '',
        dealstage: r.properties.dealstage || '',
        pipeline: r.properties.pipeline || 'default',
        amount: parseFloat(r.properties.amount || '0') || 0,
        hubspot_owner_id: r.properties.hubspot_owner_id || '',
        closedate: r.properties.closedate || null,
        createdate: r.properties.createdate || '',
        hs_lastmodifieddate: r.properties.hs_lastmodifieddate || '',
        num_decision_makers: r.properties.num_decision_makers || null,
        stageHistory: r.propertiesWithHistory?.dealstage?.map(
          (h): StageEntry => ({ value: h.value, timestamp: h.timestamp })
        ),
      });
    }

    after = data.paging?.next?.after;
  } while (after);

  return deals;
}

export async function getOwners(): Promise<Owner[]> {
  const data = await hubspotFetch<{
    results: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>;
  }>('/crm/v3/owners');

  return data.results.map((o) => ({
    id: o.id,
    firstName: o.firstName || '',
    lastName: o.lastName || '',
    email: o.email || '',
  }));
}

export async function getEngagements(objectType: string, objectId: string) {
  return hubspotFetch<{
    results: Array<{
      id: string;
      properties: Record<string, string | null>;
    }>;
  }>(
    `/crm/v4/objects/${objectType}/${objectId}/associations/engagements`
  );
}

export async function getTasks(): Promise<
  Array<{
    id: string;
    properties: Record<string, string | null>;
  }>
> {
  const tasks: Array<{ id: string; properties: Record<string, string | null> }> = [];
  let after: string | undefined;

  do {
    const params = new URLSearchParams({
      limit: '100',
      properties: 'hs_task_subject,hs_task_status,hs_task_priority,hs_timestamp,hubspot_owner_id',
    });
    if (after) params.set('after', after);

    const data = await hubspotFetch<{
      results: Array<{ id: string; properties: Record<string, string | null> }>;
      paging?: { next?: { after: string } };
    }>(`/crm/v3/objects/tasks?${params}`);

    tasks.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return tasks;
}

export async function getRecentEngagements(): Promise<
  Array<{
    id: string;
    properties: Record<string, string | null>;
  }>
> {
  const data = await hubspotFetch<{
    results: Array<{ id: string; properties: Record<string, string | null> }>;
  }>('/crm/v3/objects/engagements?limit=100&properties=hs_engagement_type,hs_timestamp,hubspot_owner_id');

  return data.results;
}
