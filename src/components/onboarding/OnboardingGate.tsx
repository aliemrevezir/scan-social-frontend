'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { OnboardingStatusModal } from '@/components/molecules/OnboardingStatusModal';
import { useAuth } from '@/lib/auth-context';
import { useBrands, useShouldShowOnboardingModal } from '@/lib/api/onboarding.hooks';
import { isBrandOnboarded } from '@/lib/api/onboarding';

export function OnboardingGate() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isOnboardingRoute = useMemo(() => pathname?.startsWith('/onboarding'), [pathname]);
  const enableQueries = isAuthenticated && !isOnboardingRoute;

  const { data: brands, isLoading: brandsLoading } = useBrands(enableQueries);
  const primaryBrandId = brands?.[0]?.id ?? null;
  const { showModal, statusQuery } = useShouldShowOnboardingModal(primaryBrandId, {
    includeWhenNoBrand: true,
    enabled: enableQueries && !brandsLoading,
  });

  const status = statusQuery.data;
  const alreadyComplete = status ? isBrandOnboarded(status) : false;
  const shouldShowModal = showModal && !alreadyComplete;

  if (!shouldShowModal) {
    return null;
  }

  return (
    <OnboardingStatusModal
      open={shouldShowModal}
      status={status}
      onContinue={() => router.push('/onboarding')}
      onClose={() => {
        // Modal closed by user - but don't show again until page refresh
        // Backend determines if onboarding is truly complete
      }}
    />
  );
}
