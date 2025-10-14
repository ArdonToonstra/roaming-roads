import * as migration_20251008_202908 from './20251008_202908';
import * as migration_20251014_193745 from './20251014_193745';

export const migrations = [
  {
    up: migration_20251008_202908.up,
    down: migration_20251008_202908.down,
    name: '20251008_202908',
  },
  {
    up: migration_20251014_193745.up,
    down: migration_20251014_193745.down,
    name: '20251014_193745'
  },
];
