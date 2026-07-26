"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

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
  containerClassName = "w-full flex justify-between md:justify-center items-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 mb-8 bg-secondary/10 p-1.5 rounded-full border border-border/10 relative"
}: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useGSAP(() => {
    const activeBtn = buttonRefs.current[activeTab];
    const indicator = indicatorRef.current;
    
    if (activeBtn && indicator) {
      // First run: set immediately to avoid flash
      if (gsap.getProperty(indicator, "width") === 0) {
        gsap.set(indicator, {
          x: activeBtn.offsetLeft,
          y: activeBtn.offsetTop,
          width: activeBtn.offsetWidth,
          height: activeBtn.offsetHeight,
        });
      } else {
        gsap.to(indicator, {
          x: activeBtn.offsetLeft,
          y: activeBtn.offsetTop,
          width: activeBtn.offsetWidth,
          height: activeBtn.offsetHeight,
          duration: 0.8,
          ease: 'elastic.out(1, 0.75)'
        });
      }
    }
  }, { dependencies: [activeTab], scope: containerRef });

  return (
    <div ref={containerRef} className={containerClassName}>
      <div 
        ref={indicatorRef} 
        className="absolute left-0 top-0 bg-primary rounded-full shadow-[0_0_15px_rgba(253,38,92,0.6)] z-0" 
        style={{ width: 0, height: 0 }}
      />
      {options.map(option => (
        <button
          key={option.id}
          ref={el => { buttonRefs.current[option.id] = el; }}
          onClick={() => onChange(option.id)}
          className={`relative px-4 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-1 flex justify-center ${
            activeTab === option.id
              ? 'text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
