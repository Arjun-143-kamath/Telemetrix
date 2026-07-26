import { Suspense } from 'react';
import Link from 'next/link';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import { Metadata } from 'next';

export const revalidate = 60; // 1 minute

export const metadata: Metadata = {
  title: 'Grand Prix Dashboard | Telemetrix',
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

export default async function Dashboard() {
  const data = await getDashboardData();

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data. Ensure backend is running.</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-12 relative w-full overflow-hidden">
       {/* Background ambient glow */}
       <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
       <DashboardTabs data={data} />
    </div>
  );
}
