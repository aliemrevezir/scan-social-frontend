'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchDashboard, type DashboardPayload } from '@/lib/api/dashboard';
import { KpiStat } from '@/components/dashboard/KpiStat';
import PerformanceCard from '@/components/dashboard/PerformanceCard';
import EmptyState from '@/components/dashboard/EmptyState';
import CampaignList from '@/components/dashboard/CampaignList';
import { DashboardSkeleton } from '@/components/dashboard/SkeletonLoader';
import { ErrorBoundary, RetryWrapper } from '@/components/dashboard/ErrorBoundary';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/atoms/Button';

function DashboardContent() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await fetchDashboard();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
      throw err; // Re-throw to trigger error boundary
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          illustrationUrl="/window.svg"
          title="Something went wrong"
          subtitle={error}
          ctaLabel="Try Again"
          href="/dashboard"
        />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          illustrationUrl="/window.svg"
          title="No data available"
          subtitle="Unable to load dashboard data at this time."
          ctaLabel="Refresh"
          href="/dashboard"
        />
      </main>
    );
  }

  const isBrand = data.role === 'BRAND';
  const isEmpty = data.isEmpty;
  const kpis = data.kpis ?? {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0,
  };

  const engagementPercentage =
    typeof kpis.engagementRate === 'number'
      ? `${(kpis.engagementRate * 100).toFixed(1)}%`
      : '—';

  return (
    <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-text">Dashboard</h1>
        {isBrand && !isEmpty && (
          <Button href="/campaigns/new" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg sm:text-xl">add_circle</span>
            <span className="hidden sm:inline">Create Campaign</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>

      {isEmpty && isBrand && (
        <EmptyState
          illustrationUrl="/window.svg"
          title="Create your first campaign to start receiving submissions."
          subtitle="Get started by creating a campaign and inviting creators to collaborate. It's the first step to unlocking powerful TikTok insights."
          ctaLabel="Create Campaign"
          href="/campaigns/new"
        />
      )}

      {isEmpty && !isBrand && (
        <EmptyState
          illustrationUrl="/window.svg"
          title="Join your first campaign to start collaborating."
          subtitle="Browse live campaigns and apply to collaborate with brands."
          ctaLabel="Find Campaigns"
          href="/campaigns/browse"
        />
      )}

      {!isEmpty && (
        <div className="space-y-6 sm:space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiStat
              label="Total Views"
              value={formatNumber(kpis.totalViews ?? 0)}
              icon={
                <span className="material-symbols-outlined text-2xl text-[color:var(--color-primary)]">visibility</span>
              }
            />
            <KpiStat
              label="Total Likes"
              value={formatNumber(kpis.totalLikes ?? 0)}
              icon={
                <span className="material-symbols-outlined text-2xl text-[color:var(--color-primary)]">favorite</span>
              }
            />
            <KpiStat
              label="Total Comments"
              value={formatNumber(kpis.totalComments ?? 0)}
              icon={
                <span className="material-symbols-outlined text-2xl text-[color:var(--color-primary)]">comment</span>
              }
            />
            <KpiStat
              label="Engagement Rate"
              value={engagementPercentage}
              icon={
                <span className="material-symbols-outlined text-2xl text-[color:var(--color-primary)]">trending_up</span>
              }
            />
          </section>

          <PerformanceCard>
            <Image
              src="/window.svg"
              alt="Performance placeholder"
              width={800}
              height={400}
              className="w-full h-full object-contain"
            />
          </PerformanceCard>

          <CampaignList items={data.campaigns} />
        </div>
      )}
    </main>
  );
}



export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <RetryWrapper onRetry={() => window.location.reload()}>
        <DashboardContent />
      </RetryWrapper>
    </ErrorBoundary>
  );
}