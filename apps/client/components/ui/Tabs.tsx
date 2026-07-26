"use client";

import React from 'react';
import { motion } from 'framer-motion';

export interface TabOption {
  id: string;
  label: string;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId?: string;
  containerClassName?: string;
}

export default function Tabs({ 
  options, 
  activeTab, 
  onChange, 
  layoutId = "tabIndicator", 
  containerClassName = "w-full flex justify-between md:justify-center items-center overflow-x-auto no-scrollbar gap-2 mb-8 bg-secondary/10 p-1.5 rounded-full border border-border/10 relative"
}: TabsProps) {
  return (
    <div className={containerClassName}>
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`relative px-4 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-1 flex justify-center ${
            activeTab === option.id
              ? 'text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          {activeTab === option.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(253,38,92,0.6)] z-0"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
