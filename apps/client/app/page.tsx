import { Suspense } from 'react';
import Link from 'next/link';
import TrackLayoutWidget from '../components/TrackLayoutWidget';
import SessionTracker from '../components/SessionTracker';
import TyreBadges from '../components/TyreBadges';
import CompactPodium from '../components/CompactPodium';
import RaceFactsWidget from '../components/RaceFactsWidget';
import ClassificationList from '../components/ClassificationList';
import { getDaysToRace } from '../utils/time';
import { Metadata } from 'next';

export const revalidate = 60; // 1 minute

export const metadata: Metadata = {
  title: 'Dashboard | Telemetrix',
  description: 'Live F1 dashboard featuring race countdowns, weather, track stats, and live timing data.',
};

async function getDashboardData() {
  try {
    const res = await fetch('http://localhost:5000/api/dashboard?v=3', {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return null;
  }
}

async function getNewsData() {
  try {
    const res = await fetch('http://localhost:5000/api/news', {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export default async function Home() {
  const [data, newsData] = await Promise.all([
    getDashboardData(),
    getNewsData()
  ]);

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data. Ensure backend is running.</div>;
  }

  const { nextRace, lastRace, lastRacePodium, weather, fastestPitStop, lastRaceQualifying, circuitStats, tyres, driverOfTheDay, openf1Sessions } = data;

  const daysToRace = getDaysToRace(nextRace?.date, nextRace?.time);
  
  // Check if today is strictly the race day by matching the date strings
  const todayIsoString = new Date().toISOString().split('T')[0];
  const isRaceDay = nextRace?.date === todayIsoString;

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
      const res = await fetch(`https://www.formula1.com/en/racing/${year}/${nextRace.Circuit.Location.country}.html`, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 } 
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(new RegExp(`FORMULA 1.*?${year}`, 'i'));
        if (match && match[0]) {
          officialName = match[0].toUpperCase();
        }
      }
    } catch (e) {
      console.error('Failed to scrape official name:', e);
    }
  }

  const shortName = nextRace?.Circuit?.Location?.country ? nextRace.Circuit.Location.country.toUpperCase() : 'SEASON OVER';

  const sessionList = ['FirstPractice', 'Qualifying', 'Race'].map(sessionKey => {
    let dateStr = sessionKey === 'Race' ? nextRace?.date : nextRace?.[sessionKey]?.date;
    let timeStr = sessionKey === 'Race' ? nextRace?.time : nextRace?.[sessionKey]?.time;
    
    const labels = { FirstPractice: 'FP1', Qualifying: 'QUAL', Race: 'RACE' };
    const openf1Map = { FirstPractice: 'Practice 1', Qualifying: 'Qualifying', Race: 'Race' };
    
    let openF1EndTimeStr = undefined;
    if (openf1Sessions) {
      const f1Session = openf1Sessions.find((s: any) => s.session_name === openf1Map[sessionKey as keyof typeof openf1Map]);
      if (f1Session?.date_end) openF1EndTimeStr = f1Session.date_end;
    }

    return {
      name: sessionKey,
      label: labels[sessionKey as keyof typeof labels],
      dateStr,
      timeStr,
      openF1EndTimeStr
    };
  });

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
              
              {isRaceDay ? (
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-primary drop-shadow-2xl leading-none animate-pulse">
                     It's Race Day
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-4 mb-6">
                   <div className="text-8xl lg:text-9xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-2xl leading-none">
                      {daysToRace}
                   </div>
                   <div className="text-sm lg:text-base text-muted-foreground uppercase tracking-[0.3em] font-bold pb-2">
                     Days<br/>Remaining
                   </div>
                </div>
              )}
            </div>

            {/* Circuit Information Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 border-t border-border/40 pt-8 mt-2">
              
              <SessionTracker sessions={sessionList} />

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
                  <TyreBadges tyres={displayCircuitStats.tyres} />
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

          {/* RIGHT SIDE: Track Layout */}
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

            <div className="bg-card/30 border border-border/30 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
               <h3 className="text-xs font-semibold mb-6 text-muted-foreground uppercase tracking-[0.3em] text-center">Podium</h3>
               <CompactPodium podium={lastRacePodium} />
            </div>

            <RaceFactsWidget 
               fastestLapTime={prevFastestLapTime}
               fastestLapDriver={prevFastestLapDriver}
               fastestPitTime={fastestPitTime}
               fastestPitDriver={fastestPitDriver}
               driverOfDay={prevDriverOfDay}
               polePosition={prevPolePosition}
            />
          </div>

          {/* RIGHT SIDE: Full Classification */}
          <ClassificationList results={lastRace?.Results} date={lastRace?.date} />
        </div>
      </section>

      {/* LATEST NEWS SECTION */}
      {newsData?.news && newsData.news.length > 0 && (
        <section className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -ml-4 md:-ml-8 flex flex-col items-center pl-8 sm:pl-12 lg:pl-24 pr-8 lg:pr-24 py-16 lg:py-24 bg-background">
          <div className="w-full flex flex-col gap-10">
            {/* Section Header */}
            <div className="flex items-center justify-between w-full">
               <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                     <span className="text-sm font-bold uppercase tracking-widest text-primary">Latest</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">Paddock News</h2>
               </div>
            </div>

            {/* News Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newsData.news.slice(0, 4).map((article: any, index: number) => (
                <a 
                  key={index} 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-3xl block shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-border/20 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] col-span-1"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url(${article.imageUrl})` }}
                  />
                  <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-[2px]"></div>
                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
                    <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white bg-primary rounded-sm shadow-md mb-3 w-fit">
                      {article.source}
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-4">
                      {article.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-4">
               <Link href="/news" className="group flex items-center gap-2 px-6 py-3 rounded-full bg-card hover:bg-white/10 border border-border/40 transition-all shadow-md hover:shadow-lg backdrop-blur-md">
                 <span className="text-sm font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">View All News</span>
                 <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
