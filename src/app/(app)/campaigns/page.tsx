'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { fetchCampaigns, Campaign, CampaignListResponse } from '@/lib/api/campaigns';
import { formatNumber, formatDate } from '@/lib/utils';
import EmptyState from '@/components/dashboard/EmptyState';
import { CampaignListSkeleton } from '@/components/dashboard/SkeletonLoader';

const statusColors = {
  DRAFT: 'bg-warning-bg text-warning',
  PUBLISHED: 'bg-success-bg text-success',
  CLOSED: 'bg-surface-elevated text-text-secondary',
  COMPLETED: 'bg-primary-bg text-primary',
};

const statusLabels = {
  DRAFT: 'Draft',
  PUBLISHED: 'Active',
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const loadCampaigns = async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string | number> = {
        page,
        pageSize: 10,
        owner: 'me', // Only show user's campaigns
      };
      
      if (status) params.status = status;
      
      const response: CampaignListResponse = await fetchCampaigns(params);
      
      // Ensure response has the expected structure
      // API returns 'items' property, not 'campaigns'
      const campaignsData = response?.items || response?.campaigns || [];
      const paginationData = response?.pagination || { 
        page: response?.page || 1, 
        pageSize: response?.pageSize || 10, 
        total: response?.total || 0, 
        totalPages: response?.totalPages || 0 
      };
      
      // Filter by search term on frontend (since API might not support search)
      let filteredCampaigns = campaignsData;
      if (search && Array.isArray(campaignsData)) {
        filteredCampaigns = campaignsData.filter(campaign =>
          campaign?.name?.toLowerCase().includes(search.toLowerCase()) ||
          campaign?.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setCampaigns(filteredCampaigns || []);
      setPagination(paginationData);
    } catch (err: unknown) {
      console.error('Error loading campaigns:', err);
      
      // Handle different types of errors
      const error = err as { status?: number; message?: string };
      if (error?.status === 401) {
        setError('Please log in to view your campaigns');
      } else if (error?.status === 403) {
        setError('You do not have permission to view campaigns');
      } else if (error?.status && error.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to load campaigns');
      }
      
      // Set empty state for graceful fallback
      setCampaigns([]);
      setPagination({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns(currentPage, statusFilter, searchTerm);
  }, [currentPage, statusFilter, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadCampaigns(1, statusFilter, searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };



  if (loading) {
    return (
      <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text">Campaigns</h1>
          <div className="w-32 h-10 bg-surface-elevated rounded-lg animate-pulse"></div>
        </div>
        <CampaignListSkeleton />
      </main>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text">Campaigns</h1>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Link>
        </div>
        <div className="text-center">
          <EmptyState
            illustrationUrl="/api/placeholder/400/300"
            title="Unable to load campaigns"
            subtitle={error || "There was an error loading your campaigns. Please try again."}
            ctaLabel="Create Campaign"
            href="/campaigns/new"
          />
          <button
            onClick={() => {
              setError(null);
              loadCampaigns(currentPage, statusFilter, searchTerm);
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold text-text">Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg p-4 mb-6 shadow-card border border-border-light">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 bg-surface-elevated border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Campaign List */}
      {!campaigns || campaigns.length === 0 ? (
        <EmptyState
          illustrationUrl="/api/placeholder/400/300"
          title="No campaigns yet"
          subtitle="Create your first campaign to start collaborating with influencers."
          ctaLabel="Create Campaign"
          href="/campaigns/new"
        />
      ) : (
        <>
          <div className="bg-surface rounded-lg shadow-card border border-border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {campaigns && Array.isArray(campaigns) && campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              className="h-10 w-10 rounded-lg object-cover"
                              src={campaign.imageUrl || campaign.coverUrl || "/api/placeholder/40/40"}
                              alt={campaign.name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-text-secondary truncate max-w-xs">
                              {campaign.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                          {statusLabels[campaign.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text">
                        {campaign.budget ? `${campaign.currency || '$'}${formatNumber(campaign.budget)}` : 'Not set'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {formatDate(campaign.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/campaigns/${campaign.slug}`}
                            className="text-primary hover:text-primary-hover"
                            title="View campaign"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/campaigns/${campaign.slug}/edit`}
                            className="text-text-secondary hover:text-text"
                            title="Edit campaign"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            className="text-destructive hover:text-destructive-hover"
                            title="Delete campaign"
                            onClick={() => {
                              // TODO: Implement delete functionality
                              console.log('Delete campaign:', campaign.slug);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-text-secondary">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} campaigns
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-surface-elevated border border-border-light rounded-lg hover:bg-border-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-text">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm bg-surface-elevated border border-border-light rounded-lg hover:bg-border-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}