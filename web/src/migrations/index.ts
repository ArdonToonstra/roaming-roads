import * as migration_20251008_202908 from './20251008_202908';
import * as migration_20251014_193745 from './20251014_193745';
import * as migration_20251014_210919 from './20251014_210919';
import * as migration_20251026_171325_itinerary_and_countries_improvements from './20251026_171325_itinerary_and_countries_improvements';
import * as migration_20251026_181852 from './20251026_181852';
import * as migration_20251123_214524 from './20251123_214524';
import * as migration_20251207_170607_update_trips_category from './20251207_170607_update_trips_category';
import * as migration_20251221_180041_accommodations_and_itinerary_update from './20251221_180041_accommodations_and_itinerary_update';
import * as migration_20251221_181918_fix_lexical_activities_data from './20251221_181918_fix_lexical_activities_data';
import * as migration_20251229_162512 from './20251229_162512';
import * as migration_20251230_094713 from './20251230_094713';
import * as migration_20251230_134941_add_point_block from './20251230_134941_add_point_block';

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
    name: '20251026_171325_itinerary_and_countries_improvements',
  },
  {
    up: migration_20251026_181852.up,
    down: migration_20251026_181852.down,
    name: '20251026_181852',
  },
  {
    up: migration_20251123_214524.up,
    down: migration_20251123_214524.down,
    name: '20251123_214524',
  },
  {
    up: migration_20251207_170607_update_trips_category.up,
    down: migration_20251207_170607_update_trips_category.down,
    name: '20251207_170607_update_trips_category',
  },
  {
    up: migration_20251221_180041_accommodations_and_itinerary_update.up,
    down: migration_20251221_180041_accommodations_and_itinerary_update.down,
    name: '20251221_180041_accommodations_and_itinerary_update',
  },
  {
    up: migration_20251221_181918_fix_lexical_activities_data.up,
    down: migration_20251221_181918_fix_lexical_activities_data.down,
    name: '20251221_181918_fix_lexical_activities_data',
  },
  {
    up: migration_20251229_162512.up,
    down: migration_20251229_162512.down,
    name: '20251229_162512',
  },
  {
    up: migration_20251230_094713.up,
    down: migration_20251230_094713.down,
    name: '20251230_094713',
  },
  {
    up: migration_20251230_134941_add_point_block.up,
    down: migration_20251230_134941_add_point_block.down,
    name: '20251230_134941_add_point_block'
  },
];
