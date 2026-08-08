import RaceDetailsClient from './RaceDetailsClient';
import { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '../../../utils/time';
import GsapFadeIn from '../../../components/ui/GsapFadeIn';

export async function generateMetadata({ params }: { params: Promise<{ round: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return { title: `Race Details | Round ${resolvedParams.round}` };
}

async function getRaceData(round: string) {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const res = await fetch(`${url}/races/${round}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function RaceDetailsPage({ params }: { params: Promise<{ round: string }> }) {
  const resolvedParams = await params;
  let data;
  try {
     data = await getRaceData(resolvedParams.round);
  } catch(e) {
     return <div className="p-8 text-center text-destructive">Failed to load race details.</div>;
  }
  
  if (!data || data.error) {
    return <div className="p-8 text-center text-destructive">Failed to load race details.</div>;
  }

  return (
    <GsapFadeIn className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 px-4 sm:px-6" duration={0.7} yOffset={30}>
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <Link href="/calendar" className="text-primary text-sm font-bold flex items-center gap-2 mb-2 hover:underline">
          &larr; Back to Calendar
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">{data.raceName}</h1>
            <p className="text-xl text-muted-foreground mt-1">{data.circuit?.circuitName || 'N/A'} - {data.circuit?.Location?.country || 'N/A'}</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-bold">{formatDate(data.date, data.time)}</span>
          </div>
        </div>
      </div>
      <RaceDetailsClient data={data} />
    </GsapFadeIn>
  );
}
