import { payload } from '@/lib/api';
import { Trip } from '@/types/payload';
import { notFound } from 'next/navigation';
import StepsLayout from '@/components/StepsLayout';
import Link from 'next/link';

interface StepsPageProps { params: Promise<{ slug: string }> }

async function getTrip(slugOrId: string): Promise<Trip | null> {
  try {
    if (slugOrId.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/i)) return null;
    const response = await payload.getTrip(slugOrId);
    return response;
  } catch (e) {
    console.error('[steps] failed to fetch trip', e);
    return null;
  }
}

export default async function StepsPage({ params }: StepsPageProps) {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) notFound();
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-4 bg-card">
        <Link href={`/trips/${slug}`} className="text-sm font-medium text-primary hover:underline">← Back to Trip Overview</Link>
        <span className="text-xs text-muted-foreground">Steps Map & Itinerary</span>
      </div>
      <StepsLayout trip={trip} />
    </div>
  );
}
