// Server component: renders the trip's country as a flat SVG silhouette with the
// itinerary drawn on top. No tiles, no client JS — markers are plain links.
import { geoArea, geoBounds, geoContains, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'i18n-iso-countries';
import world from 'world-atlas/countries-50m.json';
import world10 from 'world-atlas/countries-10m.json';
import geo from '@/data/geo-features.json'; // Natural Earth lakes + peaks, see scripts/fetch-geo.ts
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson';
import type { Country, Trip, TransportMethod } from '@/types/content';

const W = 800;
const PAD = 40;
const R = 13; // marker radius in viewBox units

// Drops shapes wound the wrong way round (the 10m Maldives), which d3 reads as "the whole globe except this" and paints over everything.
const atlas = (topo: unknown) =>
  (feature(topo as never, (topo as { objects: { countries: never } }).objects.countries) as unknown as FeatureCollection<Geometry>).features.filter(
    (f) => geoArea(f) < 2 * Math.PI
  );
const worldFeatures = atlas(world);
const worldFeatures10 = atlas(world10);
const { lakes, peaks } = geo as unknown as { lakes: Feature<Geometry, { name: string | null }>[]; peaks: [number, number, string, number][] };

type Pt = { x: number; y: number };
type Mode = 'drive' | 'bus' | 'flight' | 'boat' | 'train' | 'foot';
const MODES: Record<TransportMethod, Mode> = {
  rental_car: 'drive', taxi: 'drive', hitchhiking: 'drive', other: 'drive',
  public_bus: 'bus', tour_bus: 'bus', flight: 'flight', boat: 'boat', train: 'train', walking: 'foot', bicycle: 'foot',
};
const MODE_LABELS: Record<Mode, string> = { drive: 'Car', bus: 'Bus', flight: 'Flight', boat: 'Boat', train: 'Train', foot: 'On foot / bike' };

// One leg of the route, styled by how we travelled it.
function Leg({ mode, a, b, k }: { mode: Mode; a: Pt; b: Pt; k: number }) {
  const [dx, dy] = [b.x - a.x, b.y - a.y];
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / len, dx / len]; // unit normal
  const line = `M${a.x},${a.y}L${b.x},${b.y}`;
  switch (mode) {
    case 'flight': {
      const bend = ny < 0 ? 0.25 : -0.25; // arc bows upwards
      const c = { x: (a.x + b.x) / 2 + nx * len * bend, y: (a.y + b.y) / 2 + ny * len * bend };
      return <path d={`M${a.x},${a.y}Q${c.x},${c.y} ${b.x},${b.y}`} stroke="#4C3A7A" strokeOpacity={0.7} strokeWidth={2 * k} strokeDasharray={`${6 * k} ${5 * k}`} />;
    }
    case 'boat': {
      const n = Math.max(2, Math.round(len / (14 * k))); // waves
      const pts = Array.from({ length: n * 8 + 1 }, (_, i) => {
        const t = i / (n * 8);
        const off = Math.sin(t * n * 2 * Math.PI) * 3 * k;
        return `${(a.x + dx * t + nx * off).toFixed(1)},${(a.y + dy * t + ny * off).toFixed(1)}`;
      });
      return <polyline points={pts.join(' ')} stroke="#3A86B8" strokeWidth={2.5 * k} strokeLinejoin="round" />;
    }
    case 'train':
      return (
        <g stroke="#4C3A7A">
          <path d={line} strokeWidth={2 * k} />
          <path d={line} strokeWidth={8 * k} strokeDasharray={`${1.5 * k} ${7 * k}`} />
        </g>
      );
    case 'foot':
      return <path d={line} stroke="#F57D50" strokeWidth={3 * k} strokeDasharray={`0 ${6 * k}`} strokeLinecap="round" />;
    case 'bus':
      return <path d={line} stroke="#2A9D8F" strokeWidth={3 * k} strokeDasharray={`${10 * k} ${6 * k}`} />;
    default:
      return <path d={line} stroke="#2A9D8F" strokeWidth={3 * k} strokeDasharray={`${2 * k} ${7 * k}`} strokeLinecap="round" />;
  }
}

