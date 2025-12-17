import { payload } from '@/lib/api';
import { Trip } from '@/types/payload';
import { notFound } from 'next/navigation';
import StepsLayout from '@/components/StepsLayout';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';

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
    <div className="steps-page min-h-screen bg-background">
      {/* Subtle header with logo and back button */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Roaming Roads Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
            >
              <div className="w-6 h-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 579 521" className="w-6 h-6">
                  <path fill="#F47626" d="M108.075 96.6192C115.974 87.9534 123.274 79.8919 132.1 72.0797C172.308 36.5263 223.552 15.9324 277.183 13.7741C335.842 11.0093 399.496 32.2106 443.016 72.0095C451.97 80.1985 459.462 88.3167 467.303 97.5713C481.783 112.509 492.198 133.189 501.241 151.744C502.778 154.896 503.935 158.322 505.4 161.327C504.244 162.121 502.82 163.161 501.656 163.886C484.289 175.9 459.69 185.052 439.295 190.425C395.672 201.73 349.643 199.521 307.303 184.089C286.618 176.57 269.694 168.173 248.189 161.937C207.533 150.294 164.469 149.971 123.643 161.003C98.4094 167.971 79.1274 179.411 58.3923 194.882C59.5204 191.959 60.7079 187.608 61.6538 184.53C63.3785 178.814 65.2432 173.141 67.2465 167.516C74.3151 147.999 83.8524 129.468 95.6261 112.373C99.619 106.548 103.054 101.608 108.075 96.6192Z" />
                  <path fill="url(#gradient_0)" d="M68.8246 336.919C68.437 336.054 67.8729 335.151 68.0907 334.29C69.9127 332.819 81.6823 326.815 84.1418 325.525C121.868 306.055 164.508 298.173 206.702 302.87C222.267 304.52 237.502 307.702 252.398 312.526C276.038 320.18 298.389 331.104 322.366 337.828C363.24 349.289 402.789 348.925 443.913 339.306C449.832 337.459 456.135 335.694 461.945 333.634C474.196 329.295 485.96 323.686 497.045 316.9C503.441 313.041 511.301 306.881 517.025 303.701L516.858 304.04C515.399 307.046 513.502 313.575 512.404 317.03C510.707 322.522 508.805 327.948 506.702 333.298C498.354 354.571 487.113 374.591 473.296 392.794C471.763 394.809 467.282 400.547 465.356 401.789C456.667 411.564 449.066 419.578 438.965 428.184C400.959 460.55 353.553 479.841 303.745 483.21C240.386 487.52 177.96 466.143 130.546 423.901C123.753 417.763 117.236 411.326 111.014 404.61C108.209 402.567 103.226 395.968 101.018 393.029C87.9502 375.639 76.8481 357.191 68.8246 336.919Z" />
                  <defs>
                    <linearGradient id="gradient_0" gradientUnits="userSpaceOnUse" x1="112.27674" y1="406.53159" x2="456.16324" y2="455.32516">
                      <stop offset="0" stopColor="#603B81" />
                      <stop offset="1" stopColor="#344BA0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-heading font-bold text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Roaming Roads
              </span>
            </Link>
            
            {/* Trip title and Detailed Itinerary */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-sm font-medium text-foreground/80 truncate max-w-xs">
                {trip.title}
              </span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-xs font-medium text-muted-foreground/70 tracking-wide">
                Detailed Itinerary
              </span>
            </div>
          </div>
          
          {/* Back button */}
          <Link 
            href={`/trips/${slug}`} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-card transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Trip Overview</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <StepsLayout trip={trip} />
    </div>
  );
}
