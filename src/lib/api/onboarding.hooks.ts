    // src/lib/api/onboarding.hooks.ts
// React Query wrappers for the onboarding API.
// Requires @tanstack/react-query to be configured at the app root.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brand,
  BrandProfile,
  CampaignPreferences,
  BrandVoice,
  SocialHandle,
  Competitor,
  UUID,
  CreateBrandPayload,
  listBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  upsertBrandProfile,
  updateSocialHandles,
  updateCompetitors,
  updateCampaignPreferences,
  updateBrandVoice,
  initPastCampaign,
  commitPastCampaign,
  submitBrand,
  getBrandStatus,
  isBrandOnboarded,
} from "./onboarding";

export const rqKeys = {
  brands: () => ["brands"] as const,
  brand: (id?: UUID | null) => ["brands", id ?? "unknown"] as const,
  brandStatus: (id?: UUID | null) => ["brands", id ?? "unknown", "status"] as const,
};

// Queries
export function useBrands(enabled = true) {
  return useQuery({
    queryKey: rqKeys.brands(),
    queryFn: listBrands,
    enabled,
  });
}

export function useBrand(brandId?: UUID | null, enabled = true) {
  const shouldFetch = Boolean(brandId) && enabled;
  return useQuery({
    queryKey: rqKeys.brand(brandId),
    queryFn: () => {
      if (!brandId) throw new Error("brandId is required");
      return getBrand(brandId);
    },
    enabled: shouldFetch,
  });
}

export function useBrandStatus(brandId?: UUID | null, enabled = true, refetchInterval = 4000) {
  const shouldPoll = Boolean(brandId) && enabled;
  return useQuery({
    queryKey: rqKeys.brandStatus(brandId),
    queryFn: () => {
      if (!brandId) throw new Error("brandId is required");
      return getBrandStatus(brandId);
    },
    enabled: shouldPoll,
    refetchInterval: shouldPoll ? refetchInterval : false,
  });
}

// Mutations
export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBrandPayload) => createBrand(payload),
    onSuccess: (brand) => {
      qc.invalidateQueries({ queryKey: rqKeys.brands() });
      if (brand?.id) {
        qc.setQueryData(rqKeys.brand(brand.id), brand);
      }
    },
  });
}

export function useUpdateBrand(brandId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<Brand, "name" | "website">>) => updateBrand(brandId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rqKeys.brand(brandId) });
      qc.invalidateQueries({ queryKey: rqKeys.brands() });
    },
  });
}

export function useDeleteBrand(brandId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteBrand(brandId),
    onSuccess: () => qc.invalidateQueries({ queryKey: rqKeys.brands() }),
  });
}

export function useUpsertProfile(brandId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrandProfile) => upsertBrandProfile(brandId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: rqKeys.brand(brandId) }),
  });
}

export function useUpdateSocialHandles(brandId: UUID) {
  return useMutation({
    mutationFn: (payload: SocialHandle[]) => updateSocialHandles(brandId, payload),
  });
}

export function useUpdateCompetitors(brandId: UUID) {
  return useMutation({
    mutationFn: (payload: Competitor[]) => updateCompetitors(brandId, payload),
  });
}

export function useUpdatePreferences(brandId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignPreferences) => updateCampaignPreferences(brandId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: rqKeys.brand(brandId) }),
  });
}

export function useUpdateVoice(brandId: UUID) {
  return useMutation({
    mutationFn: (payload: BrandVoice) => updateBrandVoice(brandId, payload),
  });
}

export function useInitPastCampaign(brandId: UUID) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof initPastCampaign>[1]) => initPastCampaign(brandId, payload),
  });
}

export function useCommitPastCampaign(brandId: UUID) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof commitPastCampaign>[1]) => commitPastCampaign(brandId, payload),
  });
}

export function useSubmitBrand(brandId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitBrand(brandId),
    onSuccess: () => qc.invalidateQueries({ queryKey: rqKeys.brandStatus(brandId) }),
  });
}

interface ShouldShowModalOptions {
  includeWhenNoBrand?: boolean;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useShouldShowOnboardingModal(brandId?: UUID | null, options?: ShouldShowModalOptions) {
  const includeWhenNoBrand = options?.includeWhenNoBrand ?? false;
  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval ?? 4000;

  const statusQuery = useBrandStatus(brandId, Boolean(brandId) && enabled, refetchInterval);

  const showForMissingBrand = includeWhenNoBrand && enabled && !brandId;
  const showForExistingBrand =
    Boolean(brandId) &&
    enabled &&
    !statusQuery.isLoading &&
    !statusQuery.isFetching &&
    !isBrandOnboarded(statusQuery.data ?? null);

  return {
    showModal: showForMissingBrand || showForExistingBrand,
    statusQuery,
  };
}
