'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface Driver {
  givenName: string;
  familyName: string;
}

interface PodiumResult {
  position: string;
  Driver: Driver;
}

interface AnimatedPodiumProps {
  podium: PodiumResult[];
}

export default function AnimatedPodium({ podium }: AnimatedPodiumProps) {
  if (!podium || podium.length < 3) {
    return <div className="text-sm text-muted-foreground text-center py-6">No podium data</div>;
  }
  
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.podium-step', {
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.5)'
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex justify-center items-end gap-2 sm:gap-4 md:gap-8 h-64 mt-8 mb-8 overflow-hidden">
      {/* 2nd Place */}
      {podium[1] && (
        <div className="podium-step flex flex-col items-center justify-end h-[80%] w-24 sm:w-32">
          <span className="text-lg font-bold text-gray-300 truncate w-full text-center">{podium[1]?.Driver?.familyName || 'N/A'}</span>
          <div className="w-full h-full bg-gradient-to-t from-gray-500/20 to-gray-400/50 rounded-t-xl border-t-4 border-gray-300 flex items-start justify-center pt-4 shadow-[0_0_20px_rgba(209,213,219,0.2)]">
            <span className="text-4xl font-black text-white/50">2</span>
          </div>
        </div>
      )}
      
      {/* 1st Place */}
      {podium[0] && (
        <div className="podium-step flex flex-col items-center justify-end h-full w-28 sm:w-36">
          <span className="text-xl font-black text-yellow-500 truncate w-full text-center">{podium[0]?.Driver?.familyName || 'N/A'}</span>
          <div className="w-full h-full bg-gradient-to-t from-yellow-600/20 to-yellow-500/50 rounded-t-xl border-t-4 border-yellow-400 flex items-start justify-center pt-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <span className="text-5xl font-black text-white/70">1</span>
          </div>
        </div>
      )}
      
      {/* 3rd Place */}
      {podium[2] && (
        <div className="podium-step flex flex-col items-center justify-end h-[60%] w-24 sm:w-32">
          <span className="text-lg font-bold text-orange-400 truncate w-full text-center">{podium[2]?.Driver?.familyName || 'N/A'}</span>
          <div className="w-full h-full bg-gradient-to-t from-orange-700/20 to-orange-500/40 rounded-t-xl border-t-4 border-orange-500 flex items-start justify-center pt-4 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <span className="text-3xl font-black text-white/40">3</span>
          </div>
        </div>
      )}
    </div>
  );
}