// Grow outwards from the biggest polygon, keeping sizeable pieces within ~5° of what's kept so far, so tiny
// islands and overseas territories (French Guiana, Easter Island) don't stretch the fit. A step's polygon always stays.
// ponytail: plain lon/lat boxes, breaks for countries crossing the antimeridian (Fiji, Russia) — none in the trips yet.
function corePolygons(f: Feature<Geometry>, steps: [number, number][]): Feature<Geometry>[] {
  if (f.geometry.type !== 'MultiPolygon') return [f];
  const polys = (f.geometry as MultiPolygon).coordinates
    .map((coordinates): Feature<Polygon> => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } }))
    .sort((a, b) => geoArea(b) - geoArea(a));
  const max = geoArea(polys[0]);
  let [[x0, y0], [x1, y1]] = geoBounds(polys[0]);
  return polys.filter((p, i) => {
    const [[a, b], [c, d]] = geoBounds(p);
    const near = a < x1 + 5 && c > x0 - 5 && b < y1 + 5 && d > y0 - 5;
    if (i > 0 && !steps.some((s) => geoContains(p, s)) && !(near && geoArea(p) > max * 0.02)) return false;
    [x0, y0, x1, y1] = [Math.min(x0, a), Math.min(y0, b), Math.max(x1, c), Math.max(y1, d)];
    return true;
  });
}

// ponytail: naive O(n²) repulsion so stacked markers stay readable; fine for itineraries of ~50 steps.
function spread(points: { x: number; y: number }[], gap: number) {
  const out = points.map((p) => ({ ...p }));
  for (let iter = 0; iter < 30; iter++) {
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const dx = out[j].x - out[i].x || 0.01;
        const dy = out[j].y - out[i].y;
        const d = Math.hypot(dx, dy);
        if (d >= gap) continue;
        const push = (gap - d) / 2;
        out[i].x -= (dx / d) * push;
        out[i].y -= (dy / d) * push;
        out[j].x += (dx / d) * push;
        out[j].y += (dy / d) * push;
      }
    }
  }
  return out;
}

