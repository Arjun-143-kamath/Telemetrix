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
    <div className="flex justify-center items-end h-64 max-w-lg mx-auto gap-4 lg:gap-6 mt-12 mb-8">
       {/* P2 */}
       <div className="flex flex-col items-center w-28 group relative">
          <span className="text-sm lg:text-base font-bold text-gray-300 mb-3 group-hover:text-white transition-colors truncate tracking-wide absolute -top-8">
            {podium[1]?.Driver?.familyName}
          </span>
          <div className="w-full bg-gradient-to-b from-gray-500/80 to-transparent h-36 rounded-t-2xl border-t-[6px] border-gray-300 flex items-center justify-center text-4xl font-black text-gray-300 shadow-[inset_0_20px_30px_rgba(255,255,255,0.2),0_-10px_40px_rgba(209,213,219,0.1)] transition-all">2</div>
       </div>
       {/* P1 */}
       <div className="flex flex-col items-center w-32 z-10 group relative">
          <span className="text-base lg:text-lg font-bold text-yellow-400 mb-3 group-hover:text-yellow-300 transition-colors truncate tracking-wide absolute -top-10">
            {podium[0]?.Driver?.familyName}
          </span>
          <div className="w-full bg-gradient-to-b from-yellow-600/80 to-transparent h-48 rounded-t-2xl border-t-[6px] border-yellow-400 flex items-center justify-center text-5xl font-black text-yellow-100 shadow-[inset_0_20px_30px_rgba(250,204,21,0.3),0_-15px_50px_rgba(250,204,21,0.25)] transition-all">1</div>
       </div>
       {/* P3 */}
       <div className="flex flex-col items-center w-28 group relative">
          <span className="text-sm lg:text-base font-bold text-orange-400 mb-3 group-hover:text-orange-300 transition-colors truncate tracking-wide absolute -top-8">
            {podium[2]?.Driver?.familyName}
          </span>
          <div className="w-full bg-gradient-to-b from-orange-800/90 to-transparent h-28 rounded-t-2xl border-t-[6px] border-orange-500 flex items-center justify-center text-4xl font-black text-orange-300 shadow-[inset_0_20px_30px_rgba(249,115,22,0.2),0_-10px_40px_rgba(249,115,22,0.15)] transition-all">3</div>
       </div>
    </div>
  );
}
