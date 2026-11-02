import HomeGlobe from '@/components/HomeGlobe';

export default function HomePage() {
  return (
    <main className="min-h-[70vh] bg-muted flex items-center justify-center px-4 py-20">
      <h1 className="sr-only">Roaming Roads</h1>
      <HomeGlobe />
    </main>
  );
}
