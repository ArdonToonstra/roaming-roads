'use client';
// The home page: a small globe turning slowly, with a Claude-style "busy" line underneath
// that cycles through travel verbs. Same palette and data as GlobeMap.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import type { FeatureCollection, Geometry } from 'geojson';

const SIZE = 240;
const countries = (feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>).features;
const graticule = geoGraticule10();
const GLYPHS = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
const WORDS = [
  'Roaming', 'Wandering', 'Packing', 'Unpacking', 'Repacking', 'Island hopping', 'Chasing sunsets',
  'Catching the ferry', 'Finding the bus', 'Haggling', 'Pitching the tent', 'Acclimatising',
  'Summiting', 'Snorkelling', 'Diving', 'Road tripping', 'Getting lost', 'Asking for directions',
  'Sipping masala chai', 'Tasting street food', 'Hitchhiking', 'Jet-lagging', 'Glacier walking',
  'Spotting whales', 'Waiting for the jeep', 'Napping in a hammock', 'Collecting stamps', 'Daydreaming',
];
// Every 10 words the globe fades into the next look.
const STYLES = [
  { ocean: '#EAF4F3', grid: '#D4E8E6', land: '#F7F5F0', border: '#D6D1C4', rim: '#4C3A7A' }, // pastel, as on /globe
  { ocean: '#1E2A4A', grid: '#2C3B63', land: '#33406A', border: '#F4C36A', rim: '#0F172A' }, // night
  { ocean: '#F9B48E', grid: '#FBC6A6', land: '#4C3A7A', border: '#6B58A0', rim: '#F57D50' }, // sunset, logo colours
  { ocean: '#F4F8FB', grid: '#C9DBEA', land: '#F4F8FB', border: '#2F6FA7', rim: '#2F6FA7' }, // blueprint
];
const WORDS_PER_STYLE = 10;
const noop = () => () => {};

export default function HomeGlobe() {
  const [lng, setLng] = useState(-20);
  const [glyph, setGlyph] = useState(0);
  const [{ word, count }, setWords] = useState({ word: 0, count: 0 });
  const look = STYLES[Math.floor(count / WORDS_PER_STYLE) % STYLES.length];
  // Drawn client-side only, like GlobeMap: server and browser trig differ in the last digits.
  const isClient = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = performance.now();
    let id = requestAnimationFrame(function tick(t) {
      setLng((l) => l + (t - last) * 0.008);
      last = t;
      id = requestAnimationFrame(tick);
    });
    const glyphs = setInterval(() => setGlyph((g) => (g + 1) % GLYPHS.length), 120);
    // ponytail: random next word, never the same twice in a row.
    const words = setInterval(
      () => setWords(({ word: w, count: c }) => ({ word: (w + 1 + Math.floor(Math.random() * (WORDS.length - 1))) % WORDS.length, count: c + 1 })),
      2600,
    );
    return () => (cancelAnimationFrame(id), clearInterval(glyphs), clearInterval(words));
  }, []);

  const path = geoPath(geoOrthographic().scale(SIZE / 2 - 4).translate([SIZE / 2, SIZE / 2]).rotate([lng, -15]));

  return (
    <div className="flex flex-col items-center gap-8">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-48 sm:w-60" role="img" aria-label="A globe, slowly turning">
        <defs>
          <radialGradient id="home-globe-shade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="100%" stopColor="#4C3A7A" stopOpacity={0.18} />
          </radialGradient>
        </defs>
        {/* Colours go through style (not attributes) so the CSS transition can fade between looks. */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 4} className="globe-fade" style={{ fill: look.ocean }} />
        {isClient && <path d={path(graticule) ?? ''} fill="none" strokeWidth={0.5} className="globe-fade" style={{ stroke: look.grid }} />}
        {isClient && countries.map((f, i) => (
          <path key={i} d={path(f) ?? ''} strokeWidth={0.5} className="globe-fade" style={{ fill: look.land, stroke: look.border }} />
        ))}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 4} fill="url(#home-globe-shade)" strokeOpacity={0.35} className="globe-fade" style={{ stroke: look.rim }} />
      </svg>
      <p className="font-mono text-base sm:text-lg text-primary flex items-center gap-2" aria-live="off">
        <span className="w-4 text-center" aria-hidden>{GLYPHS[glyph]}</span>
        <span key={word} className="travel-shimmer inline-block">{WORDS[word]}…</span>
      </p>
    </div>
  );
}
