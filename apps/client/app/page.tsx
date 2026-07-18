import { Suspense } from 'react';
import PointsChart from '../components/PointsChart';
import TrackLayoutWidget from '../components/TrackLayoutWidget';
import { Metadata } from 'next';

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Dashboard | Telemetrix',
  description: 'Live F1 dashboard featuring race countdowns, weather, track stats, and live timing data.',
};

async function getDashboardData() {
  try {
    const res = await fetch('http://localhost:5000/api/dashboard', {
      next: { revalidate: 1800 }
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return null;
  }
}

export default async function Home() {
  const data = await getDashboardData();

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data. Ensure backend is running.</div>;
  }

  const { nextRace, lastRace, lastRacePodium, weather, fastestPitStop, lastRaceQualifying, circuitStats, tyres, driverOfTheDay } = data;

  let daysToRace = 0;

  // Process Previous Race Facts
  let prevFastestLapDriver = 'Info not available';
  let prevFastestLapTime = 'Info not available';
  let prevDriverOfDay = driverOfTheDay || 'Info not available';
  let prevPolePosition = 'Info not available';
  
  if (lastRace?.Results) {
    const flResult = lastRace.Results.find((r: any) => r.FastestLap && r.FastestLap.rank === "1");
    if (flResult) {
      prevFastestLapDriver = `${flResult.Driver.givenName.charAt(0)}. ${flResult.Driver.familyName}`;
      prevFastestLapTime = flResult.FastestLap.Time.time;
    }
  }

  if (lastRaceQualifying?.QualifyingResults && lastRaceQualifying.QualifyingResults.length > 0) {
    const pole = lastRaceQualifying.QualifyingResults[0];
    prevPolePosition = `${pole.Driver.givenName.charAt(0)}. ${pole.Driver.familyName}`;
  }

  let fastestPitTime = fastestPitStop?.pit_duration ? `${fastestPitStop.pit_duration}s` : 'Info not available';
  let fastestPitDriver = 'Info not available';
  if (fastestPitStop && lastRace?.Results) {
    const pitDriver = lastRace.Results.find((r: any) => r.number === fastestPitStop.driver_number.toString());
    if (pitDriver) {
      fastestPitDriver = `${pitDriver.Driver.givenName.charAt(0)}. ${pitDriver.Driver.familyName}`;
    }
  }
  if (nextRace?.date) {
    const raceDate = new Date(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`);
    const now = new Date();
    const raceDay = Date.UTC(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    daysToRace = Math.max(0, Math.floor((raceDay - today) / (1000 * 3600 * 24)));
  }

  // Circuit Stats for UI
  const displayCircuitStats = {
    fastestLap: circuitStats?.fastestLap || 'Info not available',
    mostWins: circuitStats?.mostWins || 'Info not available',
    mostPoles: circuitStats?.mostPoles || 'Info not available',
    tyres: tyres || []
  };

  let officialName = `FORMULA 1 ${nextRace?.raceName ? nextRace.raceName.toUpperCase() : 'GRAND PRIX'} 2026`;
  const year = nextRace?.season || new Date().getFullYear();
  if (nextRace?.Circuit?.Location?.country) {
    try {
      // Scrape the official F1 website for the real sponsored name
      const res = await fetch(`https://www.formula1.com/en/racing/${year}/${nextRace.Circuit.Location.country}.html`, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 } 
      });
      if (res.ok) {
        const html = await res.text();
        const regex = new RegExp(`FORMULA 1.*?${year}`, 'i');
        const match = html.match(regex);
        if (match && match[0]) {
          officialName = match[0].toUpperCase();
        }
      }
    } catch (e) {
      console.error('Failed to scrape official name:', e);
    }
  }

  const shortName = nextRace?.Circuit?.Location?.country ? nextRace.Circuit.Location.country.toUpperCase() : 'SEASON OVER';

  return (
    <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* FULL SCREEN HERO: Next Race Information */}
      <section className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] h-[100vh] min-h-[100vh] -mt-4 md:-mt-8 -ml-4 md:-ml-8 flex items-stretch overflow-hidden pl-8 sm:pl-12 lg:pl-24 pr-8 sm:pr-12 lg:pr-24">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/4 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="w-full flex flex-col lg:flex-row items-stretch justify-between z-10 h-full">
          
          {/* LEFT SIDE: Data */}
          <div className="w-full lg:w-[45%] flex flex-col gap-10 lg:pr-8 pt-8 lg:pt-16 h-full justify-start">
            
            {/* Header & Title */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                 <span className="text-sm font-bold uppercase tracking-widest text-primary">Next Up</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase mb-4 leading-none">
                {shortName}
              </h1>
              <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {officialName}
              </h2>
              <h3 className="text-base text-muted-foreground font-medium mb-10">
                {nextRace?.Circuit?.circuitName}
              </h3>
              
              <div className="flex items-end gap-4 mb-6">
                 <div className="text-8xl lg:text-9xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-2xl leading-none">
                    {daysToRace}
                 </div>
                 <div className="text-sm lg:text-base text-muted-foreground uppercase tracking-[0.3em] font-bold pb-2">
                   Days<br/>Remaining
                 </div>
              </div>
            </div>

            {/* Circuit Information Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 border-t border-border/40 pt-8 mt-2">
              
              {/* Sessions */}
              <div className="flex flex-col gap-5">
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Sessions</span>
                {['FirstPractice', 'Qualifying', 'Race'].map((session, idx) => {
                  let time = 'TBA';
                  let sessionDateObj = null;
                  
                  if (session === 'Race') {
                    if (nextRace?.date) {
                      sessionDateObj = new Date(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`);
                    }
                  } else if (nextRace?.[session]) {
                    sessionDateObj = new Date(`${nextRace[session].date}T${nextRace[session].time || '00:00:00Z'}`);
                  }
                  
                  if (sessionDateObj) {
                    time = sessionDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  }
                  
                  const labels = { FirstPractice: 'FP1', Qualifying: 'QUAL', Race: 'RACE' };
                  const now = new Date();
                  
                  // A session is considered "Live" for 2 hours after its start time
                  const isLive = sessionDateObj ? now.getTime() >= sessionDateObj.getTime() && now.getTime() < sessionDateObj.getTime() + (2 * 3600 * 1000) : false;
                  // A session is considered "Done" 2 hours after its start time
                  const isDone = sessionDateObj ? now.getTime() >= sessionDateObj.getTime() + (2 * 3600 * 1000) : false;
                  
                  return (
                    <div key={session} className={`flex flex-col transition-all duration-500 ${isDone ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-muted-foreground' : 'text-primary'}`}>
                           {labels[session as keyof typeof labels]}
                         </span>
                         {isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                         )}
                       </div>
                       <span className={`text-lg font-bold ${isDone ? 'text-muted-foreground line-through decoration-muted-foreground/30' : (isLive ? 'text-primary' : 'text-foreground')}`}>
                         {time}
                       </span>
                    </div>
                  )
                })}
              </div>

              {/* Weather & Tyres */}
              <div className="flex flex-col gap-5">
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Conditions</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Track Temp</span>
                  <span className="text-2xl font-black">{weather?.track_temperature != null ? `${weather.track_temperature}°` : <span className="text-sm font-medium text-muted-foreground">Info not available</span>}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Rain Risk</span>
                  <span className="text-base font-bold text-success">{weather?.rainfall != null ? (weather.rainfall === 1 ? 'YES' : 'NONE') : <span className="text-sm font-medium text-muted-foreground">Info not available</span>}</span>
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Compounds</span>
                  <div className="flex gap-2">
                    {displayCircuitStats.tyres.length > 0 ? displayCircuitStats.tyres.map((t: string) => (
                      <span key={t} className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] font-bold text-foreground">
                        {t}
                      </span>
                    )) : (
                      <span className="text-sm font-medium text-muted-foreground">Info not available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Circuit Records */}
              <div className="flex flex-col gap-5 col-span-2 lg:col-span-1">
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Records</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Fastest Lap</span>
                  <span className="text-sm font-bold text-foreground">{displayCircuitStats.fastestLap}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Most Wins</span>
                  <span className="text-sm font-bold text-foreground">{displayCircuitStats.mostWins}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Most Poles</span>
                  <span className="text-sm font-bold text-foreground">{displayCircuitStats.mostPoles}</span>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SIDE: Track Layout (Massive, touching the edge) */}
          <div className="w-full lg:w-[55%] h-[50vh] lg:h-[100vh] flex items-center justify-center relative pointer-events-none">
             <div className="w-full h-full scale-110 lg:scale-[1.3] transform origin-center -translate-y-12 lg:-translate-y-24">
                <TrackLayoutWidget raceName={nextRace?.raceName || ''} circuitId={nextRace?.Circuit?.circuitId} />
             </div>
          </div>

        </div>
      </section>

      {/* FULL SCREEN HERO: Previous Race Information */}
      <section className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] min-h-[100vh] -ml-4 md:-ml-8 flex items-stretch overflow-hidden pl-8 sm:pl-12 lg:pl-24 pr-8 lg:pr-24 border-t border-border/20 mt-12 bg-background/50 backdrop-blur-md">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 right-1/4 w-[40vw] h-[40vw] bg-secondary/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="w-full flex flex-col lg:flex-row items-start justify-between z-10 h-full py-16 gap-12 lg:gap-24">
          
          {/* LEFT SIDE: Race Overview & Facts */}
          <div className="w-full lg:w-[45%] flex flex-col gap-10 h-full justify-start sticky top-16">
            
            {/* Header & Title */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-6 bg-muted-foreground rounded-full"></div>
                 <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Previous Race</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-2 leading-none">
                {lastRace?.raceName || 'Unknown Race'}
              </h1>
              <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest text-muted-foreground mb-10">
                {lastRace?.Circuit?.circuitName}
              </h2>
            </div>

            {/* Compact Podium */}
            <div className="bg-card/30 border border-border/30 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
               <h3 className="text-xs font-semibold mb-6 text-muted-foreground uppercase tracking-[0.3em] text-center">Podium</h3>
               {lastRacePodium && lastRacePodium.length > 0 ? (
                 <div className="flex justify-center items-end h-40 max-w-lg mx-auto gap-2 lg:gap-4">
                    {/* P2 */}
                    <div className="flex flex-col items-center w-1/3 group">
                       <span className="text-lg lg:text-xl font-black text-muted-foreground mb-2 group-hover:text-foreground transition-colors truncate">{lastRacePodium[1]?.Driver?.familyName}</span>
                       <div className="w-full bg-slate-300/10 h-24 rounded-t-xl border-t-4 border-slate-300 flex items-center justify-center text-2xl font-black text-slate-300 transition-all group-hover:bg-slate-300/20">2</div>
                    </div>
                    {/* P1 */}
                    <div className="flex flex-col items-center w-1/3 z-10 group">
                       <span className="text-xl lg:text-2xl font-black text-primary mb-2 group-hover:text-white transition-colors truncate">{lastRacePodium[0]?.Driver?.familyName}</span>
                       <div className="w-full bg-yellow-500/10 h-32 rounded-t-xl border-t-4 border-yellow-500 flex items-center justify-center text-4xl font-black text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all group-hover:bg-yellow-500/20">1</div>
                    </div>
                    {/* P3 */}
                    <div className="flex flex-col items-center w-1/3 group">
                       <span className="text-lg lg:text-xl font-black text-muted-foreground mb-2 group-hover:text-foreground transition-colors truncate">{lastRacePodium[2]?.Driver?.familyName}</span>
                       <div className="w-full bg-amber-600/10 h-16 rounded-t-xl border-t-4 border-amber-600 flex items-center justify-center text-2xl font-black text-amber-600 transition-all group-hover:bg-amber-600/20">3</div>
                    </div>
                 </div>
               ) : (
                 <div className="text-sm text-muted-foreground text-center py-6">No podium data</div>
               )}
            </div>

            {/* Race Facts Grid */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Fastest Lap</span>
                <span className="text-xl font-black text-foreground">{prevFastestLapTime}</span>
                <span className="text-sm font-medium text-muted-foreground">{prevFastestLapDriver}</span>
              </div>
              <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Fastest Pit Stop</span>
                <span className="text-xl font-black text-foreground">{fastestPitTime}</span>
                <span className="text-sm font-medium text-muted-foreground">{fastestPitDriver}</span>
              </div>
              <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Driver of the Day</span>
                <span className="text-lg font-black text-foreground mt-1">{prevDriverOfDay}</span>
              </div>
              <div className="bg-card/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Pole Position</span>
                <span className="text-lg font-black text-foreground mt-1">{prevPolePosition}</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Full Classification */}
          <div className="w-full lg:w-[55%] h-[80vh] flex flex-col relative border border-border/30 rounded-3xl bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
             
             {/* Header */}
             <div className="w-full px-8 py-6 border-b border-border/30 bg-card/40 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
               <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">Race Classification</h3>
               <span className="text-xs font-semibold text-muted-foreground uppercase">{lastRace?.date}</span>
             </div>

             {/* List */}
             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-2">
                  {lastRace?.Results?.map((result: any) => (
                    <div key={result.position} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-card/40 transition-colors border border-transparent hover:border-border/50 group">
                      
                      {/* Position */}
                      <div className="w-8 flex justify-center">
                        <span className="text-xl font-black text-muted-foreground group-hover:text-foreground transition-colors">
                          {result.position}
                        </span>
                      </div>

                      {/* Constructor Logo Placeholder */}
                      <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center shrink-0">
                         {/* TODO: Add actual logo images here */}
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
                           {result.points > 0 ? `+${result.points} PTS` : '0 PTS'}
                         </span>
                      </div>

                    </div>
                  ))}
                </div>
             </div>

          </div>

        </div>
      </section>

    </div>
  );
}
