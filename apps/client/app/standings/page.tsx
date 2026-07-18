import PointsChart from '../../components/PointsChart';
import { Metadata } from 'next';

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Championship Standings | Telemetrix',
  description: 'Current Formula 1 driver and constructor championship standings and charts.',
};

async function getStandingsData() {
  try {
    const res = await fetch('http://localhost:5000/api/standings', {
      next: { revalidate: 1800 }
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error('Error fetching standings:', error);
    return null;
  }
}

export default async function StandingsPage() {
  const data = await getStandingsData();

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load standings data.</div>;
  }

  const { driverStandings, constructorStandings, records, chartData } = data;
  const topDrivers = driverStandings?.slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Achievements Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Most Wins */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform"></div>
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Most Wins</h3>
           <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-black">{records.mostWins?.driver?.familyName}</span>
                <span className="block text-sm text-blue-500 font-medium">{records.mostWins?.driver?.givenName}</span>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-bold">{records.mostWins?.count}</span>
                 <span className="block text-xs text-muted-foreground">WINS</span>
              </div>
           </div>
        </div>

        {/* Most Pole Positions */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform"></div>
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Most Pole Positions</h3>
           <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-black">{records.polePositionKing?.driver?.familyName}</span>
                <span className="block text-sm text-primary font-medium">{records.polePositionKing?.driver?.givenName}</span>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-bold">{records.polePositionKing?.count}</span>
                 <span className="block text-xs text-muted-foreground">POLES</span>
              </div>
           </div>
        </div>

        {/* Most Podiums */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform"></div>
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Most Podiums</h3>
           <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-black">{records.podiumFinisher?.driver?.familyName}</span>
                <span className="block text-sm text-yellow-500 font-medium">{records.podiumFinisher?.driver?.givenName}</span>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-bold">{records.podiumFinisher?.count}</span>
                 <span className="block text-xs text-muted-foreground">PODIUMS</span>
              </div>
           </div>
        </div>

      </div>

      {/* Championship Battle Chart (Full Width) */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-foreground uppercase tracking-widest">Championship Battle</h3>
          <span className="text-xs text-muted-foreground bg-accent/50 px-3 py-1 rounded-full border border-border/50">Top 5 Drivers</span>
        </div>
        <div className="w-full h-[400px]">
           <PointsChart data={chartData} drivers={topDrivers} />
        </div>
      </div>

      {/* Standings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Drivers Table */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
           <h3 className="text-lg font-semibold mb-6 uppercase tracking-widest border-b border-border/50 pb-4">Driver Standings</h3>
           <div className="space-y-2">
             {driverStandings.map((driver: any, index: number) => (
               <div key={driver.Driver.driverId} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent/40 transition-colors border border-transparent hover:border-border/50">
                 <div className="flex items-center space-x-4">
                   <span className={`text-lg font-black w-6 text-center ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{driver.position}</span>
                   <div>
                     <span className="font-bold text-foreground block">{driver.Driver.givenName} {driver.Driver.familyName}</span>
                     <span className="text-xs text-muted-foreground">{driver.Constructors[0]?.name}</span>
                   </div>
                 </div>
                 <div className="text-right">
                   <span className="text-xl font-bold">{driver.points}</span>
                   <span className="block text-[10px] text-muted-foreground uppercase">{driver.wins} Wins</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Constructors Table */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 h-fit">
           <h3 className="text-lg font-semibold mb-6 uppercase tracking-widest border-b border-border/50 pb-4">Constructor Standings</h3>
           <div className="space-y-2">
             {constructorStandings.map((team: any, index: number) => (
               <div key={team.Constructor.constructorId} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent/40 transition-colors border border-transparent hover:border-border/50">
                 <div className="flex items-center space-x-4">
                   <span className={`text-lg font-black w-6 text-center ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{team.position}</span>
                   <span className="font-bold text-foreground text-lg">{team.Constructor.name}</span>
                 </div>
                 <div className="text-right">
                   <span className="text-xl font-bold">{team.points}</span>
                   <span className="block text-[10px] text-muted-foreground uppercase">{team.wins} Wins</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>

    </div>
  );
}
