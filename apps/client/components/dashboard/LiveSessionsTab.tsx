"use client";

import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';

interface LiveSessionsTabProps {
  data: any;
}

export default function LiveSessionsTab({ data }: LiveSessionsTabProps) {
  const { nextRace } = data;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!nextRace) return null;

  // Build the list of sessions
  const sessionsList = [
    { name: 'FP1', date: nextRace.FirstPractice?.date, time: nextRace.FirstPractice?.time },
    { name: 'FP2', date: nextRace.SecondPractice?.date, time: nextRace.SecondPractice?.time },
    { name: 'FP3', date: nextRace.ThirdPractice?.date, time: nextRace.ThirdPractice?.time },
    { name: 'Sprint Quali', date: nextRace.SprintShootout?.date, time: nextRace.SprintShootout?.time },
    { name: 'Sprint', date: nextRace.Sprint?.date, time: nextRace.Sprint?.time },
    { name: 'Qualifying', date: nextRace.Qualifying?.date, time: nextRace.Qualifying?.time },
    { name: 'Race', date: nextRace.date, time: nextRace.time },
  ].filter(s => s.date && s.time);

  // Determine the status of each session
  const processedSessions = sessionsList.map(session => {
    const startObj = new Date(`${session.date}T${session.time || '00:00:00Z'}`);
    const endTimeMs = startObj.getTime() + (2 * 3600 * 1000); // approx 2 hours
    const isLive = now.getTime() >= startObj.getTime() && now.getTime() < endTimeMs;
    const isDone = now.getTime() >= endTimeMs;
    return { ...session, startObj, isLive, isDone };
  });

  const liveSession = processedSessions.find(s => s.isLive);
  const nextSession = processedSessions.find(s => !s.isLive && !s.isDone);

  // Format countdown string
  const getCountdownString = (target: Date) => {
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return "00:00:00:00";
    const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diffMs / 1000 / 60) % 60);
    const s = Math.floor((diffMs / 1000) % 60);
    return `${d.toString().padStart(2, '0')}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 min-h-[50vh]">
      
      {liveSession ? (
        <div className="w-full flex flex-col items-center gap-6">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(253,38,92,0.8)]"></div>
             <h2 className="text-2xl font-black uppercase tracking-widest text-primary">Live: {liveSession.name}</h2>
           </div>
           
           {/* Telemetry Placeholders */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
             <Card className="items-center justify-center p-8 aspect-video">
                <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-2">Track Status</span>
                <span className="text-4xl font-black text-success">GREEN</span>
             </Card>
             <Card className="items-center justify-center p-8 aspect-video">
                <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-2">Current Leader</span>
                <span className="text-4xl font-black">---</span>
             </Card>
             <Card className="items-center justify-center p-8 aspect-video">
                <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-2">Speed Trap</span>
                <span className="text-4xl font-black tabular-nums">0 <span className="text-xl text-muted-foreground">km/h</span></span>
             </Card>
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">No Live Session Right Now</h2>
          
          {nextSession ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Next Up: {nextSession.name}</span>
              <div className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-2xl">
                {getCountdownString(nextSession.startObj)}
              </div>
              <div className="flex gap-8 md:gap-16 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">
                <span>Days</span>
                <span>Hours</span>
                <span>Mins</span>
                <span>Secs</span>
              </div>
            </div>
          ) : (
             <span className="text-sm font-medium text-muted-foreground">Waiting for weekend schedule...</span>
          )}
        </div>
      )}

    </div>
  );
}