export default function TripSchematicMap({ trip }: { trip: Trip }) {
  const ids = (trip.countries ?? [])
    .map((c) => (typeof c === 'object' ? (c as Country).countryCode : undefined))
    .map((code) => (code ? countries.alpha3ToNumeric(code) : undefined))
    .filter(Boolean);
  const tripCountries = worldFeatures.filter((f) => ids.includes(String(f.id)));

  let dayNo = 0; // matches the numbered fullDay list on the trip page, even for days without coordinates
  const steps = trip.itinerary
    .map((block, index) => ({ block, index, day: block.blockType === 'fullDay' ? ++dayNo : 0 }))
    .filter(({ block }) => Array.isArray(block.location) && block.location.length >= 2);
  if (tripCountries.length === 0 && steps.length === 0) return null;

  const coords = steps.map(({ block }) => block.location as [number, number]);
  const points = (c: [number, number][]): Feature[] =>
    c.length ? [{ type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: c } }] : [];
  // Only countries holding a real share of the steps drive the fit; a day trip (Trieste on the Slovenia trip) is just drawn.
  const visited = tripCountries.filter((f) => coords.filter((c) => geoContains(f, c)).length >= coords.length / 4);
  const countryCore: FeatureCollection = {
    type: 'FeatureCollection',
    features: (visited.length ? visited : tripCountries).flatMap((f) => corePolygons(f, coords)),
  };
  let fitTarget: FeatureCollection = { type: 'FeatureCollection', features: [...countryCore.features, ...points(coords)] };

  // Big country (>15° across, so not Bolivia), small route (Carretera Austral in Chile): zoom to the route, min ~5° across, and show a locator inset.
  let zoomed = false;
  if (countryCore.features.length && coords.length) {
    const [[lo0, la0], [lo1, la1]] = geoBounds(countryCore);
    const countryDeg = Math.max((lo1 - lo0) * Math.cos(((la0 + la1) / 2) * (Math.PI / 180)), la1 - la0);
    const base = geoMercator().fitWidth(W, fitTarget);
    const [[a, b], [c, d]] = geoPath(base).bounds(countryCore);
    const countryLong = Math.max(c - a, d - b);
    const xs = coords.map((p) => base(p)![0]);
    const ys = coords.map((p) => base(p)![1]);
    const sx = Math.max(...xs) - Math.min(...xs);
    const sy = Math.max(...ys) - Math.min(...ys);
    const min = countryLong * (5 / countryDeg);
    const [w, h] = [Math.max(sx, min), Math.max(sy, min)];
    if (countryDeg > 15 && w * h < (c - a) * (d - b) * 0.4) {
      zoomed = true;
      const [mx, my] = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
      fitTarget = { type: 'FeatureCollection', features: points([base.invert!([mx - w / 2, my - h / 2])!, base.invert!([mx + w / 2, my + h / 2])!]) };
    }
  }

  const projection = geoMercator().fitWidth(W - PAD * 2, fitTarget);
  const path = geoPath(projection).digits(1);
  const [[x0, y0], [x1, y1]] = path.bounds(fitTarget);
  const viewBox = [x0 - PAD, y0 - PAD, x1 - x0 + PAD * 2, y1 - y0 + PAD * 2];
  // Keep the frame between 5:3 landscape and 4:5 portrait by adding context instead of letterboxing.
  if (viewBox[3] > viewBox[2] * 1.25) {
    const nw = viewBox[3] / 1.25;
    viewBox[0] -= (nw - viewBox[2]) / 2;
    viewBox[2] = nw;
  } else if (viewBox[3] < viewBox[2] * 0.6) {
    const nh = viewBox[2] * 0.6;
    viewBox[1] -= (nh - viewBox[3]) / 2;
    viewBox[3] = nh;
  }
  const k = viewBox[2] / W; // keeps markers the same on-screen size however wide the frame got
  const inFrame = ({ x, y }: Pt) => x > viewBox[0] && x < viewBox[0] + viewBox[2] && y > viewBox[1] && y < viewBox[1] + viewBox[3];
  // Cut shapes to the frame (plus a margin so the cut edge isn't visible): pages only carry what's on screen.
  projection.clipExtent([[viewBox[0] - 10 * k, viewBox[1] - 10 * k], [viewBox[0] + viewBox[2] + 10 * k, viewBox[1] + viewBox[3] + 10 * k]]);
  // Small frames (Jordan, Belize) get the detailed 10m coastlines; big ones stay on 50m to keep the HTML light.
  // Not when zoomed into a big country: 10m Patagonia is a wall of fjords.
  const frameDeg = projection.invert!([viewBox[0] + viewBox[2], viewBox[1]])![0] - projection.invert!([viewBox[0], viewBox[1]])![0];
  const shapes = (frameDeg < 12 && !zoomed ? worldFeatures10 : worldFeatures)
    .map((f, i) => ({ key: `${f.id ?? 'x'}-${i}`, trip: ids.includes(String(f.id)), d: path(f) }))
    .filter((s) => s.d);

  // Water on top of the land, and each big lake labelled once (the Dead Sea comes in two basins).
  const lakeShapes = lakes
    .map((f) => ({ name: f.properties.name, d: path(f), area: path.area(f), c: path.centroid(f) }))
    .filter((l) => l.d);
  // Labels that would sit under a marker are dropped; a second basin of the same lake may still get one.
  const clearOf = (pts: Pt[], x: number, y: number, halfWidth: number) =>
    !pts.some((p) => Math.abs(p.x - x) < halfWidth + R * k && Math.abs(p.y - y) < (R + 6) * k);

  const projected = coords.map((c) => {
    const [x, y] = projection(c) ?? [0, 0];
    return { x, y };
  });
  const placed = spread(projected, R * 2.2 * k);
  // A leg takes the arrival method of the step it leads to, else the departure method of the step it leaves.
  const legs = steps.slice(1).map(({ block }, i) => {
    const method = block.transportation?.arrivalMethod ?? steps[i].block.transportation?.departureMethod ?? 'other';
    return { mode: MODES[method] ?? 'drive', a: projected[i], b: projected[i + 1] };
  });
  const usedModes = (Object.keys(MODE_LABELS) as Mode[]).filter((m) => legs.some((l) => l.mode === m));
  const lakeLabels = [...lakeShapes]
    .sort((a, b) => b.area - a.area)
    .filter((l) => {
      const half = (l.name?.length ?? 0) * 3 * k;
      const fits = inFrame({ x: l.c[0] - half, y: l.c[1] }) && inFrame({ x: l.c[0] + half, y: l.c[1] });
      return l.name && l.area > 500 * k * k && fits && clearOf(placed, l.c[0], l.c[1], half);
    })
    .filter((l, i, all) => all.findIndex((m) => m.name === l.name) === i);
  // The three highest named peaks inside the trip's countries, kept clear of the markers. Only real mountains:
  // nothing under half the height of the top one (so no 830 m hills next to Sajama).
  const inCountry = peaks
    .filter(([lng, lat]) => tripCountries.some((f) => geoContains(f, [lng, lat])))
    .map(([lng, lat, name, elevation]) => {
      const [x, y] = projection([lng, lat]) ?? [NaN, NaN];
      return { name, elevation, x, y };
    })
    .filter(inFrame)
    .sort((a, b) => b.elevation - a.elevation);
  const peakMarks = inCountry
    .filter((p) => p.elevation >= (inCountry[0]?.elevation ?? 0) / 2)
    .map((p) => {
      const left = p.x > viewBox[0] + viewBox[2] * 0.7; // label on the left near the right edge
      const half = (p.name.length + 10) * 2.8 * k; // rough label half-width, "Name · 1,234 m"
      return { ...p, left, labelX: p.x + (left ? -1 : 1) * (9 * k + half), half };
    })
    .filter((p) => clearOf(placed, p.x, p.y, 6 * k) && clearOf(placed, p.labelX, p.y, p.half))
    // Natural Earth lists some summits twice ("Volcán Tacaná" and "Volcán Tajumulco y Tacana"): keep the higher one.
    .filter((p, i, all) => !all.slice(0, i).some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 60 * k))
    .slice(0, 3);
  const tripSlug = trip.slug || trip.id;
  const capitals = (trip.countries ?? [])
    .filter((c): c is Country => typeof c === 'object' && Boolean(c.capitalLocation && c.capital))
    .map((c) => {
      const [x, y] = projection(c.capitalLocation!) ?? [NaN, NaN];
      return { name: c.capital!.split(' (')[0], x, y }; // "Sucre (constitutional) & ..." -> "Sucre"
    })
    .filter(inFrame);

  return (
    <svg viewBox={viewBox.join(' ')} className="block w-full h-auto" role="img" aria-label={`Route map of ${trip.title}`}>
      <rect x={viewBox[0]} y={viewBox[1]} width={viewBox[2]} height={viewBox[3]} fill="#EAF4F3" />
      {shapes.filter((s) => !s.trip).map((s) => (
        <path key={s.key} d={s.d!} fill="#F7F5F0" stroke="#D6D1C4" strokeWidth={k} />
      ))}
      {shapes.filter((s) => s.trip).map((s) => (
        <path key={s.key} d={s.d!} fill="#FFFFFF" stroke="#4C3A7A" strokeWidth={2 * k} strokeLinejoin="round" />
      ))}
      {lakeShapes.map((l, i) => (
        <path key={i} d={l.d!} fill="#CFE6E6" stroke="#9CCBCB" strokeWidth={k} />
      ))}
      {lakeLabels.map((l) => (
        <text key={l.name} x={l.c[0]} y={l.c[1]} dy="0.35em" textAnchor="middle" fontSize={11 * k} fontStyle="italic" fill="#3A7F86" pointerEvents="none">
          {l.name}
        </text>
      ))}
      {peakMarks.map((p) => (
        <g key={p.name} aria-label={`Peak: ${p.name}`} pointerEvents="none">
          <path d={`M${p.x},${p.y - 6 * k}L${p.x + 6 * k},${p.y + 4 * k}L${p.x - 6 * k},${p.y + 4 * k}Z`} fill="#8B7E74" />
          <text x={p.x + (p.left ? -9 : 9) * k} y={p.y} dy="0.2em" textAnchor={p.left ? 'end' : 'start'} fontSize={10.5 * k} fill="#6B6058" stroke="#FFFFFF" strokeWidth={3 * k} paintOrder="stroke" strokeLinejoin="round">
            {p.name} · {p.elevation.toLocaleString('en')} m
          </text>
        </g>
      ))}
      <g fill="none">
        {legs.map((l, i) => (
          <Leg key={i} {...l} k={k} />
        ))}
      </g>
      {steps.map(({ block, index, day }, i) => {
        const p = placed[i];
        const o = projected[i];
        const isDay = day > 0;
        return (
          <a key={index} href={`/trips/${tripSlug}/steps#day-${index + 1}`} className="group">
            <title>{block.locationName}</title>
            {(p.x !== o.x || p.y !== o.y) && <line x1={o.x} y1={o.y} x2={p.x} y2={p.y} stroke="#4C3A7A" strokeWidth={k} />}
            {isDay ? (
              <>
                <circle cx={p.x} cy={p.y} r={R * k} fill="#F57D50" stroke="#fff" strokeWidth={3 * k} className="transition-colors group-hover:fill-[#4C3A7A]" />
                <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize={13 * k} fontWeight={700} fill="#fff" pointerEvents="none">
                  {day}
                </text>
              </>
            ) : (
              <circle cx={p.x} cy={p.y} r={5 * k} fill="#2A9D8F" stroke="#fff" strokeWidth={2 * k} className="transition-colors group-hover:fill-[#4C3A7A]" />
            )}
          </a>
        );
      })}
      {capitals.map(({ name, x, y }) => {
        const left = x > viewBox[0] + viewBox[2] * 0.8; // label on the left near the right edge
        // A step on the capital (Amman, Sucre) hides the symbol; the label then clears the marker instead.
        const covered = placed.some((p) => Math.hypot(p.x - x, p.y - y) < R * 1.5 * k);
        const offset = (covered ? R + 5 : 9) * k;
        return (
          <g key={name} aria-label={`Capital: ${name}`} pointerEvents="none">
            {!covered && <circle cx={x} cy={y} r={5 * k} fill="#FFFFFF" stroke="#4C3A7A" strokeWidth={1.5 * k} />}
            {!covered && <circle cx={x} cy={y} r={2 * k} fill="#4C3A7A" />}
            <text x={x + (left ? -offset : offset)} y={y} dy="0.35em" textAnchor={left ? 'end' : 'start'} fontSize={12 * k} fontWeight={600} fill="#4C3A7A" stroke="#FFFFFF" strokeWidth={3 * k} paintOrder="stroke" strokeLinejoin="round">
              {name}
            </text>
          </g>
        );
      })}
      {usedModes.length > 1 && <Legend modes={usedModes} at={[viewBox[0], viewBox[1] + viewBox[3]]} k={k} />}
      {zoomed && <Inset countryCore={countryCore} frame={[projection.invert!([viewBox[0], viewBox[1]])!, projection.invert!([viewBox[0] + viewBox[2], viewBox[1] + viewBox[3]])!]} at={[viewBox[0] + viewBox[2], viewBox[1]]} k={k} />}
    </svg>
  );
}

