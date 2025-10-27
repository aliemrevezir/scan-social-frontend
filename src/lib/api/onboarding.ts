// src/lib/api/onboarding.ts
// Maps 1:1 to your Django endpoints from the Postman collection.
// Assumes you already have an authenticated fetch client at ./client.
// If your client export differs, adjust the import accordingly.

import { apiFetch } from "@/lib/fetcher";
import { Campaign } from "./campaigns";

// ---------- Types (align with your DRF serializers) ----------
export type UUID = string;

export interface CreateBrandPayload {
  name: string;
  website?: string | null;
}

export interface Brand {
  id: UUID;
  name: string;
  website: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  is_onboarded?: boolean;
  onboarding_state?: BrandStatus["state"];
  onboarding_completed_at?: string | null;
}

export interface BrandProfile {
  industry?: string | null;
  company_size?: string | null; // "1-10" | "11-50" | ...
  geography?: string[];         // ["US","CA","GB"]
  preferred_platforms?: string[]; // ["instagram","twitter",...]
  kpis?: string[];              // ["engagement","reach",...]
  ad_language?: string[];       // ["en","es"]
  target_audience?: string | null;
  brand_description?: string | null;
  enrichment_flags?: Record<string, unknown>;
  budget_range?: string | null;
  deleted_at?: string | null;
}

export interface SocialHandle {
  platform: string;             // "instagram" | "twitter" | ...
  handle: string;
  url?: string;
  ext_id?: string | null;
  metrics?: Record<string, number>;
}

export interface Competitor {
  name: string;
  domain: string;
  notes?: string;
}

export interface CampaignPreferences {
  budget_range?: string;             // "10000-50000"
  campaign_frequency?: string;       // "monthly" | ...
  content_types?: string[];          // ["image","video","story"]
  campaign_goals?: string[];         // ["brand_awareness","lead_generation","sales"]
  consents?: Record<string, boolean>;
  additional_preferences?: Record<string, unknown>;
}

export interface BrandVoice {
  tone?: string;                 // e.g. "professional_friendly"
  style?: string;                // e.g. "modern"
  keywords?: string[];
  voice_guidelines?: string;
}

export interface PastCampaignInitPayload {
  slug: string;
  period: { start: string; end: string }; // YYYY-MM-DD
  summary_kpis?: Record<string, number>;
  file_ref?: string; // optional pre-known filename
}
export interface PastCampaignInitResponse { upload_id: string; }

export interface PastCampaignCommitPayload {
  upload_id: string;
  summary_kpis?: Record<string, number>;
}

export interface BrandStatus {
  state: "idle" | "submitted" | "processing" | "ready" | "failed";
  jobs?: Array<{ name: string; status: "queued" | "running" | "done" | "failed" }>;
  enrichment_flags?: Record<string, unknown>;
  last_transition_at?: string;
  is_onboarded?: boolean;
}

// ---------- Endpoints ----------
const base = "/brands";

export async function listBrands(): Promise<Brand[]> {
  return apiFetch<Brand[]>(`${base}/`, { method: "GET" });
}

export async function createBrand(payload: CreateBrandPayload): Promise<Brand> {
  return apiFetch<Brand>(`${base}/`, { method: "POST", body: payload });
}

export async function getBrand(brandId: UUID): Promise<Brand> {
  return apiFetch<Brand>(`${base}/${brandId}/`, { method: "GET" });
}

export async function updateBrand(brandId: UUID, payload: Partial<Pick<Brand, "name" | "website">>): Promise<Brand> {
  return apiFetch<Brand>(`${base}/${brandId}/`, { method: "PUT", body: payload });
}

export async function deleteBrand(brandId: UUID): Promise<void> {
  await apiFetch<void>(`${base}/${brandId}/`, { method: "DELETE" });
}

// Profile
export async function upsertBrandProfile(brandId: UUID, payload: BrandProfile): Promise<BrandProfile> {
  return apiFetch<BrandProfile>(`${base}/${brandId}/profile`, { method: "PUT", body: payload });
}

// Social handles
export async function updateSocialHandles(brandId: UUID, payload: SocialHandle[]): Promise<{ ok: true }> {
  await apiFetch<SocialHandle[]>(`${base}/${brandId}/social-handles`, { method: "PUT", body: payload });
  return { ok: true };
}

// Competitors
export async function updateCompetitors(brandId: UUID, payload: Competitor[]): Promise<{ ok: true }> {
  await apiFetch<Competitor[]>(`${base}/${brandId}/competitors`, { method: "PUT", body: payload });
  return { ok: true };
}

// Campaign preferences
export async function updateCampaignPreferences(
  brandId: UUID,
  payload: CampaignPreferences
): Promise<CampaignPreferences> {
  return apiFetch<CampaignPreferences>(`${base}/${brandId}/campaign-preferences`, { method: "PUT", body: payload });
}

// Brand voice
export async function updateBrandVoice(brandId: UUID, payload: BrandVoice): Promise<BrandVoice> {
  return apiFetch<BrandVoice>(`${base}/${brandId}/brand-voice`, { method: "PUT", body: payload });
}

// Past campaigns
export async function initPastCampaign(
  brandId: UUID,
  payload: PastCampaignInitPayload
): Promise<PastCampaignInitResponse> {
  return apiFetch<PastCampaignInitResponse>(`${base}/${brandId}/past-campaigns/init`, { method: "POST", body: payload });
}

export async function commitPastCampaign(brandId: UUID, payload: PastCampaignCommitPayload): Promise<{ ok: true }> {
  await apiFetch<Campaign>(`${base}/${brandId}/past-campaigns/commit`, { method: "POST", body: payload });
  return { ok: true };
}

// Submit & status
export async function submitBrand(brandId: UUID): Promise<{ ok: true }> {
  await apiFetch<Brand>(`${base}/${brandId}/submit`, { method: "POST", body: {} });
  return { ok: true };
}

export async function getBrandStatus(brandId: UUID): Promise<BrandStatus> {
  return apiFetch<BrandStatus>(`${base}/${brandId}/status`, { method: "GET" });
}

export function isBrandOnboarded(status?: BrandStatus | null): boolean {
  if (!status) return false;
  if (typeof status.is_onboarded === "boolean") {
    return status.is_onboarded;
  }
  return status.state === "ready";
}

// Convenience: poll status until "ready" or "failed"
export async function waitForBrandReady(
  brandId: UUID,
  { intervalMs = 4000, timeoutMs = 180000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<BrandStatus> {
  const started = Date.now();
  while (true) {
    const s = await getBrandStatus(brandId);
    if (s.state === "ready" || s.state === "failed") return s;
    if (Date.now() - started > timeoutMs) throw new Error("Status polling timed out");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
