'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { 
  fetchCampaign, 
  updateCampaign, 
  deleteCampaign,
  publishCampaign,
  closeCampaign,
  type Campaign, 
  type UpdateCampaignInput 
} from '@/lib/api/campaigns';

interface CampaignDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateCampaignInput>({
    name: '',
    description: '',
    goals: '',
    brief: '',
    deliverables: '',
    dueDate: '',
    deadline: '',
    budget: 0,
    currency: '',
    imageUrl: ''
  });

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    unwrapParams();
  }, [params]);

  const loadCampaign = useCallback(async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      const data = await fetchCampaign(slug);
      setCampaign(data);
      setFormData({
        name: data.name,
        description: data.description,
        goals: data.goals || '',
        brief: data.brief || '',
        deliverables: Array.isArray(data.deliverables) ? data.deliverables.join('\n') : '',
        deadline: data.deadline || '',
        budget: data.budget || 0,
        currency: data.currency || '',
        imageUrl: data.imageUrl || ''
      });
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!campaign) return;
    
    try {
      setIsSaving(true);
      const updatedCampaign = await updateCampaign(slug, formData);
      setCampaign(updatedCampaign);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update campaign:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (action: 'publish' | 'close') => {
    if (!campaign) return;
    
    try {
      let updatedCampaign;
      if (action === 'publish') {
        updatedCampaign = await publishCampaign(campaign.slug);
      } else {
        updatedCampaign = await closeCampaign(campaign.slug);
      }
      setCampaign(updatedCampaign);
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error);
    }
  };

  const handleDelete = async () => {
    if (!campaign || !confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteCampaign(campaign.slug);
      router.push('/campaigns');
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Campaign Not Found</h1>
          <p className="text-text-secondary mb-6">The campaign you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Back to Campaigns
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-3xl font-bold bg-transparent border-b-2 border-primary-500 focus:outline-none"
                />
              ) : (
                campaign.name
              )}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).toLowerCase() : 'Unknown'}
            </span>
          </div>
          <p className="text-text-secondary">
            Created {campaign.createdAt ? formatDate(campaign.createdAt) : 'Unknown'} • 
            Updated {campaign.updatedAt ? formatDate(campaign.updatedAt) : 'Unknown'}
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-border-default rounded-lg text-text-secondary hover:bg-surface-elevated"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-border-default rounded-lg text-text-primary hover:bg-surface-elevated"
              >
                Edit
              </button>
              {campaign.status === 'DRAFT' && (
                <button
                  onClick={() => handleStatusChange('publish')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Publish
                </button>
              )}
              {campaign.status === 'PUBLISHED' && (
                <button
                  onClick={() => handleStatusChange('close')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Close
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Campaign Details */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-surface-elevated rounded-lg p-6 border border-border-subtle">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-text-secondary">{campaign.description || 'No description provided'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Goals
              </label>
              {isEditing ? (
                <textarea
                  value={formData.goals || ''}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-text-secondary">{campaign.goals || 'No goals specified'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Brief
              </label>
              {isEditing ? (
                <textarea
                  value={formData.brief || ''}
                  onChange={(e) => handleInputChange('brief', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-text-secondary">{campaign.brief || 'No brief provided'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Deliverables
              </label>
              {isEditing ? (
                <textarea
                  value={Array.isArray(formData.deliverables) ? formData.deliverables.join('\n') : (formData.deliverables || '')}
                  onChange={(e) => handleInputChange('deliverables', e.target.value.split('\n').filter(item => item.trim()))}
                  rows={3}
                  placeholder="Enter each deliverable on a new line"
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <div className="text-text-secondary">
                  {campaign.deliverables && Array.isArray(campaign.deliverables) && campaign.deliverables.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {campaign.deliverables.map((deliverable, index) => (
                        <li key={index}>{deliverable}</li>
                      ))}
                    </ul>
                  ) : (
                    'No deliverables specified'
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Budget
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-text-secondary">
                  {campaign.budget ? `${campaign.currency || 'USD'} ${campaign.budget}` : 'No budget set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Currency
              </label>
              {isEditing ? (
                <select
                  value={formData.currency || 'USD'}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              ) : (
                <p className="text-text-secondary">{campaign.currency || 'USD'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-text-secondary">
                  {campaign.dueDate && !isNaN(new Date(campaign.dueDate).getTime()) ? new Date(campaign.dueDate).toLocaleDateString() : 'No due date set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Deadline
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-text-secondary">
                  {campaign.deadline && !isNaN(new Date(campaign.deadline).getTime()) ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline set'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Cover */}
        {campaign.coverUrl && (
          <div className="bg-surface-elevated rounded-lg p-6 border border-border-subtle">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Cover Image</h2>
            <Image
              src={campaign.coverUrl}
              alt={campaign.name}
              width={384}
              height={192}
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Campaign Actions */}
        <div className="bg-surface-elevated rounded-lg p-6 border border-border-subtle">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/campaigns/${campaign.slug}/applications`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              View Applications
            </button>
            <button
              onClick={() => router.push(`/campaigns/${campaign.slug}/submissions`)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              View Submissions
            </button>
            <button
              onClick={() => router.push(`/campaigns/${campaign.slug}/analytics`)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}