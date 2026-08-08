'use client';

import { useState } from 'react';
import Tabs from '../../../components/ui/Tabs';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import TyreBadges from '../../../components/TyreBadges';
import AnimatedPodium from '../../../components/AnimatedPodium';
import RefreshButton from '@/components/RefreshButton';

export default function RaceDetailsClient({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<string>('race');

  const { isSprintWeekend, sessions } = data;
  const tabs = isSprintWeekend 
    ? [
        { id: 'fp1', label: 'FP1' },
        { id: 'sprint_qualifying', label: 'Sprint Quali' },
        { id: 'sprint', label: 'Sprint' },
        { id: 'qualifying', label: 'Qualifying' },
        { id: 'race', label: 'Race' }
      ]
    : [
        { id: 'fp1', label: 'FP1' },
        { id: 'fp2', label: 'FP2' },
        { id: 'fp3', label: 'FP3' },
        { id: 'qualifying', label: 'Qualifying' },
        { id: 'race', label: 'Race' }
      ];

  const currentSessionData = sessions[activeTab] || { classification: [] };
  const hasClassification = currentSessionData.classification && currentSessionData.classification.length > 0;
  
  // Extract Podium
  const podium = hasClassification ? currentSessionData.classification.slice(0, 3) : [];
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <RefreshButton />
      </div>

      {/* Tyres Allocation */}
      {data.tyres && data.tyres.length > 0 && (
        <div className="flex items-center gap-3 mt-2 mb-2 px-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tyre Allocation:</span>
          <TyreBadges tyres={data.tyres} />
        </div>
      )}

      {/* Tabs */}
      <Tabs 
        options={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        layoutId="calendarSessionTabIndicator"
        containerClassName="w-full flex justify-between md:justify-center items-center overflow-x-auto no-scrollbar gap-2 mb-2 bg-secondary/10 p-1.5 rounded-full border border-border/10 relative"
      />

      {/* Extra Cards (Race Only) */}
      {activeTab === 'race' && hasClassification && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
           <Card className="items-center justify-center text-center">
             <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Driver of the Day</span>
             <span className="text-2xl font-black text-primary">{currentSessionData.driverOfTheDay || 'Info not available'}</span>
           </Card>
           <Card className="items-center justify-center text-center">
             <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Fastest Pitstop</span>
             <span className="text-2xl font-black text-blue-400">
               {currentSessionData.fastestPitstop 
                 ? `${currentSessionData.fastestPitstop.pit_duration}s (${currentSessionData.fastestPitstop.driver_number})` 
                 : 'Info not available'}
             </span>
           </Card>
        </div>
      )}

      {/* Session Content */}
      <div className="flex flex-col gap-8 mt-4">
        
        {!hasClassification ? (
          <EmptyState title="Data not available for this session yet." />
        ) : (
          <>
            {/* Podium */}
            <AnimatedPodium podium={podium} />

            {/* Classification Table */}
            <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                {currentSessionData.classification.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground text-xs uppercase tracking-wider bg-black/10">
                        <th className="px-4 py-4 font-bold text-center w-16">Pos</th>
                        <th className="px-4 py-4 font-bold w-12">No</th>
                        <th className="px-4 py-4 font-bold">Driver</th>
                        <th className="px-4 py-4 font-bold">Constructor</th>
                        <th className="px-4 py-4 font-bold">Time / Gap</th>
                        {activeTab === 'race' && currentSessionData.classification.some((r: any) => r.FastestLap?.AverageSpeed?.speed) && <th className="px-4 py-4 font-bold">Top Speed</th>}
                        <th className="px-4 py-4 font-bold text-center">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSessionData.classification.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-gray-400/20 text-gray-400' : idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'text-muted-foreground'}`}>
                              {row.position || idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.number || row.Driver.permanentNumber}</td>
                            <td className="px-4 py-3 font-bold text-foreground">
                              {row.Driver.givenName} {row.Driver.familyName}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {row.Constructor.name}
                            </td>
                          <td className="px-4 py-3 font-mono text-xs">{row.Q3 || row.Q2 || row.Q1 || row.Time?.time || row.Time?.gap || row.status || 'N/A'}</td>
                          {activeTab === 'race' && currentSessionData.classification.some((r: any) => r.FastestLap?.AverageSpeed?.speed) && (
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                              {row.FastestLap?.AverageSpeed?.speed ? `${row.FastestLap.AverageSpeed.speed} km/h` : 'N/A'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-center font-bold text-primary">{row.points || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
