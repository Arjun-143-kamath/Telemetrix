import Link from 'next/link';

async function getDashboardData() {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${url}/dashboard?v=3`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function LiveSessionIndicator() {
  const data = await getDashboardData();
  if (!data || !data.nextRace) {
     return null;
  }

  const { nextRace } = data;
  const venue = nextRace.Circuit?.Location?.country || nextRace.raceName;
  
  const possibleSessions = [
    { key: 'FirstPractice', label: 'FP1', durationMin: 60 },
    { key: 'SecondPractice', label: 'FP2', durationMin: 60 },
    { key: 'ThirdPractice', label: 'FP3', durationMin: 60 },
    { key: 'SprintQualifying', label: 'SQ', durationMin: 45 },
    { key: 'Sprint', label: 'Sprint', durationMin: 60 },
    { key: 'Qualifying', label: 'Qualifying', durationMin: 60 },
    { key: 'Race', label: 'Race', durationMin: 120 }
  ];

  const sessions = [];
  for (const s of possibleSessions) {
    let dateStr, timeStr;
    if (s.key === 'Race') {
      dateStr = nextRace.date;
      timeStr = nextRace.time;
    } else if (nextRace[s.key]) {
      dateStr = nextRace[s.key].date;
      timeStr = nextRace[s.key].time;
    }

    if (dateStr && timeStr) {
       const start = new Date(`${dateStr}T${timeStr}`).getTime();
       const end = start + s.durationMin * 60 * 1000;
       sessions.push({ ...s, start, end });
    }
  }

  // Sort sessions by start time
  sessions.sort((a, b) => a.start - b.start);

  const now = Date.now();
  const liveSession = sessions.find(s => now >= s.start && now <= s.end);
  const nextSession = sessions.find(s => s.start > now);

  if (liveSession) {
    return (
      <Link href="/dashboard" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold uppercase tracking-wider rounded-md shadow-[0_0_15px_rgba(253,38,92,0.4)] transition-all flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span className="hidden sm:inline">Live from {venue} {liveSession.label}</span>
        <span className="sm:hidden">Live: {liveSession.label}</span>
      </Link>
    );
  } else if (nextSession) {
    return (
      <Link href="/dashboard" className="px-4 py-2 border border-primary text-primary hover:bg-primary/10 text-xs md:text-sm font-bold uppercase tracking-wider rounded-md transition-all flex items-center space-x-2">
        <span className="hidden sm:inline">Next up: {venue} {nextSession.label}</span>
        <span className="sm:hidden">Next: {nextSession.label}</span>
      </Link>
    );
  } else {
    return null;
  }
}
