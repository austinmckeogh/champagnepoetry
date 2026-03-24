import { notFound } from 'next/navigation';
import { DASHBOARD_SLUG } from '@/lib/constants';
import { DashboardShell } from '@/components/DashboardShell';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== DASHBOARD_SLUG) {
    notFound();
  }

  return <DashboardShell />;
}
