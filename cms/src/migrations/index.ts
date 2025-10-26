import * as migration_20251008_202908 from './20251008_202908';
import * as migration_20251014_193745 from './20251014_193745';
import * as migration_20251014_210919 from './20251014_210919';
import * as migration_20251026_171325_itinerary_and_countries_improvements from './20251026_171325_itinerary_and_countries_improvements';

export const migrations = [
  {
    up: migration_20251008_202908.up,
    down: migration_20251008_202908.down,
    name: '20251008_202908',
  },
  {
    up: migration_20251014_193745.up,
    down: migration_20251014_193745.down,
    name: '20251014_193745',
  },
  {
    up: migration_20251014_210919.up,
    down: migration_20251014_210919.down,
    name: '20251014_210919',
  },
  {
    up: migration_20251026_171325_itinerary_and_countries_improvements.up,
    down: migration_20251026_171325_itinerary_and_countries_improvements.down,
    name: '20251026_171325_itinerary_and_countries_improvements'
  },
];
