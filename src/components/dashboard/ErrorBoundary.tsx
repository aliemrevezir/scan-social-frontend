'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Image from 'next/image';
import EmptyState from './EmptyState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            illustrationUrl="/window.svg"
            title="Something went wrong"
            subtitle="An unexpected error occurred while loading the dashboard. Please try refreshing the page."
            ctaLabel="Refresh Page"
            href="/dashboard"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Dashboard error:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError, error };
}

// Retry wrapper component
interface RetryWrapperProps {
  children: ReactNode;
  onRetry: () => void;
  maxRetries?: number;
}

export function RetryWrapper({ children, onRetry, maxRetries = 3 }: RetryWrapperProps) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = React.useCallback(async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, onRetry]);

  const CustomRetryEmptyState = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center text-center py-16">
        <Image src="/window.svg" alt="Error illustration" width={400} height={300} className="w-full max-w-sm rounded-xl mb-6" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-[color:var(--color-muted)] max-w-md mb-6">
          {retryCount >= maxRetries
            ? "We've tried multiple times but couldn't load the dashboard. Please refresh the page."
            : `An error occurred while loading the dashboard. ${isRetrying ? 'Retrying...' : `Retry attempt ${retryCount}/${maxRetries}`}`}
        </p>
        {retryCount >= maxRetries ? (
          <a href="/dashboard" className="btn btn-primary px-6 py-2">
            Refresh Page
          </a>
        ) : (
          <button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="btn btn-primary px-6 py-2 disabled:opacity-50"
          >
            {isRetrying ? "Retrying..." : "Try Again"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={<CustomRetryEmptyState />}>
      {children}
    </ErrorBoundary>
  );
}