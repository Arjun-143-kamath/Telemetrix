import React from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  className?: string;
}

export default function EmptyState({ title, message, className = "" }: EmptyStateProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center min-h-[300px] bg-secondary/5 rounded-3xl border border-border/10 animate-in fade-in zoom-in duration-500 ${className}`}>
      <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-widest mb-2 text-center">{title}</h3>
      {message && <p className="text-sm text-muted-foreground/60 text-center px-4">{message}</p>}
    </div>
  );
}
