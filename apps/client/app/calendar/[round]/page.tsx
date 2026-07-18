'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TyreBadges from '../../../components/TyreBadges';
import AnimatedPodium from '../../../components/AnimatedPodium';
import { formatDate } from '../../../utils/time';

export default function RaceDetailsPage() {
  const params = useParams();
  const round = params.round;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('race');

  useEffect(() => {
    fetch(`http://localhost:5000/api/races/${round}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [round]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading race data...</div>;
  }

  if (!data || data.error) {
    return <div className="p-8 text-center text-destructive">Failed to load race details.</div>;
  }

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
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <Link href="/calendar" className="text-primary text-sm font-bold flex items-center gap-2 mb-2 hover:underline">
          &larr; Back to Calendar
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">{data.raceName}</h1>
            <p className="text-xl text-muted-foreground mt-1">{data.circuit.circuitName} - {data.circuit.Location.country}</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-bold">{formatDate(data.date, data.time)}</span>
          </div>
        </div>
      </div>

      {/* Tyres Allocation */}
      {data.tyres && data.tyres.length > 0 && (
        <div className="flex items-center gap-3 mt-2 mb-2 px-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tyre Allocation:</span>
          <TyreBadges tyres={data.tyres} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-black/20 p-2 rounded-xl backdrop-blur-md border border-border/20 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(253,38,92,0.5)]' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Extra Cards (Race Only) */}
      {activeTab === 'race' && hasClassification && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
           <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
             <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Driver of the Day</span>
             <span className="text-2xl font-black text-primary">{currentSessionData.driverOfTheDay || 'Info not available'}</span>
           </div>
           <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
             <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Fastest Pitstop</span>
             <span className="text-2xl font-black text-blue-400">
               {currentSessionData.fastestPitstop 
                 ? `${currentSessionData.fastestPitstop.pit_duration}s (${currentSessionData.fastestPitstop.driver_number})` 
                 : 'Info not available'}
             </span>
           </div>
        </div>
      )}

      {/* Session Content */}
      <div className="flex flex-col gap-8 mt-4">
        
        {!hasClassification ? (
          <div className="bg-card/40 border border-border/40 rounded-2xl p-12 text-center text-muted-foreground">
            Data not available for this session yet.
          </div>
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
                            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">{row.Driver.permanentNumber}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{row.Constructor.name}</td>
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
    </div>
  );
}
