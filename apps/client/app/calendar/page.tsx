import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { getDaysToRace, formatDate } from '../../utils/time';
import GsapFadeIn from '../../components/ui/GsapFadeIn';
import Card from '../../components/ui/Card';
import DataField from '../../components/ui/DataField';

export const revalidate = 60; // 1 minute

export const metadata: Metadata = {
  title: 'Race Calendar | Telemetrix',
  description: 'Full Formula 1 race calendar, track layouts, session times, and historical winners.',
};

async function getCalendarData() {
  try {
    const res = await fetch('http://localhost:5000/api/calendar', {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return null;
  }
}

export default async function CalendarPage() {
  const calendar = await getCalendarData();

  if (!calendar) {
    return <div className="p-8 text-center text-destructive">Failed to load calendar data.</div>;
  }

  const now = new Date();
  
  // Find the 'next' race (the first race in the calendar that is strictly in the future)
  const nextRaceObj = calendar.find((race: any) => new Date(`${race.date}T${race.time || '00:00:00Z'}`) > now);
  const nextRaceId = nextRaceObj ? nextRaceObj.round : null;

  return (
    <GsapFadeIn className="max-w-7xl mx-auto flex flex-col gap-6 pb-12" duration={0.7} yOffset={30}>
      <div className="flex justify-between items-end mb-4 px-2">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Race Calendar</h1>
            <p className="text-muted-foreground mt-1">2026 FIA Formula One World Championship</p>
         </div>
      </div>

      <div className="flex flex-col gap-4">
        {calendar.map((race: any) => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          const isCompleted = raceDate < now;
          const isNext = race.round === nextRaceId;

          // Determine hover states based on completion
          let interactiveClasses = isNext 
             ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.15)] ring-1 ring-primary/50 scale-[1.01] z-10 my-2" 
             : "hover:border-primary/30 hover:bg-secondary/10 group";
          
          if (isCompleted) {
             interactiveClasses += " opacity-70 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 transition-all duration-300";
          }

          return (
            <Link key={race.round} href={`/calendar/${race.round}`} className="block focus:outline-none">
              <Card className={`flex flex-col md:flex-row justify-between items-stretch gap-6 relative overflow-hidden p-6 md:p-8 ${interactiveClasses}`}>
                 {/* Status Indicator Bar */}
                 <div className={`absolute left-0 top-0 bottom-0 w-2 ${isNext ? 'bg-primary' : (isCompleted ? 'bg-white/20' : 'bg-white/10')}`}></div>
                 
                 {/* Background glowing effects based on status */}
                 {isNext && <div className="absolute top-1/2 left-1/4 w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none z-0"></div>}
                 
                 {/* Left Side: Info */}
                 <div className="flex-1 flex flex-col z-10 w-full md:w-auto">
                   <div className="flex items-center gap-4 mb-3">
                     <span className={`text-xs font-bold uppercase tracking-widest ${isNext ? 'text-primary' : 'text-muted-foreground'}`}>
                       Round {race.round}
                     </span>
                     {isNext && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Next</span>}
                     {isCompleted && <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Finished</span>}
                   </div>
                   
                   <h2 className="text-3xl font-black uppercase tracking-tight text-foreground mb-1">{race.Circuit.Location.country}</h2>
                   <h3 className="text-xl font-bold leading-tight text-muted-foreground mb-3">{race.raceName}</h3>
                   <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {race.Circuit.circuitName}
                   </p>

                   <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/10">
                      <DataField 
                        label={raceDate.toLocaleDateString('en-US', { weekday: 'short' })} 
                        value={raceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                      />
                      <DataField 
                        label="Race Time" 
                        value={raceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} 
                      />
                      
                      {isCompleted && race.winner && (
                        <div className="ml-auto">
                           <DataField 
                             label="Race Winner" 
                             value={`🏆 ${race.winner.familyName}`} 
                           />
                        </div>
                      )}
                   </div>
                 </div>

                 {/* Right Side: Track Layout Image */}
                 <div className="w-full md:w-[35%] h-48 md:h-auto min-h-[160px] rounded-2xl flex items-center justify-center bg-black/20 p-4 relative overflow-hidden z-10 mt-6 md:mt-0">
                    <Image 
                      src={`/tracks/${race.Circuit.circuitId}.png`} 
                      alt={`${race.Circuit.circuitName} Layout`} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] p-6 group-hover:scale-105 transition-transform duration-500"
                    />
                 </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </GsapFadeIn>
  );
}
