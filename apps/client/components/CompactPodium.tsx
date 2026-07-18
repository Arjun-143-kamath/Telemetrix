import React from 'react';

interface Driver {
  givenName: string;
  familyName: string;
}

interface PodiumResult {
  position: string;
  Driver: Driver;
}

interface CompactPodiumProps {
  podium: PodiumResult[];
}

export default function CompactPodium({ podium }: CompactPodiumProps) {
  if (!podium || podium.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-6">No podium data</div>;
  }

  return (
    <div className="flex justify-center items-end h-40 max-w-lg mx-auto gap-2 lg:gap-4">
       {/* P2 */}
       <div className="flex flex-col items-center w-1/3 group">
          <span className="text-lg lg:text-xl font-black text-muted-foreground mb-2 group-hover:text-foreground transition-colors truncate">
            {podium[1]?.Driver?.familyName}
          </span>
          <div className="w-full bg-slate-300/10 h-24 rounded-t-xl border-t-4 border-slate-300 flex items-center justify-center text-2xl font-black text-slate-300 transition-all group-hover:bg-slate-300/20">2</div>
       </div>
       {/* P1 */}
       <div className="flex flex-col items-center w-1/3 z-10 group">
          <span className="text-xl lg:text-2xl font-black text-primary mb-2 group-hover:text-white transition-colors truncate">
            {podium[0]?.Driver?.familyName}
          </span>
          <div className="w-full bg-yellow-500/10 h-32 rounded-t-xl border-t-4 border-yellow-500 flex items-center justify-center text-4xl font-black text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all group-hover:bg-yellow-500/20">1</div>
       </div>
       {/* P3 */}
       <div className="flex flex-col items-center w-1/3 group">
          <span className="text-lg lg:text-xl font-black text-muted-foreground mb-2 group-hover:text-foreground transition-colors truncate">
            {podium[2]?.Driver?.familyName}
          </span>
          <div className="w-full bg-amber-600/10 h-16 rounded-t-xl border-t-4 border-amber-600 flex items-center justify-center text-2xl font-black text-amber-600 transition-all group-hover:bg-amber-600/20">3</div>
       </div>
    </div>
  );
}
