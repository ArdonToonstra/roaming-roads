'use client';
// Spinnable schematic globe for /globe, in the same style as TripSchematicMap: visited countries in white,
// one marker per trip. Drag to rotate; picking a trip (on the globe or in the list) flies the globe there.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import type { FeatureCollection, Geometry } from 'geojson';
import { Clock, X } from 'lucide-react';

export type GlobeTrip = {
  slug: string;
  title: string;
  status: 'coming_soon' | 'published' | 'draft';
  period?: string;
  image: string;
  coord: [number, number]; // [lng, lat]
};

const SIZE = 800;
const RADIUS = 380;
const countries = (feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>).features;
const graticule = geoGraticule10();

type Rotation = [number, number];
const noop = () => () => {};
const centerOn = ([lng, lat]: [number, number]): Rotation => [-lng, Math.max(-60, Math.min(60, -lat))];

export default function GlobeMap({ trips, visitedIds }: { trips: GlobeTrip[]; visitedIds: string[] }) {
  const [rotation, setRotation] = useState<Rotation>([30, -15]); // Atlantic: Americas and Europe both in view
  const [selected, setSelected] = useState<GlobeTrip | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; from: Rotation; moved: boolean } | null>(null);
  const dragged = useRef(false); // so the click that ends a drag doesn't close the popup
  const spinning = useRef(true); // gentle auto-spin until the first interaction
  const flight = useRef(0);
  // The globe is drawn client-side only: server and browser trig differ in the last digits, which breaks hydration.
  const isClient = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = performance.now();
    let id = requestAnimationFrame(function tick(t) {
      if (spinning.current) setRotation(([l, p]) => [l + (t - last) * 0.006, p]);
      last = t;
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const flyTo = (trip: GlobeTrip) => {
    spinning.current = false;
    setSelected(trip);
    cancelAnimationFrame(flight.current);
    const [l0, p0] = rotation;
    const [l1, p1] = centerOn(trip.coord);
    const dl = ((((l1 - l0) % 360) + 540) % 360) - 180; // shortest way round
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setRotation([l0 + dl, p1]);
    const start = performance.now();
    flight.current = requestAnimationFrame(function step(t) {
      const x = Math.min(1, (t - start) / 900);
      const e = x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2; // ease in-out
      setRotation([l0 + dl * e, p0 + (p1 - p0) * e]);
      if (x < 1) flight.current = requestAnimationFrame(step);
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    spinning.current = false;
    cancelAnimationFrame(flight.current);
    drag.current = { x: e.clientX, y: e.clientY, from: rotation, moved: false };
    dragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const [dx, dy] = [e.clientX - d.x, e.clientY - d.y];
    // Capture only once it's a real drag, so a plain click still reaches the marker under the pointer.
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) svgRef.current?.setPointerCapture(e.pointerId);
    d.moved = true;
    dragged.current = true;
    const degPerPx = (SIZE / (svgRef.current?.getBoundingClientRect().width || SIZE)) * (180 / (Math.PI * RADIUS));
    setRotation([d.from[0] + dx * degPerPx, Math.max(-60, Math.min(60, d.from[1] - dy * degPerPx))]);
  };
  const onPointerUp = () => (drag.current = null);

  const projection = geoOrthographic().scale(RADIUS).translate([SIZE / 2, SIZE / 2]).rotate(rotation);
  const path = geoPath(projection);
  const facing: [number, number] = [-rotation[0], -rotation[1]];
  const visible = trips.filter((t) => geoDistance(t.coord, facing) < Math.PI / 2 - 0.05);
  const popupAt = isClient && selected && visible.includes(selected) ? projection(selected.coord) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
      <div className="relative w-full max-w-[720px] mx-auto lg:sticky lg:top-28">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full touch-none select-none cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Globe with our trips. Drag to rotate."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => !dragged.current && setSelected(null)}
      >
        <defs>
          <radialGradient id="globe-shade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="100%" stopColor="#4C3A7A" stopOpacity={0.18} />
          </radialGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="#EAF4F3" />
        {isClient && <path d={path(graticule) ?? ''} fill="none" stroke="#D4E8E6" strokeWidth={0.75} />}
        {isClient && countries.map((f, i) => {
          const visited = visitedIds.includes(String(f.id));
          return (
            <path
              key={i}
              d={path(f) ?? ''}
              fill={visited ? '#FFFFFF' : '#F7F5F0'}
              stroke={visited ? '#4C3A7A' : '#D6D1C4'}
              strokeWidth={visited ? 1.5 : 0.75}
              strokeLinejoin="round"
            />
          );
        })}
        {isClient && visible.map((t) => {
          const [x, y] = projection(t.coord) ?? [0, 0];
          const isSelected = selected?.slug === t.slug;
          return (
            <g
              key={t.slug}
              role="button"
              tabIndex={0}
              aria-label={t.title}
              className="cursor-pointer outline-none group"
              onClick={(e) => (e.stopPropagation(), flyTo(t))}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), flyTo(t))}
            >
              <title>{t.title}</title>
              <circle cx={x} cy={y} r={18} fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 11 : 8}
                fill={isSelected ? '#4C3A7A' : t.status === 'coming_soon' ? '#9CA3AF' : '#F57D50'}
                stroke="#FFFFFF"
                strokeWidth={3}
                className="transition-[r,fill] group-hover:fill-[#4C3A7A] group-focus-visible:fill-[#4C3A7A]"
              />
            </g>
          );
        })}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="url(#globe-shade)" stroke="#4C3A7A" strokeOpacity={0.25} pointerEvents="none" />
      </svg>
      {selected && popupAt && (
        // Sits just above the selected marker and follows it while the globe turns.
        <div
          className="absolute z-10 w-72 sm:w-60 -translate-x-1/2 -translate-y-[calc(100%+22px)]"
          style={{ left: `${(popupAt[0] / SIZE) * 100}%`, top: `${(popupAt[1] / SIZE) * 100}%` }}
        >
          <TripCard trip={selected} onClose={() => setSelected(null)} />
        </div>
      )}
      </div>

      <aside>
        <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
          {trips.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => flyTo(t)}
                aria-pressed={selected?.slug === t.slug}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 ${selected?.slug === t.slug ? 'bg-gray-50 font-semibold' : ''}`}
              >
                <span className="text-gray-800">{t.title}</span>
                {t.status === 'coming_soon' ? (
                  <Clock size={14} className="text-gray-400 shrink-0" aria-label="Coming soon" />
                ) : (
                  t.period && <span className="text-xs text-gray-500 whitespace-nowrap">{t.period}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function TripCard({ trip, onClose }: { trip: GlobeTrip; onClose: () => void }) {
  const comingSoon = trip.status === 'coming_soon';
  return (
    <div className="relative flex sm:block bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 text-gray-700 flex items-center justify-center hover:bg-white"
      >
        <X size={16} />
      </button>
      <div className="relative w-24 shrink-0 sm:w-full sm:h-32">
        <Image src={trip.image} alt={trip.title} fill unoptimized className={`object-cover ${comingSoon ? 'grayscale' : ''}`} />
      </div>
      {/* Phones get a compact row (photo left) so the card fits above the marker on a small globe. */}
      <div className="p-3 pr-9 sm:pr-3">
        <h2 className="font-heading font-bold text-base sm:text-lg leading-tight text-[#4C3A7A]">{trip.title}</h2>
        {trip.period && <p className="text-sm text-gray-500 mb-2">{trip.period}</p>}
        {comingSoon ? (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Clock size={14} /> Coming soon
          </p>
        ) : (
          <Link href={`/trips/${trip.slug}`} className="inline-block px-3 py-1.5 rounded-lg text-sm text-white font-bold bg-[#2A9D8F] hover:opacity-90">
            View trip &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
