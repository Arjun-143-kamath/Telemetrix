import React from 'react';

interface Driver {
  givenName: string;
  familyName: string;
  permanentNumber?: string;
}

interface Constructor {
  constructorId: string;
  name: string;
}

interface Time {
  time: string;
}

interface ClassificationResult {
  position: string;
  number?: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: Time;
  Q1?: string;
  Q2?: string;
  Q3?: string;
  status: string;
  points: string;
}

interface ClassificationListProps {
  results: ClassificationResult[];
  date?: string;
  sessionType?: string;
}

export default function ClassificationList({ results, date, sessionType }: ClassificationListProps) {
  if (!results || results.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Classification data not available</div>;
  }

  const isRace = sessionType === 'race';
  const isQuali = sessionType === 'quali';
  const headerTitle = isRace ? 'Race Classification' : isQuali ? 'Qualifying Classification' : 'Practice Classification';

  return (
    <div className="w-full h-[80vh] flex flex-col relative border border-border/10 rounded-[2rem] bg-[#0a0a0a] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="w-full flex flex-col sticky top-0 z-20 bg-[#0a0a0a] pb-2 pt-6">
        {/* Column Headings */}
        <div className="flex items-center gap-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-border/10 pb-4">
           <div className="w-8 text-left pl-2">POS</div>
           <div className="w-8 text-center">NO</div>
           <div className="flex-1 min-w-0">DRIVER</div>
           <div className="w-1/4">CONSTRUCTOR</div>
           <div className="text-right flex items-center gap-6">
              {isQuali ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 text-right">Q1</div>
                  <div className="w-20 text-right">Q2</div>
                  <div className="w-20 text-right">Q3</div>
                </div>
              ) : (
                <div className="w-24 text-right">TIME / GAP</div>
              )}
              {isRace && <div className="w-16 text-center">POINTS</div>}
           </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        <div className="flex flex-col">
          {results.map((result, index) => {
            const posNum = parseInt(result.position);
            
            // Badge logic for top 3 positions
            let posBadge = <span className="text-sm font-black text-gray-300">{result.position}</span>;
            if (posNum === 1) {
               posBadge = <div className="bg-yellow-600/30 text-yellow-500 w-6 h-6 rounded flex items-center justify-center text-xs font-black shadow-[0_0_10px_rgba(234,179,8,0.1)]">1</div>;
            } else if (posNum === 2) {
               posBadge = <div className="bg-gray-500/30 text-gray-300 w-6 h-6 rounded flex items-center justify-center text-xs font-black">2</div>;
            } else if (posNum === 3) {
               posBadge = <div className="bg-orange-800/40 text-orange-500 w-6 h-6 rounded flex items-center justify-center text-xs font-black">3</div>;
            }

            return (
            <div 
              key={result.position} 
              className={`flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors group ${index !== results.length - 1 ? 'border-b border-border/5' : ''}`}
            >
              
              {/* Position */}
              <div className="w-8 flex items-center pl-2">
                {posBadge}
              </div>

              {/* Number */}
              <div className="w-8 text-center text-[10px] text-muted-foreground font-medium">
                 {result.number || result.Driver?.permanentNumber || '-'}
              </div>

              {/* Driver */}
              <div className="flex-1 min-w-0 flex items-baseline gap-2">
                 <span className="text-sm font-bold text-gray-200 truncate">{result.Driver.givenName} {result.Driver.familyName}</span>
              </div>
              
              {/* Constructor */}
              <div className="w-1/4">
                 <span className="text-xs font-medium text-muted-foreground tracking-wider truncate block">
                   {result.Constructor.name}
                 </span>
              </div>

              {/* Times / Status */}
              <div className="text-right flex items-center gap-6">
                  {isQuali ? (
                     <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                        <span className="w-20 text-right">{result.Q1 || '-'}</span>
                        <span className="w-20 text-right">{result.Q2 || '-'}</span>
                        <span className="w-20 text-right text-red-500">{result.Q3 || '-'}</span>
                     </div>
                  ) : (
                     <span className="block w-24 text-xs font-mono text-gray-400 text-right">
                       {result.Time ? result.Time.time : result.status}
                     </span>
                  )}
                  {isRace && (
                    <span className="block w-16 text-xs font-bold text-red-600 text-center">
                      {parseInt(result.points) > 0 ? result.points : '0'}
                    </span>
                  )}
              </div>

            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
