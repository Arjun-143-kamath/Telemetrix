import React from 'react';

interface RaceFactsWidgetProps {
  fastestLapTime: string;
  fastestLapDriver: string;
  fastestPitTime: string;
  fastestPitDriver: string;
  driverOfDay: string;
  polePosition: string;
}

export default function RaceFactsWidget({
  fastestLapTime,
  fastestLapDriver,
  fastestPitTime,
  fastestPitDriver,
  driverOfDay,
  polePosition
}: RaceFactsWidgetProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Fastest Lap</span>
        <span className="text-xl font-black text-foreground">{fastestLapTime}</span>
        <span className="text-sm font-medium text-muted-foreground">{fastestLapDriver}</span>
      </div>
      <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Fastest Pit Stop</span>
        <span className="text-xl font-black text-foreground">{fastestPitTime}</span>
        <span className="text-sm font-medium text-muted-foreground">{fastestPitDriver}</span>
      </div>
      <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Driver of the Day</span>
        <span className="text-lg font-black text-foreground mt-1">{driverOfDay}</span>
      </div>
      <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Pole Position</span>
        <span className="text-lg font-black text-foreground mt-1">{polePosition}</span>
      </div>
    </div>
  );
}
