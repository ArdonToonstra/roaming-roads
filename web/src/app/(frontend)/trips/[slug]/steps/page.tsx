import { data } from '@/lib/data';
import { Trip } from '@/types/payload';
import { notFound } from 'next/navigation';
import StepsLayout from '@/components/StepsLayout';

interface StepsPageProps { params: Promise<{ slug: string }> }

async function getTrip(slugOrId: string): Promise<Trip | null> {
  try {
    if (slugOrId.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/i)) return null;
    const response = await data.getTrip(slugOrId);
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

  return <StepsLayout trip={trip} />;
}
