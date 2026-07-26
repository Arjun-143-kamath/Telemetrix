import React from 'react';

interface SectionHeaderProps {
  title: string;
  indicatorColor?: string;
  className?: string;
}

export default function SectionHeader({ title, indicatorColor = "bg-primary", className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${className}`}>
       <div className={`w-1.5 h-4 rounded-full ${indicatorColor}`}></div>
       <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{title}</h3>
    </div>
  );
}
