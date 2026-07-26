"use client";

import React from 'react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import DataField from '../ui/DataField';
import TrackLayoutWidget from '../TrackLayoutWidget';
import TyreBadges from '../TyreBadges';

interface TrackDetailsTabProps {
  data: any;
}

export default function TrackDetailsTab({ data }: TrackDetailsTabProps) {
  const { nextRace, circuitStats, tyres, previousFormAtCircuit } = data;

  const displayCircuitStats = {
    fastestLap: circuitStats?.fastestLap || 'Info not available',
    mostWins: circuitStats?.mostWins || 'Info not available',
    mostPoles: circuitStats?.mostPoles || 'Info not available',
    tyres: tyres || []
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row items-stretch justify-between w-full min-h-[60vh] gap-8 lg:gap-4 mt-8">
        
        {/* Left Side: Stats */}
        <div className="w-full lg:w-[25%] flex flex-col gap-8">
           <Card className="gap-4">
             <SectionHeader title="Circuit Records" indicatorColor="bg-primary" />
             
             <DataField label="Fastest Lap" value={displayCircuitStats.fastestLap} valueClassName="text-primary" />
             <DataField label="Most Wins" value={displayCircuitStats.mostWins} />
             <DataField label="Most Poles" value={displayCircuitStats.mostPoles} />
           </Card>

           <Card className="gap-4">
             <SectionHeader title="Track Info" indicatorColor="bg-primary" />
             <DataField label="Location" value={`${nextRace?.Circuit?.Location?.locality}, ${nextRace?.Circuit?.Location?.country}`} />
             <DataField label="Circuit Name" value={nextRace?.Circuit?.circuitName} />
           </Card>
        </div>

        {/* Center: Track Map */}
        <div className="w-full lg:w-[50%] flex items-center justify-center relative pointer-events-none min-h-[400px]">
           <div className="w-full h-full scale-110 lg:scale-[1.2] transform origin-center">
              <TrackLayoutWidget raceName={nextRace?.raceName || ''} circuitId={nextRace?.Circuit?.circuitId} />
           </div>
        </div>

        {/* Right Side: Compounds & Last Year */}
        <div className="w-full lg:w-[25%] flex flex-col gap-8">
           
           <Card className="gap-4">
             <SectionHeader title="Tyre Compounds" indicatorColor="bg-primary" />
             <TyreBadges tyres={displayCircuitStats.tyres} />
             <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2">
               Pirelli allocations for this weekend.
             </p>
           </Card>

           {previousFormAtCircuit && (
             <Card className="gap-4">
               <SectionHeader title={`Previous Form (${previousFormAtCircuit.year})`} indicatorColor="bg-muted-foreground" />
               <DataField label="Previous Pole" value={previousFormAtCircuit.pole} />
               <DataField label="Previous Winner" value={previousFormAtCircuit.winner} />
             </Card>
           )}

        </div>

      </div>
    </div>
  );
}
