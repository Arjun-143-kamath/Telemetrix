'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function TrackLayoutWidget({ raceName, circuitId }: { raceName: string; circuitId?: string }) {
  const [error, setError] = useState(false);

  if (!circuitId || error) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative">
        <div className="text-xs text-muted-foreground text-center">
          [ No Track Map Available ]
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative">
      <Image 
        src={`/tracks/${circuitId}.png`} 
        alt={`${raceName} Track Layout`} 
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        priority
        className="object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        onError={() => setError(true)}
      />
    </div>
  );
}
