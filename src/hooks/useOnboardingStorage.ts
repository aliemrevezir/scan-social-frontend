'use client';

import { useEffect, useCallback } from 'react';

// Types matching the onboarding page schema
export interface BrandDetailsFormValues {
  name: string;
  website?: string;
  industry?: string;
  company_size?: string;
  geography?: string;
  target_audience?: string;
  brand_description?: string;
}

export interface PreferencesFormValues {
  budget_range: string;
  campaign_frequency: string;
  content_types: string[];
  campaign_goals: string[];
  consents: {
    marketing_updates?: boolean;
    terms_ack: boolean;
  };
}

const STORAGE_KEYS = {
  brandDetails: 'onboarding:brand-details',
  preferences: 'onboarding:preferences',
  currentStep: 'onboarding:current-step',
  brandId: 'onboarding:brand-id',
} as const;

export interface OnboardingStorageData {
  brandDetails: Partial<BrandDetailsFormValues> | null;
  preferences: Partial<PreferencesFormValues> | null;
  currentStep: number;
  brandId: string | null;
}

/**
 * Hook to manage onboarding form state in localStorage
 * Automatically saves and loads form data across sessions
 */
export function useOnboardingStorage() {
  /**
   * Load all stored data from localStorage
   */
  const loadFromStorage = useCallback((): OnboardingStorageData => {
    if (typeof window === 'undefined') {
      return {
        brandDetails: null,
        preferences: null,
        currentStep: 0,
        brandId: null,
      };
    }

    try {
      const brandDetails = localStorage.getItem(STORAGE_KEYS.brandDetails);
      const preferences = localStorage.getItem(STORAGE_KEYS.preferences);
      const currentStep = localStorage.getItem(STORAGE_KEYS.currentStep);
      const brandId = localStorage.getItem(STORAGE_KEYS.brandId);

      return {
        brandDetails: brandDetails ? JSON.parse(brandDetails) : null,
        preferences: preferences ? JSON.parse(preferences) : null,
        currentStep: currentStep ? parseInt(currentStep, 10) : 0,
        brandId: brandId || null,
      };
    } catch (error) {
      console.error('Failed to load onboarding data from localStorage:', error);
      return {
        brandDetails: null,
        preferences: null,
        currentStep: 0,
        brandId: null,
      };
    }
  }, []);

  /**
   * Save brand details to localStorage
   */
  const saveBrandDetails = useCallback((data: Partial<BrandDetailsFormValues>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.brandDetails, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save brand details to localStorage:', error);
    }
  }, []);

  /**
   * Save preferences to localStorage
   */
  const savePreferences = useCallback((data: Partial<PreferencesFormValues>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
    }
  }, []);

  /**
   * Save current step index to localStorage
   */
  const saveCurrentStep = useCallback((step: number) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.currentStep, step.toString());
    } catch (error) {
      console.error('Failed to save current step to localStorage:', error);
    }
  }, []);

  /**
   * Save brand ID to localStorage
   */
  const saveBrandId = useCallback((brandId: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (brandId) {
        localStorage.setItem(STORAGE_KEYS.brandId, brandId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.brandId);
      }
    } catch (error) {
      console.error('Failed to save brand ID to localStorage:', error);
    }
  }, []);

  /**
   * Clear all onboarding data from localStorage
   */
  const clearStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear onboarding data from localStorage:', error);
    }
  }, []);

  /**
   * Prepare complete onboarding payload for API submission
   * This validates and structures the data according to backend requirements
   */
  const prepareSubmissionPayload = useCallback(
    (data: OnboardingStorageData) => {
      const { brandDetails, preferences, brandId } = data;

      return {
        brand: brandId
          ? {
              id: brandId,
              name: brandDetails?.name || '',
              website: brandDetails?.website || null,
            }
          : null,
        profile: {
          industry: brandDetails?.industry || null,
          company_size: brandDetails?.company_size || null,
          geography: brandDetails?.geography
            ? brandDetails.geography.split(',').map((g: string) => g.trim()).filter(Boolean)
            : [],
          target_audience: brandDetails?.target_audience || null,
          brand_description: brandDetails?.brand_description || null,
        },
        campaignPreferences: {
          budget_range: preferences?.budget_range || null,
          campaign_frequency: preferences?.campaign_frequency || null,
          content_types: preferences?.content_types || [],
          campaign_goals: preferences?.campaign_goals || [],
          consents: preferences?.consents || {},
        },
      };
    },
    [],
  );

  return {
    loadFromStorage,
    saveBrandDetails,
    savePreferences,
    saveCurrentStep,
    saveBrandId,
    clearStorage,
    prepareSubmissionPayload,
  };
}
