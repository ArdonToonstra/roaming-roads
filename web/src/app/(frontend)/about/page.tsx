import { Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-[70vh] bg-muted flex items-center justify-center px-4 py-20">
      <h1 className="sr-only">About Roaming Roads</h1>
      <p className="font-heading text-2xl sm:text-3xl text-muted-foreground flex items-center gap-3">
        Made with <Heart className="w-7 h-7 text-primary fill-current" aria-label="love" /> from Antwerp
      </p>
    </main>
  );
}