// Small whole-country silhouette in the top-right corner, with the zoomed frame outlined.
function Inset({ countryCore, frame, at, k }: { countryCore: FeatureCollection; frame: [number, number][]; at: [number, number]; k: number }) {
  const size = 140 * k;
  const projection = geoMercator().fitExtent([[8 * k, 8 * k], [size - 8 * k, size - 8 * k]], countryCore);
  const [[a, b], [c, d]] = frame.map((p) => projection(p)!);
  return (
    <g transform={`translate(${at[0] - size - 12 * k} ${at[1] + 12 * k})`} aria-hidden data-role="inset">
      <rect width={size} height={size} rx={8 * k} fill="#FFFFFF" fillOpacity={0.85} stroke="#D6D1C4" strokeWidth={k} />
      <path d={geoPath(projection).digits(1)(countryCore) ?? ''} fill="#4C3A7A" fillOpacity={0.25} stroke="#4C3A7A" strokeWidth={k} />
      <rect x={a} y={b} width={Math.max(c - a, 3 * k)} height={Math.max(d - b, 3 * k)} fill="none" stroke="#F57D50" strokeWidth={2 * k} />
    </g>
  );
}

// How-we-travelled key in the bottom-left corner, only for the modes this trip used.
function Legend({ modes, at, k }: { modes: Mode[]; at: [number, number]; k: number }) {
  const row = 20 * k;
  const h = modes.length * row + 12 * k;
  return (
    <g transform={`translate(${at[0] + 12 * k} ${at[1] - h - 12 * k})`} aria-hidden data-role="legend">
      <rect width={140 * k} height={h} rx={8 * k} fill="#FFFFFF" fillOpacity={0.9} stroke="#D6D1C4" strokeWidth={k} />
      {modes.map((m, i) => {
        const y = 6 * k + row * i + row / 2;
        return (
          <g key={m}>
            <g fill="none">
              <Leg mode={m} a={{ x: 10 * k, y }} b={{ x: 46 * k, y }} k={k} />
            </g>
            <text x={56 * k} y={y} dy="0.35em" fontSize={11 * k} fill="#4C3A7A">
              {MODE_LABELS[m]}
            </text>
          </g>
        );
      })}
    </g>
  );
}
