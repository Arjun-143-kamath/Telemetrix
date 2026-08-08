'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-6">
      <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-4xl font-black uppercase tracking-tighter">Telemetry Lost</h2>
      <p className="text-muted-foreground text-lg max-w-lg">
        We encountered an issue while fetching the latest F1 data. The telemetry feed might be temporarily unavailable.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-4 mt-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm rounded-full shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all duration-300"
      >
        Retry Connection
      </button>
    </div>
  );
}
