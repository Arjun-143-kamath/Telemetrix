import React from 'react';
import { getSessionStatus } from '../utils/time';

interface Session {
  name: string;
  label: string;
  dateStr?: string;
  timeStr?: string;
  openF1EndTimeStr?: string;
}

interface SessionTrackerProps {
  sessions: Session[];
}

export default function SessionTracker({ sessions }: SessionTrackerProps) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-xs uppercase tracking-widest text-primary font-bold">Sessions</span>
      {sessions.map((session) => {
        const status = getSessionStatus(session.dateStr, session.timeStr, session.openF1EndTimeStr);
        
        return (
          <div key={session.name} className={`flex flex-col transition-all duration-500 ${status.isDone ? 'opacity-40 grayscale' : 'opacity-100'}`}>
             <div className="flex items-center gap-2 mb-1">
               <span className={`text-[10px] font-bold uppercase tracking-wider ${status.isDone ? 'text-muted-foreground' : 'text-primary'}`}>
                 {session.label}
               </span>
               {status.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
               )}
             </div>
             <span className={`text-lg font-bold ${status.isDone ? 'text-muted-foreground line-through decoration-muted-foreground/30' : (status.isLive ? 'text-primary' : 'text-foreground')}`}>
               {status.timeString}
             </span>
          </div>
        );
      })}
    </div>
  );
}
