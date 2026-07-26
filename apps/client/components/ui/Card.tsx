import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`flex flex-col bg-secondary/10 border border-border/20 rounded-3xl p-6 backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}
