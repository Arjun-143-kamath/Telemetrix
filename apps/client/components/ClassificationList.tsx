import React from 'react';

interface Driver {
  givenName: string;
  familyName: string;
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
  Driver: Driver;
  Constructor: Constructor;
  Time?: Time;
  status: string;
  points: string;
}

interface ClassificationListProps {
  results: ClassificationResult[];
  date?: string;
}

export default function ClassificationList({ results, date }: ClassificationListProps) {
  if (!results || results.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Classification data not available</div>;
  }

  return (
    <div className="w-full lg:w-[55%] h-[80vh] flex flex-col relative border border-border/30 rounded-3xl bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="w-full px-8 py-6 border-b border-border/30 bg-card/40 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
        <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">Race Classification</h3>
        <span className="text-xs font-semibold text-muted-foreground uppercase">{date}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <div key={result.position} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-card/40 transition-colors border border-transparent hover:border-border/50 group">
              
              {/* Position */}
              <div className="w-8 flex justify-center">
                <span className="text-xl font-black text-muted-foreground group-hover:text-foreground transition-colors">
                  {result.position}
                </span>
              </div>

              {/* Constructor Logo Placeholder */}
              <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{result.Constructor.constructorId.substring(0,3)}</span>
              </div>

              {/* Driver & Constructor */}
              <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 truncate">
                    <span className="text-lg font-bold text-foreground truncate">{result.Driver.givenName} {result.Driver.familyName}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate block">
                    {result.Constructor.name}
                  </span>
              </div>

              {/* Time / Status */}
              <div className="text-right">
                  <span className="block text-sm font-bold text-foreground">
                    {result.Time ? result.Time.time : result.status}
                  </span>
                  <span className="block text-[10px] font-bold text-primary uppercase mt-1">
                    {parseInt(result.points) > 0 ? `+${result.points} PTS` : '0 PTS'}
                  </span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
