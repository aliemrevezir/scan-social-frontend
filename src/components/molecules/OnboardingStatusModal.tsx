'use client';

import { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { Button } from '@/components/atoms/Button';
import type { BrandStatus } from '@/lib/api/onboarding';

const statusCopy: Record<BrandStatus['state'], { title: string; subtitle: string }> = {
  idle: {
    title: 'Complete your brand onboarding',
    subtitle: 'We still need a few details before we can unlock campaign recommendations.',
  },
  submitted: {
    title: 'Sit tight — we are reviewing your details',
    subtitle: 'We will update your dashboard automatically once the enrichment jobs finish.',
  },
  processing: {
    title: 'We are processing your brand profile',
    subtitle: 'Creator recommendations and campaign templates will unlock when this finishes.',
  },
  ready: {
    title: 'You are ready to launch campaigns',
    subtitle: 'Close this modal to get started.',
  },
  failed: {
    title: 'Something went wrong during onboarding',
    subtitle: 'Retry submitting your brand details or contact support for help.',
  },
};

interface OnboardingStatusModalProps {
  open: boolean;
  status?: BrandStatus | null;
  onContinue: () => void;
  onDismiss?: () => void;
}

export function OnboardingStatusModal({
  open,
  status,
  onContinue,
  onDismiss,
}: OnboardingStatusModalProps) {
  const copy = statusCopy[status?.state ?? 'idle'];

  const listItems = useMemo(() => {
    if (!status?.jobs?.length) return null;
    return status.jobs.map((job) => (
      <li key={job.name} className="flex items-center justify-between rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm">
        <span className="font-medium text-[color:var(--color-text-strong)]">{job.name}</span>
        <span className="capitalize text-[color:var(--color-text-muted)]">{job.status}</span>
      </li>
    ));
  }, [status?.jobs]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[color:var(--color-overlay,rgba(15,23,42,0.45))]" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          aria-describedby={undefined}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-[0_35px_60px_-15px_rgba(15,23,42,0.35)] sm:p-8">
            <div className="space-y-2 text-center">
              <Dialog.Title className="text-2xl font-semibold text-[color:var(--color-text-strong)]">
                {copy.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[color:var(--color-text-muted)]">
                {copy.subtitle}
              </Dialog.Description>
            </div>

            {listItems ? (
              <ul className="mt-6 space-y-2">{listItems}</ul>
            ) : null}

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {onDismiss ? (
                <Button
                  variant="ghost"
                  className="sm:flex-1"
                  onClick={() => {
                    onDismiss();
                  }}
                >
                  Maybe later
                </Button>
              ) : null}
              <Button
                className="sm:flex-1"
                onClick={() => {
                  onContinue();
                }}
              >
                Continue setup
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
