import React from 'react';

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

export default function DataField({ label, value, valueClassName = "text-foreground", className = "" }: DataFieldProps) {
  return (
    <div className={`flex flex-col ${className}`}>
       <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</span>
       <span className={`text-base font-bold ${valueClassName}`}>{value}</span>
    </div>
  );
}
