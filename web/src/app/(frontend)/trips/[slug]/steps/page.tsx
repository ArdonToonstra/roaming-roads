import { data } from '@/lib/data';
import { notFound } from 'next/navigation';
import StepsLayout from '@/components/StepsLayout';

interface StepsPageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await data.getTripSlugs()).map((slug) => ({ slug }));
}

export default async function StepsPage({ params }: StepsPageProps) {
  const { slug } = await params;
  const trip = await data.getTrip(slug);
  if (!trip) notFound();

  return <StepsLayout trip={trip} />;
}
