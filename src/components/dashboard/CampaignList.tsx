import Link from 'next/link';
import Image from 'next/image';
import { CampaignSummary } from '@/lib/api/dashboard';
import { formatNumber, formatDate } from '@/lib/utils';

interface CampaignListProps {
  items: CampaignSummary[];
}

export default function CampaignList({ items }: CampaignListProps) {
  const campaigns = items;

  if (!campaigns.length) {
    return (
      <div className="rounded-3xl border border-border-light bg-white/90 p-6 text-center text-sm text-text-secondary shadow-card backdrop-blur">
        <h3 className="text-base font-semibold text-text">Recent campaigns</h3>
        <p className="mt-3 leading-relaxed">
          You haven’t launched any campaigns yet. Create one to start tracking performance insights.
        </p>
        <Link
          href="/campaigns/new"
          className="mt-4 inline-flex items-center justify-center rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/20"
        >
          Create your first campaign
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border-light bg-white/90 p-6 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text sm:text-lg">Recent campaigns</h3>
        <Link href="/campaigns" className="text-sm font-medium text-primary transition-opacity hover:opacity-80">
          View all
        </Link>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:gap-4">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/campaigns/${campaign.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-border-light bg-surface p-4 transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="relative flex-shrink-0">
              <Image
                src={campaign.coverUrl || '/api/placeholder/60/60'}
                alt={`${campaign.name} thumbnail`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl border border-border-light object-cover shadow-card"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-text transition-colors group-hover:text-primary sm:text-base">
                  {campaign.name}
                </h4>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    campaign.status === 'active'
                      ? 'bg-success/10 text-success'
                      : campaign.status === 'draft'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary sm:text-sm">
                {campaign.kpis ? (
                  <>
                    <span>Views • {formatNumber(campaign.kpis.totalViews || 0)}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>Engagement • {((campaign.kpis.engagementRate || 0) * 100).toFixed(1)}%</span>
                  </>
                ) : (
                  <span>No KPI data yet</span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Created {formatDate(campaign.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
