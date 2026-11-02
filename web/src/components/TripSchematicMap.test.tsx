import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import TripSchematicMap from './TripSchematicMap';
import type { Trip } from '@/types/content';

const trip = (countryCode: string, itinerary: [string, number, number, string, string?][]) =>
  ({
    title: 't',
    slug: 't',
    countries: [{ id: countryCode, name: countryCode, countryCode, capital: 'Amman (test)', capitalLocation: [35.93, 31.95] }],
    itinerary: itinerary.map(([blockType, lng, lat, locationName, arrivalMethod]) => ({ blockType, location: [lng, lat], locationName, transportation: { arrivalMethod } })),
  }) as unknown as Trip;

test('small country: whole country, one link per step, numbered by full day', () => {
  const html = renderToStaticMarkup(
    <TripSchematicMap trip={trip('JOR', [['fullDay', 35.79, 31.71, 'Madaba'], ['waypoint', 35.5, 31.5, 'Stop', 'boat'], ['fullDay', 35.44, 30.32, 'Petra', 'flight']])} />
  );
  expect(html.match(/steps#day-\d/g)).toEqual(['steps#day-1', 'steps#day-2', 'steps#day-3']);
  expect(html).toContain('>2</text>'); // Petra is day 2, the waypoint doesn't count
  expect(html).not.toContain('data-role="inset"');
  expect(html).toContain('data-role="legend"');
  expect(html).toMatch(/Boat<\/text>.*Flight<\/text>|Flight<\/text>.*Boat<\/text>/);
  expect(html).toContain('Capital: Amman"'); // "(test)" suffix stripped
});

test('long country, local route: zooms in and shows the locator inset', () => {
  const html = renderToStaticMarkup(
    <TripSchematicMap trip={trip('CHL', [['fullDay', -72.99, -50.94, 'Torres'], ['fullDay', -72.5, -51.7, 'Natales']])} />
  );
  expect(html).toContain('data-role="inset"');
  expect(html).not.toContain('data-role="legend"'); // one mode only
});
