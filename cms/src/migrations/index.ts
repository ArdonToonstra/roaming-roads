import * as migration_20251008_202908 from './20251008_202908';

export const migrations = [
  {
    up: migration_20251008_202908.up,
    down: migration_20251008_202908.down,
    name: '20251008_202908'
  },
];
