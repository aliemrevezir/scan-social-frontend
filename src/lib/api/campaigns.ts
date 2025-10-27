import { apiFetch } from '@/lib/fetcher';

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  description: string;
  goals?: string | null;
  brief?: string | null;
  deliverables?: string[] | null; // Backend returns JSON which could be array or null
  dueDate?: string | null;
  deadline?: string | null;
  budget?: number | null;
  currency?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  imageUrl?: string | null;
  // Keep backwards compatibility
  coverUrl?: string;
}

export interface CampaignListResponse {
  items: Campaign[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  // Keep backwards compatibility
  campaigns?: Campaign[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  goals?: string;
  brief?: string;
  deliverables?: string | string[]; // Allow both string (from form) and array (processed)
  dueDate?: string;
  deadline?: string;
  budget?: number;
  currency?: string;
  imageUrl?: string;
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  slug?: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  pitch: string;
  price?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  influencerId: string;
  videoUrl: string;
  caption?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

// Campaign CRUD operations
export async function fetchCampaigns(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  owner?: 'me';
}): Promise<CampaignListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.owner) searchParams.set('owner', params.owner);

  const url = `/campaigns${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return apiFetch<CampaignListResponse>(url);
}

export async function fetchCampaign(slug: string): Promise<Campaign> {
  try {
    const result = await apiFetch<{campaign: Campaign} | Campaign>(`/campaigns/${slug}`);
    // Handle both {campaign: {...}} and direct {...} response formats
    if ('campaign' in result) {
      return result.campaign;
    }
    return result as Campaign;
  } catch (error) {
    console.error('Failed to fetch campaign:', error);
    throw error;
  }
}

export async function createCampaign(payload: CreateCampaignInput): Promise<Campaign> {
  // Convert deliverables string to array if it's a string
  const processedPayload = {
    ...payload,
    deliverables: typeof payload.deliverables === 'string' 
      ? payload.deliverables.split('\n').map(item => item.trim()).filter(item => item.length > 0)
      : payload.deliverables
  };

  const result = await apiFetch<{campaign: Campaign} | Campaign>('/campaigns', {
    method: 'POST',
    body: processedPayload,
  });
  
  // Handle both {campaign: {...}} and direct {...} response formats
  if ('campaign' in result) {
    return result.campaign;
  }
  return result as Campaign;
}

export async function updateCampaign(slug: string, payload: UpdateCampaignInput): Promise<Campaign> {
  // Convert deliverables string to array if it's a string
  const processedPayload = {
    ...payload,
    deliverables: typeof payload.deliverables === 'string' 
      ? payload.deliverables.split('\n').map(item => item.trim()).filter(item => item.length > 0)
      : payload.deliverables
  };

  const result = await apiFetch<{campaign: Campaign} | Campaign>(`/campaigns/${slug}`, {
    method: 'PATCH',
    body: processedPayload,
  });
  
  // Handle both {campaign: {...}} and direct {...} response formats
  if ('campaign' in result) {
    return result.campaign;
  }
  return result as Campaign;
}

export async function deleteCampaign(slug: string): Promise<void> {
  return apiFetch<void>(`/campaigns/${slug}`, {
    method: 'DELETE',
  });
}

// Campaign status management
export async function publishCampaign(slug: string): Promise<Campaign> {
  const result = await apiFetch<{campaign: Campaign} | Campaign>(`/campaigns/${slug}/publish`, {
    method: 'POST',
  });
  
  // Handle both {campaign: {...}} and direct {...} response formats
  if ('campaign' in result) {
    return result.campaign;
  }
  return result as Campaign;
}

export async function closeCampaign(slug: string): Promise<Campaign> {
  const result = await apiFetch<{campaign: Campaign} | Campaign>(`/campaigns/${slug}/close`, {
    method: 'POST',
  });
  
  // Handle both {campaign: {...}} and direct {...} response formats
  if ('campaign' in result) {
    return result.campaign;
  }
  return result as Campaign;
}

// Campaign applications
export async function applyCampaign(slug: string, payload: { pitch: string; price?: number }): Promise<CampaignApplication> {
  return apiFetch<CampaignApplication>(`/campaigns/${slug}/apply`, {
    method: 'POST',
    body: payload,
  });
}

export async function approveCampaignApplication(slug: string, applicationId: string): Promise<CampaignApplication> {
  return apiFetch<CampaignApplication>(`/campaigns/${slug}/approve`, {
    method: 'POST',
    body: { applicationId },
  });
}

export async function rejectCampaignApplication(slug: string, applicationId: string): Promise<CampaignApplication> {
  return apiFetch<CampaignApplication>(`/campaigns/${slug}/reject`, {
    method: 'POST',
    body: { applicationId },
  });
}

export async function fetchCampaignApplications(slug: string): Promise<CampaignApplication[]> {
  return apiFetch<CampaignApplication[]>(`/campaigns/${slug}/applications`);
}

// Campaign submissions
export async function submitVideo(payload: {
  campaignId: string;
  videoUrl: string;
  caption?: string;
}): Promise<CampaignSubmission> {
  return apiFetch<CampaignSubmission>('/submissions', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchCampaignSubmissions(slug: string): Promise<CampaignSubmission[]> {
  return apiFetch<CampaignSubmission[]>(`/campaigns/${slug}/submissions`);
}

// Campaign analytics
export async function fetchCampaignAnalytics(slug: string): Promise<{
  campaign: { slug: string; status: string };
  kpis: {
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    avgEngagementRate: number | null;
  };
}> {
  return apiFetch(`/campaigns/${slug}/analytics`);
}