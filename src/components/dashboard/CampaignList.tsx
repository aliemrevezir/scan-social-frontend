import Link from 'next/link';
import Image from 'next/image';
import { CampaignSummary } from '@/lib/api/dashboard';
import { formatNumber, formatDate } from '@/lib/utils';

interface CampaignListProps {
  items: CampaignSummary[];
}

export default function CampaignList({ items }: CampaignListProps) {
  const campaigns = items;

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">Recent Campaigns</h3>
      <div className="grid gap-3 sm:gap-4">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
            <div className="flex items-center p-3 sm:p-4 bg-surface-elevated rounded-lg hover:bg-surface transition-colors cursor-pointer">
              <div className="flex-shrink-0 mr-3 sm:mr-4">
                <Image 
                  src={campaign.coverUrl || "/api/placeholder/60/60"} 
                  alt={`${campaign.name} thumbnail`}
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-medium text-text truncate">{campaign.name}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-success-bg text-success' :
                    campaign.status === 'draft' ? 'bg-warning-bg text-warning' :
                    'bg-surface-elevated text-text-secondary'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  {campaign.kpis && (
                    <div className="flex gap-4 text-xs sm:text-sm text-text-secondary mt-1 sm:mt-0">
                      <span>Views: {formatNumber(campaign.kpis.totalViews || 0)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Engagement: {((campaign.kpis.engagementRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Created: {formatDate(campaign.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}