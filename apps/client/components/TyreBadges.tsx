import React from 'react';

interface TyreBadgesProps {
  tyres: string[];
}

export default function TyreBadges({ tyres }: TyreBadgesProps) {
  if (!tyres || tyres.length === 0) {
    return <span className="text-sm font-medium text-muted-foreground">Info not available</span>;
  }

  return (
    <div className="flex gap-2">
      {tyres.map((tyre: string, idx: number) => {
        const colorClass = idx === 0 ? 'bg-white text-black border-gray-300' 
                         : idx === 1 ? 'bg-yellow-400 text-black border-yellow-500' 
                         : 'bg-red-500 text-white border-red-600';
        const label = idx === 0 ? 'Hard' : idx === 1 ? 'Medium' : 'Soft';
        return (
          <div 
            key={tyre} 
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-black text-[10px] shadow-md ${colorClass}`} 
            title={`${label} (${tyre})`}
          >
            {tyre}
          </div>
        );
      })}
    </div>
  );
}
